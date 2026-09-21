import { extension_prompt_roles, extension_prompt_types, setExtensionPrompt } from '../../../../script.js';
import { getContext } from '../../../st-context.js';
import {
    SCHEMA_VERSION, STORAGE_KEY, DEFAULT_SETTINGS, DEFAULT_DIARY_PROMPT, DEFAULT_MEMORY_PROMPT, DEFAULT_GROWTH_PROMPT,
    MEMORY_CATEGORIES, acknowledgeActReview, acknowledgeMemoryReview, assignMessageToAct, beginNextAct,
    buildCharacterContext, buildContinuityBlock, buildDialogue, buildDiaryPrompt, buildGrowthPrompt, buildMemoryPrompt,
    buildRecallQuery, canSetMemoryPermanent, createState, currentAct, estimateTokens, filterPromptMessages, findAct,
    insertContinuityBeforeHistory, isNormalRpMessage, localTime, markActDirty, newId, normalizeMemory, normalizeSettings,
    normalizeState, parseDiaryResponse, parseGrowthResponse, parseMemoryResponse, permanentMemoryCount, recallMemories,
    sourceChanged, sourceFingerprint, validateTagPair,
} from './core.js';

const NAME = 'scene&diary';
const PANEL = 'scene_diary_panel';
const BAR = 'scene_diary_toolbar';
const DIARY_KEY = 'scene_diary_diaries';
const MEMORY_KEY = 'scene_diary_memories';
let activeChatKey = '', disabledReason = '', initialized = false, closingPromise = null, lastRecall = null, lastContinuity = null, awaitingMainPrompt = false, migrationPending = false;

const ctx = () => getContext();
const chat = () => ctx().chat || [];
const meta = () => ctx().chatMetadata || {};
const types = () => ctx().eventTypes || {};
const source = () => ctx().eventSource;
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function notify(type, message) { const handler = globalThis.toastr?.[type]; handler ? handler(message, NAME) : console[type === 'error' ? 'error' : 'log'](`[${NAME}] ${message}`); }
function hasSp() { return !!globalThis.AutoCardUpdaterAPI; }
function globalSettings() { const all = ctx().extensionSettings || {}; all.scene_diary ||= structuredClone(DEFAULT_SETTINGS); return normalizeSettings(all.scene_diary); }
function getState() { const raw = meta()[STORAGE_KEY]; if (!raw) return null; migrationPending ||= raw.version !== SCHEMA_VERSION || !raw.characterGrowth; const state = normalizeState(raw); meta()[STORAGE_KEY] = state; return state; }
function setState(state) { state.lastUpdatedAt = Date.now(); meta()[STORAGE_KEY] = state; return state; }
async function saveState(state = getState(), key = activeChatKey) { if (!state || key !== activeChatKey || String(ctx().chatId) !== String(key)) return false; await (ctx().saveMetadata || ctx().saveChat)?.(); migrationPending = false; return true; }
function clearPrompts() { for (const key of [DIARY_KEY, MEMORY_KEY]) setExtensionPrompt(key, '', extension_prompt_types.NONE, 0, false, extension_prompt_roles.SYSTEM); }
function compatible() { if (hasSp()) { disabledReason = '检测到 SP·数据库：scene&diary 不支持同时启用。请停用 SP 后刷新。'; clearPrompts(); return false; } return true; }
function messagesFor(actId) { return chat().filter(message => +message.extra?.scene_diary?.actId === +actId && isNormalRpMessage(message)); }

function initializeChat() {
    if (!ctx().chatId || ctx().groupId) { disabledReason = 'scene&diary v0.2 只支持单角色聊天。'; clearPrompts(); render(); return null; }
    if (!compatible()) { render(); return null; }
    const key = String(ctx().chatId);
    if (key !== activeChatKey) { activeChatKey = key; closingPromise = null; lastRecall = null; migrationPending = false; clearPrompts(); }
    let state = getState();
    if (state) {
        disabledReason = '';
        let repaired = migrationPending;
        if (state.status === 'closing') { state.status = 'active'; state.pendingTransaction = null; state.lastError = '上次整理在切换聊天时中断。'; repaired = true; }
        repaired = repair(state) || repaired;
        if (repaired) { setState(state); void saveState(state); }
        render(state);
        return state;
    }
    if (chat().filter(isNormalRpMessage).length > 1) { disabledReason = '这是已有聊天。请在管理面板选择“从此处接管”；建议先补写初始角色成长。'; render(); return null; }
    state = createState();
    state.settings = { ...globalSettings(), ...state.settings };
    chat().forEach((message, index) => isNormalRpMessage(message) && assignMessageToAct(state, message, 1, index));
    setState(state); disabledReason = ''; void saveState(state); render(state); return state;
}

function repair(state) {
    let changedState = false;
    const act = currentAct(state);
    if (act && state.status === 'active' && act.status === 'active') chat().forEach((message, index) => { if (isNormalRpMessage(message) && !message.extra?.scene_diary?.actId) { assignMessageToAct(state, message, state.currentActId, index); changedState = true; } });
    for (const closed of state.acts.filter(item => item.status === 'closed')) {
        const messages = messagesFor(closed.id), current = sourceFingerprint(messages);
        if (!closed.sourceFingerprint && messages.length) { closed.sourceFingerprint = current; changedState = true; }
        else if (closed.dirty && closed.sourceFingerprint === current) { closed.dirty = false; state.memories.filter(memory => memory.sourceActId === closed.id && memory.dirty).forEach(memory => memory.dirty = false); changedState = true; }
    }
    return changedState;
}

