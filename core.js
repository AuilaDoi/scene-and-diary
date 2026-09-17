export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'scene_diary';

export const DEFAULT_SETTINGS = Object.freeze({
    recentDiaryCount: 5,
    diaryTargetLength: '400–800 Chinese characters',
    maxDiaryChars: 9000,
    maxHandoffChars: 2200,
    diaryConnectionProfile: '',
});

export function now() {
    return Date.now();
}

export function newId(prefix = 'sd') {
    const random = globalThis.crypto?.randomUUID?.();
    return `${prefix}_${random || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`;
}

export function createAct(id = 1, createdAt = now()) {
    return {
        id,
        status: 'active',
        messageIds: [],
        startMessageIndex: null,
        endMessageIndex: null,
        startSceneTime: null,
        endSceneTime: null,
        startSceneTimeSource: null,
        endSceneTimeSource: null,
        title: '',
        diary: '',
        handoff: {
            storyTime: null,
            location: null,
            situation: null,
            ongoingPlans: [],
            unresolvedThreads: [],
        },
        createdAt,
        closedAt: null,
        edited: false,
        dirty: false,
        revision: 0,
        sourceFingerprint: '',
    };
}

export function createState(createdAt = now()) {
    const firstAct = createAct(1, createdAt);
    return {
        version: SCHEMA_VERSION,
        currentActId: 1,
        status: 'active',
        acts: [firstAct],
        settings: { ...DEFAULT_SETTINGS },
        pendingTransaction: null,
        drafts: [],
        lastUpdatedAt: createdAt,
    };
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function asStringOrNull(value) {
    return value === null || value === undefined || value === '' ? null : String(value);
}

export function normalizeState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const fallback = createState();
    const acts = asArray(source.acts).map((act, index) => {
        const base = createAct(Number(act?.id) || index + 1, Number(act?.createdAt) || now());
        const handoff = act?.handoff && typeof act.handoff === 'object' ? act.handoff : {};
        return {
            ...base,
            ...act,
            id: Number(act?.id) || base.id,
            messageIds: asArray(act?.messageIds).map(String),
            status: ['active', 'closing', 'closed'].includes(act?.status) ? act.status : base.status,
            handoff: {
                ...base.handoff,
                ...handoff,
                location: asStringOrNull(handoff.location),
                situation: asStringOrNull(handoff.situation),
                ongoingPlans: asArray(handoff.ongoingPlans).map(String),
                unresolvedThreads: asArray(handoff.unresolvedThreads).map(String),
            },
        };
    });
    const normalizedActs = acts.length ? acts : fallback.acts;
    const ids = new Set(normalizedActs.map(act => act.id));
    const currentActId = ids.has(Number(source.currentActId)) ? Number(source.currentActId) : normalizedActs.at(-1).id;
    const status = ['active', 'closing', 'pending_next_act'].includes(source.status)
        ? source.status
        : (normalizedActs.find(act => act.id === currentActId)?.status === 'closed' ? 'pending_next_act' : 'active');
    return {
        ...fallback,
        ...source,
        version: SCHEMA_VERSION,
        currentActId,
        status,
        acts: normalizedActs,
        settings: { ...DEFAULT_SETTINGS, ...(source.settings || {}) },
        pendingTransaction: source.pendingTransaction && typeof source.pendingTransaction === 'object' ? source.pendingTransaction : null,
        drafts: asArray(source.drafts),
        lastUpdatedAt: Number(source.lastUpdatedAt) || now(),
    };
}

export function currentAct(state) {
    const acts = Array.isArray(state?.acts) ? state.acts : [];
    return acts.find(act => act.id === state.currentActId) || acts.at(-1) || null;
}

export function findAct(state, id) {
    return (Array.isArray(state?.acts) ? state.acts : []).find(act => act.id === Number(id)) || null;
}

export function ensureMessageMeta(message, actId, index = null) {
    message.extra ||= {};
    message.extra.scene_diary ||= {};
    const meta = message.extra.scene_diary;
    meta.messageId ||= newId('msg');
    if (actId !== null && actId !== undefined) meta.actId = Number(actId);
    if (index !== null && index !== undefined) meta.messageIndex = Number(index);
    return meta;
}

