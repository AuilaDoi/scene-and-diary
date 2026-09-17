import test from 'node:test';
import assert from 'node:assert/strict';
import {
    assignMessageToAct,
    beginNextAct,
    buildMemoryBlock,
    commitClosedAct,
    createState,
    extractSceneTime,
    extractStoryText,
    filterPromptMessages,
    markClosing,
    parseDiaryResponse,
} from '../core.js';

test('scene transition assigns the first next-scene user message', () => {
    const state = createState(1);
    const first = { is_user: true, mes: '第一幕', extra: {} };
    assignMessageToAct(state, first, 1, 0);
    state.acts[0].status = 'closed';
    state.status = 'pending_next_act';
    const next = { is_user: true, mes: '第二幕', extra: {} };
    beginNextAct(state, next, 1);
    assert.equal(state.currentActId, 2);
    assert.equal(next.extra.scene_diary.actId, 2);
});

test('diary response is parsed and normalized', () => {
    const result = parseDiaryResponse('```json\n{"title":"雨夜","diary":"我记得那场雨。","handoff":{"location":"旅馆","ongoingPlans":["去海边"]}}\n```');
    assert.equal(result.title, '雨夜');
    assert.deepEqual(result.handoff.ongoingPlans, ['去海边']);
});

test('scene time and plot extraction ignore presentation tags', () => {
    assert.equal(extractSceneTime('<draft>x</draft><scene_time>2026-09-17T20:17|星期三|夜|雨</scene_time>'), '2026-09-17T20:17');
    assert.equal(extractStoryText('<thinking>secret</thinking><now_plot>两人走进雨里。</now_plot>'), '两人走进雨里。');
});

test('prompt filtering keeps system messages and only the current scene', () => {
    const oldMessage = { mes: 'old', extra: { scene_diary: { actId: 1 } } };
    const currentMessage = { mes: 'current', extra: { scene_diary: { actId: 2 } } };
    const systemMessage = { is_system: true, mes: 'system' };
    assert.deepEqual(filterPromptMessages([oldMessage, systemMessage, currentMessage], 2), [systemMessage, currentMessage]);
});

test('memory block uses old-to-new diary order', () => {
    const state = createState(1);
    state.acts[0].status = 'closed';
    state.acts[0].title = '第一幕';
    state.acts[0].diary = '旧日记';
    state.acts.push({ ...createState(1).acts[0], id: 2, status: 'closed', title: '第二幕', diary: '新日记' });
    state.currentActId = 2;
    state.acts.push({ ...createState(1).acts[0], id: 3, status: 'active' });
    state.currentActId = 3;
    const block = buildMemoryBlock(state, { recentDiaryCount: 5 });
    assert.ok(block.indexOf('旧日记') < block.indexOf('新日记'));
});

test('closing transaction can be committed', () => {
    const state = createState(1);
    const message = { is_user: true, mes: '内容', extra: {} };
    assignMessageToAct(state, message, 1, 0);
    markClosing(state, 'close_1', [message]);
    commitClosedAct(state, { title: '结束', diary: '记下了。', handoff: {} }, 0);
    assert.equal(state.status, 'pending_next_act');
    assert.equal(state.acts[0].diary, '记下了。');
});

