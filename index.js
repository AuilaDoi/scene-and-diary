import {
    extension_prompt_roles,
    extension_prompt_types,
    setExtensionPrompt,
} from '../../../../script.js';
import { getContext } from '../../../st-context.js';
import {
    STORAGE_KEY,
    DEFAULT_SETTINGS,
    abortClosing,
    assignMessageToAct,
    beginNextAct,
    buildDiaryPrompt,
    buildMemoryBlock,
    commitClosedAct,
    createState,
    currentAct,
    extractSceneTime,
    extractStoryText,
    filterPromptMessages,
    findAct,
    markActDirty,
    markClosing,
    normalizeState,
    parseDiaryResponse,
    isNormalRpMessage,
    ensureMessageMeta,
    newId,
} from './core.js';

const EXTENSION_NAME = 'scene&diary';
const PROMPT_KEY = 'scene_diary_memory';
const PANEL_ID = 'scene_diary_panel';
const TOOLBAR_ID = 'scene_diary_toolbar';
let activeChatKey = '';
let disabledReason = '';
let initialized = false;
let closingPromise = null;

const context = () => getContext();
const metadata = () => context().chatMetadata || {};
const chat = () => context().chat || [];
const eventSource = () => context().eventSource;
const eventTypes = () => context().eventTypes || {};

function getState() {
    const raw = metadata()[STORAGE_KEY];
    if (!raw) return null;
    const state = normalizeState(raw);
    metadata()[STORAGE_KEY] = state;
    return state;
}

function setState(state) {
    state.lastUpdatedAt = Date.now();
    metadata()[STORAGE_KEY] = state;
    return state;
}

async function saveState(state = getState(), chatKey = activeChatKey) {
    if (!state) return;
    if (chatKey && (chatKey !== activeChatKey || String(context().chatId) !== String(chatKey))) return false;
    const save = context().saveMetadata || context().saveChat;
    if (typeof save === 'function') await save();
    return true;
}

function isSoloChat() {
    const ctx = context();
    return !ctx.groupId && ctx.chatId;
}

function initializeChat() {
    if (!isSoloChat()) {
        disabledReason = 'scene&diary 首版只支持单角色聊天。';
        clearMemoryPrompt();
        render();
        return null;
    }

    const chatKey = String(context().chatId);
    if (chatKey !== activeChatKey) {
        activeChatKey = chatKey;
        closingPromise = null;
        clearMemoryPrompt();
    }

    const existing = getState();
    if (existing) {
        disabledReason = '';
        if (existing.status === 'closing' && !closingPromise) {
            abortClosing(existing, '上一轮日记请求在切换聊天时取消。');
            setState(existing);
            void saveState(existing, activeChatKey);
        }
        repairCurrentState(existing);
        render();
        return existing;
    }

    // A chat with more than the character greeting is treated as an existing chat.
    // This protects old chats from being silently reinterpreted as a new scene.
    if (chat().filter(message => !message.is_system).length > 1) {
        disabledReason = '这是已有聊天。v0.1 只会自动接管新建聊天；请新建聊天后再启用 scene&diary。';
        clearMemoryPrompt();
        render();
        return null;
    }

    const state = createState();
    chat().forEach((message, index) => {
        if (isNormalRpMessage(message)) assignMessageToAct(state, message, 1, index);
    });
    state.acts[0].startMessageIndex = chat().length ? 0 : null;
    setState(state);
    disabledReason = '';
    void saveState();
    render();
    return state;
}

function repairCurrentState(state) {
    const act = currentAct(state);
    if (!act) return;
    for (let index = 0; index < chat().length; index += 1) {
        const message = chat()[index];
        if (!isNormalRpMessage(message)) continue;
        const meta = message.extra?.scene_diary;
        if (!meta?.actId) {
            assignMessageToAct(state, message, state.currentActId, index);
        }
    }
}

