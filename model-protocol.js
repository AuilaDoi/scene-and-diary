const string = { type: 'string' };
const nullableString = { type: ['string', 'null'] };
const object = properties => ({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
const schema = (name, properties) => ({ name: `scene_diary_${name}`, strict: true, value: object(properties) });
const memory = object({
    category: { type: 'string', enum: ['preference', 'habit', 'promise', 'relationship', 'event', 'item_place'] },
    title: string, content: string, people: { type: 'array', items: string }, aliases: { type: 'array', items: string },
    importance: { type: 'integer', minimum: 1, maximum: 5 }, storyTime: nullableString,
});

export const OUTPUT_SCHEMAS = Object.freeze({
    diary: schema('diary', { title: string, diary: string }),
    memory: schema('memory', { memories: { type: 'array', items: memory } }),
    growth: schema('growth', { characterGrowth: string }),
    maintenance: schema('maintenance', { operations: { type: 'array', items: object({ action: { type: 'string', enum: ['merge', 'link'] }, memberIds: { type: 'array', items: string }, targetId: nullableString, title: nullableString, content: nullableString, category: nullableString, a: nullableString, b: nullableString, reason: string }) } }),
});

function errorNodes(error) { const nodes = []; for (let current = error; current && nodes.length < 4; current = current.cause) nodes.push(current); return nodes; }
export function safeJsonError(error) {
    return errorNodes(error).map(item => String(item.message || item)).join(' ').replace(/Bearer\s+[^\s"']+/gi, 'Bearer [redacted]').replace(/\bsk-[\w-]+/g, '[redacted]').replace(/((?:api[_-]?key|authorization|proxy_password)\s*[=:]\s*)[^\s,;]+/gi, '$1[redacted]').slice(0, 800);
}
export function unsupportedJsonFormat(error) {
    const nodes = errorNodes(error);
    if (nodes.some(item => String(item.code || '').startsWith('SCENE_DIARY_JSON_ADAPTER'))) return false;
    const status = nodes.find(item => item.status)?.status;
    if (status && (Number(status) >= 500 || [401, 403, 408, 429].includes(Number(status)))) return false;
    if (nodes.some(item => /^(?:unsupported_parameter|unsupported_response_format|unknown_parameter)$/.test(item.code || '') && /^(?:response_format|json_schema|json_object)(?:[.\[]|$)/i.test(item.param || ''))) return true;
    const message = safeJsonError(error);
    if (/(?:invalid (?:json )?schema|schema.*(?:required|additionalProperties)|must.*(?:contain|include).*json|rate limit|quota|balance|timeout|timed out|network|ECONN|ENOTFOUND|abort|unauthorized|authentication|invalid api key)/i.test(message)) return false;
    if (nodes.some(item => item.code === 'invalid_value' && item.param === 'response_format.type')) return true;
    if (/(?:json_schema|json_object)[\s\S]*(?:supported values|must be one of|expected one of)/i.test(message) && /(?:text|json_object|json_schema)/i.test(message)) return true;
    const format = '(?:json_schema|json_object|response_format|json object|structured output)';
    const rejection = '(?:unsupported|not supported|does not support|unavailable|not available|not implemented|unknown (?:parameter|field|type)|unrecognized (?:parameter|field|type)|not allowed)';
    return new RegExp(`${format}[\\s\\S]*${rejection}|${rejection}[\\s\\S]*${format}`, 'i').test(message);
}
const invalidJson = error => !errorNodes(error).some(item => item.status) && (errorNodes(error).some(item => item instanceof SyntaxError) || /JSON.*(?:无法解析|parse|syntax)|(?:control character|property value|unexpected end)/i.test(safeJsonError(error)));
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
    let format = 'json_schema', repaired = false;
    const rejections = [];
    const base = Array.isArray(prompt) ? structuredClone(prompt) : [{ role: 'user', content: String(prompt) }];
    const structure = `只输出一个完整 JSON 对象，不要 Markdown 或说明。必须符合以下 JSON Schema；无条目时返回对应的空数组：\n${JSON.stringify(outputSchema.value)}`;
    for (;;) {
        const messages = [...structuredClone(base), { role: 'user', content: structure }, ...(repaired ? [{ role: 'user', content: retryInstruction }] : [])];
        let value;
        try {
            value = await send({ messages, maxTokens: repaired ? Math.min(maxTokens * 2, 16384) : maxTokens, format, outputSchema });
        } catch (error) {
            if (unsupportedJsonFormat(error)) {
                const detail = errorNodes(error).find(item => item.status || item.effectiveFormat) || error;
                rejections.push({ format, effectiveFormat: detail.effectiveFormat || format, status: detail.status, code: detail.code, source: detail.source, model: detail.model, connection: detail.connection, reason: safeJsonError(error) });
                if (format === 'json_schema') { format = 'json_object'; continue; }
                const failure = new Error(`${label}失败：当前连接的模型不支持本次 JSON 请求的两种格式。\n${rejections.map(item => `${item.format}：${item.reason}`).join('\n')}\n请更换支持 JSON 输出的连接或模型后重试该部分。`, { cause: error });
                failure.code = 'SCENE_DIARY_JSON_FORMAT_UNSUPPORTED';
                failure.jsonAttempts = rejections;
                throw failure;
            }
            if (!invalidJson(error)) {
                const failure = new Error(`${label}请求失败：${safeJsonError(error)}${rejections.length ? `\n此前 ${rejections[0].format} 被拒绝：${rejections[0].reason}` : ''}`, { cause: error });
                const detail = errorNodes(error).find(item => item.code || item.status) || error;
                Object.assign(failure, { code: detail.code, status: detail.status, source: detail.source, model: detail.model, effectiveFormat: detail.effectiveFormat });
                failure.jsonAttempts = rejections;
                throw failure;
            }
            value = error;
        }
        try {
            if (value instanceof Error) throw value;
            return parse(value);
        } catch (error) {
            if (!invalidJson(error) && error?.code !== 'SCENE_DIARY_SCHEMA') throw error;
            if (!repaired) { repaired = true; continue; }
            const failure = new Error(`${label}两次输出均未满足 JSON 格式或必需字段：${safeJsonError(error)}`, { cause: error });
            failure.code = 'SCENE_DIARY_JSON_OUTPUT_INVALID';
            failure.jsonAttempts = rejections;
            throw failure;
        }
    }
}
