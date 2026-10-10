import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createState, normalizeMemory, normalizeSettings, normalizeState, DEFAULT_MAINTENANCE_PROMPT } from '../core.js';
import { createMemoryRetriever, rankRecallCandidates, planMaintenance, applyMaintenance, validateMaintenanceBatch, pendingOrganizationIds } from '../memory-system.js';
import { candidatePairs, candidateTasks, splitCandidateTask, maintenanceMessages, maintenanceInputSize, makeCandidateTask, waitForMaintenance } from '../maintenance-flow.js';
import { cacheKey } from '../semantic.js';
import { hostFixture } from './helpers/host.mjs';

const memory = (id, overrides = {}) => normalizeMemory({ id, title: id, content: '两人一起喝薄荷茶。', ...overrides });
const link = (a, b) => ({ action: 'link', a, b, reason: '同一事件的发展' });
const merge = memberIds => ({ action: 'merge', memberIds, targetId: memberIds[0], title: '喝茶', content: '两人一起喝薄荷茶。', category: 'event', reason: '同一事实' });
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const config = { enabled: false, rerank: true, rerankEndpoint: 'https://example.test/rerank', rerankModel: 'rank' };
const materialOf = input => JSON.parse(input.prompt[1].content.split('\n').at(-1));
function transaction() {
    const state = createState();
    return { settings: state.settings, character: { char: '林', user: '玩家' }, snapshot: ['a', 'b', 'c'].map(id => memory(id)), links: [], pendingIds: ['a', 'b', 'c'], mode: 'full', allowedPairs: [['a', 'b'], ['a', 'c'], ['b', 'c']] };
}
function vectorDb() {
    const data = new Map();
    return { data, api: { open() {
        const request = {}; queueMicrotask(() => {
            request.result = { close() {}, transaction() {
                const tx = { objectStore: () => ({
                    get(key) { const read = {}; queueMicrotask(() => { read.result = data.get(key); read.onsuccess(); }); return read; },
                    put(value, key) { data.set(key, value); queueMicrotask(() => tx.oncomplete()); },
                }) }; return tx;
            } }; request.onsuccess();
        }); return request;
    } } };
}

test('maintenance settings normalize independently and old pending transactions are not executable', () => {
    const settings = normalizeSettings({ maintenanceCandidateLimit: 100, maintenanceScoreThreshold: '0', prompts: { maintenance: '自定义系统指导' } });
    assert.equal(settings.maintenanceCandidateLimit, 60); assert.equal(settings.maintenanceScoreThreshold, 0);
    assert.equal(settings.prompts.maintenance, '自定义系统指导'); assert.equal(settings.maintenanceConnectionProfile, '');
    assert.equal(normalizeSettings({ maintenanceScoreThreshold: '' }).maintenanceScoreThreshold, .15);
    assert.equal(normalizeSettings().prompts.maintenance, DEFAULT_MAINTENANCE_PROMPT);
    const state = createState(); state.version = 5; state.maintenanceTransaction = { status: 'running', tasks: [] };
    assert.equal(normalizeState(state).maintenanceTransaction.status, 'legacy');
    state.maintenanceTransaction.status = 'preview'; assert.equal(normalizeState(state).maintenanceTransaction.status, 'preview');
});

test('maintenance retrieval excludes self and scores permanent and locked records only by relevance', () => {
    const memories = [memory('a'), memory('b', { permanent: true, importance: 1 }), memory('c', { locked: true, importance: 5 })];
    const pool = createMemoryRetriever(memories, 1, { includePermanent: true })(memories[0].content, { excludeId: 'a', useImportance: false });
    assert.deepEqual(pool.map(item => item.memory.id), ['b', 'c']); assert.equal(pool[0].score, pool[1].score);
    const ranked = rankRecallCandidates(pool, [.15, .1], { absolute: true, useImportance: false });
    assert.equal(ranked.filter(item => item.score >= .15).length, 1);
});

