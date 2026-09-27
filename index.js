import { extension_prompt_roles, extension_prompt_types, setExtensionPrompt } from '../../../../script.js';
import { getContext } from '../../../st-context.js';
import { applyMemoryChanges, findMemoryNeighbors, memoryEligible, memoryLine, memoryText, planMemoryChanges, retrieveMemories, undoLastMaintenance, validateCandidates } from './memory-system.js';
import { embed, indexVectors, loadVectors, validateSemanticEndpoint } from './semantic.js';
import {
    SCHEMA_VERSION, STORAGE_KEY, DEFAULT_SETTINGS, DEFAULT_DIARY_PROMPT, DEFAULT_MEMORY_PROMPT, DEFAULT_GROWTH_PROMPT,
    MEMORY_CATEGORIES, acknowledgeActReview, acknowledgeMemoryReview, assignMessageToAct, beginNextAct,
    buildCharacterContext, buildContinuityBlock, buildDialogue, buildDiaryPrompt, buildGrowthPrompt, buildMemoryPrompt,
    buildRecallQuery, canSetMemoryPermanent, createState, currentAct, estimateTokens, filterPromptMessages, findAct,
    insertContinuityBeforeHistory, isNormalRpMessage, localTime, markActDirty, newId, normalizeMemory, normalizeSettings,
    normalizeState, parseDiaryResponse, parseGrowthResponse, parseMemoryResponse, permanentMemoryCount, recallMemories,
    sourceChanged, sourceFingerprint, validateTagPair, fingerprint, extractMessage,
} from './core.js';

const NAME = 'scene&diary';
const PANEL = 'scene_diary_panel';
const BAR = 'scene_diary_toolbar';
const DIARY_KEY = 'scene_diary_diaries';
const MEMORY_KEY = 'scene_diary_memories';
let activeChatKey = '', disabledReason = '', initialized = false, closingPromise = null, lastRecall = null, lastContinuity = null, awaitingMainPrompt = false, migrationPending = false;
let recallContent = '', recallCache = new Map(), semanticKey = '', sessionAccount = '', pendingSave = false, saveUnverified = false, maintenancePreview = null;
let recallGeneration = 0;
let maintenanceScan = 0;
const migrationReady = new Map(), migrationPreparing = new Set(), migrationSaving = new Set();

const ctx = () => getContext();
const chat = () => ctx().chat || [];
const meta = () => ctx().chatMetadata || {};
const schemaVersion = value => Number.isFinite(+value?.version) ? +value.version : 0;
const types = () => ctx().eventTypes || {};
const source = () => ctx().eventSource;
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function notify(type, message) { const handler = globalThis.toastr?.[type]; handler ? handler(message, NAME) : console[type === 'error' ? 'error' : 'log'](`[${NAME}] ${message}`); }
function hasSp() { return !!globalThis.AutoCardUpdaterAPI; }
function globalSettings() { const all = ctx().extensionSettings || {}; all.scene_diary ||= structuredClone(DEFAULT_SETTINGS); return normalizeSettings(all.scene_diary); }
function getState() { const raw = meta()[STORAGE_KEY]; if (!raw) return null; if (schemaVersion(raw) > SCHEMA_VERSION) { disabledReason = `聊天数据版本 ${raw.version} 高于本插件支持版本，已进入只读模式。`; return null; } if (schemaVersion(raw) < SCHEMA_VERSION && migrationReady.get(activeChatKey) !== raw) { if (!disabledReason.startsWith('迁移备份失败')) disabledReason = '旧版聊天正在备份，备份完成前保持只读。'; return null; } migrationPending ||= schemaVersion(raw) !== SCHEMA_VERSION || !raw.characterGrowth; const state = normalizeState(raw); meta()[STORAGE_KEY] = state; return state; }
function setState(state) { state.lastUpdatedAt = Date.now(); meta()[STORAGE_KEY] = state; return state; }
async function verifyPersistedCommit(state, key = activeChatKey) {
    const character = ctx().characters?.[ctx().characterId], name = character?.chat;
    if (!name || !character?.avatar || key !== String(ctx().chatId)) throw new Error('无法确认当前聊天文件身份');
    const response = await fetch('/api/chats/get', { method: 'POST', headers: ctx().getRequestHeaders?.() || { 'Content-Type': 'application/json' }, cache: 'no-cache', body: JSON.stringify({ ch_name: character.name, file_name: name, avatar_url: character.avatar }) });
    if (!response.ok) throw new Error('无法读取已保存聊天');
    const persisted = await response.json();
    if (key !== activeChatKey || String(ctx().chatId) !== key) throw new Error('核验期间聊天已切换');
    if (!Array.isArray(persisted) || persisted[0]?.chat_metadata?.[STORAGE_KEY]?.lastUpdatedAt !== state.lastUpdatedAt || JSON.stringify(persisted[0].chat_metadata[STORAGE_KEY]) !== JSON.stringify(state)) throw new Error('保存后核验失败');
    const savedOwnership = new Set(persisted.slice(1).map(message => `${message?.extra?.scene_diary?.messageId}:${message?.extra?.scene_diary?.actId}`));
    if (chat().some(message => message?.extra?.scene_diary?.messageId && !savedOwnership.has(`${message.extra.scene_diary.messageId}:${message.extra.scene_diary.actId}`))) throw new Error('保存后消息归属核验失败');
    return true;
}
async function saveState(state = getState(), key = activeChatKey, verified = false) { if (!state || key !== activeChatKey || String(ctx().chatId) !== String(key)) { if (verified) throw new Error('聊天已切换，保存已取消'); return false; } await (ctx().saveMetadata || ctx().saveChat)?.(); if (verified) await verifyPersistedCommit(state, key); migrationPending = false; return true; }
const recoveryKey = (state, key = activeChatKey) => `scene_diary_recovery_${semanticIdentity(state).account}_${key}_${state.memorySpaceId}`;
async function preserveRecovery(state, key = activeChatKey) { try { await SillyTavern.libs.localforage.setItem(recoveryKey(state, key), structuredClone(state)); } catch (error) { throw new Error(`无法保存本地恢复副本：${error.message}`); } }
async function clearRecovery(state, key = activeChatKey) { await SillyTavern.libs.localforage.removeItem(recoveryKey(state, key)); }
function showSaveError(error) { notify('error', `保存未核验：${error.message || error}。本地恢复副本已保留，请在当前聊天重试。`); }
function semanticIdentity(state) { const storage = ctx().accountStorage; let account = storage?.getItem('scene_diary_account_id'); if (!account) { account = storage ? newId('account') : sessionAccount || newId('session'); storage?.setItem('scene_diary_account_id', account); } if (sessionAccount && sessionAccount !== account) { semanticKey = ''; recallCache.clear(); } sessionAccount = account; return { account, chat: activeChatKey, space: state.memorySpaceId }; }
function clearPrompts() { for (const key of [DIARY_KEY, MEMORY_KEY]) setExtensionPrompt(key, '', extension_prompt_types.NONE, 0, false, extension_prompt_roles.SYSTEM); }
function compatible() { if (hasSp()) { disabledReason = '检测到 SP·数据库：scene&diary 不支持同时启用。请停用 SP 后刷新。'; clearPrompts(); return false; } return true; }
function messagesFor(actId) { return chat().filter(message => +message.extra?.scene_diary?.actId === +actId && isNormalRpMessage(message)); }

