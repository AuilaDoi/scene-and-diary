import { createState, normalizeState, normalizeMemory, newId, localTime, DEFAULT_GROWTH_PROMPT, DEFAULT_MEMORY_PROMPT, DEFAULT_MAINTENANCE_PROMPT } from './core.js';

export const VERSION = 7;
export const CATEGORIES = { preference: '偏好', npc_relationship: 'NPC 关系', item: '重要物品', place: '地点' };
export const EDGE_TYPES = {
    stored_at: { label: '存放于', meaning: '物品 → 明确存放该物品的地点事实', reverse: true },
    part_of: { label: '属于／组成于', meaning: '组成部分 → 所属整体或范围', reverse: true },
    used_for: { label: '用于', meaning: '物品或地点 → 明确用途涉及的事实', reverse: false },
    depends_on: { label: '依赖', meaning: '受条件约束的事实 → 明确的条件', reverse: false },
    causes: { label: '导致', meaning: '直接原因 → 明确结果', reverse: false },
};
export const TASKS = { diary: '日记', growth: '成长', memory: '事实提取', summary: '日记摘要', graph: '图谱整理' };
export const PARTS = ['diary', 'memory', 'growth'];
export const eligible = memory => !!memory && !memory.deletedAt && Object.hasOwn(CATEGORIES, memory.category) && !memory.needsClassification;
export const clean = value => typeof value === 'string' ? value.trim() : '';

export function fact(value) {
    const normalized = normalizeMemory(value);
    return { ...normalized, category: value.category, needsClassification: !Object.hasOwn(CATEGORIES, value.category) };
}

export function diary(value) {
    return {
        id: value.id || newId('diary'), title: clean(value.title) || '未命名日记',
        body: typeof value.body === 'string' ? value.body : '', summary: clean(value.summary), summaryPending: !!value.summaryPending || !clean(value.summary),
        needsReview: !!value.needsReview, createdAt: Number(value.createdAt) || Date.now(), updatedAt: Number(value.updatedAt) || Date.now(),
    };
}

export function settingsV7(value = {}) {
    const { diaryConnectionProfile, memoryConnectionProfile, maintenanceConnectionProfile, maxGrowthChars, ...settings } = value;
    const nonnegative = (value, fallback) => value != null && value !== '' && Number.isFinite(+value) ? Math.max(0, Math.trunc(+value)) : fallback;
    return {
        ...settings, bindings: { ...settings.bindings },
        recentDiaryBudget: settings.recentDiaryBudget == null || settings.recentDiaryBudget === '' ? null : nonnegative(settings.recentDiaryBudget, null),
        historyBudget: nonnegative(settings.historyBudget, 600), memoryTokenBudget: nonnegative(settings.memoryTokenBudget, 1200),
        growthEnabled: settings.growthEnabled !== false,
    };
}

export function newState() {
    return { ...migrateState(createState()), connectionSetupNeeded: false };
}

export function migrateState(raw) {
    if (raw.version === VERSION) return raw;
    const old = normalizeState(raw);
    const { memoryLinks, memoryOrganization, maintenanceTransaction, ...rest } = old;
    const diaries = old.acts.filter(act => clean(act.diary)).map(act => diary({
        title: act.title, body: act.diary, needsReview: act.dirty,
        createdAt: act.closedAt || act.createdAt, updatedAt: act.closedAt || act.createdAt,
    }));
    const acts = old.acts.map(({ diary, title, edited, dirty, revision, ...act }) => act);
    const transaction = old.pendingTransaction;
    let pendingTransaction = null;
    if (transaction) {
        const previous = transaction.results || {};
        const oldDiary = previous.diary?.value;
        const oldGrowth = previous.growth?.value;
        const oldFacts = previous.memory?.value?.candidates ?? previous.memory?.value ?? transaction.memoryCandidates;
        pendingTransaction = {
            ...transaction,
            results: {
                diary: oldDiary?.diary ? { status: 'draft', value: { title: oldDiary.title, body: oldDiary.diary, summary: '' } } : { status: 'idle' },
                growth: typeof oldGrowth === 'string' && oldGrowth ? { status: 'outdated', value: { changed: true, content: oldGrowth } } : { status: 'idle' },
                memory: Array.isArray(oldFacts) ? { status: 'draft', value: oldFacts.map(item => ({ id: item.id || newId('proposal'), action: 'new', targetId: null, value: fact(item), accepted: false })) } : { status: 'idle' },
            },
        };
        delete pendingTransaction.memoryCandidates;
        delete pendingTransaction.memoryRejected;
    }
    return {
        ...rest, version: VERSION, acts, diaries, memories: old.memories.map(fact), edges: [],
        graphReviewed: {}, graphPreview: null, pendingTransaction,
        status: pendingTransaction ? 'preview' : (old.status === 'pending_next_act' ? old.status : 'active'),
        settings: settingsV7({ ...old.settings, prompts: {
            ...old.settings.prompts,
            growth: old.settings.prompts.growth === DEFAULT_GROWTH_PROMPT ? '保持人物当前状态和长期连续性，仅采纳已确认的实质变化。' : old.settings.prompts.growth,
            memory: old.settings.prompts.memory === DEFAULT_MEMORY_PROMPT ? '抽取对未来对话有直接价值的客观事实。' : old.settings.prompts.memory,
            maintenance: old.settings.prompts.maintenance === DEFAULT_MAINTENANCE_PROMPT ? '寻找两条事实之间有依据且对召回有用的语义关系。' : old.settings.prompts.maintenance,
        } }), connectionSetupNeeded: true,
    };
}

