import test from 'node:test';
import assert from 'node:assert/strict';
import { cacheKey, validateSemanticEndpoint } from '../semantic.js';
test('vector cache key changes across account, chat, model, content and dimension', () => {
    const base = { account: 'a', chat: 'c', space: 's' }, config = { endpoint: 'https://example.test/v1/embeddings', model: 'm', dimensions: 3 }, memory = { id: 'x', title: '标题', content: '事实', people: [], aliases: [] };
    const first = cacheKey(base, config, memory);
    for (const changed of [cacheKey({ ...base, account: 'b' }, config, memory), cacheKey({ ...base, chat: 'd' }, config, memory), cacheKey(base, { ...config, model: 'n' }, memory), cacheKey(base, { ...config, dimensions: 4 }, memory), cacheKey(base, config, { ...memory, content: '不同事实' })]) assert.notEqual(changed, first);
});
test('embedding endpoint never persists a URL containing credentials', () => {
    assert.equal(validateSemanticEndpoint('https://example.test/v1/embeddings'), 'https://example.test/v1/embeddings');
    assert.throws(() => validateSemanticEndpoint('https://user:secret@example.test/v1/embeddings'), /密钥/);
    assert.throws(() => validateSemanticEndpoint('https://example.test/v1/embeddings?api_key=secret'), /密钥/);
});