export function isNormalRpMessage(message) {
    return !!message && !message.is_system && message.extra?.type !== 'narrator' && message.extra?.scene_diary?.injected !== true;
}

export function filterPromptMessages(messages, actId) {
    return (Array.isArray(messages) ? messages : []).filter(message => {
        if (!isNormalRpMessage(message)) return true;
        return Number(message.extra?.scene_diary?.actId) === Number(actId);
    });
}

export function assignMessageToAct(state, message, actId, index = null) {
    const meta = ensureMessageMeta(message, actId, index);
    const act = findAct(state, actId);
    if (act && !act.messageIds.includes(meta.messageId)) act.messageIds.push(meta.messageId);
    state.lastUpdatedAt = now();
    return meta.messageId;
}

export function beginNextAct(state, message, index = null) {
    const previous = currentAct(state);
    const nextId = Math.max(...state.acts.map(act => Number(act.id) || 0), 0) + 1;
    const next = createAct(nextId);
    next.startMessageIndex = index;
    state.acts.push(next);
    state.currentActId = nextId;
    state.status = 'active';
    if (message) assignMessageToAct(state, message, nextId, index);
    if (previous) previous.status = 'closed';
    state.lastUpdatedAt = now();
    return next;
}

export function markClosing(state, transactionId, messageSnapshot = []) {
    const act = currentAct(state);
    if (!act || state.status !== 'active') throw new Error('No active act can be closed');
    act.status = 'closing';
    state.status = 'closing';
    state.pendingTransaction = {
        id: transactionId,
        actId: act.id,
        startedAt: now(),
        sourceFingerprint: fingerprint(messageSnapshot.map(message => `${message.extra?.scene_diary?.messageId || ''}:${message.mes || ''}`).join('\n')),
    };
    state.lastUpdatedAt = now();
    return act;
}

export function commitClosedAct(state, result, endMessageIndex = null) {
    const act = findAct(state, state.pendingTransaction?.actId || state.currentActId);
    if (!act) throw new Error('Act transaction target is missing');
    act.status = 'closed';
    act.endMessageIndex = endMessageIndex;
    act.closedAt = now();
    act.title = String(result.title || `第${act.id}幕`).trim();
    act.diary = String(result.diary || '').trim();
    act.handoff = normalizeHandoff(result.handoff);
    act.revision = Number(act.revision || 0) + 1;
    act.dirty = false;
    state.status = 'pending_next_act';
    state.pendingTransaction = null;
    state.lastUpdatedAt = now();
    return act;
}

export function abortClosing(state, errorMessage = '') {
    const act = currentAct(state);
    if (act?.status === 'closing') act.status = 'active';
    state.status = 'active';
    state.pendingTransaction = null;
    if (errorMessage) state.lastError = String(errorMessage);
    state.lastUpdatedAt = now();
}

export function markActDirty(state, actId) {
    const act = findAct(state, actId);
    if (!act || act.status !== 'closed') return false;
    act.dirty = true;
    act.revision = Number(act.revision || 0) + 1;
    state.lastUpdatedAt = now();
    return true;
}

export function normalizeHandoff(raw) {
    const value = raw && typeof raw === 'object' ? raw : {};
    return {
        storyTime: asStringOrNull(value.storyTime),
        location: asStringOrNull(value.location),
        situation: asStringOrNull(value.situation),
        ongoingPlans: asArray(value.ongoingPlans).map(String).filter(Boolean).slice(0, 12),
        unresolvedThreads: asArray(value.unresolvedThreads).map(String).filter(Boolean).slice(0, 12),
    };
}

export function extractSceneTime(text) {
    const match = String(text || '').match(/<scene_time\b[^>]*>\s*([^|｜<>\r\n]+)\s*[|｜]/i);
    if (!match) return null;
    const candidate = match[1].trim();
    return /^\d{3,4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(candidate) ? candidate : null;
}

export function extractStoryText(text) {
    let value = String(text || '');
    value = value.replace(/<thinking\b[^>]*>[\s\S]*?<\/thinking>/gi, '');
    value = value.replace(/<draft\b[^>]*>[\s\S]*?<\/draft>/gi, '');
    value = value.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/gi, '');
    value = value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    const plot = value.match(/<now_plot\b[^>]*>([\s\S]*?)<\/now_plot>/i);
    if (plot) value = plot[1];
    return value.replace(/<[^>]+>/g, ' ').replace(/\s{3,}/g, '\n\n').trim();
}

