import { extension_prompt_roles, extension_prompt_types, setExtensionPrompt } from '../../../../script.js';
import { getContext } from '../../../st-context.js';
import { checkService, serviceRequest } from './service.js';
import {
    SCHEMA_VERSION, STORAGE_KEY, DEFAULT_SETTINGS, DEFAULT_DIARY_PROMPT, DEFAULT_MEMORY_PROMPT, DEFAULT_GROWTH_PROMPT,
    MEMORY_CATEGORIES, acknowledgeActReview, acknowledgeMemoryReview, assignMessageToAct, beginNextAct,
    buildCharacterContext, buildContinuityBlock, buildDialogue, buildDiaryPrompt, buildGrowthPrompt, buildMemoryPrompt, buildGrowthBlock, buildDiaryBlock, fingerprint,
    buildRecallQuery, canSetMemoryPermanent, createState, currentAct, estimateTokens, extractMessage, filterPromptMessages, findAct,
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
let libraryReady = null, recallContent = '', memoryPage = { items: [], total: 0, page: 0 }, serviceStatus = 'checking';
let pendingUndo = null;
let libraryOpening = null;
let legacyDraft = null;
let recallController = null;

const ctx = () => getContext();
const chat = () => ctx().chat || [];
const meta = () => ctx().chatMetadata || {};
const types = () => ctx().eventTypes || {};
const source = () => ctx().eventSource;
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function notify(type, message) { const handler = globalThis.toastr?.[type]; handler ? handler(message, NAME) : console[type === 'error' ? 'error' : 'log'](`[${NAME}] ${message}`); }
function hasSp() { return !!globalThis.AutoCardUpdaterAPI; }
function globalSettings() { const all = ctx().extensionSettings || {}; all.scene_diary ||= structuredClone(DEFAULT_SETTINGS); return normalizeSettings(all.scene_diary); }
function getState() { const raw = meta()[STORAGE_KEY]; if (!raw) return null; if (raw.version === SCHEMA_VERSION && raw.characterGrowth) return raw; migrationPending = true; const state = normalizeState(raw); meta()[STORAGE_KEY] = state; return state; }
function setState(state) { state.lastUpdatedAt = Date.now(); meta()[STORAGE_KEY] = state; return state; }
async function saveState(state = getState(), key = activeChatKey) { if (!state || key !== activeChatKey || String(ctx().chatId) !== String(key)) return false; await (ctx().saveMetadata || ctx().saveChat)?.(); migrationPending = false; return true; }
function clearPrompts() { for (const key of [DIARY_KEY, MEMORY_KEY]) setExtensionPrompt(key, '', extension_prompt_types.NONE, 0, false, extension_prompt_roles.SYSTEM); }
async function openLibrary(state) {
    if (!state) throw new Error('当前聊天尚未接管');
    if (libraryReady?.chatKey === activeChatKey && libraryReady?.libraryId === state.libraryId) return libraryReady;
    await checkService();
    const retained = chat().filter(isNormalRpMessage).map(message => { const extracted = extractMessage(message.mes, message.is_user ? state.settings.extraction.user : state.settings.extraction.character); return { messageId: message.extra?.scene_diary?.messageId, hash: fingerprint(extracted.body), contentHash: fingerprint(message.mes) }; }).filter(item => item.messageId);
    const result = await serviceRequest('/libraries/open', { chatKey: activeChatKey, parentChatKey: meta().main_chat || undefined, retained, libraryId: state.libraryId || undefined, legacy: state.libraryId || meta().main_chat ? undefined : { memories: state.memories, acts: state.acts, characterGrowth: state.characterGrowth } });
    if (String(ctx().chatId) !== activeChatKey) throw new Error('聊天已切换');
    state.libraryId = result.libraryId; state.libraryRevision = result.revision; state.memories = []; state.version = SCHEMA_VERSION;
    if (result.forkSnapshot?.acts?.length) { state.acts = result.forkSnapshot.acts; state.currentActId = state.acts.at(-1).id; state.status = state.acts.at(-1).status === 'closed' ? 'pending_next_act' : 'active'; state.characterGrowth = result.forkSnapshot.growth || createState().characterGrowth; }
    libraryReady = { chatKey: activeChatKey, libraryId: result.libraryId }; serviceStatus = 'ready'; disabledReason = '';
    setState(state); await saveState(state); if (result.imported && !state.migrationNoticeShown) { state.migrationNoticeShown = true; notify('info', '旧记忆已迁移。常驻记忆现在计入长期记忆预算；建议查看记忆库并导出完整备份。'); setState(state); await saveState(state); } return libraryReady;
}
async function ensureLibrary(state = getState()) {
    if (libraryReady?.chatKey === activeChatKey && libraryReady?.libraryId === state?.libraryId) return libraryReady;
    if (libraryOpening?.chatKey === activeChatKey) return libraryOpening.promise;
    const chatKey = activeChatKey, promise = openLibrary(state).finally(() => { if (libraryOpening?.chatKey === chatKey) libraryOpening = null; });
    libraryOpening = { chatKey, promise }; return promise;
}
async function loadMemoryPage(page = 0) {
    const state = getState(), chatKey = activeChatKey; if (!state) return;
    await ensureLibrary(state);
    const result = await serviceRequest('/libraries/query', { libraryId: state.libraryId, page, pageSize: 30, query: document.querySelector('[data-memory-search]')?.value || '', category: document.querySelector('[data-memory-category]')?.value || '', lifecycle: document.querySelector('[data-memory-lifecycle]')?.value || '', entityQuery: document.querySelector('[data-memory-entity-query]')?.value || '' });
    if (chatKey !== activeChatKey) return;
    memoryPage = result;
    renderMemories(state);
}
function compatible() { if (hasSp()) { disabledReason = '检测到 SP·数据库：scene&diary 不支持同时启用。请停用 SP 后刷新。'; clearPrompts(); return false; } return true; }
function messagesFor(actId) { return chat().filter(message => +message.extra?.scene_diary?.actId === +actId && isNormalRpMessage(message)); }

function initializeChat() {
    if (!ctx().chatId || ctx().groupId) { disabledReason = 'scene&diary v0.3 只支持单角色聊天。'; clearPrompts(); render(); return null; }
    if (!compatible()) { render(); return null; }
    const key = String(ctx().chatId);
    if (key !== activeChatKey) { recallController?.abort(); activeChatKey = key; closingPromise = null; lastRecall = null; recallContent = ''; libraryReady = null; memoryPage = { items: [], total: 0, page: 0 }; migrationPending = false; clearPrompts(); }
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
    if (chat().filter(isNormalRpMessage).length > 1 && !meta().main_chat) { disabledReason = '这是已有聊天。请在管理面板选择“从此处接管”；建议先补写初始角色成长。'; render(); return null; }
    state = createState();
    state.settings = { ...globalSettings(), ...state.settings };
    if (!meta().main_chat) chat().forEach((message, index) => isNormalRpMessage(message) && assignMessageToAct(state, message, 1, index));
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
function changed(index) { const state = getState(), message = chat()[+index], actId = message?.extra?.scene_diary?.actId; if (state && actId && reviewSourceAct(state, actId)) { setState(state); void saveState(state); render(state); void invalidateSources(state, [message.extra?.scene_diary?.messageId]); } }
function deleted() { const state = getState(); if (!state) return; let didChange = false; for (const act of state.acts) didChange = reviewSourceAct(state, act.id) || didChange; if (didChange) { setState(state); void saveState(state); render(state); const remaining = new Set(chat().map(message => message.extra?.scene_diary?.messageId)); void invalidateSources(state, state.acts.flatMap(act => act.messageIds).filter(id => !remaining.has(id))); } }
async function invalidateSources(state, messageIds) { if (!messageIds.filter(Boolean).length) return; try { await ensureLibrary(state); const result = await serviceRequest('/libraries/sources-changed', { libraryId: state.libraryId, messageIds: messageIds.filter(Boolean) }); state.libraryRevision = result.revision; setState(state); await saveState(state); } catch (error) { notify('error', `记忆来源复核失败：${error.message}`); } }

function profileOptions(value) { try { return ['<option value="">沿用当前聊天连接</option>', ...(ctx().ConnectionManagerRequestService?.getSupportedProfiles?.() || []).map(profile => `<option value="${escape(profile.id)}" ${profile.id === value ? 'selected' : ''}>独立：${escape(profile.name)}</option>`)].join(''); } catch { return '<option value="">沿用当前聊天连接</option>'; } }
async function request(profile, prompt, responseLength = 1600) { if (profile) { const service = ctx().ConnectionManagerRequestService; if (!service?.sendRequest) throw new Error('连接管理器不可用。'); const output = await service.sendRequest(profile, prompt, responseLength, { stream: false, extractData: true, includePreset: false, includeInstruct: false }); return output?.content ?? output; } if (String(ctx().mainApi || '').toLowerCase() !== 'openai') throw new Error('辅助整理需要 Chat Completion，或选择独立连接。'); const output = await ctx().generateRawData({ prompt, api: 'openai', quietToLoud: true, responseLength }); return output?.content ?? output; }
function characterData() { const fields = ctx().getCharacterCardFields?.() || {}; return { char: ctx().name2 || fields.name || '角色', user: ctx().name1 || '玩家', context: buildCharacterContext({ description: fields.description, personality: fields.personality, scenario: fields.scenario }) }; }
const modelMessages = content => [{ role: 'system', content: '你只输出机器可解析 JSON。' }, { role: 'user', content }];
async function boundedModel(prompt, profile, timeoutMs = 1500) { let timer; try { return await Promise.race([request(profile, modelMessages(prompt), 800), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('模型增强超时')), timeoutMs); })]); } finally { clearTimeout(timer); } }
const parsedJson = raw => typeof raw === 'object' ? raw : JSON.parse(String(raw).replace(/^```(?:json)?\s*|\s*```$/g, '').trim());

