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

// Ordinary SillyTavern keeps its existing provider-specific schema path.
export async function requestLegacyStructured(send, prompt, outputSchema, parse, maxTokens, label) {
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

export function jsonResponseFormat(outputSchema, type = 'json_schema') {
    if (type === 'json_object') return { type };
    return { type: 'json_schema', json_schema: { name: outputSchema.name, strict: outputSchema.strict ?? true, schema: structuredClone(outputSchema.value) } };
}

export function isJsonFormatRejected(error, type) {
    const chain = []; for (let item = error, depth = 0; item && depth < 4; item = item.cause, depth++) chain.push(item);
    const text = errorChain(error), metadata = chain.map(item => `${item.code || ''} ${item.providerCode || ''} ${item.category || ''}`).join(' ');
    if (chain.some(item => item.name === 'AbortError' || [401, 403, 402, 429].includes(Number(item.providerStatus)) || [401, 403, 402, 429].includes(Number(item.bridgeStatus)) || Number(item.providerStatus) >= 500)
        || /SCENE_DIARY_(?:STALE|JSON_(?:NETWORK|CONFIG|PROTOCOL|TRANSPORT|REFUSAL))/i.test(metadata)
        || /network|timeout|timed out|dns|tls|quota|rate[_ -]?limit|authentication|unauthori[sz]ed|forbidden|insufficient|permission denied|internal server error|service unavailable|invalid[_ -]?(?:api[_ -]?key|key)|api[_ -]?key.*(?:invalid|missing)|网络|超时|额度|限流/i.test(`${metadata} ${text}`)
        || /\b(?:HTTP|status)\s*[:=]?\s*(?:401|402|403|429|5\d\d)\b/i.test(text)) return false;
    // An invalid schema or a missing JSON prompt keyword is a configuration error.
    if (/invalid (?:json )?schema|schema.*(?:required|additionalProperties|properties|minimum|maximum)|must.*(?:contain|include).*\bjson\b|context|token.*(?:limit|exceed)/i.test(text)) return false;
    const named = type.replace('_', '[_ -]');
    return new RegExp(`(?:${named}|response[_ -]format(?:[. ]type)?)[^\\n]{0,100}(?:not supported|unsupported|unavailable|not available|not enabled|not allowed|unknown type)`, 'i').test(text)
        || new RegExp(`(?:not supported|unsupported|unavailable|not available|not enabled|unknown type)[^\\n]{0,100}(?:${named}|response[_ -]format(?:[. ]type)?)`, 'i').test(text)
        || (/response_format[.\[ '\"]*type/i.test(`${chain.map(item => item.param || '').join(' ')} ${text}`) && /(?:must be one of|allowed values|supported values|invalid enum|not in.*enum)/i.test(text));
}

function structureError(message) { return Object.assign(new Error(message), { code: 'SCENE_DIARY_SCHEMA' }); }

function validateShape(value, shape, path) {
    const types = Array.isArray(shape.type) ? shape.type : [shape.type];
    const matches = type => type === 'null' ? value === null : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : type === 'array' ? Array.isArray(value) : type === 'integer' ? Number.isInteger(value) : typeof value === type;
    if (!types.some(matches)) throw structureError(`${path} 类型不符合 JSON 协议（需要 ${types.join('/')}）`);
    if (shape.enum && !shape.enum.includes(value)) throw structureError(`${path} 不在允许值中`);
    if (typeof value === 'number' && (value < (shape.minimum ?? -Infinity) || value > (shape.maximum ?? Infinity))) throw structureError(`${path} 超出允许范围`);
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        for (const key of shape.required || []) if (!Object.hasOwn(value, key)) throw structureError(`${path}.${key} 缺少必需字段`);
        for (const key of Object.keys(value)) {
            if (!Object.hasOwn(shape.properties || {}, key)) { if (shape.additionalProperties === false) throw structureError(`${path} 存在未约定字段`); }
            else validateShape(value[key], shape.properties[key], `${path}.${key}`);
        }
    }
    if (Array.isArray(value) && shape.items) value.forEach((item, index) => validateShape(item, shape.items, `${path}[${index}]`));
}

export function parseStructuredObject(raw, outputSchema) {
    let value;
    try { value = typeof raw === 'string' ? JSON.parse(raw.trim()) : raw; }
    catch { throw structureError('JSON 无法完整解析'); }
    const shape = structuredClone(outputSchema.value);
    // Existing business validators retain safe entries and report bad proposals individually.
    if (outputSchema.name === OUTPUT_SCHEMAS.maintenance.name) delete shape.properties.operations.items;
    if (outputSchema.name === OUTPUT_SCHEMAS.memory.name) delete shape.properties.memories.items;
    validateShape(value, shape, '$');
    return value;
}

const formatInstruction = '只输出一个完整、可解析的 JSON 对象及所有必需字段。不要输出 Markdown、说明或工具调用。';
function withJsonInstruction(prompt) {
    return Array.isArray(prompt) ? [...structuredClone(prompt), { role: 'user', content: formatInstruction }] : [{ role: 'user', content: `${prompt}\n${formatInstruction}` }];
}

export async function requestStructured(send, prompt, outputSchema, parse, maxTokens, label, { assertCurrent = () => {}, onProgress = () => {}, connectionLabel = '' } = {}) {
    let type = 'json_schema';
    const messages = withJsonInstruction(prompt);
    const run = async (input, tokens) => {
        assertCurrent(); onProgress(`正在请求 ${type}…`);
        const result = await send(input, tokens, jsonResponseFormat(outputSchema, type));
        assertCurrent(); return result;
    };
    let raw;
    try { raw = await run(messages, maxTokens); }
    catch (first) {
        if (!isJsonFormatRejected(first, type)) throw first;
        assertCurrent(); type = 'json_object'; onProgress('json_schema 被拒，尝试 json_object…');
        try { raw = await run(messages, maxTokens); }
        catch (second) {
            if (!isJsonFormatRejected(second, type)) throw second;
            throw Object.assign(new Error(`${label}连接${connectionLabel ? `（${connectionLabel}）` : ''}拒绝两种 JSON 格式：json_schema：${errorChain(first)}；json_object：${errorChain(second)}`), { code: 'SCENE_DIARY_JSON_FORMATS_REJECTED' });
        }
    }
    const checked = value => {
        const object = parseStructuredObject(value, outputSchema);
        try { return parse(JSON.stringify(object)); }
        catch (error) {
            if (/JSON.*无法解析|日记正文为空|角色成长内容为空|角色成长超过 \d+ 字符/.test(error.message)) throw structureError(error.message);
            throw error;
        }
    };
    try { return checked(raw); }
    catch (error) {
        if (error?.code !== 'SCENE_DIARY_SCHEMA') throw error;
        // Repair accepted content once; never restart format negotiation here.
        assertCurrent(); onProgress(`使用 ${type} 修复 JSON 输出…`);
        const retryPrompt = [...messages, { role: 'user', content: `${retryInstruction} 结构错误：${error.message}` }];
        const retryRaw = await run(retryPrompt, Math.min(maxTokens * 2, 16384));
        try { return checked(retryRaw); }
        catch (retryError) {
            if (retryError?.code !== 'SCENE_DIARY_SCHEMA') throw retryError;
            throw Object.assign(new Error(`${label}两次输出均未满足 JSON 格式或必需字段：${retryError.message}`), { code: 'SCENE_DIARY_JSON_CONTENT' });
        }
    }
}
