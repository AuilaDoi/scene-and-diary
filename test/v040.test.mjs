import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { assignMessageToAct, createState, normalizeMemory } from '../core.js';
import { createHost, readHistory } from '../host-v7.js';
import { testChannel } from '../channels.js';
import { fact, makeBackup, readBackup, migrateState, newState, diary, mergeFacts, deleteFact } from '../state-v7.js';
import { continuity, createRetrieval, diarySelection, selectFacts } from '../recall-v7.js';

const channel = { id: 'local', name: '试用', url: 'https://example.invalid/v1', key: 'secret-12345678', model: 'proxy-model', temperature: 0.5, maxTokens: 4096 };
const item = (id, title, content, extra = {}) => fact({ id, title, content, category: 'item', ...extra });
const model = content => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }));
const rejectFormat = () => new Response(JSON.stringify({ error: { message: 'This response_format type is unavailable now', status: 400 } }), { status: 400 });

function fixture(old = null, options = {}) {
    const events = new Map(), local = new Map(), store = new Map(), saves = [];
    const state = old || newState();
    if (!old) state.settings.bindings = Object.fromEntries(['diary', 'growth', 'memory', 'summary', 'graph'].map(task => [task, channel.id]));
    const chat = [{ name: '玩家', mes: '阿青喜欢桂花茶。', is_user: true }, { name: '阿青', mes: '桂花茶的味道让我想起家。', is_user: false }];
    chat.forEach((message, index) => assignMessageToAct(state, message, 1, index));
    const context = {
        chatId: 'session', chat, chatMetadata: { scene_diary: state }, mainApi: 'openai', name1: '玩家', name2: '阿青',
        eventSource: { on: (name, listener) => events.set(name, listener) },
        getRequestHeaders() { return { 'Content-Type': 'application/json' }; },
        getCharacterCardFields: () => ({ description: '遵循最初性格。' }),
        extensionSettings: { scene_diary_channels: [channel] },
        accountStorage: { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) },
        saveMetadata: async () => { saves.push(structuredClone(context.chatMetadata)); },
    };
    const notices = [];
    const environment = { toastr: { error: message => notices.push(message) }, ...options, SillyTavern: { libs: { localforage: {
        getItem: async key => local.get(key), setItem: async (key, value) => local.set(key, structuredClone(value)),
    } } } };
    const host = createHost(() => context, () => {}, environment);
    return { host, context, events, local, environment, saves, notices };
}

test('manifest points to assets and the bundle loads without a Node process global', async () => {
    const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
    const bootstrap = await readFile(new URL('../' + manifest.js, import.meta.url), 'utf8');
    assert.match(bootstrap, /from '\.\/dist\/index\.js'/);
    await access(new URL('../' + manifest.css, import.meta.url));
    const bundle = new URL('../dist/index.js', import.meta.url);
    const probe = `
        delete globalThis.process;
        const { install } = await import(${JSON.stringify(bundle.href)});
        if (typeof install !== 'function') throw new Error('Missing install export');
    `;
    const result = spawnSync(process.execPath, ['--input-type=module', '--eval', probe], { encoding: 'utf8' });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
});

test('migration backs up schema 6 before writing schema 7 and v2/v3 content round-trips', async () => {
    const old = createState(100);
    Object.assign(old.acts[0], { title: '初见', diary: '  我的第一篇日记。\n', closedAt: 200, status: 'closed' });
    old.status = 'pending_next_act';
    old.memories = [
        normalizeMemory({ id: 'a', category: 'preference', title: '花茶', content: '角色喜欢桂花。' }),
        normalizeMemory({ id: 'b', category: 'item_place', title: '钥匙', content: '钥匙在门口。', locked: true, permanent: true }),
    ];
    old.memoryLinks = [{ a: 'a', b: 'b', reason: '旧理由' }];
    const { host, local, saves } = fixture(old);
    await host.connect();
    const backup = [...local.values()][0], state = host.snapshot().state;
    assert.equal(backup.metadata.scene_diary.version, 6);
    assert.equal(backup.messages.length, 2);
    assert.deepEqual(backup.metadata.scene_diary.memoryLinks, old.memoryLinks);
    assert.equal(saves[0].scene_diary.version, 7);
    assert.deepEqual(state.edges, []);
    assert.deepEqual(state.memories.map(item => [item.id, item.needsClassification, item.locked, item.permanent]), [['a', false, false, false], ['b', true, true, true]]);
    assert.equal(state.diaries[0].body, old.acts[0].diary);
    assert.equal(state.diaries[0].summaryPending, true);
    assert.equal(Object.hasOwn(state.diaries[0], 'actId'), false);
    assert.equal(Object.hasOwn(state.acts[0], 'diary'), false);
    assert.equal(migrateState(state), state);
    const exported = makeBackup(state, 'session');
    assert.equal(exported.version, 3);
    assert.deepEqual(readBackup(newState(), exported, 'session').diaries, state.diaries);
    const legacy = { ...exported, version: 2, diaries: [{ actId: 1, title: '旧日记', diary: '旧正文' }], memoryLinks: old.memoryLinks };
    const restored = readBackup(state, legacy, 'session');
    assert.equal(restored.diaries[0].summaryPending, true);
    assert.equal(restored.diaries[0].body, '旧正文');
    assert.deepEqual(restored.edges, []);
});

