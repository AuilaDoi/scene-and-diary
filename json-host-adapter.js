// TauriTavern's existing fetch bridge owns endpoint authorization and secrets.
// Host dependencies are loaded only on Tauri; this module is also testable in Node.
const clone = value => structuredClone(value);
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const formatKeys = new Set(['response_format', 'json_schema']);
const protectedKeys = new Set([
    'messages', 'prompt', 'model', 'chat_completion_source', 'secret_id', 'type', 'stream', 'n',
    'custom_url', 'custom_api_format', 'reverse_proxy', 'proxy_password', 'stop',
    'tools', 'tool_choice', 'functions', 'function_call', 'parallel_tool_calls',
    'enable_web_search', 'web_search_options', 'request_images', 'modalities',
    'max_tokens', 'max_completion_tokens', 'custom_include_body', 'custom_exclude_body', 'custom_include_headers',
]);
const textModels = new Set([
    'gpt-3.5-turbo-instruct', 'gpt-3.5-turbo-instruct-0914',
    'text-davinci-003', 'text-davinci-002', 'text-davinci-001', 'text-curie-001', 'text-babbage-001', 'text-ada-001',
    'code-davinci-002', 'code-davinci-001', 'code-cushman-002', 'code-cushman-001', 'text-davinci-edit-001',
    'code-davinci-edit-001', 'text-embedding-ada-002', 'text-similarity-davinci-001', 'text-similarity-curie-001',
    'text-similarity-babbage-001', 'text-similarity-ada-001', 'text-search-davinci-doc-001',
    'text-search-curie-doc-001', 'text-search-babbage-doc-001', 'text-search-ada-doc-001',
    'code-search-babbage-code-001', 'code-search-ada-code-001',
]);

function failure(message, code = 'SCENE_DIARY_JSON_CONFIG') {
    return Object.assign(new Error(message), { code });
}

