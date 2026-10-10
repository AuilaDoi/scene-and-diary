import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, normalizeState, normalizeSettings, normalizeMemory, buildMemoryBlock } from '../core.js';
import { retrieveMemories, rankRecallCandidates, finalizeRecallCandidates, selectRecallGroups } from '../memory-system.js';
import { hostFixture } from './helpers/host.mjs';

const memory = (id, extra = {}) => normalizeMemory({ id, title: id, content: `独立事实${id}`, importance: 3, ...extra });
const settings = { recallLimit: 8, memoryTokenBudget: 1200, recallScoreThreshold: .3 };
const seed = (entry, score = .8) => ({ memory: entry, score, permanent: !!entry.permanent });
const ids = recall => recall.selected.map(item => item.memory.id).sort();
const links = pairs => pairs.map(([a, b]) => ({ a, b, reason: '事实发展' }));

test('threshold defaults within schema 6, retains custom values and normalizes damaged settings', () => {
    for (const value of [undefined, null, '', ' ', true, {}, NaN, Infinity, 'wrong']) assert.equal(normalizeSettings({ recallScoreThreshold: value }).recallScoreThreshold, .3);
    for (const [value, expected] of [[0, 0], [1, 1], [.72, .72], ['0.41', .41], [-1, 0], [2, 1]]) assert.equal(normalizeSettings({ recallScoreThreshold: value }).recallScoreThreshold, expected);
    const state = createState(); delete state.settings.recallScoreThreshold;
    const old = normalizeState(state); assert.equal(old.version, 6); assert.equal(old.settings.recallScoreThreshold, .3);
    old.settings.recallScoreThreshold = .72; assert.deepEqual(normalizeState(old), old);
});

test('final cutoff is inclusive, does not fill spare slots, and exempts permanent seeds', () => {
    const memories = [memory('below'), memory('equal'), memory('above'), memory('fixed', { permanent: true })];
    const result = finalizeRecallCandidates(memories, memories.map((entry, i) => seed(entry, [.299, .3, .301, 0][i])), settings);
    assert.deepEqual(ids(result), ['above', 'equal', 'fixed']); assert.equal(result.groups.length, 3);
    assert.deepEqual(result.rejectedCandidates.map(item => item.memory.id), ['below']);
    assert.equal(finalizeRecallCandidates(memories, [seed(memories[0], 0)], { ...settings, recallScoreThreshold: 0 }).selected.length, 1);
    assert.deepEqual(finalizeRecallCandidates(memories, [seed(memories[0], .299)], settings).selected, []);
});

test('unrelated lexical candidates survive initial retrieval but are rejected even at importance 5', () => {
    const memories = [memory('a', { content: '一起喝薄荷茶。', importance: 5 }), memory('b', { content: '一起看海。' })];
    const result = retrieveMemories(memories, '飞船维修', settings);
    assert.equal(result.retrievalCandidates.length, 2); assert.equal(result.rejectedCandidates.length, 2);
    assert.deepEqual(result.selected, []); assert.equal(buildMemoryBlock(result), '');
    assert.ok(result.retrievalCandidates.every(item => item.relevance === 0 && item.score <= .05));
});

test('weak sole vector matches are not promoted to 1 and custom thresholds replace the old .15 cutoff', () => {
    const memories = [memory('a')], options = { queryVector: [1, 0], vectors: new Map([['a', [.12, Math.sqrt(1 - .12 ** 2)]]]) };
    const result = retrieveMemories(memories, '飞船维修', settings, options);
    assert.equal(result.retrievalCandidates.length, 1); assert.ok(result.retrievalCandidates[0].channels.includes('vector'));
    assert.ok(Math.abs(result.retrievalCandidates[0].relevance - .12) < 1e-10); assert.deepEqual(result.selected, []);
    assert.deepEqual(ids(retrieveMemories(memories, '飞船维修', { ...settings, recallScoreThreshold: .1 }, options)), ['a']);
    assert.deepEqual(ids(retrieveMemories(memories, '飞船维修', settings, { ...options, vectors: new Map([['a', [.5, Math.sqrt(.75)]]]) })), ['a']);
});

test('weak lexical matches retain their evidence ceiling and missing vectors are not synthetic vector candidates', () => {
    const memories = Array.from({ length: 30 }, (_, i) => memory(`id${i}`, { content: '大家都在喝茶。' }));
    const result = retrieveMemories(memories, '喝茶', settings, { queryVector: [1, 0] });
    assert.equal(result.retrievalCandidates.length, 30); assert.deepEqual(result.selected, []);
    assert.ok(result.retrievalCandidates.every(item => item.relevance < .3 && !item.channels.includes('vector')));
});

test('absolute rerank scores do not promote weak top or equal results; cutoff uses importance-adjusted scores', () => {
    const memories = [memory('a', { importance: 1 }), memory('b', { importance: 5 })];
    const equal = rankRecallCandidates(memories.map(entry => seed(entry)), [.1, .1], { absolute: true });
    assert.ok(equal.every(item => item.relevance === .1)); assert.deepEqual(finalizeRecallCandidates(memories, equal, settings).selected, []);
    const adjusted = rankRecallCandidates(memories.map(entry => seed(entry)), [.27, .27], { absolute: true });
    assert.deepEqual(ids(finalizeRecallCandidates(memories, adjusted, settings)), ['b']);
    assert.deepEqual(rankRecallCandidates(memories.map(entry => seed(entry)), [-2, 2], { absolute: true }).map(item => item.relevance), [1, 0]);
});

