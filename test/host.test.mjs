import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMemory, assignMessageToAct, beginNextAct } from '../core.js';
import { hostFixture } from './helpers/host.mjs';
const memory = (id, content = `事实 ${id}`) => normalizeMemory({ id, title: id, content });

test('host close performs only three independent requests; extraction omits library and character card', async () => {
    const host = await hostFixture(['约好旅行']);
    try {
        host.context.chatMetadata.scene_diary.memories = [memory('OLD_ONLY')];
        await host.api.closeAct();
        assert.equal(host.requests.length, 3); const request = host.requests.find(input => input.jsonSchema.name.endsWith('_memory'));
        const prompt = JSON.stringify(request.prompt); assert.doesNotMatch(prompt, /OLD_ONLY|角色卡不能成为提取素材|消息ID|sources/);
        assert.equal(host.api.getState().pendingTransaction.results.memory.status, 'success');
        host.context.chatMetadata.scene_diary.memories.push(memory('added-during-preview')); host.context.chatMetadata.scene_diary.memoryRevision++;
        await host.api.confirmClose();
        const state = host.api.getState(); assert.equal(state.status, 'pending_next_act'); assert.equal(state.memories.length, 3); assert.equal(state.memories[0].id, 'OLD_ONLY'); assert.equal(state.memories[1].id, 'added-during-preview');
        await host.api.confirmClose(); assert.equal(host.api.getState().memories.length, 3);
    } finally { host.cleanup(); }
});
test('host close rejection and empty memory results preserve act and existing facts', async () => {
    const host = await hostFixture();
    try { host.context.chatMetadata.scene_diary.memories = [memory('old')]; await host.api.closeAct(); host.api.getState().pendingTransaction.results.memory.value.candidates[0].accepted = false; await host.api.confirmClose(); assert.deepEqual(host.api.getState().memories.map(item => item.id), ['old']); }
    finally { host.cleanup(); }
});
test('host maintenance uses only saved entries and applies associations after approval', async () => {
    const host = await hostFixture(['RAW_CHAT_MUST_NOT_APPEAR'], input => {
        assert.doesNotMatch(JSON.stringify(input.prompt), /RAW_CHAT_MUST_NOT_APPEAR|角色卡不能成为提取素材/);
        return { operations: [{ action: 'link', a: 'a', b: 'b', reason: '承诺与实际履行' }] };
    });
    try {
        host.context.chatMetadata.scene_diary.memories = [memory('a', '约好去北海道'), memory('b', '去了北海道')];
        await host.api.startMaintenance(); let state = host.api.getState(); assert.equal(state.maintenanceTransaction.status, 'preview'); assert.equal(state.memoryLinks.length, 0); assert.equal(state.status, 'active');
        await host.api.confirmMaintenance(); state = host.api.getState(); assert.equal(state.memoryLinks.length, 1); assert.equal(state.memories.length, 2); assert.equal(state.maintenanceTransaction, null); assert.equal(state.status, 'active');
    } finally { host.cleanup(); }
});
test('host stale maintenance preview cannot overwrite a changed library', async () => {
    const host = await hostFixture();
    try { host.context.chatMetadata.scene_diary.memories = [memory('a'), memory('b')]; await host.api.startMaintenance(); host.context.chatMetadata.scene_diary.memories.push(memory('new')); host.context.chatMetadata.scene_diary.memoryRevision++; await host.api.confirmMaintenance(); assert.equal(host.api.getState().memories.length, 3); assert.ok(host.notices.some(item => item.text.includes('已变化'))); }
    finally { host.cleanup(); }
});
test('host recall builds exactly one query across act boundaries and without a newest player message', async () => {
    const host = await hostFixture(['一', '二', '三', '四']);
    try { const state = host.api.getState(); beginNextAct(state, host.context.chat[3], 3); host.context.chatMetadata.scene_diary = state; const input = host.api.recallInput(state); assert.equal(input.query, '林: 二\n\n玩家: 三\n\n林: 四'); assert.equal(input.rows.length, 3); }
    finally { host.cleanup(); }
});
test('host embedding and rerank failures give one combined warning, continue generation and retry next time', async () => {
    const host = await hostFixture(['北海道']); let failures = 0;
    try {
        const state = host.api.getState(); state.memories = [memory('北海道')]; state.settings.semantic = { enabled: true, endpoint: 'https://example.test/embeddings', model: 'e', rerank: true, rerankEndpoint: 'https://example.test/rerank', rerankModel: 'r' }; host.context.chatMetadata.scene_diary = state;
        const original = globalThis.fetch; globalThis.fetch = async (url, options) => { if (String(url).startsWith('https:')) { failures++; throw new Error('service down'); } return original(url, options); };
        const prompt = [{ role: 'user', content: '北海道', extra: host.context.chat[0].extra }]; await host.api.sceneDiaryRearrangeChat(prompt, 0, () => assert.fail('fallback must not abort'));
        const warnings = host.notices.filter(item => item.type === 'warning'); assert.equal(warnings.length, 1); assert.match(warnings[0].text, /embedding.*rerank/);
        await host.api.sceneDiaryRearrangeChat(prompt, 0, () => assert.fail()); assert.equal(failures, 4);
    } finally { host.cleanup(); }
});
test('host rerank sees one combined query and keeps grouped recalls', async () => {
    const host = await hostFixture(['北海道', '旅游', '周末']); const calls = [];
    try {
        const state = host.api.getState(); state.memories = [memory('北海道'), memory('邻居')]; state.memoryLinks = [{ a: '北海道', b: '邻居', reason: '发展' }]; state.settings.semantic = { enabled: false, rerank: true, rerankEndpoint: 'https://example.test/rerank', rerankModel: 'r' }; host.context.chatMetadata.scene_diary = state;
        globalThis.fetch = async (_url, options) => { calls.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ results: calls.at(-1).documents.map((document, index) => ({ index, relevance_score: document === state.memories[0].content ? .9 : .1 })) }) }; };
        const result = await host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat'); assert.equal(calls.length, 1); assert.equal(calls[0].query, '玩家: 北海道\n\n林: 旅游\n\n玩家: 周末'); assert.deepEqual(calls[0].documents, state.memories.map(item => item.content)); assert.equal(result.groups.length, 1); assert.equal(result.selected.length, 2);
    } finally { host.cleanup(); }
});

