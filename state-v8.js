import { createState, newId, DEFAULT_DIARY_PROMPT, normalizeSettings } from './core.js';
import { migrateState as migrateV7, writeGrowth } from './state-v7.js';

export { writeGrowth };
export const VERSION = 8;
export const TASKS = { diary: '日记', memory: '记忆提取', growth: '角色成长' };
export const PARTS = ['diary', 'memory'];
export const clean = value => typeof value === 'string' ? value.trim() : '';
export const eligible = value => !!value && !value.deletedAt && !!clean(value.content);
const defaults = {
    diary: ['你是 {{char}} 的日记整理助手。', '以角色第一人称写下本幕经历、关键互动与当时感受，只使用给定素材。'],
    memory: ['你是独立记忆点整理助手。', '提取对未来对话有价值且能独立理解的事实。只依据已发生或已确认的内容，故事时间无依据时留空。'],
    growth: ['你是 {{char}} 的角色画像整理助手。', '结合角色设定和日记维护完整的当前画像，保留有依据的人格、关系与生活状态变化。没有实质变化时如实说明。'],
};
const legacyDefaults = { diary: DEFAULT_DIARY_PROMPT, memory: '抽取对未来对话有直接价值的客观事实。', growth: '保持人物当前状态和长期连续性，仅采纳已确认的实质变化。' };
const count = (value, fallback) => Number.isSafeInteger(value) && value >= 0 ? value : fallback;

export function settingsV8(value = {}) {
    const normalized = normalizeSettings(value);
    const prompts = {}, bindings = {};
    for (const task of Object.keys(TASKS)) {
        const old = value.prompts?.[task];
        const [system, description] = defaults[task];
        prompts[task] = {
            system: old?.system ?? system,
            description: old?.description ?? (typeof old === 'string' && old !== legacyDefaults[task] ? old : description),
        };
        if (value.bindings?.[task]) bindings[task] = value.bindings[task];
    }
    return { prompts, bindings, extraction: normalized.extraction, semantic: normalized.semantic,
        growthEnabled: value.growthEnabled !== false, recentDiaryCount: count(value.recentDiaryCount, 2),
        growthDiaryCount: count(value.growthDiaryCount, 3), queryDepth: count(value.queryDepth, count(value.recallMessageCount - 1, 2)),
        retrievalCount: count(value.retrievalCount, 30), candidateCount: count(value.candidateCount, value.recallLimit === 8 ? 10 : count(value.recallLimit, 10)),
        recallScoreThreshold: normalized.recallScoreThreshold };
}

export function fact(value = {}) {
    return { id: value.id || newId('fact'), title: clean(value.title), content: clean(value.content),
        storyTime: clean(value.storyTime) || null, importance: value.importance ?? 3,
        locked: !!value.locked, permanent: !!value.permanent, updatedAt: value.updatedAt ?? Date.now() };
}
function migrateFact(value) {
    return { ...fact(value), title: value.title, content: value.content };
}
export const validFact = value => eligible(value) && !!clean(value.title) && Number.isInteger(value.importance) && value.importance >= 1 && value.importance <= 5;
export function diary(value = {}) {
    return { id: value.id || newId('diary'), title: clean(value.title) || '未命名日记', body: value.body ?? '',
        needsReview: !!value.needsReview, createdAt: value.createdAt ?? Date.now(), updatedAt: value.updatedAt ?? Date.now() };
}

export function migrateState(raw) {
    if (raw.version === VERSION) return raw;
    const old = migrateV7(raw);
    const { edges, graphReviewed, graphPreview, ...state } = old;
    const tx = old.pendingTransaction;
    const growth = tx?.results?.growth?.value;
    let pendingTransaction = null;
    if (tx) {
        const { growthRevision, results, ...header } = tx;
        const memory = { ...results.memory }, journal = { ...results.diary };
        if (journal.value) journal.value = { title: journal.value.title, body: journal.value.body };
        if (Array.isArray(memory.value)) {
            if (memory.value.some(p => p.targetId && p.accepted)) memory.status = 'draft';
            memory.value = memory.value.map(p => ({ id: p.id, value: fact(p.value), accepted: !!p.accepted && !p.targetId && p.action !== 'duplicate' }));
        }
        for (const part of [journal, memory]) {
            if (part.status === 'running') Object.assign(part, { status: 'error', error: '上次生成已中断，可单独重试本项。' });
        }
        pendingTransaction = { ...header, results: { diary: journal, memory } };
    }
    return { ...state, version: VERSION, settings: settingsV8(old.settings), diaries: old.diaries.map(diary),
        memories: old.memories.filter(eligible).map(migrateFact), pendingTransaction, legacyGrowthDraft: growth?.changed && clean(growth.content) ? growth.content : null };
}
export const newState = () => ({ ...migrateState(createState()), connectionSetupNeeded: false });

export function saveFact(state, value, id = null) {
    const index = id ? state.memories.findIndex(item => item.id === id) : -1;
    if (id && index < 0) throw new Error('记忆点已删除。');
    if (state.memories[index]?.locked) throw new Error('请先解锁记忆点。');
    const next = fact({ ...value, id: id || value.id, updatedAt: Date.now() });
    if (!validFact(next)) throw new Error('请填写标题、内容和 1–5 的整数重要度。');
    if (index < 0) state.memories.push(next);
    else state.memories[index] = next;
    state.memoryRevision++;
    return next;
}

export function makeBackup(state, chatId) {
    return { format: 'scene-diary-content', version: 4, chatId: String(chatId), createdAt: new Date().toISOString(),
        diaries: structuredClone(state.diaries), memories: structuredClone(state.memories), characterGrowth: structuredClone(state.characterGrowth) };
}
export function readBackup(state, backup, chatId) {
    if (backup?.format !== 'scene-diary-content' || ![2, 3, 4].includes(backup.version) || String(chatId) !== backup.chatId) throw new Error('备份格式、版本或聊天身份不匹配。');
    if (!Array.isArray(backup.diaries) || !Array.isArray(backup.memories) || typeof backup.characterGrowth?.content !== 'string') throw new Error('备份缺少必需字段。');
    const old = backup.version === 2;
    const unique = values => values.every(id => typeof id === 'string' && id) && new Set(values).size === values.length;
    if (!unique(backup.diaries.map(item => old ? (Number.isInteger(item?.actId) ? String(item.actId) : '') : item?.id))
        || !backup.diaries.every(item => clean(old ? item?.diary : item?.body))
        || !unique(backup.memories.map(item => item?.id))
        || !backup.memories.every(item => clean(item?.title) && clean(item?.content))) throw new Error('备份包含重复 ID 或无效条目。');
    const memories = backup.memories.filter(eligible).map(migrateFact);
    const actDates = new Map(state.acts.map(act => [act.id, act.closedAt || act.createdAt]));
    const savedAt = Date.parse(backup.createdAt) || Date.now();
    const diaries = backup.diaries.map((item, index) => old ? diary({
        title: item.title, body: item.diary, needsReview: item.dirty, createdAt: actDates.get(item.actId) || savedAt + index,
    }) : diary(item));
    if (!memories.every(validFact)) throw new Error('备份包含无效记忆。');
    return { ...state, diaries, memories, memoryRevision: state.memoryRevision + 1,
        characterGrowth: { ...state.characterGrowth, ...backup.characterGrowth, revision: state.characterGrowth.revision + 1 } };
}
