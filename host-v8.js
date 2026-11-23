import {
    STORAGE_KEY, assignMessageToAct, beginNextAct, currentAct, buildCharacterContext,
    isNormalRpMessage, sourceFingerprint, filterPromptMessages, insertContinuityBeforeHistory, newId,
} from './core.js';
import { channels, generateTask } from './channels.js';
import { semanticErrorDetail } from './semantic.js';
import { createRetrieval, continuity, localPreview, queryFor } from './recall-v8.js';
import { VERSION, PARTS, TASKS, clean, diary, validFact, makeBackup, readBackup, migrateState, newState, writeGrowth } from './state-v8.js';
import { applyProposals, closeOutput, growthSources, modulesFor, taskMessages, TaskResponseError } from './tasks-v8.js';

export const VERSION_LABEL = '0.5.3';
const isReviewed = item => ['confirmed', 'skipped'].includes(item?.status);

export async function readHistory(live, history, from = 0, complete = false, restoreSwipes = false, hasEnough = null) {
    if (!history || (!complete && Number.isInteger(from) && live.length > from && live.slice(from).every(Boolean))) return live;
    let page = await history.tail({ limit: 100 });
    const last = page.startIndex + page.messages.length;
    const offset = Math.max(0, last - live.length);
    const all = [], cold = new Map();
    live.forEach((message, index) => {
        if (!message) return;
        const position = index + offset;
        all[position] = message;
        if (restoreSwipes && message.tt_swipe_cold) cold.set(message.tt_swipe_cold.record - 1, position);
    });
    for (;;) {
        for (let index = 0; index < page.messages.length; index++) {
            const position = page.startIndex + index;
            const disk = page.messages[index];
            all[position] ||= disk;
            if (cold.has(position)) {
                const slot = cold.get(position), { tt_swipe_cold, ...rest } = all[slot];
                const restore = (current, original) => current?.map((value, index) => value ?? original?.[index]) || original;
                all[slot] = { ...rest, swipes: restore(rest.swipes, disk.swipes), swipe_info: restore(rest.swipe_info, disk.swipe_info) };
                cold.delete(position);
            }
        }
        if (!page.hasMoreBefore || page.startIndex <= from || hasEnough?.(all, page.startIndex)) {
            if (cold.size) throw new Error('无法读取完整的历史候选回复。');
            return all;
        }
        page = await history.before(page, { limit: 100 });
    }
}