test('migration backup failure leaves old metadata unchanged for retry', async () => {
    const old = createState();
    const { host, context, environment } = fixture(old);
    const writer = environment.SillyTavern.libs.localforage.setItem;
    environment.SillyTavern.libs.localforage.setItem = async () => { throw new Error('storage offline'); };
    await host.connect();
    assert.equal(context.chatMetadata.scene_diary.version, 6);
    assert.match(host.snapshot().blocker, /迁移备份失败/);
    environment.SillyTavern.libs.localforage.setItem = writer;
    await host.initialize();
    assert.equal(context.chatMetadata.scene_diary.version, 7);
});

test('Tauri history reads missing ranges and keeps current live messages', async () => {
    const newest = { messages: [{ mes: 'disk copy' }], startIndex: 2, hasMoreBefore: true };
    const all = await readHistory([null, null, { mes: 'live edit' }], {
        tail: async () => newest,
        before: async page => {
            assert.equal(page, newest);
            return { messages: [{ mes: 'old A' }, { mes: 'old B' }], startIndex: 0, hasMoreBefore: false };
        },
    }, 0, true);
    assert.deepEqual(all.map(item => item.mes), ['old A', 'old B', 'live edit']);
});

test('Tauri migration rehydrates cold swipe alternatives without replacing the live reply', async () => {
    const live = { mes: 'edited', swipes: [null, 'edited'], swipe_info: [null, { live: true }], tt_swipe_cold: { record: 1 } };
    const disk = { mes: 'disk', swipes: ['older alternative', 'disk'], swipe_info: [{ prior: true }, { prior: true }] };
    const [snapshot] = await readHistory([live], {
        tail: async () => ({ messages: [disk], startIndex: 0, hasMoreBefore: false }),
    }, 0, true, true);
    assert.equal(snapshot.mes, 'edited');
    assert.deepEqual(snapshot.swipes, ['older alternative', 'edited']);
    assert.deepEqual(snapshot.swipe_info, [{ prior: true }, { live: true }]);
    assert.equal(Object.hasOwn(snapshot, 'tt_swipe_cold'), false);
    assert.equal(live.swipes[0], null);
});

test('assignment uses full save and retries the same message changes after failure', async () => {
    const { host, context, events } = fixture();
    await host.connect();
    let full = 0;
    context.saveChat = async () => { full++; if (full === 1) throw new Error('full save failed'); };
    context.chat.push({ is_user: true, mes: '第三条对话' });
    await events.get('message_sent')(2);
    await new Promise(resolve => setImmediate(resolve));
    assert.match(host.snapshot().saveError, /full save failed/);
    await host.save();
    assert.equal(full, 2);
    assert.equal(context.chat[2].extra.scene_diary.actId, 1);
    assert.equal(host.snapshot().state.acts[0].messageIds.length, 3);
});