async function generateClosePart(transaction, kind, settings) {
    const common = { characterName: transaction.character.char, userName: transaction.character.user, characterContext: transaction.character.context, dialogue: transaction.dialogue.text };
    if (kind === 'diary') { const prompt = modelMessages(buildDiaryPrompt({ ...common, targetLength: settings.diaryTargetLength, prompt: settings.prompts.diary })); return parseDiaryResponse(await request(settings.diaryConnectionProfile, prompt)); }
    if (kind === 'memory') {
        const prompt = modelMessages(buildMemoryPrompt({ ...common, prompt: settings.prompts.memory }));
        const candidates = parseMemoryResponse(await request(settings.memoryConnectionProfile || settings.diaryConnectionProfile, prompt), transaction.actId, transaction.sourceMessageIds);
        for (const candidate of candidates) { candidate.sources = candidate.sourceMessageIds.map(id => { const row = transaction.dialogue.rows.find(item => item.id === id); return row ? { actId: transaction.actId, messageId: id, hash: fingerprint(row.body), excerpt: row.body.slice(0, 180) } : null; }).filter(Boolean); if (candidate.category === 'promise') candidate.promiseStatus = candidate.status; if (!candidate.sources.length) throw new Error(`记忆“${candidate.title}”缺少可核验的原消息，请重新生成`); }
        const state = getState(), related = await serviceRequest('/libraries/maintenance', { libraryId: state.libraryId, candidates });
        const decisions = Array(candidates.length);
        related.forEach((item, index) => { if (item.truncated) decisions[index] = { index, action: 'conflict', reason: '相关旧记忆超过本批输入上限，需人工复核后再决定是否新增或替代' }; });
        const pending = candidates.map((candidate, index) => ({ candidate, index })).filter(item => !related[item.index].truncated).sort((a, b) => `${a.candidate.subjectId || ''}:${a.candidate.attribute || ''}`.localeCompare(`${b.candidate.subjectId || ''}:${b.candidate.attribute || ''}`));
        const overview = candidates.map((candidate, index) => ({ index, title: candidate.title, content: candidate.content.slice(0, 80) }));
        for (let start = 0; start < pending.length; start += 4) {
            const batch = pending.slice(start, start + 4);
            const context = batch.map(({ index }) => ({ index, candidate: related[index].candidate, related: related[index].related.map(item => ({ id: item.id, title: item.title, content: item.content.slice(0, 300), kind: item.kind, subjectId: item.subjectId, attribute: item.attribute, conditions: item.conditions, lifecycle: item.lifecycle, locked: item.locked, revision: item.revision })), knownEntities: related[index].knownEntities }));
            const instruction = `你是事实维护器。仅依据本幕候选与检索出的旧记忆，给本批每项候选选择 add（新记忆）、replace（明确替代旧事实）、evidence（同一事实补充证据）、progress（承诺进度变化）或 conflict（证据不足）。progress 只能指向旧承诺，并给出 promiseStatus：in_progress、completed 或 cancelled。条件例外用 add，并保留一般倾向。一次行为不能替代习惯。只能引用本批 related 内的旧记忆 id。每个实体可从 knownEntities 选已有 ID；同名实体不能仅凭名字合并。关系类型仅可用 involves、at、gifted_to、supports、updates、fulfills、related_event。关联已有记忆或实体用 toId；关联本幕另一条候选用 toCandidateIndex，且必须有证据。只返回 JSON：{"decisions":[{"index":0,"action":"add|replace|evidence|progress|conflict","targetId":"旧记忆ID或空","promiseStatus":"仅 progress 填写","reason":"简短理由","entities":[{"name":"名称","existingId":"可选旧实体ID"}],"links":[{"type":"related_event","toCandidateIndex":1}]}]}。本幕候选概览：${JSON.stringify(overview)}\n本批待处理：${JSON.stringify(context)}`;
            const result = parsedJson(await request(settings.memoryConnectionProfile || settings.diaryConnectionProfile, modelMessages(instruction), 1500)).decisions;
            if (!Array.isArray(result) || result.length !== batch.length) throw new Error('事实维护结果不完整');
            for (const item of result) { if (!batch.some(row => row.index === item.index) || decisions[item.index]) throw new Error('事实维护索引无效'); decisions[item.index] = item; }
        }
        const rows = candidates.map((candidate, index) => {
            const decision = decisions.find(item => item.index === index), available = related[index].related;
            if (!decision || !['add', 'replace', 'evidence', 'progress', 'conflict'].includes(decision.action)) throw new Error('事实维护操作无效');
            let target = available.find(item => item.id === decision.targetId);
            if (decision.action === 'add') { const duplicate = available.find(item => item.title === candidate.title && item.content === candidate.content); if (duplicate) { decision.action = 'evidence'; decision.targetId = duplicate.id; target = duplicate; } }
            if (decision.action !== 'add' && decision.action !== 'conflict' && !target) throw new Error('事实维护引用了不存在的旧记忆');
            const entityOperations = [], choices = Array.isArray(decision.entities) ? decision.entities : [];
            candidate.entityIds = [];
            for (const mention of candidate.entities) {
                const choice = choices.find(item => item.name === mention.name), existing = related[index].knownEntities.find(item => item.id === choice?.existingId && item.type === mention.type);
                if (existing) { candidate.entityIds.push(existing.id); continue; }
                const entity = { id: newId('entity'), type: mention.type, name: mention.name, aliases: [] };
                candidate.entityIds.push(entity.id); entityOperations.push({ type: 'add_entity', value: entity });
            }
            if (decision.action === 'progress' && (target?.category !== 'promise' || !['in_progress', 'completed', 'cancelled'].includes(decision.promiseStatus))) throw new Error('承诺进度变更无效');
            const operations = decision.action === 'add' ? [{ type: 'add_memory', value: candidate }] : decision.action === 'evidence' ? [{ type: 'add_evidence', targetId: target.id, expectedMemoryRevision: target.revision, value: { sources: candidate.sources } }] : decision.action === 'progress' ? [{ type: 'update_promise', targetId: target.id, expectedMemoryRevision: target.revision, value: { promiseStatus: decision.promiseStatus, sources: candidate.sources } }] : decision.action === 'replace' ? [{ type: 'update_memory', targetId: target.id, expectedMemoryRevision: target.revision, value: { lifecycle: 'superseded' } }, { type: 'add_memory', value: { ...candidate, supersedes: target.id } }] : [];
            if (decision.action === 'add' || decision.action === 'replace') {
                operations.unshift(...entityOperations);
                candidate.entities.forEach((mention, mentionIndex) => { const entityId = candidate.entityIds[mentionIndex]; if (entityId && candidate.kind === 'event') operations.push({ type: 'add_edge', value: { id: newId('edge'), type: mention.type === 'place' ? 'at' : 'involves', fromId: candidate.id, toId: entityId, sources: candidate.sources } }); });
                for (const link of Array.isArray(decision.links) ? decision.links : []) {
                    if (!['involves', 'at', 'gifted_to', 'supports', 'updates', 'fulfills', 'related_event'].includes(link.type)) continue;
                    if (![...available.map(item => item.id), ...candidate.entityIds].includes(link.toId)) continue;
                    operations.push({ type: 'add_edge', value: { id: newId('edge'), type: link.type, fromId: candidate.id, toId: link.toId, sources: candidate.sources } });
                }
            }
            return { candidate, decision, target, operations, _reject: decision.action === 'conflict' || !!target?.locked };
        });
        rows.forEach((item, index) => {
            if (!['add', 'replace'].includes(item.decision.action) || item._reject) return;
            for (const link of Array.isArray(item.decision.links) ? item.decision.links : []) {
                const other = rows[link.toCandidateIndex];
                if (!Number.isInteger(link.toCandidateIndex) || link.toCandidateIndex === index || !other || other._reject || !['add', 'replace'].includes(other.decision.action)) continue;
                if (!['involves', 'at', 'gifted_to', 'supports', 'updates', 'fulfills', 'related_event'].includes(link.type)) continue;
                item.operations.push({ type: 'add_edge', value: { id: newId('edge'), type: link.type, fromId: item.candidate.id, toId: other.candidate.id, sources: item.candidate.sources } });
            }
        });
        return rows;
    }
    const memoryChanges = (transaction.results.memory?.value || []).filter(item => !item._reject).map(item => `${item.decision.action}: ${item.candidate.title}：${item.candidate.content}`).join('\n');
    const prompt = modelMessages(`${buildGrowthPrompt({ ...common, currentGrowth: transaction.baseGrowth, targetLength: settings.growthTargetLength, prompt: settings.prompts.growth })}\n\n[本幕待确认记忆变化]\n${memoryChanges || '无'}\n[/本幕待确认记忆变化]`);
    return parseGrowthResponse(await request(settings.diaryConnectionProfile, prompt, 2400), settings.maxGrowthChars);
}