function takeOver(index = 0) {
    if (!compatible() || !ctx().chatId) return;
    const state = createState(); state.settings = globalSettings(); state.takeoverNotice = true;
    chat().forEach((message, messageIndex) => { if (messageIndex >= index && isNormalRpMessage(message)) assignMessageToAct(state, message, 1, messageIndex); });
    state.acts[0].startMessageIndex = index; setState(state); disabledReason = ''; void saveState(state); render(state);
    notify('info', '已接管旧聊天。角色成长为空；建议先手写接管前的关系与成长概况，但这不会阻止关幕。');
}

function sent(index) { const state = initializeChat(), message = chat()[+index]; if (!state || disabledReason || !message?.is_user) return; if (state.status === 'pending_next_act') beginNextAct(state, message, +index); else if (state.status === 'active') assignMessageToAct(state, message, state.currentActId, +index); setState(state); void saveState(state); render(state); }
function received(index) { const state = getState(), message = chat()[+index]; if (!state || state.status !== 'active' || !isNormalRpMessage(message) || message.is_user) return; assignMessageToAct(state, message, state.currentActId, +index); setState(state); void saveState(state); render(state); }
function reviewSourceAct(state, actId) { const act = findAct(state, actId); return !!act && act.status === 'closed' && sourceChanged(act, messagesFor(act.id)) && markActDirty(state, act.id); }
function changed(index) { const state = getState(), message = chat()[+index], actId = message?.extra?.scene_diary?.actId; if (state && actId && reviewSourceAct(state, actId)) { setState(state); void saveState(state); render(state); } }
function deleted() { const state = getState(); if (!state) return; let didChange = false; for (const act of state.acts) didChange = reviewSourceAct(state, act.id) || didChange; if (didChange) { setState(state); void saveState(state); render(state); } }

function profileOptions(value) { try { return ['<option value="">沿用当前聊天连接</option>', ...(ctx().ConnectionManagerRequestService?.getSupportedProfiles?.() || []).map(profile => `<option value="${escape(profile.id)}" ${profile.id === value ? 'selected' : ''}>独立：${escape(profile.name)}</option>`)].join(''); } catch { return '<option value="">沿用当前聊天连接</option>'; } }
async function request(profile, prompt, responseLength = 1600) { if (profile) { const service = ctx().ConnectionManagerRequestService; if (!service?.sendRequest) throw new Error('连接管理器不可用。'); const output = await service.sendRequest(profile, prompt, responseLength, { stream: false, extractData: true, includePreset: false, includeInstruct: false }); return output?.content ?? output; } if (String(ctx().mainApi || '').toLowerCase() !== 'openai') throw new Error('辅助整理需要 Chat Completion，或选择独立连接。'); const output = await ctx().generateRawData({ prompt, api: 'openai', quietToLoud: true, responseLength }); return output?.content ?? output; }
function characterData() { const fields = ctx().getCharacterCardFields?.() || {}; return { char: ctx().name2 || fields.name || '角色', user: ctx().name1 || '玩家', context: buildCharacterContext({ description: fields.description, personality: fields.personality, scenario: fields.scenario }) }; }
const modelMessages = content => [{ role: 'system', content: '你只输出机器可解析 JSON。' }, { role: 'user', content }];

async function generateClosePart(transaction, kind, settings) {
    const common = { characterName: transaction.character.char, userName: transaction.character.user, characterContext: transaction.character.context, dialogue: transaction.dialogue.text };
    if (kind === 'diary') { const prompt = modelMessages(buildDiaryPrompt({ ...common, targetLength: settings.diaryTargetLength, prompt: settings.prompts.diary })); return parseDiaryResponse(await request(settings.diaryConnectionProfile, prompt)); }
    if (kind === 'memory') { const prompt = modelMessages(buildMemoryPrompt({ ...common, prompt: settings.prompts.memory })); return parseMemoryResponse(await request(settings.memoryConnectionProfile || settings.diaryConnectionProfile, prompt), transaction.actId, transaction.sourceMessageIds); }
    const prompt = modelMessages(buildGrowthPrompt({ ...common, currentGrowth: transaction.baseGrowth, targetLength: settings.growthTargetLength, prompt: settings.prompts.growth }));
    return parseGrowthResponse(await request(settings.diaryConnectionProfile, prompt, 2400), settings.maxGrowthChars);
}

async function runCloseParts(transactionId, kinds) {
    const before = getState(), transaction = before?.pendingTransaction;
    if (!transaction || transaction.id !== transactionId) return;
    for (const kind of kinds) transaction.results[kind] = { status: 'pending' };
    setState(before); await saveState(before); render(before);
    const settled = await Promise.allSettled(kinds.map(async kind => ({ kind, value: await generateClosePart(transaction, kind, before.settings) })));
    if (String(ctx().chatId) !== activeChatKey) return;
    const state = getState(), current = state?.pendingTransaction;
    if (!current || current.id !== transactionId) return;
    settled.forEach((result, index) => { const kind = kinds[index]; current.results[kind] = result.status === 'fulfilled' ? { status: 'success', value: result.value.value } : { status: 'error', error: result.reason?.message || String(result.reason) }; });
    state.status = 'preview'; setState(state); await saveState(state); render(state);
    const failures = kinds.filter(kind => current.results[kind].status === 'error');
    if (failures.length) notify('error', `${failures.map(kindLabel).join('、')}生成失败；成功部分已保留，可单独重试。`); else notify('success', '日记、记忆与角色成长已生成，请预览确认。');
}

