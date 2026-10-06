import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hostFixture } from './helpers/host.mjs';
import { createContentBackup, restoreContentBackup } from '../backup.js';
import { fingerprint, normalizeState } from '../core.js';
import { validateCandidateBatch } from '../memory-system.js';

// Generated using the actual v0.3.1 tag, rather than approximating schema 4 by hand.
const fixture = JSON.parse(await readFile(new URL('./fixtures/v031-chat.json', import.meta.url), 'utf8'));
const previewMetadata = structuredClone(fixture.metadata);
previewMetadata.scene_diary.status = 'preview'; previewMetadata.scene_diary.acts[1].status = 'closing';
previewMetadata.scene_diary.pendingTransaction = fixture.previewTransaction;
const removedFields = ['sources', 'sourceActId', 'sourceMessageIds', 'lifecycle', 'supersedes', 'mergedInto', 'revision', 'status', 'dirty', 'reviewRecommended', 'sourceFingerprint', 'disabled'];
const keptFields = ['id', 'title', 'content', 'category', 'people', 'aliases', 'importance', 'storyTime', 'createdAt', 'updatedAt', 'timezoneOffset', 'edited', 'locked', 'permanent', 'customNote'];
const retained = fixture.metadata.scene_diary.memories.filter(memory => !memory.deletedAt && !['archived', 'superseded'].includes(memory.lifecycle));
const migrationCopies = host => [...host.local.entries()].filter(([key]) => key.startsWith('scene_diary_migration_backup_'));
const recoveryCopies = host => [...host.local.entries()].filter(([key]) => key.startsWith('scene_diary_recovery_'));
function assertRetained(state) {
    assert.equal(state.version, 5);
    assert.deepEqual(state.memories.map(memory => memory.id), retained.map(memory => memory.id));
    for (const memory of state.memories) {
        const old = retained.find(item => item.id === memory.id);
        for (const field of keptFields) assert.deepEqual(memory[field], old[field], `${memory.id}.${field}`);
        for (const field of removedFields) assert.equal(field in memory, false, `${memory.id}.${field} must be removed`);
    }
    assert.deepEqual(state.memoryLinks, []);
    assert.equal('maintenanceHistory' in state, false);
    assert.equal(state.memoryRevision, 17);
    assert.equal(state.memorySpaceId, 'space-v031');
    assert.deepEqual(state.characterGrowth, fixture.metadata.scene_diary.characterGrowth);
    assert.deepEqual(state.settings, { ...fixture.metadata.scene_diary.settings, recallScoreThreshold: 0.3 });
}
const legacyHost = options => hostFixture([], null, { metadata: fixture.metadata, chat: fixture.messages, initialize: false, ...options });

test('v0.3.1 host update backs up original chat before migration, verifies schema 5 save and survives reload', async () => {
    const host = await legacyHost();
    let metadata, saved, local;
    try {
        const raw = host.context.chatMetadata;
        assert.equal(host.api.initializeChat(), null);
        assert.equal(host.api.getState(), null);
        assert.deepEqual(raw, fixture.metadata);
        await host.settle();
        assertRetained(host.api.getState());
        assert.deepEqual(host.api.getState().acts, fixture.metadata.scene_diary.acts);
        assert.deepEqual(host.context.chat, fixture.messages);
        assert.deepEqual(host.context.chatMetadata.other_extension, fixture.metadata.other_extension);
        assert.equal(host.api.hostStatus().disabledReason, '');
        assert.equal(host.api.hostStatus().saveUnverified, false);
        const copies = migrationCopies(host); assert.equal(copies.length, 1);
        assert.match(copies[0][0], /_schema4_to5$/);
        assert.deepEqual(copies[0][1].metadata, fixture.metadata);
        assert.deepEqual(copies[0][1].messages, fixture.messages);
        assert.equal(host.events[0].type, 'local-copy'); assert.equal(host.events[0].schema, 4);
        assert.ok(host.events[0].key.startsWith('scene_diary_migration_backup_'));
        assert.equal(host.events.find(event => event.type === 'save').schema, 5);
        assert.equal(recoveryCopies(host).length, 0);
        metadata = structuredClone(host.saved.get('persisted')); saved = host.saved; local = host.local;
        assert.deepEqual(metadata.scene_diary, host.api.getState());
    } finally { host.cleanup(); }
    const reloaded = await legacyHost({ metadata, saved, local });
    try {
        reloaded.api.initializeChat(); await reloaded.settle();
        assertRetained(reloaded.api.getState());
        assert.equal(migrationCopies(reloaded).length, 1);
        assert.deepEqual(reloaded.context.chatMetadata, metadata);
        assert.equal(reloaded.events.filter(event => event.type === 'save').length, 0);
    } finally { reloaded.cleanup(); }
});