function initializeChat() {
    if (!ctx().chatId || ctx().groupId) { disabledReason = 'scene&diary v0.3 只支持单角色聊天。'; clearPrompts(); render(); return null; }
    if (!compatible()) { render(); return null; }
    const key = String(ctx().chatId);
    if (key !== activeChatKey) { activeChatKey = key; closingPromise = null; lastRecall = null; recallContent = ''; recallCache.clear(); recallGeneration++; maintenancePreview = null; migrationPending = false; saveUnverified = false; clearPrompts(); }
    const original = meta()[STORAGE_KEY];
    if (original && schemaVersion(original) < SCHEMA_VERSION && migrationReady.get(key) !== original) {
        if (!migrationPreparing.has(key)) { migrationPreparing.add(key); void (async () => { try { const account = semanticIdentity({ memorySpaceId: 'legacy' }).account, backupKey = `scene_diary_migration_backup_${account}_${key}`, snapshot = { savedAt: Date.now(), codeVersion: '0.3.0-rc.1', schema: original.version, metadata: structuredClone(meta()), messages: structuredClone(chat()) }; if (!await SillyTavern.libs.localforage.getItem(backupKey)) await SillyTavern.libs.localforage.setItem(backupKey, snapshot); if (key === activeChatKey && String(ctx().chatId) === key && meta()[STORAGE_KEY] === original) { migrationReady.set(key, original); initializeChat(); } } catch (error) { disabledReason = `迁移备份失败，未修改聊天：${error.message}`; render(); } finally { migrationPreparing.delete(key); } })(); }
        return null;
    }
    let state = getState();
    if (!state && meta()[STORAGE_KEY] && schemaVersion(meta()[STORAGE_KEY]) > SCHEMA_VERSION) { render(); return null; }
    if (state) {
        if (migrationSaving.has(key)) { disabledReason = '旧版聊天迁移正在核验保存，完成前保持只读。'; render(state); return state; }
        const checkingKey = key; void SillyTavern.libs.localforage.getItem(recoveryKey(state)).then(copy => { if (copy && checkingKey === activeChatKey) { saveUnverified = true; disabledReason = '发现未核验的本地保存副本，请在记忆库恢复保存后继续聊天。'; render(getState()); } }).catch(error => notify('warning', `恢复副本检查失败：${error.message}`));
        disabledReason = migrationSaving.has(key) ? '旧版聊天迁移正在核验保存，完成前保持只读。' : saveUnverified ? '上次保存尚未核验，请在记忆库恢复保存后继续聊天。' : '';
        let repaired = migrationPending;
        if (state.status === 'closing') { state.status = 'preview'; const act = currentAct(state); if (act) act.status = 'closing'; for (const result of Object.values(state.pendingTransaction?.results || {})) if (result.status === 'pending') { result.status = 'error'; result.error = '请求中断，请仅重试本项。'; } state.lastError = '上次整理已中断，成功部分保留在预览中。'; repaired = true; }
        if (state.status === 'preview' && !state.pendingTransaction) { state.status = 'active'; const act = currentAct(state); if (act?.status === 'closing') act.status = 'active'; repaired = true; }
        repaired = repair(state) || repaired;
        if (repaired) {
            setState(state);
            if (migrationPending) {
                saveUnverified = true;
                disabledReason = '旧版聊天迁移正在核验保存，完成前保持只读。';
                if (!migrationSaving.has(key)) { migrationSaving.add(key); void (async () => { try { await preserveRecovery(state, key); await saveState(state, key, true); await clearRecovery(state, key); if (key === activeChatKey) { saveUnverified = false; disabledReason = ''; render(state); } } catch (error) { if (key === activeChatKey) { disabledReason = `迁移保存未核验：${error.message}`; showSaveError(error); render(state); } } finally { migrationSaving.delete(key); } })(); }
            } else void saveState(state);
        }
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
    }
    return changedState;
}

function takeOver(index = 0) {
    if (!compatible() || !ctx().chatId || meta()[STORAGE_KEY]) return;
    const state = createState(); state.settings = globalSettings(); state.takeoverNotice = true;
    chat().forEach((message, messageIndex) => { if (messageIndex >= index && isNormalRpMessage(message)) assignMessageToAct(state, message, 1, messageIndex); });
    state.acts[0].startMessageIndex = index; setState(state); disabledReason = ''; void saveState(state); render(state);
    notify('info', '已接管旧聊天。角色成长为空；建议先手写接管前的关系与成长概况，但这不会阻止关幕。');
}

function sent(index) { const state = initializeChat(), message = chat()[+index]; if (!state || disabledReason || !message?.is_user) return; if (state.status === 'pending_next_act') beginNextAct(state, message, +index); else if (state.status === 'active') assignMessageToAct(state, message, state.currentActId, +index); setState(state); void saveState(state); render(state); }
function received(index) { const state = getState(), message = chat()[+index]; if (!state || disabledReason || state.status !== 'active' || !isNormalRpMessage(message) || message.is_user) return; assignMessageToAct(state, message, state.currentActId, +index); setState(state); void saveState(state); render(state); }
function reviewSourceAct(state, actId) { const act = findAct(state, actId); if (!act || act.status !== 'closed' || !sourceChanged(act, messagesFor(act.id))) return false; act.dirty = true; const byId = new Map(messagesFor(act.id).map(message => [message.extra?.scene_diary?.messageId, message])); for (const memory of state.memories) { const sources = memory.sources?.filter(source => source.actId === act.id) || []; if (sources.length) { if (sources.some(source => { const message = byId.get(source.messageId); if (!message) return true; if (source.unverifiedLegacy) return true; const body = extractMessage(message.mes, message.is_user ? state.settings.extraction.user : state.settings.extraction.character).body; return fingerprint(body) !== source.fingerprint || !body.includes(source.excerpt); })) memory.dirty = true; } else if (memory.sourceActId === act.id) memory.dirty = true; } if (state.characterGrowth?.lastIncludedActId >= act.id) state.characterGrowth.reviewRecommended = true; state.memoryRevision++; return true; }
function changed(index) { const state = getState(), message = chat()[+index], actId = message?.extra?.scene_diary?.actId; if (state && !disabledReason && actId && reviewSourceAct(state, actId)) { setState(state); void saveState(state); render(state); } }
function deleted() { const state = getState(); if (!state || disabledReason) return; let didChange = false; for (const act of state.acts) didChange = reviewSourceAct(state, act.id) || didChange; if (didChange) { setState(state); void saveState(state); render(state); } }

