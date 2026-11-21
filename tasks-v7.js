import { buildDialogue, fingerprint, newId, renderTemplate } from './core.js';
import { archive } from './recall-v7.js';
import { clean, fact, CATEGORIES, EDGE_TYPES, eligible, edgeKey, normalizeEdges, saveFact, validFact } from './state-v7.js';

const string = { type: 'string' };
const nullable = { type: ['string', 'null'] };
const array = items => ({ type: 'array', items });
const enumString = values => ({ type: 'string', enum: values });
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const schema = (name, shape) => ({ name: 'scene_diary_' + name, value: object(shape) });
const factShape = object({
    category: enumString(Object.keys(CATEGORIES)), title: string, content: string, people: array(string), aliases: array(string),
    importance: { type: 'integer', minimum: 1, maximum: 5 }, storyTime: nullable,
});
const actions = ['new', 'duplicate', 'supplement', 'update'];
const schemas = {
    diary: schema('diary_with_summary', { title: string, body: string, summary: string }),
    growth: schema('growth_evaluation', { changed: { type: 'boolean' }, content: string }),
    memory: schema('facts', { facts: array(factShape) }),
    decisions: schema('fact_decisions', { decisions: array(object({ candidateId: string, action: enumString(actions), targetId: nullable, content: string })) }),
    summary: schema('summary', { summary: string }),
    graph: schema('typed_edges', { edges: array(object({ from: string, to: string, type: enumString(Object.keys(EDGE_TYPES)), reason: string })) }),
};

function required(value, label) {
    if (!clean(value)) throw new Error(label + '为空，可重试或手动填写。');
    return clean(value);
}

function promptText(prompt, transaction) {
    return renderTemplate(prompt, { char: transaction.character.char, user: transaction.character.user });
}

const growthInstructions = '维护一份简洁的当前角色画像，聚焦仍然成立的人格、价值观、情感、信任、生活状态和重要经历的长期影响。结合初始设定，保留有证据的变化，避免按时间罗列或把日常写成成长。';

const diarySummaryStyle = '摘要应保留经历的经过、关键互动和长期意义，方便日后找回脉络，约 150–300 字。独立、精准的事实由事实库整理。';

export async function closeOutput(kind, state, transaction, messages, request, rank, settings = state.settings) {
    if (kind === 'growth') {
        const diary = transaction.results.diary.value;
        const query = diary.summary || diary.body;
        const recent = archive(state).slice(0, settings.recentDiaryCount);
        const recentIds = new Set(recent.map(item => item.id));
        const older = archive(state).filter(item => !recentIds.has(item.id) && !item.summaryPending)
            .map(item => ({ id: item.id, title: item.title, content: item.summary }));
        const historical = (await rank(older, query, '历史日记', { useImportance: false })).filter(item => item.score >= settings.recallScoreThreshold).slice(0, 3);
        const history = [...recent.map(item => item.summaryPending ? item.body : item.summary), ...historical.map(item => item.memory.content)];
        const result = await request('growth', [growthInstructions, promptText(settings.prompts.growth, transaction),
            '只有实质变化才返回 changed=true 及完整画像，否则 changed=false、content=""。',
            '初始设定：' + transaction.character.context, '现画像：' + state.characterGrowth.content,
            '近期与相关历史：' + history.join('\n\n'), '已确认的本幕日记：' + diary.body].join('\n\n'), schemas.growth);
        return { changed: result.changed, content: result.changed ? required(result.content, '候选画像') : '' };
    }
    const dialogue = buildDialogue(messages, settings.extraction, transaction.character.char, transaction.character.user);
    if (dialogue.errors.length) throw new Error('正文或故事时间标签未匹配。' + dialogue.errors.map(item => '楼层 ' + (item.index + 1) + ' ' + item.errors.join('、')).join('；'));
    if (kind === 'diary') {
        const result = await request('diary', [promptText(settings.prompts.diary, transaction), diarySummaryStyle,
            '以角色第一人称保留情节、互动细节、关键对话与当时感受。正文目标长度 ' + settings.diaryTargetLength,
            '初始设定：' + transaction.character.context, '本幕对话：\n' + dialogue.text].join('\n\n'), schemas.diary);
        return { title: clean(result.title) || '未命名日记', body: required(result.body, '日记正文'), summary: required(result.summary, '日记摘要') };
    }
    return extractFacts(state, dialogue, transaction, request, rank, settings);
}