async function runCloseParts(transactionId, kinds) {
    const before = getState(), transaction = before?.pendingTransaction;
    if (!transaction || transaction.id !== transactionId) return;
    for (const kind of kinds) transaction.results[kind] = { status: 'pending' };
    setState(before); await saveState(before); render(before);
    const first = kinds.filter(kind => kind !== 'growth'), settled = await Promise.allSettled(first.map(async kind => ({ kind, value: await generateClosePart(transaction, kind, before.settings) })));
    if (String(ctx().chatId) !== activeChatKey) return;
    const state = getState(), current = state?.pendingTransaction;
    if (!current || current.id !== transactionId) return;
    settled.forEach((result, index) => { const kind = first[index]; current.results[kind] = result.status === 'fulfilled' ? { status: 'success', value: result.value.value } : { status: 'error', error: result.reason?.message || String(result.reason) }; });
    if (kinds.includes('growth')) { try { if (current.results.memory.status !== 'success') throw new Error('请先修复记忆整理'); current.results.growth = { status: 'success', value: await generateClosePart(current, 'growth', before.settings) }; } catch (error) { current.results.growth = { status: 'error', error: error.message }; } }
    state.status = 'preview'; setState(state); await saveState(state); render(state);
    const failures = kinds.filter(kind => current.results[kind].status === 'error');
    if (failures.length) notify('error', `${failures.map(kindLabel).join('、')}生成失败；成功部分已保留，可单独重试。`); else notify('success', '日记、记忆与角色成长已生成，请预览确认。');
}

function kindLabel(kind) { return ({ diary: '日记', memory: '记忆', growth: '角色成长' })[kind] || kind; }
async function closeAct() {
    if (closingPromise) return closingPromise;
    const state = getState(), act = currentAct(state);
    if (!state || !act || state.status !== 'active' || !compatible()) return;
    try { await ensureLibrary(state); } catch (error) { disabledReason = `记忆服务不可用：${error.message}`; render(state); return; }
    const sourceMessages = messagesFor(act.id), character = characterData(), dialogue = buildDialogue(sourceMessages, state.settings.extraction, character.char, character.user);
    if (dialogue.errors.length) { state.drafts = [{ kind: 'extraction-errors', actId: act.id, errors: dialogue.errors, createdAt: Date.now() }]; setState(state); await saveState(state); render(state); notify('error', '正文标签无法匹配：请在“当前幕”检查并修正规则，或明确跳过楼层。'); return; }
    if (!sourceMessages.length) { notify('info', '当前幕还没有可整理内容。'); return; }
    const transaction = { id: newId('close'), actId: act.id, libraryRevision: state.libraryRevision, sourceFingerprint: sourceFingerprint(sourceMessages), sourceMessageIds: sourceMessages.map(message => message.extra.scene_diary.messageId), extraction: structuredClone(state.settings.extraction), startedAt: Date.now(), dialogue, character, baseGrowth: state.characterGrowth.content, growthRevision: state.characterGrowth.revision, results: { diary: { status: 'pending' }, memory: { status: 'pending' }, growth: { status: 'pending' } } };
    state.status = 'closing'; act.status = 'closing'; state.pendingTransaction = transaction; setState(state); await saveState(state); render(state);
    closingPromise = runCloseParts(transaction.id, ['diary', 'memory', 'growth']).finally(() => closingPromise = null);
    return closingPromise;
}

function retryClosePart(kind) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction || !['diary', 'memory', 'growth'].includes(kind) || transaction.results[kind]?.status === 'pending') return; if (kind === 'memory') { transaction.results.growth = { status: 'error', error: '记忆已重新整理，请重新生成角色成长。' }; setState(state); } void runCloseParts(transaction.id, [kind]); }
function allPartsReady(transaction) { return ['diary', 'memory', 'growth'].every(kind => transaction?.results?.[kind]?.status === 'success'); }