test('channel proxy negotiates explicit format rejection and never emits credentials in errors', async t => {
    const { context } = fixture();
    const formats = [];
    t.mock.method(globalThis, 'fetch', async (url, init) => {
        const body = JSON.parse(init.body);
        assert.equal(url, '/api/backends/chat-completions/generate');
        assert.equal(body.custom_api_format, 'openai_compat');
        assert.equal(JSON.parse(body.custom_include_headers).Authorization, 'Bearer ' + channel.key);
        assert.equal(JSON.parse(body.custom_include_body).response_format.type, body.response_format.type);
        formats.push(body.response_format.type);
        return formats.length === 1 ? rejectFormat() : model({ ok: true });
    });
    assert.deepEqual(await testChannel(context, channel), { ok: true });
    assert.deepEqual(formats, ['json_schema', 'json_object']);
    t.mock.restoreAll();
    t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ error: { message: 'response_format type unsupported ' + channel.key } }), { status: 400 }));
    await assert.rejects(testChannel(context, channel), error => /json_schema.*json_object/.test(error.message) && !error.message.includes(channel.key));
    t.mock.restoreAll();
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async () => {
        calls++;
        return new Response(JSON.stringify({ error: { message: 'Bad Request' } }), { status: 400 });
    });
    await assert.rejects(testChannel(context, channel), /Bad Request/);
    assert.equal(calls, 1);
});

test('close confirms diary before growth and retries a failed part without losing progress', async t => {
    const { host, context, events } = fixture();
    const calls = [];
    let fail = true;
    t.mock.method(globalThis, 'fetch', async (_url, init) => {
        const body = JSON.parse(init.body);
        const name = body.response_format.json_schema.name;
        calls.push(name);
        if (name.endsWith('diary_with_summary')) return model({ title: '桂花茶', body: '我和玩家聊起桂花茶。', summary: '谈起家乡。' });
        if (name.endsWith('facts') && fail) return new Response(JSON.stringify({ error: { message: '服务不可达' } }), { status: 503 });
        if (name.endsWith('facts')) return model({ facts: [] });
        assert.match(body.messages[1].content, /经过玩家修订/);
        return model({ changed: false, content: '' });
    });
    await host.connect();
    await host.openClose();
    const tx = () => host.snapshot().state.pendingTransaction;
    assert.equal(tx().results.diary.status, 'draft');
    assert.equal(tx().results.memory.status, 'error');
    assert.equal(tx().results.growth.status, 'idle');
    assert.equal(calls.length, 2);
    fail = false;
    await host.runClose('memory');
    await host.reviewPart('diary', { ...tx().results.diary.value, body: '经过玩家修订' });
    assert.equal(tx().results.growth.value.changed, false);
    await host.reviewPart('memory', []);
    await host.reviewPart('growth', tx().results.growth.value);
    await host.reviewPart('diary', { ...tx().results.diary.value, body: '经过玩家修订第二次' }, false, false);
    assert.equal(tx().results.growth.status, 'outdated');
    await host.reviewPart('diary', tx().results.diary.value);
    await host.reviewPart('growth', tx().results.growth.value);
    const save = context.saveMetadata;
    context.saveMetadata = async () => { throw new Error('write failed'); };
    await assert.rejects(host.confirmClose(), /write failed/);
    await new Promise(resolve => setImmediate(resolve));
    assert.match(host.snapshot().saveError, /write failed/);
    context.saveMetadata = save;
    await host.save();
    assert.equal(host.snapshot().state.diaries.length, 1);
    assert.equal(host.snapshot().state.status, 'pending_next_act');
    context.chat.push({ is_user: true, mes: '下一幕' });
    await events.get('message_sent')(2);
    assert.equal(host.snapshot().state.currentActId, 2);
    assert.equal(context.chat[2].extra.scene_diary.actId, 2);
});

test('fact candidate compares to an existing fact and applies the update with the original ID', async t => {
    const { host } = fixture();
    await host.connect();
    await host.mutate(state => {
        state.memories.push(item('tea', '桂花茶', '阿青喜欢桂花茶。', { category: 'preference', permanent: true }));
    });
    let decisionCount = 0;
    t.mock.method(globalThis, 'fetch', async (_url, init) => {
        const result = JSON.parse(init.body);
        const name = result.response_format.json_schema.name;
        if (name.endsWith('diary_with_summary')) return model({ title: '桂花', body: '我喝了茶。', summary: '谈起家乡。' });
        if (name.endsWith('facts')) return model({ facts: [{ title: '桂花茶', content: '阿青喜欢无糖桂花茶。', category: 'preference', people: ['阿青'], aliases: [], importance: 3, storyTime: null }] });
        decisionCount++;
        const rows = JSON.parse(result.messages[1].content.split('\n\n').at(-1));
        assert.equal(rows[0].existing[0].id, 'tea');
        return model({ decisions: [{ candidateId: rows[0].id, action: 'supplement', targetId: 'tea', content: '阿青喜欢无糖桂花茶。' }] });
    });
    await host.openClose();
    const proposals = host.snapshot().state.pendingTransaction.results.memory.value;
    assert.equal(decisionCount, 1);
    assert.equal(proposals[0].action, 'supplement');
    await host.reviewPart('memory', proposals);
    await host.reviewPart('diary', null, true);
    await host.confirmClose();
    assert.deepEqual(host.snapshot().state.memories.map(item => [item.id, item.content, item.permanent]), [['tea', '阿青喜欢无糖桂花茶。', true]]);
    assert.equal(host.snapshot().state.diaries.length, 0);
});

