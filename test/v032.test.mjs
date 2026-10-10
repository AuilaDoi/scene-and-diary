import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMemoryBlock, createState, normalizeMemory, normalizeState, normalizeMemoryLinks, buildRecallQuery } from '../core.js';
import { appendExtractedMemories, applyMaintenance, latestStoryTime, maintenanceTasks, splitMaintenanceTask, planMaintenance, rankRecallCandidates, retrieveMemories, selectRecallGroups, validateCandidateBatch, validateCandidates } from '../memory-system.js';
import { createContentBackup, restoreContentBackup } from '../backup.js';
import { embed } from '../semantic.js';
const memory = (id, overrides = {}) => normalizeMemory({ id, category: 'event', title: `事实${id}`, content: `内容${id}`, importance: 3, people: [], aliases: [], storyTime: null, ...overrides });
const settings = { recallLimit: 8, memoryTokenBudget: 1200 };
const link = (a, b) => ({ a, b, reason: '承诺与履行' });
const merge = (ids, targetId = ids[0]) => ({ action: 'merge', memberIds: ids, targetId, title: '合并事实', content: '同一事实的合并表达', category: 'event', reason: '同一事实' });

test('schema 6 migration removes legacy fields and hidden entries, preserves user controls and is idempotent', () => {
    for (const version of [undefined, 1, 2, 3, 4]) {
        const state = normalizeState({ version, custom: 'keep', memories: [memory('keep', { locked: true, permanent: true, disabled: true, custom: 'keep' }), { ...memory('archived'), lifecycle: 'archived' }, { ...memory('old'), lifecycle: 'superseded' }, memory('deleted', { deletedAt: 5 })].map(item => ({ ...item, sources: [{ messageId: 'x' }], sourceActId: 1, sourceMessageIds: ['x'], status: 'active', supersedes: [], mergedInto: null, revision: 4, dirty: true })), maintenanceHistory: [{ before: ['legacy'] }] });
        assert.equal(state.version, 6); assert.deepEqual(state.memories.map(item => item.id), ['keep']);
        assert.equal(state.custom, 'keep'); assert.equal(state.memories[0].custom, 'keep');
        assert.equal(state.memories[0].locked && state.memories[0].permanent, true);
        for (const field of ['sources', 'sourceActId', 'sourceMessageIds', 'lifecycle', 'supersedes', 'mergedInto', 'revision', 'status', 'dirty']) assert.equal(field in state.memories[0], false);
        assert.equal('maintenanceHistory' in state, false); assert.deepEqual(normalizeState(state), state);
    }
    assert.throws(() => normalizeState({ version: 7 }), /高于支持版本/);
});
test('migration keeps diary and growth previews but invalidates only legacy memory output', () => {
    const tx = { memoryCandidates: [memory('a')], results: { diary: { status: 'success', value: { title: '幕', diary: '日记' } }, growth: { status: 'success', value: '成长' }, memory: { status: 'success', value: { operations: [] } } } };
    const state = normalizeState({ version: 4, status: 'preview', pendingTransaction: tx });
    assert.deepEqual(state.pendingTransaction.results.diary, tx.results.diary);
    assert.deepEqual(state.pendingTransaction.results.growth, tx.results.growth);
    assert.equal(state.pendingTransaction.results.memory.status, 'error'); assert.equal('memoryCandidates' in state.pendingTransaction, false);
});
test('candidate validation is structural only and does not verify implausible facts', () => {
    const candidate = memory('a', { title: '不可能的事实', content: '两人飞到了月球。' });
    assert.equal(validateCandidates([candidate])[0].content, candidate.content);
    const batch = validateCandidateBatch([candidate, { ...candidate, importance: 6 }, { ...candidate, people: 'wrong' }, { ...candidate, storyTime: 42 }, { ...candidate, content: 'x'.repeat(501) }]);
    assert.equal(batch.candidates.length, 1); assert.equal(batch.rejected.length, 4);
    assert.deepEqual(validateCandidateBatch([]).candidates, []); assert.throws(() => validateCandidates(Array(31).fill(candidate)), /30/);
});
test('extraction appends approved candidates to the latest library without modifying existing memories', () => {
    const state = createState(); state.memories = [memory('old')]; const old = structuredClone(state.memories[0]);
    const result = appendExtractedMemories(state, [memory('new'), { ...memory('skip'), accepted: false }]);
    assert.deepEqual(result.memories.map(item => item.id), ['old', 'new']); assert.deepEqual(result.memories[0], old); assert.equal(state.memories.length, 1);
    assert.throws(() => appendExtractedMemories(result, [memory('new')]), /重复/);
});
test('merge controls, story time and redirected relationships preserve user data', () => {
    const state = createState(); state.memories = [memory('a', { storyTime: '2026-09-01', disabled: true, aliases: ['甲'], people: ['小林'] }), memory('b', { storyTime: '2026-10-01', importance: 5, permanent: true, aliases: ['乙'] }), memory('c')]; state.memoryLinks = [link('a', 'c'), link('b', 'c'), link('a', 'b')];
    const ops = planMaintenance(state.memories, state.memoryLinks, [merge(['a', 'b'])]); const next = applyMaintenance(state, ops);
    assert.deepEqual(next.memories.map(item => item.id), ['a', 'c']); const merged = next.memories[0];
    assert.equal(merged.storyTime, '2026-10-01'); assert.equal(merged.importance, 5); assert.equal(merged.permanent, true); assert.equal('disabled' in merged, false); assert.deepEqual(merged.aliases, ['甲', '乙']); assert.deepEqual(merged.people, ['小林']);
    assert.deepEqual(next.memoryLinks, [link('a', 'c')]); assert.equal(state.memories.length, 3);
});
test('relative story times require an explicit original-value choice', () => {
    const state = createState(); state.memories = [memory('a', { storyTime: '周末' }), memory('b', { storyTime: '几天后' })];
    const ops = planMaintenance(state.memories, [], [merge(['a', 'b'])]); assert.equal(ops[0].timeResolved, false);
    assert.throws(() => applyMaintenance(state, ops), /选择/); ops[0].timeResolved = true; ops[0].merged.storyTime = '几天后'; assert.equal(applyMaintenance(state, ops).memories[0].storyTime, '几天后');
    assert.equal(latestStoryTime([memory('x'), memory('y')]).value, null);
});
test('locked memories can be linked but cannot be merged; unapproved operations do nothing', () => {
    const state = createState(); state.memories = [memory('a', { locked: true }), memory('b')];
    assert.throws(() => planMaintenance(state.memories, [], [merge(['a', 'b'])]), /锁定/);
    const ops = planMaintenance(state.memories, [], [{ action: 'link', ...link('a', 'b') }]);
    assert.equal(applyMaintenance(state, ops).memoryLinks.length, 1); assert.deepEqual(state.memoryLinks, []);
    ops[0].accepted = false; assert.deepEqual(applyMaintenance(state, ops).memories, state.memories);
});
test('overlapping merges are mutually exclusive, including after preview edits', () => {
    const state = createState(); state.memories = ['a', 'b', 'c'].map(id => memory(id));
    const ops = planMaintenance(state.memories, [], [merge(['a', 'b']), merge(['b', 'c'])]); assert.equal(ops.every(op => !op.accepted && op.conflicts.length === 1), true);
    ops.forEach(op => op.accepted = true); assert.throws(() => applyMaintenance(state, ops), /冲突/);
    ops[1].accepted = false; assert.equal(applyMaintenance(state, ops).memories.length, 2);
});
test('normalized links deduplicate directions, remove self edges and dangling endpoints', () => {
    assert.deepEqual(normalizeMemoryLinks([link('b', 'a'), link('a', 'b'), link('a', 'a'), link('a', 'missing')], [memory('a'), memory('b')]), [link('a', 'b')]);
});
function comparedPairs(tasks) {
    const pairs = new Set(); for (const task of tasks) { if (task.right.length) for (const a of task.left) for (const b of task.right) pairs.add([a, b].sort().join(':')); else for (let i = 0; i < task.left.length; i++) for (let j = i + 1; j < task.left.length; j++) pairs.add([task.left[i], task.left[j]].sort().join(':')); } return pairs;
}
test('batched maintenance and context-limit splitting cover every pair across all blocks', () => {
    const memories = Array.from({ length: 7 }, (_, i) => memory(String(i)));
    const tasks = maintenanceTasks(memories, 1300); assert.equal(comparedPairs(tasks).size, 21);
    const single = maintenanceTasks(memories, 100000)[0]; assert.deepEqual(comparedPairs(splitMaintenanceTask(single)), comparedPairs([single]));
    const cross = tasks.find(task => task.right.length && task.left.length > 1); assert.deepEqual(comparedPairs(splitMaintenanceTask(cross)), comparedPairs([cross]));
});
test('one-hop expansion recalls A/B for seed A, adds C only when B independently matches', () => {
    const memories = [memory('a', { title: '北海道承诺', content: '答应北海道旅游' }), memory('b', { title: '实际旅行', content: '一起出行' }), memory('c', { title: '旅行照片', content: '整理相册' })], links = [link('a', 'b'), link('b', 'c')];
    const recall = retrieveMemories(memories, '北海道', settings, { links }); assert.deepEqual(recall.selected.map(item => item.memory.id).sort(), ['a', 'b']); assert.equal(recall.groups.length, 1);
    const both = selectRecallGroups(memories, memories.slice(0, 2).map(memory => ({ memory, score: 1 })), settings, links); assert.deepEqual(both.selected.map(item => item.memory.id).sort(), ['a', 'b', 'c']); assert.equal(both.groups.length, 1);
    assert.match(buildMemoryBlock(recall), /关联记忆组/);
});
test('overlap, cycles and multiple neighbors form one counted group without duplicate injection', () => {
    const memories = ['a', 'b', 'c', 'd'].map(id => memory(id)), links = [link('a', 'b'), link('b', 'c'), link('c', 'a'), link('a', 'd')];
    const recall = selectRecallGroups(memories, [0, 2].map(i => ({ memory: memories[i], score: 1 })), { ...settings, recallLimit: 1 }, links);
    assert.equal(recall.groups.length, 1); assert.equal(recall.selected.length, 4); assert.equal(new Set(recall.selected.map(item => item.memory.id)).size, 4);
});
test('legacy disabled memories participate while deleted neighbors are excluded', () => {
    const memories = [memory('a'), memory('b', { disabled: true }), memory('c', { deletedAt: 1 })];
    const recall = retrieveMemories(memories, '内容a', settings, { links: [link('a', 'b'), link('a', 'c')] }); assert.deepEqual(recall.selected.map(item => item.memory.id).sort(), ['a', 'b']);
});
test('oversized groups including permanent groups are skipped whole, smaller groups can still fit', () => {
    const memories = [memory('a', { content: '长'.repeat(500), permanent: true }), memory('b', { content: '长'.repeat(500) }), memory('c')];
    const recall = selectRecallGroups(memories, [{ memory: memories[0], score: 1, permanent: true }, { memory: memories[2], score: .9 }], { recallLimit: 2, memoryTokenBudget: 150 }, [link('a', 'b')]);
    assert.deepEqual(recall.selected.map(item => item.memory.id), ['c']); assert.equal(recall.skippedGroups[0].permanent, true); assert.ok(recall.budgetUsed <= 150);
    assert.equal(selectRecallGroups(memories, [{ memory: memories[0], score: 1 }], { ...settings, recallLimit: 0 }, []).selected.length, 0);
});
test('importance breaks similar relevance ties but does not promote unrelated facts', () => {
    const low = memory('a', { importance: 1 }), high = memory('b', { importance: 5 });
    assert.deepEqual(rankRecallCandidates([{ memory: low, score: .9 }, { memory: high, score: .89 }]).map(item => item.memory.id), ['b', 'a']);
    assert.deepEqual(rankRecallCandidates([{ memory: low, score: .9 }, { memory: high, score: .1 }]).map(item => item.memory.id), ['a', 'b']);
    assert.deepEqual(retrieveMemories([memory('match', { title: '辅助标题', content: '北海道旅行' }), memory('other', { importance: 5 })], '北海道', settings).selected.map(item => item.memory.id), ['match']);
});
test('lexical cache isolates equal revisions and IDs with different content; historical wording has no special mode', () => {
    const first = memory('same', { title: '薄荷茶', content: '喜欢薄荷茶' }), second = memory('same', { title: '海边', content: '去了海边' });
    assert.equal(retrieveMemories([first], '薄荷茶', settings, { revision: 0 }).selected.length, 1);
    assert.equal(retrieveMemories([second], '薄荷茶', settings, { revision: 0 }).selected.length, 0);
    assert.equal(retrieveMemories([second], '以前的海边', settings).selected.length, 1);
});
test('one merged query preserves speaker order and works without a player row', () => {
    const rules = { user: {}, character: {} }; const query = buildRecallQuery([{ name: '林', mes: '你好' }, { is_user: true, name: '我', mes: '旅行' }, { name: '林', mes: '一起去' }], rules);
    assert.equal(query.text, '林: 你好\n\n我: 旅行\n\n林: 一起去'); assert.equal(buildRecallQuery([{ name: '林', mes: '独白' }], rules).text, '林: 独白');
});
test('backup v2 round trips links; v1 drops legacy archived data and does not invent links', () => {
    const state = createState(); state.memories = [memory('a'), memory('b')]; state.memoryLinks = [link('a', 'b')];
    const backup = createContentBackup(state, 'chat'); assert.equal(backup.version, 2); assert.deepEqual(restoreContentBackup(state, backup, 'chat').memoryLinks, state.memoryLinks);
    const old = { ...backup, version: 1, memories: [...backup.memories, { ...memory('old'), lifecycle: 'archived' }] }; delete old.memoryLinks;
    const restored = restoreContentBackup(state, old, 'chat'); assert.equal(restored.memories.length, 2); assert.deepEqual(restored.memoryLinks, []);
    assert.throws(() => restoreContentBackup(state, { ...backup, memoryLinks: [link('a', 'missing')] }, 'chat'), /关联无效/);
});
test('embedding rejects duplicate indexes and mismatched dimensions instead of silently using bad vectors', async () => {
    const original = globalThis.fetch;
    try {
        globalThis.fetch = async () => ({ ok: true, json: async () => ({ data: [{ index: 0, embedding: [1, 2] }, { index: 0, embedding: [1, 2] }] }) });
        await assert.rejects(embed(['a', 'b'], { endpoint: 'https://example.test/embeddings', model: 'm' }, ''), /索引/);
        globalThis.fetch = async () => ({ ok: true, json: async () => ({ data: [{ index: 0, embedding: [1, 2] }] }) });
        await assert.rejects(embed(['a'], { endpoint: 'https://example.test/embeddings', model: 'm', dimensions: 3 }, ''), /维度/);
    } finally { globalThis.fetch = original; }
});

test('merged aliases and people preserve the complete union instead of silently truncating', () => {
    const state = createState(); state.memories = [memory('a', { aliases: Array.from({length:24}, (_,i)=>`a${i}`), people: Array.from({length:12},(_,i)=>`p${i}`) }), memory('b', { aliases: Array.from({length:24},(_,i)=>`b${i}`), people: Array.from({length:12},(_,i)=>`q${i}`) })];
    const next = applyMaintenance(state, planMaintenance(state.memories, [], [merge(['a','b'])]));
    assert.equal(next.memories[0].aliases.length, 48); assert.equal(next.memories[0].people.length, 24); assert.equal(normalizeState(next).memories[0].aliases.length, 48);
    assert.equal(restoreContentBackup(next, createContentBackup(next,'chat'),'chat').memories[0].aliases.length,48);
});
test('model candidates cannot supply IDs or user approval/control fields', () => {
    const [candidate] = validateCandidates([{ ...memory('injected', { locked:true,permanent:true,disabled:true }), accepted:false }]);
    assert.notEqual(candidate.id,'injected'); assert.equal(candidate.locked,false); assert.equal(candidate.permanent,false); assert.equal('disabled' in candidate,false); assert.equal('accepted' in candidate,false);
});
