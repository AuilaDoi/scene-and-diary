export const SCHEMA_VERSION = 5;
export const STORAGE_KEY = 'scene_diary';
export const MEMORY_CATEGORIES = ['preference', 'habit', 'promise', 'relationship', 'event', 'item_place'];
export const DEFAULT_DIARY_PROMPT = '你是 {{char}} 的恋爱陪伴日记整理器。只依据角色设定与 [本幕对话]，以第一人称写日记；不要补写事实。';
export const DEFAULT_MEMORY_PROMPT = '你是恋爱陪伴记忆提取器。只依据 [本幕对话] 提取已发生或已明确确认的事实。承诺已经作出可以记录，但承诺内容未发生时不得写成已经完成。不要补写事实。';
export const DEFAULT_GROWTH_PROMPT = '你是 {{char}} 的角色成长与恋爱关系发展整理器。根据 [当前角色成长] 和 [本幕对话]，重写截至本幕结束的完整角色成长记录。重点维护 {{char}} 的性格成长、情感变化、生活状态变化，以及 {{char}} 与 {{user}} 从相识至今的关系发展路径。说明重要经历如何影响角色及双方关系，但不要逐条复述剧情，不要补写未发生或未确认的变化，也不要假定下一幕与本幕在时间、地点或事件上连续。';

export const DEFAULT_SETTINGS = Object.freeze({
    recentDiaryCount: 2, diaryTokenBudget: 1800, recallMessageCount: 3, recallLimit: 8, recallScoreThreshold: 0.3, memoryTokenBudget: 1200,
    diaryTargetLength: '400–800 Chinese characters',
    maxDiaryChars: 9000, maxGrowthChars: 4000, diaryConnectionProfile: '', memoryConnectionProfile: '',
    semantic: { enabled: false, endpoint: '', model: '', dimensions: null, rerank: false, rerankEndpoint: '', rerankModel: '' },
    extraction: { user: { bodyTagPairs: [], storyTimeTagPairs: [], requiredStoryTime: false }, character: { bodyTagPairs: [], storyTimeTagPairs: [], requiredStoryTime: false } },
    prompts: { diary: DEFAULT_DIARY_PROMPT, memory: DEFAULT_MEMORY_PROMPT, growth: DEFAULT_GROWTH_PROMPT },
});

const DIARY_FORMAT_INSTRUCTION = '只返回严格 JSON，不要使用 Markdown 代码围栏。格式：{"title":"短标题","diary":"日记"}';
const MEMORY_FORMAT_INSTRUCTION = '只返回严格 JSON {"memories":[{"category":"preference|habit|promise|relationship|event|item_place","title":"简短标题","content":"可独立理解的客观事实","people":[],"aliases":[],"importance":3,"storyTime":null}]}。importance 为 1–5 整数；标题最多120字符，正文最多500字符，最多30条。无新事实返回空数组。只提取本幕事实，不对照旧记忆；承诺作出与实际履行必须分别表述。';
const GROWTH_FORMAT_INSTRUCTION = '只返回严格 JSON，不要使用 Markdown 代码围栏。格式：{"characterGrowth":"截至本幕结束的完整角色成长记录"}';
const list = value => Array.isArray(value) ? value : [];
const str = value => value == null ? '' : String(value).trim();
const clamp = (value, min, max, fallback) => Math.min(max, Math.max(min, Number.isFinite(+value) ? +value : fallback));
export function normalizeRecallScoreThreshold(value) { return (typeof value === 'number' || typeof value === 'string' && value.trim()) && Number.isFinite(+value) ? clamp(value, 0, 1, DEFAULT_SETTINGS.recallScoreThreshold) : DEFAULT_SETTINGS.recallScoreThreshold; }