test('v0.3.1 migration backup failure leaves original metadata untouched and can retry', async () => {
    const host = await legacyHost();
    try {
        const store = globalThis.SillyTavern.libs.localforage, write = store.setItem;
        store.setItem = async () => { throw new Error('quota exceeded'); };
        host.api.initializeChat(); await host.settle();
        assert.equal(host.api.getState(), null);
        assert.deepEqual(host.context.chatMetadata, fixture.metadata);
        assert.equal(host.saved.has('persisted'), false);
        assert.match(host.api.hostStatus().disabledReason, /迁移备份失败/);
        store.setItem = write; host.api.initializeChat(); await host.settle();
        assertRetained(host.api.getState()); assert.equal(host.api.hostStatus().disabledReason, '');
    } finally { host.cleanup(); }
});

for (const failure of ['save', 'readback', 'recovery-copy']) test(`v0.3.1 migration ${failure} failure keeps backups and recovers without losing or duplicating facts`, async () => {
    const host = await legacyHost();
    let metadata, local, saved;
    try {
        const save = host.context.saveMetadata, fetch = globalThis.fetch;
        const store = globalThis.SillyTavern.libs.localforage, write = store.setItem;
        if (failure === 'save') host.context.saveMetadata = async () => { throw new Error('disk full'); };
        if (failure === 'readback') globalThis.fetch = async () => ({ ok: true, json: async () => [{ chat_metadata: fixture.metadata }, ...fixture.messages] });
        if (failure === 'recovery-copy') store.setItem = async (key, value) => { if (key.startsWith('scene_diary_recovery_')) throw new Error('quota exceeded'); return write(key, value); };
        host.api.initializeChat(); await host.settle();
        assertRetained(host.api.getState()); assert.equal(host.api.hostStatus().saveUnverified, true);
        assert.match(host.api.hostStatus().disabledReason, /迁移保存未核验/);
        assert.deepEqual(migrationCopies(host)[0][1].metadata, fixture.metadata);
        const expectedCopy = failure === 'recovery-copy' ? 0 : 1;
        assert.equal(recoveryCopies(host).length, expectedCopy);
        host.context.saveMetadata = save; globalThis.fetch = fetch; store.setItem = write;
        if (failure === 'recovery-copy') { host.api.initializeChat(); await host.settle(); }
        else await host.api.recoverSave();
        assertRetained(host.api.getState()); assert.equal(host.api.hostStatus().disabledReason, '');
        assert.equal(recoveryCopies(host).length, 0);
        metadata = structuredClone(host.saved.get('persisted')); local = host.local; saved = host.saved;
    } finally { host.cleanup(); }
    const reloaded = await legacyHost({ metadata, saved, local });
    try { reloaded.api.initializeChat(); await reloaded.settle(); assertRetained(reloaded.api.getState()); assert.equal(reloaded.api.hostStatus().saveUnverified, false); }
    finally { reloaded.cleanup(); }
});

test('v0.3.1 old close preview preserves diary/growth edits but discards old maintenance and re-extracts only memory', async () => {
    const host = await legacyHost({ metadata: previewMetadata });
    try {
        host.api.initializeChat(); await host.settle();
        const state = host.api.getState(), old = previewMetadata.scene_diary.pendingTransaction;
        assertRetained(state);
        assert.deepEqual(state.pendingTransaction.results.diary, old.results.diary);
        assert.deepEqual(state.pendingTransaction.results.growth, old.results.growth);
        assert.equal(state.pendingTransaction.results.memory.status, 'error');
        assert.equal('memoryCandidates' in state.pendingTransaction, false);
        assert.equal('memoryRejected' in state.pendingTransaction, false);
        await host.api.confirmClose(); assert.equal(host.api.getState().status, 'preview');
        host.context.ConnectionManagerRequestService = { sendRequest: async (_profile, prompt) => {
            assert.doesNotMatch(JSON.stringify(prompt), /space-v031|用户编辑保留的事实|旧人物背景/);
            return { memories: [] };
        } };
        await host.api.runCloseParts(old.id, ['memory']);
        assert.equal(host.api.getState().pendingTransaction.results.memory.status, 'success');
        // Disable optional background indexing before cleanup restores the real fetch function.
        host.context.chatMetadata.scene_diary.settings.semantic.enabled = false;
        await host.api.confirmClose();
        const committed = host.api.getState();
        assert.equal(committed.status, 'pending_next_act');
        assert.equal(committed.acts[1].diary, '旧预览手改日记');
        assert.equal(committed.characterGrowth.content, '旧预览手改成长');
        assert.deepEqual(committed.memories.map(memory => memory.id), retained.map(memory => memory.id));
    } finally { host.cleanup(); }
});

