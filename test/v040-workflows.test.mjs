import test from 'node:test';
import assert from 'node:assert/strict';
import { diary, fact, newState } from '../state-v7.js';
import { proposeGraph, rebuildGrowth } from '../tasks-v7.js';
import { createRetrieval } from '../recall-v7.js';

test('global growth reads all valid full diaries and ignores outdated summaries and source-review drafts', async () => {
    const state = newState();
    state.characterGrowth.content = '原有画像';
    state.diaries = [
        diary({ title: '初期', body: '早期变化标记' + '甲'.repeat(12000), summary: '不读旧摘要', createdAt: 50 }),
        diary({ title: '后期', body: '后期变化标记' + '乙'.repeat(12000), createdAt: 80 }),
        diary({ title: '待复核', body: '不要混入待复核日记', needsReview: true }),
    ];
    const calls = [];
    const request = async (_task, prompt, schema) => {
        calls.push(prompt);
        if (schema.name === 'scene_diary_summary') return { summary: prompt.includes('早期变化标记') ? '早期阶段' : '本轮阶段' };
        return { changed: true, content: '经复核的当前画像' };
    };
    const current = await rebuildGrowth(state, { context: '初始设定' }, request, () => {});
    assert.equal(current, '经复核的当前画像');
    assert.equal(state.characterGrowth.content, '原有画像');
    assert(calls.some(prompt => prompt.includes('早期变化标记')));
    assert(calls.some(prompt => prompt.includes('后期变化标记')));
    assert(calls.every(prompt => !/不读旧摘要|不要混入待复核日记/.test(prompt)));
    assert(calls.at(-1).includes('原有画像'));
});

test('incremental graph proposals stay within pairs anchored on new and edited facts', async () => {
    const state = newState();
    const entry = id => fact({ id, category: 'place', title: id, content: '红木楼梯连接图书馆 ' + id });
    state.memories = ['a', 'b'].map(entry);
    const make = (from, to) => ({ from, to, type: 'part_of', reason: '两条事实明确给出组成关系' });
    let proposals = [make('a', 'b')];
    const request = async () => ({ edges: proposals });
    const rank = () => createRetrieval(state, {}, () => {}, null, { localOnly: true });
    const first = await proposeGraph(state, 'full', request, rank(), () => {});
    assert.deepEqual(first.edges.map(edge => [edge.from, edge.to]), [['a', 'b']]);
    state.graphReviewed = first.reviewed;
    state.edges = first.edges;
    state.memories.push(entry('c'));
    state.memoryRevision++;
    proposals = [make('c', 'a'), make('b', 'a')];
    const next = await proposeGraph(state, 'incremental', request, rank(), () => {});
    assert.deepEqual(next.edges.map(edge => [edge.from, edge.to]), [['c', 'a']]);
    assert.equal(state.edges.length, 1);
});