test('host preserves successful batches and retries only unfinished tasks', async () => {
    let failed = false; const requests = [];
    const host = await hostFixture(['raw'], input => {
        requests.push(JSON.stringify(input.prompt));
        if (requests.length === 2 && !failed) { failed = true; throw new Error('429 quota'); }
        return { operations: [] };
    });
    try {
        host.context.chatMetadata.scene_diary.memories = Array.from({ length: 24 }, (_, i) => memory(`id-${i}`, '正文'.repeat(240)));
        await host.api.startMaintenance(); let tx = host.api.getState().maintenanceTransaction; assert.equal(tx.status, 'error'); assert.equal(tx.tasks.filter(task => task.status === 'success').length, 1);
        const count = tx.tasks.length, first = requests[0]; await host.api.runMaintenance(tx.id); tx = host.api.getState().maintenanceTransaction;
        assert.equal(tx.status, 'preview'); assert.equal(requests.length, count + 1); assert.equal(requests.filter(request => request === first).length, 1);
    } finally { host.cleanup(); }
});
test('host cancellation discards a late maintenance response without changing the library', async () => {
    let release, started; const ready = new Promise(resolve => started = resolve), delayed = new Promise(resolve => release = resolve);
    const host = await hostFixture(['raw'], async () => { started(); await delayed; return { operations: [{ action: 'link', a: 'a', b: 'b', reason: '发展' }] }; });
    try {
        host.context.chatMetadata.scene_diary.memories = [memory('a'), memory('b')]; const running = host.api.startMaintenance(); await ready;
        host.context.chatMetadata.scene_diary.maintenanceTransaction = null; release(); await running;
        assert.equal(host.api.getState().maintenanceTransaction, null); assert.deepEqual(host.api.getState().memoryLinks, []);
    } finally { host.cleanup(); }
});
test('host switching chat rejects late maintenance output', async () => {
    let release, started; const ready = new Promise(resolve => started = resolve), delayed = new Promise(resolve => release = resolve);
    const host = await hostFixture(['raw'], async () => { started(); await delayed; return { operations: [{ action: 'link', a: 'a', b: 'b', reason: '发展' }] }; });
    try {
        host.context.chatMetadata.scene_diary.memories = [memory('a'), memory('b')]; const running = host.api.startMaintenance(); await ready;
        const other = structuredClone(host.api.getState()); other.maintenanceTransaction = null; other.memories = [memory('other')];
        host.context.chatId = 'other-chat'; host.context.chatMetadata = { scene_diary: other }; host.api.initializeChat(); release(); await running;
        assert.deepEqual(host.api.getState().memories.map(item => item.id), ['other']); assert.deepEqual(host.api.getState().memoryLinks, []);
    } finally { host.cleanup(); }
});
test('host save failure preserves recoverable close state and recovery does not duplicate memories', async () => {
    const host = await hostFixture();
    try {
        await host.api.closeAct(); const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { throw new Error('disk full'); }; await host.api.confirmClose();
        assert.ok(host.notices.some(item => item.type === 'error' && item.text.includes('disk full')));
        assert.ok([...host.local.keys()].some(key => key.startsWith('scene_diary_recovery')));
        const count = host.api.getState().memories.length; host.context.saveMetadata = save; await host.api.recoverSave();
        assert.equal(host.api.getState().memories.length, count); assert.equal(host.api.getState().status, 'pending_next_act');
        assert.equal([...host.local.keys()].filter(key => key.startsWith('scene_diary_recovery')).length, 0);
    } finally { host.cleanup(); }
});
test('host recovery-copy failure before commit preserves close preview and the unchanged library', async () => {
    const host = await hostFixture();
    try { await host.api.closeAct(); globalThis.SillyTavern.libs.localforage.setItem = async () => { throw new Error('storage unavailable'); }; await host.api.confirmClose(); assert.equal(host.api.getState().status, 'preview'); assert.equal(host.api.getState().memories.length, 0); assert.ok(host.notices.some(item => item.text.includes('预览仍保留'))); }
    finally { host.cleanup(); }
});
test('host body-tag failures abort generation before model calls and report the floor', async () => {
    const host = await hostFixture(['没有标签']);
    try { const state = host.api.getState(); state.settings.extraction.user.bodyTagPairs = [{ open: '<body>', close: '</body>' }]; host.context.chatMetadata.scene_diary = state;
        let aborted = false; await host.api.sceneDiaryRearrangeChat([], 0, () => aborted = true); assert.equal(aborted, true); assert.equal(host.requests.length, 0); assert.ok(host.notices.some(item => item.text.includes('楼层 0')));
    } finally { host.cleanup(); }
});

for (const stage of ['embedding','rerank']) test(`host ${stage}-only failure warns and continues with available results`, async () => {
    const host = await hostFixture(['北海道']);
    try {
        const state = host.api.getState(); state.memories = [memory('北海道')];
        state.settings.semantic = { enabled:stage==='embedding', endpoint:'https://example.test/embeddings', model:'e', rerank:stage==='rerank', rerankEndpoint:'https://example.test/rerank', rerankModel:'r' }; host.context.chatMetadata.scene_diary = state;
        await host.api.sceneDiaryRearrangeChat([{role:'user',content:'北海道',extra:host.context.chat[0].extra}],0,()=>assert.fail());
        const warnings=host.notices.filter(item=>item.type==='warning'); assert.equal(warnings.length,1); assert.ok(warnings[0].text.includes(stage));
    } finally { host.cleanup(); }
});