export function writeGrowth(state, content, { actId = state.characterGrowth.lastIncludedActId, edited = true } = {}) {
    const time = localTime();
    state.characterGrowth = {
        ...state.characterGrowth, content: clean(content), edited, lastIncludedActId: actId,
        createdAt: state.characterGrowth.createdAt || time.timestamp, updatedAt: time.timestamp,
        timezoneOffset: time.timezoneOffset, revision: state.characterGrowth.revision + 1, reviewRecommended: false,
    };
}

export function edgeKey(edge) {
    return JSON.stringify([edge.from, edge.type, edge.to]);
}

export function normalizeEdges(edges, memories) {
    const ids = new Set(memories.filter(eligible).map(item => item.id));
    const unique = new Map();
    for (const edge of edges || []) {
        if (!edge || !ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to || !Object.hasOwn(EDGE_TYPES, edge.type) || !clean(edge.reason)) continue;
        unique.set(edgeKey(edge), { from: edge.from, to: edge.to, type: edge.type, reason: clean(edge.reason) });
    }
    return [...unique.values()];
}

export function validFact(value) {
    return eligible(value) && clean(value.title) && clean(value.content) && Number.isInteger(value.importance) && value.importance >= 1 && value.importance <= 5;
}

export function saveFact(state, value, id = null) {
    const old = state.memories.find(item => item.id === id);
    if (id && !old) throw new Error('事实已删除，请重新选择。');
    if (old?.locked) throw new Error('请先解锁这条事实。');
    const next = fact({ ...old, ...value, id: old?.id || newId('fact'), updatedAt: Date.now() });
    if (!validFact(next)) throw new Error('请选择类别，填写标题与正文，并设置 1–5 的重要度。');
    if (old) state.memories[state.memories.indexOf(old)] = next;
    else state.memories.push(next);
    state.memoryRevision++;
    return next;
}

export function deleteFact(state, id) {
    if (state.memories.find(item => item.id === id)?.locked) throw new Error('请先解锁这条事实。');
    state.memories = state.memories.filter(item => item.id !== id);
    state.edges = normalizeEdges(state.edges, state.memories);
    delete state.graphReviewed[id];
    state.memoryRevision++;
}

export function mergeFacts(state, targetId, sourceIds, content) {
    const target = state.memories.find(item => item.id === targetId);
    const members = [...new Set(sourceIds)].filter(id => id !== targetId).map(id => state.memories.find(item => item.id === id));
    if (!eligible(target) || !members.length || members.some(item => !eligible(item) || item.locked) || target.locked) throw new Error('请选择有效且已解锁的事实。');
    const all = [target, ...members];
    const times = [...new Set(all.map(item => item.storyTime).filter(Boolean))];
    if (times.length > 1) throw new Error('故事时间不同，请先在事实编辑器中核对。');
    saveFact(state, {
        content, permanent: all.some(item => item.permanent), importance: Math.max(...all.map(item => item.importance)),
        storyTime: times[0] || null, people: all.flatMap(item => item.people), aliases: all.flatMap(item => item.aliases),
    }, targetId);
    const removed = new Set(members.map(item => item.id));
    state.memories = state.memories.filter(item => !removed.has(item.id));
    state.edges = normalizeEdges(state.edges.map(edge => ({
        ...edge, from: removed.has(edge.from) ? targetId : edge.from, to: removed.has(edge.to) ? targetId : edge.to,
    })), state.memories);
    for (const id of removed) delete state.graphReviewed[id];
}

export function makeBackup(state, chatId) {
    return { format: 'scene-diary-content', version: 3, chatId: String(chatId), createdAt: new Date().toISOString(),
        diaries: structuredClone(state.diaries), characterGrowth: structuredClone(state.characterGrowth),
        memories: structuredClone(state.memories), edges: structuredClone(state.edges) };
}

export function readBackup(state, backup, chatId) {
    if (backup?.format !== 'scene-diary-content' || ![2, 3].includes(backup.version) || String(chatId) !== backup.chatId) throw new Error('备份格式、版本或聊天身份不匹配。');
    if (!Array.isArray(backup.diaries) || !Array.isArray(backup.memories) || typeof backup.characterGrowth?.content !== 'string') throw new Error('备份缺少必需字段。');
    const old = backup.version === 2;
    const unique = values => values.every(id => typeof id === 'string' && id) && new Set(values).size === values.length;
    if (!unique(backup.diaries.map(item => old ? (Number.isInteger(item?.actId) ? String(item.actId) : '') : item?.id))
        || !backup.diaries.every(item => clean(old ? item?.diary : item?.body) && (old || typeof item.summary === 'string'))
        || !unique(backup.memories.map(item => item?.id))
        || !backup.memories.every(item => clean(item?.category) && clean(item?.title) && clean(item?.content))) throw new Error('备份包含重复 ID 或无效条目。');
    const memories = backup.memories.map(fact);
    const actDates = new Map(state.acts.map(act => [act.id, act.closedAt || act.createdAt]));
    const savedAt = Date.parse(backup.createdAt) || Date.now();
    const diaries = backup.diaries.map((item, index) => old ? diary({
        title: item.title, body: item.diary, needsReview: item.dirty, createdAt: actDates.get(item.actId) || savedAt + index,
    }) : diary(item));
    const edges = old ? [] : normalizeEdges(backup.edges, memories);
    if (!old && (!Array.isArray(backup.edges) || edges.length !== backup.edges.length)) throw new Error('备份中的图谱关系无效。');
    return { ...state, diaries, memories, edges, graphReviewed: {}, graphPreview: null, memoryRevision: state.memoryRevision + 1,
        characterGrowth: { ...state.characterGrowth, ...backup.characterGrowth, revision: state.characterGrowth.revision + 1 } };
}