function profileOptions(value) { try { return ['<option value="">沿用当前聊天连接</option>', ...(ctx().ConnectionManagerRequestService?.getSupportedProfiles?.() || []).map(profile => `<option value="${escape(profile.id)}" ${profile.id === value ? 'selected' : ''}>独立：${escape(profile.name)}</option>`)].join(''); } catch { return '<option value="">沿用当前聊天连接</option>'; } }
async function request(profile, prompt, responseLength = 1600) { if (profile) { const service = ctx().ConnectionManagerRequestService; if (!service?.sendRequest) throw new Error('连接管理器不可用。'); const output = await service.sendRequest(profile, prompt, responseLength, { stream: false, extractData: true, includePreset: false, includeInstruct: false }); return output?.content ?? output; } if (String(ctx().mainApi || '').toLowerCase() !== 'openai') throw new Error('辅助整理需要 Chat Completion，或选择独立连接。'); const output = await ctx().generateRawData({ prompt, api: 'openai', quietToLoud: true, responseLength }); return output?.content ?? output; }
function characterData() { const fields = ctx().getCharacterCardFields?.() || {}; return { char: ctx().name2 || fields.name || '角色', user: ctx().name1 || '玩家', context: buildCharacterContext({ description: fields.description, personality: fields.personality, scenario: fields.scenario }) }; }
const modelMessages = content => [{ role: 'system', content: '你只输出机器可解析 JSON。' }, { role: 'user', content }];
function modelJson(value, label) { try { return typeof value === 'object' ? value : JSON.parse(String(value).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')); } catch { throw new Error(`${label}返回的 JSON 无法解析`); } }

async function generateClosePart(transaction, kind, settings) {
    const common = { characterName: transaction.character.char, userName: transaction.character.user, characterContext: transaction.character.context, dialogue: transaction.dialogue.text };
    if (kind === 'diary') { const prompt = modelMessages(buildDiaryPrompt({ ...common, targetLength: settings.diaryTargetLength, prompt: settings.prompts.diary })); return parseDiaryResponse(await request(settings.diaryConnectionProfile, prompt)); }
    if (kind === 'memory') {
        const dialogue = transaction.dialogue.rows.map(row => `[消息ID:${row.id}] ${row.speaker}: ${row.body}${row.storyTime ? `\n[故事时间:${row.storyTime}]` : ''}`).join('\n\n');
        let candidates = transaction.memoryCandidates;
        if (!candidates) { const prompt = modelMessages(buildMemoryPrompt({ ...common, dialogue, prompt: settings.prompts.memory })); const parsed = modelJson(await request(settings.memoryConnectionProfile || settings.diaryConnectionProfile, prompt), '记忆模型'); if (!Array.isArray(parsed?.memories)) throw new Error('记忆模型未返回 memories 数组'); candidates = validateCandidates(parsed.memories, transaction.dialogue.rows, transaction.actId); }
        transaction.memoryCandidates = candidates;
        const neighbors = findMemoryNeighbors(candidates, getState()?.memories || []);
        if (!neighbors.some(group => group.neighbors.length)) return { candidates, operations: planMemoryChanges(candidates, getState()?.memories || []) };
        const old = new Map((getState()?.memories || []).map(memory => [memory.id, memory]));
        const comparison = neighbors.map(group => ({ candidate: candidates.find(candidate => candidate.id === group.candidateId), old: group.neighbors.map(id => old.get(id)).filter(Boolean).map(memory => ({ id: memory.id, title: memory.title, content: memory.content, status: memory.status, storyTime: memory.storyTime, locked: memory.locked })) }));
        const instruction = '只返回严格 JSON {"operations":[{"action":"add|merge|supersede|skip","candidateId":"候选ID","targetId":"仅 merge/supersede 时填写旧记忆ID","reason":"依据"}]}。每条候选恰好一项操作；不同时间分别成立的事实应保留。锁定条目只能跳过或新增，不能修改。相似不等于重复。';
        const decision = await request(settings.memoryConnectionProfile || settings.diaryConnectionProfile, modelMessages(`${instruction}\n${JSON.stringify(comparison)}`));
        const output = modelJson(decision, '记忆对照');
        return { candidates, operations: planMemoryChanges(candidates, getState()?.memories || [], output?.operations) };
    }
    const prompt = modelMessages(buildGrowthPrompt({ ...common, currentGrowth: transaction.baseGrowth, targetLength: settings.growthTargetLength, prompt: settings.prompts.growth }));
    return parseGrowthResponse(await request(settings.diaryConnectionProfile, prompt, 2400), settings.maxGrowthChars);
}

async function runCloseParts(transactionId, kinds) {
    const before = getState(), transaction = before?.pendingTransaction;
    if (!transaction || transaction.id !== transactionId) return;
    for (const kind of kinds) transaction.results[kind] = { status: 'pending' };
    setState(before); try { await saveState(before, activeChatKey, true); } catch (error) { kinds.forEach(kind => { transaction.results[kind] = { status: 'error', error: `任务启动状态保存失败：${error.message}` }; }); before.status = 'preview'; setState(before); render(before); showSaveError(error); return; } render(before);
    const settled = await Promise.allSettled(kinds.map(async kind => ({ kind, value: await generateClosePart(transaction, kind, before.settings) })));
    if (String(ctx().chatId) !== activeChatKey) return;
    const state = getState(), current = state?.pendingTransaction;
    if (!current || current.id !== transactionId || current.chatKey !== activeChatKey) return;
    if (transaction.memoryCandidates) current.memoryCandidates = transaction.memoryCandidates;
    settled.forEach((result, index) => { const kind = kinds[index]; current.results[kind] = result.status === 'fulfilled' ? { status: 'success', value: result.value.value } : { status: 'error', error: result.reason?.message || String(result.reason) }; });
    state.status = 'preview'; setState(state); let previewSaved = true; try { await saveState(state, activeChatKey, true); } catch (error) { previewSaved = false; showSaveError(error); } render(state);
    if (!previewSaved) return;
    const failures = kinds.filter(kind => current.results[kind].status === 'error');
    if (failures.length) notify('error', `${failures.map(kindLabel).join('、')}生成失败；成功部分已保留，可单独重试。`); else notify('success', '日记、记忆与角色成长已生成，请预览确认。');
}

function kindLabel(kind) { return ({ diary: '日记', memory: '记忆', growth: '角色成长' })[kind] || kind; }
async function closeAct() {
    if (closingPromise) return closingPromise;
    const state = getState(), act = currentAct(state);
    if (!state || disabledReason || !act || state.status !== 'active' || !compatible()) return;
    const sourceMessages = messagesFor(act.id), character = characterData(), dialogue = buildDialogue(sourceMessages, state.settings.extraction, character.char, character.user);
    if (dialogue.errors.length) { state.drafts = [{ kind: 'extraction-errors', actId: act.id, errors: dialogue.errors, createdAt: Date.now() }]; setState(state); await saveState(state); render(state); notify('error', '正文标签无法匹配：请在“当前幕”检查并修正规则，或明确跳过楼层。'); return; }
    if (!sourceMessages.length) { notify('info', '当前幕还没有可整理内容。'); return; }
    const transaction = { id: newId('close'), chatKey: activeChatKey, actId: act.id, sourceFingerprint: sourceFingerprint(sourceMessages), sourceMessageIds: sourceMessages.map(message => message.extra.scene_diary.messageId), settingsFingerprint: fingerprint(JSON.stringify(state.settings)), startedAt: Date.now(), dialogue, character, baseGrowth: state.characterGrowth.content, memoryRevision: state.memoryRevision, growthRevision: state.characterGrowth.revision, results: { diary: { status: 'pending' }, memory: { status: 'pending' }, growth: { status: 'pending' } } };
    state.status = 'closing'; act.status = 'closing'; state.pendingTransaction = transaction; setState(state); try { await saveState(state, activeChatKey, true); } catch (error) { state.status = 'active'; act.status = 'active'; state.pendingTransaction = null; setState(state); render(state); notify('error', `关幕准备未保存，尚未调用模型：${error.message}`); return; } render(state);
    closingPromise = runCloseParts(transaction.id, ['diary', 'memory', 'growth']).finally(() => closingPromise = null);
    return closingPromise;
}

function retryClosePart(kind) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction || !['diary', 'memory', 'growth'].includes(kind) || transaction.results[kind]?.status === 'pending') return; void runCloseParts(transaction.id, [kind]); }
function allPartsReady(transaction) { return ['diary', 'memory', 'growth'].every(kind => transaction?.results?.[kind]?.status === 'success'); }

async function confirmClose() {
    if (pendingSave) return;
    const state = getState(), transaction = state?.pendingTransaction, act = transaction && findAct(state, transaction.actId);
    if (!state || disabledReason || state.status !== 'preview' || !transaction || !act || !allPartsReady(transaction)) { notify('error', '日记、记忆和角色成长必须全部生成成功后才能确认关幕。'); return; }
    const sourceMessages = messagesFor(act.id), fresh = sourceFingerprint(sourceMessages);
    if (fresh !== transaction.sourceFingerprint || transaction.chatKey !== activeChatKey || fingerprint(JSON.stringify(state.settings)) !== transaction.settingsFingerprint) { notify('error', '本幕内容或设置已变更，请重新整理预览。'); return; }
    const memoryRevision = state.memoryRevision;
    if (memoryRevision !== transaction.memoryRevision) { notify('error', '记忆库已变更，请重新整理预览。'); return; }
    if (state.characterGrowth.revision !== transaction.growthRevision) { notify('error', '角色成长已被修改，请重新整理预览。'); return; }
    const growthContent = String(transaction.results.growth.value || '').trim();
    if (!growthContent || growthContent.length > state.settings.maxGrowthChars) { notify('error', `角色成长必须为 1–${state.settings.maxGrowthChars} 个字符。`); return; }
    const diary = transaction.results.diary.value;
    act.status = 'closed'; act.closedAt = Date.now(); act.title = diary.title; act.diary = diary.diary;
    act.endMessageIndex = sourceMessages.at(-1)?.extra?.scene_diary?.messageIndex ?? null;
    act.endSceneTime = transaction.dialogue.rows.map(row => row.storyTime).filter(Boolean).at(-1) || null;
    act.sourceFingerprint = fresh; act.revision++; act.dirty = false;
    const memoryResult = transaction.results.memory.value;
    try { applyMemoryChanges(state, memoryResult.candidates, memoryResult.operations, transaction.id); } catch (error) { notify('error', error.message); return; }
    const time = localTime(), generatedGrowth = transaction.results.growth.generatedValue ?? transaction.results.growth.value;
    state.characterGrowth = { ...state.characterGrowth, content: growthContent, createdAt: state.characterGrowth.createdAt || time.timestamp, updatedAt: time.timestamp, timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, lastIncludedActId: act.id, edited: state.characterGrowth.edited || growthContent !== generatedGrowth, reviewRecommended: false };
    state.status = 'pending_next_act'; state.pendingTransaction = null; state.takeoverNotice = false; setState(state); pendingSave = true; saveUnverified = true;
    try { await preserveRecovery(state); await saveState(state, activeChatKey, true); await clearRecovery(state); saveUnverified = false; disabledReason = ''; render(state); notify('success', `第${act.id}幕、记忆与角色成长已保存，下一条玩家消息将开启新幕。`); void syncVectors(state).catch(error => notify('warning', `向量更新失败，本地召回仍可用：${error.message}`)); }
    catch (error) { disabledReason = '上次保存尚未核验，请在记忆库恢复保存后继续聊天。'; showSaveError(error); render(state); }
    finally { pendingSave = false; }
}

function cancelClose() { const state = getState(), act = currentAct(state); if (!state || !act) return; state.status = 'active'; act.status = 'active'; state.pendingTransaction = null; setState(state); void saveState(state); render(state); }
function skipExtraction(id) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction?.dialogue) return; transaction.dialogue.errors = transaction.dialogue.errors.filter(item => item.id !== id); transaction.dialogue.rows = transaction.dialogue.rows.filter(item => item.id !== id); transaction.dialogue.text = transaction.dialogue.rows.map(row => `${row.speaker}: ${row.body}`).join('\n\n'); setState(state); void saveState(state); render(state); }

