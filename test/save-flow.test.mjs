import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, normalizeMemory } from '../core.js';
import { createContentBackup } from '../backup.js';
import { hostFixture } from './helpers/host.mjs';

const memory = id => normalizeMemory({ id, title: id, content: `事实 ${id}` });
const seed = host => {
    const state = host.api.getState();
    state.memories = ['a', 'b', 'c'].map(memory);
    state.memoryLinks = [{ a: 'a', b: 'b', reason: '解除' }, { a: 'b', b: 'c', reason: '保留' }];
    return state;
};
const deferred = () => { let resolve; const promise = new Promise(done => resolve = done); return { promise, resolve }; };

test('unlink saves only the changed graph through the host, without file reads or local recovery storage', async () => {
    const host = await hostFixture();
    try {
        const before = seed(host), memories = structuredClone(before.memories);
        let network = 0, storage = 0;
        globalThis.fetch = async () => { network++; throw new Error('chat readback unavailable'); };
        for (const method of ['getItem', 'setItem', 'removeItem']) globalThis.SillyTavern.libs.localforage[method] = async () => { storage++; throw new Error('local storage unavailable'); };
        const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { host.api.initializeChat(); await save(); };
        // Missing avatar/file metadata no longer prevents a normal host save.
        host.context.characters = [];
        await host.api.commitMemoryMutation(draft => { draft.memoryLinks = draft.memoryLinks.filter(link => link.a !== 'a'); });
        assert.deepEqual(host.api.getState().memories, memories);
        assert.deepEqual(host.api.getState().memoryLinks, [{ a: 'b', b: 'c', reason: '保留' }]);
        assert.equal(host.api.getState().memoryRevision, before.memoryRevision + 1);
        assert.deepEqual(host.saved.get('persisted').scene_diary, host.api.getState());
        assert.equal(host.events.filter(event => event.type === 'save').length, 1);
        assert.equal(network, 0); assert.equal(storage, 0);
        assert.equal(host.api.hostStatus().disabledReason, ''); assert.equal(host.api.hostStatus().saveError, '');
    } finally { host.cleanup(); }
});

test('a failed memory save stays editable; retry saves all current edits rather than an old snapshot', async () => {
    const host = await hostFixture();
    try {
        seed(host);
        const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { throw new Error('disk full'); };
        await host.api.commitMemoryMutation(draft => { draft.memoryLinks = []; });
        await host.api.commitMemoryMutation(draft => { draft.memories[0].content = '失败后修改的事实'; });
        assert.equal(host.api.hostStatus().disabledReason, '');
        assert.match(host.api.hostStatus().saveError, /disk full/);
        assert.equal(host.api.getState().memories[0].content, '失败后修改的事实');
        assert.equal(host.local.size, 0);
        host.context.saveMetadata = save;
        await host.api.retrySave();
        assert.deepEqual(host.saved.get('persisted').scene_diary, host.api.getState());
        assert.equal(host.api.hostStatus().saveError, '');
        assert.equal(host.api.getState().memoryRevision, 2);
    } finally { host.cleanup(); }
});

test('background save failures report once and can be retried using the host saveChat fallback', async () => {
    const host = await hostFixture();
    try {
        const save = host.context.saveMetadata;
        delete host.context.saveMetadata;
        void host.api.saveState();
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.match(host.api.hostStatus().saveError, /宿主保存接口不可用/);
        assert.equal(host.notices.filter(item => item.type === 'error').length, 1);
        host.context.saveChat = save;
        await host.api.retrySave();
        assert.deepEqual(host.saved.get('persisted').scene_diary, host.api.getState());
        assert.equal(host.api.hostStatus().saveError, '');
    } finally { host.cleanup(); }
});

test('save errors stay visible without disabling editing and disappear after a successful retry', async () => {
    const host = await hostFixture();
    try {
        const message = { textContent: '' }, banner = { hidden: true, querySelector: () => message };
        globalThis.document.querySelector = selector => selector === '#scene_diary_panel [data-save-status]' ? banner : null;
        const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { throw new Error('<disk full>'); };
        await assert.rejects(host.api.saveState(), /disk full/);
        assert.equal(banner.hidden, false); assert.match(message.textContent, /<disk full>/);
        assert.equal(host.api.hostStatus().disabledReason, '');
        host.context.saveMetadata = save; await host.api.retrySave();
        assert.equal(banner.hidden, true); assert.equal(message.textContent, '');
    } finally { host.cleanup(); }
});

test('a failed close startup makes no model call and preserves a retryable preview', async () => {
    const host = await hostFixture();
    try {
        const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { throw new Error('disk full'); };
        await host.api.closeAct();
        assert.equal(host.requests.length, 0); assert.equal(host.api.getState().status, 'preview');
        assert.equal(host.api.hostStatus().disabledReason, '');
        const id = host.api.getState().pendingTransaction.id;
        host.context.saveMetadata = save; await host.api.runCloseParts(id, ['diary', 'memory', 'growth']);
        assert.equal(host.requests.length, 3);
        assert.ok(Object.values(host.api.getState().pendingTransaction.results).every(result => result.status === 'success'));
        // Startup and preview each save once; no separate verified startup save remains.
        assert.equal(host.events.filter(event => event.type === 'save').length, 2);
    } finally { host.cleanup(); }
});