test('candidate pairs deduplicate directions; batches and splits preserve pairs and complete input budget', () => {
    const tx = transaction();
    tx.allowedPairs = candidatePairs([{ id: 'a', candidates: [{ id: 'b' }, { id: 'c' }] }, { id: 'b', candidates: [{ id: 'a' }, { id: 'c' }] }], ['a']);
    assert.deepEqual(tx.allowedPairs, [['a', 'b'], ['a', 'c']]);
    const size = maintenanceInputSize(maintenanceMessages(tx, makeCandidateTask([tx.allowedPairs[0]], tx.pendingIds)));
    const tasks = candidateTasks(tx, size + 10);
    assert.equal(tasks.length, 2); assert.deepEqual(tasks.flatMap(task => task.allowedPairs), tx.allowedPairs);
    assert.ok(tasks.every(task => new Set(task.materialIds).size === task.materialIds.length));
    assert.deepEqual(splitCandidateTask(makeCandidateTask(tx.allowedPairs, ['a'])).flatMap(task => task.allowedPairs), tx.allowedPairs);
    assert.throws(() => candidateTasks(tx, 10), /单个候选配对/);
});

test('filtering preserves integrity errors and requires one common anchor for multi-record merges', () => {
    const memories = ['new', 'a', 'b', 'c'].map(id => memory(id));
    const task = { id: 'task', anchors: ['new'], allowedPairs: [['new', 'a'], ['new', 'b']], materialIds: ['new', 'a', 'b'] };
    const result = validateMaintenanceBatch(memories, [], [link('a', 'b'), merge(['new', 'a', 'c']), link('new', 'missing'), link('a', 'a'), merge(['new', 'a', 'b']), link('new', 'a'), link('new', 'a')], ['new'], task);
    assert.equal(result.filtered.length, 3); assert.equal(result.rejected.length, 2); assert.equal(result.operations.length, 2);
    const outside = validateMaintenanceBatch(memories, [], [link('new', 'c')], ['new'], task);
    assert.equal(outside.filtered.length, 1); assert.equal(outside.rejected.length, 0);
    const state = applyMaintenance({ ...createState(), memories }, [], { mode: 'full' });
    const planned = planMaintenance(memories, [], result.operations);
    applyMaintenance(state, planned, { mode: 'incremental', pendingIds: ['new'], tasks: [task] });
    planned[1].a = 'c'; assert.throws(() => applyMaintenance(state, planned, { mode: 'incremental', pendingIds: ['new'], tasks: [task] }), /候选配对/);
});

test('dedicated connection is required without inheriting extraction or main chat configuration', async () => {
    const host = await hostFixture([], null, { maintenanceConfigured: false });
    try {
        const state = host.api.getState(); state.memories = [memory('a'), memory('b')]; state.settings.memoryConnectionProfile = 'maintenance-profile';
        await host.api.startMaintenance('full');
        assert.equal(host.requests.length, 0); assert.equal(host.api.getState().maintenanceTransaction, null);
        assert.ok(host.notices.some(notice => /专属连接/.test(notice.text)));
    } finally { host.cleanup(); }
});

test('in-flight edits preserve frozen system prompt, profile and retrieval settings through retry', async () => {
    let host, fail = true; const prompts = [];
    host = await hostFixture([], input => {
        prompts.push(input);
        const state = host.api.getState(); state.settings.prompts.maintenance = '下一次的提示词'; state.settings.maintenanceCandidateLimit = 1; state.settings.maintenanceScoreThreshold = 1; state.settings.maintenanceConnectionProfile = 'next';
        if (fail) throw new Error('temporary outage');
        return { operations: [link(...materialOf(input).allowedPairs[0])] };
    });
    try {
        const state = host.api.getState(); state.memories = [memory('a'), memory('b')]; state.settings.prompts.maintenance = '{{char}} 为 {{user}} 整理事实';
        await host.api.startMaintenance('full'); const tx = host.api.getState().maintenanceTransaction;
        assert.equal(tx.status, 'error'); fail = false; await host.api.runMaintenance(tx.id);
        assert.equal(tx.status, 'preview'); assert.equal(prompts.length, 2);
        assert.ok(prompts.every(input => input.profileId === 'maintenance-profile' && input.prompt[0].role === 'system' && input.prompt[0].content.includes('林 为 玩家')));
        assert.equal(tx.settings.maintenanceCandidateLimit, 20); assert.equal(tx.settings.maintenanceScoreThreshold, .15);
        await host.api.confirmMaintenance(); assert.equal(host.api.getState().memoryLinks.length, 1);
    } finally { host.cleanup(); }
});