function kindLabel(kind) { return ({ diary: '日记', memory: '记忆', growth: '角色成长' })[kind] || kind; }
async function closeAct() {
    if (closingPromise) return closingPromise;
    const state = getState(), act = currentAct(state);
    if (!state || !act || state.status !== 'active' || !compatible()) return;
    const sourceMessages = messagesFor(act.id), character = characterData(), dialogue = buildDialogue(sourceMessages, state.settings.extraction, character.char, character.user);
    if (dialogue.errors.length) { state.drafts = [{ kind: 'extraction-errors', actId: act.id, errors: dialogue.errors, createdAt: Date.now() }]; setState(state); await saveState(state); render(state); notify('error', '正文标签无法匹配：请在“当前幕”检查并修正规则，或明确跳过楼层。'); return; }
    if (!sourceMessages.length) { notify('info', '当前幕还没有可整理内容。'); return; }
    const transaction = { id: newId('close'), actId: act.id, sourceFingerprint: sourceFingerprint(sourceMessages), sourceMessageIds: sourceMessages.map(message => message.extra.scene_diary.messageId), startedAt: Date.now(), dialogue, character, baseGrowth: state.characterGrowth.content, memoryRevision: state.memories.reduce((total, memory) => total + (memory.revision || 0), 0), growthRevision: state.characterGrowth.revision, results: { diary: { status: 'pending' }, memory: { status: 'pending' }, growth: { status: 'pending' } } };
    state.status = 'closing'; act.status = 'closing'; state.pendingTransaction = transaction; setState(state); await saveState(state); render(state);
    closingPromise = runCloseParts(transaction.id, ['diary', 'memory', 'growth']).finally(() => closingPromise = null);
    return closingPromise;
}

function retryClosePart(kind) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction || !['diary', 'memory', 'growth'].includes(kind) || transaction.results[kind]?.status === 'pending') return; void runCloseParts(transaction.id, [kind]); }
function allPartsReady(transaction) { return ['diary', 'memory', 'growth'].every(kind => transaction?.results?.[kind]?.status === 'success'); }

function confirmClose() {
    const state = getState(), transaction = state?.pendingTransaction, act = transaction && findAct(state, transaction.actId);
    if (!state || state.status !== 'preview' || !transaction || !act || !allPartsReady(transaction)) { notify('error', '日记、记忆和角色成长必须全部生成成功后才能确认关幕。'); return; }
    const sourceMessages = messagesFor(act.id), fresh = sourceFingerprint(sourceMessages);
    if (fresh !== transaction.sourceFingerprint) { notify('error', '本幕内容已变更，请重新整理预览。'); return; }
    const memoryRevision = state.memories.reduce((total, memory) => total + (memory.revision || 0), 0);
    if (memoryRevision !== transaction.memoryRevision) { notify('error', '记忆库已变更，请重新整理预览。'); return; }
    if (state.characterGrowth.revision !== transaction.growthRevision) { notify('error', '角色成长已被修改，请重新整理预览。'); return; }
    const growthContent = String(transaction.results.growth.value || '').trim();
    if (!growthContent || growthContent.length > state.settings.maxGrowthChars) { notify('error', `角色成长必须为 1–${state.settings.maxGrowthChars} 个字符。`); return; }
    const diary = transaction.results.diary.value;
    act.status = 'closed'; act.closedAt = Date.now(); act.title = diary.title; act.diary = diary.diary;
    act.endMessageIndex = sourceMessages.at(-1)?.extra?.scene_diary?.messageIndex ?? null;
    act.endSceneTime = transaction.dialogue.rows.map(row => row.storyTime).filter(Boolean).at(-1) || null;
    act.sourceFingerprint = fresh; act.revision++; act.dirty = false;
    for (const raw of transaction.results.memory.value || []) { if (raw._reject) continue; const memory = normalizeMemory({ ...raw, sourceActId: act.id }); const same = state.memories.find(item => !item.deletedAt && item.title === memory.title && item.content === memory.content); if (!same) state.memories.push(memory); }
    const time = localTime(), generatedGrowth = transaction.results.growth.generatedValue ?? transaction.results.growth.value;
    state.characterGrowth = { ...state.characterGrowth, content: growthContent, createdAt: state.characterGrowth.createdAt || time.timestamp, updatedAt: time.timestamp, timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, lastIncludedActId: act.id, edited: state.characterGrowth.edited || growthContent !== generatedGrowth, reviewRecommended: false };
    state.status = 'pending_next_act'; state.pendingTransaction = null; state.takeoverNotice = false; setState(state); void saveState(state); render(state); notify('success', `第${act.id}幕、记忆与角色成长已保存，下一条玩家消息将开启新幕。`);
}

function cancelClose() { const state = getState(), act = currentAct(state); if (!state || !act) return; state.status = 'active'; act.status = 'active'; state.pendingTransaction = null; setState(state); void saveState(state); render(state); }
function skipExtraction(id) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction?.dialogue) return; transaction.dialogue.errors = transaction.dialogue.errors.filter(item => item.id !== id); transaction.dialogue.rows = transaction.dialogue.rows.filter(item => item.id !== id); transaction.dialogue.text = transaction.dialogue.rows.map(row => `${row.speaker}: ${row.body}`).join('\n\n'); setState(state); void saveState(state); render(state); }