async function confirmClose() {
    const state = getState(), transaction = state?.pendingTransaction, act = transaction && findAct(state, transaction.actId);
    if (!state || state.status !== 'preview' || !transaction || !act || !allPartsReady(transaction)) { notify('error', '日记、记忆和角色成长必须全部生成成功后才能确认关幕。'); return; }
    const sourceMessages = messagesFor(act.id), fresh = sourceFingerprint(sourceMessages);
    if (fresh !== transaction.sourceFingerprint) { notify('error', '本幕内容已变更，请重新整理预览。'); return; }
    if (state.characterGrowth.revision !== transaction.growthRevision) { notify('error', '角色成长已被修改，请重新整理预览。'); return; }
    const growthContent = String(transaction.results.growth.value || '').trim();
    if (!growthContent || growthContent.length > state.settings.maxGrowthChars) { notify('error', `角色成长必须为 1–${state.settings.maxGrowthChars} 个字符。`); return; }
    const diary = transaction.results.diary.value, nextAct = { ...act, status: 'closed', closedAt: Date.now(), title: diary.title, diary: diary.diary, endMessageIndex: sourceMessages.at(-1)?.extra?.scene_diary?.messageIndex ?? null, endSceneTime: transaction.dialogue.rows.map(row => row.storyTime).filter(Boolean).at(-1) || null, sourceFingerprint: fresh, revision: act.revision + 1, dirty: false };
    const time = localTime(), generatedGrowth = transaction.results.growth.generatedValue ?? transaction.results.growth.value;
    const nextGrowth = { ...state.characterGrowth, content: growthContent, createdAt: state.characterGrowth.createdAt || time.timestamp, updatedAt: time.timestamp, timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, lastIncludedActId: act.id, edited: state.characterGrowth.edited || growthContent !== generatedGrowth, reviewRecommended: false };
    const rejectedIds = new Set(transaction.results.memory.value.filter(item => item._reject).map(item => item.candidate.id));
    const operations = transaction.results.memory.value.filter(item => !item._reject).flatMap(item => item.operations).filter(operation => operation.type !== 'add_edge' || (!rejectedIds.has(operation.value.fromId) && !rejectedIds.has(operation.value.toId)));
    const extraction = transaction.extraction || state.settings.extraction;
    const sourceSnapshot = sourceMessages.map(message => ({ actId: act.id, messageId: message.extra.scene_diary.messageId, hash: fingerprint(extractMessage(message.mes, message.is_user ? extraction.user : extraction.character).body), contentHash: fingerprint(message.mes) }));
    nextAct.sourceSnapshot = sourceSnapshot;
    try {
        if (!transaction.commitInput) {
            transaction.commitInput = { libraryId: state.libraryId, requestId: transaction.id, expectedRevision: transaction.libraryRevision, operations, sourceSnapshot, act: nextAct, growth: nextGrowth };
            setState(state); await saveState(state);
        }
        const input = transaction.commitInput;
        try { await serviceRequest('/transactions/prepare', input); } catch (error) { if (error.status !== 409) throw error; }
        const result = await serviceRequest('/transactions/commit', input);
        Object.assign(act, input.act); state.characterGrowth = input.growth; state.libraryRevision = result.revision; state.status = 'pending_next_act'; state.pendingTransaction = null; state.takeoverNotice = false;
        setState(state); await saveState(state); await loadMemoryPage(0); render(state);
        notify('success', `第${act.id}幕、记忆与角色成长已保存，下一条玩家消息将开启新幕。`);
    } catch (error) { notify('error', `关幕保存失败：${error.message}`); }
}

function cancelClose() { const state = getState(), act = currentAct(state); if (!state || !act) return; state.status = 'active'; act.status = 'active'; state.pendingTransaction = null; setState(state); void saveState(state); render(state); }
function skipExtraction(id) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction?.dialogue) return; transaction.dialogue.errors = transaction.dialogue.errors.filter(item => item.id !== id); transaction.dialogue.rows = transaction.dialogue.rows.filter(item => item.id !== id); transaction.dialogue.text = transaction.dialogue.rows.map(row => `${row.speaker}: ${row.body}`).join('\n\n'); setState(state); void saveState(state); render(state); }

async function continuityData(state) {
    await ensureLibrary(state);
    recallController?.abort(); recallController = new AbortController(); const signal = recallController.signal;
    const current = chat().filter(isNormalRpMessage).slice(-state.settings.recallMessageCount), recallQuery = buildRecallQuery(current, state.settings.extraction);
    if (recallQuery.errors.length) return { recallQuery, content: '' };
    let query = recallQuery.text, rewriteFallback = '';
    if (state.settings.queryRewrite) try { const result = parsedJson(await boundedModel(`将以下对话改写成适合检索长期记忆的简短查询。保留人物、物品、地点及关系线索，不增加事实。只返回 {"query":"..."}。\n${query}`, state.settings.memoryConnectionProfile || state.settings.diaryConnectionProfile)); if (typeof result.query === 'string' && result.query.trim()) query = result.query.slice(0, 500); } catch (error) { rewriteFallback = error.message; }
    const parts = recallQuery.rows.map((row, index) => ({ body: row.body, isUser: row.isUser, currentAct: +current[index]?.extra?.scene_diary?.actId === +state.currentActId }));
    let response = await serviceRequest('/recall', { libraryId: state.libraryId, query, settings: state.settings, parts: query === recallQuery.text ? parts : [] }, signal), rerankFallback = '';
    if (state.settings.modelRerank && response.candidates?.length > 1) try {
        const result = parsedJson(await boundedModel(`按本轮相关性给候选记忆排序，仅返回候选 ID，不能添加事实。JSON：{"ids":["id"]}。\n查询：${query}\n候选：${JSON.stringify(response.candidates)}`, state.settings.memoryConnectionProfile || state.settings.diaryConnectionProfile));
        if (!Array.isArray(result.ids)) throw new Error('重排结果无效');
        const allowed = new Set(response.candidates.map(item => item.id)), ids = [...new Set(result.ids.filter(id => allowed.has(id)).concat(response.candidates.map(item => item.id)))];
        response = { ...response, ...await serviceRequest('/recall/order', { libraryId: state.libraryId, query, settings: state.settings, ids }, signal) };
    } catch (error) { rerankFallback = error.message; }
    lastRecall = { query, selected: response.selected, diagnostics: response.diagnostics, fallback: [response.fallback, rewriteFallback, rerankFallback].filter(Boolean).join('；') };
    return { recallQuery, content: [buildGrowthBlock(state), buildDiaryBlock(state, state.settings), response.content].filter(Boolean).join('\n\n') };
}
async function sceneDiaryRearrangeChat(promptChat, _contextSize, abort) {
    const state = getState(); clearPrompts(); awaitingMainPrompt = false;
    if (!state || !compatible() || state.status !== 'active' || !Array.isArray(promptChat)) return;
    const chatKey = activeChatKey;
    try {
        const { recallQuery, content } = await continuityData(state);
        if (chatKey !== activeChatKey) return abort(true);
        if (recallQuery.errors.length) throw new Error(`召回正文提取失败：${recallQuery.errors.map(item => item.errors.join('、')).join('；')}`);
        recallContent = content; promptChat.splice(0, promptChat.length, ...filterPromptMessages(promptChat, state.currentActId));
        if (String(ctx().mainApi || '').toLowerCase() === 'openai') awaitingMainPrompt = true;
        else setExtensionPrompt(MEMORY_KEY, content, extension_prompt_types.IN_CHAT, Math.min(promptChat.length, 100), false, extension_prompt_roles.SYSTEM);
        disabledReason = '';
    } catch (error) { disabledReason = `记忆服务不可用：${error.message}`; notify('error', disabledReason); abort(true); render(state); }
}
function promptReady(eventData) { const state = getState(), requestChat = eventData?.chat, dryRun = !!eventData?.dryRun; if (!dryRun && !awaitingMainPrompt) return; awaitingMainPrompt = false; if (!state || disabledReason || state.status !== 'active' || !Array.isArray(requestChat)) { lastContinuity = { included: false, reason: '聊天未处于可注入状态', dryRun }; return; } const index = insertContinuityBeforeHistory(requestChat, recallContent); lastContinuity = { included: index >= 0, index, length: recallContent.length, growthIncluded: !!state.characterGrowth.content, growthRevision: state.characterGrowth.revision, dryRun, reason: index >= 0 ? '' : '没有可注入的角色成长、日记或记忆' }; }
globalThis.sceneDiaryRearrangeChat = sceneDiaryRearrangeChat;