test('one and two distinct seeds retain neighbors; three seeds keep seeds only after overlap merging', () => {
    const memories = ['a', 'b', 'c', 'x', 'y'].map(id => memory(id)), graph = links([['a', 'x'], ['b', 'x'], ['c', 'x'], ['c', 'y']]);
    const two = selectRecallGroups(memories, memories.slice(0, 2).map(entry => seed(entry)), settings, graph);
    assert.deepEqual(ids(two), ['a', 'b', 'x']); assert.equal(two.groups[0].seedOnly, false);
    const three = selectRecallGroups(memories, memories.slice(0, 3).map(entry => seed(entry)), settings, graph);
    assert.deepEqual(ids(three), ['a', 'b', 'c']); assert.equal(three.groups.length, 1);
    assert.equal(three.groups[0].seedOnly, true); assert.deepEqual(three.groups[0].prunedNeighborIds.sort(), ['x', 'y']);
    assert.ok(three.selected.every(item => !item.linked)); assert.deepEqual(three.groups[0].links, []);
    const duplicates = selectRecallGroups(memories, [seed(memories[0]), seed(memories[0]), seed(memories[1])], settings, graph);
    assert.deepEqual(ids(duplicates), ['a', 'b', 'x']); assert.equal(duplicates.groups[0].seedOnly, false);
});

test('rejected entries cannot enlarge seed count, but can remain neighbors in a small group', () => {
    const memories = ['a', 'b', 'c', 'x'].map(id => memory(id)), graph = links([['a', 'x'], ['b', 'x'], ['c', 'x']]);
    const small = finalizeRecallCandidates(memories, [seed(memories[0]), seed(memories[1], .1), seed(memories[2], .1)], settings, graph);
    assert.deepEqual(ids(small), ['a', 'x']); assert.deepEqual(small.groups[0].seedIds, ['a']);
    const large = finalizeRecallCandidates(memories, [...memories.slice(0, 3).map(entry => seed(entry)), seed(memories[3], .1)], settings, graph);
    assert.deepEqual(ids(large), ['a', 'b', 'c']); assert.equal(large.rejectedCandidates[0].memory.id, 'x');
});

test('seed-only contraction precedes budget checks, counts permanent seeds, and preserves group priority', () => {
    const memories = [memory('a', { permanent: true }), memory('b'), memory('c'), memory('x', { content: '长'.repeat(500) }), memory('d')];
    const graph = links([['a', 'x'], ['b', 'x'], ['c', 'x']]);
    const result = finalizeRecallCandidates(memories, [...memories.slice(0, 3).map(entry => seed(entry)), seed(memories[4], .99)], { ...settings, recallLimit: 1, memoryTokenBudget: 100 }, graph);
    assert.deepEqual(ids(result), ['a', 'b', 'c']); assert.equal(result.groups[0].permanent, true);
    assert.equal(result.skippedGroups.length, 0); assert.ok(result.budgetUsed <= 100);
    assert.deepEqual(finalizeRecallCandidates(memories, [seed(memories[0])], { ...settings, memoryTokenBudget: 100 }, graph).selected, []);
});

const rerankConfig = { enabled: false, rerank: true, rerankEndpoint: 'https://example.test/rerank', rerankModel: 'ranker' };
test('host rerank can rescue locally rejected candidates and applies cutoff after successful rerank', async () => {
    const host = await hostFixture(['飞船维修']);
    try {
        const state = host.api.getState(); state.memories = [memory('rescue'), memory('reject')]; state.settings.semantic = rerankConfig;
        host.context.chatMetadata.scene_diary = state;
        assert.deepEqual(retrieveMemories(state.memories, host.api.recallInput(state).query, state.settings).selected, []);
        const calls = [];
        globalThis.fetch = async (_url, init) => { const body = JSON.parse(init.body); calls.push(body); return { ok: true, json: async () => ({ results: body.documents.map((doc, index) => ({ index, relevance_score: doc === state.memories[0].content ? .9 : .1 })) }) }; };
        const result = await host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat');
        assert.equal(calls.length, 1); assert.equal(calls[0].documents.length, 2);
        assert.deepEqual(ids(result), ['rescue']); assert.equal(result.rejectedCandidates[0].memory.id, 'reject');
        assert.equal(result.candidates[0].source, 'rerank');
    } finally { host.cleanup(); }
});

test('host all-low rerank returns no ordinary groups and threshold changes invalidate cached results', async () => {
    const host = await hostFixture(['北海道']);
    try {
        const state = host.api.getState(); state.memories = [memory('a', { content: '两人去了北海道。' })]; state.settings.semantic = rerankConfig;
        host.context.chatMetadata.scene_diary = state; let calls = 0;
        globalThis.fetch = async () => { calls++; return { ok: true, json: async () => ({ results: [{ index: 0, relevance_score: .1 }] }) }; };
        const input = host.api.recallInput(state);
        assert.deepEqual((await host.api.prepareContinuity(state, input, 'test-chat')).selected, []);
        await host.api.prepareContinuity(state, input, 'test-chat'); assert.equal(calls, 1);
        state.settings.recallScoreThreshold = .1;
        assert.deepEqual(ids(await host.api.prepareContinuity(state, input, 'test-chat')), ['a']); assert.equal(calls, 2);
    } finally { host.cleanup(); }
});

test('host failed rerank keeps thresholded local results and retries rather than caching degradation', async () => {
    const host = await hostFixture(['飞船维修']);
    try {
        const state = host.api.getState(); state.memories = [memory('a')]; state.settings.semantic = rerankConfig;
        host.context.chatMetadata.scene_diary = state; let calls = 0;
        globalThis.fetch = async () => { calls++; throw new Error('network unavailable'); };
        for (let i = 0; i < 2; i++) {
            const result = await host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat');
            assert.deepEqual(result.selected, []); assert.equal(result.rejectedCandidates.length, 1); assert.match(result.degradedReason, /rerank/);
        }
        assert.equal(calls, 2);
    } finally { host.cleanup(); }
});
