import test from 'node:test';
import assert from 'node:assert/strict';
import { createJsonSender } from '../json-request.js';
import { requestStructured, OUTPUT_SCHEMAS } from '../model-protocol.js';
import { prepareJsonFormat, applyJsonResponseFormat, jsonFormatProviderError } from '../host-adapter/json-format.js';

test('both public sender paths transmit explicit formats and preserve protocol metadata', async () => {
    const originalFetch = globalThis.fetch;
    let probes = 0;
    globalThis.fetch = async () => { probes++; return { ok: true, json: async () => ({ version: 1, formats: ['json_schema', 'json_object'] }) }; };
    try {
        for (const profile of ['', 'profile']) {
            const wire = [];
            const respond = (schema, override) => {
                const input = { model: 'test-model', chat_completion_source: 'deepseek', messages: [{ role: 'user', content: 'JSON' }], json_schema: schema, ...override };
                assert.equal(prepareJsonFormat(input), null);
                const outgoing = applyJsonResponseFormat(input, { response_format: { type: 'wrong-default' } });
                wire.push(outgoing.response_format);
                if (wire.length === 1) throw Object.assign(new Error('This response_format type is unavailable now'), { status: 400 });
                return { content: '{"memories":[]}' };
            };
            const context = { mainApi: 'openai', generateRawData: async input => respond(input.jsonSchema), ConnectionManagerRequestService: { sendRequest: async (id, messages, tokens, options, override) => {
                assert.equal(id, 'profile'); assert.equal(options.includePreset, false);
                assert.equal(override.json_response_format, override.json_schema.responseFormat);
                return respond(override.json_schema, override);
            } } };
            assert.deepEqual(await requestStructured(createJsonSender(context, profile), 'JSON', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆'), { memories: [] });
            assert.deepEqual(wire.map(item => item.type), ['json_schema', 'json_object']);
            assert.deepEqual(wire[0].json_schema.schema, OUTPUT_SCHEMAS.memory.value);
            assert.deepEqual(wire[1], { type: 'json_object' });
        }
        assert.equal(probes, 2); // One probe per task, not one per attempt.
        assert.equal('responseFormat' in OUTPUT_SCHEMAS.memory, false);
    } finally { globalThis.fetch = originalFetch; }
});

test('missing host adapter fails before sending any model request', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false });
    let sent = 0;
    try {
        await assert.rejects(requestStructured(createJsonSender({ mainApi: 'openai', generateRawData: async () => { sent++; } }, ''), 'JSON', OUTPUT_SCHEMAS.memory, JSON.parse, 8192, '记忆'), { code: 'SCENE_DIARY_JSON_ADAPTER_UNAVAILABLE' });
        assert.equal(sent, 0);
    } finally { globalThis.fetch = originalFetch; }
});

test('legacy calls stay untouched; unsupported native protocols and conflicting modes fail locally', () => {
    const outgoing = { response_format: { type: 'legacy' } };
    assert.equal(prepareJsonFormat({}), null);
    assert.equal(applyJsonResponseFormat({}, outgoing), outgoing);
    assert.deepEqual(outgoing.response_format, { type: 'legacy' });
    const base = { chat_completion_source: 'deepseek', messages: [], json_schema: { ...OUTPUT_SCHEMAS.memory, responseFormat: 'json_schema' } };
    assert.equal(prepareJsonFormat({ ...base, json_response_format: 'json_object' }).error.code, 'SCENE_DIARY_JSON_ADAPTER_INVALID');
    assert.equal(prepareJsonFormat({ ...base, chat_completion_source: 'claude' }).error.code, 'SCENE_DIARY_JSON_ADAPTER_UNAVAILABLE');
    assert.equal(prepareJsonFormat({ ...base, model: 'legacy-text' }, ['legacy-text']).error.code, 'SCENE_DIARY_JSON_ADAPTER_UNAVAILABLE');
    const detail = jsonFormatProviderError({ error: { message: 'response_format unavailable', code: 'unsupported_parameter', param: 'response_format' } }, 400, { ...base, json_response_format: 'json_schema', model: 'deepseek-flash' });
    assert.equal(detail.error.status, 400);
    assert.equal(detail.error.effective_format, 'json_schema');
    assert.equal(detail.error.code, 'unsupported_parameter');
    assert.equal(jsonFormatProviderError({ message: 'Unsupported response_format' }, 400, { ...base, json_response_format: 'json_schema' }).error.message, 'Unsupported response_format');
});
