import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { hostFixture } from './helpers/host.mjs';
import { normalizeMemory } from '../core.js';
const require = createRequire(import.meta.url);
const { parse: parseYaml } = require('yaml');
const jsonDependencies = async () => ({ parseYaml, host: {
    getChatCompletionModel: settings => settings.model,
    createGenerationParameters: async (settings, model, type, messages) => ({ generate_data: { ...settings, model, type, messages } }),
    getAdditionalParametersForSource: () => ({ include_body: '', exclude_body: '', include_headers: '' }),
} });
const refused = () => new Response(JSON.stringify({ error: { message: 'validation error: this response_format type is unavailable now.' } }), { status: 502 });
function kindOf(input) {
    const prompt = JSON.stringify(input.messages);
    if (prompt.includes('characterGrowth')) return 'growth';
    if (prompt.includes('memories')) return 'memory';
    return 'diary';
}
function outputFor(kind) {
    if (kind === 'growth') return { characterGrowth: '两人逐渐熟悉。' };
    if (kind === 'diary') return { title: '一幕', diary: '今天一起聊天。' };
    return { memories: [{ category: 'event', title: '约定', content: '两人约好旅行。', people: [], aliases: [], importance: 3, storyTime: null }] };
}

test('Tauri close uses the existing bridge and only the rejected part changes format', async () => {
    const host = await hostFixture(['约好旅行'], input => {
        const kind = kindOf(input);
        return kind === 'memory' && input.response_format.type === 'json_schema' ? refused() : outputFor(kind);
    }, { tauri: true, jsonDependencies });
    try {
        await host.api.closeAct();
        const state = host.api.getState();
        assert.equal(state.status, 'preview');
        assert.deepEqual(Object.values(state.pendingTransaction.results).map(result => result.status), ['success', 'success', 'success']);
        assert.equal(host.requests.length, 4);
        assert.deepEqual(host.requests.filter(input => kindOf(input) === 'memory').map(input => input.response_format.type), ['json_schema', 'json_object']);
        assert.equal(host.requests.filter(input => kindOf(input) === 'diary').length, 1);
        assert.equal(host.requests.filter(input => kindOf(input) === 'growth').length, 1);
        assert.ok(host.requests.every(input => input.type === 'quiet' && input.stream === false && input.json_schema === null));
        assert.equal(state.memories.length, 0); // Requests produce previews; approval still owns persistence.
        await host.api.confirmClose();
        assert.equal(host.api.getState().memories.length, 1);
    } finally { host.cleanup(); }
});

test('Tauri double rejection preserves other previews and manual retry requests only the failed part', async () => {
    let rejectMemory = true;
    const host = await hostFixture(['约定'], input => kindOf(input) === 'memory' && rejectMemory ? refused() : outputFor(kindOf(input)), { tauri: true, jsonDependencies });
    try {
        await host.api.closeAct();
        let state = host.api.getState();
        assert.equal(state.pendingTransaction.results.memory.status, 'error');
        assert.match(state.pendingTransaction.results.memory.error, /拒绝两种 JSON 格式/);
        assert.equal(state.pendingTransaction.results.diary.status, 'success');
        assert.equal(state.pendingTransaction.results.growth.status, 'success');
        rejectMemory = false;
        const previous = host.requests.length;
        await host.api.runCloseParts(state.pendingTransaction.id, ['memory']);
        state = host.api.getState();
        assert.equal(state.pendingTransaction.results.memory.status, 'success');
        assert.equal(host.requests.length, previous + 1);
        assert.equal(kindOf(host.requests.at(-1)), 'memory');
        assert.equal(host.requests.at(-1).response_format.type, 'json_schema');
    } finally { host.cleanup(); }
});

test('Tauri close extraction remains independent of edits to the saved library and appends to its latest state', async () => {
    let host;
    host = await hostFixture(['旅行'], input => {
        if (kindOf(input) === 'memory') {
            const state = host.context.chatMetadata.scene_diary;
            state.memories.push(normalizeMemory({ id: 'saved-during-generation', title: '手工记录', content: '手工保存的独立事实' }));
            state.memoryRevision++;
        }
        return outputFor(kindOf(input));
    }, { tauri: true, jsonDependencies });
    try {
        await host.api.closeAct();
        const transaction = host.api.getState().pendingTransaction;
        assert.ok(Object.values(transaction.results).every(result => result.status === 'success'));
        await host.api.confirmClose();
        const memories = host.api.getState().memories;
        assert.equal(memories.length, 2);
        assert.equal(memories.find(memory => memory.id === 'saved-during-generation').content, '手工保存的独立事实');
        assert.equal(host.requests.length, 3);
    } finally { host.cleanup(); }
});

test('Tauri cancellation aborts the bridge and prevents a rejected late response from starting object mode', async () => {
    let release, signal;
    const blocked = new Promise(resolve => { release = resolve; });
    let started; const ready = new Promise(resolve => { started = resolve; });
    const host = await hostFixture(['约定'], async (input, _count, init) => {
        const kind = kindOf(input);
        if (kind === 'memory') { signal = init.signal; started(); await blocked; return refused(); }
        return outputFor(kind);
    }, { tauri: true, jsonDependencies });
    try {
        const running = host.api.closeAct(); await ready;
        host.api.cancelClose(); assert.equal(signal.aborted, true);
        release(); await running;
        const state = host.api.getState();
        assert.equal(state.pendingTransaction, null); assert.equal(state.status, 'active');
        assert.equal(host.requests.filter(input => kindOf(input) === 'memory').length, 1);
        assert.equal(state.memories.length, 0);
    } finally { release(); host.cleanup(); }
});