test('queued saves are serialized and skip an old chat after its metadata object is replaced', async () => {
    const host = await hostFixture();
    try {
        const started = deferred(), release = deferred(), calls = [];
        host.context.saveMetadata = async () => { calls.push(structuredClone(host.context.chatMetadata)); started.resolve(); await release.promise; };
        const running = host.api.saveState(); await started.promise;
        const queued = host.api.saveState();
        const next = createState(); next.memories = [memory('other')];
        // Reopening the same chat ID also replaces metadata; old queued work must not save it.
        host.context.chatMetadata = { scene_diary: next };
        release.resolve();
        assert.equal(await running, false); assert.equal(await queued, false);
        assert.equal(calls.length, 1);
        assert.deepEqual(host.context.chatMetadata.scene_diary.memories.map(item => item.id), ['other']);
        const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { calls.push(structuredClone(host.context.chatMetadata)); };
        assert.equal(await host.api.saveState(), true);
        assert.equal(calls.length, 2);
        host.context.saveMetadata = save;
    } finally { host.cleanup(); }
});

test('a late save error from the previous chat does not disable or mark the current chat as failed', async () => {
    const host = await hostFixture();
    try {
        const started = deferred(), release = deferred();
        host.context.saveMetadata = async () => { started.resolve(); await release.promise; throw new Error('old chat failure'); };
        const saving = host.api.saveState(); await started.promise;
        host.context.chatId = 'other-chat'; host.context.chatMetadata = { scene_diary: createState() }; host.api.initializeChat();
        release.resolve(); await assert.rejects(saving, /old chat failure/);
        assert.equal(host.api.hostStatus().disabledReason, ''); assert.equal(host.api.hostStatus().saveError, '');
        assert.equal(host.notices.length, 0);
    } finally { host.cleanup(); }
});

test('legacy copies do not gate initialization or ordinary edits, and recovery requires confirmation', async () => {
    const saved = new Map([['scene_diary_account_id', 'account']]);
    const host = await hostFixture([], null, { saved });
    try {
        const state = seed(host), copyKey = `scene_diary_recovery_account_test-chat_${state.memorySpaceId}`;
        const raw = structuredClone(state); raw.memories[0].content = '旧副本内容'; host.local.set(copyKey, raw);
        let reads = 0, confirmations = 0;
        const read = globalThis.SillyTavern.libs.localforage.getItem;
        globalThis.SillyTavern.libs.localforage.getItem = async key => { reads++; return read(key); };
        host.api.initializeChat();
        await host.api.commitMemoryMutation(draft => { draft.memoryLinks = []; });
        assert.equal(reads, 0); assert.equal(host.api.hostStatus().disabledReason, '');
        globalThis.confirm = () => { confirmations++; return false; };
        await host.api.recoverSave();
        assert.equal(confirmations, 1); assert.equal(reads, 1);
        assert.notEqual(host.api.getState().memories[0].content, raw.memories[0].content);
        assert.deepEqual(host.local.get(copyKey), raw);
        globalThis.confirm = () => true;
        await host.api.recoverSave();
        assert.equal(host.api.getState().memories[0].content, raw.memories[0].content);
        assert.equal(host.local.has(copyKey), false);
        assert.deepEqual(host.saved.get('persisted').scene_diary, host.api.getState());
    } finally { host.cleanup(); }
});

test('legacy recovery preserves its copy on host failure and cleanup failure never locks saved content', async () => {
    const host = await hostFixture();
    try {
        const state = seed(host), account = host.context.accountStorage.getItem('scene_diary_account_id');
        const copyKey = `scene_diary_recovery_${account || 'account'}_test-chat_${state.memorySpaceId}`;
        host.context.accountStorage.setItem('scene_diary_account_id', account || 'account');
        host.local.set(copyKey, structuredClone(state));
        const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { throw new Error('disk full'); };
        await host.api.recoverSave();
        assert.equal(host.local.has(copyKey), true); assert.equal(host.api.hostStatus().disabledReason, '');
        host.context.saveMetadata = save;
        globalThis.SillyTavern.libs.localforage.removeItem = async () => { throw new Error('cleanup unavailable'); };
        await host.api.recoverSave();
        assert.equal(host.api.hostStatus().saveError, ''); assert.equal(host.api.hostStatus().disabledReason, '');
        assert.deepEqual(host.saved.get('persisted').scene_diary, host.api.getState());
        assert.ok(host.notices.some(item => item.type === 'warning' && /旧副本未能清理/.test(item.text)));
    } finally { host.cleanup(); }
});

test('content import uses the same save path and keeps imported content available after a host failure', async () => {
    const host = await hostFixture();
    try {
        const state = seed(host), backup = createContentBackup(state, 'test-chat');
        backup.memories[0].content = '导入的事实';
        const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { throw new Error('disk full'); };
        await host.api.importContent({ text: async () => JSON.stringify(backup) });
        assert.equal(host.api.getState().memories[0].content, '导入的事实');
        assert.equal(host.api.hostStatus().disabledReason, ''); assert.match(host.api.hostStatus().saveError, /disk full/);
        host.context.saveMetadata = save; await host.api.retrySave();
        assert.deepEqual(host.saved.get('persisted').scene_diary, host.api.getState()); assert.equal(host.local.size, 0);
    } finally { host.cleanup(); }
});