export function fingerprint(value) {
    const text = String(value ?? '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

export function stripJsonFence(value) {
    return String(value || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export function parseDiaryResponse(value) {
    const raw = stripJsonFence(typeof value === 'object' ? JSON.stringify(value) : value);
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        throw new Error(`日记模型返回的 JSON 无法解析：${error.message}`);
    }
    if (!parsed || typeof parsed !== 'object') throw new Error('日记模型返回的结果不是对象');
    if (!String(parsed.diary || '').trim()) throw new Error('日记正文为空');
    return {
        title: String(parsed.title || '').trim() || '未命名的一幕',
        diary: String(parsed.diary).trim(),
        handoff: normalizeHandoff(parsed.handoff),
    };
}

export function buildMemoryBlock(state, settings = DEFAULT_SETTINGS) {
    const closed = state.acts.filter(act => act.status === 'closed' && act.diary);
    const count = Math.max(0, Number(settings.recentDiaryCount) || 0);
    const selected = closed.slice(-count);
    const lines = ['[scene&diary 近期日记]', ...selected.map(act => {
        const time = act.endSceneTime || act.startSceneTime || '时间未记录';
        const review = act.dirty ? '｜原剧情已变化，日记待复核' : '';
        return `第${act.id}幕｜${act.title || '未命名'}｜${time}${review}\n${act.diary}`;
    })];
    const current = findAct(state, state.currentActId);
    if (current?.status === 'active' && state.status === 'active') {
        const previous = closed.at(-1);
        if (previous) {
            const handoff = previous.handoff || {};
            lines.push('[上一幕幕尾交接状态]');
            lines.push(`地点：${handoff.location || '未记录'}`);
            lines.push(`情境：${handoff.situation || '未记录'}`);
            if (handoff.ongoingPlans?.length) lines.push(`明确计划：${handoff.ongoingPlans.join('；')}`);
            if (handoff.unresolvedThreads?.length) lines.push(`未解决事项：${handoff.unresolvedThreads.join('；')}`);
        }
    }
    lines.push('[/scene&diary 近期日记]');
    return lines.join('\n').trim();
}

export function buildDiaryPrompt({ characterName, userName, previousHandoff, messages, targetLength }) {
    const body = messages.map((message, index) => {
        const speaker = message.is_user ? userName : (message.name || characterName || '角色');
        const time = extractSceneTime(message.mes);
        const text = extractStoryText(message.mes);
        return `【${index + 1}｜${speaker}${time ? `｜${time}` : ''}】\n${text}`;
    }).join('\n\n');
    return [
        `你正在以「${characterName || '角色'}」的第一人称书写私人恋爱日记。`,
        `玩家称呼：${userName || '玩家'}。`,
        `目标长度：${targetLength || DEFAULT_SETTINGS.diaryTargetLength}。`,
        '只依据本幕聊天记录，不补写没有发生的事实。日记记录角色注意到的细节、感受、关系变化和未说出口的想法；不要写模型思考、脚本、HTML 或数据库操作。',
        '同时返回客观的 handoff，只有下一幕保持连续性所需的地点、正在持续的情境、明确计划和未解决事项。',
        '上一幕 handoff 仅是背景，不能冒充本幕新发生的事情。',
        '必须只返回 JSON，不要 Markdown 代码围栏，格式如下：',
        '{"title":"短标题","diary":"角色第一人称日记","handoff":{"storyTime":null,"location":null,"situation":null,"ongoingPlans":[],"unresolvedThreads":[]}}',
        previousHandoff ? `上一幕 handoff 背景：${JSON.stringify(previousHandoff)}` : '上一幕 handoff 背景：无',
        '[本幕聊天记录]', body, '[/本幕聊天记录]',
    ].join('\n\n');
}

