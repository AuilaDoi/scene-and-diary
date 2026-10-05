import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildMemoryBlock, normalizeMemory, normalizeState } from '../core.js';
import { memoryText, retrieveMemories, selectRecallGroups, maintenanceMaterial } from '../memory-system.js';
import { cacheKey, indexVectors } from '../semantic.js';
import { createContentBackup, restoreContentBackup } from '../backup.js';
import { hostFixture } from './helpers/host.mjs';

const settings = { recallLimit: 8, memoryTokenBudget: 1200 };
const memory = (id, content, extra = {}) => normalizeMemory({ id, content, title: `维护标题${id}`, ...extra });

test('group context contains content and story time without maintenance fields; budget uses injected text', () => {
    const memories = [memory('a', '两人一起看海。', { storyTime: '周六', category: 'relationship', people: ['隐藏人物'], aliases: ['隐藏别名'] }), memory('b', '回来后整理了照片。')];
    const links = [{ a: 'a', b: 'b', reason: '维护理由'.repeat(60) }];
    const seeds = [{ memory: memories[0], score: 1 }];
    const recall = selectRecallGroups(memories, seeds, settings, links);
    const block = buildMemoryBlock(recall);
    assert.match(block, /两人一起看海。\（故事时间：周六\）/);
    assert.match(block, /回来后整理了照片。/);
    assert.doesNotMatch(block, /维护标题|维护理由|relationship|隐藏人物|隐藏别名/);
    const changed = memories.map(item => ({ ...item, title: '很长的辅助标题'.repeat(100) }));
    const next = selectRecallGroups(changed, [{ memory: changed[0], score: 1 }], settings, [{ ...links[0], reason: '另一个理由' }]);
    assert.equal(buildMemoryBlock(next), block);
    assert.equal(next.budgetUsed, recall.budgetUsed);
    assert.equal(maintenanceMaterial(memories[0]).title, memories[0].title);
});

test('lexical retrieval searches content only and ignores title, people, aliases and story time', () => {
    const entry = memory('a', '一起喝薄荷茶。', { title: '北海道', people: ['小明'], aliases: ['兔兔'], storyTime: '圣诞节' });
    for (const query of ['北海道', '小明', '兔兔', '圣诞节']) assert.deepEqual(retrieveMemories([entry], query, settings).selected, []);
    assert.equal(retrieveMemories([entry], '薄荷茶', settings).selected[0].memory.id, 'a');
    assert.equal(memoryText(entry), entry.content);
});

test('embedding cache excludes maintenance fields and replaces old mixed-field namespace', async () => {
    const entry = memory('a', '一起喝薄荷茶。');
    const identity = { account: 'a', chat: 'c', space: 's' }, config = { endpoint: 'https://example.test/embeddings', model: 'm' };
    const key = cacheKey(identity, config, entry);
    assert.ok(key.startsWith('content-only-v1|'));
    assert.equal(cacheKey(identity, config, { ...entry, title: '新标题', aliases: ['别名'], people: ['人物'], storyTime: '周末' }), key);
    assert.notEqual(cacheKey(identity, config, { ...entry, content: '不同事实' }), key);
    const original = { indexedDB: globalThis.indexedDB, fetch: globalThis.fetch };
    const stored = new Map(), requests = [];
    globalThis.indexedDB = { open() {
        const request = {};
        queueMicrotask(() => {
            request.result = { close() {}, transaction() {
                const tx = { objectStore() { return {
                    get(key) { const result = {}; queueMicrotask(() => { result.result = stored.get(key); result.onsuccess(); }); return result; },
                    put(value, key) { stored.set(key, value); queueMicrotask(() => tx.oncomplete()); },
                }; } }; return tx;
            } }; request.onsuccess();
        }); return request;
    } };
    globalThis.fetch = async (_url, init) => { requests.push(JSON.parse(init.body)); return { ok: true, json: async () => ({ data: [{ index: 0, embedding: [1, 0] }] }) }; };
    try {
        await indexVectors([entry], identity, config, '');
        assert.deepEqual(requests[0].input, [entry.content]);
        await indexVectors([{ ...entry, title: '新标题' }], identity, config, '');
        assert.equal(requests.length, 1);
        assert.deepEqual(retrieveMemories([entry], '无关键词', settings, { queryVector: [1, 0], vectors: new Map([['a', stored.get(key)]]) }).selected.map(item => item.memory.id), ['a']);
    } finally { Object.assign(globalThis, original); }
});

test('legacy disabled flag is removed on normalization and backup restore; entry participates in recall', () => {
    const state = normalizeState({ version: 5, memories: [{ id: 'a', title: '辅助标题', content: '一起喝薄荷茶。', disabled: true }] });
    assert.equal('disabled' in state.memories[0], false);
    assert.equal(retrieveMemories(state.memories, '薄荷茶', settings).selected.length, 1);
    const backup = createContentBackup(state, 'test-chat'); backup.memories[0].disabled = true;
    assert.equal('disabled' in restoreContentBackup(state, backup, 'test-chat').memories[0], false);
});

test('manual deletion mutation persists incident-link cleanup, keeps unrelated links and invalidates recall', async () => {
    const host = await hostFixture(['薄荷茶']);
    try {
        const state = host.api.getState();
        state.memories = ['a', 'b', 'c', 'd'].map(id => memory(id, id === 'b' ? '一起喝薄荷茶。' : `独立事实${id}`));
        state.memoryLinks = [{ a: 'a', b: 'b', reason: '第一条' }, { a: 'b', b: 'c', reason: '第二条' }, { a: 'c', b: 'd', reason: '保留关联' }];
        host.context.chatMetadata.scene_diary = state;
        const before = await host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat');
        assert.equal(before.selected.length, 3);
        await host.api.commitMemoryMutation(draft => { draft.memories = draft.memories.filter(item => item.id !== 'b'); });
        const after = host.api.getState();
        assert.deepEqual(after.memoryLinks, [{ a: 'c', b: 'd', reason: '保留关联' }]);
        assert.equal(after.memoryRevision, state.memoryRevision + 1);
        assert.deepEqual(host.saved.get('persisted').scene_diary.memoryLinks, after.memoryLinks);
        assert.equal((await host.api.prepareContinuity(after, host.api.recallInput(after), 'test-chat')).selected.length, 0);
        const source = await readFile(new URL('../index.js', import.meta.url), 'utf8');
        assert.doesNotMatch(source, /data-memory-field="disabled"/);
        assert.match(source, /action === 'delete-memory'.*commitMemoryMutation/);
    } finally { host.cleanup(); }
});
