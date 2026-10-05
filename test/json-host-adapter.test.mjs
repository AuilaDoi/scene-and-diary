import test from 'node:test';
import assert from 'node:assert/strict';
import { createTauriJsonSession, normalizeJsonOverrides, assertJsonChatProtocol } from '../json-host-adapter.js';
import { OUTPUT_SCHEMAS, jsonResponseFormat, requestStructured } from '../model-protocol.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// Use the host's already installed YAML package only in tests; no new dependency.
const { parse: parseYaml } = require('yaml');

function fixture(options = {}) {
    const context = {
        mainApi: 'openai', chatCompletionSettings: { chat_completion_source: 'deepseek', custom_api_format: 'openai_compat', model: 'deepseek-flash', secret_id: 'CURRENT', custom_url: 'https://current.test', reverse_proxy: 'https://proxy.test', custom_include_body: '', custom_exclude_body: '', custom_include_headers: '' },
        getRequestHeaders: () => ({ 'Content-Type': 'application/json' }), extensionSettings: { disabledExtensions: [] },
    };
    const profile = { id: 'p', name: 'DeepSeek', api: 'deepseek', model: 'deepseek-flash', 'secret-id': 'PROFILE', 'api-url': 'https://profile.test', proxy: 'private' };
    context.ConnectionManagerRequestService = { getProfile: () => profile, validateProfile: p => ({ selected: 'openai', source: p.api }) };
    const host = {
        proxies: [{ name: 'private', url: 'https://profile-proxy.test', password: 'private-password' }],
        getChatCompletionModel: settings => settings.model,
        getAdditionalParametersForSource: settings => {
            const entry = settings.additional_parameters_by_source?.[settings.chat_completion_source];
            return entry || { include_body: settings.custom_include_body, exclude_body: settings.custom_exclude_body, include_headers: settings.custom_include_headers };
        },
        createGenerationParameters: async (settings, model, type, messages, extras) => {
            assert.deepEqual(extras, { jsonSchema: null, allowToolCalls: false });
            const payload = { ...settings, model, type, messages, tools: [{ name: 'inherited' }], stop: ['}'], enable_web_search: true, request_images: true, max_completion_tokens: 7 };
            if (settings.chat_completion_source !== 'custom') delete payload.custom_api_format;
            return { generate_data: payload };
        },
    };
    const calls = [];
    const dependencies = { getContext: () => context, host, parseYaml, fetchImpl: async (url, init) => {
        calls.push({ url, payload: JSON.parse(init.body), signal: init.signal });
        if (options.respond) return options.respond(calls.at(-1).payload, calls.length);
        return new Response(JSON.stringify({ choices: [{ message: { content: '{"characterGrowth":"相识"}' } }] }));
    } };
    return { context, profile, host, calls, dependencies };
}

test('bridge request pins both format modes after final body overrides and leaves settings untouched', async () => {
    const fixtureData = fixture({ respond: (_payload, count) => count === 1
        ? new Response(JSON.stringify({ error: { message: 'validation error: this response_format type is unavailable now' } }), { status: 502 })
        : new Response(JSON.stringify({ choices: [{ message: { content: '{"characterGrowth":"相识"}' } }] })) });
    const { context, dependencies, calls } = fixtureData;
    context.chatCompletionSettings.custom_include_body = 'response_format: {type: text}\nreasoning_effort: low';
    context.chatCompletionSettings.custom_exclude_body = '[response_format, json_schema]';
    const before = structuredClone(context.chatCompletionSettings), warnings = [];
    const session = await createTauriJsonSession({ ...dependencies, onProgress: value => warnings.push(value) });
    await requestStructured(session.send, '成长', OUTPUT_SCHEMAS.growth, JSON.parse, 6144, '成长', { assertCurrent: session.assertCurrent });
    assert.deepEqual(calls.map(call => call.payload.response_format.type), ['json_schema', 'json_object']);
    for (const { url, payload } of calls) {
        assert.equal(url, '/api/backends/chat-completions/generate');
        assert.equal(payload.type, 'quiet'); assert.equal(payload.stream, false); assert.equal('n' in payload, false);
        assert.equal(payload.json_schema, null); assert.equal(payload.secret_id, 'CURRENT');
        assert.equal(payload.reverse_proxy, before.reverse_proxy);
        assert.equal(payload.max_completion_tokens, 6144);
        assert.equal('tools' in payload, false); assert.equal('stop' in payload, false);
        assert.equal(payload.enable_web_search, false); assert.equal(payload.request_images, false);
        // Replay Rust's final top-level include then exclude pass.
        const upstream = { ...payload, ...JSON.parse(payload.custom_include_body) };
        for (const key of JSON.parse(payload.custom_exclude_body)) delete upstream[key];
        assert.deepEqual(upstream.response_format, payload.response_format);
        assert.equal(upstream.reasoning_effort, 'low');
    }
    assert.deepEqual(context.chatCompletionSettings, before);
    assert.match(warnings[0], /覆盖/);
});

