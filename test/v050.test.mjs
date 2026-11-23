import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { assignMessageToAct, createState, normalizeMemory } from '../core.js';
import { createHost, readHistory } from '../host-v8.js';
import { testChannel } from '../channels.js';
import { fact, makeBackup, readBackup, migrateState, newState, diary } from '../state-v8.js';
import { modulesFor, taskMessages, parseResult } from '../tasks-v8.js';
import { newState as v7 } from '../state-v7.js';

const channel = { id: 'local', name: '试用', url: 'https://example.invalid/v1', key: 'secret-12345678', model: 'proxy-model', temperature: 0.5, maxTokens: 4096 };
const item = (id, title, content, extra = {}) => fact({ id, title, content, category: 'item', ...extra });
const model = (task, value) => Response.json({ choices: [{ message: { content: '说明\n<sd_' + task + '>' + JSON.stringify(value) + '</sd_' + task + '>\n结束' } }] });

function fixture(old = null, options = {}) {
    const events = new Map(), local = new Map(), store = new Map(), saves = [];
    const state = old || newState();
    if (!old) state.settings.bindings = Object.fromEntries(['diary', 'growth', 'memory'].map(task => [task, channel.id]));
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

test('migration backs up schema 6 before writing schema 8 and v2/v4 content round-trips', async () => {
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
    assert.equal(saves[0].scene_diary.version, 8);
    assert.equal('edges' in state, false);
    assert.deepEqual(state.memories.map(item => [item.id, item.locked, item.permanent]), [['a', false, false], ['b', true, true]]);
    assert.equal(state.diaries[0].body, old.acts[0].diary);
    assert.equal(state.diaries[0].summaryPending, undefined);
    assert.equal(Object.hasOwn(state.diaries[0], 'actId'), false);
    assert.equal(Object.hasOwn(state.acts[0], 'diary'), false);
    assert.equal(migrateState(state), state);
    const exported = makeBackup(state, 'session');
    assert.equal(exported.version, 4);
    assert.deepEqual(readBackup(newState(), exported, 'session').diaries, state.diaries);
    const legacy = { ...exported, version: 2, diaries: [{ actId: 1, title: '旧日记', diary: '旧正文' }], memoryLinks: old.memoryLinks };
    const restored = readBackup(state, legacy, 'session');
    assert.equal(restored.diaries[0].summaryPending, undefined);
    assert.equal(restored.diaries[0].body, '旧正文');
    assert.equal('edges' in restored, false);
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
    assert.equal(context.chatMetadata.scene_diary.version, 8);
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

test('schema 7 migration preserves pending drafts, flags and user preferences', () => {
    const old = v7();
    old.settings.recallMessageCount = 2; old.settings.recallLimit = 6; old.settings.prompts.diary = '自己的任务';
    old.settings.bindings = { diary: 'a', graph: 'b' };
    old.memories = [item('a','标题','原文',{ permanent: true, locked: true, needsClassification: true }), { ...item('b','删除','内容'), deletedAt: 42 }];
    old.pendingTransaction = { results: { diary: { status: 'confirmed', value: { title: '日记', body: '正文', summary: '摘要' } },
        memory: { status: 'draft', value: [{ id: 'proposal', action: 'update', targetId: 'a', value: old.memories[0], accepted: true }] },
        growth: { status: 'draft', value: { changed: true, content: '旧成长草稿' } } } };
    const next = migrateState(old);
    assert.deepEqual(next.settings.bindings, { diary: 'a' });
    assert.equal(next.settings.queryDepth, 1); assert.equal(next.settings.candidateCount, 6);
    assert.equal(next.settings.prompts.diary.description, '自己的任务');
    assert.deepEqual(next.memories.map(m => [m.id,m.locked,m.permanent]), [['a',true,true]]);
    assert.deepEqual(next.pendingTransaction.results.diary, { status: 'confirmed', value: { title: '日记', body: '正文' } });
    assert.equal(next.pendingTransaction.results.memory.value[0].accepted, false);
    assert.equal(next.legacyGrowthDraft, '旧成长草稿');
    const backup = { ...makeBackup(next,'chat'), version: 3, memories: old.memories };
    assert.deepEqual(readBackup(next, backup, 'chat').memories, next.memories);
});

test('channel check and task outputs use exactly one tagged object and no format parameters', async t => {
    const { context } = fixture();
    t.mock.method(globalThis, 'fetch', async (_url, init) => {
        const body = JSON.parse(init.body);
        assert.equal(body.response_format, undefined); assert.equal(body.custom_include_body, undefined);
        assert.deepEqual(body.messages.map(m => m.role), ['system','user']);
        return model('test', { ok: true });
    });
    assert.deepEqual(await testChannel(context,channel), { ok:true });
    for (const bad of ['{"ok":true}', '<sd_test>{}</sd_test>', '<sd_test>{"ok":true}</sd_test>'.repeat(2), '<sd_test>{broken}</sd_test>']) {
        assert.throws(() => parseResult('test',bad));
    }
});

test('close retries one failure and inserts only approved new points; growth stays manual', async t => {
    const { host, context, events } = fixture();
    await host.connect();
    await host.mutate(s => { s.memories.push(item('existing','茶','旧内容')); });
    let fail = true; const calls = [];
    t.mock.method(globalThis,'fetch', async (_url, init) => {
        const payload = JSON.parse(init.body), content = payload.messages[1].content;
        const task = content.match(/<sd_(diary|memory|growth)>/)[1]; calls.push(task);
        assert.deepEqual(payload.messages.map(m => m.role), ['system','user']);
        assert.equal(payload.response_format, undefined); assert.equal(payload.custom_include_body, undefined);
        assert.deepEqual([...content.matchAll(/\[(背景参考|任务描述|内容素材|格式规定)\]/g)].map(m=>m[1]), ['背景参考','任务描述','内容素材','格式规定']);
        if (task === 'diary') return model(task,{title:'花茶',body:'喝茶的经历'});
        if (task === 'growth') return model(task,{changed:false,content:''});
        if (fail) return new Response('offline',{status:503});
        return model(task,{memories:[1,2].map(n=>({title:'茶',content:'新内容'+n,storyTime:null,importance:3}))});
    });
    await host.openClose();
    const tx = () => host.snapshot().state.pendingTransaction;
    assert.equal(tx().results.memory.status,'error'); assert.equal(tx().results.diary.status,'draft');
    await host.reviewPart('diary',tx().results.diary.value);
    fail = false; await host.runClose('memory');
    const proposals = structuredClone(tx().results.memory.value); proposals[1].accepted = false;
    await host.reviewPart('memory',proposals); await host.confirmClose();
    assert.deepEqual(host.snapshot().state.memories.map(m=>m.content), ['旧内容','新内容1']);
    assert.equal(calls.length,3); assert.equal(calls.includes('growth'),false);
    await host.generateGrowth('recent'); assert.equal(host.snapshot().growthPreview.changed,false);
    context.chat.push({is_user:true,mes:'下一幕'}); await events.get('message_sent')(2);
    assert.equal(host.snapshot().state.currentActId,2);
});

test('global growth retains profile on context overflow; recent candidates track only selected sources', async t => {
    const { host } = fixture(); await host.connect();
    await host.mutate(s => { s.settings.growthDiaryCount = 1; s.characterGrowth.content = '原稿';
        s.settings.prompts.growth.description = '近期任务';
        s.settings.prompts.growth.globalDescription = '重建任务';
        s.diaries = [1,2].map(n=>diary({title:'日记'+n,body:'正文'+n,createdAt:n})); });
    let global = true, calls = 0;
    t.mock.method(globalThis,'fetch', async (_url, init) => {
        calls++;
        const text = JSON.parse(init.body).messages[1].content;
        if (global) {
            assert.match(text, /重建任务[\s\S]*正文1[\s\S]*正文2/);
            assert.doesNotMatch(text, /当前角色画像|原稿|近期任务/);
            return new Response('context length exceeded', { status: 400 });
        }
        assert.match(text, /当前角色画像[\s\S]*原稿[\s\S]*近期任务/);
        assert.doesNotMatch(text, /正文1|重建任务/);
        return model('growth',{changed:true,content:'新画像'});
    });
    await assert.rejects(host.generateGrowth('global'),/长上下文/);
    assert.equal(host.snapshot().state.characterGrowth.content,'原稿');
    global = false; await host.generateGrowth('recent');
    await host.mutate(s=>{s.diaries[1].body+='修改';});
    await assert.rejects(host.acceptGrowth('候选'),/已变化/);
    await host.generateGrowth('recent'); await host.mutate(s=>{s.diaries[0].body+='早期修改';});
    await host.acceptGrowth('候选'); assert.equal(host.snapshot().state.characterGrowth.content,'候选');
    assert.equal(calls,3);
});

test('all three task prompts use precisely the five preview modules', async () => {
    const state = newState(), character = { char: '角色', user: '玩家', context: '角色卡设定' };
    state.characterGrowth.content = '生效画像';
    state.diaries = [diary({ title: '日记标题', body: '日记原文' })];
    for (const task of ['diary', 'memory', 'growth']) {
        state.settings.prompts[task] = { system: '{{char}}的系统模块', description: '{{user}}的任务' };
        const modules = modulesFor(task, state, character, [{ is_user: true, mes: '对话原文' }]);
        const material = task === 'growth' ? '日记标题\n日记原文' : '玩家: 对话原文';
        assert.deepEqual(modules, { system: '角色的系统模块', background: '角色卡设定\n\n[当前角色画像]\n生效画像',
            description: '玩家的任务', material, format: modules.format });
        assert.match(modules.format, new RegExp('<sd_' + task + '>'));
        assert.deepEqual(taskMessages(modules), [{ role: 'system', content: modules.system }, { role: 'user',
            content: '[背景参考]\n' + modules.background + '\n\n[任务描述]\n玩家的任务\n\n[内容素材]\n' + material + '\n\n[格式规定]\n' + modules.format }]);
    }
    const {host} = fixture(); await host.connect();
    await assert.rejects(host.generateGrowth('global'), /没有有效日记/);
});

test('a schema 4 chat from the v0.3.1 fixture migrates through the current host', async () => {
    const legacy = JSON.parse(await readFile(new URL('./fixtures/v031-chat.json', import.meta.url), 'utf8'));
    const raw = legacy.metadata.scene_diary;
    const { host, context } = fixture(raw);
    context.chat = legacy.messages;
    context.chatMetadata = legacy.metadata;

    await host.connect();

    const state = host.snapshot().state;
    const backup = await host.migrationBackup();
    assert.equal(state.version, 8);
    assert.equal(backup.schema, 4);
    assert.deepEqual(backup.metadata.scene_diary, raw);
    assert.deepEqual(backup.messages, legacy.messages);
    assert.deepEqual(state.diaries.map(diary => diary.body), raw.acts.filter(act => act.diary).map(act => act.diary));
    assert.deepEqual(state.memories.map(memory => memory.id), raw.memories
        .filter(memory => !memory.deletedAt && !['archived', 'superseded'].includes(memory.lifecycle)).map(memory => memory.id));
    assert.equal(state.characterGrowth.content, raw.characterGrowth.content);
});