function handleMessageSent(messageIndex) {
    const state = initializeChat();
    if (!state || disabledReason) return;
    const index = Number(messageIndex);
    const message = chat()[index];
    if (!message || !message.is_user) return;

    if (state.status === 'pending_next_act') {
        beginNextAct(state, message, index);
    } else if (state.status === 'active') {
        assignMessageToAct(state, message, state.currentActId, index);
    } else {
        return;
    }
    setState(state);
    void saveState();
    render();
}

function handleMessageReceived(messageIndex) {
    const state = getState();
    if (!state || state.status !== 'active' || disabledReason) return;
    const index = Number(messageIndex);
    const message = chat()[index];
    if (!message || message.is_user || !isNormalRpMessage(message)) return;
    assignMessageToAct(state, message, state.currentActId, index);
    setState(state);
    void saveState();
    render();
}

function handleMessageChanged(messageIndex) {
    const state = getState();
    if (!state) return;
    const message = chat()[Number(messageIndex)];
    const actId = message?.extra?.scene_diary?.actId;
    if (actId) {
        if (markActDirty(state, actId)) {
            setState(state);
            void saveState();
            render();
        }
    }
}

function handleMessagesDeleted() {
    const state = getState();
    if (!state) return;
    const ids = new Set(chat().map(message => message.extra?.scene_diary?.messageId).filter(Boolean));
    let changed = false;
    for (const act of state.acts) {
        if (act.status === 'closed' && act.messageIds.some(id => !ids.has(id))) changed = markActDirty(state, act.id) || changed;
    }
    if (changed) {
        setState(state);
        void saveState();
        render();
    }
}

function clearMemoryPrompt() {
    setExtensionPrompt(PROMPT_KEY, '', extension_prompt_types.NONE, 0, false, extension_prompt_roles.SYSTEM);
}

function setMemoryPrompt(state) {
    if (!state || disabledReason || state.status !== 'active') {
        clearMemoryPrompt();
        return;
    }
    const block = buildMemoryBlock(state, state.settings || DEFAULT_SETTINGS);
    const hasMemory = state.acts.some(act => act.status === 'closed' && act.diary);
    if (!hasMemory) {
        clearMemoryPrompt();
        return;
    }
    setExtensionPrompt(PROMPT_KEY, block, extension_prompt_types.BEFORE_PROMPT, 0, false, extension_prompt_roles.SYSTEM);
}

function sceneDiaryRearrangeChat(promptChat) {
    const state = getState();
    if (!state || disabledReason || state.status !== 'active' || !Array.isArray(promptChat)) {
        clearMemoryPrompt();
        return;
    }

    // Generation runs after regex processing. Only remove normal RP messages that
    // belong to an earlier act; system/tool messages remain available to ST.
    const filtered = filterPromptMessages(promptChat, state.currentActId);
    promptChat.splice(0, promptChat.length, ...filtered);
    setMemoryPrompt(state);
}

globalThis.sceneDiaryRearrangeChat = sceneDiaryRearrangeChat;

function extractActMessages(actId) {
    return chat().filter(message => Number(message.extra?.scene_diary?.actId) === Number(actId) && isNormalRpMessage(message));
}

function updateActTimes(act, messages) {
    const times = messages.map(message => extractSceneTime(message.mes)).filter(Boolean);
    act.startSceneTime ||= times[0] || null;
    act.endSceneTime = times.at(-1) || act.endSceneTime || null;
    act.startSceneTimeSource ||= times[0] ? 'message' : null;
    act.endSceneTimeSource = times.at(-1) ? 'message' : act.endSceneTimeSource;
}

async function requestDiaryModel(state, request) {
    const ctx = context();
    if (String(ctx.mainApi || '').toLowerCase() !== 'openai' && !state.settings.diaryConnectionProfile) {
        throw new Error('日记辅助请求需要 Chat Completion 接口。请切换主接口，或在设置中选择一个 Chat Completion 连接配置。');
    }
    let response;
    if (state.settings.diaryConnectionProfile) {
        const service = ctx.ConnectionManagerRequestService;
        if (!service?.sendRequest) throw new Error('酒馆连接管理器不可用，无法使用独立日记连接。');
        response = await service.sendRequest(state.settings.diaryConnectionProfile, request, 1600, {
            stream: false,
            includePreset: true,
            includeInstruct: true,
        });
    } else {
        response = await ctx.generateRawData({
            prompt: request,
            api: 'openai',
            quietToLoud: true,
            responseLength: 1600,
        });
    }
    return parseDiaryResponse(response?.content ?? response);
}

