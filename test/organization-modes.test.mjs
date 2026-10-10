import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, normalizeMemory, normalizeState } from '../core.js';
import { appendExtractedMemories, applyMaintenance, maintenanceTasks, pendingOrganizationIds, planMaintenance, splitMaintenanceTask, validateMaintenanceScope } from '../memory-system.js';
import { createContentBackup, restoreContentBackup } from '../backup.js';
import { hostFixture } from './helpers/host.mjs';

const memory = (id, overrides = {}) => normalizeMemory({ id, title: id, content: `事实 ${id}`, ...overrides });
const link = (a, b) => ({ a, b, reason: '事实发展' });
const merge = (ids, targetId) => ({ action: 'merge', memberIds: ids, targetId, category: 'event', title: '同一事实', content: '重复事实的统一表述', reason: '同一事实' });
function pairs(tasks) {
    const result = new Set();
    for (const task of tasks) {
        if (task.right.length) for (const a of task.left) for (const b of task.right) result.add([a, b].sort().join(':'));
        else for (let i = 0; i < task.left.length; i++) for (let j = i + 1; j < task.left.length; j++) result.add([task.left[i], task.left[j]].sort().join(':'));
    }
    return result;
}
function initialized(ids = ['a', 'b']) { const state = createState(); state.settings.maintenanceConnectionProfile = 'maintenance-profile'; state.memories = ids.map(id => memory(id)); return applyMaintenance(state, [], { mode: 'full' }); }

test('full approval replaces all old links and initializes the resulting independent records', () => {
    const state = createState(); state.memories = ['a', 'b', 'c'].map(id => memory(id)); state.memoryLinks = [link('a', 'b')];
    const planned = planMaintenance(state.memories, [], [{ action: 'link', ...link('b', 'c') }]);
    assert.equal(state.memoryOrganization, null);
    const next = applyMaintenance(state, planned, { mode: 'full' });
    assert.deepEqual(next.memoryLinks, [link('b', 'c')]); assert.deepEqual(state.memoryLinks, [link('a', 'b')]);
    assert.deepEqual(next.memories, state.memories); assert.deepEqual(pendingOrganizationIds(next), []);
    assert.equal(next.memoryRevision, state.memoryRevision + 1);
});

test('an approved full run without proposals clears old edges and establishes a baseline', () => {
    const state = initialized(); state.memoryLinks = [link('a', 'b')];
    const next = applyMaintenance(state, [], { mode: 'full' });
    assert.deepEqual(next.memoryLinks, []); assert.deepEqual(pendingOrganizationIds(next), []);
});

test('pending scope includes appended and edited entries without enrolling unchanged neighbors', () => {
    const state = initialized(); state.memoryLinks = [link('a', 'b')];
    const next = appendExtractedMemories(state, [memory('new')]);
    assert.deepEqual(pendingOrganizationIds(next), ['new']);
    next.memories[0].content = '用户重新编辑的事实';
    assert.deepEqual(pendingOrganizationIds(next), ['a', 'new']);
    next.memories[1].locked = true;
    assert.deepEqual(pendingOrganizationIds(next), ['a', 'b', 'new']);
    assert.deepEqual(pendingOrganizationIds(state), []);
});

test('incremental batching covers exactly new-old and new-new pairs, including after context splitting', () => {
    const memories = Array.from({ length: 12 }, (_, i) => memory(String(i)));
    const pending = ['10', '11'], expected = new Set();
    for (let i = 0; i < memories.length; i++) for (let j = i + 1; j < memories.length; j++) if (pending.includes(String(i)) || pending.includes(String(j))) expected.add([String(i), String(j)].sort().join(':'));
    const tasks = maintenanceTasks(memories, 1300, pending);
    assert.deepEqual(pairs(tasks), expected); assert.equal(expected.size, 21);
    assert.ok(tasks.length < maintenanceTasks(memories, 1300).length);
    const subdivided = tasks.flatMap(task => splitMaintenanceTask(task) || [task]);
    assert.deepEqual(pairs(subdivided), expected);
    assert.deepEqual(maintenanceTasks(memories, 1300, []), []);
});

test('scope validation prevents model-proposed old-only operations and incorrect cross-batch operations', () => {
    assert.throws(() => validateMaintenanceScope([{ action: 'link', ...link('a', 'b') }], ['new']), /未变更/);
    assert.throws(() => validateMaintenanceScope([merge(['a', 'b'], 'a')], ['new']), /未变更/);
    assert.throws(() => validateMaintenanceScope([{ action: 'link', ...link('new1', 'new2') }], ['new1', 'new2'], { left: ['new1', 'new2'], right: ['a'] }), /左右/);
    validateMaintenanceScope([{ action: 'link', ...link('a', 'new') }], ['new'], { left: ['new'], right: ['a', 'b'] });
});

