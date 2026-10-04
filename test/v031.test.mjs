import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, normalizeMemory } from '../core.js';
import { createContentBackup, restoreContentBackup } from '../backup.js';
import { rerank } from '../semantic.js';

test('dedicated rerank endpoint receives model, query, documents and bearer key', async () => {
    const original = globalThis.fetch;
    let request;
    globalThis.fetch = async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ results: [{ index: 1, relevance_score: 0.9 }, { index: 0, relevance_score: 0.1 }] }) }; };
    try {
        const scores = await rerank('海边', ['海边', '约会'], { rerankEndpoint: 'https://example.test/v1/rerank', rerankModel: 'ranker' }, 'secret');
        assert.deepEqual(scores, [0.1, 0.9]);
        assert.equal(request.url, 'https://example.test/v1/rerank');
        assert.equal(request.options.headers.Authorization, 'Bearer secret');
        assert.deepEqual(JSON.parse(request.options.body), { model: 'ranker', query: '海边', documents: ['海边', '约会'], top_n: 2 });
    } finally { globalThis.fetch = original; }
});

test('dedicated rerank rejects incomplete or duplicated result indexes', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ results: [{ index: 0, relevance_score: 0.8 }] }) });
    try { await assert.rejects(() => rerank('问题', ['一', '二'], { rerankEndpoint: 'https://example.test/rerank', rerankModel: 'ranker' }, ''), /数据无效/); }
    finally { globalThis.fetch = original; }
});

test('content backup restores visible diaries, growth and memories together', () => {
    const state = createState(1);
    state.acts[0].diary = '旧日记'; state.acts[0].title = '第一幕';
    state.characterGrowth.content = '旧成长';
    state.memories = [normalizeMemory({ id: 'visible', title: '海边', content: '一起看海' }), normalizeMemory({ id: 'hidden', title: '删除', content: '已删除', deletedAt: 10 })];
    const backup = createContentBackup(state, 'chat-1');
    assert.equal(backup.diaries.length, 1);
    assert.deepEqual(backup.memories.map(memory => memory.id), ['visible']);
    state.acts[0].diary = '新日记'; state.characterGrowth.content = '新成长'; state.memories = [];
    const restored = restoreContentBackup(state, backup, 'chat-1');
    assert.equal(restored.acts[0].diary, '旧日记');
    assert.equal(restored.characterGrowth.content, '旧成长');
    assert.deepEqual(restored.memories.map(memory => memory.id), ['visible']);
    assert.equal(state.acts[0].diary, '新日记');
    assert.throws(() => restoreContentBackup(state, backup, 'another-chat'), /聊天身份/);
    assert.throws(() => restoreContentBackup(state, { ...backup, diaries: [{ actId: 999, title: '错位', diary: '无对应幕' }] }, 'chat-1'), /对应幕/);
});