export function redactJsonError(value, secrets = []) {
    let text = String(value ?? '');
    for (const secret of secrets.filter(item => typeof item === 'string' && item.length)) text = text.split(secret).join('[已隐藏]');
    return text.replace(/https?:\/\/[^\s"'<>]+/gi, '[地址已隐藏]')
        .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, '[已隐藏]')
        .replace(/\bBearer\s+[^\s,"'}]+/gi, 'Bearer [已隐藏]')
        .replace(/((?:api[_-]?key|authorization|proxy_password|password|secret|token)\s*["']?\s*[:=]\s*)["']?[^\s,"'}]+/gi, '$1[已隐藏]')
        .slice(0, 600);
}

export function assertJsonChatProtocol(payload) {
    const source = String(payload.chat_completion_source || '').toLowerCase();
    if (!['openai', 'deepseek', 'custom'].includes(source)
        || (source === 'custom' && !['', 'openai_compat'].includes(payload.custom_api_format || ''))
        || textModels.has(payload.model)
        || (source === 'openai' && payload.model === 'gpt-6-astra')) {
        throw failure('此连接的上游协议尚不支持本扩展的结构化 JSON 协商。请选择原生 DeepSeek、OpenAI Chat 或 Custom / OpenAI compatible 连接。', 'SCENE_DIARY_JSON_PROTOCOL');
    }
    if (typeof payload.model !== 'string' || !payload.model.trim()) throw failure('结构化请求连接未配置模型。');
}

function decode(value, parseYaml, field) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string') return clone(value);
    if (!value.trim()) return null;
    try { return parseYaml(value); }
    catch { throw failure(`无法解析附加参数 ${field}，请检查 YAML/JSON 配置。`); }
}

export function normalizeJsonOverrides(payload, parseYaml) {
    const rawInclude = decode(payload.custom_include_body, parseYaml, 'include_body');
    const rawExclude = decode(payload.custom_exclude_body, parseYaml, 'exclude_body');
    const include = Object.create(null);
    for (const entry of Array.isArray(rawInclude) ? rawInclude : [rawInclude]) {
        if (entry === null) continue;
        if (!plain(entry)) throw failure('附加 include_body 必须是对象或对象列表。');
        for (const [key, value] of Object.entries(entry)) include[key] = value;
    }
    let exclude;
    if (rawExclude === null) exclude = [];
    else if (typeof rawExclude === 'string') exclude = [rawExclude];
    else if (Array.isArray(rawExclude)) {
        if (rawExclude.some(key => key !== null && typeof key !== 'string')) throw failure('附加 exclude_body 列表必须只含字符串。');
        exclude = rawExclude.filter(key => key !== null);
    } else if (plain(rawExclude)) exclude = Object.keys(rawExclude);
    else throw failure('附加 exclude_body 必须是字符串、数组或对象。');
    exclude = [...new Set(exclude.map(key => key.trim()).filter(Boolean))];
    for (const key of [...Object.keys(include), ...exclude]) {
        if (protectedKeys.has(key)) throw failure(`附加请求体与结构化任务冲突：${key}。请从该连接的附加参数中移除此字段后重试。`);
    }
    const overridden = [...Object.keys(include), ...exclude].some(key => formatKeys.has(key));
    for (const key of formatKeys) delete include[key];
    return { include, exclude: exclude.filter(key => !formatKeys.has(key)), overridden };
}

function preparedPayload(base, overrides, messages, tokens, format) {
    const payload = clone(base);
    Object.assign(payload, { type: 'quiet', stream: false, json_schema: null, messages: clone(messages), max_tokens: tokens, response_format: clone(format) });
    if ('max_completion_tokens' in payload) payload.max_completion_tokens = tokens;
    // Chat Completions defaults to one result; omit n because DeepSeek does not document it.
    for (const key of ['n', 'stop', 'tools', 'tool_choice', 'functions', 'function_call', 'parallel_tool_calls', 'web_search_options', 'modalities', 'prompt', 'assistant_prefill']) delete payload[key];
    payload.enable_web_search = false;
    payload.request_images = false;
    // Rust applies these *after* provider shaping; pin the same complete format there.
    payload.custom_include_body = JSON.stringify({ ...overrides.include, response_format: format });
    payload.custom_exclude_body = JSON.stringify(overrides.exclude);
    return payload;
}

function additionalFor(host, settings) {
    if (typeof host.getAdditionalParametersForSource !== 'function') throw failure('当前客户端缺少结构化请求适配接口（附加参数）。请更新经验证的 TauriTavern 版本。');
    const parameters = host.getAdditionalParametersForSource(clone(settings), undefined, { create: false });
    return { custom_include_body: parameters.include_body, custom_exclude_body: parameters.exclude_body, custom_include_headers: parameters.include_headers };
}

function captureConnection(getContext, host, profileId) {
    const context = getContext();
    if (!plain(context.chatCompletionSettings)) throw failure('当前客户端缺少结构化请求适配接口（Chat Completion settings）。');
    const settings = clone(context.chatCompletionSettings);
    if (!profileId) {
        if (String(context.mainApi).toLowerCase() !== 'openai') throw failure('辅助整理需要 Chat Completion，或选择独立连接。');
        if (typeof host.getChatCompletionModel !== 'function' || typeof host.createGenerationParameters !== 'function') throw failure('当前客户端缺少结构化请求适配接口（请求构造器）。');
        const model = host.getChatCompletionModel(settings);
        assertJsonChatProtocol({ chat_completion_source: settings.chat_completion_source, custom_api_format: settings.custom_api_format, model });
        return { settings, model, name: '当前聊天连接', identity: JSON.stringify({ mainApi: context.mainApi, settings }) };
    }
    const service = context.ConnectionManagerRequestService;
    if (!service?.getProfile || !service?.validateProfile || context.extensionSettings?.disabledExtensions?.includes('connection-manager')) throw failure('连接管理器不可用。');
    const profile = clone(service.getProfile(profileId));
    const api = service.validateProfile(profile);
    if (api.selected !== 'openai' || !api.source) throw failure('独立辅助连接必须使用 Chat Completion。', 'SCENE_DIARY_JSON_PROTOCOL');
    settings.chat_completion_source = api.source;
    settings.custom_api_format = profile['custom-api-format'] || '';
    assertJsonChatProtocol({ chat_completion_source: api.source, custom_api_format: settings.custom_api_format, model: profile.model });
    const proxy = profile.proxy ? host.proxies?.find(item => item.name === profile.proxy) : null;
    if (profile.proxy && !proxy) throw failure('独立连接指定的代理配置不存在，请修正连接配置。');
    const parameters = additionalFor(host, settings);
    const base = {
        model: profile.model, chat_completion_source: api.source, secret_id: profile['secret-id'],
        custom_api_format: profile['custom-api-format'], custom_url: profile['api-url'],
        reverse_proxy: proxy?.url, proxy_password: proxy?.password,
        custom_prompt_post_processing: profile['prompt-post-processing'], use_sysprompt: true, ...parameters,
    };
    return { base, model: profile.model, name: String(profile.name || '独立连接'), identity: JSON.stringify({ profile, source: api.source, proxy, parameters }) };
}

function authenticationValues(payload, parseYaml) {
    const values = [payload.proxy_password];
    try {
        const headers = decode(payload.custom_include_headers, parseYaml, 'include_headers');
        for (const entry of Array.isArray(headers) ? headers : [headers]) if (plain(entry)) {
            for (const value of Object.values(entry)) if (typeof value === 'string') {
                const trimmed = value.trim();
                values.push(value, trimmed);
                if (/^Bearer\s+/i.test(trimmed)) values.push(trimmed.replace(/^Bearer\s+/i, ''));
            }
        }
    } catch { throw failure('无法解析附加认证头，请检查 include_headers 的 YAML/JSON 配置。'); }
    return values;
}

export async function createTauriJsonSession({ getContext, host, parseYaml, fetchImpl = globalThis.fetch, profileId = '', signal, assertCurrent = () => {}, onProgress = () => {} }) {
    if (typeof parseYaml !== 'function' || typeof fetchImpl !== 'function' || typeof getContext().getRequestHeaders !== 'function') throw failure('当前客户端缺少结构化请求适配接口（YAML/fetch/headers）。');
    const snapshot = captureConnection(getContext, host, profileId);
    const check = () => {
        if (signal?.aborted) throw signal.reason || new DOMException('请求已取消', 'AbortError');
        assertCurrent();
        if (captureConnection(getContext, host, profileId).identity !== snapshot.identity) throw failure('连接配置已改变，本次结构化请求已停止。请重新生成。', 'SCENE_DIARY_STALE');
    };
    check();
    let base = snapshot.base;
    if (!base) {
        const settings = clone(snapshot.settings);
        Object.assign(settings, { stream_openai: false, n: 1, enable_web_search: false, request_images: false });
        const result = await host.createGenerationParameters(settings, snapshot.model, 'quiet', [], { jsonSchema: null, allowToolCalls: false });
        check();
        if (!plain(result?.generate_data)) throw failure('客户端请求构造器未返回有效请求。');
        base = { ...result.generate_data, ...additionalFor(host, snapshot.settings) };
    }
    base = clone(base);
    assertJsonChatProtocol(base);
    if (base.model !== snapshot.model || (!profileId && (base.chat_completion_source !== snapshot.settings.chat_completion_source
        || (base.chat_completion_source === 'custom' && (base.custom_api_format || '') !== (snapshot.settings.custom_api_format || ''))))) throw failure('客户端请求构造器改变了模型或协议，本次请求已停止。', 'SCENE_DIARY_STALE');
    const overrides = normalizeJsonOverrides(base, parseYaml);
    const secrets = authenticationValues(base, parseYaml);
    const connectionLabel = `${redactJsonError(snapshot.name, secrets)} / ${redactJsonError(snapshot.model, secrets)}`;
    if (overrides.overridden) onProgress('本次辅助请求已覆盖附加参数中的 JSON 格式配置。');
    return {
        assertCurrent: check,
        connectionLabel,
        async send(messages, tokens, format) {
            check();
            const payload = preparedPayload(base, overrides, messages, tokens, format);
            let response;
            try {
                response = await fetchImpl('/api/backends/chat-completions/generate', {
                    method: 'POST', headers: getContext().getRequestHeaders(), cache: 'no-cache', body: JSON.stringify(payload), signal,
                });
            } catch (error) {
                check();
                throw failure(redactJsonError(error.message, secrets), 'SCENE_DIARY_JSON_NETWORK');
            }
            check();
            let text;
            try { text = await response.text(); }
            catch { check(); throw failure('结构化请求响应读取中断。', 'SCENE_DIARY_JSON_NETWORK'); }
            check();
            let envelope;
            try { envelope = JSON.parse(text); }
            catch { throw failure(`客户端返回无法解析的响应封装（HTTP ${response.status}），请检查服务地址。`, 'SCENE_DIARY_JSON_TRANSPORT'); }
            if (!response.ok || envelope?.error) {
                const error = envelope?.error;
                const detail = plain(error) ? error : envelope || {};
                const message = detail.message || (typeof error === 'string' ? error : envelope?.message) || `请求失败（HTTP ${response.status}）`;
                throw Object.assign(failure(redactJsonError(message, secrets), 'SCENE_DIARY_JSON_UPSTREAM'), {
                    bridgeStatus: response.status,
                    providerStatus: detail.status ?? detail.status_code,
                    providerCode: redactJsonError(detail.code || '', secrets),
                    category: redactJsonError(detail.category || '', secrets),
                    param: redactJsonError(detail.param || '', secrets),
                });
            }
            const choice = envelope?.choices?.[0], message = choice?.message;
            if (String(envelope?.id || '').startsWith('tauritavern-error-')) throw failure('客户端将后端错误包装成了助手回复，请更新支持 quiet 错误返回的 TauriTavern。', 'SCENE_DIARY_JSON_TRANSPORT');
            if (envelope?.choices?.length > 1) throw failure('模型返回了多个结果，本次结构化请求需要单个结果。', 'SCENE_DIARY_JSON_REFUSAL');
            if (message?.refusal || choice?.finish_reason === 'content_filter') throw failure('模型拒绝生成此结构化内容。', 'SCENE_DIARY_JSON_REFUSAL');
            if (message?.tool_calls?.length || message?.function_call) throw failure('模型返回了工具调用，未返回 JSON 文本。', 'SCENE_DIARY_JSON_REFUSAL');
            if (typeof message?.content !== 'string' || !message.content.trim()) throw failure('模型返回空内容，未返回 JSON 文本。', 'SCENE_DIARY_JSON_REFUSAL');
            return message.content;
        },
    };
}

export async function loadTauriJsonDependencies() {
    try {
        const host = await import('../../../openai.js');
        const { yaml } = await import('../../../../lib.js');
        if (typeof yaml?.parse !== 'function') throw new Error();
        return { host, parseYaml: value => yaml.parse(value) };
    } catch { throw failure('当前客户端缺少结构化请求适配接口，请更新经验证的 TauriTavern 版本。'); }
}
