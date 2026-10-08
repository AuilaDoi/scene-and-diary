import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { embed, rerank, loadVectors, indexVectors, semanticErrorDetail } from '../semantic.js';
import { normalizeMemory } from '../core.js';
import { renderRecallDiagnostics } from '../recall-diagnostics.js';
import { hostFixture } from './helpers/host.mjs';

const memory = (id, content = '一起喝薄荷茶。') => normalizeMemory({ id, title: `标题 ${id}`, content });
const config = { enabled: true, endpoint: 'https://example.test/embedding', model: 'e', rerank: true, rerankEndpoint: 'https://example.test/rerank', rerankModel: 'r' };
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const response = data => new Response(JSON.stringify(data));
async function flush() { for (let i = 0; i < 12; i++) await Promise.resolve(); }
function setupHost(host, semantic = config) {
    const state = host.api.getState(); state.memories = [memory('a')]; state.settings.semantic = semantic;
    host.context.chatMetadata.scene_diary = state;
    return state;
}
function vectorDb() {
    const data = new Map(), stats = { opens: 0, reads: 0, writes: 0 };
    return { data, stats, api: { open() {
        stats.opens++; const request = {};
        queueMicrotask(() => {
            request.result = { close() {}, transaction(_store, mode) {
                stats[mode === 'readwrite' ? 'writes' : 'reads']++;
                const tx = { objectStore: () => ({
                    get(key) { const item = {}; queueMicrotask(() => { item.result = data.get(key); item.onsuccess(); }); return item; },
                    put(value, key) { data.set(key, value); queueMicrotask(() => tx.oncomplete()); },
                }) }; return tx;
            } }; request.onsuccess();
        }); return request;
    } } };
}

test('real HTTP embedding and rerank read a body delayed beyond both old request deadlines', async () => {
    const server = createServer(async (req, res) => {
        const chunks = []; for await (const chunk of req) chunks.push(chunk);
        const input = JSON.parse(Buffer.concat(chunks));
        const data = input.input ? { data: [{ index: 0, embedding: [1, 0] }] } : { results: [{ index: 0, relevance_score: .9 }] };
        const body = JSON.stringify(data);
        res.writeHead(200, { 'Content-Type': 'application/json' }); res.write(body[0]);
        const timer = setTimeout(() => res.end(body.slice(1)), 5600);
        res.on('close', () => clearTimeout(timer));
    });
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const url = `http://127.0.0.1:${server.address().port}`;
    try {
        const result = await Promise.all([embed(['茶'], { endpoint: url, model: 'e' }, ''), rerank('茶', ['事实'], { rerankEndpoint: url, rerankModel: 'r' }, '')]);
        assert.deepEqual(result, [[[1, 0]], [.9]]);
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('recall starts query embedding before cache reads finish and coalesces identical work', async () => {
    const host = await hostFixture(['薄荷茶']);
    const cacheGate = deferred(), embeddingGate = deferred(); let queryCalls = 0, rerankCalls = 0, signal;
    try {
        const state = setupHost(host), input = host.api.recallInput(state);
        globalThis.indexedDB = { open() { const request = {}; cacheGate.promise.then(() => { request.result = { close() {}, transaction: () => ({ objectStore: () => ({ get() { const item = {}; queueMicrotask(() => { item.result = null; item.onsuccess(); }); return item; } }) }) }; request.onsuccess(); }); return request; } };
        globalThis.fetch = async (url, init) => {
            signal = init.signal;
            if (url === config.endpoint) { queryCalls++; await embeddingGate.promise; return response({ data: [{ index: 0, embedding: [1, 0] }] }); }
            rerankCalls++; return response({ results: [{ index: 0, relevance_score: .9 }] });
        };
        const first = host.api.prepareContinuity(state, input, 'test-chat'), second = host.api.prepareContinuity(state, input, 'test-chat');
        await flush(); assert.equal(queryCalls, 1); assert.equal(rerankCalls, 0); assert.equal(signal.aborted, false);
        cacheGate.resolve(); embeddingGate.resolve();
        const [a, b] = await Promise.all([first, second]);
        assert.equal(a, b); assert.equal(rerankCalls, 1); assert.equal(a.groups.length, 1);
        await host.api.prepareContinuity(state, input, 'test-chat'); assert.equal(queryCalls, 1); assert.equal(rerankCalls, 1);
        assert.match(renderRecallDiagnostics(host.api.recallTrace()), /复用相同查询/);
    } finally { cacheGate.resolve(); embeddingGate.resolve(); host.cleanup(); }
});

test('host query and rerank stay pending through 31 seconds without a plugin deadline', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const host = await hostFixture(['薄荷茶']), embeddingGate = deferred(), rankingGate = deferred(); let signal, stage;
    try {
        const state = setupHost(host);
        globalThis.fetch = async (url, init) => {
            signal = init.signal; stage = url;
            await (url === config.endpoint ? embeddingGate.promise : rankingGate.promise);
            if (signal.aborted) throw signal.reason;
            return response(url === config.endpoint ? { data: [{ index: 0, embedding: [1, 0] }] } : { results: [{ index: 0, relevance_score: .9 }] });
        };
        const task = host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat');
        await flush(); assert.equal(stage, config.endpoint);
        t.mock.timers.tick(31000); await flush(); assert.equal(signal.aborted, false);
        embeddingGate.resolve(); await flush(); assert.equal(stage, config.rerankEndpoint);
        t.mock.timers.tick(31000); await flush(); assert.equal(signal.aborted, false);
        rankingGate.resolve(); assert.equal((await task).degradedReason, '');
    } finally { embeddingGate.resolve(); rankingGate.resolve(); host.cleanup(); }
});

test('superseded recall cancels its request and cannot overwrite the newest diagnostic or result', async () => {
    const host = await hostFixture(['薄荷茶']); let oldSignal; const started = deferred();
    try {
        const state = setupHost(host, { ...config, enabled: false });
        globalThis.fetch = async (_url, init) => {
            if (JSON.parse(init.body).query === '旧查询') {
                oldSignal = init.signal; started.resolve();
                await new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true }));
            }
            return response({ results: [{ index: 0, relevance_score: .9 }] });
        };
        const old = host.api.prepareContinuity(state, { query: '旧查询' }, 'test-chat'); await started.promise;
        const newest = await host.api.prepareContinuity(state, { query: '薄荷茶' }, 'test-chat');
        assert.equal(await old, null); assert.equal(oldSignal.aborted, true); assert.equal(newest.groups.length, 1);
        assert.equal(host.api.recallTrace().status, 'done'); assert.equal(host.api.recallTrace().result.count, 1);
    } finally { host.cleanup(); }
});