async function requestDiary(state, act, messages) {
    const ctx = context();
    const previous = state.acts.filter(item => item.status === 'closed').at(-1)?.handoff || null;
    const fields = ctx.getCharacterCardFields?.() || {};
    const characterName = ctx.name2 || fields.name || '角色';
    const userName = ctx.name1 || '玩家';
    const promptFor = chunk => {
        const prompt = buildDiaryPrompt({
            characterName,
            userName,
            previousHandoff: previous,
            messages: chunk,
            targetLength: state.settings.diaryTargetLength,
        });
        return [
            { role: 'system', content: '你是 scene&diary 的幕间日记整理器。输出必须可机器解析。' },
            { role: 'user', content: prompt },
        ];
    };

    const threshold = Math.max(5000, Number(state.settings.maxDiaryChars) || DEFAULT_SETTINGS.maxDiaryChars);
    const sourceLength = messages.reduce((total, message) => total + String(message.mes || '').length, 0);
    if (sourceLength <= threshold) return requestDiaryModel(state, promptFor(messages));

    // Long scenes are processed as contiguous chunks, then synthesized once.
    const chunks = [];
    let chunk = [];
    let size = 0;
    const chunkLimit = Math.max(3000, Math.floor(threshold * 0.72));
    for (const message of messages) {
        const messageSize = String(message.mes || '').length;
        if (chunk.length && size + messageSize > chunkLimit) {
            chunks.push(chunk);
            chunk = [];
            size = 0;
        }
        chunk.push(message);
        size += messageSize;
    }
    if (chunk.length) chunks.push(chunk);

    const partials = [];
    for (let index = 0; index < chunks.length; index += 1) {
        const partial = await requestDiaryModel(state, promptFor(chunks[index]));
        partials.push({ is_user: false, name: `第${index + 1}段整理`, mes: JSON.stringify(partial) });
    }
    return requestDiaryModel(state, promptFor(partials));
}

async function endCurrentAct() {
    if (closingPromise) return closingPromise;
    const state = getState();
    const act = state ? currentAct(state) : null;
    if (!state || !act || state.status !== 'active' || disabledReason) return;
    const messages = extractActMessages(act.id);
    if (!messages.length) {
        notify('info', '当前幕还没有可整理的聊天内容。');
        return;
    }

    const transactionId = newId('close');
    const transactionChatKey = activeChatKey;
    markClosing(state, transactionId, messages);
    updateActTimes(act, messages);
    setState(state);
    await saveState(state, transactionChatKey);
    render();

    closingPromise = (async () => {
        try {
            const result = await requestDiary(state, act, messages);
            if (transactionChatKey !== activeChatKey || String(context().chatId) !== String(transactionChatKey)) return;
            if (result.handoff?.storyTime && !act.endSceneTime) act.endSceneTime = result.handoff.storyTime;
            commitClosedAct(state, result, messages.at(-1)?.extra?.scene_diary?.messageIndex ?? null);
            setState(state);
            await saveState(state, transactionChatKey);
            await eventSource()?.emit?.('scene_diary_act_closed', {
                actId: act.id,
                revision: act.revision,
                sourceMessageIds: [...act.messageIds],
            });
            notify('success', `第${act.id}幕已结束，日记已保存。`);
        } catch (error) {
            if (transactionChatKey !== activeChatKey || String(context().chatId) !== String(transactionChatKey)) return;
            abortClosing(state, error?.message || String(error));
            setState(state);
            await saveState(state, transactionChatKey);
            notify('error', error?.message || '日记生成失败，当前幕仍保持进行中。');
        } finally {
            closingPromise = null;
            render();
        }
    })();
    return closingPromise;
}

