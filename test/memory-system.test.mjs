import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, normalizeState } from '../core.js';
import { applyMemoryChanges, planMemoryChanges, retrieveMemories, undoLastMaintenance, validateCandidates } from '../memory-system.js';
import { cacheKey, validateSemanticEndpoint } from '../semantic.js';

const row = { id: 'msg-1', body: '小林答应周末一起去海边。', speaker: '小林' };
const candidate = { category: 'promise', title: '周末海边约定', content: '小林答应周末一起去海边', status: 'active', sources: [{ messageId: 'msg-1', excerpt: '答应周末一起去海边' }] };
test('candidate evidence must be present in its exact source message', () => {
    const result = validateCandidates([candidate], [row], 1);
    assert.equal(result[0].sources[0].messageId, 'msg-1');
    assert.equal(result[0].status, 'active');
    assert.throws(() => validateCandidates([{ ...candidate, sources: [{ messageId: 'wrong', excerpt: '答应' }] }], [row], 1), /来源或证据无效/);
    assert.throws(() => validateCandidates([{ ...candidate, sources: [{ messageId: 'msg-1', excerpt: '已经去了海边' }] }], [row], 1), /来源或证据无效/);
    assert.throws(() => validateCandidates([{ ...candidate, sources: [] }], [row], 1), /缺少来源/);
    assert.throws(() => validateCandidates([{ ...candidate, status: 'invented' }], [row], 1), /状态无效/);
});
test('maintenance preserves evidence and can undo unchanged result', () => {
    const state = createState(1), [newMemory] = validateCandidates([candidate], [row], 1);
    const add = planMemoryChanges([newMemory], [], null);
    applyMemoryChanges(state, [newMemory], add, 'tx1');
    assert.equal(state.memories.length, 1);
    assert.equal(state.memories[0].sources.length, 1);
    undoLastMaintenance(state);
    assert.equal(state.memories.length, 0);
    assert.throws(() => undoLastMaintenance(state), /无法撤销/);
});
test('locked targets, incomplete proposals and invalid archive are rejected', () => {
    const [fresh] = validateCandidates([candidate], [row], 1);
    const locked = { ...fresh, id: 'old', locked: true };
    assert.throws(() => planMemoryChanges([fresh], [locked], [{ action: 'merge', candidateId: fresh.id, targetId: 'old' }]), /锁定/);
    assert.throws(() => planMemoryChanges([fresh], [], []), /缺少维护决策/);
    const promise = { ...locked, locked: false };
    assert.throws(() => planMemoryChanges([fresh], [promise], [{ action: 'archive', candidateId: fresh.id, targetId: 'old' }]), /不可归档/);
});
test('schema 4 migration is repeatable and future schemas are refused', () => {
    const old = { version: 3, memories: [{ id: 'a', title: '旧记忆', content: '事实', sourceActId: 1, sourceMessageIds: ['m'], locked: true, permanent: true, custom: 'keep' }] };
    const once = normalizeState(old), twice = normalizeState(once);
    assert.equal(once.version, 4);
    assert.equal(twice.memorySpaceId, once.memorySpaceId);
    assert.deepEqual(twice.memories[0].sources, once.memories[0].sources);
    assert.equal(twice.memories[0].custom, 'keep');
    assert.equal(twice.memories[0].locked, true);
    assert.throws(() => normalizeState({ version: 5 }), /高于支持版本/);
});
test('legacy memory libraries preserve facts, controls, provenance limits and recall', () => {
    for (const version of [undefined, 1, 2, 3]) {
        const old = {
            version, currentActId: 2, customState: { keep: true },
            acts: [{ id: 1, status: 'closed', title: '旧幕', diary: '用户改过的日记', messageIds: ['msg-1'], customAct: 'keep' }, { id: 2, status: 'active' }],
            memories: [
                { id: 'fixed', category: 'relationship', title: '确认关系', content: '两人确认了恋爱关系', sourceActId: 1, sourceMessageIds: ['msg-1'], locked: true, permanent: true, revision: 4, customMemory: 'keep' },
                { id: 'plain', category: 'preference', title: '薄荷茶', content: '小林明确说喜欢薄荷茶', sourceActId: 1 },
                { id: 'dirty', category: 'event', title: '海边', content: '一起去了海边', sourceActId: 1, dirty: true },
                { id: 'disabled', category: 'event', title: '电影', content: '一起看了电影', disabled: true },
                { id: 'deleted', category: 'event', title: '花店', content: '一起去了花店', deletedAt: 123 },
            ],
            settings: { prompts: { memory: '用户记忆提示词' }, recallLimit: 8, memoryTokenBudget: 1200, customSetting: 'keep' },
        };
        const migrated = normalizeState(old), repeated = normalizeState(migrated);
        assert.equal(migrated.version, 4);
        assert.equal(migrated.customState.keep, true);
        assert.equal(migrated.acts[0].customAct, 'keep');
        assert.equal(migrated.acts[0].diary, '用户改过的日记');
        assert.deepEqual(migrated.memories.map(memory => memory.id), old.memories.map(memory => memory.id));
        assert.equal(migrated.memories[0].customMemory, 'keep');
        assert.equal(migrated.memories[0].locked, true);
        assert.equal(migrated.memories[0].permanent, true);
        assert.equal(migrated.memories[0].revision, 4);
        assert.equal(migrated.memories[0].sources[0].messageId, 'msg-1');
        assert.equal(migrated.memories[0].sources[0].unverifiedLegacy, true);
        assert.equal(migrated.memories[1].sources[0].actId, 1);
        assert.equal(migrated.memories[1].sources[0].unverifiedLegacy, true);
        assert.equal(migrated.memories[2].dirty, true);
        assert.equal(migrated.memories[3].disabled, true);
        assert.equal(migrated.memories[4].deletedAt, 123);
        assert.equal(migrated.settings.prompts.memory, '用户记忆提示词');
        assert.equal(migrated.settings.customSetting, 'keep');
        assert.deepEqual(repeated.memories, migrated.memories);
        assert.equal(repeated.memorySpaceId, migrated.memorySpaceId);
        assert.deepEqual(retrieveMemories(migrated.memories, '薄荷茶', migrated.settings).selected.map(item => item.memory.id), ['fixed', 'plain']);
        assert.deepEqual(retrieveMemories(migrated.memories, '海边电影花店', migrated.settings).selected.map(item => item.memory.id), ['fixed']);
    }
});
test('lexical cache does not reuse a different chat with the same IDs and revision', () => {
    const settings = { recallLimit: 8, memoryTokenBudget: 1200 };
    const first = [{ id: 'same', title: '薄荷茶', content: '喜欢薄荷茶', people: [], aliases: [] }];
    const second = [{ id: 'same', title: '海边', content: '去了海边', people: [], aliases: [] }];
    assert.deepEqual(retrieveMemories(first, '薄荷茶', settings, { revision: 0 }).selected.map(item => item.memory.id), ['same']);
    assert.deepEqual(retrieveMemories(second, '薄荷茶', settings, { revision: 0 }).selected.map(item => item.memory.id), []);
});
test('recall respects eligibility, permanent slots and empty queries', () => {
    const settings = { recallLimit: 2, memoryTokenBudget: 1 };
    const memories = [{ id: 'fixed', title: '固定', content: '已确认恋爱', people: [], aliases: [], permanent: true, lifecycle: 'current' }, { id: 'dirty', title: '海边', content: '海边', people: [], aliases: [], dirty: true }, { id: 'ordinary', title: '海边', content: '海边', people: [], aliases: [] }];
    assert.deepEqual(retrieveMemories(memories, '', settings).selected.map(item => item.memory.id), ['fixed']);
    assert.deepEqual(retrieveMemories(memories, '海边', settings).selected.map(item => item.memory.id), ['fixed']);
    assert.ok(retrieveMemories(memories, '', settings).budgetUsed > 1);
});
test('superseded facts are only available for retrospective queries', () => {
    const memories = [{ id: 'old', title: '旧约定', content: '曾经约好去海边', people: [], aliases: [], lifecycle: 'superseded' }], settings = { recallLimit: 8, memoryTokenBudget: 1200 };
    assert.equal(retrieveMemories(memories, '海边', settings).selected.length, 0);
    assert.deepEqual(retrieveMemories(memories, '以前的海边约定', settings).selected.map(item => item.memory.id), ['old']);
});
test('vector cache key changes across account, chat, model, content and dimension', () => {
    const base = { account: 'a', chat: 'c', space: 's' }, config = { endpoint: 'https://example.test/v1/embeddings', model: 'm', dimensions: 3 }, memory = { id: 'x', title: '标题', content: '事实', people: [], aliases: [] };
    const first = cacheKey(base, config, memory);
    for (const changed of [cacheKey({ ...base, account: 'b' }, config, memory), cacheKey({ ...base, chat: 'd' }, config, memory), cacheKey(base, { ...config, model: 'n' }, memory), cacheKey(base, { ...config, dimensions: 4 }, memory), cacheKey(base, config, { ...memory, content: '不同事实' })]) assert.notEqual(changed, first);
});
test('embedding endpoint never persists a URL containing credentials', () => {
    assert.equal(validateSemanticEndpoint('https://example.test/v1/embeddings'), 'https://example.test/v1/embeddings');
    assert.throws(() => validateSemanticEndpoint('https://user:secret@example.test/v1/embeddings'), /密钥/);
    assert.throws(() => validateSemanticEndpoint('https://example.test/v1/embeddings?api_key=secret'), /密钥/);
});
test('sixty synthetic romance source scenarios reject unsupported assertions', () => {
    const events = ['约好一起看电影', '确认喜欢薄荷茶', '在雨中交换了伞', '送出了生日卡片', '一起做了晚饭', '解释了自己的昵称', '约好周五通话', '第一次见到小猫', '明确取消周末约会', '共同整理了照片'];
    let accepted = 0, rejected = 0;
    for (let i = 0; i < 60; i++) {
        const fact = events[i % events.length], id = `case-${i}`, source = { id, body: `第${i + 1}幕：两人${fact}。` };
        const item = { category: 'event', title: `${fact}${i}`, content: `两人${fact}`, sources: [{ messageId: id, excerpt: i % 2 ? `已经完成${fact}` : fact }] };
        if (i % 2) { assert.throws(() => validateCandidates([item], [source], i + 1), /来源或证据无效/); rejected++; }
        else { assert.equal(validateCandidates([item], [source], i + 1)[0].sources[0].actId, i + 1); accepted++; }
    }
    assert.equal(accepted, 30); assert.equal(rejected, 30);
});