function renderMemories(state) {
    const root = document.querySelector('#scene_diary_memories'); if (!root) return;
    const entries = memoryPage.items || [];
    root.innerHTML = entries.length ? entries.map(memory => `<details class="scene-diary-entry" data-memory-id="${escape(memory.id)}"><summary>${escape(memory.title)} <small>${escape(memory.category)}${memory.permanent ? ' · 常驻' : ''}${memory.dirty ? ' · 待复核' : ''}</small></summary><label>标题<input data-memory-field="title" value="${escape(memory.title)}"></label><label>内容<textarea data-memory-field="content" rows="3">${escape(memory.content)}</textarea></label><label>类别<select data-memory-field="category">${MEMORY_CATEGORIES.map(item => `<option ${item === memory.category ? 'selected' : ''}>${item}</option>`).join('')}</select></label><label>重要度<input data-memory-field="importance" type="number" min="1" max="5" value="${memory.importance}"></label><label><input data-memory-field="permanent" type="checkbox" ${memory.permanent ? 'checked' : ''}> 常驻，每次生成时固定召回</label><label><input data-memory-field="locked" type="checkbox" ${memory.locked ? 'checked' : ''}> 锁定，自动整理不可覆盖</label><button data-action="save-memory">保存</button><button data-action="delete-memory">删除</button></details>`).join('') : '<p class="scene-diary-muted">没有符合条件的记忆。</p>';
    root.innerHTML += `<div class="scene-diary-actions"><button data-action="memory-prev" ${memoryPage.page ? '' : 'disabled'}>上一页</button><span>${memoryPage.total || 0} 条 · 第 ${(memoryPage.page || 0) + 1} 页</span><button data-action="memory-next" ${(memoryPage.page + 1) * 30 < memoryPage.total ? '' : 'disabled'}>下一页</button></div>`;
    for (const entry of root.querySelectorAll('[data-memory-id]')) {
        const memory = entries.find(item => item.id === entry.dataset.memoryId); if (!memory) continue;
        entry.insertAdjacentHTML('beforeend', `<p class="scene-diary-muted">${escape(memory.kind === 'fact' ? `事实 · ${memory.subjectId || ''} / ${memory.attribute || ''}${memory.conditions ? ` · 条件：${memory.conditions}` : ''}` : '事件')} · 来源 ${memory.sources?.length || 0} 条</p>${(memory.versionHistory || []).length ? `<p>版本：${memory.versionHistory.map(item => escape(`${item.title}（${item.lifecycle}）`)).join(' → ')}</p>` : ''}${(memory.related || []).length ? `<p>关联：${memory.related.map(item => escape(`${item.type}：${item.name}`)).join('；')}</p>` : ''}${(memory.sources || []).map(source => `<blockquote>${escape(source.excerpt)}</blockquote>`).join('')}`);
    }
}

function renderPart(kind, result, transaction) {
    if (result?.status === 'pending') return `<section class="scene-diary-result"><h5>${kindLabel(kind)}</h5><p>正在生成…</p></section>`;
    if (result?.status === 'error') return `<section class="scene-diary-result scene-diary-error"><h5>${kindLabel(kind)}</h5><p>${escape(result.error)}</p><button data-action="retry-part" data-kind="${kind}">仅重试${kindLabel(kind)}</button></section>`;
    if (kind === 'diary') return `<section class="scene-diary-result"><h5>日记</h5><label>标题<input data-preview="title" value="${escape(result.value.title)}"></label><label>日记<textarea data-preview="diary" rows="7">${escape(result.value.diary)}</textarea></label><button data-action="retry-part" data-kind="diary">重新生成日记</button></section>`;
    if (kind === 'growth') return `<section class="scene-diary-result"><h5>角色成长</h5><p class="scene-diary-muted">角色成长记录关系与状态演变，不规定下一幕的时间、地点或开场事件。</p><label>当前角色成长<textarea rows="5" readonly>${escape(transaction.baseGrowth || '尚未建立')}</textarea></label><label>更新后角色成长<textarea data-preview="growth" rows="9" maxlength="4000">${escape(result.value)}</textarea></label><button data-action="retry-part" data-kind="growth">重新生成角色成长</button></section>`;
    const candidates = result.value || [];
    const grouped = { '新增': [], '更新': [], '冲突': [] }, links = [];
    candidates.forEach((item, index) => {
        const group = item.decision.action === 'conflict' || item.target?.locked ? '冲突' : item.decision.action === 'add' ? '新增' : '更新';
        const evidence = (item.candidate.sources || []).map(source => source.excerpt).filter(Boolean).slice(0, 2).join('；');
        grouped[group].push(`<label class="scene-diary-candidate"><input data-candidate="${index}" type="checkbox" ${item._reject ? '' : 'checked'} ${group === '冲突' ? 'disabled' : ''}> <b>${escape(item.decision.action)}</b> ${escape(item.candidate.title)}<br>${item.target ? `原文：${escape(item.target.content)}<br>` : ''}新文：${escape(item.candidate.content)}${evidence ? `<br>依据：${escape(evidence)}` : ''}<br><small>${escape(item.decision.reason)}</small></label>`);
        for (const operation of item.operations.filter(operation => operation.type === 'add_edge')) {
            const target = candidates.find(row => row.candidate.id === operation.value.toId)?.candidate.title || item.operations.find(row => row.type === 'add_entity' && row.value.id === operation.value.toId)?.value.name || operation.value.toId;
            links.push(`<p class="scene-diary-muted">${escape(item.candidate.title)} → ${escape(operation.value.type)} → ${escape(target)}（随来源候选一并接受）</p>`);
        }
    });
    const sections = Object.entries(grouped).filter(([, rows]) => rows.length).map(([title, rows]) => `<h6>${title}</h6>${rows.join('')}`).join('');
    return `<section class="scene-diary-result"><h5>记忆变更建议</h5>${sections || '<p class="scene-diary-muted">本幕没有有效记忆候选。</p>'}${links.length ? `<h6>关联</h6>${links.join('')}` : ''}<button data-action="retry-part" data-kind="memory">重新生成记忆</button></section>`;
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
    panel.querySelector('[data-page=settings]').insertAdjacentHTML('afterbegin', '<h4>嵌入模型</h4><p class="scene-diary-muted">设置保存在当前酒馆用户的服务端。关闭后仅使用文本召回。</p><label><input data-embedding="enabled" type="checkbox">启用自定义嵌入服务</label><label>OpenAI 兼容接口地址<input data-embedding="baseUrl" placeholder="https://example.com/v1"></label><label>模型<input data-embedding="model"></label><label>密钥<input data-embedding="apiKey" type="password" placeholder="留空保持原密钥"></label><label>维度（可选）<input data-embedding="dimension" type="number" min="0"></label><button data-action="save-embedding">保存嵌入配置</button><button data-action="test-embedding">测试连接</button><button data-action="rebuild-embedding">重建向量</button><label><input data-setting="semanticRecall" type="checkbox">在本聊天启用语义召回</label>');
    panel.querySelector('[data-page=settings]').insertAdjacentHTML('afterbegin', '<h4>高级召回</h4><label><input data-setting="queryRewrite" type="checkbox">模型改写检索查询（每轮增加一次调用）</label><label><input data-setting="modelRerank" type="checkbox">模型重排候选（每轮增加一次调用）</label>');
    panel.querySelector('[data-page=settings]').insertAdjacentHTML('afterbegin', '<button data-action="check-service">检查记忆服务连接</button>');
    panel.querySelector('[data-page=memory]').insertAdjacentHTML('afterbegin', '<label>状态<select data-memory-lifecycle><option value="">全部状态</option><option value="active">当前</option><option value="superseded">历史</option><option value="review">待复核</option></select></label><label>实体名称<input data-memory-entity-query placeholder="人物、物品、地点"></label>');
    panel.querySelector('[data-page=memory]').insertAdjacentHTML('beforeend', '<div class="scene-diary-actions"><button data-action="organize-legacy">整理旧记忆（每批 20 条）</button><button data-action="memory-history">变更记录</button><button data-action="memory-export">导出完整记忆备份</button><label>导入记忆备份<input data-memory-import type="file" accept="application/json,.json"></label></div><div id="scene_diary_legacy"></div><div id="scene_diary_history"></div>');
    document.body.append(panel);
    bar.addEventListener('click', event => { const action = event.target.closest('[data-action]')?.dataset.action; if (action === 'open') { panel.hidden = false; render(); fillSettings(); } if (action === 'end') void closeAct(); });
    panel.addEventListener('click', handlePanelClick);
    panel.addEventListener('change', handlePanelChange);
    panel.querySelector('[data-memory-import]').addEventListener('change', event => void importBackup(event.target.files?.[0]));
    let searchTimer; panel.addEventListener('input', event => { if (event.target.matches('[data-memory-search],[data-memory-category]')) { clearTimeout(searchTimer); searchTimer = setTimeout(() => void loadMemoryPage(0).catch(error => notify('error', error.message)), 250); } if (event.target.matches('[data-growth-editor]')) { const count = panel.querySelector('[data-growth-count]'); if (count) count.textContent = `${event.target.value.length} / ${getState()?.settings.maxGrowthChars || 4000} 字符`; } if (event.target.matches('[data-preview]')) savePreviewField(event.target); });
    panel.addEventListener('input', event => { if (!event.target.matches('[data-memory-lifecycle],[data-memory-entity-query]')) return; clearTimeout(searchTimer); searchTimer = setTimeout(() => void loadMemoryPage(0).catch(error => notify('error', error.message)), 250); });
}

