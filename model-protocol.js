const string = { type: 'string' };
const nullableString = { type: ['string', 'null'] };
const object = properties => ({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
const schema = (name, properties) => ({ name: `scene_diary_${name}`, strict: true, value: object(properties) });
const source = object({ messageId: string, excerpt: string });
const memory = object({
    category: { type: 'string', enum: ['preference', 'habit', 'promise', 'relationship', 'event', 'item_place'] },
    title: string, content: string, people: { type: 'array', items: string }, aliases: { type: 'array', items: string },
    status: { type: 'string', enum: ['active', 'completed', 'cancelled', 'historical'] },
    importance: { type: 'integer' }, storyTime: nullableString, sources: { type: 'array', items: source },
});

export const OUTPUT_SCHEMAS = Object.freeze({
    diary: schema('diary', { title: string, diary: string }),
    memory: schema('memory', { memories: { type: 'array', items: memory } }),
    growth: schema('growth', { characterGrowth: string }),
    comparison: schema('comparison', { operations: { type: 'array', items: object({ action: { type: 'string', enum: ['add', 'merge', 'supersede', 'skip'] }, candidateId: string, targetId: nullableString, reason: string }) } }),
    maintenance: schema('maintenance', { operations: { type: 'array', items: object({ action: { type: 'string', enum: ['merge', 'supersede', 'set_status', 'archive'] }, candidateId: string, targetId: string, status: { type: ['string', 'null'], enum: ['active', 'completed', 'cancelled', 'historical', null] }, reason: string }) } }),
    rerank: schema('rerank', { selected_ids: { type: 'array', items: string } }),
});

function errorChain(error) { const messages = []; for (let current = error, depth = 0; current && depth < 4; current = current.cause, depth++) messages.push(String(current.message || current)); return messages.join(' '); }
const unsupportedFormat = error => /(?:json_schema|response_format|json object|structured output).*(?:unsupported|not supported|invalid|unknown)|(?:unsupported|not supported|invalid|unknown).*(?:json_schema|response_format|json object|structured output)/i.test(errorChain(error));
const invalidJson = error => error instanceof SyntaxError || /JSON.*(?:无法解析|invalid|parse|syntax)|(?:control character|property value|unexpected end)/i.test(errorChain(error));
export function requireArrayField(value, field, label) {
    if (!value || typeof value !== 'object' || !Array.isArray(value[field])) {
        const keys = value && typeof value === 'object' ? Object.keys(value).slice(0, 8).join('、') : typeof value;
        const error = new Error(`${label}未返回 ${field} 数组（实际字段：${keys || '无'}）`);
        error.code = 'SCENE_DIARY_SCHEMA';
        throw error;
    }
    return value;
}
const retryInstruction = '上一轮响应缺少必需字段，或不是可解析的完整 JSON。请按格式重新输出完整 JSON 对象及必需数组；字符串内的换行写成 \\n，双引号写成 \\"。不要输出 Markdown 或说明。';

export async function requestStructured(send, prompt, outputSchema, parse, maxTokens, label) {
    let useSchema = true;
    const run = async (messages, tokens) => {
        try { return await send(messages, tokens, useSchema ? outputSchema : null); }
        catch (error) {
            if (!useSchema || !unsupportedFormat(error)) throw error;
            useSchema = false;
            return send(messages, tokens, null);
        }
    };
    try { return parse(await run(prompt, maxTokens)); }
    catch (error) {
        if (!invalidJson(error) && error?.code !== 'SCENE_DIARY_SCHEMA') throw error;
        const retryPrompt = Array.isArray(prompt) ? [...prompt, { role: 'user', content: retryInstruction }] : `${prompt}\n${retryInstruction}`;
        try { return parse(await run(retryPrompt, Math.min(maxTokens * 2, 16384))); }
        catch (retryError) { throw new Error(`${label}两次输出均未满足 JSON 格式或必需字段：${errorChain(retryError)}`, { cause: retryError }); }
    }
}
