import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { LibraryStore } from '../server/engine.mjs';

async function fixture(run) { const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'scene-diary-')); try { await run(dir); } finally { await fs.rm(dir, { recursive: true, force: true }); } }
function proposal(id, content, extras = {}) { return { type: 'add_memory', manual: true, value: { id, title: id, content, kind: 'fact', category: 'habit', subjectId: 'user', attribute: 'breakfast', sources: [{ actId: 1, messageId: 'msg1', hash: 'abc', excerpt: content }], ...extras } }; }
test('journal recovers committed operations and retries are idempotent', async () => fixture(async dir => {
    const store = new LibraryStore(dir), libraryId = 'lib'; await store.open(libraryId);
    const input = { requestId: 'tx1', expectedRevision: 0, operations: [proposal('breakfast', '通常不吃早饭')] };
    const first = await store.commit(libraryId, input); assert.equal(first.revision, 1);
    assert.deepEqual(await store.commit(libraryId, input), first);
    const reopened = new LibraryStore(dir); assert.equal((await reopened.open(libraryId)).state.memories.breakfast.content, '通常不吃早饭');
    await assert.rejects(() => reopened.commit(libraryId, { ...input, requestId: 'tx2' }), error => error.status === 409);
}));
test('conditional preference can coexist and old state stays out of current recall', async () => fixture(async dir => {
    const store = new LibraryStore(dir), libraryId = 'lib'; await store.open(libraryId);
    await store.commit(libraryId, { requestId: 'tx1', expectedRevision: 0, operations: [proposal('general', '玩家通常不吃早餐')] });
    await store.commit(libraryId, { requestId: 'tx2', expectedRevision: 1, operations: [proposal('exception', '玩家愿意吃角色亲手做的早餐', { conditions: '角色亲手制作' })] });
    const entry = await store.open(libraryId); assert.equal(entry.index.recall('你做的早餐').selected.some(x => x.memory.id === 'exception'), true);
    await store.commit(libraryId, { requestId: 'tx3', expectedRevision: 2, operations: [{ type: 'update_memory', targetId: 'general', expectedMemoryRevision: 0, value: { lifecycle: 'superseded' } }, proposal('new', '玩家现在愿意每天吃早饭', { supersedes: 'general' })] });
    assert.equal(entry.index.recall('早餐').selected.some(x => x.memory.id === 'general'), false);
    assert.equal(entry.index.recall('以前不吃早餐').selected.some(x => x.memory.id === 'general'), true);
}));
test('repeated recall uses the versioned cache and a memory update invalidates it', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    await store.commit('lib', { requestId: 'first', expectedRevision: 0, operations: [proposal('breakfast', '玩家喜欢早餐')] });
    const entry = await store.open('lib');
    assert.equal(entry.index.recall('早餐').diagnostics.cacheHit, undefined);
    assert.equal(entry.index.recall('早餐').diagnostics.cacheHit, true);
    await store.commit('lib', { requestId: 'second', expectedRevision: 1, operations: [{ type: 'update_memory', targetId: 'breakfast', manual: true, value: { content: '玩家喜欢午餐' } }] });
    assert.equal(entry.index.recall('早餐').diagnostics.cacheHit, undefined);
}));
test('lock and provenance block automatic overwrites', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    await store.commit('lib', { requestId: 'tx1', expectedRevision: 0, operations: [proposal('locked', '旧记忆', { locked: true })] });
    await assert.rejects(() => store.commit('lib', { requestId: 'tx2', expectedRevision: 1, operations: [{ type: 'update_memory', targetId: 'locked', value: { content: '新记忆' } }] }), error => error.status === 409);
    await store.markSources('lib', ['msg1']);
    assert.equal((await store.open('lib')).index.recall('旧记忆').selected.length, 0);
}));
test('reviewing edited evidence keeps a superseded fact historical', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    await store.commit('lib', { requestId: 'setup', expectedRevision: 0, operations: [proposal('old', '玩家过去不吃早餐', { lifecycle: 'superseded' })] });
    await store.markSources('lib', ['msg1']);
    let entry = await store.open('lib'); assert.equal(entry.state.memories.old.lifecycle, 'review');
    assert.equal(entry.state.memories.old.reviewFromLifecycle, 'superseded');
    await store.commit('lib', { requestId: 'review', expectedRevision: 2, operations: [{ type: 'review', targetId: 'old', manual: true }] });
    entry = await store.open('lib'); assert.equal(entry.state.memories.old.lifecycle, 'superseded');
    assert.equal(entry.index.recall('早餐').selected.some(row => row.memory.id === 'old'), false);
}));
test('branch excludes future evidence and restores superseded fact', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.resolve('main', null, null, [], null);
    const libraryId = (await store.bindings()).main;
    const first = proposal('before', '玩家不吃早餐'); first.value.sources[0].hash = 'first';
    await store.commit(libraryId, { requestId: 'tx1', expectedRevision: 0, operations: [first], act: { id: 1, status: 'closed', messageIds: ['msg1'], sourceSnapshot: [{ messageId: 'msg1', hash: 'first', contentHash: 'full-first' }], diary: '以前不吃早餐' }, growth: { content: '旧状态' } });
    const second = proposal('after', '玩家现在吃早餐'); second.value.sources = [{ actId: 2, messageId: 'msg2', hash: 'second', excerpt: '开始吃早餐' }]; second.value.supersedes = 'before';
    await store.commit(libraryId, { requestId: 'tx2', expectedRevision: 1, operations: [{ type: 'update_memory', targetId: 'before', value: { lifecycle: 'superseded' } }, second], act: { id: 2, status: 'closed', messageIds: ['msg2'], sourceSnapshot: [{ messageId: 'msg2', hash: 'second', contentHash: 'full-second' }], diary: '开始吃早餐' }, growth: { content: '新状态' } });
    const branch = await store.resolve('branch', null, 'main', [{ messageId: 'msg1', hash: 'first', contentHash: 'full-first' }], null);
    const state = (await store.open(branch.libraryId)).state;
    assert.notEqual(branch.libraryId, libraryId); assert.ok(state.memories.before); assert.equal(state.memories.before.lifecycle, 'active'); assert.equal(state.memories.after, undefined); assert.equal(state.growth.content, '旧状态');
    const edited = await store.fork(libraryId, [{ messageId: 'msg1', hash: 'changed' }]);
    const editedState = (await store.open(edited)).state;
    assert.equal(editedState.memories.before, undefined);
    assert.equal(editedState.acts[1].status, 'active');
    assert.equal(editedState.acts[1].diary, '');
    assert.equal(editedState.growth, null);
    const retimed = await store.fork(libraryId, [{ messageId: 'msg1', hash: 'first', contentHash: 'edited-story-time' }]);
    const retimedState = (await store.open(retimed)).state;
    assert.ok(retimedState.memories.before);
    assert.equal(retimedState.acts[1].diary, '');
    assert.equal(retimedState.growth, null);
}));
test('entity and link recall connects the wheel, confession and ring', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    const evidence = [{ actId: 1, messageId: 'm1', hash: 'h1', excerpt: '在摩天轮上送了戒指并表白' }];
    await store.commit('lib', { requestId: 'tx1', expectedRevision: 0, operations: [
        { type: 'add_entity', value: { id: 'wheel', type: 'place', name: '摩天轮' } },
        { type: 'add_entity', value: { id: 'ring', type: 'item', name: '银戒指' } },
        { type: 'add_memory', manual: true, value: { id: 'confession', title: '第一次表白', content: '两人确认心意', entityIds: ['wheel'], sources: evidence } },
        { type: 'add_memory', manual: true, value: { id: 'gift', title: '戒指礼物', content: '角色送给玩家一枚戒指', entityIds: ['ring'], sources: evidence } },
        { type: 'add_edge', manual: true, value: { id: 'link1', type: 'related_event', fromId: 'confession', toId: 'gift', sources: evidence } },
    ] });
    const selected = (await store.open('lib')).index.recall('摩天轮').selected.map(x => x.memory.id);
    assert.ok(selected.includes('confession')); assert.ok(selected.includes('gift'));
}));
test('entity merge updates links and undo restores both endpoints and recall', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    const evidence = [{ actId: 1, messageId: 'm1', hash: 'h1', excerpt: '在旧称地点见面' }];
    await store.commit('lib', { requestId: 'setup', expectedRevision: 0, operations: [
        { type: 'add_entity', value: { id: 'oldPlace', type: 'place', name: '旧称地点' } },
        { type: 'add_entity', value: { id: 'newPlace', type: 'place', name: '新称地点' } },
        { type: 'add_memory', manual: true, value: { id: 'meeting', title: '见面', content: '两人在旧称地点见面', entityIds: ['oldPlace'], sources: evidence } },
        { type: 'add_edge', manual: true, value: { id: 'atPlace', type: 'at', fromId: 'meeting', toId: 'oldPlace', sources: evidence } },
    ] });
    await store.commit('lib', { requestId: 'merge', expectedRevision: 1, operations: [{ type: 'merge_entity', targetId: 'oldPlace', manual: true, value: { intoId: 'newPlace' } }] });
    let entry = await store.open('lib');
    assert.equal(entry.state.entities.oldPlace, undefined);
    assert.deepEqual(entry.state.memories.meeting.entityIds, ['newPlace']);
    assert.equal(entry.state.edges.atPlace.toId, 'newPlace');
    assert.ok(entry.index.recall('新称地点').selected.some(row => row.memory.id === 'meeting'));
    await store.commit('lib', await store.undo('lib', 'merge'));
    entry = await store.open('lib');
    assert.equal(entry.state.entities.oldPlace.name, '旧称地点');
    assert.deepEqual(entry.state.memories.meeting.entityIds, ['oldPlace']);
    assert.equal(entry.state.edges.atPlace.toId, 'oldPlace');
    assert.ok(entry.index.recall('旧称地点').selected.some(row => row.memory.id === 'meeting'));
}));
test('memory pages filter by lifecycle and entity name', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    await store.commit('lib', { requestId: 'setup', expectedRevision: 0, operations: [
        { type: 'add_entity', value: { id: 'wheel', type: 'place', name: '摩天轮', aliases: ['观景轮'] } },
        { ...proposal('past', '过去在摩天轮见面', { entityIds: ['wheel'], lifecycle: 'superseded' }) },
        { ...proposal('current', '现在在摩天轮约会', { entityIds: ['wheel'] }) },
    ] });
    assert.deepEqual((await store.query('lib', { lifecycle: 'superseded', entityQuery: '观景轮' })).items.map(item => item.id), ['past']);
    assert.deepEqual((await store.query('lib', { lifecycle: 'active', entityQuery: '不存在' })).items, []);
}));
test('maintenance flags an incomplete old-fact set instead of implying no conflict', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    await store.commit('lib', { requestId: 'setup', expectedRevision: 0, operations: Array.from({ length: 13 }, (_, index) => proposal(`habit${index}`, `玩家早餐偏好版本 ${index}`)) });
    const [result] = await store.maintenance('lib', [{ kind: 'fact', title: '早餐', content: '玩家新的早餐偏好', subjectId: 'user', attribute: 'breakfast' }]);
    assert.equal(result.related.length, 12);
    assert.equal(result.truncated, true);
}));
test('undo rejects a later link that depends on a newly added memory', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    const evidence = [{ actId: 1, messageId: 'm1', hash: 'h1', excerpt: '同一件事' }];
    await store.commit('lib', { requestId: 'first', expectedRevision: 0, operations: [{ type: 'add_memory', manual: true, value: { id: 'firstMemory', title: '第一件事', content: '第一次见面', sources: evidence } }] });
    await store.commit('lib', { requestId: 'second', expectedRevision: 1, operations: [
        { type: 'add_memory', manual: true, value: { id: 'secondMemory', title: '第二件事', content: '第二次见面', sources: evidence } },
        { type: 'add_edge', manual: true, value: { id: 'related', type: 'related_event', fromId: 'firstMemory', toId: 'secondMemory', sources: evidence } },
    ] });
    await assert.rejects(() => store.undo('lib', 'first'), error => error.status === 409);
}));
test('undo offers a compensating transaction and rejects dependent changes', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    await store.commit('lib', { requestId: 'tx1', expectedRevision: 0, operations: [proposal('m1', '原始偏好')] });
    const draft = await store.undo('lib', 'tx1');
    await store.commit('lib', draft); assert.equal((await store.open('lib')).state.memories.m1, undefined);
    await assert.rejects(() => store.undo('lib', 'tx1'), error => error.status === 404);
    await store.commit('lib', { requestId: 'tx2', expectedRevision: 2, operations: [proposal('m2', '第二条偏好')] });
    await store.commit('lib', { requestId: 'tx3', expectedRevision: 3, operations: [{ type: 'update_memory', targetId: 'm2', manual: true, value: { content: '已更新偏好' } }] });
    await assert.rejects(() => store.undo('lib', 'tx2'), error => error.status === 409);
}));
test('generated memory requires evidence matching the act snapshot', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib'); const operation = proposal('m1', '已确认事实'); delete operation.manual;
    await assert.rejects(() => store.commit('lib', { requestId: 'tx1', expectedRevision: 0, operations: [operation], sourceSnapshot: [{ actId: 1, messageId: 'msg1', hash: 'wrong' }] }), error => error.status === 400);
    const result = await store.commit('lib', { requestId: 'tx2', expectedRevision: 0, operations: [operation], sourceSnapshot: [{ actId: 1, messageId: 'msg1', hash: 'abc' }] });
    assert.equal(result.revision, 1);
}));
test('generated changes cannot forge evidence or bypass a locked fact', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    await store.commit('lib', { requestId: 'setup', expectedRevision: 0, operations: [proposal('lockedFact', '玩家通常不吃早餐', { locked: true })] });
    const evidence = [{ actId: 1, messageId: 'msg1', hash: 'abc', excerpt: '玩家愿意吃早餐' }];
    const snapshot = [{ actId: 1, messageId: 'msg1', hash: 'abc' }];
    await assert.rejects(() => store.commit('lib', { requestId: 'badSource', expectedRevision: 1, sourceSnapshot: snapshot, operations: [{ type: 'update_memory', targetId: 'lockedFact', value: { sources: evidence } }] }), error => error.status === 409);
    await assert.rejects(() => store.commit('lib', { requestId: 'badReplace', expectedRevision: 1, sourceSnapshot: snapshot, operations: [{ type: 'add_memory', value: { id: 'replacement', kind: 'fact', title: '新早餐习惯', content: '玩家喜欢早餐', subjectId: 'user', attribute: 'breakfast', supersedes: 'lockedFact', sources: evidence } }] }), error => error.status === 400);
    await assert.rejects(() => store.commit('lib', { requestId: 'badFlag', expectedRevision: 1, sourceSnapshot: snapshot, operations: [{ type: 'add_memory', value: { id: 'hidden', title: '隐藏', content: '不应写入', locked: true, sources: evidence } }] }), error => error.status === 400);
}));
test('generated replacement requires matching linked versions in one transaction', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    await store.commit('lib', { requestId: 'setup', expectedRevision: 0, operations: [proposal('old', '原来的早餐习惯')] });
    const evidence = [{ actId: 1, messageId: 'msg1', hash: 'abc', excerpt: '习惯变了' }], sourceSnapshot = [{ actId: 1, messageId: 'msg1', hash: 'abc' }];
    await assert.rejects(() => store.commit('lib', { requestId: 'unlinked', expectedRevision: 1, operations: [{ type: 'update_memory', targetId: 'old', value: { lifecycle: 'superseded' } }] }), error => error.status === 400);
    await assert.rejects(() => store.commit('lib', { requestId: 'noOldUpdate', expectedRevision: 1, sourceSnapshot, operations: [{ type: 'add_memory', value: { id: 'new', kind: 'fact', title: '新习惯', content: '现在喜欢早餐', subjectId: 'user', attribute: 'breakfast', supersedes: 'old', sources: evidence } }] }), error => error.status === 400);
}));
test('promise progress records evidence, changes recall status and can be undone', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    const old = proposal('promise', '角色答应一起旅行', { category: 'promise', attribute: 'travel', promiseStatus: 'in_progress' });
    await store.commit('lib', { requestId: 'setup', expectedRevision: 0, operations: [old] });
    const evidence = [{ actId: 2, messageId: 'm2', hash: 'h2', excerpt: '两人已经一起旅行' }];
    await store.commit('lib', { requestId: 'complete', expectedRevision: 1, sourceSnapshot: [{ actId: 2, messageId: 'm2', hash: 'h2' }], operations: [{ type: 'update_promise', targetId: 'promise', expectedMemoryRevision: 0, value: { promiseStatus: 'completed', sources: evidence } }] });
    let entry = await store.open('lib');
    assert.equal(entry.state.memories.promise.promiseStatus, 'completed');
    assert.equal(entry.state.memories.promise.sources.length, 2);
    assert.match(entry.index.recall('一起旅行').content, /承诺：completed/);
    await store.commit('lib', await store.undo('lib', 'complete'));
    entry = await store.open('lib'); assert.equal(entry.state.memories.promise.promiseStatus, 'in_progress');
}));
test('legacy migration keeps source fields and can be organized after review', async () => fixture(async dir => {
    const store = new LibraryStore(dir), opened = await store.resolve('old-chat', null, null, [], { memories: [{ id: 'old1', title: '旧习惯', content: '玩家不吃早饭', category: 'habit', locked: false, permanent: true }], acts: [{ id: 1, status: 'closed', diary: '旧日记' }], characterGrowth: { content: '旧成长' } });
    const page = await store.query(opened.libraryId, { legacyOnly: true }); assert.equal(page.total, 1); assert.equal(page.items[0].permanent, true);
    await store.commit(opened.libraryId, { requestId: 'organize1', expectedRevision: 0, operations: [{ type: 'update_memory', targetId: 'old1', manual: true, value: { kind: 'fact', subjectId: 'user', attribute: 'breakfast', legacy: false } }] });
    assert.equal((await store.query(opened.libraryId, { legacyOnly: true })).total, 0);
    assert.equal((await store.export(opened.libraryId)).legacyBackup.memories[0].title, '旧习惯');
}));
test('complete backup restores revision and history for review and undo', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('original');
    await store.commit('original', { requestId: 'first', expectedRevision: 0, operations: [proposal('kept', '早餐习惯')] });
    const backup = await store.export('original'), imported = await store.import(backup, 'restored-chat');
    assert.notEqual(imported.libraryId, 'original');
    assert.equal(imported.revision, 1);
    assert.equal((await store.export(imported.libraryId)).memories.kept.content, '早餐习惯');
    await store.commit(imported.libraryId, await store.undo(imported.libraryId, 'first'));
    assert.equal((await store.open(imported.libraryId)).state.memories.kept, undefined);
}));
test('recovery discards an incomplete journal tail before accepting new writes', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib'); await store.commit('lib', { requestId: 'tx1', expectedRevision: 0, operations: [proposal('m1', '第一条')] });
    await fs.appendFile(path.join(dir, 'lib', 'journal.ndjson'), '{"incomplete":');
    const reopened = new LibraryStore(dir); assert.equal((await reopened.open('lib')).state.revision, 1);
    await reopened.commit('lib', { requestId: 'tx2', expectedRevision: 1, operations: [proposal('m2', '第二条')] });
    const again = new LibraryStore(dir); assert.equal((await again.open('lib')).state.revision, 2);
}));
test('previous snapshot and journal recover a damaged current snapshot', async () => fixture(async dir => {
    const store = new LibraryStore(dir); await store.open('lib');
    for (let revision = 0; revision < 100; revision++) await store.commit('lib', { requestId: `tx${revision}`, expectedRevision: revision, operations: [proposal(`m${revision}`, `记忆${revision}`)] });
    const file = path.join(dir, 'lib', 'snapshot.json'); await fs.writeFile(file, '{damaged');
    const reopened = new LibraryStore(dir), entry = await reopened.open('lib');
    assert.equal(entry.state.revision, 100); assert.equal(Object.keys(entry.state.memories).length, 100);
}));
test('large library builds the text index in a worker', async () => fixture(async dir => {
    const memories = Array.from({ length: 1001 }, (_, index) => ({ id: `m${index}`, title: `约会${index}`, content: `摩天轮上的第${index}次约会` }));
    const store = new LibraryStore(dir), opened = await store.resolve('big-chat', null, null, [], { memories, acts: [], characterGrowth: null });
    const entry = await store.open(opened.libraryId);
    assert.equal(entry.index.docs.size, 1001); assert.ok(entry.index.recall('摩天轮').selected.length);
}));