function recallInput(state) { const current = chat().filter(message => isNormalRpMessage(message) && +message.extra?.scene_diary?.actId === state.currentActId).slice(-state.settings.recallMessageCount), built = buildRecallQuery(current, state.settings.extraction); const lastUser = [...built.rows].reverse().find(row => row.isUser); return { ...built, query: lastUser?.body || '', recent: built.rows.filter(row => row !== lastUser).map(row => row.body).join('\n') }; }
function localContinuity(state, input = recallInput(state)) { lastRecall = retrieveMemories(state.memories, input.query, state.settings, { recentQuery: input.recent, revision: state.memoryRevision }); return { recallQuery: input, content: buildContinuityBlock(state, lastRecall, state.settings) }; }
async function syncVectors(state) { const config = state.settings.semantic; if (!config?.enabled) return; await indexVectors(state.memories.filter(memoryEligible), semanticIdentity(state), config, semanticKey || ctx().accountStorage?.getItem('scene_diary_embedding_key') || ''); }
async function prepareContinuity(state, input, chatKey) {
    const key = fingerprint(JSON.stringify([chatKey, state.memoryRevision, state.settings.semantic, input.query, input.recent]));
    if (recallCache.has(key)) return recallCache.get(key);
    let vectors = new Map(), queryVector = null, degraded = '';
    if (state.settings.semantic?.enabled && input.query) {
        try { const config = state.settings.semantic; vectors = await loadVectors(state.memories.filter(memoryEligible), semanticIdentity(state), config); queryVector = (await embed([input.query], config, semanticKey || ctx().accountStorage?.getItem('scene_diary_embedding_key') || '', 3000))[0]; }
        catch (error) { degraded = error.message; }
    }
    let recall = retrieveMemories(state.memories, input.query, state.settings, { vectors, queryVector, recentQuery: input.recent, revision: state.memoryRevision });
    if (state.settings.semantic?.rerank && recall.candidates.length) {
        try {
            const pool = recall.candidates.filter(item => !item.permanent).slice(0, 20), result = await Promise.race([request(state.settings.memoryConnectionProfile || state.settings.diaryConnectionProfile, modelMessages(`只返回严格 JSON {"selected_ids":["候选ID"]}，可返回空数组，不得添加新事实。查询：${input.query}\n候选：${JSON.stringify(pool.map(item => ({ id: item.memory.id, text: memoryText(item.memory) })))}`)), new Promise((_, reject) => setTimeout(() => reject(new Error('模型重排超时')), 5000))]);
            const parsed = JSON.parse(String(result).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, ''));
            if (!Array.isArray(parsed.selected_ids) || new Set(parsed.selected_ids).size !== parsed.selected_ids.length || parsed.selected_ids.some(id => !pool.some(item => item.memory.id === id))) throw new Error('模型重排结果无效');
            const fixed = recall.selected.filter(item => item.permanent), chosen = parsed.selected_ids.map(id => pool.find(item => item.memory.id === id));
            let used = fixed.reduce((total, item) => total + estimateTokens(memoryLine(item.memory)), 0);
            const allowed = []; for (const item of chosen) { if (fixed.length + allowed.length >= state.settings.recallLimit) break; const cost = estimateTokens(memoryLine(item.memory)); if (used + cost <= state.settings.memoryTokenBudget) { allowed.push(item); used += cost; } }
            recall.selected = [...fixed, ...allowed]; recall.budgetUsed = used;
        } catch (error) { degraded = degraded ? `${degraded}；${error.message}` : error.message; }
    }
    if (chatKey !== activeChatKey || state.memoryRevision !== getState()?.memoryRevision) return null;
    recall.degradedReason = degraded; recallCache.set(key, recall); if (recallCache.size > 20) recallCache.delete(recallCache.keys().next().value); return recall;
}
async function sceneDiaryRearrangeChat(promptChat, _contextSize, abort) { const state = getState(), chatKey = activeChatKey, generation = ++recallGeneration; clearPrompts(); awaitingMainPrompt = false; if (!state || !compatible() || state.status !== 'active' || !Array.isArray(promptChat)) return; const input = recallInput(state); if (input.errors.length) { notify('error', `最近消息不符合正文标签规则：${input.errors.map(item => `楼层 ${item.index ?? '?'} ${item.errors.join('、')}`).join('；')}`); abort?.(true); return; } try { lastRecall = await prepareContinuity(state, input, chatKey); if (!lastRecall) localContinuity(state, input); } catch (error) { notify('warning', `语义召回失败，已使用本地召回：${error.message}`); localContinuity(state, input); } if (chatKey !== activeChatKey || generation !== recallGeneration) { abort?.(true); return; } recallContent = buildContinuityBlock(state, lastRecall, state.settings); promptChat.splice(0, promptChat.length, ...filterPromptMessages(promptChat, state.currentActId)); if (String(ctx().mainApi || '').toLowerCase() === 'openai') awaitingMainPrompt = true; else setExtensionPrompt(MEMORY_KEY, recallContent, extension_prompt_types.IN_CHAT, Math.min(promptChat.length, 100), false, extension_prompt_roles.SYSTEM); }
function promptReady(eventData) { const state = getState(), requestChat = eventData?.chat, dryRun = !!eventData?.dryRun; if (!dryRun && !awaitingMainPrompt) return; awaitingMainPrompt = false; if (!state || disabledReason || state.status !== 'active' || !Array.isArray(requestChat)) { lastContinuity = { included: false, reason: '聊天未处于可注入状态', dryRun }; return; } const input = dryRun ? recallInput(state) : null; if (input?.errors?.length) { lastContinuity = { included: false, reason: '召回正文提取失败', dryRun }; return; } const content = dryRun ? localContinuity(state, input).content : recallContent; const index = insertContinuityBeforeHistory(requestChat, content); lastContinuity = { included: index >= 0, index, length: content.length, growthIncluded: !!state.characterGrowth.content, growthRevision: state.characterGrowth.revision, dryRun, reason: index >= 0 ? '' : '没有可注入的角色成长、日记或记忆' }; recallContent = ''; }
globalThis.sceneDiaryRearrangeChat = sceneDiaryRearrangeChat;