test('rerank sees candidates before cutoff and a failed configured service resumes only unfinished queries after reload', async () => {
    const host = await hostFixture(); let calls = 0, fail = true;
    let metadata, saved, local;
    try {
        const state = host.api.getState(); state.memories = [memory('a', { content: '苹果' }), memory('b', { content: '海洋' })]; state.settings.semantic = config;
        const fetch = globalThis.fetch;
        globalThis.fetch = async (url, init) => {
            if (url !== config.rerankEndpoint) return fetch(url, init);
            const body = JSON.parse(init.body); assert.equal(body.documents.length, 1); calls++;
            if (body.query === '海洋' && fail) throw new Error('rerank unavailable');
            return new Response(JSON.stringify({ results: [{ index: 0, relevance_score: .8 }] }));
        };
        await host.api.startMaintenance('full'); const tx = host.api.getState().maintenanceTransaction;
        assert.equal(tx.status, 'error'); assert.equal(tx.queries[0].status, 'success'); assert.equal(host.requests.length, 0);
        assert.equal(host.api.getState().memoryOrganization, null);
        metadata = structuredClone(host.saved.get('persisted')); saved = host.saved; local = host.local;
    } finally { host.cleanup(); }
    const reloaded = await hostFixture([], null, { metadata, saved, local });
    try {
        fail = false; const fetch = globalThis.fetch;
        globalThis.fetch = async (url, init) => {
            if (url !== config.rerankEndpoint) return fetch(url, init);
            calls++; return new Response(JSON.stringify({ results: [{ index: 0, relevance_score: .8 }] }));
        };
        await reloaded.api.runMaintenance(reloaded.api.getState().maintenanceTransaction.id);
        assert.equal(calls, 3); assert.equal(reloaded.requests.length, 1);
        assert.equal(reloaded.api.getState().maintenanceTransaction.status, 'preview');
    } finally { reloaded.cleanup(); }
});

test('maintenance uses cached query vectors and embeds only missing memory content', async () => {
    const host = await hostFixture(); const db = vectorDb(); let embedded;
    try {
        const state = host.api.getState(); state.memories = [memory('a'), memory('b')];
        state.settings.semantic = { enabled: true, endpoint: 'https://example.test/embedding', model: 'embed' };
        globalThis.indexedDB = db.api;
        const identity = { account: 'account-test', chat: 'test-chat', space: state.memorySpaceId }; host.saved.set('scene_diary_account_id', identity.account);
        db.data.set(cacheKey(identity, state.settings.semantic, state.memories[0]), [1, 0]);
        const fetch = globalThis.fetch;
        globalThis.fetch = async (url, init) => {
            if (url !== state.settings.semantic.endpoint) return fetch(url, init);
            embedded = JSON.parse(init.body).input;
            return new Response(JSON.stringify({ data: [{ index: 0, embedding: [1, 0] }] }));
        };
        await host.api.startMaintenance('full');
        assert.deepEqual(embedded, [state.memories[1].content]); assert.equal(host.requests.length, 1);
        assert.equal(host.api.getState().maintenanceTransaction.status, 'preview');
    } finally { host.cleanup(); }
});

