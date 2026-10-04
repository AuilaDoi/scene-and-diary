import test from 'node:test';
import assert from 'node:assert/strict';
import { OUTPUT_SCHEMAS, requestStructured, requireArrayField } from '../model-protocol.js';

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

test('unsupported JSON response format falls back to ordinary generation', async () => {
    const calls = [];
    const send = async (_prompt, _tokens, schema) => { calls.push(schema); if (schema) throw new Error('response_format is not supported'); return '{"characterGrowth":"相识"}'; };
    const result = await requestStructured(send, '成长', OUTPUT_SCHEMAS.growth, JSON.parse, 6144, '角色成长');
    assert.equal(result.characterGrowth, '相识');
    assert.deepEqual(calls, [OUTPUT_SCHEMAS.growth, null]);
});

test('network and quota failures do not trigger duplicate model calls', async () => {
    let calls = 0;
    await assert.rejects(requestStructured(async () => { calls++; throw new Error('429 rate limit'); }, '记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆'), /429/);
    assert.equal(calls, 1);
});

test('DeepSeek unavailable response format errors fall back through wrapped connection errors', async () => {
    for (const spelling of ['unavaliable', 'unavailable', 'not available']) {
        const prompt = [{ role: 'system', content: '只输出 JSON' }, { role: 'user', content: '整理独立事实' }], calls = [];
        const send = async (messages, tokens, schema) => {
            calls.push({ messages, tokens, schema });
            if (schema) throw new Error('API request failed', { cause: new Error(`Failed to generate chat completion:Validation error:This response_format type is ${spelling} now.`) });
            return '{"operations":[]}';
        };
        const result = await requestStructured(send, prompt, OUTPUT_SCHEMAS.maintenance, JSON.parse, 8192, '记忆整理');
        assert.deepEqual(result, { operations: [] });
        assert.equal(calls.length, 2);
        assert.equal(calls[1].schema, null);
        assert.equal(calls[1].tokens, 8192);
        assert.deepEqual(JSON.parse(calls[1].messages.at(-1).content.split('\n').at(-1)), OUTPUT_SCHEMAS.maintenance.value);
        assert.equal(prompt.length, 2);
    }
});

test('fallback keeps the JSON contract on a malformed-result retry and supports string prompts', async () => {
    const calls = [];
    const send = async (prompt, tokens, schema) => {
        calls.push({ prompt, tokens, schema });
        if (schema) throw new Error('This response_format type is unavaliable now.');
        return calls.length === 2 ? 'broken JSON' : '{"memories":[]}';
    };
    const result = await requestStructured(send, '提取 JSON 记忆', OUTPUT_SCHEMAS.memory, JSON.parse, 4096, '记忆');
    assert.deepEqual(result, { memories: [] });
    assert.equal(calls.length, 3);
    for (const call of calls.slice(1)) {
        assert.equal(call.schema, null);
        assert.ok(call.prompt.includes(JSON.stringify(OUTPUT_SCHEMAS.memory.value)));
    }
    assert.equal(calls[2].tokens, 8192);
    assert.match(calls[2].prompt, /上一轮响应/);
});

test('unrelated availability errors do not trigger format fallback', async () => {
    for (const message of ['503 service unavailable', 'response_format service temporarily unavailable', '401 invalid API key']) {
        let calls = 0;
        await assert.rejects(requestStructured(async () => { calls++; throw new Error(message); }, 'JSON', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆'));
        assert.equal(calls, 1);
    }
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