function renderMemories(state) {
    const root = document.querySelector('#scene_diary_memories'); if (!root) return;
    const query = document.querySelector('[data-memory-search]')?.value?.toLowerCase() || '', category = document.querySelector('[data-memory-category]')?.value || '';
    const entries = state.memories.filter(memory => !memory.deletedAt && (!query || `${memory.title} ${memory.content} ${memory.people.join(' ')}`.toLowerCase().includes(query)) && (!category || memory.category === category));
    root.innerHTML = entries.length ? entries.map(memory => `<details class="scene-diary-entry" data-memory-id="${escape(memory.id)}"><summary>${escape(memory.title)} <small>${escape(memory.category)}${memory.lifecycle !== 'current' ? ` · ${escape(memory.lifecycle)}` : ''}${memory.permanent ? ' · 常驻' : ''}${memory.dirty ? ' · 待复核' : ''}</small></summary><label>标题<input data-memory-field="title" value="${escape(memory.title)}"></label><label>内容<textarea data-memory-field="content" rows="3">${escape(memory.content)}</textarea></label>${memory.sources?.map((source, index) => `<label>第${source.actId || '?'}幕 · ${escape(source.messageId)} 来源摘录<textarea data-source-index="${index}" rows="2">${escape(source.excerpt || '')}</textarea></label>`).join('') || '<p>手工创建，无来源摘录。</p>'}<label>类别<select data-memory-field="category">${MEMORY_CATEGORIES.map(item => `<option ${item === memory.category ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>重要度<input data-memory-field="importance" type="number" min="1" max="5" value="${memory.importance}"></label><label><input data-memory-field="permanent" type="checkbox" ${memory.permanent ? 'checked' : ''}> 常驻，每次生成时固定召回</label><label><input data-memory-field="locked" type="checkbox" ${memory.locked ? 'checked' : ''}> 锁定，自动整理不可覆盖</label><button data-action="save-memory">保存</button><button data-action="delete-memory">删除</button></details>`).join('') : '<p class="scene-diary-muted">没有符合条件的记忆。</p>';
}

function renderPart(kind, result, transaction) {
    if (result?.status === 'pending') return `<section class="scene-diary-result"><h5>${kindLabel(kind)}</h5><p>正在生成…</p></section>`;
    if (result?.status === 'error') return `<section class="scene-diary-result scene-diary-error"><h5>${kindLabel(kind)}</h5><p>${escape(result.error)}</p><button data-action="retry-part" data-kind="${kind}">仅重试${kindLabel(kind)}</button></section>`;
    if (kind === 'diary') return `<section class="scene-diary-result"><h5>日记</h5><label>标题<input data-preview="title" value="${escape(result.value.title)}"></label><label>日记<textarea data-preview="diary" rows="7">${escape(result.value.diary)}</textarea></label><button data-action="retry-part" data-kind="diary">重新生成日记</button></section>`;
    if (kind === 'growth') return `<section class="scene-diary-result"><h5>角色成长</h5><p class="scene-diary-muted">角色成长记录关系与状态演变，不规定下一幕的时间、地点或开场事件。</p><label>当前角色成长<textarea rows="5" readonly>${escape(transaction.baseGrowth || '尚未建立')}</textarea></label><label>更新后角色成长<textarea data-preview="growth" rows="9" maxlength="4000">${escape(result.value)}</textarea></label><button data-action="retry-part" data-kind="growth">重新生成角色成长</button></section>`;
    const candidates = result.value?.candidates || [], operations = result.value?.operations || [];
    return `<section class="scene-diary-result"><h5>记忆维护建议</h5>${operations.length ? operations.map((operation, index) => { const memory = candidates.find(item => item.id === operation.candidateId), old = getState()?.memories.find(item => item.id === operation.targetId); return `<div class="scene-diary-candidate"><label><input data-operation="${index}" type="checkbox" ${operation.accepted ? 'checked' : ''}> ${escape(operation.action)}：${escape(memory?.title || old?.title || '')}</label><p>旧：${escape(old?.content || '无')}</p>${memory && ['add', 'supersede'].includes(operation.action) ? `<label>标题<input data-candidate-title="${index}" maxlength="120" value="${escape(memory.title)}"></label><label>新事实<textarea data-candidate-content="${index}" maxlength="500" rows="2">${escape(memory.content)}</textarea></label>` : `<p>新：${escape(memory?.content || operation.status || '')}</p>`}<small>证据：${escape(memory?.sources?.map(source => source.excerpt).join('；') || '')}；${escape(operation.reason)}</small></div>`; }).join('') : '<p class="scene-diary-muted">本幕没有有效记忆候选。</p>'}<button data-action="retry-part" data-kind="memory">${transaction.memoryCandidates ? '重新对照旧记忆' : '重新生成记忆'}</button></section>`;
}

function render(state = getState()) {
    const bar = document.querySelector(`#${BAR}`), panel = document.querySelector(`#${PANEL}`);
    if (bar) { bar.querySelector('[data-role=status]').textContent = disabledReason || (!state ? '等待接管' : state.status === 'closing' ? '正在整理…' : state.status === 'preview' ? '等待确认预览' : state.status === 'pending_next_act' ? `第${state.currentActId}幕已结束` : `第${state.currentActId}幕进行中`); bar.querySelector('[data-action=end]').disabled = !state || !!disabledReason || state.status !== 'active'; }
    if (!panel) return;
    const status = panel.querySelector('[data-role=status]'); if (status) status.textContent = disabledReason || '';
    const takeover = panel.querySelector('[data-action=takeover]'); if (takeover) takeover.disabled = !!state || !!meta()[STORAGE_KEY];
    const growth = state?.characterGrowth || createState().characterGrowth, growthEditor = panel.querySelector('[data-growth-editor]');
    if (growthEditor && document.activeElement !== growthEditor) growthEditor.value = growth.content;
    const growthNotice = panel.querySelector('[data-growth-notice]'); if (growthNotice) growthNotice.textContent = growth.reviewRecommended ? '部分已纳入幕的源消息发生变化，建议检查并保存角色成长。当前内容仍会继续注入。' : state?.takeoverNotice && !growth.content ? '这是接管的旧聊天。建议手写接管前的角色成长和关系状态；留空不会阻止关幕。' : '';
    const growthMeta = panel.querySelector('[data-growth-meta]'); if (growthMeta) growthMeta.textContent = `最后纳入：${growth.lastIncludedActId ? `第 ${growth.lastIncludedActId} 幕` : '尚无'}；revision ${growth.revision}；约 ${estimateTokens(growth.content)} tokens`;
    const growthCount = panel.querySelector('[data-growth-count]'); if (growthCount) growthCount.textContent = `${growthEditor?.value.length || 0} / ${state?.settings.maxGrowthChars || 4000} 字符`;
    panel.querySelector('#scene_diary_diaries').innerHTML = state?.acts.filter(act => act.diary).slice().reverse().map(act => `<details class="scene-diary-entry"><summary>第${act.id}幕 · ${escape(act.title)}${act.dirty ? ' · 待复核' : ''}</summary><p>故事时间：${escape(act.startSceneTime || '未记录')} → ${escape(act.endSceneTime || '未记录')}</p><textarea data-diary-id="${act.id}" rows="6">${escape(act.diary)}</textarea><button data-action="save-diary">保存日记</button></details>`).join('') || '<p class="scene-diary-muted">尚无日记。</p>';
    renderMemories(state || createState());
    const size = panel.querySelector('[data-maintenance-size]'); if (size) size.textContent = `记忆与维护记录约 ${new Blob([JSON.stringify({ memories: state?.memories, history: state?.maintenanceHistory })]).size} 字节；维护记录 ${state?.maintenanceHistory?.length || 0} 次。`;
    const maintain = panel.querySelector('[data-maintenance-preview]'); if (maintain) maintain.innerHTML = maintenancePreview ? `<h5>维护预览</h5>${maintenancePreview.operations.map((op, index) => `<label class="scene-diary-candidate"><input type="checkbox" data-maintain-op="${index}" ${op.accepted ? 'checked' : ''}>${escape(op.action)}：${escape(op.reason || op.targetId || '')}</label>`).join('')}<button data-action="confirm-maintenance">确认维护</button><button data-action="cancel-maintenance">取消</button>` : '';
    const transaction = state?.pendingTransaction, preview = panel.querySelector('#scene_diary_preview'); preview.hidden = !transaction || !['closing', 'preview'].includes(state.status);
    if (!preview.hidden) { const ready = allPartsReady(transaction); preview.innerHTML = `<h4>关幕预览</h4>${renderPart('diary', transaction.results.diary, transaction)}${renderPart('growth', transaction.results.growth, transaction)}${renderPart('memory', transaction.results.memory, transaction)}<div class="scene-diary-actions"><button data-action="confirm" ${ready && !pendingSave ? '' : 'disabled'}>确认保存并结束</button><button data-action="cancel-close">取消</button></div>`; }
    const errors = state?.drafts?.at(-1), extraction = panel.querySelector('#scene_diary_extraction'); extraction.innerHTML = errors?.kind === 'extraction-errors' ? `<h4>正文提取错误</h4>${errors.errors.map(error => `<p>楼层 ${error.index ?? '?'}：${escape(error.errors.join('；'))} <button data-action="skip" data-id="${escape(error.id)}">跳过此条</button></p>`).join('')}` : '';
    const diaryProfile = panel.querySelector('[data-setting=diaryConnectionProfile]'), memoryProfile = panel.querySelector('[data-setting=memoryConnectionProfile]'); if (diaryProfile) diaryProfile.innerHTML = profileOptions(state?.settings.diaryConnectionProfile); if (memoryProfile) memoryProfile.innerHTML = profileOptions(state?.settings.memoryConnectionProfile);
}

function createUi() {
    if (document.getElementById(BAR)) return;
    const form = document.querySelector('#send_form') || document.querySelector('#send_textarea')?.parentElement; if (!form) return;
    const bar = document.createElement('div'); bar.id = BAR; bar.innerHTML = '<button type="button" data-action="open">🎬 scene&diary</button><span data-role="status">等待接管</span><button type="button" data-action="end">结束这一幕</button>'; form.prepend(bar);
    const panel = document.createElement('section'); panel.id = PANEL; panel.hidden = true;
    panel.innerHTML = `<header class="scene-diary-panel-head"><h3>scene&diary</h3><button data-action="close" aria-label="关闭">×</button></header><p data-role="status" class="scene-diary-warning"></p><nav class="scene-diary-tabs"><button data-tab="act">当前幕</button><button data-tab="growth">角色成长</button><button data-tab="memory">记忆库</button><button data-tab="diary">日记</button><button data-tab="settings">设置</button><button data-tab="debug">诊断</button></nav><section data-page="act"><p>结束当前幕后，会生成日记、记忆候选和角色成长；确认前不会正式写入。</p><div class="scene-diary-actions"><button data-action="end">结束这一幕</button><button data-action="takeover">从当前第一条接管旧聊天</button></div><div id="scene_diary_extraction"></div><div id="scene_diary_preview" hidden></div></section><section data-page="growth" hidden><p data-growth-notice class="scene-diary-warning"></p><label>角色成长<textarea data-growth-editor rows="14" maxlength="4000" placeholder="概括角色的成长路径、情感发展、双方关系与生活状态演变。"></textarea></label><p data-growth-count class="scene-diary-muted"></p><p data-growth-meta class="scene-diary-muted"></p><div class="scene-diary-actions"><button data-action="save-growth">保存角色成长</button></div></section><section data-page="memory" hidden><label>搜索<input data-memory-search placeholder="标题、内容、人物"></label><label>分类<select data-memory-category><option value="">全部分类</option>${MEMORY_CATEGORIES.map(item => `<option>${item}</option>`).join('')}</select></label><button data-action="new-memory">新增记忆</button><div id="scene_diary_memories"></div></section><section data-page="diary" hidden><div id="scene_diary_diaries"></div></section><section data-page="settings" hidden><h4>模型</h4><label>日记／角色成长连接<select data-setting="diaryConnectionProfile"></select></label><label>记忆连接<select data-setting="memoryConnectionProfile"></select></label><h4>召回</h4><label>读取最近有效消息数<input data-setting="recallMessageCount" type="number" min="1" max="20"></label><label>最多召回条目<input data-setting="recallLimit" type="number" min="0" max="30"></label><label>长期记忆预算（tokens）<input data-setting="memoryTokenBudget" type="number" min="100"></label><label>近期日记篇数<input data-setting="recentDiaryCount" type="number" min="0" max="20"></label><label>角色成长目标长度<input data-setting="growthTargetLength"></label><h4>正文标签</h4><p class="scene-diary-muted">每行一组完整标签；同一行的开始与结束标签必须同名。全部留空时提取完整消息。</p><div data-pair-editor>${[['角色正文', 'character.bodyTagPairs'], ['玩家正文', 'user.bodyTagPairs'], ['角色故事时间', 'character.storyTimeTagPairs'], ['玩家故事时间', 'user.storyTimeTagPairs']].map(([label, key]) => `<fieldset class="scene-diary-tag-pair"><legend>${label}</legend><label>开始标签<textarea rows="2" data-pair-open="${key}" placeholder="<now_plot>"></textarea></label><label>结束标签<textarea rows="2" data-pair-close="${key}" placeholder="</now_plot>"></textarea></label></fieldset>`).join('')}</div><h4>提示词</h4><p class="scene-diary-muted">这里只编辑模型角色定义。角色卡描述、性格、场景、输入内容和 JSON 格式由插件自动附加。</p><label>日记提示词<textarea data-setting="promptDiary" rows="5"></textarea></label><label>记忆提示词<textarea data-setting="promptMemory" rows="5"></textarea></label><label>角色成长提示词<textarea data-setting="promptGrowth" rows="8"></textarea></label><button data-action="save-settings">保存当前聊天设置</button><button data-action="reset-prompts">恢复默认提示词</button></section><section data-page="debug" hidden><p data-debug></p><pre data-debug-list></pre></section>`;
    panel.querySelector('[data-page=memory]').insertAdjacentHTML('beforeend', `<h4>记忆维护</h4><div class="scene-diary-actions"><button data-action="check-memory">检查重复、冲突与承诺</button><button data-action="cancel-check">取消检查</button><button data-action="undo-memory">撤销最近维护</button><button data-action="export-memory">导出记忆</button><button data-action="export-migration-backup">下载迁移前聊天备份</button><button data-action="recover-save">恢复未核验保存</button></div><label>导入记忆备份<input type="file" accept="application/json" data-memory-import></label><div data-maintenance-preview></div><p data-maintenance-size class="scene-diary-muted"></p>`);
    panel.querySelector('[data-page=settings]').insertAdjacentHTML('beforeend', `<h4>可选语义召回</h4><p>启用后，记忆文本会发送至独立向量服务；浏览器直连需要服务允许跨域。</p><label><input type="checkbox" data-semantic="enabled">启用向量召回</label><label>完整 embeddings 地址<input data-semantic="endpoint" type="url"></label><label>模型<input data-semantic="model"></label><label>维度（可留空）<input data-semantic="dimensions" type="number" min="1"></label><label><input type="checkbox" data-semantic="rerank">启用模型重排</label><label>向量服务密钥<input data-semantic-key type="password" autocomplete="off"></label><label><input type="checkbox" data-semantic-remember>在此账户的浏览器设置中记住密钥</label><p>本地保存的密钥可被同源脚本读取。</p><button data-action="clear-semantic-key">清除已保存密钥</button><button data-action="rebuild-vectors">重建缺失向量</button>`);
    document.body.append(panel);
    bar.addEventListener('click', event => { const action = event.target.closest('[data-action]')?.dataset.action; if (action === 'open') { panel.hidden = false; render(); fillSettings(); } if (action === 'end') void closeAct(); });
    panel.addEventListener('click', handlePanelClick);
    panel.addEventListener('change', handlePanelChange);
    panel.querySelector('[data-memory-import]').addEventListener('change', event => { if (!disabledReason) void importMemories(event.target.files?.[0]); });
    panel.addEventListener('input', event => { if (event.target.matches('[data-memory-search],[data-memory-category]')) renderMemories(getState()); if (event.target.matches('[data-growth-editor]')) { const count = panel.querySelector('[data-growth-count]'); if (count) count.textContent = `${event.target.value.length} / ${getState()?.settings.maxGrowthChars || 4000} 字符`; } if (event.target.matches('[data-preview]')) savePreviewField(event.target); });
}

function savePreviewField(field) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction || disabledReason) return; if (field.dataset.preview === 'title' && transaction.results.diary.status === 'success') transaction.results.diary.value.title = field.value; if (field.dataset.preview === 'diary' && transaction.results.diary.status === 'success') transaction.results.diary.value.diary = field.value; if (field.dataset.preview === 'growth' && transaction.results.growth.status === 'success') { transaction.results.growth.generatedValue ??= transaction.results.growth.value; transaction.results.growth.value = field.value; } setState(state); }