function continuityData(state) { const current = chat().filter(isNormalRpMessage).slice(-state.settings.recallMessageCount), recallQuery = buildRecallQuery(current, state.settings.extraction); if (recallQuery.errors.length) return { recallQuery, content: '' }; lastRecall = recallMemories(state.memories, recallQuery.text, state.settings); return { recallQuery, content: buildContinuityBlock(state, lastRecall, state.settings) }; }
function sceneDiaryRearrangeChat(promptChat) { const state = getState(); clearPrompts(); awaitingMainPrompt = false; if (!state || !compatible() || state.status !== 'active' || !Array.isArray(promptChat)) return; const { recallQuery, content } = continuityData(state); if (recallQuery.errors.length) { notify('error', `最近消息不符合正文标签规则，已阻止本次生成：${recallQuery.errors.map(item => `楼层 ${item.index ?? '?'} ${item.errors.join('、')}`).join('；')}`); return; } promptChat.splice(0, promptChat.length, ...filterPromptMessages(promptChat, state.currentActId)); if (String(ctx().mainApi || '').toLowerCase() === 'openai') awaitingMainPrompt = true; else setExtensionPrompt(MEMORY_KEY, content, extension_prompt_types.IN_CHAT, Math.min(promptChat.length, 100), false, extension_prompt_roles.SYSTEM); }
function promptReady(eventData) { const state = getState(), requestChat = eventData?.chat, dryRun = !!eventData?.dryRun; if (!dryRun && !awaitingMainPrompt) return; awaitingMainPrompt = false; if (!state || disabledReason || state.status !== 'active' || !Array.isArray(requestChat)) { lastContinuity = { included: false, reason: '聊天未处于可注入状态', dryRun }; return; } const { recallQuery, content } = continuityData(state); if (recallQuery.errors.length) { lastContinuity = { included: false, reason: '召回正文提取失败', dryRun }; return; } const index = insertContinuityBeforeHistory(requestChat, content); lastContinuity = { included: index >= 0, index, length: content.length, growthIncluded: !!state.characterGrowth.content, growthRevision: state.characterGrowth.revision, dryRun, reason: index >= 0 ? '' : '没有可注入的角色成长、日记或记忆' }; }
globalThis.sceneDiaryRearrangeChat = sceneDiaryRearrangeChat;