export const now = () => Date.now();
export function newId(prefix = 'sd') { return `${prefix}_${crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`; }
export function localTime() { return { timestamp: now(), timezoneOffset: new Date().getTimezoneOffset() }; }
export function createCharacterGrowth() { return { content: '', createdAt: null, updatedAt: null, timezoneOffset: null, revision: 0, lastIncludedActId: null, edited: false, reviewRecommended: false }; }
export function normalizeCharacterGrowth(value = {}) { const source = value && typeof value === 'object' ? value : {}; return { ...createCharacterGrowth(), content: str(source.content ?? source.text), createdAt: Number.isFinite(+source.createdAt) && +source.createdAt > 0 ? +source.createdAt : null, updatedAt: Number.isFinite(+source.updatedAt) && +source.updatedAt > 0 ? +source.updatedAt : null, timezoneOffset: source.timezoneOffset != null && Number.isFinite(+source.timezoneOffset) ? +source.timezoneOffset : null, revision: +source.revision || 0, lastIncludedActId: +source.lastIncludedActId || null, edited: !!source.edited, reviewRecommended: !!source.reviewRecommended }; }
export function createAct(id = 1, createdAt = now()) { return { id, status: 'active', messageIds: [], startMessageIndex: null, endMessageIndex: null, startSceneTime: null, endSceneTime: null, title: '', diary: '', createdAt, closedAt: null, edited: false, dirty: false, revision: 0, sourceFingerprint: '' }; }
export function createState(createdAt = now()) { return { version: SCHEMA_VERSION, currentActId: 1, status: 'active', acts: [createAct(1, createdAt)], memories: [], memoryRevision: 0, memorySpaceId: newId('space'), memoryLinks: [], memoryOrganization: null, maintenanceTransaction: null, characterGrowth: createCharacterGrowth(), pendingTransaction: null, drafts: [], settings: structuredClone(DEFAULT_SETTINGS), lastUpdatedAt: createdAt }; }