function continuePreviousAct() {
    const state = getState();
    if (!state || state.status !== 'pending_next_act') return;
    const act = currentAct(state);
    if (act) act.status = 'active';
    state.status = 'active';
    state.lastError = '';
    setState(state);
    void saveState();
    render();
}

function notify(type, message) {
    const fn = globalThis.toastr?.[type];
    if (typeof fn === 'function') fn(message, EXTENSION_NAME);
    else console[type === 'error' ? 'error' : 'log'](`[${EXTENSION_NAME}] ${message}`);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function getProfileOptions(selected) {
    const service = context().ConnectionManagerRequestService;
    let profiles = [];
    try {
        profiles = service?.getSupportedProfiles?.() || [];
    } catch (error) {
        console.debug(`[${EXTENSION_NAME}] connection profiles unavailable`, error);
    }
    return [`<option value="">沿用当前聊天连接</option>`, ...profiles.map(profile => `<option value="${escapeHtml(profile.id)}" ${profile.id === selected ? 'selected' : ''}>独立：${escapeHtml(profile.name)}</option>`)].join('');
}

function compatibilityReport() {
    const text = document.body?.textContent || '';
    const warnings = [];
    if (text.includes('【隐藏不发送】远楼层正则')) warnings.push('发现数据库远楼层隐藏正则：请关闭它。');
    if (text.includes('10楼外只发送摘要')) warnings.push('发现创世回廊摘要筛选：请关闭它。');
    if (!warnings.length) warnings.push('未从当前页面识别到冲突名称；仍请按 README 检查正则。');
    return warnings;
}

function renderDiaryList(state) {
    const list = document.querySelector('#scene_diary_entries');
    if (!list) return;
    const entries = [...state.acts].reverse().filter(act => act.status === 'closed' || act.diary);
    list.innerHTML = entries.length ? entries.map(act => `
        <details class="scene-diary-entry" data-act-id="${act.id}">
          <summary>第${act.id}幕 · ${escapeHtml(act.title || '未命名')}${act.dirty ? ' · 内容已变化' : ''}</summary>
          <label>标题<input data-field="title" value="${escapeHtml(act.title)}"></label>
          <label>日记<textarea data-field="diary" rows="6">${escapeHtml(act.diary)}</textarea></label>
          <label>地点<input data-field="location" value="${escapeHtml(act.handoff?.location || '')}"></label>
          <label>情境<textarea data-field="situation" rows="2">${escapeHtml(act.handoff?.situation || '')}</textarea></label>
          <button data-action="save-entry">保存这篇日记</button>
        </details>`).join('') : '<p class="scene-diary-muted">还没有已保存的日记。</p>';
}

function render() {
    const toolbar = document.querySelector(`#${TOOLBAR_ID}`);
    const state = getState();
    const status = toolbar?.querySelector('[data-role="status"]');
    const end = toolbar?.querySelector('[data-action="end"]');
    const open = toolbar?.querySelector('[data-action="open"]');
    if (status) {
        if (disabledReason) status.textContent = disabledReason;
        else if (!state) status.textContent = '等待新聊天';
        else if (state.status === 'closing') status.textContent = `第${state.currentActId}幕：正在整理日记…`;
        else if (state.status === 'pending_next_act') status.textContent = `第${state.currentActId}幕已结束，下一条玩家消息将开启新幕`;
        else status.textContent = `第${state.currentActId}幕进行中`;
    }
    if (end) end.disabled = !state || !!disabledReason || state.status !== 'active' || !!closingPromise;
    if (open) open.textContent = state ? `🎬 第${state.currentActId}幕` : '🎬 scene&diary';
    renderDiaryList(state || createState());
    const panel = document.querySelector(`#${PANEL_ID}`);
    if (panel) {
        const report = panel.querySelector('[data-role="compatibility"]');
        if (report) report.innerHTML = compatibilityReport().map(item => `<li>${escapeHtml(item)}</li>`).join('');
        const contextReport = panel.querySelector('[data-role="context"]');
        if (contextReport) {
            const normal = chat().filter(isNormalRpMessage);
            const currentCount = state ? normal.filter(message => Number(message.extra?.scene_diary?.actId) === Number(state.currentActId)).length : 0;
            const hiddenCount = state ? Math.max(0, normal.length - currentCount) : 0;
            contextReport.textContent = state
                ? `本次请求预计保留当前幕 ${currentCount} 条普通消息；旧幕 ${hiddenCount} 条不会进入原始聊天。宿主仍可能因上下文上限裁剪当前幕早期内容。`
                : '尚未接管当前聊天。';
        }
        const count = panel.querySelector('[data-setting="recentDiaryCount"]');
        const profile = panel.querySelector('[data-setting="diaryConnectionProfile"]');
        if (count && state) count.value = state.settings.recentDiaryCount;
        if (profile && state && !profile.dataset.userChanging) profile.innerHTML = getProfileOptions(state.settings.diaryConnectionProfile);
    }
}

function exportState() {
    const state = getState();
    if (!state) return;
    const payload = JSON.stringify({ format: 'scene&diary', version: 1, chatId: context().chatId, state }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `scene-and-diary-${context().chatId || 'chat'}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportMarkdown() {
    const state = getState();
    if (!state) return;
    const entries = state.acts.filter(act => act.diary).map(act => [
        `# 第${act.id}幕｜${act.title || '未命名'}`,
        `时间：${act.startSceneTime || '未记录'} → ${act.endSceneTime || '未记录'}`,
        '', act.diary, '', '## 幕尾交接',
        `地点：${act.handoff?.location || '未记录'}`,
        `情境：${act.handoff?.situation || '未记录'}`,
        ...(act.handoff?.ongoingPlans || []).map(item => `- 计划：${item}`),
        ...(act.handoff?.unresolvedThreads || []).map(item => `- 未解决：${item}`),
        '',
    ].join('\n')).join('\n');
    const url = URL.createObjectURL(new Blob([entries], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `scene-and-diary-${context().chatId || 'chat'}.md`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importStateFile(file) {
    try {
        const value = JSON.parse(await file.text());
        if (value?.format !== 'scene&diary' || !value.state) throw new Error('这不是 scene&diary 导出文件。');
        const state = normalizeState(value.state);
        setState(state);
        await saveState(state);
        render();
        notify('success', 'scene&diary 数据已导入。');
    } catch (error) {
        notify('error', error?.message || '导入失败。');
    }
}

function saveEntry(entry) {
    const state = getState();
    if (!state || !entry) return;
    const actId = Number(entry.dataset.actId);
    const act = findAct(state, actId);
    if (!act) return;
    const value = key => entry.querySelector(`[data-field="${key}"]`)?.value || '';
    act.title = value('title').trim();
    act.diary = value('diary').trim();
    act.handoff ||= {};
    act.handoff.location = value('location').trim() || null;
    act.handoff.situation = value('situation').trim() || null;
    act.edited = true;
    act.dirty = false;
    act.revision = Number(act.revision || 0) + 1;
    setState(state);
    void saveState();
    setMemoryPrompt(state);
    render();
    notify('success', `第${act.id}幕日记已更新。`);
}

function createUi() {
    if (document.getElementById(TOOLBAR_ID)) return;
    const sendForm = document.querySelector('#send_form') || document.querySelector('#send_textarea')?.parentElement;
    if (!sendForm) return;
    const toolbar = document.createElement('div');
    toolbar.id = TOOLBAR_ID;
    toolbar.innerHTML = `
      <button type="button" data-action="open" title="打开 scene&diary 面板">🎬 scene&diary</button>
      <span data-role="status">等待新聊天</span>
      <button type="button" data-action="end">结束这一幕</button>`;
    sendForm.prepend(toolbar);

    const panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.hidden = true;
    panel.innerHTML = `
      <div class="scene-diary-panel-head"><h3>scene&diary</h3><button type="button" data-action="close-panel">×</button></div>
      <p class="scene-diary-help">结束当前幕后，插件会以角色第一人称整理日记。下一条真实的玩家消息会自动开始新幕。</p>
      <div class="scene-diary-actions">
        <button type="button" data-action="end">结束这一幕</button>
        <button type="button" data-action="continue">继续上一幕</button>
        <button type="button" data-action="export">导出 JSON</button>
        <button type="button" data-action="export-markdown">导出 Markdown</button>
        <button type="button" data-action="import">导入 JSON</button>
        <input type="file" accept="application/json,.json" data-role="import-file" hidden>
      </div>
      <label>最近注入日记篇数 <input type="number" min="0" max="20" data-setting="recentDiaryCount"></label>
      <label>日记连接 <select data-setting="diaryConnectionProfile"><option value="">沿用当前聊天连接</option></select></label>
      <button type="button" data-action="save-settings">保存设置</button>
      <p class="scene-diary-context" data-role="context"></p>
      <h4>兼容性检查</h4><ul data-role="compatibility"></ul>
      <h4>日记</h4><div id="scene_diary_entries"></div>`;
    document.body.append(panel);

    toolbar.addEventListener('click', event => {
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (action === 'open') panel.hidden = false;
        if (action === 'end') void endCurrentAct();
    });
    panel.addEventListener('click', event => {
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (action === 'close-panel') panel.hidden = true;
        if (action === 'end') void endCurrentAct();
        if (action === 'continue') continuePreviousAct();
        if (action === 'export') exportState();
        if (action === 'export-markdown') exportMarkdown();
        if (action === 'import') panel.querySelector('[data-role="import-file"]').click();
        if (action === 'save-entry') saveEntry(event.target.closest('[data-act-id]'));
        if (action === 'save-settings') {
            const state = getState();
            if (!state) return;
            state.settings.recentDiaryCount = Math.min(20, Math.max(0, Number(panel.querySelector('[data-setting="recentDiaryCount"]').value) || 0));
            state.settings.diaryConnectionProfile = panel.querySelector('[data-setting="diaryConnectionProfile"]').value;
            setState(state);
            void saveState();
            setMemoryPrompt(state);
            notify('success', 'scene&diary 设置已保存。');
            render();
        }
    });
    panel.querySelector('[data-role="import-file"]').addEventListener('change', event => {
        const file = event.target.files?.[0];
        if (file) void importStateFile(file);
        event.target.value = '';
    });
    panel.querySelector('[data-setting="diaryConnectionProfile"]').addEventListener('change', event => { event.target.dataset.userChanging = 'true'; });
}

function bindEvents() {
    const source = eventSource();
    const types = eventTypes();
    if (!source?.on) return;
    source.on(types.MESSAGE_SENT || 'message_sent', handleMessageSent);
    source.on(types.MESSAGE_RECEIVED || 'message_received', handleMessageReceived);
    source.on(types.MESSAGE_EDITED || 'message_edited', handleMessageChanged);
    source.on(types.MESSAGE_UPDATED || 'message_updated', handleMessageChanged);
    source.on(types.MESSAGE_DELETED || 'message_deleted', handleMessagesDeleted);
    source.on(types.MESSAGE_SWIPED || 'message_swiped', handleMessageChanged);
    source.on(types.CHAT_CHANGED || 'chat_id_changed', () => {
        disabledReason = '';
        initializeChat();
    });
    source.on(types.CHAT_LOADED || 'chatLoaded', () => {
        disabledReason = '';
        initializeChat();
    });
}

function init() {
    if (initialized) return;
    initialized = true;
    createUi();
    if (!document.getElementById(TOOLBAR_ID)) setTimeout(() => { createUi(); render(); }, 1000);
    bindEvents();
    initializeChat();
    render();
    globalThis.sceneDiary = {
        version: '0.1.0',
        getState,
        endCurrentAct,
        continuePreviousAct,
        compatibilityReport,
        exportState,
    };
    console.info(`[${EXTENSION_NAME}] loaded`);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