test('v0.3.1 pending recovery is never overwritten by migration and restores its newer edited facts after approval', async () => {
    const raw = structuredClone(fixture.metadata.scene_diary);
    raw.memories[0].content = '保存失败时用户最新编辑的事实'; raw.memoryRevision++;
    const saved = new Map([['scene_diary_account_id', 'legacy-account']]);
    const key = 'scene_diary_recovery_legacy-account_test-chat_space-v031';
    const local = new Map([[key, structuredClone(raw)]]);
    const host = await legacyHost({ saved, local });
    try {
        host.api.initializeChat(); await host.settle();
        assert.match(host.api.hostStatus().disabledReason, /旧版未核验/);
        assert.equal(host.saved.has('persisted'), false);
        assert.deepEqual(local.get(key), raw);
        assert.deepEqual(migrationCopies(host)[0][1].pendingRecovery, raw);
        host.api.initializeChat(); await host.settle(); assert.deepEqual(local.get(key), raw);
        await host.api.recoverSave();
        const restored = host.api.getState();
        assert.equal(restored.memories[0].content, raw.memories[0].content);
        assert.equal(restored.memoryRevision, raw.memoryRevision);
        assert.deepEqual(restored.memories.map(memory => memory.id), retained.map(memory => memory.id));
        assert.equal('maintenanceHistory' in restored, false);
        assert.equal(restored.version, 5); assert.equal(host.api.hostStatus().disabledReason, '');
        assert.equal(recoveryCopies(host).length, 0);
        assert.deepEqual(host.saved.get('persisted').scene_diary, restored);
    } finally { host.cleanup(); }
});

test('switching chat during a legacy recovery read cannot write the old library into the new chat', async () => {
    const saved = new Map([['scene_diary_account_id', 'legacy-account']]);
    const key = 'scene_diary_recovery_legacy-account_test-chat_space-v031';
    const local = new Map([[key, structuredClone(fixture.metadata.scene_diary)]]);
    const host = await legacyHost({ saved, local });
    try {
        host.api.initializeChat(); await host.settle();
        const store = globalThis.SillyTavern.libs.localforage, read = store.getItem;
        let release, started;
        const ready = new Promise(resolve => started = resolve), delayed = new Promise(resolve => release = resolve);
        store.getItem = async requested => { if (requested === key) { started(); await delayed; } return read(requested); };
        const recovering = host.api.recoverSave(); await ready;
        const other = normalizeState(fixture.metadata.scene_diary); other.memorySpaceId = 'space-other'; other.memories = [];
        host.context.chatId = 'other-chat'; host.context.chatMetadata = { scene_diary: other };
        host.api.initializeChat(); release(); await recovering; await host.settle();
        assert.deepEqual(host.api.getState().memories, []);
        assert.equal(host.api.getState().memorySpaceId, 'space-other');
        assert.equal(host.events.filter(event => event.type === 'save').length, 0);
        assert.deepEqual(local.get(key), fixture.metadata.scene_diary);
    } finally { host.cleanup(); }
});

test('genuine v0.3.1 content backup imports to schema 5 and re-exported v2 retains every saved fact', () => {
    const state = normalizeState(fixture.metadata.scene_diary);
    const restored = restoreContentBackup(state, fixture.contentBackup, 'test-chat');
    assert.deepEqual(restored.memories, state.memories);
    assert.deepEqual(restored.characterGrowth, state.characterGrowth);
    assert.equal(restored.acts[0].diary, state.acts[0].diary);
    const backup = createContentBackup(restored, 'test-chat');
    assert.equal(backup.version, 2);
    const reimported = restoreContentBackup(restored, backup, 'test-chat');
    assert.deepEqual(reimported.memories, restored.memories);
    assert.equal(validateCandidateBatch([retained.find(memory => memory.id === 'long-manual')]).rejected.length, 1);
});

test('future schema is left untouched by host startup without migration, save or model requests', async () => {
    const metadata = structuredClone(fixture.metadata); metadata.scene_diary.version = 6;
    const host = await legacyHost({ metadata });
    try { host.api.initializeChat(); await host.settle(); assert.equal(host.api.getState(), null); assert.deepEqual(host.context.chatMetadata, metadata); assert.equal(host.events.length, 0); assert.equal(host.requests.length, 0); }
    finally { host.cleanup(); }
});