test('independent profile freezes routing and credentials without current sampler inheritance', async () => {
    const { context, host, profile, dependencies, calls } = fixture();
    context.chatCompletionSettings.temperature = 1.8;
    context.chatCompletionSettings.additional_parameters_by_source = {
        deepseek: { include_body: 'reasoning_effort: low', exclude_body: '', include_headers: 'X-Feature: enabled' },
    };
    const before = structuredClone(context.chatCompletionSettings);
    const session = await createTauriJsonSession({ ...dependencies, profileId: 'p' });
    context.chatCompletionSettings.model = 'unrelated-main-model';
    await session.send([{ role: 'user', content: 'JSON' }], 400, jsonResponseFormat(OUTPUT_SCHEMAS.growth));
    const payload = calls[0].payload;
    assert.equal(payload.secret_id, 'PROFILE'); assert.equal(payload.custom_url, profile['api-url']);
    assert.equal(payload.reverse_proxy, host.proxies[0].url); assert.equal(payload.proxy_password, host.proxies[0].password);
    assert.equal('temperature' in payload, false); assert.equal(payload.custom_include_headers, 'X-Feature: enabled');
    assert.deepEqual(context.chatCompletionSettings.additional_parameters_by_source, before.additional_parameters_by_source);
    profile.model = 'changed';
    await assert.rejects(session.send([], 400, { type: 'json_object' }), /连接配置已改变/);
    assert.equal(calls.length, 1);
});

test('override normalization matches object-list and exclusion forms, and rejects task conflicts', () => {
    const result = normalizeJsonOverrides({ custom_include_body: '- {temperature: 0.2}\n- {temperature: 0.4, json_schema: {value: {}}}', custom_exclude_body: '{json_schema: true, response_format: true, top_p: true}' }, parseYaml);
    assert.deepEqual({ ...result.include }, { temperature: 0.4 }); assert.deepEqual(result.exclude, ['top_p']);
    assert.equal(result.overridden, true);
    assert.deepEqual(normalizeJsonOverrides({ custom_exclude_body: 'top_p' }, parseYaml).exclude, ['top_p']);
    for (const field of ['model', 'messages', 'stream', 'type', 'secret_id', 'tools', 'stop', 'n', 'max_tokens']) {
        assert.throws(() => normalizeJsonOverrides({ custom_include_body: { [field]: null } }, parseYaml), /冲突/);
        assert.throws(() => normalizeJsonOverrides({ custom_exclude_body: [field] }, parseYaml), /冲突/);
    }
    for (const config of [{ custom_include_body: 'bad: [' }, { custom_include_body: '[5]' }, { custom_exclude_body: '[4]' }]) assert.throws(() => normalizeJsonOverrides(config, parseYaml), /附加|解析/);
});

test('unsupported wire protocols and text/Responses routes are rejected before fetch', async () => {
    for (const payload of [
        { chat_completion_source: 'custom', custom_api_format: 'claude_messages', model: 'alias' },
        { chat_completion_source: 'custom', custom_api_format: 'openai_responses', model: 'alias' },
        { chat_completion_source: 'custom', custom_api_format: 'gemini_generate_content', model: 'alias' },
        { chat_completion_source: 'openai', model: 'gpt-6-astra' },
        { chat_completion_source: 'deepseek', model: 'text-davinci-003' },
        { chat_completion_source: 'makersuite', model: 'gemini' },
    ]) assert.throws(() => assertJsonChatProtocol(payload), /上游协议/);
    const { context, dependencies, calls } = fixture();
    context.chatCompletionSettings.chat_completion_source = 'claude';
    await assert.rejects(createTauriJsonSession(dependencies), /上游协议/); assert.equal(calls.length, 0);
});