function renderMemories(state) {
    const root = document.querySelector('#scene_diary_memories'); if (!root) return;
    const query = document.querySelector('[data-memory-search]')?.value?.toLowerCase() || '', category = document.querySelector('[data-memory-category]')?.value || '';
    const entries = state.memories.filter(memory => !memory.deletedAt && (!query || `${memory.title} ${memory.content} ${memory.people.join(' ')}`.toLowerCase().includes(query)) && (!category || memory.category === category));
    root.innerHTML = entries.length ? entries.map(memory => `<details class="scene-diary-entry" data-memory-id="${escape(memory.id)}"><summary>${escape(memory.title)} <small>${escape(memory.category)}${memory.permanent ? ' · 常驻' : ''}${memory.dirty ? ' · 待复核' : ''}</small></summary><label>标题<input data-memory-field="title" value="${escape(memory.title)}"></label><label>内容<textarea data-memory-field="content" rows="3">${escape(memory.content)}</textarea></label><label>类别<select data-memory-field="category">${MEMORY_CATEGORIES.map(item => `<option ${item === memory.category ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>重要度<input data-memory-field="importance" type="number" min="1" max="5" value="${memory.importance}"></label><label><input data-memory-field="permanent" type="checkbox" ${memory.permanent ? 'checked' : ''}> 常驻，每次生成时固定召回</label><label><input data-memory-field="locked" type="checkbox" ${memory.locked ? 'checked' : ''}> 锁定，自动整理不可覆盖</label><button data-action="save-memory">保存</button><button data-action="delete-memory">删除</button></details>`).join('') : '<p class="scene-diary-muted">没有符合条件的记忆。</p>';
}

function renderPart(kind, result, transaction) {
    if (result?.status === 'pending') return `<section class="scene-diary-result"><h5>${kindLabel(kind)}</h5><p>正在生成…</p></section>`;
    if (result?.status === 'error') return `<section class="scene-diary-result scene-diary-error"><h5>${kindLabel(kind)}</h5><p>${escape(result.error)}</p><button data-action="retry-part" data-kind="${kind}">仅重试${kindLabel(kind)}</button></section>`;
    if (kind === 'diary') return `<section class="scene-diary-result"><h5>日记</h5><label>标题<input data-preview="title" value="${escape(result.value.title)}"></label><label>日记<textarea data-preview="diary" rows="7">${escape(result.value.diary)}</textarea></label><button data-action="retry-part" data-kind="diary">重新生成日记</button></section>`;
    if (kind === 'growth') return `<section class="scene-diary-result"><h5>角色成长</h5><p class="scene-diary-muted">角色成长记录关系与状态演变，不规定下一幕的时间、地点或开场事件。</p><label>当前角色成长<textarea rows="5" readonly>${escape(transaction.baseGrowth || '尚未建立')}</textarea></label><label>更新后角色成长<textarea data-preview="growth" rows="9" maxlength="4000">${escape(result.value)}</textarea></label><button data-action="retry-part" data-kind="growth">重新生成角色成长</button></section>`;
    const candidates = result.value || [];
    return `<section class="scene-diary-result"><h5>记忆候选</h5>${candidates.length ? candidates.map((memory, index) => `<label class="scene-diary-candidate"><input data-candidate="${index}" type="checkbox" ${memory._reject ? '' : 'checked'}> <b>${escape(memory.title)}</b>：${escape(memory.content)}</label>`).join('') : '<p class="scene-diary-muted">本幕没有有效记忆候选。</p>'}<button data-action="retry-part" data-kind="memory">重新生成记忆</button></section>`;
}

function render(state = getState()) {
    const bar = document.querySelector(`#${BAR}`), panel = document.querySelector(`#${PANEL}`);
    if (bar) { bar.querySelector('[data-role=status]').textContent = disabledReason || (!state ? '等待接管' : state.status === 'closing' ? '正在整理…' : state.status === 'preview' ? '等待确认预览' : state.status === 'pending_next_act' ? `第${state.currentActId}幕已结束` : `第${state.currentActId}幕进行中`); bar.querySelector('[data-action=end]').disabled = !state || !!disabledReason || state.status !== 'active'; }
    if (!panel) return;
    const status = panel.querySelector('[data-role=status]'); if (status) status.textContent = disabledReason || '';
    const takeover = panel.querySelector('[data-action=takeover]'); if (takeover) takeover.disabled = !!state;
    const growth = state?.characterGrowth || createState().characterGrowth, growthEditor = panel.querySelector('[data-growth-editor]');
    if (growthEditor && document.activeElement !== growthEditor) growthEditor.value = growth.content;
    const growthNotice = panel.querySelector('[data-growth-notice]'); if (growthNotice) growthNotice.textContent = growth.reviewRecommended ? '部分已纳入幕的源消息发生变化，建议检查并保存角色成长。当前内容仍会继续注入。' : state?.takeoverNotice && !growth.content ? '这是接管的旧聊天。建议手写接管前的角色成长和关系状态；留空不会阻止关幕。' : '';
    const growthMeta = panel.querySelector('[data-growth-meta]'); if (growthMeta) growthMeta.textContent = `最后纳入：${growth.lastIncludedActId ? `第 ${growth.lastIncludedActId} 幕` : '尚无'}；revision ${growth.revision}；约 ${estimateTokens(growth.content)} tokens`;
    const growthCount = panel.querySelector('[data-growth-count]'); if (growthCount) growthCount.textContent = `${growthEditor?.value.length || 0} / ${state?.settings.maxGrowthChars || 4000} 字符`;
    panel.querySelector('#scene_diary_diaries').innerHTML = state?.acts.filter(act => act.diary).slice().reverse().map(act => `<details class="scene-diary-entry"><summary>第${act.id}幕 · ${escape(act.title)}${act.dirty ? ' · 待复核' : ''}</summary><p>故事时间：${escape(act.startSceneTime || '未记录')} → ${escape(act.endSceneTime || '未记录')}</p><textarea data-diary-id="${act.id}" rows="6">${escape(act.diary)}</textarea><button data-action="save-diary">保存日记</button></details>`).join('') || '<p class="scene-diary-muted">尚无日记。</p>';
    renderMemories(state || createState());
    const transaction = state?.pendingTransaction, preview = panel.querySelector('#scene_diary_preview'); preview.hidden = !transaction || !['closing', 'preview'].includes(state.status);
    if (!preview.hidden) { const ready = allPartsReady(transaction); preview.innerHTML = `<h4>关幕预览</h4>${renderPart('diary', transaction.results.diary, transaction)}${renderPart('growth', transaction.results.growth, transaction)}${renderPart('memory', transaction.results.memory, transaction)}<div class="scene-diary-actions"><button data-action="confirm" ${ready ? '' : 'disabled'}>确认保存并结束</button><button data-action="cancel-close">取消</button></div>`; }
    const errors = state?.drafts?.at(-1), extraction = panel.querySelector('#scene_diary_extraction'); extraction.innerHTML = errors?.kind === 'extraction-errors' ? `<h4>正文提取错误</h4>${errors.errors.map(error => `<p>楼层 ${error.index ?? '?'}：${escape(error.errors.join('；'))} <button data-action="skip" data-id="${escape(error.id)}">跳过此条</button></p>`).join('')}` : '';
    const diaryProfile = panel.querySelector('[data-setting=diaryConnectionProfile]'), memoryProfile = panel.querySelector('[data-setting=memoryConnectionProfile]'); if (diaryProfile) diaryProfile.innerHTML = profileOptions(state?.settings.diaryConnectionProfile); if (memoryProfile) memoryProfile.innerHTML = profileOptions(state?.settings.memoryConnectionProfile);
}

function createUi() {
    if (document.getElementById(BAR)) return;
    const form = document.querySelector('#send_form') || document.querySelector('#send_textarea')?.parentElement; if (!form) return;
    const bar = document.createElement('div'); bar.id = BAR; bar.innerHTML = '<button type="button" data-action="open">🎬 scene&diary</button><span data-role="status">等待接管</span><button type="button" data-action="end">结束这一幕</button>'; form.prepend(bar);
    const panel = document.createElement('section'); panel.id = PANEL; panel.hidden = true;
    panel.innerHTML = `<header class="scene-diary-panel-head"><h3>scene&diary</h3><button data-action="close" aria-label="关闭">×</button></header><p data-role="status" class="scene-diary-warning"></p><nav class="scene-diary-tabs"><button data-tab="act">当前幕</button><button data-tab="growth">角色成长</button><button data-tab="memory">记忆库</button><button data-tab="diary">日记</button><button data-tab="settings">设置</button><button data-tab="debug">诊断</button></nav><section data-page="act"><p>结束当前幕后，会生成日记、记忆候选和角色成长；确认前不会正式写入。</p><div class="scene-diary-actions"><button data-action="end">结束这一幕</button><button data-action="takeover">从当前第一条接管旧聊天</button></div><div id="scene_diary_extraction"></div><div id="scene_diary_preview" hidden></div></section><section data-page="growth" hidden><p data-growth-notice class="scene-diary-warning"></p><label>角色成长<textarea data-growth-editor rows="14" maxlength="4000" placeholder="概括角色的成长路径、情感发展、双方关系与生活状态演变。"></textarea></label><p data-growth-count class="scene-diary-muted"></p><p data-growth-meta class="scene-diary-muted"></p><div class="scene-diary-actions"><button data-action="save-growth">保存角色成长</button></div></section><section data-page="memory" hidden><label>搜索<input data-memory-search placeholder="标题、内容、人物"></label><label>分类<select data-memory-category><option value="">全部分类</option>${MEMORY_CATEGORIES.map(item => `<option>${item}</option>`).join('')}</select></label><button data-action="new-memory">新增记忆</button><div id="scene_diary_memories"></div></section><section data-page="diary" hidden><div id="scene_diary_diaries"></div></section><section data-page="settings" hidden><h4>模型</h4><label>日记／角色成长连接<select data-setting="diaryConnectionProfile"></select></label><label>记忆连接<select data-setting="memoryConnectionProfile"></select></label><h4>召回</h4><label>读取最近有效消息数<input data-setting="recallMessageCount" type="number" min="1" max="20"></label><label>最多召回条目<input data-setting="recallLimit" type="number" min="0" max="30"></label><label>长期记忆预算（tokens）<input data-setting="memoryTokenBudget" type="number" min="100"></label><label>近期日记篇数<input data-setting="recentDiaryCount" type="number" min="0" max="20"></label><label>角色成长目标长度<input data-setting="growthTargetLength"></label><h4>正文标签</h4><p class="scene-diary-muted">每行一组完整标签；同一行的开始与结束标签必须同名。全部留空时提取完整消息。</p><div data-pair-editor>${[['角色正文', 'character.bodyTagPairs'], ['玩家正文', 'user.bodyTagPairs'], ['角色故事时间', 'character.storyTimeTagPairs'], ['玩家故事时间', 'user.storyTimeTagPairs']].map(([label, key]) => `<fieldset class="scene-diary-tag-pair"><legend>${label}</legend><label>开始标签<textarea rows="2" data-pair-open="${key}" placeholder="<now_plot>"></textarea></label><label>结束标签<textarea rows="2" data-pair-close="${key}" placeholder="</now_plot>"></textarea></label></fieldset>`).join('')}</div><h4>提示词</h4><p class="scene-diary-muted">这里只编辑模型角色定义。角色卡描述、性格、场景、输入内容和 JSON 格式由插件自动附加。</p><label>日记提示词<textarea data-setting="promptDiary" rows="5"></textarea></label><label>记忆提示词<textarea data-setting="promptMemory" rows="5"></textarea></label><label>角色成长提示词<textarea data-setting="promptGrowth" rows="8"></textarea></label><button data-action="save-settings">保存当前聊天设置</button><button data-action="reset-prompts">恢复默认提示词</button></section><section data-page="debug" hidden><p data-debug></p><pre data-debug-list></pre></section>`;
    document.body.append(panel);
    bar.addEventListener('click', event => { const action = event.target.closest('[data-action]')?.dataset.action; if (action === 'open') { panel.hidden = false; render(); fillSettings(); } if (action === 'end') void closeAct(); });
    panel.addEventListener('click', handlePanelClick);
    panel.addEventListener('change', handlePanelChange);
    panel.addEventListener('input', event => { if (event.target.matches('[data-memory-search],[data-memory-category]')) renderMemories(getState()); if (event.target.matches('[data-growth-editor]')) { const count = panel.querySelector('[data-growth-count]'); if (count) count.textContent = `${event.target.value.length} / ${getState()?.settings.maxGrowthChars || 4000} 字符`; } if (event.target.matches('[data-preview]')) savePreviewField(event.target); });
}

function savePreviewField(field) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction) return; if (field.dataset.preview === 'title' && transaction.results.diary.status === 'success') transaction.results.diary.value.title = field.value; if (field.dataset.preview === 'diary' && transaction.results.diary.status === 'success') transaction.results.diary.value.diary = field.value; if (field.dataset.preview === 'growth' && transaction.results.growth.status === 'success') { transaction.results.growth.generatedValue ??= transaction.results.growth.value; transaction.results.growth.value = field.value; } setState(state); }