export function createHost(getContext, applyPrompt, environment = globalThis) {
    const context = () => getContext();
    const metadata = () => context().chatMetadata;
    const chatId = () => String(context().chatId ?? '');
    const chat = () => context().chat || [];
    const subscriptions = new Set();
    const controllers = new Map();
    const storage = () => environment.SillyTavern?.libs?.localforage;
    const sessionAccount = newId('account');
    const account = () => {
        const prefs = context().accountStorage;
        const id = prefs?.getItem('scene_diary_account_id') || sessionAccount;
        if (!prefs?.getItem('scene_diary_account_id')) prefs?.setItem('scene_diary_account_id', id);
        return id;
    };
    let current = null, saveQueue = Promise.resolve(), saveError = '', saved = false, pendingSaves = 0, blocker = '', trace = [], prompt = '', recallController, refreshRequest = 0;
    let growthProgress = '', growthPreview = null, growthFailure = null;
    let closeRawResponses = {}, dialogueRevision = 0;
    const historyHandle = async () => {
        const tauri = environment.__TAURITAVERN__;
        if (!tauri) return null;
        await tauri.ready;
        return tauri.api?.chat?.current?.handle?.();
    };
    const sameChat = scope => !!scope && current === scope && scope.id === chatId() && scope.metadata === metadata();
    const state = () => current && sameChat(current) && !blocker ? metadata()?.[STORAGE_KEY] : null;
    const contentState = () => state() || metadata()?.[STORAGE_KEY];
    const snapshot = () => ({
        state: state(), persisted: contentState(), chatId: chatId(), blocker, saveError, saved, pendingSaves, trace,
        growthProgress, growthPreview, growthFailure, closeRawResponses, dialogueRevision, busy: [...controllers.keys()],
        channels: channels(context()), messages: chat().length,
    });
    const publish = () => subscriptions.forEach(fn => fn(snapshot()));
    function assertChat(scope) {
        if (!scope || !sameChat(scope)) throw new DOMException('聊天已切换', 'AbortError');
    }

    function save(messagesChanged = false) {
        const scope = current;
        if (messagesChanged) scope.messageRevision++;
        pendingSaves++;
        publish();
        const request = saveQueue.then(async () => {
            if (!sameChat(scope)) return false;
            const ctx = context(), revision = scope.messageRevision;
            const method = revision !== scope.savedMessageRevision ? ctx.saveChat || ctx.saveMetadata : ctx.saveMetadata || ctx.saveChat;
            if (!method) throw new Error('宿主保存接口不可用。');
            await method();
            if (sameChat(scope)) { scope.savedMessageRevision = revision; saveError = ''; saved = true; }
            return sameChat(scope);
        });
        saveQueue = request.catch(error => {
            if (sameChat(scope)) { saveError = error.message; saved = false; }
        }).finally(() => {
            if (sameChat(scope)) { pendingSaves--; publish(); }
        });
        return request;
    }

    function mutate(callback, messagesChanged = false) {
        const before = state();
        if (!before) throw new Error('请先打开受支持的聊天。');
        const next = structuredClone(before);
        const result = callback(next);
        next.lastUpdatedAt = Date.now();
        metadata()[STORAGE_KEY] = next;
        publish();
        return save(messagesChanged).then(() => result);
    }

    function migrationKey(version) {
        return 'scene_diary_migration_backup_' + account() + '_' + chatId() + '_schema' + version + '_to' + VERSION;
    }

    async function initialize() {
        const id = chatId(), data = metadata();
        const request = ++refreshRequest;
        if (current?.id !== id || current?.metadata !== data) {
            for (const controller of controllers.values()) controller.abort();
            controllers.clear();
            recallController?.abort();
            current = { id, metadata: data, messageRevision: 0, savedMessageRevision: 0 };
            saveError = ''; saved = false; pendingSaves = 0; trace = []; prompt = '';
            growthProgress = ''; growthPreview = null; growthFailure = null;
            closeRawResponses = {}; dialogueRevision++;
            applyPrompt('');
        }
        const scope = current;
        if (!id || context().groupId || !data) { blocker = '请选择一个单角色聊天。'; publish(); return; }
        if (environment.AutoCardUpdaterAPI) { blocker = '检测到 SP·数据库，请停用 SP 并刷新后使用本扩展。'; applyPrompt(''); publish(); return; }
        const old = data[STORAGE_KEY];
        if (old?.version > VERSION) { blocker = '聊天数据版本高于当前插件支持范围，请使用对应的插件版本。'; publish(); return; }
        if (old && old.version !== VERSION) {
            blocker = '正在备份旧聊天…'; publish();
            try {
                const key = migrationKey(old.version);
                const history = await historyHandle();
                const messages = await readHistory(chat(), history?.history, 0, true, true);
                if (!sameChat(scope) || request !== refreshRequest) return;
                const backup = await storage().getItem(key);
                if (!backup) await storage().setItem(key, {
                    schema: old.version, savedAt: Date.now(), metadata: structuredClone(data), messages: structuredClone(messages),
                    pendingRecovery: old.memorySpaceId ? await storage().getItem('scene_diary_recovery_' + account() + '_' + id + '_' + old.memorySpaceId) : null,
                });
                if (!sameChat(scope) || request !== refreshRequest || data[STORAGE_KEY] !== old) return;
                data[STORAGE_KEY] = migrateState(old);
                blocker = '';
                await save();
            } catch (error) {
                if (sameChat(scope) && data[STORAGE_KEY] === old) { blocker = '迁移备份失败，旧聊天仍保留。' + error.message; publish(); }
            }
            return;
        }
        if (!old && chat().filter(isNormalRpMessage).length > 1) { blocker = '已有聊天，请选择开始接管的楼层。'; publish(); return; }
        blocker = '';
        if (!old) await takeOver(0);
        else {
            const tx = old.pendingTransaction;
            if (tx && PARTS.some(kind => tx.results[kind]?.status === 'running' && !controllers.has('close:' + kind))) {
                await mutate(next => {
                    for (const kind of PARTS) {
                        const item = next.pendingTransaction.results[kind];
                        if (item?.status === 'running' && !controllers.has('close:' + kind)) { item.status = 'error'; item.error = '请求已中断，可单独重试本项。'; }
                    }
                });
            }
            if (old.status === 'active' && chat().some(message => isNormalRpMessage(message) && !message.extra?.scene_diary?.actId)) {
                await mutate(next => chat().forEach((message, index) => {
                    if (isNormalRpMessage(message) && !message.extra?.scene_diary?.actId) assignMessageToAct(next, message, next.currentActId, index);
                }), true);
            }
        }
        publish();
    }

    async function takeOver(index) {
        if (environment.AutoCardUpdaterAPI || context().groupId || !chatId() || metadata()?.[STORAGE_KEY]) return;
        blocker = '';
        const next = newState();
        chat().forEach((message, position) => {
            if (position >= index && isNormalRpMessage(message)) assignMessageToAct(next, message, 1, position);
        });
        currentAct(next).startMessageIndex = index;
        metadata()[STORAGE_KEY] = next;
        await save(true);
    }

    async function readAct(act, scope) {
        if (!act.messageIds.length) return [];
        const live = chat();
        const ids = new Set(act.messageIds);
        const matches = messages => messages.filter(message => isNormalRpMessage(message)
            && Number(message.extra?.scene_diary?.actId) === act.id && ids.has(message.extra?.scene_diary?.messageId));
        const visible = matches(live);
        if (visible.length === ids.size) return visible;
        const handle = await historyHandle();
        assertChat(scope);
        if (!handle?.history) return visible;
        const all = await readHistory(live, handle.history, 0, true);
        assertChat(scope);
        // A deletion must not be revived from a previous on-disk copy when all slots are loaded.
        return live.every(Boolean) && all.length <= live.length ? visible : matches(all);
    }

    function character() {
        const ctx = context(), fields = ctx.getCharacterCardFields?.() || {};
        return { char: ctx.name2 || fields.name || '角色', user: ctx.name1 || '玩家', context: buildCharacterContext(fields) };
    }

    async function openClose() {
        const scope = current, active = state(), act = currentAct(active);
        if (!act || active.status !== 'active') return;
        const messages = await readAct(act, scope);
        if (!messages.length) throw new Error('本幕没有可整理的对话。');
        assertChat(scope);
        if (state() !== active) throw new Error('当前幕已变化，请重新结束本幕。');
        await mutate(next => {
            next.status = 'preview';
            currentAct(next).status = 'closing';
            next.pendingTransaction = {
                id: newId('close'), actId: act.id, sourceFingerprint: sourceFingerprint(messages), character: character(),
                results: Object.fromEntries(PARTS.map(kind => [kind, { status: 'idle' }])),
            };
        });
        await Promise.allSettled([runClose('diary'), runClose('memory')]);
    }

    function begin(name) {
        if (controllers.has(name)) return null;
        const controller = new AbortController();
        controllers.set(name, controller); publish();
        return controller;
    }
    function end(name, controller) {
        if (controllers.get(name) === controller) { controllers.delete(name); publish(); }
    }

    const addTrace = (scope, item) => { if (sameChat(scope)) { trace.push(item); if (trace.length > 100) trace.shift(); publish(); } };
    function requestWith(input, signal, scope) {
        const frozen = new Map(channels(context()).map(channel => [channel.id, structuredClone(channel)]));
        return (task, messages) => {
            assertChat(scope); signal.throwIfAborted();
            const channel = frozen.get(input.settings.bindings[task]);
            if (!channel) throw new Error('请在设置中为「' + TASKS[task] + '」绑定自建渠道。');
            return generateTask(context(), channel, task, messages, signal);
        };
    }
    async function rankWith(input, scope, signal, options) {
        const handle = await historyHandle();
        assertChat(scope);
        const preferences = context().accountStorage;
        return createRetrieval(input, {
            chat: scope.id, account: account(), store: handle?.store,
            embeddingKey: preferences?.getItem('scene_diary_embedding_key') || '', rerankKey: preferences?.getItem('scene_diary_rerank_key') || '',
        }, item => addTrace(scope, item), signal, options);
    }

    async function runClose(kind) {
        const scope = current, input = state(), transaction = input?.pendingTransaction;
        if (!transaction || !PARTS.includes(kind)) return;
        const name = 'close:' + kind, controller = begin(name);
        if (!controller) return;
        delete closeRawResponses[kind];
        const signal = controller.signal;
        const request = requestWith(input, signal, scope);
        const previous = transaction.results[kind];
        const isCurrent = () => sameChat(scope) && state()?.pendingTransaction?.id === transaction.id && controllers.get(name) === controller;
        try {
            const messages = structuredClone(await readAct(currentAct(input), scope));
            signal.throwIfAborted();
            if (!isCurrent() || sourceFingerprint(messages) !== transaction.sourceFingerprint) throw new Error('本幕对话已经修改，请取消关幕后重开审核。');
            await mutate(next => {
                next.pendingTransaction.results[kind] = { ...previous, status: 'running', error: '' };
            });
            signal.throwIfAborted();
            const value = await closeOutput(kind, input, transaction, messages, request);
            if (!isCurrent()) return;
            signal.throwIfAborted();
            const latest = await readAct(currentAct(state()), scope);
            if (sourceFingerprint(latest) !== transaction.sourceFingerprint) throw new Error('本幕对话已经修改，请取消关幕后重开审核。');
            if (!isCurrent()) return;
            signal.throwIfAborted();
            await mutate(next => {
                next.pendingTransaction.results[kind] = { status: 'draft', value };
            }).catch(() => {});
        } catch (error) {
            if (!isCurrent()) return;
            const result = state().pendingTransaction.results[kind];
            if (result.status === 'outdated' || result.status === 'skipped') return;
            if (error instanceof TaskResponseError && typeof error.rawResponse === 'string') {
                closeRawResponses[kind] = error.rawResponse;
            }
            await mutate(next => { next.pendingTransaction.results[kind] = { ...previous, status: 'error', error: error.message }; }).catch(() => {});
        } finally { end(name, controller); }
    }

    async function reviewPart(kind, value, skip = false, confirm = true) {
        if (!PARTS.includes(kind) || controllers.has('close:' + kind) || !state()?.pendingTransaction) return;
        if (confirm && !skip && kind === 'diary' && !clean(value?.body)) throw new Error('请填写日记正文。');
        if (!skip && kind === 'memory' && !Array.isArray(value)) throw new Error('请先提取记忆。');
        if (confirm && !skip && kind === 'memory' && value.some(item => item.accepted && !validFact(item.value))) throw new Error('请检查勾选记忆点的标题、内容和重要度。');
        await mutate(next => {
            delete closeRawResponses[kind];
            next.pendingTransaction.results[kind] = skip ? { status: 'skipped' } : { status: confirm ? 'confirmed' : 'draft', value };
        });
    }

    async function confirmClose() {
        const scope = current, input = state(), tx = input?.pendingTransaction;
        if (!tx || !PARTS.every(kind => isReviewed(tx.results[kind]))) throw new Error('请先处理两项审核。');
        const messages = await readAct(currentAct(input), scope);
        assertChat(scope);
        if (state() !== input) throw new Error('审核内容已变化，请重试提交。');
        if (sourceFingerprint(messages) !== tx.sourceFingerprint) throw new Error('本幕来源已变化，请取消后重新整理。');
        await mutate(next => {
            const act = currentAct(next);
            const { diary: reviewed, memory } = tx.results;
            if (memory.status === 'confirmed') applyProposals(next, memory.value);
            if (reviewed.status === 'confirmed') next.diaries.push(diary({ ...reviewed.value, createdAt: Date.now() }));
            Object.assign(act, { status: 'closed', closedAt: Date.now(), sourceFingerprint: tx.sourceFingerprint,
                startMessageIndex: messages[0]?.extra?.scene_diary?.messageIndex ?? act.startMessageIndex,
                endMessageIndex: messages.at(-1)?.extra?.scene_diary?.messageIndex ?? act.endMessageIndex });
            next.status = 'pending_next_act'; next.pendingTransaction = null;
            closeRawResponses = {};
        });
    }

    function cancelClose() {
        for (const kind of PARTS) {
            const name = 'close:' + kind;
            controllers.get(name)?.abort();
            controllers.delete(name);
        }
        closeRawResponses = {};
        return mutate(next => { currentAct(next).status = 'active'; next.status = 'active'; next.pendingTransaction = null; });
    }

    function previewCharacter(task) {
        return (task !== 'growth' && state()?.pendingTransaction?.character) || character();
    }

    async function readPreviewDialogue() {
        const scope = current;
        await saveQueue;
        assertChat(scope);
        const act = currentAct(state());
        return act ? readAct(act, scope) : [];
    }

    async function generateGrowth(mode = 'recent') {
        const scope = current, input = state(), sources = growthSources(input, mode);
        if (!sources.length) throw new Error('所选范围没有有效日记。');
        const work = begin('growth');
        if (!work) return;
        growthFailure = null;
        try {
            growthProgress = '正在读取 ' + sources.length + ' 篇日记…'; publish();
            const modules = modulesFor('growth', input, character(), [], mode);
            const result = await requestWith(input, work.signal, scope)('growth', taskMessages(modules));
            work.signal.throwIfAborted(); assertChat(scope);
            growthPreview = { ...result, mode, count: sources.length, revision: input.characterGrowth.revision, diaries: JSON.stringify(sources) };
        } catch (error) {
            work.signal.throwIfAborted(); assertChat(scope);
            if (error instanceof TaskResponseError && typeof error.rawResponse === 'string') {
                growthFailure = { message: error.message, rawResponse: error.rawResponse };
                return;
            }
            if (mode === 'global' && /context|too many tokens|input.*long|上下文|上下文长度/i.test(error.message)) {
                throw new Error(error.message + '。请更换长上下文模型后重试。');
            }
            throw error;
        } finally { if (sameChat(scope)) growthProgress = ''; end('growth', work); }
    }
    async function acceptGrowth(content) {
        const preview = growthPreview;
        if (!preview?.changed) return;
        if (preview.appliedRevision === state().characterGrowth.revision && content === state().characterGrowth.content) {
            await save();
        } else await mutate(next => {
            if (next.characterGrowth.revision !== preview.revision || JSON.stringify(growthSources(next, preview.mode)) !== preview.diaries) throw new Error('画像或本次日记已变化，请重新生成。');
            if (!clean(content)) throw new Error('请填写候选画像。');
            writeGrowth(next, content);
            preview.appliedRevision = next.characterGrowth.revision;
        });
        if (growthPreview === preview) growthPreview = null;
        publish();
    }

    async function recallQuery(input, scope) {
        const live = chat();
        const query = queryFor(live, input.settings);
        if (query.rows.length > input.settings.queryDepth || !environment.__TAURITAVERN__) return query;
        const handle = await historyHandle();
        assertChat(scope);
        if (!handle?.history) return query;
        const enoughForQuery = (all, start) => queryFor(all.slice(start), input.settings).rows.length > input.settings.queryDepth;
        const rows = await readHistory(live, handle.history, 0, true, false, enoughForQuery);
        assertChat(scope);
        return queryFor(rows, input.settings);
    }

    async function rearrange(promptChat, _size, abort) {
        applyPrompt(''); prompt = '';
        const input = state(), scope = current;
        if (!input || environment.AutoCardUpdaterAPI || !['active', 'preview'].includes(input.status) || !Array.isArray(promptChat)) return;
        recallController?.abort();
        const controller = recallController = new AbortController(), signal = controller.signal;
        trace = [];
        try {
            const query = await recallQuery(input, scope);
            if (query.errors.length) throw new Error('最近对话正文标签未匹配，请检查正文提取设置。');
            const rank = await rankWith(input, scope, signal);
            const content = await continuity(input, query.text, rank, item => addTrace(scope, item));
            assertChat(scope); signal.throwIfAborted();
            if (!['active', 'preview'].includes(state()?.status) || state()?.currentActId !== input.currentActId) throw new DOMException('当前剧幕已变化', 'AbortError');
            if (state() !== input) throw new Error('聊天内容已更新，请重新生成。');
            promptChat.splice(0, promptChat.length, ...filterPromptMessages(promptChat, input.currentActId));
            if (String(context().mainApi).toLowerCase() === 'openai') prompt = content;
            else applyPrompt(content, Math.min(promptChat.length, 100));
            if (trace.some(row => row.status === 'warning')) environment.toastr?.warning?.('语义召回部分失败，详情见 scene&diary 诊断。');
        } catch (error) {
            if (!signal.aborted && sameChat(scope)) {
                const detail = semanticErrorDetail(error);
                addTrace(scope, { stage: '召回', status: 'error', title: detail });
                environment.toastr?.error?.(detail);
            }
            abort?.(true);
        }
    }

    async function promptReady(event) {
        const input = state(), scope = current;
        if (!input || environment.AutoCardUpdaterAPI || !['active', 'preview'].includes(input.status) || !Array.isArray(event.chat)) return;
        const pending = prompt; prompt = '';
        if (!event.dryRun) { insertContinuityBeforeHistory(event.chat, pending); return; }
        const query = await recallQuery(input, scope);
        if (query.errors.length) return;
        const preview = await localPreview(input, query.text);
        if (state() === input) insertContinuityBeforeHistory(event.chat, preview);
    }

    function onMessage(index, user) {
        const input = state(), message = chat()[Number(index)];
        if (!input || !isNormalRpMessage(message) || !!message.is_user !== user) return;
        if (!['active', 'preview'].includes(input.status) && !(user && input.status === 'pending_next_act')) return;
        return mutate(next => {
            if (next.status === 'pending_next_act') beginNextAct(next, message, Number(index));
            else assignMessageToAct(next, message, next.currentActId, Number(index));
        }, true);
    }

    function sourceEdited(index) {
        const input = state();
        if (!input) return;
        const id = chat()[Number(index)]?.extra?.scene_diary?.actId;
        const refreshDialogue = !id || id === input.currentActId;
        if (refreshDialogue) dialogueRevision++;
        if (!input.diaries.length || (id && input.acts.find(act => act.id === id)?.status !== 'closed') || input.characterGrowth.reviewRecommended) {
            if (refreshDialogue) publish();
            return;
        }
        return mutate(next => { next.characterGrowth.reviewRecommended = true; });
    }

    function connect() {
        const ctx = context(), events = ctx.eventTypes || {};
        const bind = (name, fallback, handler) => ctx.eventSource?.on(events[name] || fallback, (...args) => {
            try { return Promise.resolve(handler(...args)).catch(error => { if (!saveError) environment.toastr?.error?.(error.message); }); }
            catch (error) { environment.toastr?.error?.(error.message); }
        });
        bind('CHAT_CHANGED', 'chat_id_changed', initialize);
        bind('CHAT_LOADED', 'chatLoaded', initialize);
        bind('MESSAGE_SENT', 'message_sent', index => onMessage(index, true));
        bind('MESSAGE_RECEIVED', 'message_received', index => onMessage(index, false));
        bind('MESSAGE_EDITED', 'message_edited', sourceEdited);
        bind('MESSAGE_UPDATED', 'message_updated', sourceEdited);
        bind('MESSAGE_SWIPED', 'message_swiped', sourceEdited);
        bind('MESSAGE_DELETED', 'message_deleted', () => sourceEdited());
        bind('CHAT_COMPLETION_PROMPT_READY', 'chat_completion_prompt_ready', promptReady);
        bind('GENERATION_STOPPED', 'generation_stopped', () => { recallController?.abort(); prompt = ''; applyPrompt(''); });
        return initialize();
    }

    return {
        snapshot, subscribe(fn) { subscriptions.add(fn); fn(snapshot()); return () => subscriptions.delete(fn); },
        connect, initialize, takeOver, mutate, save, getContext, rearrange, promptReady, openClose, runClose, reviewPart, confirmClose, cancelClose,
        previewCharacter, readPreviewDialogue, generateGrowth, acceptGrowth, discardGrowth() { growthPreview = null; publish(); },
        cancel(name) { controllers.get(name)?.abort(); }, refresh: publish,
        backup: () => makeBackup(state(), chatId()),
        import: backup => mutate(next => Object.assign(next, readBackup(next, backup, chatId()))),
        migrationBackup: async () => {
            for (let version = VERSION - 1; version > 0; version--) {
                const snapshot = await storage()?.getItem(migrationKey(version));
                if (snapshot) return snapshot;
            }
            throw new Error('这个聊天没有迁移备份。');
        },
        cancelRecall() { recallController?.abort(); prompt = ''; applyPrompt(''); },
    };
}
