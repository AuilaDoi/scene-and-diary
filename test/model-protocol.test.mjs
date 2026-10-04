import test from 'node:test';
import assert from 'node:assert/strict';
import { OUTPUT_SCHEMAS, requestStructured, requireArrayField, unsupportedJsonFormat, safeJsonError } from '../model-protocol.js';

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
    const send = async request => { calls.push(request); return calls.length === 1 ? '{"diary":"bad\nnewline"}' : '{"title":"一天","diary":"今天喝了茶。"}'; };
    const parse = value => JSON.parse(value);
    const result = await requestStructured(send, [{ role: 'user', content: '写日记' }], OUTPUT_SCHEMAS.diary, parse, 4096, '日记');
    assert.equal(result.title, '一天');
    assert.equal(calls.length, 2);
    assert.equal(calls[0].outputSchema, OUTPUT_SCHEMAS.diary);
    assert.equal(calls[1].outputSchema, OUTPUT_SCHEMAS.diary);
    assert.equal(calls[1].maxTokens, 8192);
    assert.match(calls[1].messages.at(-1).content, /完整 JSON/);
});

test('DeepSeek unavailable response switches to explicit JSON object and retains schema instructions', async () => {
    const calls = [];
    const prompt = [{ role: 'user', content: '成长' }];
    const original = structuredClone(prompt);
    const send = async request => { calls.push(structuredClone(request)); request.messages.push({ role: 'user', content: 'HOST MUTATION' }); if (request.format === 'json_schema') throw new Error('failed to generate chat completion: validation error: this response_format type is unavailable now.'); return '{"characterGrowth":"相识"}'; };
    const result = await requestStructured(send, prompt, OUTPUT_SCHEMAS.growth, JSON.parse, 6144, '角色成长');
    assert.equal(result.characterGrowth, '相识');
    assert.deepEqual(calls.map(item => item.format), ['json_schema', 'json_object']);
    assert.equal(calls[1].maxTokens, 6144);
    assert.match(calls[1].messages.at(-1).content, /characterGrowth/);
    assert.deepEqual(calls[0].messages, calls[1].messages);
    assert.deepEqual(prompt, original);
});

test('rejecting both JSON modes returns both reasons without ordinary generation', async () => {
    const calls = [];
    await assert.rejects(requestStructured(async request => { calls.push(request.format); throw new Error(`${request.format} response_format is not supported`); }, '记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆'), error => {
        assert.equal(error.code, 'SCENE_DIARY_JSON_FORMAT_UNSUPPORTED');
        assert.match(error.message, /json_schema.*not supported[\s\S]*json_object.*not supported/);
        assert.equal(error.jsonAttempts.length, 2);
        return true;
    });
    assert.deepEqual(calls, ['json_schema', 'json_object']);
});

test('object content repair is bounded to three calls and keeps the selected format', async () => {
    const calls = [];
    const result = await requestStructured(async request => { calls.push(request); if (calls.length === 1) throw new Error('Unknown parameter: response_format'); return calls.length === 2 ? '{"memories":' : '{"memories":[]}'; }, '记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆');
    assert.deepEqual(result, { memories: [] });
    assert.deepEqual(calls.map(item => item.format), ['json_schema', 'json_object', 'json_object']);
    assert.equal(calls[2].maxTokens, 16384);
    assert.equal(calls[2].messages.filter(item => item.content.includes('必须符合以下 JSON Schema')).length, 1);
});

test('format rejection during content repair still permits the remaining format once', async () => {
    const calls = [];
    await requestStructured(async request => { calls.push(request.format); if (calls.length === 2) throw new Error('json_schema is unavailable'); return calls.length === 1 ? '{' : '{}'; }, '日记', OUTPUT_SCHEMAS.diary, JSON.parse, 4096, '日记');
    assert.deepEqual(calls, ['json_schema', 'json_schema', 'json_object']);
});

test('network, auth and schema-definition errors never look like format rejection', () => {
    for (const message of ['Invalid schema in response_format: required must include title', 'response_format requires messages to contain JSON', 'JSON parse failed', 'response_format is unavailable due to a network timeout']) {
        const error = Object.assign(new Error(message), { status: message.includes('timeout') ? 503 : 400 });
        assert.equal(unsupportedJsonFormat(error), false, message);
    }
    assert.equal(unsupportedJsonFormat(Object.assign(new Error('unsupported field'), { code: 'unsupported_parameter', param: 'response_format.type', status: 400 })), true);
    assert.equal(unsupportedJsonFormat(new Error('Unknown parameter:\nresponse_format')), true);
    assert.equal(unsupportedJsonFormat(new Error('json_object is not supported')), true);
    assert.equal(unsupportedJsonFormat(new Error("Invalid value: 'json_schema'. Supported values are: 'text' and 'json_object'.")), true);
    assert.equal(unsupportedJsonFormat(Object.assign(new Error('Invalid value'), { code: 'invalid_value', param: 'response_format.type', status: 400 })), true);
    assert.doesNotMatch(safeJsonError(new Error('Authorization=Bearer-token Bearer abcdef sk-example-secret')), /Bearer-token|abcdef|sk-example-secret/);
});

test('quota error after Schema rejection preserves the real terminal failure', async () => {
    let calls = 0;
    await assert.rejects(requestStructured(async () => { if (++calls === 1) throw new Error('response_format unavailable'); throw Object.assign(new Error('429 rate limit'), { status: 429 }); }, '记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆'), error => {
        assert.match(error.message, /429 rate limit/);
        assert.notEqual(error.code, 'SCENE_DIARY_JSON_FORMAT_UNSUPPORTED');
        assert.equal(error.jsonAttempts.length, 1);
        return true;
    });
    assert.equal(calls, 2);
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