test('chat switch cancels a pending request and clears the old diagnostic', async () => {
    const host = await hostFixture(['薄荷茶']); let signal;
    try {
        const state = setupHost(host, { ...config, enabled: false });
        globalThis.fetch = async (_url, init) => { signal = init.signal; await new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })); };
        const task = host.api.prepareContinuity(state, { query: '薄荷茶' }, 'test-chat'); await flush();
        host.context.chatId = 'other-chat'; host.api.initializeChat();
        assert.equal(await task, null); assert.equal(signal.aborted, true); assert.equal(host.api.recallTrace(), null);
    } finally { host.cleanup(); }
});

test('stopping generation cancels the pending recall without reporting a service failure', async () => {
    const host = await hostFixture(['薄荷茶']); let signal;
    try {
        setupHost(host, { ...config, enabled: false });
        globalThis.fetch = async (_url, init) => { signal = init.signal; await new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })); };
        const task = host.api.sceneDiaryRearrangeChat([{ role: 'user', content: '薄荷茶' }], 0, () => {}); await flush();
        host.api.stopRecall(); await task;
        assert.equal(signal.aborted, true); assert.equal(host.api.recallTrace().status, 'cancelled'); assert.equal(host.notices.length, 0);
    } finally { host.cleanup(); }
});

test('completed background vector updates invalidate a previous full recall cache', async () => {
    const host = await hostFixture(['薄荷茶']); const db = vectorDb(); let queries = 0;
    try {
        const state = setupHost(host, { ...config, rerank: false }); globalThis.indexedDB = db.api;
        globalThis.fetch = async (_url, init) => { const inputs = JSON.parse(init.body).input; if (inputs[0].startsWith('玩家:')) queries++; return response({ data: inputs.map((_, index) => ({ index, embedding: [1, 0] })) }); };
        const input = host.api.recallInput(state);
        await host.api.prepareContinuity(state, input, 'test-chat'); await host.api.prepareContinuity(state, input, 'test-chat'); assert.equal(queries, 1);
        await host.api.syncVectors(state);
        await host.api.prepareContinuity(state, input, 'test-chat'); assert.equal(queries, 2);
    } finally { host.cleanup(); }
});

test('failure toast stays brief, detailed provider errors are redacted in diagnostics, and failures retry', async () => {
    const host = await hostFixture(['薄荷茶']); let requests = 0;
    try {
        setupHost(host); host.saved.set('scene_diary_embedding_key', 'SECRET-E'); host.saved.set('scene_diary_rerank_key', 'SECRET-R');
        globalThis.fetch = async url => { requests++; return new Response(JSON.stringify({ error: { code: 'input_limit', message: `synthetic provider reason ${url === config.endpoint ? 'SECRET-E' : 'SECRET-R'}` } }), { status: 422 }); };
        const prompt = [{ role: 'user', content: '薄荷茶', extra: host.context.chat[0].extra }];
        await host.api.sceneDiaryRearrangeChat(prompt, 0, () => assert.fail('fallback must continue generation'));
        assert.equal(host.notices.length, 1); assert.match(host.notices[0].text, /embedding.*rerank.*诊断/);
        assert.doesNotMatch(host.notices[0].text, /input_limit|provider reason|SECRET/);
        const trace = host.api.recallTrace(), html = renderRecallDiagnostics(trace);
        assert.equal(trace.status, 'degraded'); assert.match(html, /HTTP 422.*input_limit/); assert.match(html, /synthetic provider reason/); assert.doesNotMatch(html, /SECRET/);
        await host.api.sceneDiaryRearrangeChat(prompt, 0, () => assert.fail()); assert.equal(requests, 4);
    } finally { host.cleanup(); }
});