export function validateTagPair(pair) { const open = str(pair?.open), close = str(pair?.close), openMatch = open.match(/^<([A-Za-z][A-Za-z0-9:_-]*)>$/), closeMatch = close.match(/^<\/([A-Za-z][A-Za-z0-9:_-]*)>$/); return openMatch && closeMatch && openMatch[1] === closeMatch[1] ? { open, close } : null; }
const legacyPairs = tags => list(tags).map(name => ({ open: `<${str(name).replace(/^<|>$/g, '')}>`, close: `</${str(name).replace(/^<|>$/g, '')}>` }));
const pairs = (value, legacy) => list(value).length ? list(value).map(validateTagPair).filter(Boolean) : legacyPairs(legacy).map(validateTagPair).filter(Boolean);
const side = value => ({ bodyTagPairs: pairs(value?.bodyTagPairs, value?.bodyTags), storyTimeTagPairs: pairs(value?.storyTimeTagPairs, value?.storyTimeTags), requiredStoryTime: !!value?.requiredStoryTime });
export function normalizeSettings(value = {}) { const { growthTargetLength: _unusedGrowthTargetLength, ...settings } = value; return { ...DEFAULT_SETTINGS, ...settings, recentDiaryCount: clamp(value.recentDiaryCount, 0, 20, 2), recallMessageCount: clamp(value.recallMessageCount, 1, 20, 3), recallLimit: clamp(value.recallLimit, 0, 30, 8), recallScoreThreshold: normalizeRecallScoreThreshold(value.recallScoreThreshold), maxGrowthChars: DEFAULT_SETTINGS.maxGrowthChars, semantic: { enabled: !!value.semantic?.enabled, endpoint: str(value.semantic?.endpoint), model: str(value.semantic?.model), dimensions: Number.isInteger(+value.semantic?.dimensions) && +value.semantic.dimensions > 0 ? +value.semantic.dimensions : null, rerank: !!value.semantic?.rerank, rerankEndpoint: str(value.semantic?.rerankEndpoint), rerankModel: str(value.semantic?.rerankModel) }, extraction: { user: side(value.extraction?.user || DEFAULT_SETTINGS.extraction.user), character: side(value.extraction?.character || DEFAULT_SETTINGS.extraction.character) }, prompts: { diary: str(value.prompts?.diary) || DEFAULT_DIARY_PROMPT, memory: str(value.prompts?.memory) || DEFAULT_MEMORY_PROMPT, growth: str(value.prompts?.growth) || DEFAULT_GROWTH_PROMPT } }; }
export function normalizeMemory(value = {}) {
    const { sources, sourceActId, sourceMessageIds, lifecycle, supersedes, mergedInto, revision, status, dirty, reviewRecommended, sourceFingerprint, accepted, disabled, ...rest } = value;
    const time = localTime();
    return { ...rest, id: str(value.id) || newId('memory'), category: MEMORY_CATEGORIES.includes(value.category) ? value.category : 'event', title: str(value.title).slice(0, 120), content: str(value.content), people: [...new Set(list(value.people).map(str).filter(Boolean))], aliases: [...new Set(list(value.aliases).map(str).filter(Boolean))], importance: Math.round(clamp(value.importance, 1, 5, 3)), storyTime: str(value.storyTime) || null, createdAt: +value.createdAt || time.timestamp, updatedAt: +value.updatedAt || time.timestamp, timezoneOffset: Number.isFinite(+value.timezoneOffset) ? +value.timezoneOffset : time.timezoneOffset, locked: !!value.locked, permanent: !!value.permanent, deletedAt: +value.deletedAt || null, edited: !!value.edited };
}
export function normalizeMemoryLinks(links, memories) {
    const ids = new Set(memories.filter(memory => !memory.deletedAt).map(memory => memory.id)), seen = new Set();
    return list(links).flatMap(link => {
        const [a, b] = [str(link?.a), str(link?.b)].sort(), key = JSON.stringify([a, b]);
        if (!a || a === b || !ids.has(a) || !ids.has(b) || seen.has(key)) return [];
        seen.add(key); return [{ a, b, reason: str(link.reason).slice(0, 300) }];
    });
}
export function normalizeMemoryOrganization(value, memories) {
    if (value?.version !== 1 || !Number.isFinite(value.initializedAt) || value.initializedAt <= 0 || !value.reviewed || typeof value.reviewed !== 'object' || Array.isArray(value.reviewed)) return null;
    const reviewed = Object.fromEntries(memories.filter(memory => Object.hasOwn(value.reviewed, memory.id) && typeof value.reviewed[memory.id] === 'string').map(memory => [memory.id, value.reviewed[memory.id]]));
    return { version: 1, initializedAt: value.initializedAt, lastOrganizedAt: Number.isFinite(value.lastOrganizedAt) && value.lastOrganizedAt > 0 ? value.lastOrganizedAt : value.initializedAt, reviewed };
}
export function normalizeState(raw) {
    const start = createState(), value = raw && typeof raw === 'object' ? raw : {}, schema = Number.isFinite(+value.version) ? +value.version : 0;
    if (schema > SCHEMA_VERSION) throw new Error(`聊天数据版本 ${value.version} 高于支持版本 ${SCHEMA_VERSION}`);
    const { maintenanceHistory, ...rest } = value;
    const acts = list(value.acts).map((act, index) => ({ ...createAct(+act?.id || index + 1, +act?.createdAt || now()), ...act, id: +act?.id || index + 1, messageIds: list(act?.messageIds).map(String), status: ['active', 'closing', 'closed'].includes(act?.status) ? act.status : 'active' }));
    const all = acts.length ? acts : start.acts, current = all.some(act => act.id === +value.currentActId) ? +value.currentActId : all.at(-1).id;
    const memories = list(value.memories).filter(memory => memory && !memory.deletedAt && !['archived', 'superseded'].includes(memory.lifecycle)).map(normalizeMemory);
    const pendingTransaction = value.pendingTransaction ? structuredClone(value.pendingTransaction) : null;
    if (schema < 5 && pendingTransaction) {
        delete pendingTransaction.memoryCandidates; delete pendingTransaction.memoryRejected;
        pendingTransaction.results ||= {}; pendingTransaction.results.memory = { status: 'error', error: '记忆协议已升级，请重新提取本幕记忆。' };
    }
    return { ...start, ...rest, version: SCHEMA_VERSION, acts: all, currentActId: current, status: ['active', 'closing', 'preview', 'pending_next_act'].includes(value.status) ? value.status : 'active', memories, memoryLinks: normalizeMemoryLinks(value.memoryLinks, memories), memoryOrganization: schema < 5 ? null : normalizeMemoryOrganization(value.memoryOrganization, memories), memoryRevision: +value.memoryRevision || 0, memorySpaceId: str(value.memorySpaceId) || start.memorySpaceId, pendingTransaction, maintenanceTransaction: schema < 5 ? null : value.maintenanceTransaction || null, characterGrowth: normalizeCharacterGrowth(value.characterGrowth && typeof value.characterGrowth === 'object' ? value.characterGrowth : value.summary), settings: normalizeSettings(value.settings), drafts: list(value.drafts) };
}

