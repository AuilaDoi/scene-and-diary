import { extension_prompt_roles, extension_prompt_types, setExtensionPrompt } from '../../../../script.js';
import { getContext } from '../../../st-context.js';
import { appendExtractedMemories, applyMaintenance, pendingOrganizationIds, validateMaintenanceScope, validateMaintenanceBatch, planMaintenance, memoryEligible, memoryText, rankRecallCandidates, finalizeRecallCandidates, retrieveMemories, validateCandidateBatch, validateMemoryFormat } from './memory-system.js';
import { createMemoryRetriever, validateMaintenanceTaskScopes } from './memory-system.js';
import { maintenanceMessages, maintenanceConnectionIdentity, candidatePairs, candidateTasks, splitCandidateTask, waitForMaintenance, maintenanceInputSize, MAINTENANCE_INPUT_LIMIT } from './maintenance-flow.js';
import { OUTPUT_SCHEMAS, requestStructured, requestLegacyStructured, requireArrayField } from './model-protocol.js';
import { createTauriJsonSession, loadTauriJsonDependencies } from './json-host-adapter.js';
import { embed, indexVectors, loadVectors, rerank, validateSemanticEndpoint, semanticErrorDetail } from './semantic.js';
import { createRecallTrace, logRecall, finishRecallTrace, renderRecallDiagnostics, durationText } from './recall-diagnostics.js';
import { createContentBackup, restoreContentBackup } from './backup.js';
import {
    SCHEMA_VERSION, STORAGE_KEY, DEFAULT_SETTINGS, DEFAULT_DIARY_PROMPT, DEFAULT_MEMORY_PROMPT, DEFAULT_GROWTH_PROMPT, DEFAULT_MAINTENANCE_PROMPT,
    MEMORY_CATEGORIES, acknowledgeActReview, acknowledgeMemoryReview, assignMessageToAct, beginNextAct,
    buildCharacterContext, buildContinuityBlock, buildDialogue, buildDiaryPrompt, buildGrowthPrompt, buildMemoryPrompt,
    buildRecallQuery, createState, currentAct, estimateTokens, filterPromptMessages, findAct,
    insertContinuityBeforeHistory, isNormalRpMessage, localTime, markActDirty, newId, normalizeMemory, normalizeMemoryLinks, normalizeSettings,
    normalizeState, parseDiaryResponse, parseGrowthResponse,
    sourceChanged, sourceFingerprint, validateTagPair, fingerprint, extractMessage,
} from './core.js';

const NAME = 'scene&diary';
const PANEL = 'scene_diary_panel';
const BAR = 'scene_diary_toolbar';
const DIARY_KEY = 'scene_diary_diaries';
const MEMORY_KEY = 'scene_diary_memories';
let activeChatKey = '', disabledReason = '', initialized = false, closingPromise = null, lastRecall = null, lastContinuity = null, awaitingMainPrompt = false, migrationPending = false;
let recallContent = '', recallCache = new Map(), semanticKey = '', rerankKey = '', sessionAccount = '', pendingSave = false, saveUnverified = false;
let recallGeneration = 0, draftMemory = null, memoryRenderKey = '';
let recallWork = null, lastRecallTrace = null, vectorCacheRevision = 0;
const migrationReady = new Map(), migrationPreparing = new Set(), migrationSaving = new Set(), migrationRecoveries = new Map();
const activeJsonRequests = new Map(), jsonProgress = new Map(), jsonWarnings = new Map();

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
let saveQueue = Promise.resolve();
function saveState(state = getState(), key = activeChatKey, verified = false) {
    const task = async () => {
        if (!state || key !== activeChatKey || String(ctx().chatId) !== String(key)) { if (verified) throw new Error('聊天已切换，保存已取消'); return false; }
        const snapshot = structuredClone(meta()[STORAGE_KEY]);
        await (ctx().saveMetadata || ctx().saveChat)?.();
        if (verified) await verifyPersistedCommit(snapshot, key);
        migrationPending = false; return true;
    };
    const result = saveQueue.then(task); saveQueue = result.catch(() => {}); return result;
}
const recoveryKey = (state, key = activeChatKey) => `scene_diary_recovery_${semanticIdentity(state).account}_${key}_${state.memorySpaceId}`;
async function preserveRecovery(state, key = activeChatKey) { try { await SillyTavern.libs.localforage.setItem(recoveryKey(state, key), structuredClone(state)); } catch (error) { throw new Error(`无法保存本地恢复副本：${error.message}`); } }
async function clearRecovery(state, key = activeChatKey) { await SillyTavern.libs.localforage.removeItem(recoveryKey(state, key)); }
function showSaveError(error) { notify('error', `保存未核验：${error.message || error}。本地恢复副本已保留，请在当前聊天重试。`); }
function semanticIdentity(state) { const storage = ctx().accountStorage; let account = storage?.getItem('scene_diary_account_id'); if (!account) { account = storage ? newId('account') : sessionAccount || newId('session'); storage?.setItem('scene_diary_account_id', account); } if (sessionAccount && sessionAccount !== account) { semanticKey = ''; rerankKey = ''; recallCache.clear(); } sessionAccount = account; return { account, chat: activeChatKey, space: state.memorySpaceId }; }
function clearPrompts() { for (const key of [DIARY_KEY, MEMORY_KEY]) setExtensionPrompt(key, '', extension_prompt_types.NONE, 0, false, extension_prompt_roles.SYSTEM); }
function compatible() { if (hasSp()) { disabledReason = '检测到 SP·数据库：scene&diary 不支持同时启用。请停用 SP 后刷新。'; clearPrompts(); return false; } return true; }
function messagesFor(actId) { return chat().filter(message => +message.extra?.scene_diary?.actId === +actId && isNormalRpMessage(message)); }