test('incremental merges preserve and redirect the old graph while updating resulting fingerprints', () => {
    const state = initialized(['a', 'b', 'c']); state.memoryLinks = [link('a', 'b'), link('b', 'c')]; state.memories.push(memory('new'));
    const ops = planMaintenance(state.memories, state.memoryLinks, [merge(['a', 'new'], 'new')]);
    const next = applyMaintenance(state, ops, { mode: 'incremental', pendingIds: ['new'] });
    assert.deepEqual(next.memories.map(item => item.id), ['b', 'c', 'new']);
    assert.deepEqual(next.memoryLinks, [link('b', 'new'), link('b', 'c')]);
    assert.deepEqual(pendingOrganizationIds(next), []); assert.equal(Object.hasOwn(next.memoryOrganization.reviewed, 'a'), false);
    assert.equal(next.memoryOrganization.initializedAt, state.memoryOrganization.initializedAt);
    assert.throws(() => applyMaintenance(state, planMaintenance(state.memories, [], [merge(['a', 'b'], 'a')]), { mode: 'incremental', pendingIds: ['new'] }), /未变更/);
});

test('rejecting incremental proposals records the review without modifying existing facts or links', () => {
    const state = initialized(); state.memoryLinks = [link('a', 'b')]; state.memories.push(memory('new'));
    const op = planMaintenance(state.memories, state.memoryLinks, [{ action: 'link', ...link('a', 'new') }])[0]; op.accepted = false;
    const next = applyMaintenance(state, [op], { mode: 'incremental', pendingIds: ['new'] });
    assert.deepEqual(next.memoryLinks, state.memoryLinks); assert.deepEqual(next.memories, state.memories); assert.deepEqual(pendingOrganizationIds(next), []);
});

test('baseline survives normalization and v2 backup; old data and old backups require initialization', () => {
    const state = initialized(); state.memoryLinks = [link('a', 'b')]; state.memories.push(memory('new'));
    const normalized = normalizeState(state); assert.deepEqual(pendingOrganizationIds(normalized), ['new']);
    assert.deepEqual(normalizeState(normalized), normalized);
    const backup = createContentBackup(state, 'chat'), restored = restoreContentBackup(state, backup, 'chat');
    assert.deepEqual(restored.memoryOrganization, state.memoryOrganization); assert.deepEqual(pendingOrganizationIds(restored), ['new']);
    delete backup.memoryOrganization;
    assert.equal(restoreContentBackup(state, backup, 'chat').memoryOrganization, null);
    const legacy = structuredClone(state); delete legacy.memoryOrganization;
    const migrated = normalizeState(legacy); assert.equal(migrated.memoryOrganization, null); assert.deepEqual(migrated.memoryLinks, state.memoryLinks);
    const deleted = structuredClone(state); deleted.memories.shift();
    assert.equal(Object.hasOwn(normalizeState(deleted).memoryOrganization.reviewed, 'a'), false);
    assert.throws(() => applyMaintenance(migrated, [], { mode: 'incremental', pendingIds: [] }), /初始化/);
});

test('host full reset stays in preview until approval, then defaults to incremental and skips a clean library', async () => {
    const host = await hostFixture();
    try {
        host.context.chatMetadata.scene_diary.memories = ['a', 'b'].map(id => memory(id)); host.context.chatMetadata.scene_diary.memoryLinks = [link('a', 'b')];
        await host.api.startMaintenance('incremental'); assert.equal(host.requests.length, 0);
        await host.api.startMaintenance('full');
        assert.deepEqual(host.api.getState().memoryLinks, [link('a', 'b')]); assert.equal(host.api.getState().memoryOrganization, null);
        assert.deepEqual(host.api.getState().maintenanceTransaction.links, []);
        assert.match(JSON.stringify(host.requests[0].prompt), /全量整理／初始化/);
        await host.api.confirmMaintenance(); assert.deepEqual(host.api.getState().memoryLinks, []);
        assert.ok(host.api.getState().memoryOrganization);
        const requests = host.requests.length; await host.api.startMaintenance(); assert.equal(host.requests.length, requests); assert.equal(host.api.getState().maintenanceTransaction, null);
    } finally { host.cleanup(); }
});

test('host incremental prompts compare pending entries against the baseline and preserve existing graph', async () => {
    const host = await hostFixture([], input => {
        assert.match(JSON.stringify(input.prompt), /增量整理/);
        const data = JSON.parse(input.prompt[1].content.split('\n').at(-1));
        assert.deepEqual(data.pendingIds, ['new']); assert.deepEqual(data.anchors, ['new']);
        assert.deepEqual(data.memories.map(item => item.id), ['a', 'b', 'new']); assert.deepEqual(data.allowedPairs, [['a', 'new'], ['b', 'new']]);
        return { operations: [{ action: 'link', ...link('b', 'new') }] };
    });
    try {
        const state = initialized(); state.memoryLinks = [link('a', 'b')]; state.memories.push(memory('new')); host.context.chatMetadata.scene_diary = state;
        await host.api.startMaintenance(); assert.equal(host.requests.length, 1); assert.equal(host.api.getState().maintenanceTransaction.mode, 'incremental');
        assert.deepEqual(pendingOrganizationIds(host.api.getState()), ['new']);
        await host.api.confirmMaintenance(); assert.deepEqual(host.api.getState().memoryLinks, [link('a', 'b'), link('b', 'new')]); assert.deepEqual(pendingOrganizationIds(host.api.getState()), []);
        const metadata = structuredClone(host.saved.get('persisted')), local = host.local, saved = host.saved;
        const reloaded = await hostFixture([], null, { metadata, local, saved });
        try { await reloaded.settle(); await reloaded.api.startMaintenance(); assert.equal(reloaded.requests.length, 0); assert.deepEqual(reloaded.api.getState().memoryLinks, [link('a', 'b'), link('b', 'new')]); }
        finally { reloaded.cleanup(); }
    } finally { host.cleanup(); }
});