function handlePanelClick(event) {
    const target = event.target.closest('[data-action]'), action = target?.dataset.action, panel = document.querySelector(`#${PANEL}`);
    if (disabledReason && action && !['close', 'export-memory', 'export-migration-backup', 'recover-save', 'clear-semantic-key', 'cancel-check'].includes(action)) { notify('warning', disabledReason); return; }
    if (action === 'close') panel.hidden = true;
    if (action === 'end') void closeAct();
    if (action === 'takeover') takeOver(0);
    if (action === 'retry-part') retryClosePart(target.dataset.kind);
    if (action === 'confirm') { const state = getState(), transaction = state?.pendingTransaction; if (transaction && allPartsReady(transaction)) { const diary = transaction.results.diary.value; diary.title = panel.querySelector('[data-preview=title]').value.trim(); diary.diary = panel.querySelector('[data-preview=diary]').value.trim(); const growth = panel.querySelector('[data-preview=growth]').value.trim(); transaction.results.growth.generatedValue ??= transaction.results.growth.value; transaction.results.memory.value.operations.forEach((operation, index) => { operation.accepted = !!panel.querySelector(`[data-operation="${index}"]`)?.checked; const candidate = transaction.results.memory.value.candidates.find(item => item.id === operation.candidateId); const title = panel.querySelector(`[data-candidate-title='${index}']`), content = panel.querySelector(`[data-candidate-content='${index}']`); if (candidate && title && content) { candidate.title = title.value.trim(); candidate.content = content.value.trim(); } }); setState(state); } void confirmClose(); }
    if (action === 'cancel-close') cancelClose();
    if (action === 'skip') skipExtraction(target.dataset.id);
    if (action === 'save-growth') saveGrowth(panel);
    if (action === 'new-memory') { const state = getState(); if (state) { state.memories.unshift(normalizeMemory({ title: '新记忆', content: '', edited: true, locked: true })); state.memoryRevision++; setState(state); void saveState(state); render(state); } }
    if (action === 'save-memory') { try { saveMemory(target); } catch (error) { notify('error', `记忆未保存：${error.message}`); } }
    if (action === 'delete-memory') { const state = getState(), memory = state?.memories.find(item => item.id === target.closest('[data-memory-id]')?.dataset.memoryId); if (memory) { memory.deletedAt = Date.now(); memory.revision++; state.memoryRevision++; setState(state); void saveState(state); render(state); } }
    if (action === 'save-diary') { const entry = target.closest('.scene-diary-entry'), state = getState(), id = +entry?.querySelector('[data-diary-id]')?.dataset.diaryId, act = findAct(state, id); if (act) { act.diary = entry.querySelector('textarea').value.trim(); acknowledgeActReview(act, messagesFor(act.id)); setState(state); void saveState(state); render(state); } }
    if (action === 'save-settings') saveChatSettings(panel);
    if (action === 'check-memory') void checkMemories();
    if (action === 'cancel-check') { maintenanceScan++; notify('info', '已取消记忆检查；正在返回的模型结果会被忽略。'); }
    if (action === 'confirm-maintenance') void confirmMaintenance(panel);
    if (action === 'cancel-maintenance') { maintenancePreview = null; render(); }
    if (action === 'undo-memory') void undoMaintenance();
    if (action === 'export-memory') exportMemories();
    if (action === 'export-migration-backup') void exportMigrationBackup();
    if (action === 'recover-save') void recoverSave();
    if (action === 'clear-semantic-key') { semanticKey = ''; ctx().accountStorage?.removeItem('scene_diary_embedding_key'); panel.querySelector('[data-semantic-key]').value = ''; notify('success', '已清除向量密钥。'); }
    if (action === 'rebuild-vectors') void syncVectors(getState()).then(() => notify('success', '向量已更新。')).catch(error => notify('error', error.message));
    if (action === 'reset-prompts') { panel.querySelector('[data-setting=promptDiary]').value = DEFAULT_DIARY_PROMPT; panel.querySelector('[data-setting=promptMemory]').value = DEFAULT_MEMORY_PROMPT; panel.querySelector('[data-setting=promptGrowth]').value = DEFAULT_GROWTH_PROMPT; }
    const tab = event.target.closest('[data-tab]')?.dataset.tab; if (tab) { panel.querySelectorAll('[data-page]').forEach(page => page.hidden = page.dataset.page !== tab); if (tab === 'debug') renderDebug(panel); }
}

