import { createState, normalizeState, normalizeMemory, newId, localTime, DEFAULT_GROWTH_PROMPT, DEFAULT_MEMORY_PROMPT, DEFAULT_MAINTENANCE_PROMPT } from './core.js';

export const VERSION = 7;
export const CATEGORIES = { preference: '偏好', npc_relationship: 'NPC 关系', item: '重要物品', place: '地点' };
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