test('host model old-only suggestions are automatically filtered and allow ordinary approval', async () => {
    const host = await hostFixture([], () => ({ operations: [{ action: 'link', ...link('a', 'b') }] }));
    try {
        const state = initialized(); state.memories.push(memory('new')); host.context.chatMetadata.scene_diary = state;
        const baseline = structuredClone(state.memoryOrganization);
        await host.api.startMaintenance('incremental'); assert.equal(host.api.getState().maintenanceTransaction.status, 'preview');
        assert.match(host.api.getState().maintenanceTransaction.tasks[0].filtered[0].reason, /未变更/);
        assert.equal(host.api.getState().maintenanceTransaction.tasks[0].rejected.length, 0);
        await host.api.confirmMaintenance();
        assert.deepEqual(host.api.getState().memoryLinks, []); assert.notDeepEqual(host.api.getState().memoryOrganization, baseline);
        assert.deepEqual(pendingOrganizationIds(host.api.getState()), []);
    } finally { host.cleanup(); }
});

test('host a changed incremental preview cannot advance the baseline or swallow new arrivals', async () => {
    const host = await hostFixture();
    try {
        const state = initialized(); state.memoryLinks = [link('a', 'b')]; state.memories.push(memory('new')); host.context.chatMetadata.scene_diary = state;
        const baseline = structuredClone(state.memoryOrganization);
        await host.api.startMaintenance();
        host.context.chatMetadata.scene_diary.memories.push(memory('arrived-later')); host.context.chatMetadata.scene_diary.memoryRevision++;
        await host.api.confirmMaintenance();
        assert.deepEqual(host.api.getState().memoryOrganization, baseline); assert.deepEqual(pendingOrganizationIds(host.api.getState()), ['new', 'arrived-later']);
        assert.deepEqual(host.api.getState().memoryLinks, [link('a', 'b')]);
        assert.ok(host.notices.some(notice => notice.text.includes('已变化')));
    } finally { host.cleanup(); }
});

test('host full cancellation or model failure does not clear existing associations', async () => {
    for (const fail of [false, true]) {
        const host = await hostFixture([], fail ? () => { throw new Error('provider down'); } : null);
        try {
            const state = initialized(); state.memoryLinks = [link('a', 'b')]; host.context.chatMetadata.scene_diary = state;
            await host.api.startMaintenance('full'); const before = host.api.getState();
            assert.equal(before.maintenanceTransaction.status, fail ? 'error' : 'preview');
            host.context.chatMetadata.scene_diary.maintenanceTransaction = null;
            assert.deepEqual(host.api.getState().memoryLinks, state.memoryLinks); assert.deepEqual(host.api.getState().memoryOrganization, state.memoryOrganization);
        } finally { host.cleanup(); }
    }
});

test('host full initialization of an empty or singleton library needs approval but no model calls', async () => {
    for (const ids of [[], ['one']]) {
        const host = await hostFixture();
        try {
            host.context.chatMetadata.scene_diary.memories = ids.map(id => memory(id)); await host.api.startMaintenance('full');
            assert.equal(host.requests.length, 0); assert.equal(host.api.getState().memoryOrganization, null); assert.equal(host.api.getState().maintenanceTransaction.status, 'preview');
            await host.api.confirmMaintenance(); assert.ok(host.api.getState().memoryOrganization);
        } finally { host.cleanup(); }
    }
});

test('host failed initialization save retains a recoverable baseline and read-only state until restored', async () => {
    const host = await hostFixture();
    try {
        host.context.chatMetadata.scene_diary.memories = ['a', 'b'].map(id => memory(id));
        await host.api.startMaintenance('full'); const save = host.context.saveMetadata;
        host.context.saveMetadata = async () => { throw new Error('disk full'); }; await host.api.confirmMaintenance();
        assert.equal(host.api.hostStatus().saveUnverified, true); const initializedAt = host.api.getState().memoryOrganization.initializedAt;
        await host.api.startMaintenance('incremental'); assert.equal(host.requests.length, 1);
        host.context.saveMetadata = save; await host.api.recoverSave();
        assert.equal(host.api.hostStatus().saveUnverified, false); assert.equal(host.api.getState().memoryOrganization.initializedAt, initializedAt);
        assert.deepEqual(pendingOrganizationIds(host.api.getState()), []);
    } finally { host.cleanup(); }
});
