import { MEMORY_CATEGORIES, normalizeCharacterGrowth, normalizeMemory, normalizeMemoryLinks } from './core.js';
import { validateMemoryFormat } from './memory-system.js';

const BACKUP_FORMAT = 'scene-diary-content';
const BACKUP_VERSION = 2;

export function createContentBackup(state, chatId) {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        chatId: String(chatId),
        createdAt: new Date().toISOString(),
        diaries: state.acts.filter(act => act.diary).map(act => ({ actId: act.id, title: act.title, diary: act.diary, edited: !!act.edited, dirty: !!act.dirty })),
        characterGrowth: structuredClone(state.characterGrowth),
        memories: structuredClone(state.memories.filter(memory => !memory.deletedAt)),
        memoryLinks: normalizeMemoryLinks(state.memoryLinks, state.memories),
    };
}

export function restoreContentBackup(state, backup, chatId) {
    if (backup?.format !== BACKUP_FORMAT || ![1, BACKUP_VERSION].includes(backup.version) || backup.chatId !== String(chatId)) throw new Error('备份格式、版本或聊天身份不匹配');
    if (!Array.isArray(backup.diaries) || !Array.isArray(backup.memories) || !backup.characterGrowth || typeof backup.characterGrowth !== 'object' || typeof backup.characterGrowth.content !== 'string') throw new Error('备份缺少日记、角色成长或记忆');
    if (backup.diaries.length > 10000 || backup.memories.length > 20000) throw new Error('备份条目过多');
    const acts = new Map(state.acts.map(act => [act.id, act]));
    const diaryIds = new Set(), memoryIds = new Set();
    for (const diary of backup.diaries) {
        if (!Number.isInteger(diary?.actId) || !acts.has(diary.actId) || diaryIds.has(diary.actId) || typeof diary.title !== 'string' || typeof diary.diary !== 'string' || !diary.diary.trim()) throw new Error('备份中的日记无效或当前聊天缺少对应幕');
        diaryIds.add(diary.actId);
    }
    const visibleMemories = backup.memories.filter(memory => memory && !memory.deletedAt && !['archived', 'superseded'].includes(memory.lifecycle));
    for (const memory of visibleMemories) {
        if (typeof memory?.id !== 'string' || !memory.id || memoryIds.has(memory.id) || !MEMORY_CATEGORIES.includes(memory.category) || typeof memory.title !== 'string' || !memory.title.trim() || typeof memory.content !== 'string' || !memory.content.trim() || memory.deletedAt) throw new Error('备份中的记忆无效或 ID 重复');
        // v0.3.1 allowed manually saved bodies longer than the current extraction limit.
        // A content backup must round-trip those retained facts without truncation.
        if (backup.version === 2) validateMemoryFormat(memory, { extendedArrays: true, extendedContent: true });
        memoryIds.add(memory.id);
    }
    const restored = structuredClone(state);
    for (const act of restored.acts) {
        const diary = backup.diaries.find(item => item.actId === act.id);
        act.title = diary?.title || '';
        act.diary = diary?.diary || '';
        act.edited = !!diary?.edited;
        act.dirty = !!diary?.dirty;
        act.revision++;
    }
    restored.characterGrowth = normalizeCharacterGrowth(backup.characterGrowth);
    restored.memories = visibleMemories.map(normalizeMemory);
    if (backup.version === 2 && (!Array.isArray(backup.memoryLinks) || backup.memoryLinks.some(link => !link || typeof link.a !== 'string' || typeof link.b !== 'string' || link.a === link.b || !memoryIds.has(link.a) || !memoryIds.has(link.b) || typeof link.reason !== 'string'))) throw new Error('备份中的记忆关联无效');
    restored.memoryLinks = normalizeMemoryLinks(backup.version === 2 ? backup.memoryLinks : [], restored.memories);
    restored.maintenanceTransaction = null;
    restored.memoryRevision++;
    return restored;
}
