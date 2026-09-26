import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Worker } from 'node:worker_threads';
import { SearchIndex } from './search.mjs';

const RELATIONS = new Set(['involves', 'at', 'gifted_to', 'supports', 'updates', 'fulfills', 'related_event']);
const OPERATIONS = new Set(['add_memory', 'update_memory', 'add_evidence', 'update_promise', 'add_entity', 'merge_entity', 'add_edge', 'review', 'restore_memory', 'delete_memory', 'restore_entity', 'delete_entity', 'restore_edge', 'delete_edge']);
const clone = value => structuredClone(value);
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const id = prefix => `${prefix}_${crypto.randomUUID()}`;
function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
function validId(value) { return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value); }
function empty(libraryId) { return { format: 1, libraryId, revision: 0, memories: {}, entities: { user: { id: 'user', type: 'person', name: '玩家', aliases: [] }, character: { id: 'character', type: 'person', name: '角色', aliases: [] } }, edges: {}, acts: {}, growth: null, committed: {}, history: {}, legacyBackup: null }; }
function memory(input, fallbackId = id('memory')) {
    const out = { ...input, id: input.id || fallbackId, kind: input.kind === 'fact' ? 'fact' : 'event', title: String(input.title || '').trim().slice(0, 120), content: String(input.content || '').trim().slice(0, 4000), category: String(input.category || 'event'), people: Array.isArray(input.people) ? input.people.slice(0, 12) : [], aliases: Array.isArray(input.aliases) ? input.aliases.slice(0, 24) : [], entityIds: Array.isArray(input.entityIds) ? input.entityIds.slice(0, 16) : [], sources: Array.isArray(input.sources) ? input.sources.slice(0, 64) : [], lifecycle: ['active', 'superseded', 'review'].includes(input.lifecycle) ? input.lifecycle : 'active', importance: Math.max(1, Math.min(5, +input.importance || 3)), revision: +input.revision || 0 };
    if (!validId(out.id) || !out.title || !out.content) fail(400, 'Invalid memory');
    if (out.kind === 'fact' && (!validId(out.subjectId) || !out.attribute)) fail(400, 'Fact needs subjectId and attribute');
    for (const source of out.sources) if (!validId(source.messageId) || !Number.isInteger(+source.actId) || !source.hash || !source.excerpt) fail(400, 'Invalid evidence');
    return out;
}
function validateEvidence(operations, snapshot) {
    const known = new Map((snapshot || []).map(item => [item.messageId, item]));
    for (const operation of operations) if (!operation.manual && operation.type === 'update_memory' && operation.value?.lifecycle === 'superseded' && !operations.some(item => item.type === 'add_memory' && item.value?.supersedes === operation.targetId)) fail(400, 'Fact replacement is incomplete');
    for (const operation of operations) {
        if (operation.manual || !['add_memory', 'add_evidence', 'update_promise', 'add_edge'].includes(operation.type)) continue;
        const sources = operation.type === 'add_evidence' ? operation.value?.sources : operation.value?.sources;
        if (!Array.isArray(sources) || !sources.length) fail(400, 'Generated change needs evidence');
        for (const source of sources) { const original = known.get(source.messageId); if (!original || original.hash !== source.hash || +original.actId !== +source.actId) fail(400, 'Evidence does not match source snapshot'); }
    }
}
function apply(state, operation) {
    if (!OPERATIONS.has(operation.type)) fail(400, 'Unknown operation');
    const value = operation.value || {};
    if (operation.type === 'add_memory') {
        const next = memory(value); if (state.memories[next.id]) fail(409, 'Memory already exists');
        if (!operation.manual && (next.locked || next.permanent || next.deletedAt || next.dirty || next.revision || next.lifecycle !== 'active')) fail(400, 'Generated memory has protected fields');
        if (next.entityIds.some(entityId => !state.entities[entityId])) fail(400, 'Memory entity missing');
        if (next.supersedes) {
            const old = state.memories[next.supersedes];
            if (!old || old.kind !== 'fact' || next.kind !== 'fact' || old.subjectId !== next.subjectId || old.attribute !== next.attribute || (old.locked && !operation.manual) || (!operation.manual && old.lifecycle !== 'superseded') || Object.values(state.memories).some(item => item.supersedes === old.id)) fail(400, 'Invalid fact replacement');
        }
        state.memories[next.id] = next;
    } else if (operation.type === 'update_memory' || operation.type === 'add_evidence' || operation.type === 'update_promise' || operation.type === 'review') {
        const old = state.memories[operation.targetId]; if (!old) fail(404, 'Memory missing'); if (old.locked && !operation.manual) fail(409, 'Memory is locked');
        if (operation.expectedMemoryRevision != null && old.revision !== operation.expectedMemoryRevision) fail(409, 'Memory changed');
        if (operation.type === 'add_evidence') state.memories[old.id] = memory({ ...old, sources: [...old.sources, ...value.sources], revision: old.revision + 1 });
        else if (operation.type === 'update_promise') {
            if (old.category !== 'promise' || !['in_progress', 'completed', 'cancelled'].includes(value.promiseStatus) || !Array.isArray(value.sources) || !value.sources.length) fail(400, 'Invalid promise progress');
            state.memories[old.id] = memory({ ...old, promiseStatus: value.promiseStatus, sources: [...old.sources, ...value.sources], revision: old.revision + 1 });
        }
        else if (operation.type === 'review') state.memories[old.id] = { ...old, dirty: false, lifecycle: old.reviewFromLifecycle || 'active', reviewFromLifecycle: null, revision: old.revision + 1 };
        else {
            const allowed = ['title', 'content', 'kind', 'category', 'people', 'aliases', 'entityIds', 'sources', 'importance', 'storyTime', 'subjectId', 'attribute', 'conditions', 'value', 'validFrom', 'validTo', 'lifecycle', 'reviewFromLifecycle', 'promiseStatus', 'locked', 'permanent', 'permanentOrder', 'deletedAt', 'dirty', 'supersedes', 'legacy'];
            const changed = Object.fromEntries(Object.entries(value).filter(([key]) => allowed.includes(key)));
            if (!operation.manual && (Object.keys(changed).length !== 1 || changed.lifecycle !== 'superseded')) fail(400, 'Generated update must supersede a fact');
            state.memories[old.id] = memory({ ...old, ...changed, revision: old.revision + 1 }, old.id);
        }
    } else if (operation.type === 'restore_memory') {
        if (!operation.manual || !state.memories[operation.targetId]) fail(400, 'Invalid memory restore'); state.memories[operation.targetId] = memory(value, operation.targetId);
    } else if (operation.type === 'delete_memory') {
        if (!operation.manual || !state.memories[operation.targetId]) fail(400, 'Invalid memory delete');
        if (Object.values(state.edges).some(edge => edge.fromId === operation.targetId || edge.toId === operation.targetId)) fail(409, 'Memory still referenced by a link');
        delete state.memories[operation.targetId];
    } else if (operation.type === 'add_entity') {
        const entity = { id: value.id || id('entity'), type: value.type, name: String(value.name || '').trim(), aliases: Array.isArray(value.aliases) ? value.aliases : [] };
        if (!validId(entity.id) || !['person', 'item', 'place'].includes(entity.type) || !entity.name || state.entities[entity.id]) fail(400, 'Invalid entity');
        state.entities[entity.id] = entity;
    } else if (operation.type === 'merge_entity') {
        if (!operation.manual) fail(400, 'Entity merge requires manual confirmation');
        const from = state.entities[operation.targetId], into = state.entities[value.intoId]; if (!from || !into || from.id === into.id || from.type !== into.type) fail(400, 'Invalid entity merge');
        into.aliases = [...new Set([...into.aliases, from.name, ...from.aliases])]; delete state.entities[from.id];
        for (const item of Object.values(state.memories)) { item.entityIds = item.entityIds.map(x => x === from.id ? into.id : x); if (item.subjectId === from.id) item.subjectId = into.id; }
        for (const edge of Object.values(state.edges)) { if (edge.fromId === from.id) edge.fromId = into.id; if (edge.toId === from.id) edge.toId = into.id; if (edge.fromId === edge.toId) delete state.edges[edge.id]; }
    } else if (operation.type === 'restore_entity') {
        if (!operation.manual || !state.entities[operation.targetId]) fail(400, 'Invalid entity restore'); state.entities[operation.targetId] = clone(value);
    } else if (operation.type === 'delete_entity') {
        if (!operation.manual || !state.entities[operation.targetId] || ['user', 'character'].includes(operation.targetId) || Object.values(state.memories).some(item => item.entityIds?.includes(operation.targetId) || item.subjectId === operation.targetId) || Object.values(state.edges).some(edge => edge.fromId === operation.targetId || edge.toId === operation.targetId)) fail(400, 'Entity still referenced'); delete state.entities[operation.targetId];
    } else if (operation.type === 'add_edge') {
        const edge = { id: value.id || id('edge'), type: value.type, fromId: value.fromId, toId: value.toId, sources: value.sources || [] };
        if (!validId(edge.id) || !RELATIONS.has(edge.type) || edge.fromId === edge.toId || state.edges[edge.id]) fail(400, 'Invalid edge');
        if (!(state.memories[edge.fromId] || state.entities[edge.fromId]) || !(state.memories[edge.toId] || state.entities[edge.toId])) fail(400, 'Edge endpoint missing');
        if (!edge.sources.length) fail(400, 'Edge needs evidence'); state.edges[edge.id] = edge;
    } else if (operation.type === 'restore_edge') {
        if (!operation.manual || !state.edges[operation.targetId]) fail(400, 'Invalid edge restore'); state.edges[operation.targetId] = clone(value);
    } else if (operation.type === 'delete_edge') {
        if (!operation.manual || !state.edges[operation.targetId]) fail(400, 'Invalid edge delete'); delete state.edges[operation.targetId];
    }
}
export class LibraryStore {
    constructor(root) { this.root = root; this.cache = new Map(); this.queues = new Map(); }
    dir(libraryId) { if (!validId(libraryId)) fail(400, 'Invalid library ID'); return path.join(this.root, libraryId); }
    async index(state) {
        if (Object.keys(state.memories || {}).length <= 1000) return new SearchIndex(state);
        const worker = new Worker(new URL('./index-worker.mjs', import.meta.url));
        try { return await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Index worker timeout')), 30000);
            worker.once('message', result => { clearTimeout(timer); result.error ? reject(new Error(result.error)) : resolve(SearchIndex.fromPacked(state, result)); });
            worker.once('error', error => { clearTimeout(timer); reject(error); });
            worker.postMessage(state);
        }); } finally { await worker.terminate(); }
    }
    async bindings() { try { return JSON.parse(await fs.readFile(path.join(this.root, 'bindings.json'), 'utf8')); } catch (error) { if (error.code === 'ENOENT') return {}; throw error; } }
    async saveBindings(bindings) { await fs.mkdir(this.root, { recursive: true }); const target = path.join(this.root, 'bindings.json'), temp = `${target}.tmp`; await fs.writeFile(temp, JSON.stringify(bindings)); await fs.rename(temp, target); }
    async resolve(chatKey, requestedId, parentChatKey, retained, legacy) {
        if (!chatKey) fail(400, 'Chat key required');
        const bindings = await this.bindings();
        if (bindings[chatKey]) { const entry = await this.open(bindings[chatKey]); return { libraryId: entry.state.libraryId, revision: entry.state.revision, imported: !!entry.state.legacyBackup }; }
        if (parentChatKey && !requestedId && !bindings[parentChatKey]) fail(404, '请先在原聊天完成记忆迁移，再打开历史分支');
        let libraryId = requestedId;
        const owner = requestedId && Object.entries(bindings).find(([key, value]) => key !== chatKey && value === requestedId);
        let forked = false;
        if (owner || (!requestedId && parentChatKey && bindings[parentChatKey])) {
            libraryId = await this.fork(owner?.[1] || bindings[parentChatKey], retained); forked = true;
        } else if (!libraryId) libraryId = id('library');
        const entry = await this.open(libraryId, legacy);
        bindings[chatKey] = libraryId; await this.saveBindings(bindings);
        return { libraryId, revision: entry.state.revision, imported: !!entry.state.legacyBackup, forkSnapshot: forked ? { acts: Object.values(entry.state.acts), growth: entry.state.growth } : null };
    }
    async rename(oldChatKey, newChatKey) { const bindings = await this.bindings(); if (!bindings[oldChatKey]) return { renamed: false }; bindings[newChatKey] = bindings[oldChatKey]; delete bindings[oldChatKey]; await this.saveBindings(bindings); return { renamed: true, libraryId: bindings[newChatKey] }; }
    async deleted(chatKey) { const bindings = await this.bindings(), libraryId = bindings[chatKey]; if (!libraryId) return { deleted: false }; delete bindings[chatKey]; await this.saveBindings(bindings); const trash = await this.trash(); trash[libraryId] = Date.now(); await fs.writeFile(path.join(this.root, 'trash.json'), JSON.stringify(trash)); return { deleted: true, libraryId, recoverUntil: trash[libraryId] + 30 * 86400000 }; }
    async trash() { try { return JSON.parse(await fs.readFile(path.join(this.root, 'trash.json'), 'utf8')); } catch (error) { if (error.code === 'ENOENT') return {}; throw error; } }
    async cleanup() { const trash = await this.trash(), bindings = await this.bindings(); let changed = false; for (const [libraryId, deletedAt] of Object.entries(trash)) if (Date.now() - deletedAt >= 30 * 86400000 && !Object.values(bindings).includes(libraryId)) { await fs.rm(this.dir(libraryId), { recursive: true, force: true }); this.cache.delete(libraryId); delete trash[libraryId]; changed = true; } if (changed) await fs.writeFile(path.join(this.root, 'trash.json'), JSON.stringify(trash)); }
    async fork(parentId, retained = []) {
        const source = (await this.open(parentId)).state, libraryId = id('library'), state = empty(libraryId);
        const allowed = new Map(retained.filter(item => validId(item.messageId)).map(item => [item.messageId, item]));
        state.entities = clone(source.entities);
        for (const old of Object.values(source.memories)) {
            const sources = (old.sources || []).filter(item => allowed.get(item.messageId)?.hash === item.hash);
            const act = source.acts[old.sourceActId], legacyVisible = !old.sources?.length && !!act?.sourceSnapshot?.length && act.sourceSnapshot.length === act.messageIds?.length && act.sourceSnapshot.every(item => allowed.get(item.messageId)?.hash === item.hash && (!item.contentHash || allowed.get(item.messageId)?.contentHash === item.contentHash));
            if (sources.length || legacyVisible) state.memories[old.id] = { ...clone(old), sources };
        }
        for (const item of Object.values(state.memories)) if (item.lifecycle === 'superseded' && !Object.values(state.memories).some(other => other.supersedes === item.id)) item.lifecycle = 'active';
        for (const edge of Object.values(source.edges)) if ((state.memories[edge.fromId] || state.entities[edge.fromId]) && (state.memories[edge.toId] || state.entities[edge.toId]) && (edge.sources || []).some(item => allowed.get(item.messageId)?.hash === item.hash)) state.edges[edge.id] = clone(edge);
        const acts = Object.values(source.acts).sort((a, b) => a.id - b.id);
        for (const act of acts) {
            const visible = (act.messageIds || []).filter(messageId => allowed.has(messageId)); if (!visible.length) continue;
            const complete = !!act.sourceSnapshot?.length && act.sourceSnapshot.length === act.messageIds.length && act.sourceSnapshot.every(item => allowed.get(item.messageId)?.hash === item.hash && (!item.contentHash || allowed.get(item.messageId)?.contentHash === item.contentHash));
            state.acts[act.id] = complete ? clone(act) : { ...clone(act), status: 'active', diary: '', title: '', dirty: true, messageIds: visible };
            if (complete && act.growthSnapshot) state.growth = clone(act.growthSnapshot);
        }
        const entry = await this.open(libraryId); entry.state = state; entry.index = await this.index(state); await this.snapshot(entry.dir, state); return libraryId;
    }
    async open(libraryId, initial = null) {
        if (this.cache.has(libraryId)) { const entry = this.cache.get(libraryId); this.cache.delete(libraryId); this.cache.set(libraryId, entry); return entry; }
        const dir = this.dir(libraryId); await fs.mkdir(dir, { recursive: true });
        let state, previousSnapshot = false; try { state = JSON.parse(await fs.readFile(path.join(dir, 'snapshot.json'), 'utf8')); } catch (error) { previousSnapshot = true; try { state = JSON.parse(await fs.readFile(path.join(dir, 'snapshot.previous.json'), 'utf8')); } catch (previous) { if (error.code !== 'ENOENT' && previous.code !== 'ENOENT') throw error; state = empty(libraryId); } }
        state.history ||= {};
        for (const journalName of previousSnapshot ? ['journal.previous.ndjson', 'journal.ndjson'] : ['journal.ndjson']) try {
            const journal = await fs.readFile(path.join(dir, journalName), 'utf8');
            let validBytes = 0;
            for (const line of journal.split('\n')) {
                if (!line) { if (validBytes < Buffer.byteLength(journal)) validBytes++; continue; }
                let record; try { record = JSON.parse(line); } catch { break; }
                if (record.checksum !== digest(record.payload)) break;
                const payload = record.payload;
                if (payload.nextRevision <= state.revision) { validBytes += Buffer.byteLength(line) + 1; continue; }
                if (payload.previousRevision !== state.revision) break;
                for (const operation of payload.operations) apply(state, operation);
                if (payload.actDeleteId) delete state.acts[payload.actDeleteId];
                if (payload.act) state.acts[payload.act.id] = payload.act;
                if ('growth' in payload) state.growth = payload.growth;
                state.revision = payload.nextRevision; state.committed[payload.requestId] = payload.result;
                if (payload.change) state.history[payload.requestId] = payload.change;
                if (payload.undoOf && state.history[payload.undoOf]) state.history[payload.undoOf].undone = true;
                validBytes += Buffer.byteLength(line) + 1;
            }
            if (validBytes < Buffer.byteLength(journal)) await fs.truncate(path.join(dir, journalName), validBytes);
            else if (validBytes > Buffer.byteLength(journal)) await fs.appendFile(path.join(dir, journalName), '\n');
        } catch (error) { if (error.code !== 'ENOENT') throw error; }
        state.history ||= {};
        if (initial && state.revision === 0 && Object.keys(state.memories).length === 0) {
            state.legacyBackup = clone(initial);
            for (const raw of initial.memories || []) { try { const item = memory({ ...raw, sources: raw.sources || [], lifecycle: raw.dirty ? 'review' : 'active', legacy: true }); state.memories[item.id] = item; } catch {} }
            for (const act of initial.acts || []) state.acts[act.id] = act;
            state.growth = initial.characterGrowth || null;
            await this.snapshot(dir, state);
        }
        const entry = { state, index: await this.index(state), dir }; this.cache.set(libraryId, entry); while (this.cache.size > 3) this.cache.delete(this.cache.keys().next().value); return entry;
    }
    async snapshot(dir, state) { const target = path.join(dir, 'snapshot.json'), temp = `${target}.${crypto.randomUUID()}.tmp`, handle = await fs.open(temp, 'w'); try { await handle.writeFile(JSON.stringify(state)); await handle.sync(); } finally { await handle.close(); } try { await fs.copyFile(target, path.join(dir, 'snapshot.previous.json')); } catch {} await fs.rename(temp, target); }
    async serialize(libraryId, action) { const previous = this.queues.get(libraryId) || Promise.resolve(); const task = previous.catch(() => {}).then(action); this.queues.set(libraryId, task); try { return await task; } finally { if (this.queues.get(libraryId) === task) this.queues.delete(libraryId); } }
    async prepare(libraryId, input) {
        const entry = await this.open(libraryId), state = entry.state;
        if (input.expectedRevision !== state.revision) fail(409, 'Library changed');
        if (!Array.isArray(input.operations) || input.operations.length > 100) fail(400, 'Invalid operations');
        validateEvidence(input.operations, input.sourceSnapshot);
        const draft = clone(state); for (const operation of input.operations) apply(draft, operation);
        return { valid: true, expectedRevision: state.revision, operations: input.operations, changes: input.operations.length };
    }
    async commit(libraryId, input) { return this.serialize(libraryId, async () => {
        const entry = await this.open(libraryId), before = entry.state;
        if (!validId(input.requestId)) fail(400, 'Invalid requestId');
        if (before.committed[input.requestId]) return before.committed[input.requestId];
        if (input.expectedRevision !== before.revision) fail(409, 'Library changed');
        validateEvidence(input.operations || [], input.sourceSnapshot);
        const operations = clone(input.operations || []); for (const operation of operations) if ((operation.type === 'add_entity' || operation.type === 'add_edge') && !operation.value?.id) operation.value = { ...operation.value, id: id(operation.type === 'add_entity' ? 'entity' : 'edge') };
        const next = clone(before); for (const operation of operations) apply(next, operation);
        const affectedMemoryIds = [...new Set(operations.filter(item => ['add_memory', 'update_memory', 'add_evidence', 'update_promise', 'review', 'restore_memory', 'delete_memory'].includes(item.type)).map(item => item.type === 'add_memory' ? item.value.id : item.targetId))];
        for (const operation of operations.filter(item => item.type === 'merge_entity')) for (const item of Object.values(before.memories)) if (item.entityIds?.includes(operation.targetId) || item.subjectId === operation.targetId) affectedMemoryIds.push(item.id);
        const affectedEntityIds = [...new Set(operations.filter(item => ['add_entity', 'merge_entity', 'restore_entity', 'delete_entity'].includes(item.type)).flatMap(item => item.type === 'add_entity' ? [item.value.id] : item.type === 'merge_entity' ? [item.targetId, item.value.intoId] : [item.targetId]))];
        const affectedEdgeIds = [...new Set(operations.filter(item => ['add_edge', 'restore_edge', 'delete_edge'].includes(item.type)).map(item => item.type === 'add_edge' ? item.value.id : item.targetId))];
        for (const operation of operations.filter(item => item.type === 'merge_entity')) for (const edge of Object.values(before.edges)) if (edge.fromId === operation.targetId || edge.toId === operation.targetId) affectedEdgeIds.push(edge.id);
        const beforeValues = { memories: Object.fromEntries(affectedMemoryIds.map(key => [key, before.memories[key] || null])), entities: Object.fromEntries(affectedEntityIds.map(key => [key, before.entities[key] || null])), edges: Object.fromEntries(affectedEdgeIds.map(key => [key, before.edges[key] || null])), act: input.act ? before.acts[input.act.id] || null : input.actDeleteId ? before.acts[input.actDeleteId] || null : undefined, growth: 'growth' in input ? before.growth : undefined };
        if (input.actDeleteId) delete next.acts[input.actDeleteId];
        if (input.act) next.acts[input.act.id] = { ...clone(input.act), growthSnapshot: input.growth ? clone(input.growth) : before.acts[input.act.id]?.growthSnapshot };
        if ('growth' in input) next.growth = clone(input.growth);
        next.revision++; const result = { libraryId, revision: next.revision, requestId: input.requestId };
        next.committed[input.requestId] = result;
        const change = { revision: next.revision, timestamp: Date.now(), before: beforeValues, after: { memories: Object.fromEntries(affectedMemoryIds.map(key => [key, next.memories[key] || null])), entities: Object.fromEntries(affectedEntityIds.map(key => [key, next.entities[key] || null])), edges: Object.fromEntries(affectedEdgeIds.map(key => [key, next.edges[key] || null])), act: input.act ? next.acts[input.act.id] : input.actDeleteId ? null : undefined, growth: 'growth' in input ? next.growth : undefined }, actId: input.act?.id || input.actDeleteId || null, undone: false };
        next.history[input.requestId] = change; if (input.undoOf && next.history[input.undoOf]) next.history[input.undoOf].undone = true;
        const payload = { previousRevision: before.revision, nextRevision: next.revision, requestId: input.requestId, operations, act: input.act ? next.acts[input.act.id] : null, actDeleteId: input.actDeleteId || null, growth: 'growth' in input ? input.growth : before.growth, result, change, undoOf: input.undoOf || null };
        const handle = await fs.open(path.join(entry.dir, 'journal.ndjson'), 'a');
        try { await handle.write(`${JSON.stringify({ payload, checksum: digest(payload) })}\n`); await handle.sync(); } finally { await handle.close(); }
        entry.index.library = next;
        for (const operation of operations) { if (operation.type === 'add_memory') entry.index.add(next.memories[operation.value.id]); else if (['update_memory', 'add_evidence', 'update_promise', 'review', 'restore_memory', 'delete_memory'].includes(operation.type)) entry.index.update(before.memories[operation.targetId], next.memories[operation.targetId]); else if (['merge_entity', 'restore_entity', 'delete_entity'].includes(operation.type)) entry.index = new SearchIndex(next); }
        entry.state = next; if (operations.some(operation => ['add_edge', 'restore_edge', 'delete_edge'].includes(operation.type))) entry.index.rebuildEdges();
        const journalPath = path.join(entry.dir, 'journal.ndjson');
        if (next.revision % 100 === 0 || (await fs.stat(journalPath)).size >= 5 * 1048576) { await this.snapshot(entry.dir, next); await fs.copyFile(journalPath, path.join(entry.dir, 'journal.previous.ndjson')); await fs.writeFile(journalPath, ''); }
        return result;
    }); }
    async query(libraryId, input) {
        const entry = await this.open(libraryId), { state } = entry, page = Math.max(0, +input.page || 0), size = Math.max(1, Math.min(30, +input.pageSize || 30));
        const query = String(input.query || '').toLocaleLowerCase();
        const entityQuery = String(input.entityQuery || '').trim().toLocaleLowerCase();
        const matchingEntities = entityQuery ? new Set(Object.values(state.entities).filter(item => [item.name, ...(item.aliases || [])].some(name => String(name).toLocaleLowerCase().includes(entityQuery))).map(item => item.id)) : null;
        const rows = Object.values(state.memories).filter(item => !item.deletedAt && (!input.legacyOnly || item.legacy) && (!input.category || item.category === input.category) && (!input.lifecycle || item.lifecycle === input.lifecycle) && (!input.entityId || item.entityIds?.includes(input.entityId)) && (!matchingEntities || item.entityIds?.some(id => matchingEntities.has(id))) && (!query || `${item.title} ${item.content} ${(item.people || []).join(' ')}`.toLocaleLowerCase().includes(query)));
        rows.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        const items = rows.slice(page * size, (page + 1) * size).map(memory => ({ ...memory, related: (entry.index.edges.get(memory.id) || []).map(edge => ({ type: edge.type, name: state.memories[edge.fromId === memory.id ? edge.toId : edge.fromId]?.title || state.entities[edge.fromId === memory.id ? edge.toId : edge.fromId]?.name || '' })), versionHistory: Object.values(state.memories).filter(item => item.id === memory.supersedes || item.supersedes === memory.id).map(item => ({ id: item.id, title: item.title, content: item.content, lifecycle: item.lifecycle })) }));
        return { revision: state.revision, total: rows.length, page, items };
    }
    async maintenance(libraryId, candidates) { const entry = await this.open(libraryId); return candidates.map(candidate => { const related = entry.index.maintenance(candidate); return { candidate, related: related.slice(0, 12), truncated: related.length > 12, knownEntities: Object.values(entry.state.entities).filter(entity => (candidate.entities || []).some(mention => entity.type === mention.type && [entity.name, ...entity.aliases].some(name => name === mention.name))).slice(0, 20) }; }); }
    async markSources(libraryId, changedIds) { const entry = await this.open(libraryId), operations = []; for (const messageId of changedIds) for (const id of entry.index.sources.get(messageId) || []) operations.push({ type: 'update_memory', targetId: id, manual: true, value: { dirty: true, lifecycle: 'review', reviewFromLifecycle: entry.state.memories[id]?.lifecycle || 'active' } }); if (!operations.length) return { revision: entry.state.revision }; return this.commit(libraryId, { requestId: id('source'), expectedRevision: entry.state.revision, operations }); }
    async history(libraryId) { const { state } = await this.open(libraryId); return Object.entries(state.history).sort((a, b) => b[1].revision - a[1].revision).slice(0, 20).map(([requestId, change]) => ({ requestId, revision: change.revision, timestamp: change.timestamp, actId: change.actId, undone: change.undone, count: Object.keys(change.after.memories).length })); }
    async undo(libraryId, requestId) {
        const { state } = await this.open(libraryId), change = state.history[requestId];
        if (!change || change.undone) fail(404, 'Transaction unavailable');
        for (const kind of ['memories', 'entities', 'edges']) for (const [key, after] of Object.entries(change.after[kind])) if (digest(state[kind][key] || null) !== digest(after)) fail(409, 'Later changes depend on this transaction');
        const removedEndpoints = new Set(['memories', 'entities'].flatMap(kind => Object.entries(change.before[kind]).filter(([, before]) => !before).map(([key]) => key)));
        for (const edge of Object.values(state.edges)) if (!Object.hasOwn(change.after.edges, edge.id) && (removedEndpoints.has(edge.fromId) || removedEndpoints.has(edge.toId))) fail(409, 'Later link depends on this transaction');
        if (change.actId && digest(state.acts[change.actId] || null) !== digest(change.after.act || null)) fail(409, 'Act changed since transaction');
        if (change.after.growth !== undefined && digest(state.growth) !== digest(change.after.growth)) fail(409, 'Growth changed since transaction');
        const operations = [];
        for (const [key, after] of Object.entries(change.after.edges)) if (after) operations.push({ type: 'delete_edge', targetId: key, manual: true });
        for (const [key, before] of Object.entries(change.before.memories)) operations.push(before ? { type: change.after.memories[key] ? 'restore_memory' : 'add_memory', targetId: key, value: before, manual: true } : { type: 'delete_memory', targetId: key, manual: true });
        for (const [key, before] of Object.entries(change.before.entities)) operations.push(before ? { type: change.after.entities[key] ? 'restore_entity' : 'add_entity', targetId: key, value: before, manual: true } : { type: 'delete_entity', targetId: key, manual: true });
        for (const [key, before] of Object.entries(change.before.edges)) if (before) operations.push({ type: 'add_edge', value: before, manual: true });
        const draft = { requestId: id('undo'), undoOf: requestId, expectedRevision: state.revision, operations, act: change.before.act || undefined, actDeleteId: change.actId && !change.before.act ? change.actId : undefined };
        if (change.before.growth !== undefined) draft.growth = change.before.growth;
        return draft;
    }
    async export(libraryId) { const { state } = await this.open(libraryId); return clone(state); }
    async import(input, chatKey) {
        if (!input || input.format !== 1 || !input.memories || !input.entities || !input.edges || !input.acts || !chatKey) fail(400, 'Invalid memory backup');
        if (Object.keys(input.memories).length > 100000) fail(400, 'Memory backup too large');
        const libraryId = id('library'), entry = await this.open(libraryId), state = empty(libraryId);
        state.entities = clone(input.entities); state.acts = clone(input.acts); state.growth = clone(input.growth);
        state.revision = Number.isInteger(input.revision) && input.revision >= 0 ? input.revision : 0;
        state.history = input.history && typeof input.history === 'object' ? clone(input.history) : {};
        state.legacyBackup = input.legacyBackup ? clone(input.legacyBackup) : null;
        for (const raw of Object.values(input.memories)) { const item = memory(raw); state.memories[item.id] = item; }
        for (const raw of Object.values(input.edges)) {
            if (!validId(raw.id) || !RELATIONS.has(raw.type) || !(state.memories[raw.fromId] || state.entities[raw.fromId]) || !(state.memories[raw.toId] || state.entities[raw.toId])) fail(400, 'Invalid backup link');
            state.edges[raw.id] = clone(raw);
        }
        entry.state = state; entry.index = await this.index(state); await this.snapshot(entry.dir, state);
        const bindings = await this.bindings(); bindings[chatKey] = libraryId; await this.saveBindings(bindings);
        return { libraryId, revision: state.revision };
    }
}
export { fail, id, digest };
