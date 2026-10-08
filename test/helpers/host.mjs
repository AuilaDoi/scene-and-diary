import { readFile } from 'node:fs/promises';
import { createState, assignMessageToAct } from '../../core.js';
export async function hostFixture(messages = ['你好'], handler = null, options = {}) {
    const original = { document: globalThis.document, fetch: globalThis.fetch, SillyTavern: globalThis.SillyTavern, toastr: globalThis.toastr, indexedDB: globalThis.indexedDB, __TAURI_RUNNING__: globalThis.__TAURI_RUNNING__ };
    const saved = options.saved || new Map(), notices = [], requests = [], events = [], state = createState(), chat = options.chat ? structuredClone(options.chat) : messages.map((mes, index) => ({ mes, is_user: index % 2 === 0, name: index % 2 === 0 ? '玩家' : '林', extra: {} }));
    if (!options.metadata) chat.forEach((message, index) => assignMessageToAct(state, message, 1, index));
    const context = { chatId: 'test-chat', chat, chatMetadata: options.metadata ? structuredClone(options.metadata) : { scene_diary: state }, mainApi: 'openai', name1: '玩家', name2: '林', characterId: 0, characters: [{ name: '林', chat: 'test-chat', avatar: 'a.png' }], getCharacterCardFields: () => ({ description: '角色卡不能成为提取素材' }), accountStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) } };
    context.saveMetadata = async () => { events.push({ type: 'save', schema: context.chatMetadata.scene_diary?.version }); saved.set('persisted', structuredClone(context.chatMetadata)); };
    if (options.tauri) {
        globalThis.__TAURI_RUNNING__ = true;
        context.chatCompletionSettings = { chat_completion_source: 'deepseek', model: 'deepseek-flash' };
        context.getRequestHeaders = () => ({ 'Content-Type': 'application/json' });
        context.jsonDependencies = options.jsonDependencies;
    } else globalThis.__TAURI_RUNNING__ = false;
    context.generateRawData = async input => {
        requests.push(input);
        if (handler) return handler(input, requests.length);
        const schema = input.jsonSchema?.name;
        if (schema?.endsWith('_diary')) return { title: '幕', diary: '一起聊了旅行。' };
        if (schema?.endsWith('_growth')) return { characterGrowth: '两人开始熟悉彼此。' };
        if (schema?.endsWith('_memory')) return { memories: [{ category: 'promise', title: '北海道约定', content: '两人约好一起去北海道。', people: ['林', '玩家'], aliases: [], importance: 4, storyTime: null }] };
        return { operations: [] };
    };
    const local = options.local || new Map();
    globalThis.SillyTavern = { libs: { localforage: { getItem: async key => local.get(key), setItem: async (key, value) => { events.push({ type: 'local-copy', key, schema: context.chatMetadata.scene_diary?.version }); local.set(key, structuredClone(value)); }, removeItem: async key => local.delete(key) } } };
    globalThis.document = { readyState: 'loading', addEventListener() {}, querySelector: () => null };
    globalThis.toastr = Object.fromEntries(['info', 'warning', 'error', 'success'].map(type => [type, text => notices.push({ type, text })]));
    globalThis.fetch = async (url, init) => {
        if (options.tauri && url === '/api/backends/chat-completions/generate') {
            const input = JSON.parse(init.body); requests.push(input);
            const output = await handler(input, requests.length, init);
            if (output instanceof Response) return output;
            return new Response(JSON.stringify({ choices: [{ message: { content: typeof output === 'string' ? output : JSON.stringify(output) } }] }));
        }
        if (url !== '/api/chats/get') throw new Error('network unavailable');
        return { ok: true, json: async () => [{ chat_metadata: saved.get('persisted') }, ...chat] };
    };
    // An empty valid IndexedDB cache lets tests exercise the model request, not a missing browser API.
    globalThis.indexedDB = { open() { const request = {}; queueMicrotask(() => { request.result = { close() {}, transaction() { return { objectStore() { return { get() { const read = {}; queueMicrotask(() => { read.result = null; read.onsuccess(); }); return read; } }; } }; } }; request.onsuccess(); }); return request; } };
    const id = crypto.randomUUID(); globalThis.__sceneDiaryHosts ||= {}; globalThis.__sceneDiaryHosts[id] = context;
    let code = await readFile(new URL('../../index.js', import.meta.url), 'utf8');
    code = code.replace(/^import .* from '\.\.\/\.\.\/\.\.\/\.\.\/script.js';/m, 'const extension_prompt_roles = { SYSTEM: 0 }, extension_prompt_types = { NONE: 0, IN_CHAT: 1 }; const setExtensionPrompt = () => {};');
    code = code.replace(/^import .* from '\.\.\/\.\.\/\.\.\/st-context.js';/m, `const getContext = () => globalThis.__sceneDiaryHosts[${JSON.stringify(id)}];`);
    code = code.replace(/from '(\.\/[^']+)'/g, (_, path) => `from '${new URL('../../' + path.slice(2), import.meta.url).href}'`);
    if (options.tauri) code = code.replace('await loadTauriJsonDependencies()', `await globalThis.__sceneDiaryHosts[${JSON.stringify(id)}].jsonDependencies()`);
    code += '\nexport { initializeChat, getState, closeAct, confirmClose, cancelClose, runCloseParts, startMaintenance, runMaintenance, confirmMaintenance, cancelMaintenance, recoverSave, prepareContinuity, recallInput, sceneDiaryRearrangeChat, commitMemoryMutation }; export const hostStatus = () => ({ disabledReason, saveUnverified, migrationPending, migrating: migrationPreparing.size + migrationSaving.size });';
    code += '\nexport { renderDebug, promptReady, stopRecall, syncVectors }; export const recallTrace = () => structuredClone(lastRecallTrace);';
    const api = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64')); if (options.initialize !== false) api.initializeChat();
    return { api, context, saved, local, notices, requests, events, async settle() { for (let i = 0; i < 200; i++) { await new Promise(resolve => setTimeout(resolve, 1)); if (!api.hostStatus().migrating) return; } throw new Error('host initialization did not settle'); }, cleanup() { Object.assign(globalThis, original); delete globalThis.__sceneDiaryHosts[id]; } };
}
