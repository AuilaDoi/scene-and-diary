import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGrowthResponse } from '../core.js';
import { validateCandidateBatch } from '../memory-system.js';
import { OUTPUT_SCHEMAS, requestLegacyStructured as requestStructured, requestStructured as requestTauriStructured, requireArrayField, jsonResponseFormat, isJsonFormatRejected } from '../model-protocol.js';

test('all close outputs request a structured object with the required fields', () => {
    for (const [kind, fields] of [['diary', ['title', 'diary']], ['memory', ['memories']], ['growth', ['characterGrowth']]]) {
        const output = OUTPUT_SCHEMAS[kind];
        assert.equal(output.value.type, 'object');
        assert.equal(output.value.additionalProperties, false);
        assert.deepEqual(output.value.required, fields);
    }
    assert.equal('sources' in OUTPUT_SCHEMAS.memory.value.properties.memories.items.properties, false);
    assert.equal('status' in OUTPUT_SCHEMAS.memory.value.properties.memories.items.properties, false);
    assert.deepEqual(OUTPUT_SCHEMAS.maintenance.value.required, ['operations']);
});

test('a malformed response retries only that request with a larger output budget', async () => {
    const calls = [];
    const send = async (prompt, tokens, schema) => { calls.push({ prompt, tokens, schema }); return calls.length === 1 ? '{"diary":"bad\nnewline"}' : '{"title":"一天","diary":"今天喝了茶。"}'; };
    const parse = value => JSON.parse(value);
    const result = await requestStructured(send, [{ role: 'user', content: '写日记' }], OUTPUT_SCHEMAS.diary, parse, 4096, '日记');
    assert.equal(result.title, '一天');
    assert.equal(calls.length, 2);
    assert.equal(calls[0].schema, OUTPUT_SCHEMAS.diary);
    assert.equal(calls[1].schema, OUTPUT_SCHEMAS.diary);
    assert.equal(calls[1].tokens, 8192);
    assert.match(calls[1].prompt.at(-1).content, /完整 JSON/);
});

test('legacy SillyTavern provider path retains its existing ordinary fallback', async () => {
    const calls = [];
    const send = async (_prompt, _tokens, schema) => { calls.push(schema); if (schema) throw new Error('response_format is not supported'); return '{"characterGrowth":"相识"}'; };
    const result = await requestStructured(send, '成长', OUTPUT_SCHEMAS.growth, JSON.parse, 6144, '角色成长');
    assert.equal(result.characterGrowth, '相识');
    assert.deepEqual(calls, [OUTPUT_SCHEMAS.growth, null]);
});

test('Tauri negotiates real format types and repairs accepted object mode at most once', async () => {
    const calls = [], initial = [{ role: 'user', content: '成长' }];
    const result = await requestTauriStructured(async (messages, tokens, format) => {
        calls.push({ messages, tokens, format });
        if (calls.length === 1) throw new Error('failed to generate chat completion: validation error: this response_format type is unavailable now.');
        return calls.length === 2 ? '{"characterGrowth":' : '{"characterGrowth":"相识"}';
    }, initial, OUTPUT_SCHEMAS.growth, JSON.parse, 6144, '角色成长');
    assert.equal(result.characterGrowth, '相识');
    assert.deepEqual(calls.map(call => call.format.type), ['json_schema', 'json_object', 'json_object']);
    assert.deepEqual(calls[0].format, jsonResponseFormat(OUTPUT_SCHEMAS.growth));
    assert.deepEqual(calls[1].messages, calls[0].messages);
    assert.equal(calls[2].tokens, 12288);
    assert.equal(calls[0].format.json_schema.schema.type, 'object');
    assert.equal('value' in calls[0].format.json_schema, false);
    assert.deepEqual(initial, [{ role: 'user', content: '成长' }]);
});

test('Tauri reports both rejections and never sends an unformatted request', async () => {
    const calls = [];
    await assert.rejects(requestTauriStructured(async (_messages, _tokens, format) => {
        calls.push(format); throw new Error(`${format.type} is not supported`);
    }, '记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆提取', { connectionLabel: 'DeepSeek / flash' }), error => {
        assert.equal(error.code, 'SCENE_DIARY_JSON_FORMATS_REJECTED');
        assert.match(error.message, /DeepSeek.*flash.*json_schema.*json_object/); return true;
    });
    assert.deepEqual(calls.map(item => item.type), ['json_schema', 'json_object']);
});

test('format rejection classification excludes schema, auth, quota, transport and ambiguous errors', () => {
    for (const message of [
        'validation error', 'invalid response_format', 'invalid json schema: required must include diary',
        'response_format json_schema properties not supported', 'messages must contain JSON for response_format',
        'HTTP 401: json_schema not supported', '429 rate limit: response_format unavailable',
        'API key invalid: response_format unavailable', 'network: json_schema is not supported',
        'context limit exceeded: response_format unavailable', 'HTTP 503 response_format unavailable',
    ]) assert.equal(isJsonFormatRejected(new Error(message), 'json_schema'), false, message);
    assert.equal(isJsonFormatRejected(Object.assign(new Error('json_schema is unsupported'), { category: 'network' }), 'json_schema'), false);
    assert.equal(isJsonFormatRejected(Object.assign(new Error('json_schema is unsupported'), { providerStatus: 403 }), 'json_schema'), false);
    assert.equal(isJsonFormatRejected(Object.assign(new Error('json_schema is unsupported'), { bridgeStatus: 401 }), 'json_schema'), false);
    assert.equal(isJsonFormatRejected(Object.assign(new Error('invalid enum; allowed values: text, json_object'), { param: 'response_format.type' }), 'json_schema'), true);
    assert.equal(isJsonFormatRejected(new Error('wrapped', { cause: new Error('json_schema is unsupported') }), 'json_schema'), true);
});