test('Tauri changed business input and current connection prevent automatic retries', async () => {
    for (const mutate of ['source', 'connection', 'chat']) {
        let host;
        host = await hostFixture(['约定'], input => {
            if (kindOf(input) === 'memory') {
                if (mutate === 'source') host.context.chat[0].mes = '修改后的内容';
                if (mutate === 'connection') host.context.chatCompletionSettings.model = 'other-model';
                if (mutate === 'chat') { host.context.chatId = 'another-chat'; host.api.initializeChat(); }
                return refused();
            }
            return outputFor(kindOf(input));
        }, { tauri: true, jsonDependencies });
        try {
            await host.api.closeAct();
            assert.equal(host.requests.filter(input => kindOf(input) === 'memory').length, 1, mutate);
            assert.equal(host.api.getState().memories.length, 0);
        } finally { host.cleanup(); }
    }
});

test('Tauri maintenance retains per-proposal tolerance and explicit partial approval', async () => {
    const host = await hostFixture(['原文不应送入整理'], () => ({ operations: [
        { action: 'link', a: 'a', b: 'b', reason: '发展' },
        { action: 'link', a: 'a', b: 'missing', reason: '无效目标' },
    ] }), { tauri: true, jsonDependencies });
    try {
        const state = host.api.getState();
        state.memories = ['a', 'b'].map(id => normalizeMemory({ id, title: id, content: `事实 ${id}` }));
        host.context.chatMetadata.scene_diary = state;
        await host.api.startMaintenance('full');
        const transaction = host.api.getState().maintenanceTransaction;
        assert.equal(transaction.status, 'preview'); assert.equal(transaction.operations.length, 1);
        assert.equal(transaction.tasks[0].rejected.length, 1); assert.equal(host.requests.length, 1);
        assert.doesNotMatch(JSON.stringify(host.requests[0].messages), /原文不应送入整理/);
        await host.api.confirmMaintenance();
        assert.equal(host.api.getState().memoryLinks.length, 0);
        assert.equal(host.api.getState().memoryOrganization, null);
        await host.api.confirmMaintenance(true);
        assert.equal(host.api.getState().memoryLinks.length, 1);
    } finally { host.cleanup(); }
});

test('unsupported Tauri wire format fails before paid generation and leaves facts readable', async () => {
    const host = await hostFixture(['内容'], () => assert.fail('must not send'), { tauri: true, jsonDependencies });
    try {
        host.context.chatCompletionSettings.chat_completion_source = 'custom';
        host.context.chatCompletionSettings.custom_api_format = 'claude_messages';
        await host.api.closeAct();
        assert.equal(host.requests.length, 0);
        assert.equal(host.api.getState().status, 'preview');
        assert.match(host.api.getState().pendingTransaction.results.memory.error, /上游协议/);
    } finally { host.cleanup(); }
});

test('Tauri maintenance cancellation aborts in-flight work without object retry or baseline writes', async () => {
    let release, started, signal;
    const blocked = new Promise(resolve => { release = resolve; });
    const ready = new Promise(resolve => { started = resolve; });
    const host = await hostFixture(['原文'], async (_input, _count, init) => { signal = init.signal; started(); await blocked; return refused(); }, { tauri: true, jsonDependencies });
    try {
        const state = host.api.getState(); state.memories = ['a', 'b'].map(id => normalizeMemory({ id, title: id, content: id }));
        host.context.chatMetadata.scene_diary = state;
        const running = host.api.startMaintenance('full'); await ready;
        host.api.cancelMaintenance(); assert.equal(signal.aborted, true);
        release(); await running;
        assert.equal(host.requests.length, 1);
        assert.equal(host.api.getState().maintenanceTransaction, null);
        assert.equal(host.api.getState().memoryOrganization, null);
        assert.equal(host.api.getState().memories.length, 2);
    } finally { release(); host.cleanup(); }
});

test('Tauri library changes during maintenance prevent accepting a late response', async () => {
    let host;
    host = await hostFixture(['原文'], () => {
        host.context.chatMetadata.scene_diary.memoryRevision++;
        return { operations: [{ action: 'link', a: 'a', b: 'b', reason: '发展' }] };
    }, { tauri: true, jsonDependencies });
    try {
        const state = host.api.getState(); state.memories = ['a', 'b'].map(id => normalizeMemory({ id, title: id, content: id }));
        host.context.chatMetadata.scene_diary = state;
        await host.api.startMaintenance('full');
        assert.equal(host.requests.length, 1);
        assert.equal(host.api.getState().maintenanceTransaction.status, 'error');
        assert.equal(host.api.getState().memoryLinks.length, 0);
        assert.equal(host.api.getState().memoryOrganization, null);
    } finally { host.cleanup(); }
});
