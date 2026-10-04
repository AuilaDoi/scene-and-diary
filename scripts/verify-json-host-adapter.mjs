// Real host acceptance with synthetic prompts and an isolated data root.
// Opt into the saved DeepSeek profile with --live-deepseek; never print credentials.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { requestStructured, OUTPUT_SCHEMAS } from '../model-protocol.js';
import { createJsonSender } from '../json-request.js';

const args = process.argv.slice(2), rootIndex = args.indexOf('--host-root');
const root = resolve(rootIndex >= 0 ? args[rootIndex + 1] : resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..'));
const temporary = await mkdtemp(join(tmpdir(), 'scene-diary-json-'));
const dataRoot = join(temporary, 'data');
const originalFetch = globalThis.fetch;
let child, cookie = '', token = '', log = '', hostBase, scenario = 'schema', liveProfile;
const observed = [];
const stub = createServer(async (request, response) => {
    let text = ''; for await (const chunk of request) text += chunk;
    const body = JSON.parse(text);
    observed.push(body);
    const format = body.response_format?.type;
    let status = 200, error;
    if (scenario === 'both' || (scenario === 'object' && format === 'json_schema')) { status = 400; error = { message: `This response_format type is unavailable now: ${format}`, code: 'unsupported_parameter', param: 'response_format.type' }; }
    if (scenario === 'quota' && format === 'json_schema') { status = 429; error = { message: '429 rate limit', code: 'rate_limit_exceeded' }; }
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(error ? { error } : { id: 'synthetic', choices: [{ message: { role: 'assistant', content: '{"memories":[]}' }, finish_reason: 'stop' }] }));
});