const material = item => ({ id: item.id, category: item.category, title: item.title, content: item.content, storyTime: item.storyTime, locked: item.locked });
async function extractFacts(state, dialogue, transaction, request, rank, settings) {
    const returned = await request('memory', [
        promptText(settings.prompts.memory, transaction),
        '提取四类可供后续直接使用的独立客观事实。忽略日常流水、愿望、推测、心理和未落实计划。无合格事实返回空数组。',
        'preference 偏好：主体、喜好或厌恶的对象。npc_relationship：NPC 与角色或玩家的客观关系。item：有用途、归属或特殊意义的物品。place：地点及可复用的位置、条件或用途。',
        '角色 ' + transaction.character.char + '，玩家 ' + transaction.character.user + '。故事时间仅使用对话中标出的时间。最多 30 条。',
        '本幕对话：\n' + dialogue.text,
    ].join('\n\n'), schemas.memory);
    const facts = returned.facts.slice(0, 30).map(item => fact(item)).filter(validFact);
    const corpus = state.memories.filter(eligible);
    const matches = [];
    // Limit concurrent provider work while preserving a per-candidate retrieval query.
    for (let offset = 0; offset < facts.length; offset += 4) {
        const batch = facts.slice(offset, offset + 4);
        const groups = await Promise.all(batch.map(async candidate => ({
            candidate,
            existing: (await rank(corpus, candidate.content, '事实', { includePermanent: true, useImportance: false }))
                .filter(item => item.score >= settings.maintenanceScoreThreshold).slice(0, 5).map(item => material(item.memory)),
        })));
        matches.push(...groups);
    }
    const decisions = new Map();
    for (let offset = 0; offset < matches.length; offset += 8) {
        const batch = matches.slice(offset, offset + 8).filter(item => item.existing.length);
        if (!batch.length) continue;
        const result = await request('memory', [
            '对照每个候选对应的已有事实。每个候选使用 candidateId 输出一个判断：new 新事实；duplicate 同义重复；supplement 同一事实的补充；update 已发生的状态变化。',
            'new 的 targetId 为 null，其余只允许使用该候选所列的已有 ID。补充或变化的 content 写出应用后的完整客观事实。',
            JSON.stringify(batch.map(({ candidate, existing }) => ({ ...material(candidate), existing }))),
        ].join('\n\n'), schemas.decisions);
        for (const input of batch) {
            const resultItem = result.decisions.find(item => item.candidateId === input.candidate.id);
            if (!resultItem || (resultItem.action !== 'new' && !input.existing.some(item => item.id === resultItem.targetId))) {
                throw new Error('事实判定遗漏候选或引用了无效目标，可重试此项。');
            }
            decisions.set(input.candidate.id, resultItem);
        }
    }
    return matches.map(({ candidate, existing }) => {
        const decision = decisions.get(candidate.id);
        const action = decision?.action || 'new', targetId = action === 'new' ? null : decision.targetId;
        const old = existing.find(item => item.id === targetId);
        return {
            id: newId('proposal'), action, targetId, targetContent: old?.content, targetStoryTime: old?.storyTime,
            value: { ...candidate, content: ['supplement', 'update'].includes(action) ? required(decision.content, '拟更新事实') : candidate.content },
            accepted: action !== 'duplicate' && !old?.locked,
        };
    });
}

export function applyProposals(state, proposals) {
    const targets = new Set();
    for (const proposal of proposals.filter(item => item.accepted && item.action !== 'duplicate')) {
        if (!validFact(proposal.value)) throw new Error('已接受的事实必须分类并填写标题和正文。');
        const id = proposal.targetId;
        if (id) {
            if (targets.has(id)) throw new Error('同一事实有多条已接受的修改，请只保留一条。');
            const old = state.memories.find(item => item.id === id);
            if (!eligible(old) || old.locked) throw new Error('修改目标已删除、未分类或已锁定，请重新审核。');
            if (proposal.targetContent !== old.content || proposal.targetStoryTime !== (old.storyTime ?? null)) throw new Error('目标事实已修改，请重新提取或拒绝此建议。');
            targets.add(id);
            saveFact(state, {
                title: proposal.value.title, content: proposal.value.content, storyTime: proposal.value.storyTime || old.storyTime,
                people: [...old.people, ...proposal.value.people], aliases: [...old.aliases, ...proposal.value.aliases],
            }, id);
        } else {
            const matching = state.memories.some(item => eligible(item) && item.category === proposal.value.category
                && item.content.trim().toLocaleLowerCase() === proposal.value.content.trim().toLocaleLowerCase());
            if (!matching) saveFact(state, proposal.value);
        }
    }
}