test('vector cache failure is diagnosed separately while lexical retrieval and rerank continue', async () => {
    const host = await hostFixture(['薄荷茶']);
    try {
        const state = setupHost(host); globalThis.indexedDB = { open() { throw new Error('synthetic cache denied'); } };
        globalThis.fetch = async url => response(url === config.endpoint ? { data: [{ index: 0, embedding: [1, 0] }] } : { results: [{ index: 0, relevance_score: .9 }] });
        const result = await host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat');
        assert.equal(result.groups.length, 1); const events = host.api.recallTrace().events;
        assert.ok(events.some(event => event.stage === '向量缓存' && event.detail.includes('cache denied')));
        assert.ok(events.some(event => event.stage === 'rerank' && event.status === 'ok'));
    } finally { host.cleanup(); }
});

test('vector builds share identical snapshots, queue changed snapshots, and batch database transactions', async () => {
    const original = { indexedDB: globalThis.indexedDB, fetch: globalThis.fetch }, db = vectorDb();
    const gate = deferred(), started = deferred(); let active = 0, maxActive = 0, calls = 0;
    const entries = [memory('a'), memory('b')], identity = { account: 'queue-test', chat: 'c', space: 's' };
    try {
        globalThis.indexedDB = db.api;
        globalThis.fetch = async (_url, init) => {
            calls++; active++; maxActive = Math.max(maxActive, active); started.resolve(); await gate.promise; active--;
            return response({ data: JSON.parse(init.body).input.map((_, index) => ({ index, embedding: [1, 0] })) });
        };
        const first = indexVectors(entries, identity, config, ''), same = indexVectors(entries, identity, config, '');
        assert.equal(first, same); await started.promise;
        const changed = indexVectors([entries[0], memory('c')], identity, config, ''); gate.resolve();
        await Promise.all([first, same, changed]); assert.equal(maxActive, 1); assert.equal(calls, 2); assert.equal(db.stats.writes, 2);
        const before = { ...db.stats };
        assert.equal((await loadVectors(entries, identity, config)).size, 2);
        assert.equal(db.stats.opens - before.opens, 1); assert.equal(db.stats.reads - before.reads, 1);
    } finally { gate.resolve(); Object.assign(globalThis, original); }
});

test('ranking validation explains the failed condition and errors without message remain useful', async () => {
    const original = globalThis.fetch;
    try {
        globalThis.fetch = async () => response({ results: [{ index: 0, relevance_score: .9 }] });
        await assert.rejects(rerank('q', ['a', 'b'], config, ''), /提交 2 条，返回 1 条/);
        assert.match(semanticErrorDetail({ name: 'OpaqueBridgeError', cause: new Error('cause detail') }), /OpaqueBridgeError.*cause detail/);
        assert.equal(semanticErrorDetail('string failure'), 'string failure');
    } finally { globalThis.fetch = original; }
});

test('empty and permanent-only libraries skip needless model calls while retaining permanent results', async () => {
    const host = await hostFixture(['薄荷茶']);
    try {
        const state = setupHost(host); state.memories = [];
        globalThis.fetch = async () => assert.fail('no ordinary document needs a model call');
        let result = await host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat'); assert.equal(result.selected.length, 0);
        state.memories = [{ ...memory('permanent'), permanent: true }]; state.memoryRevision++; host.context.chatMetadata.scene_diary = state;
        result = await host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat'); assert.equal(result.selected[0].memory.id, 'permanent');
    } finally { host.cleanup(); }
});

test('diagnostics render final group/member order and escape titles and error details', async () => {
    const host = await hostFixture(['薄荷茶']);
    try {
        const state = setupHost(host, { ...config, enabled: false }); state.memories = [memory('a'), memory('b')]; state.memories[1].title = '<script>bad title</script>';
        globalThis.fetch = async () => response({ results: [{ index: 0, relevance_score: .4 }, { index: 1, relevance_score: .9 }] });
        const result = await host.api.prepareContinuity(state, host.api.recallInput(state), 'test-chat');
        const trace = host.api.recallTrace(), html = renderRecallDiagnostics(trace);
        assert.equal(trace.result.groups[0].members[0].id, result.groups[0].members[0].memory.id);
        assert.ok(html.indexOf('&lt;script&gt;bad title') < html.indexOf('标题 a')); assert.doesNotMatch(html, /<script>/);
        assert.match(html, /召回流程.*最终召回结果/s); assert.doesNotMatch(html, /memoryRevision|relevanceScore|queryVector/);
    } finally { host.cleanup(); }
});