function handlePanelClick(event) {
    const target = event.target.closest('[data-action]'), action = target?.dataset.action, panel = document.querySelector(`#${PANEL}`);
    if (action === 'close') panel.hidden = true;
    if (action === 'end') void closeAct();
    if (action === 'takeover') takeOver(0);
    if (action === 'retry-part') retryClosePart(target.dataset.kind);
    if (action === 'confirm') { const state = getState(), transaction = state?.pendingTransaction; if (transaction && allPartsReady(transaction)) { const diary = transaction.results.diary.value; diary.title = panel.querySelector('[data-preview=title]').value.trim(); diary.diary = panel.querySelector('[data-preview=diary]').value.trim(); const growth = panel.querySelector('[data-preview=growth]').value.trim(); transaction.results.growth.generatedValue ??= transaction.results.growth.value; transaction.results.growth.value = growth; transaction.results.memory.value.forEach((memory, index) => memory._reject = !panel.querySelector(`[data-candidate="${index}"]`)?.checked); setState(state); } confirmClose(); }
    if (action === 'cancel-close') cancelClose();
    if (action === 'skip') skipExtraction(target.dataset.id);
    if (action === 'save-growth') saveGrowth(panel);
    if (action === 'new-memory') { const state = getState(); if (state) { state.memories.unshift(normalizeMemory({ title: '新记忆', content: '', edited: true, locked: true })); setState(state); void saveState(state); render(state); } }
    if (action === 'save-memory') saveMemory(target);
    if (action === 'delete-memory') { const state = getState(), memory = state?.memories.find(item => item.id === target.closest('[data-memory-id]')?.dataset.memoryId); if (memory) { memory.deletedAt = Date.now(); memory.revision++; setState(state); void saveState(state); render(state); } }
    if (action === 'save-diary') { const entry = target.closest('.scene-diary-entry'), state = getState(), id = +entry?.querySelector('[data-diary-id]')?.dataset.diaryId, act = findAct(state, id); if (act) { act.diary = entry.querySelector('textarea').value.trim(); acknowledgeActReview(act, messagesFor(act.id)); setState(state); void saveState(state); render(state); } }
    if (action === 'save-settings') saveChatSettings(panel);
    if (action === 'reset-prompts') { panel.querySelector('[data-setting=promptDiary]').value = DEFAULT_DIARY_PROMPT; panel.querySelector('[data-setting=promptMemory]').value = DEFAULT_MEMORY_PROMPT; panel.querySelector('[data-setting=promptGrowth]').value = DEFAULT_GROWTH_PROMPT; }
    const tab = event.target.closest('[data-tab]')?.dataset.tab; if (tab) { panel.querySelectorAll('[data-page]').forEach(page => page.hidden = page.dataset.page !== tab); if (tab === 'debug') renderDebug(panel); }
}