try {
    await mkdir(join(dataRoot, 'default-user'), { recursive: true });
    if (args.includes('--live-deepseek')) {
        const settings = JSON.parse(await readFile(join(root, 'data/default-user/settings.json'), 'utf8'));
        liveProfile = settings.extension_settings.connectionManager.profiles.find(item => item.name === 'deepseek deepseek-flash');
        if (!liveProfile || liveProfile.api !== 'deepseek' || liveProfile.proxy !== 'None') throw new Error('未找到预期的原生 DeepSeek 测试连接');
        const secrets = JSON.parse(await readFile(join(root, 'data/default-user/secrets.json'), 'utf8'));
        const secret = secrets.api_key_deepseek.find(item => item.id === liveProfile['secret-id']);
        if (!secret) throw new Error('测试连接密钥无法解析');
        await writeFile(join(dataRoot, 'default-user/secrets.json'), JSON.stringify({ api_key_deepseek: [secret] }), { mode: 0o600 });
    }
    stub.listen(0, '127.0.0.1'); await once(stub, 'listening');
    const stubBase = `http://127.0.0.1:${stub.address().port}`;
    const reservation = createServer(); reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
    const port = reservation.address().port; await new Promise(resolveClose => reservation.close(resolveClose));
    hostBase = `http://127.0.0.1:${port}`;
    child = spawn(process.execPath, ['server.js', '--port', String(port), '--listen', 'false', '--browserLaunchEnabled', 'false', '--dataRoot', dataRoot], { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => { log = (log + chunk.toString()).slice(-3000); });
    child.stderr.on('data', chunk => { log = (log + chunk.toString()).slice(-3000); });
    let started = false;
    for (let attempt = 0; attempt < 100; attempt++) {
        if (child.exitCode !== null) throw new Error('测试宿主启动失败');
        try { const response = await originalFetch(`${hostBase}/csrf-token`); if (response.ok) { cookie = response.headers.getSetCookie().map(item => item.split(';')[0]).join('; '); token = (await response.json()).token; started = true; break; } } catch { /* Startup */ }
        await new Promise(resolveWait => setTimeout(resolveWait, 300));
    }
    if (!started) throw new Error('测试宿主启动超时');
    console.log('Isolated SillyTavern started; active user data is not used for writes.');
    globalThis.fetch = (url, options) => typeof url === 'string' && url.startsWith('/') ? originalFetch(hostBase + url, { ...options, headers: { ...options?.headers, Cookie: cookie } }) : originalFetch(url, options);
    const headers = () => ({ 'Content-Type': 'application/json', 'X-CSRF-Token': token });
    const sendHost = async (messages, tokens, schema, override, source, live = false) => {
        const payload = { messages, max_tokens: tokens, stream: false, include_reasoning: false, chat_completion_source: source, model: live ? liveProfile.model : 'synthetic-model', json_schema: schema, ...override, ...(live ? { secret_id: liveProfile['secret-id'] } : source === 'custom' ? { custom_url: stubBase, custom_include_body: '', custom_exclude_body: '' } : { reverse_proxy: stubBase, proxy_password: 'synthetic-test-token' }) };
        const response = await globalThis.fetch('/api/backends/chat-completions/generate', { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
        const data = await response.json();
        if (!response.ok || data.error) {
            const detail = data.error || {};
            throw Object.assign(new Error(detail.message || 'Host request failed'), { code: detail.code, param: detail.param, status: detail.status || response.status, source: detail.source, model: detail.model, effectiveFormat: detail.effective_format });
        }
        return { content: data.choices[0].message.content };
    };
    const context = (source, live = false) => ({ mainApi: 'openai', getRequestHeaders: headers, generateRawData: input => sendHost(input.prompt, input.responseLength, input.jsonSchema, {}, source, live), ConnectionManagerRequestService: { sendRequest: (_id, messages, tokens, _options, override) => sendHost(messages, tokens, override.json_schema, override, source, live) } });
    const prompt = [{ role: 'user', content: 'Synthetic compatibility test. Output only JSON: {"memories":[]}.' }];
    for (const source of ['deepseek', 'custom']) {
        for (const profile of ['', 'synthetic-profile']) {
            for (const mode of ['schema', 'object', 'both', 'quota']) {
                scenario = mode; observed.length = 0;
                const operation = requestStructured(createJsonSender(context(source), profile), prompt, OUTPUT_SCHEMAS.memory, JSON.parse, 2048, '记忆');
                if (mode === 'both') await assert.rejects(operation, { code: 'SCENE_DIARY_JSON_FORMAT_UNSUPPORTED' });
                else if (mode === 'quota') await assert.rejects(operation, /429 rate limit/);
                else assert.deepEqual(await operation, { memories: [] });
                assert.deepEqual(observed.map(item => item.response_format.type), ['object', 'both'].includes(mode) ? ['json_schema', 'json_object'] : ['json_schema']);
                assert.deepEqual(observed[0].response_format.json_schema.schema, OUTPUT_SCHEMAS.memory.value);
                if (observed.length === 2) assert.deepEqual(observed[1].response_format, { type: 'json_object' });
                console.log(`PASS ${source}/${profile ? 'profile' : 'current'}/${mode}: ${observed.map(item => item.response_format.type).join(' -> ')}`);
            }
        }
    }
    const unsupported = await globalThis.fetch('/api/backends/chat-completions/generate', { method: 'POST', headers: headers(), body: JSON.stringify({ messages: prompt, json_schema: { ...OUTPUT_SCHEMAS.memory, responseFormat: 'json_schema' }, chat_completion_source: 'claude', model: 'synthetic' }) });
    assert.equal((await unsupported.json()).error.code, 'SCENE_DIARY_JSON_ADAPTER_UNAVAILABLE');
    console.log('PASS unsupported native protocol: adapter error before provider call');
    if (liveProfile) {
        for (const profile of ['', liveProfile.id]) {
            const statuses = [];
            const sender = createJsonSender(context('deepseek', true), profile);
            const result = await requestStructured(async input => {
                try { const output = await sender(input); statuses.push({ format: input.format, status: 200 }); return output; }
                catch (error) { statuses.push({ format: input.format, status: error.status }); throw error; }
            }, prompt, OUTPUT_SCHEMAS.memory, JSON.parse, 2048, '记忆');
            assert.deepEqual(result, { memories: [] });
            assert.deepEqual(statuses, [{ format: 'json_schema', status: 400 }, { format: 'json_object', status: 200 }]);
            console.log(`PASS saved DeepSeek/${profile ? 'profile' : 'current'}: ${JSON.stringify(statuses)}`);
        }
    }
    console.log('All host acceptance checks passed.');
} catch (error) {
    // Server diagnostics can contain request details; do not print the captured log.
    console.error(error.message);
    process.exitCode = 1;
} finally {
    globalThis.fetch = originalFetch;
    if (child && child.exitCode === null) { child.kill(); await once(child, 'exit'); }
    await new Promise(resolveClose => stub.close(resolveClose));
    // Verified exact temporary directory; never remove the host or user data root.
    const rel = relative(tmpdir(), temporary);
    if (rel && !rel.startsWith('..') && !isAbsolute(rel) && dirname(temporary) === tmpdir() && temporary.startsWith(join(tmpdir(), 'scene-diary-json-'))) await rm(temporary, { recursive: true, force: true });
}