test('missing proxy and host interfaces fail before any paid request', async () => {
    const { host, dependencies, calls } = fixture();
    host.proxies = [];
    await assert.rejects(createTauriJsonSession({ ...dependencies, profileId: 'p' }), /代理配置不存在/);
    delete host.getAdditionalParametersForSource;
    await assert.rejects(createTauriJsonSession(dependencies), /缺少结构化请求适配接口/);
    assert.equal(calls.length, 0);
});

test('connection changes during preparation and late returns are rejected without a retry', async () => {
    const { context, host, dependencies, calls } = fixture();
    host.createGenerationParameters = async () => { context.chatCompletionSettings.model = 'changed'; return { generate_data: {} }; };
    await assert.rejects(createTauriJsonSession(dependencies), /连接配置已改变/); assert.equal(calls.length, 0);
    const second = fixture({ respond: () => { second.context.chatCompletionSettings.model = 'changed'; return new Response(JSON.stringify({ error: { message: 'response_format unavailable' } }), { status: 502 }); } });
    const session = await createTauriJsonSession(second.dependencies);
    await assert.rejects(requestStructured(session.send, '成长', OUTPUT_SCHEMAS.growth, JSON.parse, 6144, '成长'), /连接配置已改变/);
    assert.equal(second.calls.length, 1);
});

test('abort signal reaches the existing bridge and late content is discarded', async () => {
    const controller = new AbortController();
    const data = fixture({ respond: () => { controller.abort(new DOMException('用户取消', 'AbortError')); return new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] })); } });
    const session = await createTauriJsonSession({ ...data.dependencies, signal: controller.signal });
    await assert.rejects(session.send([], 400, { type: 'json_object' }), { name: 'AbortError' });
    assert.equal(data.calls[0].signal, controller.signal);
});

test('errors preserve available metadata and redact credentials, never mistake bridge 502 for provider status', async () => {
    const data = fixture({ respond: () => new Response(JSON.stringify({ error: {
        message: 'json_schema unsupported private-password abc-secret https://api.test/?key=abc-secret', code: 'unsupported_format', param: 'response_format.type',
    } }), { status: 502 }) });
    data.context.chatCompletionSettings.proxy_password = 'private-password';
    data.context.chatCompletionSettings.custom_include_headers = 'Authorization: Bearer abc-secret';
    const session = await createTauriJsonSession(data.dependencies);
    await assert.rejects(session.send([], 400, { type: 'json_schema' }), error => {
        assert.equal(error.bridgeStatus, 502); assert.equal(error.providerStatus, undefined);
        assert.equal(error.param, 'response_format.type'); assert.equal(error.providerCode, 'unsupported_format');
        assert.doesNotMatch(error.message, /private-password|abc-secret|https:/); return true;
    });
});

test('HTTP 200 error envelopes, refusals, tools and empty text do not trigger format/content retries', async () => {
    for (const envelope of [
        { error: { message: 'quota exceeded', code: 'insufficient_quota' } },
        { choices: [{ message: { refusal: 'no', content: '' } }] },
        { choices: [{ message: { tool_calls: [{}], content: '{}' } }] },
        { choices: [{ message: { content: '{}' } }, { message: { content: '{}' } }] },
        { choices: [{ message: { content: '', reasoning_content: '{"characterGrowth":"hidden"}' } }] },
        { id: 'tauritavern-error-1', choices: [{ message: { content: '[API Error]' } }] },
    ]) {
        const data = fixture({ respond: () => new Response(JSON.stringify(envelope)) });
        const session = await createTauriJsonSession(data.dependencies);
        await assert.rejects(requestStructured(session.send, '成长', OUTPUT_SCHEMAS.growth, JSON.parse, 6144, '成长'));
        assert.equal(data.calls.length, 1);
    }
});