function savePreviewField(field) { const state = getState(), transaction = state?.pendingTransaction; if (!transaction) return; if (field.dataset.preview === 'title' && transaction.results.diary.status === 'success') transaction.results.diary.value.title = field.value; if (field.dataset.preview === 'diary' && transaction.results.diary.status === 'success') transaction.results.diary.value.diary = field.value; if (field.dataset.preview === 'growth' && transaction.results.growth.status === 'success') { transaction.results.growth.generatedValue ??= transaction.results.growth.value; transaction.results.growth.value = field.value; } setState(state); }

function handlePanelClick(event) {
    const target = event.target.closest('[data-action]'), action = target?.dataset.action, panel = document.querySelector(`#${PANEL}`);
    if (action === 'close') panel.hidden = true;
    if (action === 'end') void closeAct();
    if (action === 'takeover') takeOver(0);
    if (action === 'retry-part') retryClosePart(target.dataset.kind);
    if (action === 'confirm') { const state = getState(), transaction = state?.pendingTransaction; if (transaction && allPartsReady(transaction)) { const diary = transaction.results.diary.value; diary.title = panel.querySelector('[data-preview=title]').value.trim(); diary.diary = panel.querySelector('[data-preview=diary]').value.trim(); const growth = panel.querySelector('[data-preview=growth]').value.trim(); transaction.results.growth.generatedValue ??= transaction.results.growth.value; transaction.results.growth.value = growth; transaction.results.memory.value.forEach((memory, index) => memory._reject = !panel.querySelector(`[data-candidate="${index}"]`)?.checked); setState(state); } void confirmClose(); }
    if (action === 'cancel-close') cancelClose();
    if (action === 'skip') skipExtraction(target.dataset.id);
    if (action === 'save-growth') void saveGrowth(panel);
    if (action === 'new-memory') void manualMemory([{ type: 'add_memory', value: normalizeMemory({ title: '新记忆', content: '请编辑这条记忆', edited: true, locked: true }) }]);
    if (action === 'save-memory') void saveMemory(target);
    if (action === 'delete-memory') { const memory = memoryPage.items.find(item => item.id === target.closest('[data-memory-id]')?.dataset.memoryId); if (memory) void manualMemory([{ type: 'update_memory', targetId: memory.id, expectedMemoryRevision: memory.revision, manual: true, value: { deletedAt: Date.now() } }]); }
    if (action === 'memory-prev') void loadMemoryPage(Math.max(0, memoryPage.page - 1));
    if (action === 'memory-next') void loadMemoryPage(memoryPage.page + 1);
    if (action === 'memory-history') void loadHistory();
    if (action === 'organize-legacy') void organizeLegacy();
    if (action === 'legacy-confirm') void confirmLegacy();
    if (action === 'legacy-cancel') { legacyDraft = null; document.querySelector('#scene_diary_legacy').innerHTML = ''; }
    if (action === 'memory-undo') void previewUndo(target.dataset.requestId);
    if (action === 'memory-undo-confirm') void commitUndo();
    if (action === 'memory-undo-cancel') document.querySelector('#scene_diary_history').innerHTML = '';
    if (action === 'memory-export') void exportBackup();
    if (action === 'save-diary') void saveDiary(target);
    if (action === 'save-settings') saveChatSettings(panel);
    if (action === 'check-service') void checkService().then(() => { serviceStatus = 'ready'; disabledReason = ''; render(); notify('success', '记忆服务已连接'); }).catch(error => notify('error', error.message));
    if (action === 'save-embedding') void saveEmbedding(panel);
    if (action === 'test-embedding') void serviceRequest('/embedding/test', {}).then(result => notify('success', `嵌入接口可用，维度 ${result.dimension}`)).catch(error => notify('error', error.message));
    if (action === 'rebuild-embedding') void serviceRequest('/embedding/rebuild', { libraryId: getState()?.libraryId }).then(() => notify('info', '向量重建已加入队列')).catch(error => notify('error', error.message));
    if (action === 'reset-prompts') { panel.querySelector('[data-setting=promptDiary]').value = DEFAULT_DIARY_PROMPT; panel.querySelector('[data-setting=promptMemory]').value = DEFAULT_MEMORY_PROMPT; panel.querySelector('[data-setting=promptGrowth]').value = DEFAULT_GROWTH_PROMPT; }
    const tab = event.target.closest('[data-tab]')?.dataset.tab; if (tab) { panel.querySelectorAll('[data-page]').forEach(page => page.hidden = page.dataset.page !== tab); if (tab === 'debug') renderDebug(panel); if (tab === 'memory') void loadMemoryPage(0).catch(error => notify('error', error.message)); }
}