test('recent full text, history summaries, and fact budgets are independent and de-duplicated', async () => {
    const state = newState();
    state.settings.recentDiaryCount = 1;
    state.diaries = [
        diary({ id: 'old', title: '旧', body: '不会注入的历史全文', summary: '桂花茶旧经历', createdAt: 100 }),
        diary({ id: 'recent', title: '近', body: '最近正文', summary: '桂花茶最近同篇摘要', createdAt: 200 }),
        diary({ id: 'review', title: '未核对', body: '旧日记', summary: '桂花茶旧摘要待核对', createdAt: 50, summaryPending: true }),
    ];
    state.memories = [
        item('tea', '不会注入的事实标题', '桂花茶需密封', { storyTime: '冬至' }),
        item('pending', '旧类', '旧类原文不应注入', { category: 'promise', permanent: true }),
    ];
    state.characterGrowth.content = '现在愿意分享自己的喜好';
    const rank = createRetrieval(state, {}, () => {}, null, { localOnly: true });
    const result = await continuity(state, '桂花茶', rank, () => {});
    assert.match(result, /现在愿意.*最近正文.*桂花茶旧经历.*桂花茶需密封.*冬至/s);
    assert.doesNotMatch(result, /不会注入|最近同篇摘要|旧摘要待核对|旧类原文/);
    state.settings.recentDiaryBudget = 0;
    assert.deepEqual(diarySelection(state).history.map(item => item.id), ['recent', 'old']);
    state.settings.historyBudget = 0;
    assert.doesNotMatch(await continuity(state, '桂花茶', rank, () => {}), /最近正文|旧经历/);
});

test('typed graph keeps directions, redirects edges on merge, and cleans incident edges on deletion', async () => {
    const state = newState();
    const source = item('a', '小钥匙', '开启后门的小钥匙');
    const duplicate = item('d', '后门钥匙', '后门钥匙');
    const location = item('p', '门厅', '小钥匙存放在玄关门厅', { category: 'place' });
    const room = item('q', '老宅', '门厅是老宅的一部分', { category: 'place' });
    state.memories = [source, duplicate, location, room];
    state.edges = [
        { from: 'd', to: 'p', type: 'stored_at', reason: '指定存放位置' },
        { from: 'p', to: 'q', type: 'part_of', reason: '门厅属于老宅' },
    ];
    mergeFacts(state, 'a', ['d'], '后门小钥匙');
    assert.equal(state.edges[0].from, 'a');
    const lookup = selectFacts(state.memories, [{ memory: source, score: 0.9 }], state.edges, '玄关门厅', state.settings);
    assert.deepEqual(lookup.selected.map(item => item.memory.id), ['a', 'p']);
    assert.doesNotMatch(lookup.content, /指定存放位置|老宅/);
    deleteFact(state, 'p');
    assert.deepEqual(state.edges, []);
    assert.deepEqual(state.memories.map(item => item.id), ['a', 'q']);
});

test('full graph approval replaces old edges and incremental approval preserves existing ones', async () => {
    const { host } = fixture();
    await host.connect();
    await host.mutate(state => {
        state.memories = [item('a', 'A', '共享关键词 A'), item('b', 'B', '共享关键词 B'), item('c', 'C', '共享关键词 C')];
        state.edges = [{ from: 'a', to: 'b', type: 'used_for', reason: '旧关联' }];
        state.graphPreview = { mode: 'incremental', revision: state.memoryRevision, reviewed: {} };
    });
    const extra = { from: 'b', to: 'c', type: 'causes', reason: '直接导致', accepted: true };
    await host.applyGraph([extra]);
    assert.equal(host.snapshot().state.edges.length, 2);
    await host.mutate(state => { state.graphPreview = { mode: 'full', revision: state.memoryRevision, reviewed: {} }; });
    await host.applyGraph([extra]);
    assert.deepEqual(host.snapshot().state.edges.map(edge => edge.type), ['causes']);
});