function saveGrowth(panel) { const state = getState(); if (!state) return; const content = panel.querySelector('[data-growth-editor]').value.trim(); if (content.length > state.settings.maxGrowthChars) { notify('error', `角色成长不能超过 ${state.settings.maxGrowthChars} 字符。`); return; } const time = localTime(); state.characterGrowth = { ...state.characterGrowth, content, createdAt: state.characterGrowth.createdAt || (content ? time.timestamp : null), updatedAt: time.timestamp, timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, edited: true, reviewRecommended: false }; state.takeoverNotice = false; setState(state); void saveState(state); render(state); notify('success', '角色成长已保存并会在后续生成中注入。'); }
function saveMemory(target) { const entry = target.closest('[data-memory-id]'), state = getState(), memory = state?.memories.find(item => item.id === entry?.dataset.memoryId); if (!memory) return; memory.title = entry.querySelector('[data-memory-field=title]').value.trim(); memory.content = entry.querySelector('[data-memory-field=content]').value.trim(); memory.category = entry.querySelector('[data-memory-field=category]').value; memory.importance = +entry.querySelector('[data-memory-field=importance]').value || 3; memory.locked = entry.querySelector('[data-memory-field=locked]').checked; acknowledgeMemoryReview(memory); setState(state); void saveState(state); render(state); }
function handlePanelChange(event) { if (event.target.matches('[data-candidate]')) { const state = getState(), transaction = state?.pendingTransaction, memory = transaction?.results?.memory?.value?.[+event.target.dataset.candidate]; if (memory) { memory._reject = !event.target.checked; setState(state); } return; } if (!event.target.matches('[data-memory-field=permanent]')) return; const state = getState(), entry = event.target.closest('[data-memory-id]'), memory = state?.memories.find(item => item.id === entry?.dataset.memoryId); if (!state || !memory) return; if (event.target.checked && !canSetMemoryPermanent(state.memories, state.settings.recallLimit, memory.id)) { event.target.checked = false; notify('error', `常驻记忆不能超过“最多召回条目”（当前为 ${state.settings.recallLimit}）。请先在设置中调大该值。`); return; } memory.permanent = event.target.checked; memory.updatedAt = Date.now(); memory.revision = (+memory.revision || 0) + 1; setState(state); void saveState(state); render(state); }
function readPairEditor(panel, key) { const lines = selector => (panel.querySelector(selector)?.value || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean), opens = lines(`[data-pair-open="${key}"]`), closes = lines(`[data-pair-close="${key}"]`); if (opens.length !== closes.length) throw new Error(`${key} 的开始标签与结束标签数量必须一致。`); return opens.map((open, index) => { const pair = validateTagPair({ open, close: closes[index] }); if (!pair) throw new Error(`${key} 第 ${index + 1} 组标签无效或名称不一致。`); return pair; }); }
function saveChatSettings(panel) { const state = getState(); if (!state) return; try { const requestedLimit = +panel.querySelector('[data-setting=recallLimit]').value, permanentCount = permanentMemoryCount(state.memories); if (requestedLimit < permanentCount) throw new Error(`当前已有 ${permanentCount} 条常驻记忆。“最多召回条目”不能低于常驻数量。`); const settings = state.settings; settings.diaryConnectionProfile = panel.querySelector('[data-setting=diaryConnectionProfile]').value; settings.memoryConnectionProfile = panel.querySelector('[data-setting=memoryConnectionProfile]').value; for (const key of ['recallMessageCount', 'recallLimit', 'memoryTokenBudget', 'recentDiaryCount']) settings[key] = +panel.querySelector(`[data-setting="${key}"]`).value; settings.growthTargetLength = panel.querySelector('[data-setting=growthTargetLength]').value.trim() || DEFAULT_SETTINGS.growthTargetLength; settings.extraction ||= {}; for (const key of ['character.bodyTagPairs', 'user.bodyTagPairs', 'character.storyTimeTagPairs', 'user.storyTimeTagPairs']) { const [who, field] = key.split('.'); settings.extraction[who] ||= {}; settings.extraction[who][field] = readPairEditor(panel, key); } settings.prompts = { diary: panel.querySelector('[data-setting=promptDiary]').value.trim() || DEFAULT_DIARY_PROMPT, memory: panel.querySelector('[data-setting=promptMemory]').value.trim() || DEFAULT_MEMORY_PROMPT, growth: panel.querySelector('[data-setting=promptGrowth]').value.trim() || DEFAULT_GROWTH_PROMPT }; state.settings = normalizeSettings(settings); setState(state); void saveState(state); notify('success', '当前聊天设置已保存。'); render(state); } catch (error) { notify('error', error.message || String(error)); } }
function renderDebug(panel) { const state = getState(), output = panel.querySelector('[data-debug-list]'); panel.querySelector('[data-debug]').textContent = disabledReason || `当前幕 ${state?.currentActId || '-'}；记忆 ${state?.memories.length || 0} 条；召回本轮 ${lastRecall?.selected.length || 0} 条。`; const growth = state?.characterGrowth; output.textContent = JSON.stringify({ continuity: lastContinuity, characterGrowth: growth ? { included: !!growth.content, revision: growth.revision, lastIncludedActId: growth.lastIncludedActId, reviewRecommended: growth.reviewRecommended, characters: growth.content.length, estimatedTokens: estimateTokens(growth.content) } : null, recall: lastRecall ? { query: lastRecall.query, budgetUsed: lastRecall.budgetUsed, candidates: lastRecall.candidates.slice(0, 12).map(item => ({ title: item.memory.title, score: +item.score.toFixed(2), hits: item.hits, selected: lastRecall.selected.includes(item) })) } : null }, null, 2); }
function fillSettings() { const panel = document.querySelector(`#${PANEL}`), state = getState(); if (!panel || !state) return; for (const key of ['recallMessageCount', 'recallLimit', 'memoryTokenBudget', 'recentDiaryCount', 'growthTargetLength']) panel.querySelector(`[data-setting="${key}"]`).value = state.settings[key]; for (const key of ['character.bodyTagPairs', 'user.bodyTagPairs', 'character.storyTimeTagPairs', 'user.storyTimeTagPairs']) { const [who, field] = key.split('.'), pairs = state.settings.extraction[who][field] || [], open = panel.querySelector(`[data-pair-open="${key}"]`), close = panel.querySelector(`[data-pair-close="${key}"]`); if (open) open.value = pairs.map(item => item.open).join('\n'); if (close) close.value = pairs.map(item => item.close).join('\n'); } panel.querySelector('[data-setting=promptDiary]').value = state.settings.prompts.diary || DEFAULT_DIARY_PROMPT; panel.querySelector('[data-setting=promptMemory]').value = state.settings.prompts.memory || DEFAULT_MEMORY_PROMPT; panel.querySelector('[data-setting=promptGrowth]').value = state.settings.prompts.growth || DEFAULT_GROWTH_PROMPT; }
function bind() { const eventSource = source(), eventTypes = types(); if (!eventSource?.on) return; eventSource.on(eventTypes.MESSAGE_SENT || 'message_sent', sent); eventSource.on(eventTypes.MESSAGE_RECEIVED || 'message_received', received); eventSource.on(eventTypes.MESSAGE_EDITED || 'message_edited', changed); eventSource.on(eventTypes.MESSAGE_UPDATED || 'message_updated', changed); eventSource.on(eventTypes.MESSAGE_DELETED || 'message_deleted', deleted); eventSource.on(eventTypes.MESSAGE_SWIPED || 'message_swiped', changed); eventSource.on(eventTypes.CHAT_CHANGED || 'chat_id_changed', initializeChat); eventSource.on(eventTypes.CHAT_LOADED || 'chatLoaded', initializeChat); eventSource.on(eventTypes.CHAT_COMPLETION_PROMPT_READY || 'chat_completion_prompt_ready', promptReady); }
function init() { if (initialized) return; initialized = true; createUi(); if (!document.getElementById(BAR)) setTimeout(() => { createUi(); initializeChat(); fillSettings(); }, 800); bind(); initializeChat(); fillSettings(); globalThis.sceneDiary = { version: '0.2.5', getState, closeAct, confirmClose, takeOver }; console.info(`[${NAME}] loaded`); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
