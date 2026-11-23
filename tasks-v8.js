import { buildDialogue, renderTemplate, newId } from './core.js';
import { clean, fact, validFact, saveFact } from './state-v8.js';

const formats = {
    diary: '{"title":"标题","body":"日记正文"}',
    memory: '{"memories":[{"title":"标题","content":"记忆内容","storyTime":null,"importance":3}]}，importance 是 1–5 的整数；storyTime 是字符串或 null；没有记忆点时返回 {"memories":[]}。',
    growth: '{"changed":true,"content":"完整候选画像"} 或 {"changed":false,"content":""}',
    test: '{"ok":true}',
};
export function taskModules(task, settings, character, profile, material) {
    const prompt = settings.prompts[task], tag = 'sd_' + task;
    return {
        system: renderTemplate(prompt.system, character),
        background: [character.context, profile && '[当前角色画像]\n' + profile].filter(Boolean).join('\n\n'),
        description: renderTemplate(prompt.description, character), material,
        format: '返回一个用 <' + tag + '> 和 </' + tag + '> 包裹的 JSON 对象。结构如下：\n' + formats[task],
    };
}
export function taskMessages(modules) {
    const { system, background, description, material, format } = modules;
    return [{ role: 'system', content: system }, { role: 'user', content: [
        '[背景参考]\n' + background, '[任务描述]\n' + description, '[内容素材]\n' + material, '[格式规定]\n' + format,
    ].join('\n\n') }];
}

export class TaskResponseError extends Error {
    constructor(message, rawResponse) {
        super(message);
        this.rawResponse = rawResponse;
    }
}

export function parseResult(task, text) {
    const blocks = [...text.matchAll(new RegExp('<sd_' + task + '>([\\s\\S]*?)</sd_' + task + '>', 'g'))];
    if (blocks.length !== 1) throw new TaskResponseError('需要一个完整的任务结果标签块，可重试本项。', text);
    let data;
    try { data = JSON.parse(blocks[0][1]); } catch { throw new TaskResponseError('标签内 JSON 无法解析，可重试本项。', text); }
    const valid = {
        diary: () => clean(data?.title) && clean(data?.body),
        memory: () => Array.isArray(data?.memories) && data.memories.every(m => validFact(m) && (m.storyTime === null || typeof m.storyTime === 'string')),
        growth: () => typeof data?.changed === 'boolean' && (data.changed ? !!clean(data.content) : data.content === ''),
        test: () => data?.ok === true,
    };
    if (!valid[task]()) throw new TaskResponseError('结果字段与格式规定不符，可重试本项。', text);
    return data;
}

export function growthSources(state, mode) {
    const diaries = state.diaries.filter(item => !item.needsReview && clean(item.body)).sort((a, b) => b.createdAt - a.createdAt);
    return (mode === 'global' ? diaries : diaries.slice(0, state.settings.growthDiaryCount)).reverse();
}
export function dialogueMaterial(messages, extraction, character) {
    const dialogue = buildDialogue(messages, extraction, character.char, character.user);
    if (dialogue.errors.length) throw new Error('正文或故事时间标签未匹配：' + dialogue.errors.map(item => '楼层 ' + (item.index + 1)).join('、'));
    return dialogue.text;
}
export function modulesFor(task, state, character, messages = [], mode = 'recent') {
    const material = task === 'growth'
        ? growthSources(state, mode).map(item => item.title + '\n' + item.body).join('\n\n')
        : dialogueMaterial(messages, state.settings.extraction, character);
    return taskModules(task, state.settings, character, state.characterGrowth.content, material);
}
export async function closeOutput(task, state, transaction, messages, request) {
    const result = await request(task, taskMessages(modulesFor(task, state, transaction.character, messages)));
    if (task === 'diary') return { title: result.title, body: result.body };
    return result.memories.map(({ title, content, storyTime, importance }) => ({
        id: newId('proposal'), accepted: true, value: fact({ title, content, storyTime, importance }),
    }));
}
export function applyProposals(state, proposals) {
    for (const proposal of proposals.filter(item => item.accepted)) {
        saveFact(state, { ...proposal.value, id: newId('fact'), locked: false });
    }
}
