// Copied to SillyTavern/src by the installer; no runtime dependency on the extension.
export const JSON_FORMAT_CAPABILITIES = Object.freeze({
    version: 1,
    formats: ['json_schema', 'json_object'],
    sources: ['openai', 'openrouter', 'custom', 'deepseek', 'mistralai', 'ai21', 'xai', 'aimlapi', 'chutes', 'electronhub', 'minimax', 'azure_openai', 'perplexity', 'groq', 'nanogpt', 'pollinations', 'moonshot', 'fireworks', 'zai', 'siliconflow'],
});

export function prepareJsonFormat(input, textModels = []) {
    const format = input.json_response_format ?? input.json_schema?.responseFormat;
    if (format === undefined) return null;
    const fail = (message, code = 'SCENE_DIARY_JSON_ADAPTER_UNAVAILABLE') => ({ error: { message, code, status: 400, source: input.chat_completion_source, model: input.model, requested_format: format } });
    if (!JSON_FORMAT_CAPABILITIES.formats.includes(format) || (input.json_schema?.responseFormat && input.json_schema.responseFormat !== format)) return fail('JSON 请求格式选项无效或冲突。', 'SCENE_DIARY_JSON_ADAPTER_INVALID');
    if (!JSON_FORMAT_CAPABILITIES.sources.includes(input.chat_completion_source) || !Array.isArray(input.messages) || textModels.includes(input.model)) return fail(`当前通道 ${input.chat_completion_source} 尚无显式 JSON 格式适配，请改用 OpenAI 兼容的 Chat Completion 连接。`);
    if (!input.json_schema?.name || input.json_schema?.value?.type !== 'object') return fail('JSON 输出协议必须包含名称和 object 类型的 Schema。', 'SCENE_DIARY_JSON_ADAPTER_INVALID');
    input.json_response_format = format;
    return null;
}

export function applyJsonResponseFormat(input, outgoing) {
    if (!input.json_response_format) return outgoing;
    outgoing.response_format = input.json_response_format === 'json_object'
        ? { type: 'json_object' }
        : { type: 'json_schema', json_schema: { name: input.json_schema.name, strict: input.json_schema.strict ?? true, schema: input.json_schema.value, ...(input.json_schema.description ? { description: input.json_schema.description } : {}) } };
    return outgoing;
}

export function jsonFormatProviderError(data, status, input) {
    if (!input.json_response_format) return data ?? { error: true };
    const detail = data?.error && typeof data.error === 'object' ? data.error : typeof data?.message === 'string' ? data : typeof data?.error === 'string' ? { message: data.error } : typeof data?.detail === 'string' ? { message: data.detail } : {};
    return { error: {
        message: typeof detail.message === 'string' ? detail.message : `模型服务请求失败（HTTP ${status}）`,
        code: detail.code || detail.type, param: detail.param, status,
        source: input.chat_completion_source, model: input.model,
        requested_format: input.json_response_format, effective_format: input.json_response_format,
    } };
}