function saveGrowth(panel) { const state = getState(); if (!state) return; const content = panel.querySelector('[data-growth-editor]').value.trim(); if (content.length > state.settings.maxGrowthChars) { notify('error', `角色成长不能超过 ${state.settings.maxGrowthChars} 字符。`); return; } const time = localTime(); state.characterGrowth = { ...state.characterGrowth, content, createdAt: state.characterGrowth.createdAt || (content ? time.timestamp : null), updatedAt: time.timestamp, timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, edited: true, reviewRecommended: false }; state.takeoverNotice = false; setState(state); void saveState(state); render(state); notify('success', '角色成长已保存并会在后续生成中注入。'); }
function saveMemory(target) { const entry = target.closest('[data-memory-id]'), state = getState(), memory = state?.memories.find(item => item.id === entry?.dataset.memoryId); if (!memory) return; const title = entry.querySelector('[data-memory-field=title]').value.trim(), content = entry.querySelector('[data-memory-field=content]').value.trim(); if (!title || title.length > 120 || !content || content.length > 500) throw new Error('标题或事实为空、超长'); const sources = memory.sources.map((source, index) => { if (source.unverifiedLegacy) return source; const message = chat().find(item => item.extra?.scene_diary?.messageId === source.messageId), excerpt = entry.querySelector(`[data-source-index='${index}']`)?.value.trim(); if (!message || !excerpt) throw new Error(`来源消息 ${source.messageId} 已删除或摘录为空`); const body = extractMessage(message.mes, message.is_user ? state.settings.extraction.user : state.settings.extraction.character).body; if (!body.includes(excerpt)) throw new Error(`摘录不在来源消息 ${source.messageId} 中`); return { ...source, excerpt, fingerprint: fingerprint(body) }; }); memory.title = title; memory.content = content; memory.sources = sources; memory.category = entry.querySelector('[data-memory-field=category]').value; memory.importance = +entry.querySelector('[data-memory-field=importance]').value || 3; memory.locked = entry.querySelector('[data-memory-field=locked]').checked; acknowledgeMemoryReview(memory); state.memoryRevision++; setState(state); void saveState(state).catch(showSaveError); render(state); }
async function checkMemories() {
    const state = getState(), scan = ++maintenanceScan; if (!state || maintenancePreview) return;
    const active = state.memories.filter(memoryEligible), candidates = [], proposals = [];
    for (let offset = 0; offset < active.length; offset += 30) {
        if (scan !== maintenanceScan || activeChatKey !== String(ctx().chatId)) return;
        const batch = active.slice(offset, offset + 30);
        for (const memory of batch) {
            const duplicate = active.find(other => other.id !== memory.id && other.id < memory.id && other.title === memory.title && other.content === memory.content && !other.locked);
            if (duplicate) { candidates.push(memory); proposals.push({ action: 'merge', candidateId: memory.id, targetId: duplicate.id, reason: `与 ${duplicate.title} 内容完全重复` }); }
        }
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    try {
        if (active.length) for (let offset = 0; offset < active.length; offset += 30) {
            if (scan !== maintenanceScan || activeChatKey !== String(ctx().chatId)) return;
            const batch = active.slice(offset, offset + 30), instruction = '检查客观事实之间的冲突、时间变化及有来源证据的承诺完成/取消。只返回严格 JSON {"operations":[{"action":"merge|supersede|set_status|archive","candidateId":"提供的记忆ID","targetId":"提供的另一记忆ID","status":"仅 set_status 使用 completed|cancelled|historical|active","reason":"说明来源依据"}]}。没有充分证据返回空数组。不得修改锁定条目，不得归档常驻或未完成承诺。';
            const answer = modelJson(await request(state.settings.memoryConnectionProfile || state.settings.diaryConnectionProfile, modelMessages(`${instruction}\n${JSON.stringify(batch.map(memory => ({ id: memory.id, category: memory.category, title: memory.title, content: memory.content, status: memory.status, locked: memory.locked, permanent: memory.permanent, sources: memory.sources })))}`)), '记忆检查');
            if (scan !== maintenanceScan || activeChatKey !== String(ctx().chatId)) return;
            if (!Array.isArray(answer?.operations)) throw new Error('记忆检查未返回 operations 数组');
            for (const operation of answer.operations) { const candidate = batch.find(memory => memory.id === operation.candidateId), target = batch.find(memory => memory.id === operation.targetId); if (!candidate || !target || !candidate.sources?.length || proposals.some(item => item.candidateId === candidate.id)) throw new Error('记忆检查引用了无效或重复条目'); candidates.push(candidate); proposals.push(operation); }
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        if (!proposals.length) { notify('info', '未发现有充分证据的维护建议。'); return; }
        maintenancePreview = { candidates, operations: planMemoryChanges(candidates, state.memories, proposals), revision: state.memoryRevision };
        render(state);
    } catch (error) { notify('error', `记忆检查失败，未修改记忆库：${error.message}`); }
}
async function confirmMaintenance(panel) {
    const state = getState(), preview = maintenancePreview; if (!state || !preview || state.memoryRevision !== preview.revision) { notify('error', '记忆库已变化，请重新检查。'); return; }
    preview.operations.forEach((op, index) => op.accepted = !!panel.querySelector(`[data-maintain-op="${index}"]`)?.checked);
    try { applyMemoryChanges(state, preview.candidates, preview.operations); setState(state); await preserveRecovery(state); await saveState(state, activeChatKey, true); await clearRecovery(state); maintenancePreview = null; render(state); notify('success', '维护已保存。'); }
    catch (error) { showSaveError(error); }
}
async function undoMaintenance() { const state = getState(); if (!state) return; try { undoLastMaintenance(state); setState(state); await preserveRecovery(state); await saveState(state, activeChatKey, true); await clearRecovery(state); render(state); notify('success', '已撤销最近一次维护。'); } catch (error) { notify('error', error.message); } }
function exportMemories() { const state = getState(); if (!state) return; const payload = { schema: SCHEMA_VERSION, memories: state.memories, maintenanceHistory: state.maintenanceHistory }; const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = `scene-diary-memory-${activeChatKey}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
async function exportMigrationBackup() { const account = semanticIdentity({ memorySpaceId: 'legacy' }).account, backup = await SillyTavern.libs.localforage.getItem(`scene_diary_migration_backup_${account}_${activeChatKey}`); if (!backup) { notify('info', '当前聊天没有迁移前备份。'); return; } const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = `scene-diary-pre-v030-${activeChatKey}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
async function importMemories(file) { if (!file) return; try { const payload = JSON.parse(await file.text()); if (+payload.schema !== SCHEMA_VERSION || !Array.isArray(payload.memories) || payload.memories.length > 20000) throw new Error('备份版本或结构无效'); const state = getState(); if (!state) return; const ids = new Set(); for (const memory of payload.memories) { if (!memory?.id || ids.has(memory.id) || !memory.title || !memory.content) throw new Error('备份中存在无效或重复记忆'); ids.add(memory.id); } const summary = `将用备份中的 ${payload.memories.length} 条记忆替换当前 ${state.memories.length} 条；当前记忆会保存到维护历史。`; if (!confirm(summary)) return; const before = structuredClone(state.memories); state.memories = payload.memories.map(normalizeMemory); state.memoryRevision++; state.maintenanceHistory.push({ transactionId: newId('import'), before, after: structuredClone(state.memories), revision: state.memoryRevision, at: Date.now() }); setState(state); await preserveRecovery(state); await saveState(state, activeChatKey, true); await clearRecovery(state); render(state); notify('success', '记忆备份已导入。'); } catch (error) { notify('error', `导入失败：${error.message}`); } }
async function recoverSave() { if (migrationSaving.has(activeChatKey)) return; const current = getState(); if (!current) return; const raw = await SillyTavern.libs.localforage.getItem(recoveryKey(current)); if (!raw) { notify('info', '没有未核验的本地恢复副本。'); return; } try { const saved = normalizeState(raw); if (saved.currentActId !== current.currentActId) throw new Error('当前幕与恢复副本不一致'); setState(saved); await saveState(saved, activeChatKey, true); await clearRecovery(saved); saveUnverified = false; disabledReason = ''; render(saved); notify('success', '已核验恢复副本。'); } catch (error) { notify('error', `恢复失败：${error.message}`); } }
function handlePanelChange(event) { if (!event.target.matches('[data-memory-field=permanent]') || disabledReason) return; const state = getState(), entry = event.target.closest('[data-memory-id]'), memory = state?.memories.find(item => item.id === entry?.dataset.memoryId); if (!state || !memory) return; if (event.target.checked && !canSetMemoryPermanent(state.memories, state.settings.recallLimit, memory.id)) { event.target.checked = false; notify('error', `常驻记忆不能超过“最多召回条目”（当前为 ${state.settings.recallLimit}）。请先在设置中调大该值。`); return; } memory.permanent = event.target.checked; memory.updatedAt = Date.now(); memory.revision = (+memory.revision || 0) + 1; state.memoryRevision++; setState(state); void saveState(state); render(state); }
function readPairEditor(panel, key) { const lines = selector => (panel.querySelector(selector)?.value || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean), opens = lines(`[data-pair-open="${key}"]`), closes = lines(`[data-pair-close="${key}"]`); if (opens.length !== closes.length) throw new Error(`${key} 的开始标签与结束标签数量必须一致。`); return opens.map((open, index) => { const pair = validateTagPair({ open, close: closes[index] }); if (!pair) throw new Error(`${key} 第 ${index + 1} 组标签无效或名称不一致。`); return pair; }); }
function saveChatSettings(panel) { const state = getState(); if (!state) return; try { const requestedLimit = +panel.querySelector('[data-setting=recallLimit]').value, permanentCount = permanentMemoryCount(state.memories); if (requestedLimit < permanentCount) throw new Error(`当前已有 ${permanentCount} 条常驻记忆。“最多召回条目”不能低于常驻数量。`); const settings = state.settings; settings.diaryConnectionProfile = panel.querySelector('[data-setting=diaryConnectionProfile]').value; settings.memoryConnectionProfile = panel.querySelector('[data-setting=memoryConnectionProfile]').value; for (const key of ['recallMessageCount', 'recallLimit', 'memoryTokenBudget', 'recentDiaryCount']) settings[key] = +panel.querySelector(`[data-setting="${key}"]`).value; settings.growthTargetLength = panel.querySelector('[data-setting=growthTargetLength]').value.trim() || DEFAULT_SETTINGS.growthTargetLength; settings.extraction ||= {}; for (const key of ['character.bodyTagPairs', 'user.bodyTagPairs', 'character.storyTimeTagPairs', 'user.storyTimeTagPairs']) { const [who, field] = key.split('.'); settings.extraction[who] ||= {}; settings.extraction[who][field] = readPairEditor(panel, key); } settings.prompts = { diary: panel.querySelector('[data-setting=promptDiary]').value.trim() || DEFAULT_DIARY_PROMPT, memory: panel.querySelector('[data-setting=promptMemory]').value.trim() || DEFAULT_MEMORY_PROMPT, growth: panel.querySelector('[data-setting=promptGrowth]').value.trim() || DEFAULT_GROWTH_PROMPT }; settings.semantic = { enabled: panel.querySelector('[data-semantic=enabled]').checked, endpoint: panel.querySelector('[data-semantic=endpoint]').value.trim(), model: panel.querySelector('[data-semantic=model]').value.trim(), dimensions: panel.querySelector('[data-semantic=dimensions]').value || null, rerank: panel.querySelector('[data-semantic=rerank]').checked }; if (settings.semantic.enabled) { if (!settings.semantic.model) throw new Error('请填写向量模型。'); validateSemanticEndpoint(settings.semantic.endpoint); } semanticKey = panel.querySelector('[data-semantic-key]').value; if (panel.querySelector('[data-semantic-remember]').checked && ctx().accountStorage) ctx().accountStorage.setItem('scene_diary_embedding_key', semanticKey); else ctx().accountStorage?.removeItem('scene_diary_embedding_key'); state.settings = normalizeSettings(settings); setState(state); void saveState(state).then(() => notify('success', '当前聊天设置已保存。')).catch(error => notify('error', error.message)); render(state); } catch (error) { notify('error', error.message || String(error)); } }
function renderDebug(panel) { const state = getState(), output = panel.querySelector('[data-debug-list]'); panel.querySelector('[data-debug]').textContent = disabledReason || `当前幕 ${state?.currentActId || '-'}；记忆 ${state?.memories.length || 0} 条；召回本轮 ${lastRecall?.selected.length || 0} 条。`; const growth = state?.characterGrowth; output.textContent = JSON.stringify({ continuity: lastContinuity, characterGrowth: growth ? { included: !!growth.content, revision: growth.revision, lastIncludedActId: growth.lastIncludedActId, reviewRecommended: growth.reviewRecommended, characters: growth.content.length, estimatedTokens: estimateTokens(growth.content) } : null, recall: lastRecall ? { query: lastRecall.query, budgetUsed: lastRecall.budgetUsed, candidates: lastRecall.candidates.slice(0, 12).map(item => ({ title: item.memory.title, score: +item.score.toFixed(2), hits: item.hits, selected: lastRecall.selected.includes(item) })) } : null }, null, 2); }
function fillSettings() { const panel = document.querySelector(`#${PANEL}`), state = getState(); if (!panel || !state) return; for (const key of ['recallMessageCount', 'recallLimit', 'memoryTokenBudget', 'recentDiaryCount', 'growthTargetLength']) panel.querySelector(`[data-setting="${key}"]`).value = state.settings[key]; for (const key of ['character.bodyTagPairs', 'user.bodyTagPairs', 'character.storyTimeTagPairs', 'user.storyTimeTagPairs']) { const [who, field] = key.split('.'), pairs = state.settings.extraction[who][field] || [], open = panel.querySelector(`[data-pair-open="${key}"]`), close = panel.querySelector(`[data-pair-close="${key}"]`); if (open) open.value = pairs.map(item => item.open).join('\n'); if (close) close.value = pairs.map(item => item.close).join('\n'); } panel.querySelector('[data-setting=promptDiary]').value = state.settings.prompts.diary || DEFAULT_DIARY_PROMPT; panel.querySelector('[data-setting=promptMemory]').value = state.settings.prompts.memory || DEFAULT_MEMORY_PROMPT; panel.querySelector('[data-setting=promptGrowth]').value = state.settings.prompts.growth || DEFAULT_GROWTH_PROMPT; for (const field of ['enabled', 'endpoint', 'model', 'dimensions', 'rerank']) { const input = panel.querySelector(`[data-semantic="${field}"]`); if (input.type === 'checkbox') input.checked = !!state.settings.semantic[field]; else input.value = state.settings.semantic[field] ?? ''; } const stored = ctx().accountStorage?.getItem('scene_diary_embedding_key'); panel.querySelector('[data-semantic-key]').value = semanticKey || stored || ''; panel.querySelector('[data-semantic-remember]').checked = !!stored; }
function bind() { const eventSource = source(), eventTypes = types(); if (!eventSource?.on) return; eventSource.on(eventTypes.MESSAGE_SENT || 'message_sent', sent); eventSource.on(eventTypes.MESSAGE_RECEIVED || 'message_received', received); eventSource.on(eventTypes.MESSAGE_EDITED || 'message_edited', changed); eventSource.on(eventTypes.MESSAGE_UPDATED || 'message_updated', changed); eventSource.on(eventTypes.MESSAGE_DELETED || 'message_deleted', deleted); eventSource.on(eventTypes.MESSAGE_SWIPED || 'message_swiped', changed); eventSource.on(eventTypes.CHAT_CHANGED || 'chat_id_changed', initializeChat); eventSource.on(eventTypes.CHAT_LOADED || 'chatLoaded', initializeChat); eventSource.on(eventTypes.CHAT_COMPLETION_PROMPT_READY || 'chat_completion_prompt_ready', promptReady); }
function init() { if (initialized) return; initialized = true; createUi(); if (!document.getElementById(BAR)) setTimeout(() => { createUi(); initializeChat(); fillSettings(); }, 800); bind(); initializeChat(); fillSettings(); globalThis.sceneDiary = { version: '0.3.0-rc.1', getState, closeAct, confirmClose, takeOver }; console.info(`[${NAME}] loaded`); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