export const currentAct = state => list(state?.acts).find(act => act.id === state.currentActId) || list(state?.acts).at(-1) || null;
export const findAct = (state, id) => list(state?.acts).find(act => act.id === +id) || null;
export function fingerprint(value) { let hash = 2166136261; for (const char of String(value ?? '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(16); }
export function sourceFingerprint(messages) { return fingerprint(list(messages).map(message => `${message?.extra?.scene_diary?.messageId || ''}:${message?.mes || ''}`).join('\n')); }
export function sourceChanged(act, messages) { return !!act?.sourceFingerprint && act.sourceFingerprint !== sourceFingerprint(messages); }
export function acknowledgeActReview(act, messages) { if (!act) return false; act.dirty = false; act.sourceFingerprint = sourceFingerprint(messages); act.edited = true; act.revision = (+act.revision || 0) + 1; return true; }
export function acknowledgeMemoryReview(memory) { if (!memory) return false; delete memory.dirty; delete memory.revision; memory.edited = true; memory.updatedAt = now(); return true; }
export function ensureMessageMeta(message, actId, index = null) { message.extra ||= {}; message.extra.scene_diary ||= {}; const metadata = message.extra.scene_diary; metadata.messageId ||= newId('msg'); if (actId != null) metadata.actId = +actId; if (index != null) metadata.messageIndex = +index; return metadata; }
export function isNormalRpMessage(message) { return !!message && !message.is_system && message.extra?.type !== 'narrator' && !message.extra?.tool_invocations && !message.extra?.scene_diary?.injected && !message.is_hidden; }
export function assignMessageToAct(state, message, actId, index = null) { const id = ensureMessageMeta(message, actId, index).messageId, act = findAct(state, actId); if (act && !act.messageIds.includes(id)) act.messageIds.push(id); return id; }
export function beginNextAct(state, message, index = null) { const old = currentAct(state), next = createAct(Math.max(...state.acts.map(act => act.id), 0) + 1); next.startMessageIndex = index; state.acts.push(next); state.currentActId = next.id; state.status = 'active'; if (old) old.status = 'closed'; if (message) assignMessageToAct(state, message, next.id, index); return next; }
export function filterPromptMessages(messages, id) { return list(messages).filter(message => !isNormalRpMessage(message) || +message.extra?.scene_diary?.actId === +id); }
export function markActDirty(state, id) { const act = findAct(state, id); if (!act || act.status !== 'closed') return false; act.dirty = true; if (state.characterGrowth?.lastIncludedActId >= act.id) state.characterGrowth.reviewRecommended = true; return true; }

function pairMatches(raw, pair) { const source = String(raw || ''), output = []; let cursor = 0; while (cursor < source.length) { const start = source.indexOf(pair.open, cursor); if (start < 0) break; const contentStart = start + pair.open.length, end = source.indexOf(pair.close, contentStart); if (end < 0) break; output.push({ index: start, value: source.slice(contentStart, end) }); cursor = end + pair.close.length; } return output; }
function rulePairs(rules, key, legacyKey) { return pairs(rules?.[key], rules?.[legacyKey]); }
export function extractMessage(raw, rules) { const source = String(raw || ''), bodyPairs = rulePairs(rules, 'bodyTagPairs', 'bodyTags'), found = bodyPairs.flatMap(pair => pairMatches(source, pair)).sort((a, b) => a.index - b.index); const body = bodyPairs.length ? found.map(item => item.value.trim()).filter(Boolean).filter((item, index, all) => !all.slice(0, index).some(other => other.includes(item))).join('\n\n') : source.trim(); const storyTime = rulePairs(rules, 'storyTimeTagPairs', 'storyTimeTags').flatMap(pair => pairMatches(source, pair)).sort((a, b) => a.index - b.index).map(item => item.value.replace(/<[^>]*>/g, ' ').trim()).find(Boolean) || null; const errors = []; if (bodyPairs.length && !found.length) errors.push('未匹配任何正文标签对'); if (!body) errors.push('提取后的正文为空'); if (rules?.requiredStoryTime && !storyTime) errors.push('未匹配必填故事时间标签对'); return { body, storyTime, errors }; }
export function buildDialogue(messages, rules, characterName, userName) { const rows = [], errors = []; for (const message of list(messages)) { const extracted = extractMessage(message.mes, message.is_user ? rules.user : rules.character), id = message.extra?.scene_diary?.messageId || ''; if (extracted.errors.length) errors.push({ id, index: message.extra?.scene_diary?.messageIndex, errors: extracted.errors }); rows.push({ id, speaker: message.is_user ? userName : (message.name || characterName), ...extracted }); } return { rows, errors, text: rows.map(row => `${row.speaker}: ${row.body}${row.storyTime ? `\n[故事时间：${row.storyTime}]` : ''}`).join('\n\n') }; }
export function buildRecallQuery(messages, rules) {
    const rows = [], errors = [];
    for (const message of list(messages)) {
        if (!isNormalRpMessage(message) || !str(message.mes)) continue;
        const extracted = extractMessage(message.mes, message.is_user ? rules.user : rules.character), id = message.extra?.scene_diary?.messageId || '';
        if (extracted.errors.length) errors.push({ id, index: message.extra?.scene_diary?.messageIndex, errors: extracted.errors });
        rows.push({ id, isUser: !!message.is_user, speaker: message.name || (message.is_user ? '玩家' : '角色'), ...extracted });
    }
    return { rows, errors, text: rows.map(row => `${row.speaker}: ${row.body}`).join('\n\n') };
}

export function stripJsonFence(value) { return String(value || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim(); }
function json(value, label) { try { return JSON.parse(stripJsonFence(typeof value === 'object' ? JSON.stringify(value) : value)); } catch (error) { throw new Error(`${label}模型返回的 JSON 无法解析：${error.message}`); } }
export function parseDiaryResponse(value) { const result = json(value, '日记'); if (!str(result?.diary)) throw new Error('日记正文为空'); return { title: str(result.title) || '未命名的一幕', diary: str(result.diary) }; }
export function parseGrowthResponse(value, maxChars = DEFAULT_SETTINGS.maxGrowthChars) { const result = json(value, '角色成长'), content = str(result?.characterGrowth); if (!content) throw new Error('角色成长内容为空'); if (content.length > maxChars) throw new Error(`角色成长超过 ${maxChars} 字符，请重试或调整提示词。`); return content; }
export function renderTemplate(template, values) { return String(template || '').replace(/{{(char|user)}}/g, (_, key) => String(values[key] ?? '')); }
export function buildCharacterContext(fields = {}) { const sections = [['角色描述', fields.description], ['性格', fields.personality], ['当前场景', fields.scenario]]; return sections.filter(([, value]) => str(value)).map(([label, value]) => `[${label}]\n${str(value)}`).join('\n\n'); }
export function buildDiaryPrompt({ characterName, userName, characterContext, dialogue, targetLength, prompt }) { return `${renderTemplate(prompt || DEFAULT_DIARY_PROMPT, { char: characterName, user: userName })}\n\n[角色卡人物设定]\n${characterContext || '未提供'}\n[/角色卡人物设定]\n\n目标长度：${targetLength}\n\n[本幕对话]\n${dialogue}\n[/本幕对话]\n\n${DIARY_FORMAT_INSTRUCTION}`; }
export function buildMemoryPrompt({ characterName, userName, dialogue, prompt }) { return `${renderTemplate(prompt || DEFAULT_MEMORY_PROMPT, { char: characterName, user: userName })}\n\n角色：${characterName}\n玩家：${userName}\n\n[本幕对话]\n${dialogue}\n[/本幕对话]\n\n${MEMORY_FORMAT_INSTRUCTION}`; }
export function buildGrowthPrompt({ characterName, userName, characterContext, currentGrowth, dialogue, prompt }) { return `${renderTemplate(prompt || DEFAULT_GROWTH_PROMPT, { char: characterName, user: userName })}\n\n[角色卡人物设定]\n${characterContext || '未提供'}\n[/角色卡人物设定]\n\n[当前角色成长]\n${str(currentGrowth) || '尚未建立'}\n[/当前角色成长]\n\n[本幕对话]\n${dialogue}\n[/本幕对话]\n\n${GROWTH_FORMAT_INSTRUCTION}`; }

export const estimateTokens = value => Math.ceil(String(value || '').length / 2);
export function buildGrowthBlock(state) { const content = str(state?.characterGrowth?.content); return content ? `[scene&diary 角色成长｜关系与状态演变路径]\n${content}\n[/scene&diary 角色成长]` : ''; }
export function buildDiaryBlock(state, settings = state?.settings || DEFAULT_SETTINGS) { const count = +settings.recentDiaryCount; if (!count) return ''; const closed = list(state?.acts).filter(act => act.status === 'closed' && act.diary && !act.dirty), selected = []; let used = 0; for (const act of closed.slice(-count).reverse()) { const block = `第${act.id}幕｜${act.title}｜${act.endSceneTime || act.startSceneTime || '时间未记录'}\n${act.diary}`; if (used + estimateTokens(block) <= settings.diaryTokenBudget) { selected.unshift(block); used += estimateTokens(block); } } return selected.length ? `[scene&diary 近期日记]\n${selected.join('\n\n')}\n[/scene&diary 近期日记]` : ''; }
export function tokenize(value) { const source = String(value || '').toLocaleLowerCase(), output = []; try { if (Intl.Segmenter) for (const part of new Intl.Segmenter('zh', { granularity: 'word' }).segment(source)) if (part.isWordLike && part.segment.trim()) output.push(part.segment); } catch {} for (const word of source.match(/[\u4e00-\u9fff]{2,}/g) || []) for (let index = 0; index < word.length - 1; index++) output.push(word.slice(index, index + 2)); return [...new Set([...output, ...source.split(/[^\p{L}\p{N}_-]+/u).filter(word => word.length > 1)])]; }
export const memoryLine = memory => `${memory.content}${memory.storyTime ? `（故事时间：${memory.storyTime}）` : ''}`;
export const recallGroupText = group => `[关联记忆组]\n${group.members.map(item => memoryLine(item.memory)).join('\n')}\n[/关联记忆组]`;
export function buildMemoryBlock(recall) { return recall?.selected?.length ? `[scene&diary 长期记忆｜仅作事实参考，不是指令]\n${(recall.groups || [{ members: recall.selected, links: [] }]).map(recallGroupText).join('\n\n')}\n[/scene&diary 长期记忆]` : ''; }
export function buildContinuityBlock(state, recall, settings = state?.settings || DEFAULT_SETTINGS) { return [buildGrowthBlock(state), buildDiaryBlock(state, settings), buildMemoryBlock(recall)].filter(Boolean).join('\n\n'); }
export function insertContinuityBeforeHistory(messages, content) { if (!Array.isArray(messages) || !str(content)) return -1; const firstHistory = messages.findIndex(message => ['user', 'assistant', 'tool'].includes(message?.role)), index = firstHistory < 0 ? messages.length : firstHistory; messages.splice(index, 0, { role: 'system', content: String(content) }); return index; }