export async function summarizeDiary(item, request) {
    const result = await request('summary', diarySummaryStyle + '\n标题：' + item.title + '\n正文：\n' + item.body, schemas.summary);
    return required(result.summary, '日记摘要');
}

function chunks(text, size = 12000) {
    const blocks = [];
    for (let offset = 0; offset < text.length; offset += size) blocks.push(text.slice(offset, offset + size));
    return blocks;
}

async function growthSummary(text, request) {
    const result = await request('growth', '概括这批叙事材料中与持久人物状态有关的事实与变化，约 800 字。把阶段性变化与当前状态区分。输出 summary。\n' + text, schemas.summary);
    return required(result.summary, '成长归纳');
}

export async function rebuildGrowth(state, character, request, progress) {
    const material = archive(state).reverse();
    if (!material.length) throw new Error('请先保存至少一篇有效日记。');
    let sources = chunks(material.map(item => item.title + '\n' + item.body).join('\n\n'));
    let stage = 1;
    while (sources.length > 1) {
        const summaries = [];
        for (const text of sources) {
            progress('归纳第 ' + stage + ' 层，第 ' + (summaries.length + 1) + '/' + sources.length + ' 批');
            summaries.push(await growthSummary(text, request));
        }
        stage++;
        if (summaries.join('\n\n').length >= sources.join('\n\n').length) throw new Error('归纳内容未缩短，请以较小的渠道输出额度重试。');
        sources = chunks(summaries.join('\n\n'));
    }
    const output = await request('growth', [growthInstructions, '覆盖全部提供的历史素材，形成一份完整画像。现画像用于核对。',
        '初始设定：' + character.context, '现画像：' + state.characterGrowth.content, '日记材料：\n' + sources[0]].join('\n\n'), schemas.growth);
    return required(output.changed ? output.content : state.characterGrowth.content, '重整画像');
}

export const graphSignature = item => fingerprint(JSON.stringify(material(item)));

export async function proposeGraph(state, mode, request, rank, progress) {
    const memories = state.memories.filter(eligible);
    const reviewed = Object.fromEntries(memories.map(item => [item.id, graphSignature(item)]));
    const anchors = mode === 'full' ? memories : memories.filter(item => state.graphReviewed[item.id] !== reviewed[item.id]);
    const byId = new Map(memories.map(item => [item.id, item]));
    const pairs = new Map(), outputs = new Map();
    const existing = new Set(state.edges.map(edgeKey));
    for (let offset = 0; offset < anchors.length; offset++) {
        const anchor = anchors[offset];
        progress('检索候选 ' + (offset + 1) + '/' + anchors.length);
        const hits = await rank(memories, anchor.content, '事实', { includePermanent: true, excludeId: anchor.id, useImportance: false });
        for (const hit of hits.filter(item => item.memory.id !== anchor.id && item.score >= state.settings.maintenanceScoreThreshold).slice(0, state.settings.maintenanceCandidateLimit)) {
            const ids = [anchor.id, hit.memory.id].sort();
            pairs.set(JSON.stringify(ids), ids);
        }
    }
    const pool = [...pairs.values()];
    for (let offset = 0; offset < pool.length; offset += 8) {
        const batch = pool.slice(offset, offset + 8);
        const keys = new Set(batch.map(ids => JSON.stringify(ids)));
        progress('整理候选 ' + (offset + 1) + '–' + (offset + batch.length) + '/' + pool.length);
        const result = await request('graph', [
            state.settings.prompts.maintenance,
            '仅用所给事实对提议有证据且有助于精准检索的有向关系。同人、同地点、同话题不足以建边。没有明确关系返回空数组。',
            'from 与 to 使用真实 ID。必须用 reason 说明两个已有事实如何支持该方向。',
            JSON.stringify(Object.fromEntries(Object.entries(EDGE_TYPES).map(([id, type]) => [id, type.meaning]))),
            JSON.stringify(batch.map(ids => ids.map(id => material(byId.get(id))))),
        ].join('\n\n'), schemas.graph);
        for (const edge of normalizeEdges(result.edges, memories)) {
            if (!keys.has(JSON.stringify([edge.from, edge.to].sort()))) continue;
            if (mode === 'incremental' && existing.has(edgeKey(edge))) continue;
            outputs.set(edgeKey(edge), { ...edge, accepted: true });
        }
    }
    return { mode, edges: [...outputs.values()], reviewed, revision: state.memoryRevision };
}
