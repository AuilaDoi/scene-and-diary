// Explicit formats require the bundled host adapter. Probe once per logical task.
export function createJsonSender(context, profile) {
    let ready;
    return async ({ messages, maxTokens, format, outputSchema }) => {
        ready ||= (async () => {
            let capabilities;
            try {
                const response = await fetch('/api/backends/chat-completions/json-formats', { headers: context.getRequestHeaders?.(), signal: AbortSignal.timeout(8000) });
                if (response.ok) capabilities = await response.json();
            } catch { /* A missing adapter is distinct from a provider rejecting JSON. */ }
            if (capabilities?.version !== 1 || !['json_schema', 'json_object'].every(item => capabilities.formats?.includes(item))) {
                const error = new Error('JSON 请求宿主适配不可用。请安装扩展 scripts/install-json-host-adapter.mjs 补丁，重启 SillyTavern 并刷新页面后重试。');
                error.code = 'SCENE_DIARY_JSON_ADAPTER_UNAVAILABLE';
                throw error;
            }
        })();
        await ready;
        const jsonSchema = { ...structuredClone(outputSchema), responseFormat: format, returnInvalid: true };
        if (profile) {
            const service = context.ConnectionManagerRequestService;
            if (!service?.sendRequest) throw new Error('连接管理器不可用。');
            const output = await service.sendRequest(profile, messages, maxTokens, { stream: false, extractData: true, includePreset: false, includeInstruct: false }, { json_schema: jsonSchema, json_response_format: format });
            return output?.content ?? output;
        }
        if (String(context.mainApi || '').toLowerCase() !== 'openai') throw new Error('辅助整理需要 Chat Completion，或选择独立连接。');
        const output = await context.generateRawData({ prompt: messages, api: 'openai', quietToLoud: true, responseLength: maxTokens, jsonSchema });
        return output?.content ?? output;
    };
}