async function saveGrowth(panel) { const state = getState(); if (!state) return; const content = panel.querySelector('[data-growth-editor]').value.trim(); if (content.length > state.settings.maxGrowthChars) { notify('error', `角色成长不能超过 ${state.settings.maxGrowthChars} 字符。`); return; } const time = localTime(), growth = { ...state.characterGrowth, content, createdAt: state.characterGrowth.createdAt || (content ? time.timestamp : null), updatedAt: time.timestamp, timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, edited: true, reviewRecommended: false }; try { await ensureLibrary(state); const result = await serviceRequest('/transactions/commit', { libraryId: state.libraryId, requestId: newId('growth'), expectedRevision: state.libraryRevision, operations: [], growth }); state.libraryRevision = result.revision; state.characterGrowth = growth; state.takeoverNotice = false; setState(state); await saveState(state); render(state); notify('success', '角色成长已保存并会在后续生成中注入。'); } catch (error) { notify('error', error.message); } }
async function saveDiary(target) { const entry = target.closest('.scene-diary-entry'), state = getState(), id = +entry?.querySelector('[data-diary-id]')?.dataset.diaryId, act = findAct(state, id); if (!act) return; const updated = { ...act, diary: entry.querySelector('textarea').value.trim() }; acknowledgeActReview(updated, messagesFor(act.id)); try { await ensureLibrary(state); const result = await serviceRequest('/transactions/commit', { libraryId: state.libraryId, requestId: newId('diary'), expectedRevision: state.libraryRevision, operations: [], act: updated }); state.libraryRevision = result.revision; Object.assign(act, updated); setState(state); await saveState(state); render(state); } catch (error) { notify('error', error.message); } }
async function manualMemory(operations) { const state = getState(); try { await ensureLibrary(state); const result = await serviceRequest('/transactions/commit', { libraryId: state.libraryId, requestId: newId('manual'), expectedRevision: state.libraryRevision, operations: operations.map(operation => ({ ...operation, manual: true })) }); state.libraryRevision = result.revision; setState(state); await saveState(state); await loadMemoryPage(memoryPage.page); } catch (error) { notify('error', error.message); } }
async function loadHistory() { try { const state = getState(); await ensureLibrary(state); const rows = await serviceRequest('/transactions/history', { libraryId: state.libraryId }), root = document.querySelector('#scene_diary_history'); root.innerHTML = rows.map(row => `<p>第 ${row.revision} 次变更 · ${new Date(row.timestamp).toLocaleString()} · ${row.actId ? `第 ${row.actId} 幕` : `${row.count} 条记忆`} ${row.undone ? '（已撤销）' : `<button data-action="memory-undo" data-request-id="${escape(row.requestId)}">预览撤销</button>`}</p>`).join('') || '<p>暂无变更。</p>'; } catch (error) { notify('error', error.message); } }
async function previewUndo(requestId) { try { const state = getState(); pendingUndo = await serviceRequest('/transactions/undo', { libraryId: state.libraryId, requestId }); const root = document.querySelector('#scene_diary_history'); root.innerHTML = `<h4>撤销预览</h4><p>将恢复 ${pendingUndo.operations.length} 项记忆或关联变更${pendingUndo.actDeleteId || pendingUndo.act ? '，并恢复对应幕' : ''}。</p><button data-action="memory-undo-confirm">确认撤销</button><button data-action="memory-undo-cancel">取消</button>`; } catch (error) { notify('error', error.message); } }
async function commitUndo() { const state = getState(); if (!pendingUndo || !state) return; try { const result = await serviceRequest('/transactions/commit', { libraryId: state.libraryId, ...pendingUndo }); const snapshot = await serviceRequest('/libraries/export', { libraryId: state.libraryId }); state.libraryRevision = result.revision; state.acts = Object.values(snapshot.acts).sort((a, b) => a.id - b.id); if (!state.acts.length) state.acts = createState().acts; state.currentActId = state.acts.at(-1).id; state.status = state.acts.at(-1).status === 'closed' ? 'pending_next_act' : 'active'; state.characterGrowth = snapshot.growth || createState().characterGrowth; pendingUndo = null; setState(state); await saveState(state); await loadMemoryPage(0); await loadHistory(); render(state); } catch (error) { notify('error', error.message); } }
async function exportBackup() { try { const state = getState(); await ensureLibrary(state); const data = await serviceRequest('/libraries/export', { libraryId: state.libraryId }); data.chatSettings = state.settings; const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })), link = document.createElement('a'); link.href = url; link.download = `scene-diary-${state.libraryId}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (error) { notify('error', error.message); } }
async function importBackup(file) { if (!file) return; try { if (file.size > 30 * 1024 * 1024) throw new Error('备份文件超过 30 MB'); const data = JSON.parse(await file.text()), state = getState(), result = await serviceRequest('/libraries/import', { chatKey: activeChatKey, data }); state.libraryId = result.libraryId; state.libraryRevision = result.revision; state.acts = Object.values(data.acts || {}).sort((a, b) => a.id - b.id); if (!state.acts.length) state.acts = createState().acts; state.currentActId = state.acts.at(-1).id; state.status = state.acts.at(-1).status === 'closed' ? 'pending_next_act' : 'active'; state.characterGrowth = data.growth || createState().characterGrowth; if (data.chatSettings) state.settings = normalizeSettings(data.chatSettings); state.memories = []; libraryReady = { chatKey: activeChatKey, libraryId: result.libraryId }; setState(state); await saveState(state); await loadMemoryPage(0); render(state); notify('success', '记忆备份已导入当前聊天'); } catch (error) { notify('error', error.message); } }
async function organizeLegacy() {
    const root = document.querySelector('#scene_diary_legacy'), state = getState(); root.textContent = '正在整理旧记忆…';
    try {
        await ensureLibrary(state);
        const page = await serviceRequest('/libraries/query', { libraryId: state.libraryId, page: 0, pageSize: 20, legacyOnly: true });
        if (!page.items.length) { root.textContent = '没有待整理的旧记忆。'; return; }
        const prompt = `只依据旧记忆原文判断类型，不改写事件正文，不补写事实。不确定时选择 event。对于 fact，subjectId 只能用 user 或 character，attribute 为简短规范化属性，conditions 为原文明确写出的条件。只返回 JSON：{"updates":[{"id":"原记忆ID","kind":"event|fact","subjectId":"user|character或空","attribute":"属性或空","conditions":"条件或空"}]}。\n${JSON.stringify(page.items.map(item => ({ id: item.id, category: item.category, title: item.title, content: item.content })))}`;
        const result = parsedJson(await request(state.settings.memoryConnectionProfile || state.settings.diaryConnectionProfile, modelMessages(prompt), 1800));
        if (!Array.isArray(result.updates)) throw new Error('整理结果无效');
        legacyDraft = { revision: page.revision, items: page.items.map(item => { const update = result.updates.find(row => row.id === item.id) || {}, kind = update.kind === 'fact' && ['user', 'character'].includes(update.subjectId) && update.attribute ? 'fact' : 'event'; return { item, value: { kind, subjectId: kind === 'fact' ? update.subjectId : null, attribute: kind === 'fact' ? String(update.attribute).slice(0, 80) : null, conditions: kind === 'fact' ? String(update.conditions || '').slice(0, 160) : '', legacy: false }, selected: !item.locked }; }) };
        root.innerHTML = `<h4>旧记忆整理预览</h4>${legacyDraft.items.map((row, index) => `<label class="scene-diary-candidate"><input data-legacy="${index}" type="checkbox" ${row.selected ? 'checked' : ''} ${row.item.locked ? 'disabled' : ''}>${escape(row.item.title)}：${escape(row.item.content)}<br>建议：${escape(row.value.kind === 'fact' ? `事实 · ${row.value.subjectId} / ${row.value.attribute}${row.value.conditions ? `（${row.value.conditions}）` : ''}` : '事件')}${row.item.locked ? ' · 已锁定' : ''}</label>`).join('')}<button data-action="legacy-confirm">确认所选整理</button><button data-action="legacy-cancel">取消</button>`;
    } catch (error) { root.textContent = ''; notify('error', error.message); }
}
async function confirmLegacy() {
    const state = getState(); if (!legacyDraft) return;
    try { const operations = legacyDraft.items.filter(row => row.selected).map(row => ({ type: 'update_memory', targetId: row.item.id, expectedMemoryRevision: row.item.revision, manual: true, value: row.value })); const result = await serviceRequest('/transactions/commit', { libraryId: state.libraryId, requestId: newId('legacy'), expectedRevision: legacyDraft.revision, operations }); state.libraryRevision = result.revision; legacyDraft = null; document.querySelector('#scene_diary_legacy').textContent = '本批整理已保存，可继续整理下一批。'; setState(state); await saveState(state); await loadMemoryPage(0); } catch (error) { notify('error', error.message); } }
async function saveMemory(target) { const entry = target.closest('[data-memory-id]'), memory = memoryPage.items.find(item => item.id === entry?.dataset.memoryId); if (!memory) return; await manualMemory([{ type: 'update_memory', targetId: memory.id, expectedMemoryRevision: memory.revision, manual: true, value: { title: entry.querySelector('[data-memory-field=title]').value.trim(), content: entry.querySelector('[data-memory-field=content]').value.trim(), category: entry.querySelector('[data-memory-field=category]').value, importance: +entry.querySelector('[data-memory-field=importance]').value || 3, locked: entry.querySelector('[data-memory-field=locked]').checked, dirty: false, lifecycle: memory.lifecycle === 'review' ? memory.reviewFromLifecycle || 'active' : memory.lifecycle, reviewFromLifecycle: null } }]); }
function handlePanelChange(event) { if (event.target.matches('[data-legacy]')) { const item = legacyDraft?.items[+event.target.dataset.legacy]; if (item) item.selected = event.target.checked; return; } if (event.target.matches('[data-candidate]')) { const state = getState(), transaction = state?.pendingTransaction, item = transaction?.results?.memory?.value?.[+event.target.dataset.candidate]; if (item) { item._reject = !event.target.checked; transaction.results.growth.status = 'error'; transaction.results.growth.error = '记忆选择已变化，请重新生成角色成长。'; setState(state); render(state); } return; } if (!event.target.matches('[data-memory-field=permanent]')) return; const entry = event.target.closest('[data-memory-id]'), memory = memoryPage.items.find(item => item.id === entry?.dataset.memoryId); if (!memory) return; void manualMemory([{ type: 'update_memory', targetId: memory.id, expectedMemoryRevision: memory.revision, manual: true, value: { permanent: event.target.checked } }]); }
function readPairEditor(panel, key) { const lines = selector => (panel.querySelector(selector)?.value || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean), opens = lines(`[data-pair-open="${key}"]`), closes = lines(`[data-pair-close="${key}"]`); if (opens.length !== closes.length) throw new Error(`${key} 的开始标签与结束标签数量必须一致。`); return opens.map((open, index) => { const pair = validateTagPair({ open, close: closes[index] }); if (!pair) throw new Error(`${key} 第 ${index + 1} 组标签无效或名称不一致。`); return pair; }); }
function saveChatSettings(panel) { const state = getState(); if (!state) return; try { const settings = state.settings; settings.diaryConnectionProfile = panel.querySelector('[data-setting=diaryConnectionProfile]').value; settings.memoryConnectionProfile = panel.querySelector('[data-setting=memoryConnectionProfile]').value; for (const key of ['recallMessageCount', 'recallLimit', 'memoryTokenBudget', 'recentDiaryCount']) settings[key] = +panel.querySelector(`[data-setting="${key}"]`).value; for (const key of ['semanticRecall', 'queryRewrite', 'modelRerank']) settings[key] = panel.querySelector(`[data-setting=${key}]`).checked; settings.growthTargetLength = panel.querySelector('[data-setting=growthTargetLength]').value.trim() || DEFAULT_SETTINGS.growthTargetLength; settings.extraction ||= {}; for (const key of ['character.bodyTagPairs', 'user.bodyTagPairs', 'character.storyTimeTagPairs', 'user.storyTimeTagPairs']) { const [who, field] = key.split('.'); settings.extraction[who] ||= {}; settings.extraction[who][field] = readPairEditor(panel, key); } settings.prompts = { diary: panel.querySelector('[data-setting=promptDiary]').value.trim() || DEFAULT_DIARY_PROMPT, memory: panel.querySelector('[data-setting=promptMemory]').value.trim() || DEFAULT_MEMORY_PROMPT, growth: panel.querySelector('[data-setting=promptGrowth]').value.trim() || DEFAULT_GROWTH_PROMPT }; state.settings = normalizeSettings(settings); setState(state); void saveState(state); notify('success', '当前聊天设置已保存。'); render(state); } catch (error) { notify('error', error.message || String(error)); } }
async function saveEmbedding(panel) { try { const get = key => panel.querySelector(`[data-embedding=${key}]`), result = await serviceRequest('/embedding/config', { enabled: get('enabled').checked, baseUrl: get('baseUrl').value.trim(), model: get('model').value.trim(), apiKey: get('apiKey').value.trim(), dimension: +get('dimension').value || 0 }); get('apiKey').value = ''; notify('success', `嵌入配置已保存${result.enabled ? '' : '（已关闭）'}`); } catch (error) { notify('error', error.message); } }
function renderDebug(panel) { const state = getState(), output = panel.querySelector('[data-debug-list]'); panel.querySelector('[data-debug]').textContent = disabledReason || `当前幕 ${state?.currentActId || '-'}；记忆 ${memoryPage.total || 0} 条；召回本轮 ${lastRecall?.selected.length || 0} 条。`; const growth = state?.characterGrowth; output.textContent = JSON.stringify({ serviceStatus, libraryId: state?.libraryId, libraryRevision: state?.libraryRevision, continuity: lastContinuity, characterGrowth: growth ? { included: !!growth.content, revision: growth.revision, lastIncludedActId: growth.lastIncludedActId, reviewRecommended: growth.reviewRecommended, characters: growth.content.length, estimatedTokens: estimateTokens(growth.content) } : null, recall: lastRecall ? { query: lastRecall.query, diagnostics: lastRecall.diagnostics, fallback: lastRecall.fallback } : null }, null, 2); }
function fillSettings() { const panel = document.querySelector(`#${PANEL}`), state = getState(); if (!panel || !state) return; for (const key of ['recallMessageCount', 'recallLimit', 'memoryTokenBudget', 'recentDiaryCount', 'growthTargetLength']) panel.querySelector(`[data-setting="${key}"]`).value = state.settings[key]; for (const key of ['semanticRecall', 'queryRewrite', 'modelRerank']) panel.querySelector(`[data-setting=${key}]`).checked = !!state.settings[key]; for (const key of ['character.bodyTagPairs', 'user.bodyTagPairs', 'character.storyTimeTagPairs', 'user.storyTimeTagPairs']) { const [who, field] = key.split('.'), pairs = state.settings.extraction[who][field] || [], open = panel.querySelector(`[data-pair-open="${key}"]`), close = panel.querySelector(`[data-pair-close="${key}"]`); if (open) open.value = pairs.map(item => item.open).join('\n'); if (close) close.value = pairs.map(item => item.close).join('\n'); } panel.querySelector('[data-setting=promptDiary]').value = state.settings.prompts.diary || DEFAULT_DIARY_PROMPT; panel.querySelector('[data-setting=promptMemory]').value = state.settings.prompts.memory || DEFAULT_MEMORY_PROMPT; panel.querySelector('[data-setting=promptGrowth]').value = state.settings.prompts.growth || DEFAULT_GROWTH_PROMPT; void serviceRequest('/embedding/config').then(config => { for (const key of ['baseUrl', 'model', 'dimension']) panel.querySelector(`[data-embedding=${key}]`).value = config[key] || ''; panel.querySelector('[data-embedding=enabled]').checked = !!config.enabled; }).catch(() => {}); }
function bind() { const eventSource = source(), eventTypes = types(); if (!eventSource?.on) return; eventSource.on(eventTypes.MESSAGE_SENT || 'message_sent', sent); eventSource.on(eventTypes.MESSAGE_RECEIVED || 'message_received', received); eventSource.on(eventTypes.MESSAGE_EDITED || 'message_edited', changed); eventSource.on(eventTypes.MESSAGE_UPDATED || 'message_updated', changed); eventSource.on(eventTypes.MESSAGE_DELETED || 'message_deleted', deleted); eventSource.on(eventTypes.MESSAGE_SWIPED || 'message_swiped', changed); eventSource.on(eventTypes.CHAT_CHANGED || 'chat_id_changed', initializeChat); eventSource.on(eventTypes.CHAT_LOADED || 'chatLoaded', initializeChat); eventSource.on(eventTypes.CHAT_DELETED || 'chat_deleted', chatKey => { if (chatKey) void serviceRequest('/libraries/deleted', { chatKey }).catch(error => notify('error', error.message)); }); eventSource.on(eventTypes.CHAT_RENAMED || 'chat_renamed', async data => { if (data?.oldFileName && data?.newFileName) try { const result = await serviceRequest('/libraries/rename', { oldChatKey: data.oldFileName, newChatKey: data.newFileName }); const state = getState(); if (result.libraryId && state && String(ctx().chatId) === data.newFileName) { state.libraryId = result.libraryId; libraryReady = null; setState(state); await saveState(state); } } catch (error) { notify('error', error.message); } }); eventSource.on(eventTypes.CHAT_COMPLETION_PROMPT_READY || 'chat_completion_prompt_ready', promptReady); }
function init() { if (initialized) return; initialized = true; createUi(); if (!document.getElementById(BAR)) setTimeout(() => { createUi(); initializeChat(); fillSettings(); }, 800); bind(); initializeChat(); fillSettings(); void checkService().then(() => { serviceStatus = 'ready'; render(); }).catch(error => { serviceStatus = 'unavailable'; disabledReason = `记忆服务不可用：${error.message}`; render(); }); globalThis.sceneDiary = { version: '0.3.0', getState, closeAct, confirmClose, takeOver }; console.info(`[${NAME}] loaded`); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
