import { MEMORY_CATEGORIES, estimateTokens, fingerprint, newId, normalizeMemory, normalizeMemoryLinks, normalizeRecallScoreThreshold, tokenize, recallGroupText } from './core.js';
const arr = value => Array.isArray(value) ? value : [];
const clean = value => String(value ?? '').trim();
export const memoryEligible = memory => memory && !memory.deletedAt;
export const memoryText = memory => clean(memory.content);
export const maintenanceMaterial = memory => Object.fromEntries(['id', 'category', 'title', 'content', 'people', 'aliases', 'importance', 'storyTime', 'locked', 'permanent'].map(field => [field, memory[field]]));
export const organizationFingerprint = memory => fingerprint(JSON.stringify(maintenanceMaterial(memory)));
export function pendingOrganizationIds(state) {
    const reviewed = state.memoryOrganization?.reviewed;
    return state.memories.filter(memory => !reviewed || !Object.hasOwn(reviewed, memory.id) || reviewed[memory.id] !== organizationFingerprint(memory)).map(memory => memory.id);
}
export function validateMaintenanceScope(operations, pendingIds = null, task = null) {
    const pending = pendingIds === null ? null : new Set(pendingIds);
    for (const op of operations) {
        const ids = op.action === 'merge' ? arr(op.memberIds) : [op.a, op.b];
        if (pending && !ids.some(id => pending.has(id))) throw new Error('增量整理不能合并或关联未变更的旧条目组合');
        if (task?.allowedPairs) validateMaintenanceCandidateScope(op, task);
        else if (task?.right.length && (!ids.some(id => task.left.includes(id)) || !ids.some(id => task.right.includes(id)))) throw new Error('跨块建议必须涉及本批左右两块');
    }
}
export const maintenancePairKey = (a, b) => JSON.stringify([a, b].sort());
export function validateMaintenanceCandidateScope(op, task) {
    const pairs = new Set(task.allowedPairs.map(([a, b]) => maintenancePairKey(a, b)));
    if (op.action === 'link') {
        if (!pairs.has(maintenancePairKey(op.a, op.b))) throw new Error('建议超出本批候选配对范围');
    } else if (!task.anchors.some(anchor => op.memberIds.includes(anchor) && op.memberIds.every(id => id === anchor || pairs.has(maintenancePairKey(anchor, id))))) {
        throw new Error('合并成员必须属于同一整理锚点的本批候选范围');
    }
}
export function validateMaintenanceTaskScopes(operations, tasks) {
    for (const op of operations) {
        const task = tasks.find(item => item.id === op.taskId);
        if (!task) throw new Error('整理建议的来源批次无效');
        validateMaintenanceCandidateScope(op, task);
    }
}
export function validateMemoryFormat(item, { extendedArrays = false, extendedContent = false } = {}) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || !MEMORY_CATEGORIES.includes(item.category)) throw new Error('记忆类别无效');
    if (typeof item.title !== 'string' || typeof item.content !== 'string' || !item.title.trim() || !item.content.trim() || item.title.length > 120 || (!extendedContent && item.content.length > 500)) throw new Error('记忆标题或内容为空、超长或类型错误');
    for (const [field, cap] of [['people', 12], ['aliases', 24]]) if (!Array.isArray(item[field]) || (!extendedArrays && item[field].length > cap) || item[field].some(value => typeof value !== 'string')) throw new Error(`${field} 必须为字符串数组，最多 ${cap} 项`);
    if (!Number.isInteger(item.importance) || item.importance < 1 || item.importance > 5) throw new Error('重要度必须为 1–5 整数');
    if (item.storyTime !== null && typeof item.storyTime !== 'string') throw new Error('storyTime 必须为字符串或 null');
    return normalizeMemory(item);
}
export function validateCandidateBatch(raw) {
    if (!Array.isArray(raw)) throw new Error('记忆结果必须是数组');
    if (raw.length > 30) throw new Error('单幕记忆候选超过 30 条');
    const candidates = [], rejected = [];
    raw.forEach((item, index) => { try { validateMemoryFormat(item); candidates.push(normalizeMemory(Object.fromEntries(['category', 'title', 'content', 'people', 'aliases', 'importance', 'storyTime'].map(field => [field, item[field]])))); } catch (error) { rejected.push({ index: index + 1, title: clean(item?.title).slice(0, 120), reason: error.message }); } });
    return { candidates, rejected };
}
export function validateCandidates(raw) { const batch = validateCandidateBatch(raw); if (batch.rejected.length) throw new Error(batch.rejected[0].reason); return batch.candidates; }
export function appendExtractedMemories(state, candidates) {
    const next = structuredClone(state), ids = new Set(next.memories.map(memory => memory.id));
    for (const candidate of candidates.filter(item => item.accepted !== false)) {
        const memory = validateMemoryFormat(candidate);
        if (ids.has(memory.id)) throw new Error('候选记忆已保存或 ID 重复');
        next.memories.push(memory); ids.add(memory.id);
    }
    if (next.memories.length !== state.memories.length) next.memoryRevision++;
    return next;
}
export function latestStoryTime(memories) {
    const values = [...new Set(memories.map(memory => memory.storyTime).filter(Boolean))];
    if (values.length < 2) return { value: values[0] || null, choices: values, ambiguous: false };
    // Only absolute ISO/calendar dates are comparable; relative or fictional clocks require a choice.
    const parsed = values.map(value => /^\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:[ T].*)?$/.test(value) ? Date.parse(value.replaceAll('/', '-')) : NaN);
    if (parsed.some(value => !Number.isFinite(value))) return { value: null, choices: values, ambiguous: true };
    return { value: values[parsed.indexOf(Math.max(...parsed))], choices: values, ambiguous: false };
}
export function planMaintenance(memories, links, raw) {
    if (!Array.isArray(raw)) throw new Error('维护结果必须为 operations 数组');
    const byId = new Map(memories.map(memory => [memory.id, memory])), seen = new Set(), planned = [];
    for (const proposal of raw) {
        if (!['merge', 'link'].includes(proposal?.action)) throw new Error('维护操作只支持 merge/link');
        if (typeof proposal.reason !== 'string' || proposal.reason.length > 300) throw new Error('维护原因格式无效');
        if (proposal.action === 'link') {
            const [a, b] = [proposal.a, proposal.b].sort();
            if (!byId.has(a) || !byId.has(b) || a === b) throw new Error('关联目标无效');
            const key = JSON.stringify(['link', a, b]);
            if (seen.has(key) || links.some(link => [link.a, link.b].sort().join('\u0000') === [a, b].join('\u0000'))) continue;
            seen.add(key); planned.push({ id: newId('op'), ...(proposal.taskId ? { taskId: proposal.taskId } : {}), action: 'link', a, b, reason: proposal.reason, accepted: true });
        } else {
            if (!Array.isArray(proposal.memberIds) || new Set(proposal.memberIds).size !== proposal.memberIds.length || proposal.memberIds.length < 2 || !proposal.memberIds.includes(proposal.targetId)) throw new Error('合并成员或保留 ID 无效');
            const members = proposal.memberIds.map(id => byId.get(id));
            if (members.some(memory => !memory || memory.locked)) throw new Error('合并成员不存在或已锁定');
            const target = byId.get(proposal.targetId), time = latestStoryTime(members);
            const merged = validateMemoryFormat({ ...target, title: proposal.title, content: proposal.content, category: proposal.category, people: [...new Set(members.flatMap(memory => memory.people))], aliases: [...new Set(members.flatMap(memory => memory.aliases))], importance: Math.max(...members.map(memory => memory.importance)), storyTime: time.value }, { extendedArrays: true });
            merged.permanent = members.some(memory => memory.permanent);
            const key = JSON.stringify(['merge', [...proposal.memberIds].sort(), proposal.targetId, merged.title, merged.content, merged.category]);
            if (seen.has(key)) continue;
            seen.add(key); planned.push({ id: newId('op'), ...(proposal.taskId ? { taskId: proposal.taskId } : {}), action: 'merge', targetId: proposal.targetId, memberIds: proposal.memberIds, merged, reason: proposal.reason, timeChoices: time.choices, timeResolved: !time.ambiguous, accepted: true });
        }
    }
    for (const op of planned) if (op.action === 'merge') { op.conflicts = planned.filter(other => other !== op && other.action === 'merge' && other.memberIds.some(id => op.memberIds.includes(id))).map(other => other.id); if (op.conflicts.length) op.accepted = false; }
    return planned;
}
// Model proposals are independent suggestions, not an all-or-nothing write transaction.
export function validateMaintenanceBatch(memories, links, raw, pendingIds = null, task = null) {
    if (!Array.isArray(raw)) throw new Error('维护结果必须为 operations 数组');
    const operations = [], rejected = [], filtered = [], seen = new Set();
    const ids = new Set(memories.map(memory => memory.id));
    const resolve = id => typeof id === 'string' && !ids.has(id) && ids.has(id.trim()) ? id.trim() : id;
    raw.forEach((proposal, index) => {
        const op = proposal && typeof proposal === 'object' ? { ...proposal } : proposal;
        try {
            if (op?.action === 'link') { op.a = resolve(op.a); op.b = resolve(op.b); }
            if (op?.action === 'merge') { op.targetId = resolve(op.targetId); if (Array.isArray(op.memberIds)) op.memberIds = op.memberIds.map(resolve); }
            const planned = planMaintenance(memories, links, [op]);
            const detail = reason => ({ index: index + 1, action: clean(op.action), targets: op.action === 'merge' ? op.memberIds : [op.a, op.b], reason });
            try { validateMaintenanceScope([op], pendingIds, task); }
            catch (error) { if (!task) throw error; filtered.push(detail(error.message)); return; }
            const signature = op.action === 'link' ? maintenancePairKey(op.a, op.b) : JSON.stringify(['merge', [...op.memberIds].sort(), op.targetId, op.title, op.content, op.category]);
            if (!planned.length || seen.has(signature)) { filtered.push(detail('重复建议或已有关联')); return; }
            seen.add(signature); operations.push(task ? { ...op, taskId: task.id } : op);
        } catch (error) {
            rejected.push({ index: index + 1, action: clean(op?.action), targets: op?.action === 'merge' ? arr(op.memberIds).map(clean) : [clean(op?.a), clean(op?.b)], reason: error.message });
        }
    });
    return { operations, rejected, filtered };
}
export function applyMaintenance(state, operations, options = {}) {
    if (!Array.isArray(operations) || operations.some(op => !['merge', 'link'].includes(op?.action))) throw new Error('维护操作格式无效');
    if (options.mode && !['full', 'incremental'].includes(options.mode)) throw new Error('记忆整理模式无效');
    if (options.mode === 'incremental') {
        if (!state.memoryOrganization || !Array.isArray(options.pendingIds)) throw new Error('增量整理需要先完成全量初始化');
        validateMaintenanceScope(operations, options.pendingIds);
    }
    if (options.tasks) validateMaintenanceTaskScopes(operations, options.tasks);
    const next = structuredClone(state), accepted = operations.filter(op => op.accepted), map = new Map(next.memories.map(memory => [memory.id, memory])), remap = new Map();
    for (const op of accepted.filter(op => op.action === 'merge')) {
        if (!op.timeResolved) throw new Error('请先选择无法排序的故事时间');
        if (!Array.isArray(op.memberIds) || op.memberIds.length < 2 || new Set(op.memberIds).size !== op.memberIds.length) throw new Error('合并成员无效');
        if (op.memberIds.some(id => !map.has(id) || map.get(id).locked || remap.has(id))) throw new Error('合并存在冲突、失效成员或锁定条目');
        const checked = validateMemoryFormat(op.merged, { extendedArrays: true });
        if (checked.id !== op.targetId || !op.memberIds.includes(op.targetId)) throw new Error('合并目标 ID 无效');
        const members = op.memberIds.map(id => map.get(id));
        checked.importance = Math.max(...members.map(memory => memory.importance)); checked.permanent = members.some(memory => memory.permanent);
        checked.people = [...new Set(members.flatMap(memory => memory.people))]; checked.aliases = [...new Set(members.flatMap(memory => memory.aliases))];
        const time = latestStoryTime(members); if (checked.storyTime !== time.value && (!time.ambiguous || !time.choices.includes(checked.storyTime))) throw new Error('合并故事时间必须是成员最新时间或用户选择的原值');
        op.memberIds.forEach(id => remap.set(id, op.targetId)); map.set(op.targetId, { ...checked, edited: true, updatedAt: Date.now() });
    }
    next.memories = [...map.values()].filter(memory => !remap.has(memory.id) || remap.get(memory.id) === memory.id);
    const links = options.mode === 'full' ? [] : [...next.memoryLinks];
    for (const op of accepted.filter(op => op.action === 'link')) { if (!map.has(op.a) || !map.has(op.b) || op.a === op.b) throw new Error('关联目标失效'); links.push({ a: op.a, b: op.b, reason: clean(op.reason).slice(0, 300) }); }
    next.memoryLinks = normalizeMemoryLinks(links.map(link => ({ ...link, a: remap.get(link.a) || link.a, b: remap.get(link.b) || link.b })), next.memories);
    if (options.mode) {
        const time = Date.now();
        next.memoryOrganization = { version: 1, initializedAt: options.mode === 'full' ? time : state.memoryOrganization.initializedAt, lastOrganizedAt: time, reviewed: Object.fromEntries(next.memories.map(memory => [memory.id, organizationFingerprint(memory)])) };
    }
    if (accepted.length || options.mode) next.memoryRevision++;
    next.maintenanceTransaction = null; return next;
}
export function maintenanceTasks(memories, maxChars = 12000, pendingIds = null) {
    const partition = items => {
        const blocks = []; let block = [], size = 0;
        for (const memory of items) { const cost = JSON.stringify(maintenanceMaterial(memory)).length; if (block.length && size + cost > maxChars / 2) { blocks.push(block); block = []; size = 0; } block.push(memory); size += cost; }
        if (block.length) blocks.push(block); return blocks;
    };
    const pending = pendingIds === null ? null : new Set(pendingIds);
    const blocks = partition(pending ? memories.filter(memory => pending.has(memory.id)) : memories), existing = pending ? partition(memories.filter(memory => !pending.has(memory.id))) : [];
    const tasks = [], add = (left, right = []) => { if (left.length + right.length > 1) tasks.push({ id: newId('batch'), left: left.map(memory => memory.id), right: right.map(memory => memory.id), status: 'pending' }); };
    for (let i = 0; i < blocks.length; i++) for (let j = i; j < blocks.length; j++) add(blocks[i], i === j ? [] : blocks[j]);
    for (const fresh of blocks) for (const old of existing) add(fresh, old);
    return tasks;
}
export function splitMaintenanceTask(task) {
    if (task.right.length) {
        const field = task.left.length >= task.right.length ? 'left' : 'right', source = task[field];
        if (source.length < 2) return null;
        const middle = Math.ceil(source.length / 2);
        return [source.slice(0, middle), source.slice(middle)].map(part => ({ ...task, id: newId('batch'), [field]: part, status: 'pending', error: undefined, operations: undefined }));
    }
    if (task.left.length < 3) return null;
    const middle = Math.ceil(task.left.length / 2), left = task.left.slice(0, middle), right = task.left.slice(middle);
    return [{ left, right: [] }, { left: right, right: [] }, { left, right }].filter(part => part.left.length + part.right.length > 1).map(part => ({ ...part, id: newId('batch'), status: 'pending' }));
}
const indexCache = new Map();
function lexicalIndex(memories, revision) {
    const key = `${revision}:${fingerprint(memories.map(memory => `${memory.id}\u0000${memoryText(memory)}`).join('\u0001'))}`;
    if (indexCache.has(key)) return indexCache.get(key);
    const docs = memories.map(memory => { const terms = tokenize(memoryText(memory)), tf = new Map(); for (const term of terms) tf.set(term, (tf.get(term) || 0) + 1); return { memory, tf, length: terms.length }; });
    const df = new Map(); for (const doc of docs) for (const term of doc.tf.keys()) df.set(term, (df.get(term) || 0) + 1);
    const result = { docs, df, average: docs.reduce((sum, doc) => sum + doc.length, 0) / Math.max(1, docs.length) };
    indexCache.set(key, result); if (indexCache.size > 3) indexCache.delete(indexCache.keys().next().value); return result;
}
export function rankRecallCandidates(candidates, rawScores = candidates.map(item => item.relevanceScore ?? item.score), { absolute = false, useImportance = true } = {}) {
    const min = Math.min(...rawScores), max = Math.max(...rawScores);
    return candidates.map((item, i) => {
        const normalized = max === min ? (max > 0 ? 1 : 0) : min >= 0 ? rawScores[i] / Math.max(max, Number.EPSILON) : (rawScores[i] - min) / (max - min);
        // Ranking alone must not turn a weak top result into strong relevance.
        const relevance = absolute ? Math.max(0, Math.min(1, rawScores[i])) : Math.min(normalized, item.evidenceRelevance ?? 1), importance = ((item.memory.importance || 3) - 1) / 4;
        return { ...item, relevanceScore: rawScores[i], relevance, importanceWeight: useImportance ? importance : 0, score: useImportance ? .95 * relevance + .05 * importance : relevance };
    }).sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id));
}
export function finalizeRecallCandidates(memories, scoredCandidates, settings, links = []) {
    const scoreThreshold = normalizeRecallScoreThreshold(settings.recallScoreThreshold);
    const candidates = scoredCandidates.filter(item => item.permanent || item.score >= scoreThreshold);
    const rejectedCandidates = scoredCandidates.filter(item => !item.permanent && item.score < scoreThreshold);
    return { candidates, rejectedCandidates, scoreThreshold, ...selectRecallGroups(memories, candidates, settings, links) };
}
export function selectRecallGroups(memories, candidates, settings, links = []) {
    const eligible = new Map(memories.filter(memoryEligible).map(memory => [memory.id, memory])), adjacent = new Map(), validLinks = normalizeMemoryLinks(links, memories);
    for (const link of validLinks) { if (!eligible.has(link.a) || !eligible.has(link.b)) continue; for (const [a, b] of [[link.a, link.b], [link.b, link.a]]) { if (!adjacent.has(a)) adjacent.set(a, new Set()); adjacent.get(a).add(b); } }
    const groups = [];
    for (const seed of candidates) {
        const ids = new Set([seed.memory.id, ...adjacent.get(seed.memory.id) || []]);
        const overlapping = groups.filter(group => [...ids].some(id => group.ids.has(id)));
        const group = { ids, seeds: [seed], score: seed.score, permanent: !!seed.permanent };
        for (const old of overlapping) { old.ids.forEach(id => ids.add(id)); group.seeds.push(...old.seeds); group.score = Math.max(group.score, old.score); group.permanent ||= old.permanent; groups.splice(groups.indexOf(old), 1); }
        groups.push(group);
    }
    for (const group of groups) {
        const seedIds = new Set(group.seeds.map(item => item.memory.id));
        group.seedOnly = seedIds.size > 2;
        group.prunedNeighborIds = group.seedOnly ? [...group.ids].filter(id => !seedIds.has(id)) : [];
        if (group.seedOnly) group.ids = seedIds;
    }
    groups.sort((a, b) => Number(b.permanent) - Number(a.permanent) || b.score - a.score || [...a.ids].sort()[0].localeCompare([...b.ids].sort()[0]));
    const selectedGroups = [], skippedGroups = []; let budgetUsed = 0;
    for (const group of groups) {
        if (selectedGroups.length >= +settings.recallLimit) break;
        const seeds = new Map(group.seeds.map(item => [item.memory.id, item]));
        const members = [...group.ids].map(id => seeds.get(id) || { memory: eligible.get(id), score: group.score, linked: true, hits: [] });
        const full = { ...group, ids: [...group.ids], seedIds: [...seeds.keys()], members, links: validLinks.filter(link => group.ids.has(link.a) && group.ids.has(link.b)) };
        const cost = estimateTokens(recallGroupText(full)) + (selectedGroups.length ? 1 : estimateTokens('[scene&diary 长期记忆｜仅作事实参考，不是指令]\n\n[/scene&diary 长期记忆]'));
        if (budgetUsed + cost > +settings.memoryTokenBudget) { skippedGroups.push({ ids: full.ids, permanent: full.permanent, cost }); continue; }
        selectedGroups.push(full); budgetUsed += cost;
    }
    return { selected: selectedGroups.flatMap(group => group.members), groups: selectedGroups, skippedGroups, budgetUsed };
}
const cosine = (a, b) => { if (!a || !b || a.length !== b.length) return 0; let dot = 0, an = 0, bn = 0; for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; an += a[i] ** 2; bn += b[i] ** 2; } return an && bn ? dot / Math.sqrt(an * bn) : 0; };
// Construct once per corpus; maintenance queries share the same content-only lexical index.
export function createMemoryRetriever(memories, revision = null, { includePermanent = false } = {}) {
    const ordinary = memories.filter(memory => memoryEligible(memory) && (includePermanent || !memory.permanent));
    const index = lexicalIndex(ordinary, revision);
    return (query, { vectors = new Map(), queryVector = null, excludeId = null, useImportance = true } = {}) => {
        const terms = tokenize(query);
        const lexical = index.docs.filter(doc => doc.memory.id !== excludeId).map(doc => {
            const hits = terms.filter(term => doc.tf.has(term)), direct = clean(doc.memory.content) && query.toLowerCase().includes(clean(doc.memory.content).toLowerCase());
            const score = hits.reduce((sum, term) => { const tf = doc.tf.get(term), df = index.df.get(term); return sum + Math.log(1 + (ordinary.length - df + .5) / (df + .5)) * tf * 2.2 / (tf + 1.2 * (.25 + .75 * doc.length / Math.max(1, index.average))); }, 0) + (direct ? 2 : 0);
            return { memory: doc.memory, score, evidenceRelevance: score / (score + .5), hits, source: direct ? 'exact' : 'lexical' };
        }).sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id)).slice(0, 30);
        const semantic = queryVector ? ordinary.filter(memory => memory.id !== excludeId && vectors.has(memory.id)).map(memory => { const score = cosine(queryVector, vectors.get(memory.id)); return { memory, score, evidenceRelevance: Math.max(0, Math.min(1, score)), hits: [], source: 'vector' }; }).sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id)).slice(0, 30) : [];
        const scores = new Map();
        for (const [channel, items] of [['lexical', lexical], ['vector', semantic]]) items.forEach((item, rank) => { const previous = scores.get(item.memory.id) || { ...item, score: 0, evidenceRelevance: 0, channels: [] }; previous.score += 1 / (60 + rank + 1); previous.evidenceRelevance = Math.max(previous.evidenceRelevance, item.evidenceRelevance); previous.channels.push(channel); scores.set(item.memory.id, previous); });

        return rankRecallCandidates([...scores.values()], undefined, { useImportance });
    };
}
export function retrieveMemories(memories, query, settings, { vectors = new Map(), queryVector = null, revision = null, links = [] } = {}) {
    const permanent = memories.filter(memory => memoryEligible(memory) && memory.permanent).map(memory => ({ memory, score: .95 + .05 * ((memory.importance || 3) - 1) / 4, relevance: 1, importanceWeight: ((memory.importance || 3) - 1) / 4, hits: [], permanent: true, source: 'permanent' }));
    const ranked = createMemoryRetriever(memories, revision)(query, { vectors, queryVector }), retrievalCandidates = [...permanent, ...ranked];
    return { query, retrievalCandidates, ...finalizeRecallCandidates(memories, retrievalCandidates, settings, links) };
}