test('accepted schema repairs missing fields without format switching; malformed repair stops', async () => {
    const calls = [];
    await assert.rejects(requestTauriStructured(async (_messages, tokens, format) => {
        calls.push({ tokens, format }); return '{"message":"none"}';
    }, '记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆提取'), /两次输出均未满足.*memories/);
    assert.deepEqual(calls.map(item => item.format.type), ['json_schema', 'json_schema']);
    assert.equal(calls[1].tokens, 16384);
});

test('accepted content repair failures never re-enter format negotiation', async () => {
    let calls = 0;
    await assert.rejects(requestTauriStructured(async () => {
        if (++calls === 1) return '{}';
        throw new Error('response_format type is unavailable now');
    }, '日记', OUTPUT_SCHEMAS.diary, JSON.parse, 4096, '日记'), /unavailable/);
    assert.equal(calls, 2);
});

test('Tauri stops before retry on stale tasks and never repairs maintenance proposals individually', async () => {
    let stale = false, calls = 0;
    await assert.rejects(requestTauriStructured(async () => { calls++; stale = true; throw new Error('json_schema unsupported'); }, '日记', OUTPUT_SCHEMAS.diary, JSON.parse, 4096, '日记', {
        assertCurrent: () => { if (stale) throw Object.assign(new Error('stale task'), { code: 'SCENE_DIARY_STALE' }); },
    }), /stale/);
    assert.equal(calls, 1);
    calls = 0;
    const value = await requestTauriStructured(async () => { calls++; return '{"operations":[{"action":"bad"},null]}'; }, '整理', OUTPUT_SCHEMAS.maintenance, JSON.parse, 8192, '整理');
    assert.deepEqual(value.operations, [{ action: 'bad' }, null]); assert.equal(calls, 1);
});

test('Tauri delegates candidate types and enums to per-entry validation without discarding safe entries', async () => {
    let calls = 0;
    const valid = { category: 'event', title: '旅行', content: '两人约好旅行。', people: [], aliases: [], importance: 3, storyTime: null };
    const output = await requestTauriStructured(async () => {
        calls++; return JSON.stringify({ memories: [valid, { ...valid, category: 'guess', importance: 9 }] });
    }, '记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆');
    const batch = validateCandidateBatch(output.memories);
    assert.equal(batch.candidates.length, 1); assert.equal(batch.rejected.length, 1);
    assert.equal(calls, 1);
});

test('growth exceeding its storage bound is repaired once without truncating it', async () => {
    const calls = [];
    const result = await requestTauriStructured(async (_messages, _tokens, format) => {
        calls.push(format.type); return JSON.stringify({ characterGrowth: calls.length === 1 ? '长'.repeat(4001) : '重新整理的成长' });
    }, '成长', OUTPUT_SCHEMAS.growth, parseGrowthResponse, 6144, '角色成长');
    assert.equal(result, '重新整理的成长'); assert.deepEqual(calls, ['json_schema', 'json_schema']);
});

test('repeated malformed object content stops at three calls including schema rejection', async () => {
    let calls = 0;
    await assert.rejects(requestTauriStructured(async () => {
        if (++calls === 1) throw new Error('json_schema is not supported');
        return '{"characterGrowth":';
    }, '成长', OUTPUT_SCHEMAS.growth, JSON.parse, 6144, '角色成长'), /两次输出均未满足/);
    assert.equal(calls, 3);
});

test('network and quota failures do not trigger duplicate model calls', async () => {
    let calls = 0;
    await assert.rejects(requestStructured(async () => { calls++; throw new Error('429 rate limit'); }, '记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆'), /429/);
    assert.equal(calls, 1);
});
test('a valid JSON object missing memories is retried, but an empty memories array succeeds', async () => {
    let calls = 0;
    const result = await requestStructured(async () => ++calls === 1 ? '{"message":"none"}' : '{"memories":[]}', '提取记忆', OUTPUT_SCHEMAS.memory, value => requireArrayField(JSON.parse(value), 'memories', '记忆模型'), 8192, '记忆');
    assert.deepEqual(result.memories, []);
    assert.equal(calls, 2);
    calls = 0;
    await assert.rejects(requestStructured(async () => { calls++; return '{"message":"none"}'; }, '提取记忆', OUTPUT_SCHEMAS.memory, value => requireArrayField(JSON.parse(value), 'memories', '记忆模型'), 8192, '记忆'), /两次输出均未满足.*memories 数组/);
    assert.equal(calls, 2);
});