function initializeChat() {
    abortInvalidJsonRequests();
    if (!ctx().chatId || ctx().groupId) { cancelRecallWork('当前聊天不支持召回'); lastRecallTrace = null; disabledReason = 'scene&diary v0.3 只支持单角色聊天。'; clearPrompts(); render(); return null; }
    if (!compatible()) { render(); return null; }
    const key = String(ctx().chatId);
    if (key !== activeChatKey) jsonWarnings.clear();
    if (key !== activeChatKey) { for (const work of maintenanceWork.values()) work.controller.abort(new DOMException('聊天已切换', 'AbortError')); cancelRecallWork('聊天已切换'); lastRecallTrace = null; jsonProgress.clear(); draftMemory = null; memoryRenderKey = ''; activeChatKey = key; closingPromise = null; lastRecall = null; lastContinuity = null; recallContent = ''; recallCache.clear(); recallGeneration++; migrationPending = false; saveUnverified = false; clearPrompts(); }
    const original = meta()[STORAGE_KEY];
    if (original && schemaVersion(original) < SCHEMA_VERSION && migrationReady.get(key) !== original) {
        if (!migrationPreparing.has(key)) {
            migrationPreparing.add(key);
            void (async () => {
                try {
                    const account = semanticIdentity({ memorySpaceId: 'legacy' }).account;
                    const backupKey = `scene_diary_migration_backup_${account}_${key}_schema${schemaVersion(original)}_to${SCHEMA_VERSION}`;
                    const snapshot = { savedAt: Date.now(), codeVersion: '0.3.6', schema: original.version, metadata: structuredClone(meta()), messages: structuredClone(chat()) };
                    const pendingRecovery = original.memorySpaceId ? await SillyTavern.libs.localforage.getItem(`scene_diary_recovery_${account}_${key}_${original.memorySpaceId}`) : null;
                    if (pendingRecovery) snapshot.pendingRecovery = structuredClone(pendingRecovery);
                    if (!await SillyTavern.libs.localforage.getItem(backupKey)) await SillyTavern.libs.localforage.setItem(backupKey, snapshot);
                    if (key === activeChatKey && String(ctx().chatId) === key && meta()[STORAGE_KEY] === original) {
                        migrationRecoveries.set(key, pendingRecovery || null); migrationReady.set(key, original); initializeChat();
                    }
                } catch (error) { if (key === activeChatKey) { disabledReason = `迁移备份失败，未修改聊天：${error.message}`; render(); } }
                finally { migrationPreparing.delete(key); }
            })();
        }
        return null;
    }
    let state = getState();
    if (!state && meta()[STORAGE_KEY] && schemaVersion(meta()[STORAGE_KEY]) > SCHEMA_VERSION) { render(); return null; }
    if (state) {
        if (migrationSaving.has(key)) { disabledReason = '旧版聊天迁移正在核验保存，完成前保持只读。'; render(state); return state; }
        // Never overwrite a v0.3.1 unverified save with the older persisted library.
        // Its original snapshot is backed up separately and remains user-restorable.
        if (migrationPending && migrationRecoveries.get(key)) { saveUnverified = true; disabledReason = '发现旧版未核验的保存副本，请在记忆库“恢复未完成的保存”后继续迁移。'; render(state); return state; }
        const checkingKey = key; void SillyTavern.libs.localforage.getItem(recoveryKey(state)).then(copy => { if (copy && checkingKey === activeChatKey) { saveUnverified = true; disabledReason = '发现未核验的本地保存副本，请在记忆库恢复保存后继续聊天。'; render(getState()); } }).catch(error => notify('warning', `恢复副本检查失败：${error.message}`));
        disabledReason = migrationSaving.has(key) ? '旧版聊天迁移正在核验保存，完成前保持只读。' : saveUnverified ? '上次保存尚未核验，请在记忆库恢复保存后继续聊天。' : '';
        let repaired = migrationPending;
        const maintenance = state.maintenanceTransaction;
        if (maintenance?.status === 'running' && !maintenanceRuns.has(maintenance.id)) { maintenance.status = 'error'; for (const task of maintenance.tasks) if (task.status === 'running') { task.status = 'error'; task.error = '请求中断，可重试此批。'; } repaired = true; }
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
function reviewSourceAct(state, actId) { const act = findAct(state, actId); if (!act || act.status !== 'closed' || !sourceChanged(act, messagesFor(act.id))) return false; act.dirty = true; if (state.characterGrowth?.lastIncludedActId >= act.id) state.characterGrowth.reviewRecommended = true; return true; }
function changed(index) { const state = getState(), message = chat()[+index], actId = message?.extra?.scene_diary?.actId; if (state && !disabledReason && actId && reviewSourceAct(state, actId)) { setState(state); void saveState(state); render(state); } }
function deleted() { const state = getState(); if (!state || disabledReason) return; let didChange = false; for (const act of state.acts) didChange = reviewSourceAct(state, act.id) || didChange; if (didChange) { setState(state); void saveState(state); render(state); } }

function profileOptions(value) { try { return ['<option value="">沿用当前聊天连接</option>', ...(ctx().ConnectionManagerRequestService?.getSupportedProfiles?.() || []).map(profile => `<option value="${escape(profile.id)}" ${profile.id === value ? 'selected' : ''}>独立：${escape(profile.name)}</option>`)].join(''); } catch { return '<option value="">沿用当前聊天连接</option>'; } }
async function request(profile, prompt, responseLength = 1600, jsonSchema = null) { if (profile) { const service = ctx().ConnectionManagerRequestService; if (!service?.sendRequest) throw new Error('连接管理器不可用。'); const output = await service.sendRequest(profile, prompt, responseLength, { stream: false, extractData: true, includePreset: false, includeInstruct: false }, jsonSchema ? { json_schema: jsonSchema } : {}); return output?.content ?? output; } if (String(ctx().mainApi || '').toLowerCase() !== 'openai') throw new Error('辅助整理需要 Chat Completion，或选择独立连接。'); const output = await ctx().generateRawData({ prompt, api: 'openai', quietToLoud: true, responseLength, jsonSchema }); return output?.content ?? output; }
function staleJsonRequest() { return Object.assign(new Error('聊天、任务输入或连接已改变，本次请求已停止，请重新整理。'), { code: 'SCENE_DIARY_STALE' }); }
function abortInvalidJsonRequests(prefix = '') {
    for (const [owner, entry] of activeJsonRequests) {
        try { if (prefix && owner.startsWith(prefix)) throw new DOMException('请求已取消', 'AbortError'); entry.check(); }
        catch (error) { entry.controller.abort(error); }
    }
    if (prefix) for (const owner of jsonWarnings.keys()) if (owner.startsWith(prefix)) jsonWarnings.delete(owner);
}
function jsonWarningHtml(prefix) { return [...new Set([...jsonWarnings].filter(([owner]) => owner.startsWith(prefix)).map(([, message]) => message))].map(message => `<p class="scene-diary-warning">${escape(message)}</p>`).join(''); }
async function requestJson(profile, prompt, schema, parse, maxTokens, label, { assertCurrent = () => {}, owner = '' } = {}) {
    if (globalThis.__TAURI_RUNNING__ !== true) {
        return requestLegacyStructured((messages, tokens, outputSchema) => request(profile, messages, tokens, outputSchema), prompt, schema, parse, maxTokens, label);
    }
    assertCurrent();
    const controller = new AbortController(), entry = { controller, check: assertCurrent };
    activeJsonRequests.set(owner, entry); jsonProgress.delete(owner); jsonWarnings.delete(owner);
    const monitor = setInterval(() => { if (controller.signal.aborted) { clearInterval(monitor); return; } try { entry.check(); } catch (error) { controller.abort(error); clearInterval(monitor); } }, 250);
    const report = message => { assertCurrent(); if (message.includes('覆盖附加参数')) jsonWarnings.set(owner, message); else jsonProgress.set(owner, message); render(getState()); };
    try {
        const dependencies = await loadTauriJsonDependencies();
        const session = await createTauriJsonSession({ ...dependencies, getContext: ctx, profileId: profile, signal: controller.signal, assertCurrent, onProgress: report });
        entry.check = session.assertCurrent;
        return await requestStructured(session.send, prompt, schema, parse, maxTokens, label, { assertCurrent: session.assertCurrent, onProgress: report, connectionLabel: session.connectionLabel });
    } finally {
        clearInterval(monitor);
        if (activeJsonRequests.get(owner) === entry) activeJsonRequests.delete(owner);
    }
}
function closeJsonOptions(transaction, kind) {
    return { owner: `close:${transaction.id}:${kind}`, assertCurrent() {
        const state = meta()[STORAGE_KEY], current = state?.pendingTransaction;
        if (String(ctx().chatId) !== transaction.chatKey || activeChatKey !== transaction.chatKey || ctx().groupId || disabledReason
            || current?.id !== transaction.id
            || sourceFingerprint(messagesFor(transaction.actId)) !== transaction.sourceFingerprint
            || state.characterGrowth.revision !== transaction.growthRevision) throw staleJsonRequest();
    } };
}
function characterData() { const fields = ctx().getCharacterCardFields?.() || {}; return { char: ctx().name2 || fields.name || '角色', user: ctx().name1 || '玩家', context: buildCharacterContext({ description: fields.description, personality: fields.personality, scenario: fields.scenario }) }; }
const modelMessages = content => [{ role: 'system', content: '你只输出机器可解析 JSON。' }, { role: 'user', content }];
function modelJson(value, label) { try { return typeof value === 'object' ? value : JSON.parse(String(value).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')); } catch { throw new Error(`${label}返回的 JSON 无法解析`); } }

async function generateClosePart(transaction, kind, settings, dialogue) {
    const options = closeJsonOptions(transaction, kind);
    options.assertCurrent();
    if (dialogue.errors.length) throw new Error(`正文标签无法匹配：${dialogue.errors.map(row => `楼层 ${row.index}：${row.errors.join('、')}`).join('；')}。请修正规则后重试本项。`);
    const common = { characterName: transaction.character.char, userName: transaction.character.user, characterContext: transaction.character.context, dialogue: dialogue.text };
    if (kind === 'diary') { const prompt = modelMessages(buildDiaryPrompt({ ...common, targetLength: settings.diaryTargetLength, prompt: settings.prompts.diary })); return requestJson(settings.diaryConnectionProfile, prompt, OUTPUT_SCHEMAS.diary, parseDiaryResponse, 4096, '日记', options); }
    if (kind === 'memory') {
        const prompt = modelMessages(buildMemoryPrompt({ ...common, prompt: settings.prompts.memory }));
        const parsed = await requestJson(settings.memoryConnectionProfile || settings.diaryConnectionProfile, prompt, OUTPUT_SCHEMAS.memory, value => requireArrayField(modelJson(value, '记忆提取'), 'memories', '记忆提取'), 8192, '记忆提取', options);
        return validateCandidateBatch(parsed.memories);
    }
    const prompt = modelMessages(buildGrowthPrompt({ ...common, currentGrowth: transaction.baseGrowth, prompt: settings.prompts.growth }));
    return requestJson(settings.diaryConnectionProfile, prompt, OUTPUT_SCHEMAS.growth, value => parseGrowthResponse(value, settings.maxGrowthChars), 6144, '角色成长', options);
}

async function runCloseParts(transactionId, kinds) {
    const key = activeChatKey, before = getState(), transaction = before?.pendingTransaction;
    if (!transaction || transaction.id !== transactionId) return;
    // Each attempt uses the settings at launch; later edits leave existing previews intact.
    const settings = structuredClone(before.settings), dialogue = buildDialogue(messagesFor(transaction.actId), settings.extraction, transaction.character.char, transaction.character.user);
    for (const kind of kinds) transaction.results[kind] = { status: 'pending' };
    setState(before); try { await saveState(before, key, true); } catch (error) { if (key !== activeChatKey || getState()?.pendingTransaction?.id !== transactionId) return; kinds.forEach(kind => { transaction.results[kind] = { status: 'error', error: `任务启动状态保存失败：${error.message}` }; }); before.status = 'preview'; setState(before); render(before); showSaveError(error); return; } if (key !== activeChatKey || getState()?.pendingTransaction?.id !== transactionId) return; render(before);
    const settled = await Promise.allSettled(kinds.map(async kind => ({ kind, value: await generateClosePart(transaction, kind, settings, dialogue) })));
    if (key !== activeChatKey || String(ctx().chatId) !== key) return;
    const state = getState(), current = state?.pendingTransaction;
    if (!current || current.id !== transactionId || current.chatKey !== activeChatKey) return;
    settled.forEach((result, index) => { const kind = kinds[index]; current.results[kind] = result.status === 'fulfilled' ? { status: 'success', value: result.value.value } : { status: 'error', error: result.reason?.message || String(result.reason) }; });
    // Act story time follows the input used for the successful diary, including regeneration.
    if (kinds.includes('diary') && current.results.diary.status === 'success') current.dialogue = dialogue;
    state.status = 'preview'; setState(state); let previewSaved = true; try { await saveState(state, key, true); } catch (error) { previewSaved = false; showSaveError(error); } if (key !== activeChatKey) return; render(state);
    if (!previewSaved) return;
    const failures = kinds.filter(kind => current.results[kind].status === 'error');
    if (failures.length) notify('error', `${failures.map(kindLabel).join('、')}生成失败；成功部分已保留，可单独重试。`); else notify('success', '日记、记忆与角色成长已生成，请预览确认。');
}

function kindLabel(kind) { return ({ diary: '日记', memory: '记忆', growth: '角色成长' })[kind] || kind; }
async function closeAct() {
    if (closingPromise) return closingPromise;
    const key = activeChatKey, state = getState(), act = currentAct(state);
    if (pendingSave) return;
    if (!state || disabledReason || !act || state.status !== 'active' || !compatible()) return;
    const sourceMessages = messagesFor(act.id), character = characterData(), dialogue = buildDialogue(sourceMessages, state.settings.extraction, character.char, character.user);
    if (dialogue.errors.length) { state.drafts = [{ kind: 'extraction-errors', actId: act.id, errors: dialogue.errors, createdAt: Date.now() }]; setState(state); await saveState(state); render(state); notify('error', '正文标签无法匹配：请在“当前幕”检查并修正规则，或明确跳过楼层。'); return; }
    if (!sourceMessages.length) { notify('info', '当前幕还没有可整理内容。'); return; }
    const transaction = { id: newId('close'), chatKey: activeChatKey, actId: act.id, sourceFingerprint: sourceFingerprint(sourceMessages), sourceMessageIds: sourceMessages.map(message => message.extra.scene_diary.messageId), startedAt: Date.now(), dialogue, character, baseGrowth: state.characterGrowth.content, memoryRevision: state.memoryRevision, growthRevision: state.characterGrowth.revision, results: { diary: { status: 'pending' }, memory: { status: 'pending' }, growth: { status: 'pending' } } };
    state.status = 'closing'; act.status = 'closing'; state.pendingTransaction = transaction; setState(state); try { await saveState(state, key, true); } catch (error) { if (key !== activeChatKey || getState()?.pendingTransaction?.id !== transaction.id) return; state.status = 'active'; act.status = 'active'; state.pendingTransaction = null; setState(state); render(state); notify('error', `关幕准备未保存，尚未调用模型：${error.message}`); return; } if (key !== activeChatKey || getState()?.pendingTransaction?.id !== transaction.id) return; render(state);
    const running = runCloseParts(transaction.id, ['diary', 'memory', 'growth']).finally(() => { if (closingPromise === running) closingPromise = null; }); closingPromise = running;
    return closingPromise;
}

function retryClosePart(kind) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction || !['diary', 'memory', 'growth'].includes(kind) || transaction.results[kind]?.status === 'pending') return; void runCloseParts(transaction.id, [kind]); }
function allPartsReady(transaction) { return ['diary', 'memory', 'growth'].every(kind => transaction?.results?.[kind]?.status === 'success'); }

async function confirmClose() {
    if (pendingSave || disabledReason) return;
    const key = activeChatKey, original = getState(), transactionId = original?.pendingTransaction?.id;
    if (!transactionId) return;
    const prepare = base => {
        const transaction = base?.pendingTransaction, act = transaction && findAct(base, transaction.actId);
        if (!base || base.status !== 'preview' || transaction?.id !== transactionId || !act || !allPartsReady(transaction)) throw new Error('日记、记忆和角色成长必须全部生成成功后才能确认关幕');
        const sourceMessages = messagesFor(act.id), fresh = sourceFingerprint(sourceMessages);
        if (fresh !== transaction.sourceFingerprint || transaction.chatKey !== key) throw new Error('本幕内容或聊天已变更，请重新整理预览');
        if (base.characterGrowth.revision !== transaction.growthRevision) throw new Error('角色成长已被修改，请重新整理预览');
        const growthContent = String(transaction.results.growth.value || '').trim(), diary = transaction.results.diary.value;
        if (!growthContent || growthContent.length > base.settings.maxGrowthChars || !String(diary.diary || '').trim()) throw new Error('日记或角色成长为空、超长');
        const state = appendExtractedMemories(base, transaction.results.memory.value.candidates), committedAct = findAct(state, act.id);
        committedAct.status = 'closed'; committedAct.closedAt = Date.now(); committedAct.title = diary.title; committedAct.diary = diary.diary;
        committedAct.endMessageIndex = sourceMessages.at(-1)?.extra?.scene_diary?.messageIndex ?? null;
        committedAct.endSceneTime = transaction.dialogue.rows.map(row => row.storyTime).filter(Boolean).at(-1) || null;
        committedAct.sourceFingerprint = fresh; committedAct.revision++; committedAct.dirty = false;
        const time = localTime(), generatedGrowth = transaction.results.growth.generatedValue ?? transaction.results.growth.value;
        state.characterGrowth = { ...state.characterGrowth, content: growthContent, createdAt: state.characterGrowth.createdAt || time.timestamp, updatedAt: time.timestamp, timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, lastIncludedActId: act.id, edited: state.characterGrowth.edited || growthContent !== generatedGrowth, reviewRecommended: false };
        state.status = 'pending_next_act'; state.pendingTransaction = null; state.takeoverNotice = false;
        return state;
    };
    let state, applied = false;
    try { state = prepare(original); } catch (error) { notify('error', error.message); return; }
    pendingSave = true;
    try {
        await preserveRecovery(state, key);
        if (key !== activeChatKey || key !== String(ctx().chatId)) return;
        state = prepare(getState());
        await preserveRecovery(state, key);
        if (key !== activeChatKey || key !== String(ctx().chatId)) return;
        // Recheck source/growth after asynchronous backup; merge into the current library.
        state = prepare(getState()); setState(state); applied = true; saveUnverified = true;
        await preserveRecovery(state, key); await saveState(state, key, true); await clearRecovery(state, key);
        if (key !== activeChatKey) return;
        saveUnverified = false; disabledReason = ''; recallCache.clear(); render(state);
        notify('success', `第${state.currentActId}幕、记忆与角色成长已保存，下一条玩家消息将开启新幕。`);
        void syncVectors(state).catch(error => notify('warning', `向量更新失败，本地召回仍可用：${error.message}`));
    } catch (error) {
        if (key === activeChatKey) {
            if (applied) { disabledReason = '上次保存尚未核验，请在记忆库恢复保存后继续聊天。'; showSaveError(error); }
            else { await clearRecovery(state, key).catch(() => {}); notify('error', `关幕未提交，预览仍保留：${error.message}`); }
            render(getState());
        }
    } finally { pendingSave = false; }
}

function cancelClose() { const state = getState(), act = currentAct(state); if (!state || !act) return; abortInvalidJsonRequests(`close:${state.pendingTransaction?.id}:`); state.status = 'active'; act.status = 'active'; state.pendingTransaction = null; setState(state); void saveState(state); render(state); }
function skipExtraction(id) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction?.dialogue) return; transaction.dialogue.errors = transaction.dialogue.errors.filter(item => item.id !== id); transaction.dialogue.rows = transaction.dialogue.rows.filter(item => item.id !== id); transaction.dialogue.text = transaction.dialogue.rows.map(row => `${row.speaker}: ${row.body}`).join('\n\n'); setState(state); void saveState(state); render(state); }

function recallInput(state) { const current = chat().filter(message => isNormalRpMessage(message) && String(message.mes || '').trim()).slice(-3); const built = buildRecallQuery(current, state.settings.extraction); return { ...built, query: built.text }; }
function localContinuity(state, input = recallInput(state)) { lastRecall = retrieveMemories(state.memories, input.query, state.settings, { links: state.memoryLinks, revision: state.memoryRevision }); return { recallQuery: input, content: buildContinuityBlock(state, lastRecall, state.settings) }; }
async function syncVectors(state) { const config = state.settings.semantic; if (!config?.enabled) return; await indexVectors(state.memories.filter(memoryEligible), semanticIdentity(state), config, semanticKey || ctx().accountStorage?.getItem('scene_diary_embedding_key') || ''); vectorCacheRevision++; recallCache.clear(); }
async function prepareContinuity(state, input, chatKey) {
    const identity = semanticIdentity(state), embeddingKey = semanticKey || ctx().accountStorage?.getItem('scene_diary_embedding_key') || '', rankingKey = rerankKey || ctx().accountStorage?.getItem('scene_diary_rerank_key') || '';
    const cacheId = fingerprint(JSON.stringify([identity, chatKey, state.memoryRevision, vectorCacheRevision, state.settings, input.query, embeddingKey, rankingKey]));
    if (recallWork?.id === cacheId) return recallWork.promise;
    cancelRecallWork('新的召回已开始');
    const trace = createRecallTrace(); lastRecallTrace = trace; lastContinuity = null;
    const record = (stage, status, message, detail = '') => { logRecall(trace, stage, status, message, detail); refreshRecallDebug(); };
    record('查询', 'ok', `最近 ${input.rows?.length ?? 0} 条有效消息 · 查询 ${input.query.length} 字符`);
    if (recallCache.has(cacheId)) {
        const cached = recallCache.get(cacheId);
        record('缓存', 'ok', '复用相同查询、记忆版本和设置下的完整召回结果，无需网络请求');
        finishRecallTrace(trace, cached); refreshRecallDebug(); return cached;
    }
    const controller = new AbortController(), work = { id: cacheId, controller, trace, promise: null };
    recallWork = work; state = structuredClone(state);
    work.promise = (async () => {
        const warnings = [], config = state.settings.semantic;
        const check = () => { controller.signal.throwIfAborted(); if (chatKey !== activeChatKey || state.memoryRevision !== getState()?.memoryRevision) throw new DOMException('聊天或记忆库已变化', 'AbortError'); };
        const stage = async (name, message, task, describe) => {
            const start = Date.now(); record(name, 'start', message);
            try { const value = await task(); check(); record(name, 'ok', `${describe(value)} · 用时 ${durationText(Date.now() - start)}`); return value; }
            catch (error) { if (controller.signal.aborted || error?.name === 'AbortError' && (chatKey !== activeChatKey || state.memoryRevision !== getState()?.memoryRevision)) throw error; record(name, 'error', `用时 ${durationText(Date.now() - start)}`, semanticErrorDetail(error, [embeddingKey, rankingKey])); throw error; }
        };
        try {
            let vectorTask = null;
            const ordinary = state.memories.filter(memory => memoryEligible(memory) && !memory.permanent);
            if (config?.enabled && input.query && ordinary.length) {
                // Cache I/O and the query request are independent. Start both before local retrieval.
                vectorTask = Promise.allSettled([
                    stage('向量缓存', '读取本地记忆向量', () => loadVectors(ordinary, identity, config), values => `命中 ${values.size} 条缓存向量`),
                    stage('embedding', '请求查询向量', () => embed([input.query], config, embeddingKey, { signal: controller.signal }), values => `收到查询向量 · ${values[0].length} 维`),
                ]);
            } else record('向量召回', 'skip', !config?.enabled ? '未启用 embedding' : !input.query ? '查询为空' : '没有普通记忆，常驻记忆直接参与分组');
            let recall = retrieveMemories(state.memories, input.query, state.settings, { links: state.memoryLinks, revision: state.memoryRevision });
            record('关键词', 'ok', `${recall.retrievalCandidates.filter(item => !item.permanent).length} 条普通候选 · ${recall.retrievalCandidates.filter(item => item.permanent).length} 条常驻种子`);
            if (vectorTask) {
                const [cached, embedded] = await vectorTask; check();
                if (cached.status === 'fulfilled' && embedded.status === 'fulfilled') {
                    try {
                        const vectors = cached.value, queryVector = embedded.value[0];
                        if ([...vectors.values()].some(vector => vector.length !== queryVector.length || vector.some(value => !Number.isFinite(value)))) throw new Error('缓存向量维度或内容不兼容，请重建向量');
                        recall = retrieveMemories(state.memories, input.query, state.settings, { vectors, queryVector, links: state.memoryLinks, revision: state.memoryRevision });
                        record('候选融合', 'ok', `关键词与向量去重后 ${recall.retrievalCandidates.filter(item => !item.permanent).length} 条普通候选`);
                    } catch (error) { record('候选融合', 'error', '缓存向量无法参与召回', semanticErrorDetail(error)); warnings.push('embedding 失败，已回退关键词召回'); }
                } else warnings.push('embedding 失败，已回退关键词召回');
                if (warnings.length) record('候选融合', 'warn', '保留关键词召回结果');
            }
            const pool = recall.retrievalCandidates.filter(item => !item.permanent);
            if (config?.rerank && pool.length && input.query) {
                try {
                    const scores = await stage('rerank', `提交 ${pool.length} 条候选正文`, () => rerank(input.query, pool.map(item => memoryText(item.memory)), config, rankingKey, { signal: controller.signal }), values => `收到 ${values.length} 条排序分数`);
                    const scored = [...recall.retrievalCandidates.filter(item => item.permanent), ...rankRecallCandidates(pool, scores, { absolute: true }).map(item => ({ ...item, source: 'rerank' }))];
                    Object.assign(recall, finalizeRecallCandidates(state.memories, scored, state.settings, state.memoryLinks));
                } catch (error) { check(); warnings.push('rerank 失败，已保留重排前排序'); record('rerank', 'warn', '保留本地融合排序，继续生成'); }
            } else record('rerank', 'skip', !config?.rerank ? '未启用重排' : !input.query ? '查询为空' : '没有普通候选');
            check(); recall.degradedReason = warnings.join('；');
            record('筛选与分组', 'ok', `最低分数 ${recall.scoreThreshold.toFixed(2)} · 排除 ${recall.rejectedCandidates.length} 条低分候选 · ${recall.skippedGroups.length} 组超预算跳过`);
            record('召回结果', 'ok', `${recall.groups.length} 组 / ${recall.selected.length} 条 · 预算约 ${recall.budgetUsed} tokens`);
            finishRecallTrace(trace, recall, warnings.length ? 'degraded' : 'done');
            if (!warnings.length) { recallCache.set(cacheId, recall); if (recallCache.size > 20) recallCache.delete(recallCache.keys().next().value); }
            return recall;
        } catch (error) {
            if (controller.signal.aborted || error?.name === 'AbortError') { if (trace.status !== 'cancelled') record('召回', 'cancel', '原召回已失效，丢弃结果'); finishRecallTrace(trace, null, 'cancelled'); return null; }
            record('召回', 'error', '召回流程失败', semanticErrorDetail(error, [embeddingKey, rankingKey])); finishRecallTrace(trace, null, 'failed'); throw error;
        } finally { if (recallWork === work) recallWork = null; refreshRecallDebug(); }
    })();
    return work.promise;
}
function cancelRecallWork(reason) { recallWork?.controller.abort(new DOMException(reason, 'AbortError')); recallWork = null; }
function stopRecall() {
    if (!recallWork) return;
    const trace = recallWork.trace; recallGeneration++; cancelRecallWork('用户已停止生成');
    logRecall(trace, '召回', 'cancel', '用户已停止生成'); finishRecallTrace(trace, null, 'cancelled');
    awaitingMainPrompt = false; recallContent = ''; clearPrompts(); refreshRecallDebug();
}
function refreshRecallDebug() { const panel = document.getElementById?.(PANEL); if (panel && !panel.hidden && !panel.querySelector('[data-page="debug"]')?.hidden) renderDebug(panel); }
async function sceneDiaryRearrangeChat(promptChat, _contextSize, abort) {
    let state = getState(); const chatKey = activeChatKey, generation = ++recallGeneration;
    clearPrompts(); awaitingMainPrompt = false;
    if (!state || disabledReason || !compatible() || state.status !== 'active' || !Array.isArray(promptChat)) return;
    const input = recallInput(state);
    if (input.errors.length) {
        cancelRecallWork('正文提取失败'); lastRecallTrace = createRecallTrace();
        logRecall(lastRecallTrace, '查询', 'error', '最近消息不符合正文标签规则', input.errors.map(item => `楼层 ${item.index ?? '?'}：${item.errors.join('、')}`).join('\n'));
        finishRecallTrace(lastRecallTrace, null, 'failed'); refreshRecallDebug();
        notify('error', `最近消息不符合正文标签规则：${input.errors.map(item => `楼层 ${item.index ?? '?'} ${item.errors.join('、')}`).join('；')}`); abort?.(true); return;
    }
    let result;
    try { result = await prepareContinuity(state, input, chatKey); }
    catch { if (chatKey === activeChatKey && generation === recallGeneration) notify('warning', '语义召回失败，已使用本地召回；详情见诊断。'); }
    if (chatKey !== activeChatKey || generation !== recallGeneration) { abort?.(true); return; }
    if (!result) {
        state = getState(); if (!state || disabledReason || state.status !== 'active') { abort?.(true); return; }
        localContinuity(state, recallInput(state)); result = lastRecall;
        if (lastRecallTrace) { logRecall(lastRecallTrace, '本地回退', 'warn', '使用当前记忆库完成关键词召回'); finishRecallTrace(lastRecallTrace, result, 'degraded'); }
    }
    lastRecall = result;
    const notices = [lastRecall.degradedReason ? `${lastRecall.degradedReason}；详情见诊断。` : '', lastRecall.skippedGroups.length ? `${lastRecall.skippedGroups.length} 个关联记忆组超出 token 预算，已整组跳过（含常驻组）。` : ''].filter(Boolean);
    if (notices.length) notify('warning', notices.join('；'));
    recallContent = buildContinuityBlock(state, lastRecall, state.settings);
    promptChat.splice(0, promptChat.length, ...filterPromptMessages(promptChat, state.currentActId));
    if (String(ctx().mainApi || '').toLowerCase() === 'openai') awaitingMainPrompt = true;
    else { setExtensionPrompt(MEMORY_KEY, recallContent, extension_prompt_types.IN_CHAT, Math.min(promptChat.length, 100), false, extension_prompt_roles.SYSTEM); lastContinuity = { included: !!recallContent, reason: recallContent ? '' : '没有可注入的内容' }; }
    refreshRecallDebug();
}
function promptReady(eventData) { const state = getState(), requestChat = eventData?.chat, dryRun = !!eventData?.dryRun; if (!dryRun && !awaitingMainPrompt) return; awaitingMainPrompt = false; if (!state || disabledReason || state.status !== 'active' || !Array.isArray(requestChat)) { lastContinuity = { included: false, reason: '聊天未处于可注入状态', dryRun }; return; } const input = dryRun ? recallInput(state) : null; if (input?.errors?.length) { lastContinuity = { included: false, reason: '召回正文提取失败', dryRun }; return; } const content = dryRun ? localContinuity(state, input).content : recallContent; const index = insertContinuityBeforeHistory(requestChat, content); lastContinuity = { included: index >= 0, index, length: content.length, growthIncluded: !!state.characterGrowth.content, growthRevision: state.characterGrowth.revision, dryRun, reason: index >= 0 ? '' : '没有可注入的角色成长、日记或记忆' }; recallContent = ''; refreshRecallDebug(); }
globalThis.sceneDiaryRearrangeChat = sceneDiaryRearrangeChat;

const maintenanceRuns = new Set(), maintenanceWork = new Map();
function editCandidate(field) {
    if (pendingSave || disabledReason) return;
    const state = getState(), memory = state?.pendingTransaction?.results?.memory?.value?.candidates?.[+field.dataset.candidateIndex]; if (!memory) return;
    const key = field.dataset.candidateField; memory[key] = key === 'accepted' ? field.checked : key === 'importance' ? +field.value : key === 'storyTime' ? field.value.trim() || null : field.value;
    setState(state); void saveState(state).catch(showSaveError);
}
function editMaintenance(field) {
    if (pendingSave || disabledReason) return;
    const state = getState(), tx = state?.maintenanceTransaction, op = tx?.operations?.find(item => item.id === field.dataset.operationId); if (!op) return;
    const key = field.dataset.maintenanceField;
    if (key === 'accepted') op.accepted = field.checked;
    else if (key === 'storyTime') { op.merged.storyTime = field.value || null; op.timeResolved = field.value !== '__choose__'; }
    else if (key === 'reason') op.reason = field.value;
    else op.merged[key] = field.value;
    setState(state); void saveState(state).catch(showSaveError);
}
function maintenanceCurrent(id, key) {
    if (key !== activeChatKey || key !== String(ctx().chatId) || !compatible()) return null;
    const state = getState(); return state?.maintenanceTransaction?.id === id ? state : null;
}
function maintenanceLog(tx, stage, status, message, elapsed = 0) {
    tx.events ||= []; tx.events.push({ stage, status, message, elapsed, at: Date.now() - tx.startedAt });
}
async function startMaintenance(mode = null) {
    const state = getState(); if (!state || disabledReason || pendingSave) return;
    if (state.maintenanceTransaction?.status === 'running') { notify('info', '记忆整理正在运行。'); return; }
    mode ||= state.memoryOrganization ? 'incremental' : 'full';
    if (!['full', 'incremental'].includes(mode)) { notify('error', '记忆整理模式无效。'); return; }
    if (mode === 'incremental' && !state.memoryOrganization) { notify('info', '请先完成并批准一次全量整理／初始化。'); return; }
    const pendingIds = (mode === 'full' ? state.memories.map(memory => memory.id) : pendingOrganizationIds(state)).sort();
    if (mode === 'incremental' && !pendingIds.length) { notify('info', '没有新增或变更的记忆，无需增量整理。'); return; }
    const settings = structuredClone(state.settings), profile = settings.maintenanceConnectionProfile;
    let connectionIdentity;
    try { connectionIdentity = maintenanceConnectionIdentity(ctx(), profile); }
    catch (error) { notify('error', error.message); return; }
    const snapshot = structuredClone(state.memories), id = newId('maintenance'), key = activeChatKey;
    const identity = semanticIdentity(state);
    state.maintenanceTransaction = { version: 2, id, chatKey: key, memoryRevision: state.memoryRevision, mode, pendingIds, profile, connectionIdentity,
        settings: { maintenanceCandidateLimit: settings.maintenanceCandidateLimit, maintenanceScoreThreshold: settings.maintenanceScoreThreshold, semantic: settings.semantic, prompts: { maintenance: settings.prompts.maintenance } },
        character: { char: ctx().name2 || '角色', user: ctx().name1 || '玩家' }, identity, snapshot,
        originalLinks: structuredClone(state.memoryLinks), links: mode === 'full' ? [] : structuredClone(state.memoryLinks),
        queries: pendingIds.map(id => ({ id, status: 'pending' })), tasks: [], allowedPairs: [], stage: 'index', status: 'ready', startedAt: Date.now(), events: [] };
    setState(state); await saveState(state, key, true); if (!maintenanceCurrent(id, key)) return; render(state); await runMaintenance(id);
}
async function runMaintenance(id) {
    if (maintenanceRuns.has(id) || pendingSave || disabledReason) return;
    const key = activeChatKey; let state = maintenanceCurrent(id, key); if (!state) return;
    const tx = state.maintenanceTransaction;
    if (tx.version !== 2) { notify('warning', '旧版未完成整理需要重新发起；已完成预览仍可批准。'); return; }
    if (state.memoryRevision !== tx.memoryRevision) { notify('warning', '记忆库已变化，请重新整理。'); return; }
    const controller = new AbortController();
    const check = () => {
        controller.signal.throwIfAborted();
        const latest = maintenanceCurrent(id, key);
        if (!latest || latest.memoryRevision !== tx.memoryRevision || ctx().groupId || disabledReason) throw staleJsonRequest();
        if (JSON.stringify(semanticIdentity(latest)) !== JSON.stringify(tx.identity)) throw staleJsonRequest();
        if (maintenanceConnectionIdentity(ctx(), tx.profile) !== tx.connectionIdentity) throw new Error('记忆整理连接配置已改变，请重新发起整理。');
    };
    const checkpoint = async () => { check(); const latest = maintenanceCurrent(id, key); setState(latest); await saveState(latest, key); check(); render(latest); };
    const keys = { embedding: semanticKey || ctx().accountStorage?.getItem('scene_diary_embedding_key') || '', rerank: rerankKey || ctx().accountStorage?.getItem('scene_diary_rerank_key') || '' };
    const monitor = setInterval(() => { try { check(); } catch (error) { controller.abort(error); } }, 250);
    maintenanceRuns.add(id); maintenanceWork.set(id, { controller });
    try {
        check(); tx.status = 'running'; tx.error = ''; await checkpoint();
        const config = tx.settings.semantic, retrieve = createMemoryRetriever(tx.snapshot, tx.memoryRevision, { includePermanent: true });
        let vectors = new Map();
        if (config.enabled && tx.snapshot.length > 1 && tx.queries.some(query => query.status !== 'success')) {
            const start = Date.now(); maintenanceLog(tx, '索引', 'start', '检查缓存并补齐缺失的记忆向量'); await checkpoint();
            try {
                vectors = await waitForMaintenance(indexVectors(tx.snapshot, tx.identity, config, keys.embedding), controller.signal); check();
                const widths = new Set([...vectors.values()].map(vector => vector.length));
                if (vectors.size !== tx.snapshot.length || widths.size !== 1 || [...vectors.values()].some(vector => !vector.length || vector.some(value => !Number.isFinite(value))) || config.dimensions && !widths.has(config.dimensions)) throw new Error('记忆向量缺失、维度或内容不兼容，请重建向量后重新整理。');
                maintenanceLog(tx, '索引', 'ok', '向量已就绪，查询复用条目自身向量', Date.now() - start);
            } catch (error) { maintenanceLog(tx, '索引', 'error', semanticErrorDetail(error, Object.values(keys)), Date.now() - start); throw error; }
        } else maintenanceLog(tx, '索引', 'skip', config.enabled ? '无需补充初筛查询' : '未启用 embedding，使用本地检索');
        if (tx.stage === 'index') tx.stage = 'retrieval'; await checkpoint();
        for (const query of tx.queries.filter(item => item.status !== 'success')) {
            check(); query.status = 'running'; const started = Date.now(); await checkpoint();
            try {
                const memory = tx.snapshot.find(item => item.id === query.id);
                let pool = retrieve(memoryText(memory), { vectors, queryVector: vectors.get(query.id), excludeId: query.id, useImportance: false });
                if (config.rerank && pool.length) {
                    const scores = await waitForMaintenance(rerank(memoryText(memory), pool.map(item => memoryText(item.memory)), config, keys.rerank, { signal: controller.signal }), controller.signal); check();
                    pool = rankRecallCandidates(pool, scores, { absolute: true, useImportance: false });
                }
                query.candidates = pool.filter(item => item.score >= tx.settings.maintenanceScoreThreshold).slice(0, tx.settings.maintenanceCandidateLimit).map(item => ({ id: item.memory.id, score: item.score }));
                query.status = 'success'; query.error = '';
                maintenanceLog(tx, '初筛', 'ok', (memory.title || query.id) + '：' + pool.length + ' 条初选，保留 ' + query.candidates.length + ' 条候选', Date.now() - started);
            } catch (error) { query.status = 'error'; query.error = semanticErrorDetail(error, Object.values(keys)); maintenanceLog(tx, '初筛', 'error', query.error, Date.now() - started); throw error; }
            await checkpoint();
        }
        if (tx.stage === 'retrieval') {
            tx.allowedPairs = candidatePairs(tx.queries, tx.mode === 'incremental' ? tx.pendingIds : null);
            tx.tasks = candidateTasks(tx); tx.stage = 'analysis';
            maintenanceLog(tx, '配对', 'ok', tx.allowedPairs.length + ' 个去重候选配对，' + tx.tasks.length + ' 个分析批次'); await checkpoint();
        }
        while (tx.tasks.some(task => task.status !== 'success')) {
            check(); const task = tx.tasks.find(item => item.status !== 'success'); task.status = 'running'; task.error = ''; await checkpoint();
            const started = Date.now();
            try {
                const feedback = task.rejected?.length ? JSON.stringify(task.rejected) : '';
                const messages = maintenanceMessages(tx, task, feedback);
                if (maintenanceInputSize(messages) > MAINTENANCE_INPUT_LIMIT) throw new Error('整理输入超限，需要拆批。');
                const parse = value => requireArrayField(modelJson(value, '记忆整理'), 'operations', '记忆整理');
                let output;
                if (globalThis.__TAURI_RUNNING__ === true) {
                    output = await waitForMaintenance(requestJson(tx.profile, messages, OUTPUT_SCHEMAS.maintenance, parse, 8192, '记忆整理', { owner: 'maintenance:' + id, assertCurrent: check }), controller.signal);
                } else {
                    output = await waitForMaintenance(requestLegacyStructured(async (prompt, tokens, schema) => {
                        check(); const result = await ctx().ConnectionManagerRequestService.sendRequest(tx.profile, prompt, tokens, { stream: false, signal: controller.signal, extractData: true, includePreset: false, includeInstruct: false }, schema ? { json_schema: schema } : {}); check(); return result?.content ?? result;
                    }, messages, OUTPUT_SCHEMAS.maintenance, parse, 8192, '记忆整理'), controller.signal);
                }
                check();
                const batch = validateMaintenanceBatch(tx.snapshot, tx.links, output.operations, tx.mode === 'incremental' ? tx.pendingIds : null, task);
                task.operations = batch.operations; task.rejected = batch.rejected; task.filtered = batch.filtered; task.status = 'success';
                maintenanceLog(tx, '分析', 'ok', batch.operations.length + ' 项有效建议，自动过滤 ' + batch.filtered.length + ' 项，校验失败 ' + batch.rejected.length + ' 项', Date.now() - started);
            } catch (error) {
                check(); const split = /context|too (?:many|long)|token.*(?:limit|exceed)|上下文|超限|两次输出均未满足/i.test(error.message) ? splitCandidateTask(task) : null;
                if (split) tx.tasks.splice(tx.tasks.indexOf(task), 1, ...split);
                else { task.status = 'error'; task.error = semanticErrorDetail(error, Object.values(keys)); throw error; }
            }
            await checkpoint();
        }
        const raw = tx.tasks.flatMap(task => task.operations || []);
        validateMaintenanceScope(raw, tx.mode === 'incremental' ? tx.pendingIds : null); validateMaintenanceTaskScopes(raw, tx.tasks);
        tx.operations = planMaintenance(tx.snapshot, tx.links, raw); tx.deduplicatedCount = raw.length - tx.operations.length; validateMaintenanceTaskScopes(tx.operations, tx.tasks);
        tx.status = 'preview'; tx.stage = 'review';
        const rejectedCount = tx.tasks.reduce((sum, task) => sum + (task.rejected?.length || 0), 0);
        maintenanceLog(tx, '审核', 'ok', tx.operations.length + ' 项建议等待批准');
        await checkpoint(); notify(rejectedCount ? 'warning' : 'success', '记忆整理完成：' + tx.operations.length + ' 项有效建议，' + rejectedCount + ' 项建议未通过校验，等待批准。');
    } catch (error) {
        state = maintenanceCurrent(id, key);
        if (state) {
            tx.status = state.memoryRevision !== tx.memoryRevision ? 'stale' : 'error'; tx.error = semanticErrorDetail(error, Object.values(keys));
            for (const query of tx.queries) if (query.status === 'running') query.status = 'error';
            for (const task of tx.tasks) if (task.status === 'running') task.status = 'error';
            maintenanceLog(tx, '暂停', 'error', tx.error); setState(state); await saveState(state, key).catch(saveError => notify('warning', '整理进度保存失败：' + semanticErrorDetail(saveError, Object.values(keys)))); render(state); notify('error', '整理暂停，已完成进度保留：' + tx.error);
        }
    } finally { clearInterval(monitor); maintenanceRuns.delete(id); maintenanceWork.delete(id); }
}
async function confirmMaintenance(acceptRejected = false) {
    if (pendingSave || disabledReason) return;
    const state = getState(), tx = state?.maintenanceTransaction, key = activeChatKey;
    if (!tx || tx.status !== 'preview') return;
    if (tx.tasks.some(task => task.rejected?.length) && acceptRejected !== true) { notify('warning', '部分模型建议未通过校验。请查看原因，并使用“忽略未通过的建议并批准”按钮明确确认。'); return; }
    if (state.memoryRevision !== tx.memoryRevision) { notify('error', '记忆库已变化，请重新整理。'); return; }
    let next;
    try { next = applyMaintenance(state, tx.operations, { mode: tx.mode, pendingIds: tx.pendingIds, tasks: tx.version === 2 ? tx.tasks : undefined }); } catch (error) { notify('error', `整理未保存：${error.message}`); return; }
    pendingSave = true; let applied = false;
    try {
        await preserveRecovery(next, key);
        const latest = maintenanceCurrent(tx.id, key);
        if (!latest || latest.memoryRevision !== tx.memoryRevision) throw new Error('保存准备期间记忆库已变化，请重新整理');
        // Keep any new chat/act/diary state that arrived during the recovery write.
        Object.assign(latest, { memories: next.memories, memoryLinks: next.memoryLinks, memoryOrganization: next.memoryOrganization, memoryRevision: next.memoryRevision, maintenanceTransaction: null });
        setState(latest); applied = true; saveUnverified = true; await preserveRecovery(latest, key);
        await saveState(latest, key, true); await clearRecovery(latest, key); if (key !== activeChatKey) return; saveUnverified = false; recallCache.clear(); render(latest);
        notify('success', '已保存批准的整理操作。'); void syncVectors(latest).catch(error => notify('warning', `向量更新失败：${error.message}`));
    } catch (error) { if (key === activeChatKey) { if (applied) { disabledReason = '整理保存尚未核验，请恢复未完成的保存。'; showSaveError(error); } else { await clearRecovery(next, key).catch(() => {}); notify('error', `整理未提交，预览仍保留：${error.message}`); } render(getState()); } }
    finally { pendingSave = false; }
}
function cancelMaintenance() {
    const state = getState(); if (!state) return;
    maintenanceWork.get(state.maintenanceTransaction?.id)?.controller.abort(new DOMException('整理已取消', 'AbortError'));
    abortInvalidJsonRequests(`maintenance:${state.maintenanceTransaction?.id}`);
    state.maintenanceTransaction = null; setState(state); void saveState(state).catch(showSaveError); render(state);
}
function maintenanceDiagnostics(tx) {
    return '<ol class="scene-diary-log">' + (tx.events || []).slice(-100).map(event => '<li><strong>' + escape(event.stage) + '</strong> · ' + escape(event.status) + ' · +' + durationText(event.at) + ' · ' + durationText(event.elapsed) + '<p>' + escape(event.message) + '</p></li>').join('') + '</ol>' + tx.tasks.flatMap(task => task.filtered || []).map(item => '<p>自动过滤：' + escape(item.reason) + '（' + escape(item.targets.join(' ↔ ')) + '）</p>').join('');
}
function renderMaintenance(state) {
    const root = document.querySelector('#scene_diary_maintenance'); if (!root) return;
    const initialized = !!state?.memoryOrganization, pending = state ? pendingOrganizationIds(state).length : 0;
    const selector = document.querySelector('[data-organization-mode]');
    if (selector) {
        selector.querySelector('[value="incremental"]').disabled = !initialized;
        if (selector.dataset.initialized !== String(initialized)) { selector.value = initialized ? 'incremental' : 'full'; selector.dataset.initialized = String(initialized); }
    }
    let status = `<p class="scene-diary-muted">${initialized ? `已初始化；${pending} 条新增或变更记忆待整理。增量模式保留已有结构。` : '尚未初始化，请先批准一次全量整理。'} 全量模式基于现有条目重建全部关联，仅确认保存后生效。</p>`;
    const tx = state?.maintenanceTransaction; if (!tx) { root.innerHTML = status; return; }
    status += jsonWarningHtml(`maintenance:${tx.id}`);
    if (tx.status === 'running' && jsonProgress.has(`maintenance:${tx.id}`)) status += `<p>${escape(jsonProgress.get(`maintenance:${tx.id}`))}</p>`;
    const stale = state.memoryRevision !== tx.memoryRevision, completed = tx.tasks.filter(task => task.status === 'success').length;
    const count = tx.pendingIds?.length || 0, total = tx.snapshot.length;
    const retrievalProgress = tx.version === 2 ? tx.queries.filter(query => query.status === 'success').length : 0;
    const phase = { index: '建立索引', retrieval: '逐条初筛', analysis: '合批分析', review: '审核' };
    const coverage = tx.version === 2 ? `阶段：${phase[tx.stage] || tx.stage}；${retrievalProgress}/${tx.queries.length} 条初筛完成；${tx.allowedPairs.length} 个候选配对，${completed}/${tx.tasks.length} 批分析完成。初筛不保证覆盖全部组合。` : `旧版任务；${completed}/${tx.tasks.length} 批已完成。`;
    const header = `${status}<h4>${tx.mode === 'full' ? '全量整理／初始化' : tx.mode === 'incremental' ? '增量整理' : '旧版整理预览'}</h4><p>${total} 条记忆${tx.mode === 'incremental' ? `，其中 ${count} 条待整理` : ''}；${coverage}${stale ? '记忆库已变化，需重新整理。' : tx.status === 'running' ? '正在分析…' : ''}</p>${tx.mode === 'full' ? `<p class="scene-diary-warning">批准后将替换原有 ${tx.originalLinks?.length || 0} 条关联，只保留本次批准的关联及合并结果。</p>${tx.originalLinks?.map(link => `<p>待替换关联：${escape(tx.snapshot.find(memory => memory.id === link.a)?.title || link.a)} ↔ ${escape(tx.snapshot.find(memory => memory.id === link.b)?.title || link.b)}：${escape(link.reason)}</p>`).join('') || ''}` : ''}${tx.error ? `<p>${escape(tx.error)}</p>` : ''}${tx.tasks.filter(task => task.status === 'error').map(task => `<p class="scene-diary-warning">${escape(task.error)}</p>`).join('')}`;
    const operationLabels = new Map((tx.operations || []).map((op, index) => [op.id, `#${index + 1}`]));
    const operations = tx.status === 'preview' ? tx.operations.map(op => {
        const attrs = field => `data-operation-id="${escape(op.id)}" data-maintenance-field="${field}"`;
        const members = op.action === 'merge' ? tx.snapshot.filter(memory => op.memberIds.includes(memory.id)) : tx.snapshot.filter(memory => [op.a, op.b].includes(memory.id));
        return `<div class="scene-diary-candidate"><p><strong>建议 ${escape(operationLabels.get(op.id))}</strong></p><label><input ${attrs('accepted')} type="checkbox" ${op.accepted ? 'checked' : ''}> ${op.action === 'merge' ? '合并重复记忆' : '关联独立记忆'}</label>${members.map(memory => `<p><strong>${escape(memory.title)}</strong>：${escape(memory.content)}<br><small>故事时间：${escape(memory.storyTime || '未记录')}；重要度 ${memory.importance}；${memory.permanent ? '常驻' : '普通'}</small></p>`).join('')}${op.action === 'merge' ? `<p>保留 ID：${escape(op.targetId)}；重要度 ${op.merged.importance}；${op.merged.permanent ? '常驻' : '普通'}</p><label>合并标题<input ${attrs('title')} maxlength="120" value="${escape(op.merged.title)}"></label><label>合并正文<textarea ${attrs('content')} maxlength="500">${escape(op.merged.content)}</textarea></label><label>类别<select ${attrs('category')}>${MEMORY_CATEGORIES.map(category => `<option ${category === op.merged.category ? 'selected' : ''}>${category}</option>`).join('')}</select></label><label>故事时间<select ${attrs('storyTime')}>${!op.timeResolved ? '<option value="__choose__" selected>请选择最新故事时间</option>' : ''}${op.timeChoices.length ? op.timeChoices.map(time => `<option value="${escape(time)}" ${op.merged.storyTime === time ? 'selected' : ''}>${escape(time)}</option>`).join('') : '<option value="">未记录</option>'}</select></label>${op.conflicts?.length ? `<p class="scene-diary-warning">与建议 ${op.conflicts.map(id => escape(operationLabels.get(id) || id)).join('、')} 存在共享成员的合并冲突，请勿同时批准。</p>` : ''}` : ''}<label>关联／合并理由<textarea ${attrs('reason')} maxlength="300">${escape(op.reason)}</textarea></label></div>`;
    }).join('') : '';
    const rejected = tx.tasks.flatMap((task, batch) => (task.rejected || []).map(item => ({ ...item, batch: batch + 1 })));
    const warnings = rejected.length ? `<p class="scene-diary-warning">${rejected.length} 项模型建议未通过校验，未纳入可批准操作。请检查下列原因；忽略后批准会记录整理基线${tx.mode === 'full' ? '并替换全部旧关联' : ''}。</p>${rejected.map(item => `<p class="scene-diary-warning">批次 ${item.batch}，建议 ${item.index}（${escape(item.action)}；${escape(item.targets.join(' ↔ '))}）：${escape(item.reason)}</p>`).join('')}` : '';
    const filtered = tx.tasks.reduce((sum, task) => sum + (task.filtered?.length || 0), 0) + (tx.deduplicatedCount || 0);
    const trace = tx.version === 2 ? `<details><summary>整理诊断：自动过滤 ${filtered} 项建议</summary>${maintenanceDiagnostics(tx)}</details>` : '';
    root.innerHTML = `${header}${trace}${warnings}${operations}${tx.status === 'preview' && !tx.operations.length ? `<p>${rejected.length ? '没有可批准的有效建议，不能据此认定无需整理。' : '没有合并或新增关联建议。'}确认后仍会记录本次检查；全量模式会清除旧关联。</p>` : ''}<div class="scene-diary-actions">${!stale && tx.status === 'preview' ? `<button data-action="${rejected.length ? 'confirm-maintenance-partial' : 'confirm-maintenance'}">${rejected.length ? '忽略未通过的建议并批准' : tx.mode === 'full' ? '批准并重建记忆结构' : '保存批准的操作'}</button>${rejected.length && tx.version === 2 ? '<button data-action="retry-rejected-maintenance">重试含未通过建议的批次</button>' : ''}` : ''}${!stale && tx.status === 'error' && tx.version === 2 ? `<button data-action="retry-maintenance" data-transaction-id="${escape(tx.id)}">重试未完成批次</button>` : ''}<button data-action="cancel-maintenance">取消整理</button></div>`;
}

function renderMemories(state) {
    const root = document.querySelector('#scene_diary_memories'); if (!root || !state) return;
    const query = document.querySelector('[data-memory-search]')?.value?.toLowerCase() || '', category = document.querySelector('[data-memory-category]')?.value || '';
    const renderKey = JSON.stringify([activeChatKey, state.memorySpaceId, state.memoryRevision, query, category, draftMemory?.id]);
    if (memoryRenderKey === renderKey) return; memoryRenderKey = renderKey;
    const all = draftMemory && !state.memories.some(memory => memory.id === draftMemory.id) ? [draftMemory, ...state.memories] : state.memories;
    const entries = all.filter(memory => !memory.deletedAt && (!query || `${memory.title} ${memory.content} ${memory.people.join(' ')}`.toLowerCase().includes(query)) && (!category || memory.category === category));
    root.innerHTML = entries.length ? entries.map(memory => {
        const related = state.memoryLinks.filter(link => link.a === memory.id || link.b === memory.id).map(link => { const id = link.a === memory.id ? link.b : link.a, other = state.memories.find(item => item.id === id); return other ? `<div class="scene-diary-related"><button data-action="open-related" data-related-id="${escape(id)}">${escape(other.title)}</button><p>${escape(other.content)}</p><small>${escape(link.reason)}</small><button data-action="unlink-memory" data-link-a="${escape(link.a)}" data-link-b="${escape(link.b)}">解除关联</button></div>` : ''; }).join('');
        return `<details ${draftMemory?.id === memory.id ? 'open' : ''} class="scene-diary-entry" data-memory-id="${escape(memory.id)}"><summary>${escape(memory.title)} <small>${escape(memory.category)}${memory.permanent ? ' · 常驻' : ''}</small></summary><label>标题<input data-memory-field="title" maxlength="120" value="${escape(memory.title)}"></label><label>内容<textarea data-memory-field="content" maxlength="500" rows="3">${escape(memory.content)}</textarea></label><label>类别<select data-memory-field="category">${MEMORY_CATEGORIES.map(item => `<option ${item === memory.category ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>重要度<input data-memory-field="importance" type="number" min="1" max="5" value="${memory.importance}"></label><label>故事时间<input data-memory-field="storyTime" value="${escape(memory.storyTime || '')}"></label><label><input data-memory-field="permanent" type="checkbox" ${memory.permanent ? 'checked' : ''}> 常驻，优先召回（遵守组数与预算）</label><label><input data-memory-field="locked" type="checkbox" ${memory.locked ? 'checked' : ''}> 锁定，整理不可合并</label><h5>关联记忆</h5>${related || '<p>暂无关联。</p>'}<button data-action="save-memory">保存</button><button data-action="delete-memory">删除</button></details>`;
    }).join('') : '<p class="scene-diary-muted">没有符合条件的记忆。</p>';
}

function renderPart(kind, result, transaction) {
    if (result?.status === 'pending') return `<section class="scene-diary-result"><h5>${kindLabel(kind)}</h5><p>${escape(jsonProgress.get(`close:${transaction.id}:${kind}`) || '正在生成…')}</p></section>`;
    if (result?.status === 'error') return `<section class="scene-diary-result scene-diary-error"><h5>${kindLabel(kind)}</h5><p>${escape(result.error)}</p><button data-action="retry-part" data-kind="${kind}">仅重试${kindLabel(kind)}</button></section>`;
    if (kind === 'diary') return `<section class="scene-diary-result"><h5>日记</h5><label>标题<input data-preview="title" value="${escape(result.value.title)}"></label><label>日记<textarea data-preview="diary" rows="7">${escape(result.value.diary)}</textarea></label><button data-action="retry-part" data-kind="diary">重新生成日记</button></section>`;
    if (kind === 'growth') return `<section class="scene-diary-result"><h5>角色成长</h5><p class="scene-diary-muted">角色成长记录关系与状态演变，不规定下一幕的时间、地点或开场事件。</p><label>当前角色成长<textarea rows="5" readonly>${escape(transaction.baseGrowth || '尚未建立')}</textarea></label><label>更新后角色成长<textarea data-preview="growth" rows="9" maxlength="4000">${escape(result.value)}</textarea></label><button data-action="retry-part" data-kind="growth">重新生成角色成长</button></section>`;
    const candidates = result.value?.candidates || [], rejected = result.value?.rejected || [];
    const warning = rejected.length ? `<div class="scene-diary-review-warning"><strong>${rejected.length} 条候选格式无效，尚未保存。</strong>${rejected.map(item => `<p>第 ${item.index} 条：${escape(item.reason)}</p>`).join('')}</div>` : '';
    return `<section class="scene-diary-result"><h5>本幕新记忆</h5>${warning}${candidates.map((memory, index) => `<div class="scene-diary-candidate"><label><input data-candidate-index="${index}" data-candidate-field="accepted" type="checkbox" ${memory.accepted !== false ? 'checked' : ''}> 保留这条记忆</label><label>标题<input data-candidate-index="${index}" data-candidate-field="title" maxlength="120" value="${escape(memory.title)}"></label><label>事实<textarea data-candidate-index="${index}" data-candidate-field="content" maxlength="500">${escape(memory.content)}</textarea></label><label>类别<select data-candidate-index="${index}" data-candidate-field="category">${MEMORY_CATEGORIES.map(category => `<option ${category === memory.category ? 'selected' : ''}>${category}</option>`).join('')}</select></label><label>重要度<input data-candidate-index="${index}" data-candidate-field="importance" type="number" min="1" max="5" value="${memory.importance}"></label><label>故事时间<input data-candidate-index="${index}" data-candidate-field="storyTime" value="${escape(memory.storyTime || '')}"></label></div>`).join('') || '<p>本幕没有新记忆。</p>'}<button data-action="regenerate-memory">重新提取记忆</button></section>`;
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
    renderMemories(state || createState()); renderMaintenance(state);
    const recallSummary = panel.querySelector('[data-recall-summary]'); if (recallSummary) recallSummary.textContent = `上次召回：${lastRecall?.groups?.length || 0} 组 / ${lastRecall?.selected.length || 0} 条；预算约 ${lastRecall?.budgetUsed || 0} tokens。`;
    const size = panel.querySelector('[data-maintenance-size]'); if (size && state) { const backup = createContentBackup(state, activeChatKey); size.textContent = `备份包含 ${backup.diaries.length} 篇日记、角色成长及 ${backup.memories.length} 条记忆。`; }
    const recovery = panel.querySelector('[data-action=recover-save]'); if (recovery) recovery.hidden = !saveUnverified;
    const transaction = state?.pendingTransaction, preview = panel.querySelector('#scene_diary_preview'); preview.hidden = !transaction || !['closing', 'preview'].includes(state.status);
    if (!preview.hidden) { const ready = allPartsReady(transaction); preview.innerHTML = `<h4>关幕预览</h4>${jsonWarningHtml(`close:${transaction.id}:`)}${renderPart('diary', transaction.results.diary, transaction)}${renderPart('growth', transaction.results.growth, transaction)}${renderPart('memory', transaction.results.memory, transaction)}<div class="scene-diary-actions"><button data-action="confirm" ${ready && !pendingSave ? '' : 'disabled'}>确认保存并结束</button><button data-action="cancel-close">取消</button></div>`; }
    const errors = state?.drafts?.at(-1), extraction = panel.querySelector('#scene_diary_extraction'); extraction.innerHTML = errors?.kind === 'extraction-errors' ? `<h4>正文提取错误</h4>${errors.errors.map(error => `<p>楼层 ${error.index ?? '?'}：${escape(error.errors.join('；'))} <button data-action="skip" data-id="${escape(error.id)}">跳过此条</button></p>`).join('')}` : '';
    const maintenanceProfile = panel.querySelector('[data-setting=maintenanceConnectionProfile]'); if (maintenanceProfile) maintenanceProfile.innerHTML = profileOptions(state?.settings.maintenanceConnectionProfile).replace('沿用当前聊天连接', '请选择整理专属连接');
    const diaryProfile = panel.querySelector('[data-setting=diaryConnectionProfile]'), memoryProfile = panel.querySelector('[data-setting=memoryConnectionProfile]'); if (diaryProfile) diaryProfile.innerHTML = profileOptions(state?.settings.diaryConnectionProfile); if (memoryProfile) memoryProfile.innerHTML = profileOptions(state?.settings.memoryConnectionProfile);
}

function createUi() {
    if (document.getElementById(BAR)) return;
    const form = document.querySelector('#send_form') || document.querySelector('#send_textarea')?.parentElement; if (!form) return;
    const bar = document.createElement('div'); bar.id = BAR; bar.innerHTML = '<button type="button" data-action="open">🎬 scene&diary</button><span data-role="status">等待接管</span><button type="button" data-action="end">结束这一幕</button>'; form.prepend(bar);
    const panel = document.createElement('section'); panel.id = PANEL; panel.hidden = true;
    panel.innerHTML = `<header class="scene-diary-panel-head"><h3>scene&diary</h3><button data-action="close" aria-label="关闭">×</button></header><p data-role="status" class="scene-diary-warning"></p><nav class="scene-diary-tabs"><button data-tab="act">当前幕</button><button data-tab="growth">角色成长</button><button data-tab="memory">记忆库</button><button data-tab="diary">日记</button><button data-tab="settings">设置</button><button data-tab="debug">诊断</button></nav><section data-page="act"><p>结束当前幕后，会生成日记、记忆候选和角色成长；确认前不会正式写入。</p><div class="scene-diary-actions"><button data-action="end">结束这一幕</button><button data-action="takeover">从当前第一条接管旧聊天</button></div><div id="scene_diary_extraction"></div><div id="scene_diary_preview" hidden></div></section><section data-page="growth" hidden><p data-growth-notice class="scene-diary-warning"></p><label>角色成长<textarea data-growth-editor rows="14" maxlength="4000" placeholder="概括角色的成长路径、情感发展、双方关系与生活状态演变。"></textarea></label><p data-growth-count class="scene-diary-muted"></p><p data-growth-meta class="scene-diary-muted"></p><div class="scene-diary-actions"><button data-action="save-growth">保存角色成长</button></div></section><section data-page="memory" hidden><label>搜索<input data-memory-search placeholder="标题、内容、人物"></label><label>分类<select data-memory-category><option value="">全部分类</option>${MEMORY_CATEGORIES.map(item => `<option>${item}</option>`).join('')}</select></label><button data-action="new-memory">新增记忆</button><label>整理模式<select data-organization-mode><option value="full">全量整理／初始化</option><option value="incremental">增量整理</option></select></label><button data-action="organize-memory">记忆整理</button><div id="scene_diary_maintenance"></div><p data-recall-summary class="scene-diary-muted"></p><div id="scene_diary_memories"></div></section><section data-page="diary" hidden><div id="scene_diary_diaries"></div></section><section data-page="settings" hidden><h4>模型</h4><label>日记／角色成长连接<select data-setting="diaryConnectionProfile"></select></label><label>记忆提取连接<select data-setting="memoryConnectionProfile"></select></label><label>记忆整理连接<select data-setting="maintenanceConnectionProfile"></select></label><h4>记忆整理初筛</h4><label>每条记忆最多整理候选<input data-setting="maintenanceCandidateLimit" type="number" min="1" max="60" step="1"></label><label>整理最低相关分数<input data-setting="maintenanceScoreThreshold" type="number" min="0" max="1" step="0.01"></label><p class="scene-diary-muted">独立于聊天召回。默认 20 条、0.15；设为 0 关闭分数截断。未启用的检索服务跳过，已启用服务失败会暂停并保留进度。</p><h4>召回</h4><label>读取最近有效消息数<input data-setting="recallMessageCount" type="number" min="1" max="20"></label><label>最多召回组数<input data-setting="recallLimit" type="number" min="0" max="30"></label><label>长期记忆预算（tokens）<input data-setting="memoryTokenBudget" type="number" min="100"></label><label>近期日记篇数<input data-setting="recentDiaryCount" type="number" min="0" max="20"></label><h4>正文标签</h4><p class="scene-diary-muted">每行一组完整标签；同一行的开始与结束标签必须同名。全部留空时提取完整消息。</p><div data-pair-editor>${[['角色正文', 'character.bodyTagPairs'], ['玩家正文', 'user.bodyTagPairs'], ['角色故事时间', 'character.storyTimeTagPairs'], ['玩家故事时间', 'user.storyTimeTagPairs']].map(([label, key]) => `<fieldset class="scene-diary-tag-pair"><legend>${label}</legend><label>开始标签<textarea rows="2" data-pair-open="${key}" placeholder="<now_plot>"></textarea></label><label>结束标签<textarea rows="2" data-pair-close="${key}" placeholder="</now_plot>"></textarea></label></fieldset>`).join('')}</div><h4>提示词</h4><p class="scene-diary-muted">这里只编辑模型角色定义。输入和 JSON 协议由插件附加；记忆提取仅使用本幕对话，日记与成长附加角色设定。</p><label>日记提示词<textarea data-setting="promptDiary" rows="5"></textarea></label><label>记忆提示词<textarea data-setting="promptMemory" rows="5"></textarea></label><label>角色成长提示词<textarea data-setting="promptGrowth" rows="8"></textarea></label><label>记忆整理系统提示词<textarea data-setting="promptMaintenance" rows="7"></textarea></label><p class="scene-diary-muted">整理只读取已保存记忆与关联。系统指导可自定义，JSON 协议与候选范围由插件附加。本次整理设置冻结，新设置在下一次整理生效。</p><button data-action="save-settings">保存当前聊天设置</button><button data-action="reset-prompts">恢复默认提示词</button></section><section data-page="debug" hidden><p data-debug></p><div data-debug-list></div></section>`;
    panel.querySelector('[data-page=memory]').insertAdjacentHTML('beforeend', `<section class="scene-diary-maintenance"><h4>聊天内容备份与恢复</h4><p class="scene-diary-muted">备份当前聊天所有可见日记、角色成长和记忆内容。恢复时三项内容会一起替换，请先保存当前备份。</p><div class="scene-diary-actions"><button data-action="export-content">备份当前聊天内容</button></div><label>从备份恢复日记、角色成长和记忆<input type="file" accept="application/json" data-content-import></label><button data-action="recover-save" hidden>恢复未完成的保存</button><p data-maintenance-size class="scene-diary-muted"></p></section>`);
    panel.querySelector('[data-page=settings]').insertAdjacentHTML('beforeend', `
        <h4>可选向量召回</h4><p>记忆文本会发送至独立向量服务；浏览器直连需要服务允许跨域。</p>
        <label><input type="checkbox" data-semantic="enabled">启用向量召回</label>
        <label>完整 embeddings 地址<input data-semantic="endpoint" type="url"></label><label>向量模型<input data-semantic="model"></label>
        <label>维度（可留空）<input data-semantic="dimensions" type="number" min="1"></label>
        <label>向量服务密钥<input data-semantic-key type="password" autocomplete="off"></label>
        <label><input type="checkbox" data-semantic-remember>在此账户的浏览器设置中记住向量密钥</label>
        <button data-action="clear-semantic-key">清除已保存向量密钥</button><button data-action="rebuild-vectors">重建缺失向量</button>
        <h4>专用模型重排</h4><p class="scene-diary-muted">可单独启用，使用独立重排服务；浏览器直连需要服务允许跨域。</p>
        <label><input type="checkbox" data-semantic="rerank">启用模型重排</label>
        <label>完整 rerank 地址<input data-semantic="rerankEndpoint" type="url"></label><label>重排模型<input data-semantic="rerankModel"></label>
        <label>重排服务密钥<input data-rerank-key type="password" autocomplete="off"></label>
        <label><input type="checkbox" data-rerank-remember>在此账户的浏览器设置中记住重排密钥</label>
        <button data-action="clear-rerank-key">清除已保存重排密钥</button><p>本地保存的密钥可被同源脚本读取。</p>`);
    panel.querySelector('[data-setting=recallMessageCount]').closest('label').remove();
    panel.querySelector('[data-setting=memoryTokenBudget]').closest('label').insertAdjacentHTML('beforebegin', '<label>最低召回分数<input data-setting="recallScoreThreshold" type="number" min="0" max="1" step="0.01" required></label><p class="scene-diary-muted">默认 0.30，低于此分数的普通记忆不作为召回种子；设为 0 可关闭截断。最多召回组数是容量上限。合并组超过两个种子时只保留种子。常驻记忆不受分数阈值限制。</p>');
    panel.querySelector('[data-setting=recallLimit]').closest('label').insertAdjacentHTML('beforebegin', '<p class="scene-diary-muted">记忆召回读取整个聊天最近三条有效消息：按时间顺序合并为同一个查询，允许跨幕。关联组占一个名额，整组遵守 token 预算。</p>');
    document.body.append(panel);
    bar.addEventListener('click', event => { const action = event.target.closest('[data-action]')?.dataset.action; if (action === 'open') { panel.hidden = false; render(); fillSettings(); } if (action === 'end') void closeAct(); });
    panel.addEventListener('click', handlePanelClick);
    panel.querySelector('[data-content-import]').addEventListener('change', event => { if (!disabledReason) void importContent(event.target.files?.[0]); event.target.value = ''; });
    panel.addEventListener('input', event => { if (event.target.matches('[data-memory-search],[data-memory-category]')) renderMemories(getState()); if (event.target.matches('[data-growth-editor]')) { const count = panel.querySelector('[data-growth-count]'); if (count) count.textContent = `${event.target.value.length} / ${getState()?.settings.maxGrowthChars || 4000} 字符`; } if (event.target.matches('[data-preview]')) savePreviewField(event.target); if (event.target.matches('[data-candidate-field]')) editCandidate(event.target); if (event.target.matches('[data-maintenance-field]')) editMaintenance(event.target); });
}

function savePreviewField(field) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction || disabledReason) return; if (field.dataset.preview === 'title' && transaction.results.diary.status === 'success') transaction.results.diary.value.title = field.value; if (field.dataset.preview === 'diary' && transaction.results.diary.status === 'success') transaction.results.diary.value.diary = field.value; if (field.dataset.preview === 'growth' && transaction.results.growth.status === 'success') { transaction.results.growth.generatedValue ??= transaction.results.growth.value; transaction.results.growth.value = field.value; } setState(state); }

function handlePanelClick(event) {
    const target = event.target.closest('[data-action]'), action = target?.dataset.action, panel = document.querySelector(`#${PANEL}`);
    if (pendingSave && action && !['open', 'close', 'export-content'].includes(action)) { notify('warning', '正在核验保存，请稍后操作。'); return; }
    if (disabledReason && action && !['close', 'export-content', 'recover-save', 'clear-semantic-key', 'clear-rerank-key'].includes(action)) { notify('warning', disabledReason); return; }
    if (action === 'close') panel.hidden = true;
    if (action === 'end') void closeAct();
    if (action === 'takeover') takeOver(0);
    if (action === 'retry-part') retryClosePart(target.dataset.kind);
    if (action === 'regenerate-memory') retryClosePart('memory');
    if (action === 'confirm') { panel.querySelectorAll('[data-candidate-field]').forEach(editCandidate); void confirmClose(); }
    if (action === 'cancel-close') cancelClose();
    if (action === 'skip') skipExtraction(target.dataset.id);
    if (action === 'organize-memory') void startMaintenance(panel.querySelector('[data-organization-mode]').value).catch(error => notify('error', error.message));
    if (action === 'retry-maintenance') void runMaintenance(target.dataset.transactionId).catch(error => notify('error', error.message));
    if (action === 'cancel-maintenance') cancelMaintenance();
    if (action === 'confirm-maintenance') { panel.querySelectorAll('[data-maintenance-field]').forEach(editMaintenance); void confirmMaintenance(); }
    if (action === 'confirm-maintenance-partial') { panel.querySelectorAll('[data-maintenance-field]').forEach(editMaintenance); void confirmMaintenance(true); }
    if (action === 'retry-rejected-maintenance') {
        const state = getState(), tx = state?.maintenanceTransaction;
        if (tx?.version === 2 && tx.status === 'preview' && !pendingSave && !disabledReason) {
            tx.tasks.filter(task => task.rejected?.length).forEach(task => { task.status = 'pending'; });
            tx.status = 'ready'; setState(state); void runMaintenance(tx.id);
        }
    }
    if (action === 'open-related') { const state = getState(); panel.querySelector('[data-memory-search]').value = ''; panel.querySelector('[data-memory-category]').value = ''; renderMemories(state); const entry = [...panel.querySelectorAll('[data-memory-id]')].find(item => item.dataset.memoryId === target.dataset.relatedId); if (entry) { entry.open = true; entry.scrollIntoView({ block: 'nearest' }); } }
    if (action === 'unlink-memory') void commitMemoryMutation(draft => { draft.memoryLinks = draft.memoryLinks.filter(link => !(link.a === target.dataset.linkA && link.b === target.dataset.linkB)); });
    if (action === 'save-growth') saveGrowth(panel);
    if (action === 'new-memory') { draftMemory ||= normalizeMemory({ title: '新记忆（未保存）', content: '', edited: true, locked: true }); panel.querySelector('[data-memory-search]').value = ''; panel.querySelector('[data-memory-category]').value = ''; renderMemories(getState()); }
    if (action === 'save-memory') { try { saveMemory(target); } catch (error) { notify('error', `记忆未保存：${error.message}`); } }
    if (action === 'delete-memory') { const id = target.closest('[data-memory-id]')?.dataset.memoryId; if (id === draftMemory?.id) { draftMemory = null; renderMemories(getState()); } else if (id) void commitMemoryMutation(draft => { draft.memories = draft.memories.filter(memory => memory.id !== id); }); }
    if (action === 'save-diary') { const entry = target.closest('.scene-diary-entry'), state = getState(), id = +entry?.querySelector('[data-diary-id]')?.dataset.diaryId, act = findAct(state, id); if (act) { act.diary = entry.querySelector('textarea').value.trim(); acknowledgeActReview(act, messagesFor(act.id)); setState(state); void saveState(state); render(state); } }
    if (action === 'save-settings') saveChatSettings(panel);
    if (action === 'export-content') exportContent();
    if (action === 'recover-save') void recoverSave();
    if (action === 'clear-semantic-key') { semanticKey = ''; ctx().accountStorage?.removeItem('scene_diary_embedding_key'); panel.querySelector('[data-semantic-key]').value = ''; notify('success', '已清除向量密钥。'); }
    if (action === 'clear-rerank-key') { rerankKey = ''; ctx().accountStorage?.removeItem('scene_diary_rerank_key'); panel.querySelector('[data-rerank-key]').value = ''; notify('success', '已清除重排密钥。'); }
    if (action === 'rebuild-vectors') void syncVectors(getState()).then(() => notify('success', '向量已更新。')).catch(error => notify('error', error.message));
    if (action === 'reset-prompts') { panel.querySelector('[data-setting=promptDiary]').value = DEFAULT_DIARY_PROMPT; panel.querySelector('[data-setting=promptMemory]').value = DEFAULT_MEMORY_PROMPT; panel.querySelector('[data-setting=promptGrowth]').value = DEFAULT_GROWTH_PROMPT; panel.querySelector('[data-setting=promptMaintenance]').value = DEFAULT_MAINTENANCE_PROMPT; }
    const tab = event.target.closest('[data-tab]')?.dataset.tab; if (tab) { panel.querySelectorAll('[data-page]').forEach(page => page.hidden = page.dataset.page !== tab); if (tab === 'debug') renderDebug(panel); }
}

function saveGrowth(panel) { const state = getState(); if (!state) return; const content = panel.querySelector('[data-growth-editor]').value.trim(); if (content.length > state.settings.maxGrowthChars) { notify('error', `角色成长不能超过 ${state.settings.maxGrowthChars} 字符。`); return; } const time = localTime(); state.characterGrowth = { ...state.characterGrowth, content, createdAt: state.characterGrowth.createdAt || (content ? time.timestamp : null), updatedAt: time.timestamp, timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, edited: true, reviewRecommended: false }; state.takeoverNotice = false; setState(state); void saveState(state); render(state); notify('success', '角色成长已保存并会在后续生成中注入。'); }
async function commitMemoryMutation(mutate) {
    if (pendingSave || disabledReason) return;
    const key = activeChatKey, state = getState(); if (!state) return;
    const revision = state.memoryRevision, draft = structuredClone(state); mutate(draft);
    draft.memoryLinks = normalizeMemoryLinks(draft.memoryLinks, draft.memories); draft.memoryRevision++;
    pendingSave = true; let applied = false;
    try {
        await preserveRecovery(draft, key);
        if (key !== activeChatKey || key !== String(ctx().chatId)) return;
        const latest = getState(); if (latest.memoryRevision !== revision) throw new Error('记忆库已变化，请重试');
        Object.assign(latest, { memories: draft.memories, memoryLinks: draft.memoryLinks, memoryRevision: draft.memoryRevision });
        setState(latest); applied = true; saveUnverified = true; await preserveRecovery(latest, key);
        await saveState(latest, key, true); await clearRecovery(latest, key);
        if (key !== activeChatKey) return;
        saveUnverified = false; recallCache.clear(); render(latest); notify('success', '记忆变更已保存。');
        void syncVectors(latest).catch(error => notify('warning', `向量更新失败：${error.message}`));
    } catch (error) {
        if (key !== activeChatKey) return;
        if (applied) { disabledReason = '记忆保存尚未核验，请恢复未完成的保存。'; showSaveError(error); }
        else { await clearRecovery(draft, key).catch(() => {}); notify('error', `记忆未提交：${error.message}`); }
        render(getState());
    } finally { pendingSave = false; }
}
function saveMemory(target) {
    const entry = target.closest('[data-memory-id]'), state = getState(), memory = state?.memories.find(item => item.id === entry?.dataset.memoryId) || (draftMemory?.id === entry?.dataset.memoryId ? draftMemory : null); if (!memory) return;
    const value = field => entry.querySelector(`[data-memory-field=${field}]`);
    const checked = validateMemoryFormat({ ...memory, title: value('title').value.trim(), content: value('content').value.trim(), category: value('category').value, importance: +value('importance').value, storyTime: value('storyTime').value.trim() || null }, { extendedArrays: true });
    for (const field of ['locked', 'permanent']) checked[field] = value(field).checked;
    acknowledgeMemoryReview(checked); void commitMemoryMutation(draft => { if (draft.memories.some(item => item.id === checked.id)) draft.memories = draft.memories.map(item => item.id === checked.id ? checked : item); else draft.memories.unshift(checked); }).then(() => { if (draftMemory?.id === checked.id && getState()?.memories.some(item => item.id === checked.id)) { draftMemory = null; renderMemories(getState()); } });
}
function downloadJson(payload, name) { const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function exportContent() { const state = getState(); if (state) downloadJson(createContentBackup(state, activeChatKey), `scene-diary-content-${activeChatKey}.json`); }
async function importContent(file) {
    if (!file || pendingSave || disabledReason) return;
    try {
        const state = getState(), key = activeChatKey;
        if (!state) return;
        const backup = JSON.parse(await file.text());
        if (key !== activeChatKey || key !== String(ctx().chatId)) throw new Error('读取备份期间聊天已切换');
        const restored = restoreContentBackup(state, backup, key);
        if (!confirm(`将用备份中的 ${backup.diaries.length} 篇日记、角色成长和 ${backup.memories.length} 条记忆一起替换当前聊天对应内容。建议先导出当前备份。确定恢复吗？`)) return;
        if (key !== activeChatKey || state.lastUpdatedAt !== getState()?.lastUpdatedAt) throw new Error('当前聊天内容已变化，请重新选择备份');
        await preserveRecovery(restored, key); setState(restored);
        try { await saveState(restored, key, true); await clearRecovery(restored, key); }
        catch (error) { saveUnverified = true; disabledReason = '恢复内容尚未核验，请使用“恢复未完成的保存”。'; render(restored); throw error; }
        recallCache.clear(); render(restored); notify('success', '日记、角色成长和记忆已一起恢复。');
    } catch (error) { notify('error', `恢复备份失败：${error.message}`); }
}
async function recoverSave() {
    const key = activeChatKey;
    if (migrationSaving.has(key) || pendingSave) return;
    const current = getState(); if (!current) return;
    pendingSave = true;
    try {
        const raw = await SillyTavern.libs.localforage.getItem(recoveryKey(current, key));
        if (key !== activeChatKey || String(ctx().chatId) !== key) return;
        if (!raw) { notify('info', '没有未核验的本地恢复副本。'); return; }
        const saved = normalizeState(raw), latest = getState();
        if (saved.currentActId !== latest?.currentActId || saved.memorySpaceId !== latest?.memorySpaceId) throw new Error('当前幕或记忆空间与恢复副本不一致');
        setState(saved); await saveState(saved, key, true); await clearRecovery(saved, key);
        if (key !== activeChatKey) return;
        migrationRecoveries.delete(key); saveUnverified = false; disabledReason = ''; render(saved); notify('success', '已核验恢复副本。');
    } catch (error) { if (key === activeChatKey) notify('error', `恢复失败：${error.message}`); }
    finally { pendingSave = false; }
}
function readPairEditor(panel, key) { const lines = selector => (panel.querySelector(selector)?.value || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean), opens = lines(`[data-pair-open="${key}"]`), closes = lines(`[data-pair-close="${key}"]`); if (opens.length !== closes.length) throw new Error(`${key} 的开始标签与结束标签数量必须一致。`); return opens.map((open, index) => { const pair = validateTagPair({ open, close: closes[index] }); if (!pair) throw new Error(`${key} 第 ${index + 1} 组标签无效或名称不一致。`); return pair; }); }
function saveChatSettings(panel) {
    const state = getState(); if (!state) return;
    try {
        const settings = structuredClone(state.settings);
        settings.diaryConnectionProfile = panel.querySelector('[data-setting=diaryConnectionProfile]').value;
        settings.memoryConnectionProfile = panel.querySelector('[data-setting=memoryConnectionProfile]').value;
        settings.maintenanceConnectionProfile = panel.querySelector('[data-setting=maintenanceConnectionProfile]').value;
        const candidateLimit = +panel.querySelector('[data-setting=maintenanceCandidateLimit]').value, maintenanceThreshold = panel.querySelector('[data-setting=maintenanceScoreThreshold]').value.trim();
        if (!Number.isInteger(candidateLimit) || candidateLimit < 1 || candidateLimit > 60 || !maintenanceThreshold || !Number.isFinite(+maintenanceThreshold) || +maintenanceThreshold < 0 || +maintenanceThreshold > 1) throw new Error('整理候选数量须为 1–60 的整数，最低相关分数须为 0–1。');
        settings.maintenanceCandidateLimit = candidateLimit; settings.maintenanceScoreThreshold = +maintenanceThreshold;
        for (const key of ['recallLimit', 'memoryTokenBudget', 'recentDiaryCount']) settings[key] = +panel.querySelector(`[data-setting="${key}"]`).value;
        const threshold = panel.querySelector('[data-setting=recallScoreThreshold]').value.trim();
        if (!threshold || !Number.isFinite(+threshold) || +threshold < 0 || +threshold > 1) throw new Error('最低召回分数须为 0–1 之间的数值。');
        settings.recallScoreThreshold = +threshold;
        settings.extraction ||= {};
        for (const key of ['character.bodyTagPairs', 'user.bodyTagPairs', 'character.storyTimeTagPairs', 'user.storyTimeTagPairs']) { const [who, field] = key.split('.'); settings.extraction[who] ||= {}; settings.extraction[who][field] = readPairEditor(panel, key); }
        settings.prompts = { diary: panel.querySelector('[data-setting=promptDiary]').value.trim() || DEFAULT_DIARY_PROMPT, memory: panel.querySelector('[data-setting=promptMemory]').value.trim() || DEFAULT_MEMORY_PROMPT, growth: panel.querySelector('[data-setting=promptGrowth]').value.trim() || DEFAULT_GROWTH_PROMPT, maintenance: panel.querySelector('[data-setting=promptMaintenance]').value.trim() || DEFAULT_MAINTENANCE_PROMPT };
        settings.semantic = { enabled: panel.querySelector('[data-semantic=enabled]').checked, endpoint: panel.querySelector('[data-semantic=endpoint]').value.trim(), model: panel.querySelector('[data-semantic=model]').value.trim(), dimensions: panel.querySelector('[data-semantic=dimensions]').value || null, rerank: panel.querySelector('[data-semantic=rerank]').checked, rerankEndpoint: panel.querySelector('[data-semantic=rerankEndpoint]').value.trim(), rerankModel: panel.querySelector('[data-semantic=rerankModel]').value.trim() };
        if (settings.semantic.enabled) { if (!settings.semantic.model) throw new Error('请填写向量模型。'); validateSemanticEndpoint(settings.semantic.endpoint); }
        if (settings.semantic.rerank) { if (!settings.semantic.rerankModel) throw new Error('请填写重排模型。'); validateSemanticEndpoint(settings.semantic.rerankEndpoint, '重排'); }
        semanticKey = panel.querySelector('[data-semantic-key]').value;
        rerankKey = panel.querySelector('[data-rerank-key]').value;
        if (panel.querySelector('[data-semantic-remember]').checked && ctx().accountStorage) ctx().accountStorage.setItem('scene_diary_embedding_key', semanticKey); else ctx().accountStorage?.removeItem('scene_diary_embedding_key');
        if (panel.querySelector('[data-rerank-remember]').checked && ctx().accountStorage) ctx().accountStorage.setItem('scene_diary_rerank_key', rerankKey); else ctx().accountStorage?.removeItem('scene_diary_rerank_key');
        state.settings = normalizeSettings(settings); recallCache.clear(); setState(state);
        void saveState(state).then(() => notify('success', '当前聊天设置已保存。')).catch(error => notify('error', error.message)); render(state);
    } catch (error) { notify('error', error.message || String(error)); }
}
function renderDebug(panel) {
    const state = getState(), output = panel.querySelector('[data-debug-list]');
    panel.querySelector('[data-debug]').textContent = disabledReason || `当前幕 ${state?.currentActId || '-'} · 记忆库 ${state?.memories.length || 0} 条`;
    output.innerHTML = renderRecallDiagnostics(lastRecallTrace, lastContinuity) + (state?.maintenanceTransaction?.version === 2 ? '<h4>记忆整理诊断</h4>' + maintenanceDiagnostics(state.maintenanceTransaction) : '');
}
function fillSettings() {
    const panel = document.querySelector(`#${PANEL}`), state = getState(); if (!panel || !state) return;
    for (const key of ['recallLimit', 'recallScoreThreshold', 'memoryTokenBudget', 'recentDiaryCount']) panel.querySelector(`[data-setting="${key}"]`).value = state.settings[key];
    for (const key of ['character.bodyTagPairs', 'user.bodyTagPairs', 'character.storyTimeTagPairs', 'user.storyTimeTagPairs']) { const [who, field] = key.split('.'), pairs = state.settings.extraction[who][field] || [], open = panel.querySelector(`[data-pair-open="${key}"]`), close = panel.querySelector(`[data-pair-close="${key}"]`); if (open) open.value = pairs.map(item => item.open).join('\n'); if (close) close.value = pairs.map(item => item.close).join('\n'); }
    panel.querySelector('[data-setting=promptDiary]').value = state.settings.prompts.diary || DEFAULT_DIARY_PROMPT;
    panel.querySelector('[data-setting=promptMemory]').value = state.settings.prompts.memory || DEFAULT_MEMORY_PROMPT;
    panel.querySelector('[data-setting=promptGrowth]').value = state.settings.prompts.growth || DEFAULT_GROWTH_PROMPT;
    panel.querySelector('[data-setting=promptMaintenance]').value = state.settings.prompts.maintenance || DEFAULT_MAINTENANCE_PROMPT;
    panel.querySelector('[data-setting=maintenanceCandidateLimit]').value = state.settings.maintenanceCandidateLimit;
    panel.querySelector('[data-setting=maintenanceScoreThreshold]').value = state.settings.maintenanceScoreThreshold;
    for (const field of ['enabled', 'endpoint', 'model', 'dimensions', 'rerank', 'rerankEndpoint', 'rerankModel']) { const input = panel.querySelector(`[data-semantic="${field}"]`); if (input.type === 'checkbox') input.checked = !!state.settings.semantic[field]; else input.value = state.settings.semantic[field] ?? ''; }
    const stored = ctx().accountStorage?.getItem('scene_diary_embedding_key'), storedRerank = ctx().accountStorage?.getItem('scene_diary_rerank_key');
    panel.querySelector('[data-semantic-key]').value = semanticKey || stored || '';
    panel.querySelector('[data-semantic-remember]').checked = !!stored;
    panel.querySelector('[data-rerank-key]').value = rerankKey || storedRerank || '';
    panel.querySelector('[data-rerank-remember]').checked = !!storedRerank;
}
function bind() { const eventSource = source(), eventTypes = types(); if (!eventSource?.on) return; eventSource.on(eventTypes.MESSAGE_SENT || 'message_sent', sent); eventSource.on(eventTypes.MESSAGE_RECEIVED || 'message_received', received); eventSource.on(eventTypes.MESSAGE_EDITED || 'message_edited', changed); eventSource.on(eventTypes.MESSAGE_UPDATED || 'message_updated', changed); eventSource.on(eventTypes.MESSAGE_DELETED || 'message_deleted', deleted); eventSource.on(eventTypes.MESSAGE_SWIPED || 'message_swiped', changed); eventSource.on(eventTypes.CHAT_CHANGED || 'chat_id_changed', initializeChat); eventSource.on(eventTypes.CHAT_LOADED || 'chatLoaded', initializeChat); eventSource.on(eventTypes.CHAT_COMPLETION_PROMPT_READY || 'chat_completion_prompt_ready', promptReady); eventSource.on(eventTypes.GENERATION_STOPPED || 'generation_stopped', stopRecall); }
function init() { if (initialized) return; initialized = true; createUi(); if (!document.getElementById(BAR)) setTimeout(() => { createUi(); initializeChat(); fillSettings(); }, 800); bind(); initializeChat(); fillSettings(); globalThis.sceneDiary = { version: '0.3.6', getState, closeAct, confirmClose, takeOver, startMaintenance, confirmMaintenance }; console.info(`[${NAME}] loaded`); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