test('cancelling a shared-index wait leaves the shared work alive', async () => {
    const gate = deferred(), controller = new AbortController();
    const wait = waitForMaintenance(gate.promise, controller.signal); controller.abort(new DOMException('cancelled', 'AbortError'));
    await assert.rejects(wait, /cancelled/); gate.resolve('completed'); assert.equal(await gate.promise, 'completed');
});

test('cancel and memory revisions abort native analysis and prevent late proposals from being saved', async () => {
    for (const cancel of [true, false]) {
        const started = deferred(), gate = deferred(); let signal;
        const host = await hostFixture([], async input => { signal = input.signal; started.resolve(); await gate.promise; return { operations: [link('a', 'b')] }; });
        try {
            host.api.getState().memories = [memory('a'), memory('b')];
            const run = host.api.startMaintenance('full'); await started.promise;
            if (cancel) host.api.cancelMaintenance(); else host.api.getState().memoryRevision++;
            await run; assert.equal(signal.aborted, true);
            assert.equal(host.api.getState().memoryLinks.length, 0); assert.equal(host.api.getState().memoryOrganization, null);
            if (cancel) assert.equal(host.api.getState().maintenanceTransaction, null);
            else assert.equal(host.api.getState().maintenanceTransaction.status, 'stale');
        } finally { gate.resolve(); host.cleanup(); }
    }
});

test('schema 5 migration preserves initialization, fixed merges and completed legacy preview', async () => {
    const state = createState(); state.version = 5; state.memories = [memory('fixed', { content: '此前批准合并后的固定事实。' }), memory('other')];
    const initialized = applyMaintenance(state, [], { mode: 'full' }); initialized.version = 5;
    initialized.memoryLinks = [{ a: 'fixed', b: 'other', reason: '旧关系' }];
    initialized.maintenanceTransaction = { id: 'legacy', status: 'preview', mode: 'full', memoryRevision: initialized.memoryRevision, snapshot: structuredClone(initialized.memories), tasks: [], operations: planMaintenance(initialized.memories, [], [link('fixed', 'other')]) };
    const host = await hostFixture([], null, { metadata: { scene_diary: initialized } });
    try {
        await host.settle(); const migrated = host.api.getState();
        assert.equal(migrated.version, 6); assert.deepEqual(migrated.memoryOrganization, initialized.memoryOrganization);
        assert.deepEqual(migrated.memories, initialized.memories); assert.deepEqual(pendingOrganizationIds(migrated), []);
        assert.ok([...host.local.keys()].some(key => /schema5_to6$/.test(key)));
        await host.api.confirmMaintenance(); assert.equal(host.api.getState().memoryLinks[0].reason, '同一事件的发展'); assert.equal(host.requests.length, 0);
    } finally { host.cleanup(); }
});

test('Tauri maintenance uses its dedicated connection and custom system prompt through format negotiation', async () => {
    const { parse: parseYaml } = createRequire(import.meta.url)('yaml');
    const dependencies = async () => ({ parseYaml, host: { getAdditionalParametersForSource: () => ({ include_body: '', exclude_body: '', include_headers: '' }) } });
    const host = await hostFixture([], (input, count) => count === 1
        ? new Response(JSON.stringify({ error: { message: 'this response_format type is unavailable now' } }), { status: 502 })
        : { operations: [link('a', 'b')] }, { tauri: true, jsonDependencies: dependencies });
    try {
        const state = host.api.getState(); state.memories = [memory('a'), memory('b')]; state.settings.prompts.maintenance = '{{char}} 的自定义系统指导';
        await host.api.startMaintenance('full');
        assert.equal(host.api.getState().maintenanceTransaction.status, 'preview');
        assert.deepEqual(host.requests.map(input => input.response_format.type), ['json_schema', 'json_object']);
        assert.ok(host.requests.every(input => input.messages[0].role === 'system' && input.messages[0].content.includes('林 的自定义系统指导')));
    } finally { host.cleanup(); }
});
