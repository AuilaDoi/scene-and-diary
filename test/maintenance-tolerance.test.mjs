import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMemory, normalizeState } from '../core.js';
import { validateMaintenanceBatch, planMaintenance } from '../memory-system.js';
import { splitCandidateTask } from '../maintenance-flow.js';
import { hostFixture } from './helpers/host.mjs';

const memory = (id, extra = {}) => normalizeMemory({ id, title: id, content: `事实 ${id}`, ...extra });
const link = (a, b) => ({ action: 'link', a, b, reason: '发展' });
const merge = { action: 'merge', memberIds: ['a', 'b'], targetId: 'a', title: '重复事实', content: '统一事实', category: 'event', reason: '重复' };

test('mixed proposals retain usable suggestions, repair whitespace IDs, and diagnose each unsafe proposal', () => {
    const raw = [link(' a ', 'b '), link('a', 'missing'), link('a', 'a'), link('a', null), { ...merge, memberIds: ['a', 'missing'] }, link('b', 'c')];
    const before = structuredClone(raw);
    const result = validateMaintenanceBatch(['a', 'b', 'c'].map(id => memory(id)), [], raw);
    assert.deepEqual(result.operations, [link('a', 'b'), link('b', 'c')]);
    assert.deepEqual(result.rejected.map(item => item.index), [2, 3, 4, 5]);
    assert.deepEqual(raw, before);
    assert.equal(planMaintenance(['a', 'b', 'c'].map(id => memory(id)), [], result.operations).length, 2);
});

test('within-side suggestions are useful while invalid merges and old-only incremental suggestions remain excluded', () => {
    const memories = ['a', 'b', 'c'].map(id => memory(id));
    assert.equal(validateMaintenanceBatch(memories, [], [merge, link('a', 'b')]).operations.length, 2);
    assert.equal(validateMaintenanceBatch(memories, [], [link('a', 'b'), link('b', 'c')], ['c']).operations.length, 1);
    const locked = validateMaintenanceBatch([memory('a', { locked: true }), memory('b')], [], [merge, link('a', 'b')]);
    assert.equal(locked.operations.length, 1); assert.match(locked.rejected[0].reason, /锁定/);
    assert.throws(() => validateMaintenanceBatch(memories, [], {}), /数组/);
});

test('full mixed output reaches review without retries and cannot overwrite old links without partial approval', async () => {
    const host = await hostFixture([], () => ({ operations: [link(' a ', 'b'), link('a', 'missing')] }));
    try {
        const state = host.context.chatMetadata.scene_diary;
        state.memories = ['a', 'b', 'c'].map(id => memory(id)); state.memoryLinks = [{ a: 'b', b: 'c', reason: '旧关联' }];
        await host.api.startMaintenance('full');
        const tx = host.api.getState().maintenanceTransaction;
        assert.equal(tx.status, 'preview'); assert.equal(tx.operations.length, 1); assert.equal(tx.tasks[0].rejected.length, 1);
        assert.equal(host.requests.length, 1);
        assert.equal(normalizeState(host.api.getState()).maintenanceTransaction.tasks[0].rejected.length, 1);
        await host.api.confirmMaintenance();
        assert.equal(host.api.getState().memoryLinks[0].reason, '旧关联'); assert.equal(host.api.getState().memoryOrganization, null);
        await host.api.confirmMaintenance(true);
        assert.deepEqual(host.api.getState().memoryLinks, [{ a: 'a', b: 'b', reason: '发展' }]);
        assert.ok(host.api.getState().memoryOrganization);
    } finally { host.cleanup(); }
});

test('all-invalid output cannot silently initialize or clear the old graph', async () => {
    const host = await hostFixture([], () => ({ operations: [link('a', 'a')] }));
    try {
        const state = host.context.chatMetadata.scene_diary;
        state.memories = ['a', 'b'].map(id => memory(id)); state.memoryLinks = [{ a: 'a', b: 'b', reason: '旧关联' }];
        await host.api.startMaintenance('full'); await host.api.confirmMaintenance();
        assert.equal(host.api.getState().maintenanceTransaction.operations.length, 0);
        assert.equal(host.api.getState().memoryLinks.length, 1); assert.equal(host.api.getState().memoryOrganization, null);
    } finally { host.cleanup(); }
});

test('candidate analysis filters unrelated visible pairs and repeated proposals without partial approval', async () => {
    const host = await hostFixture([], input => {
        const data = JSON.parse(input.prompt[1].content.split('\n').at(-1));
        const [a, b] = data.allowedPairs[0];
        return { operations: [link(a, b), link(a, b)] };
    });
    try {
        host.context.chatMetadata.scene_diary.memories = ['a', 'b', 'c'].map(id => memory(id));
        await host.api.startMaintenance('full');
        const tx = host.api.getState().maintenanceTransaction;
        assert.equal(tx.status, 'preview'); assert.equal(tx.operations.length, 1);
        assert.equal(tx.tasks[0].filtered.length, 1); assert.equal(tx.tasks[0].rejected.length, 0);
        await host.api.confirmMaintenance(); assert.equal(host.api.getState().memoryLinks.length, 1);
    } finally { host.cleanup(); }
});

test('retry sends validation feedback only for excluded batches and preserves other successful batches', async () => {
    let phase = 'initial', badPair, failed = false;
    const host = await hostFixture([], input => {
        const text = input.prompt[1].content;
        const data = JSON.parse(text.split('\n').at(-1));
        if (phase === 'initial') return { operations: [] };
        if (JSON.stringify(data.allowedPairs[0]) !== badPair) return { operations: [] };
        if (!failed) { failed = true; return { operations: [link(data.allowedPairs[0][0], 'missing')] }; }
        assert.match(text, /上一轮.*未通过校验/);
        return { operations: [link(...data.allowedPairs[0])] };
    });
    try {
        host.context.chatMetadata.scene_diary.memories = ['a', 'b', 'c'].map(id => memory(id));
        await host.api.startMaintenance('full');
        const tx = host.context.chatMetadata.scene_diary.maintenanceTransaction;
        tx.tasks = splitCandidateTask(tx.tasks[0]); badPair = JSON.stringify(tx.tasks[0].allowedPairs[0]); phase = 'retry';
        await host.api.runMaintenance(tx.id);
        assert.equal(tx.tasks.filter(task => task.rejected.length).length, 1);
        const calls = host.requests.length;
        tx.tasks.filter(task => task.rejected.length).forEach(task => { task.status = 'pending'; });
        await host.api.runMaintenance(tx.id);
        assert.equal(host.requests.length, calls + 1);
        assert.ok(tx.tasks.every(task => task.rejected.length === 0));
        await host.api.confirmMaintenance(); assert.equal(host.api.getState().memoryLinks.length, 1);
    } finally { host.cleanup(); }
});
