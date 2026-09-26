import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { Embeddings } from '../server/embedding.mjs';

test('custom embedding uses a separate key, indexes changed text, and falls back on provider failure', async () => {
    let embeddings, requests = 0; const root = await fs.mkdtemp(path.join(os.tmpdir(), 'scene-embedding-')), server = http.createServer(async (request, response) => {
        requests++;
        assert.equal(request.headers.authorization, 'Bearer private-key');
        let body = ''; for await (const part of request) body += part;
        const input = JSON.parse(body).input, values = Array.isArray(input) ? input : [input];
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ data: values.map((value, index) => ({ index, embedding: value.includes('戒指') ? [1, 0] : [0, 1] })) }));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        embeddings = new Embeddings(root); const port = server.address().port;
        await embeddings.saveConfig({ enabled: true, baseUrl: `http://127.0.0.1:${port}/v1`, model: 'test-model', apiKey: 'private-key', dimension: 2 });
        assert.equal((await embeddings.publicConfig()).apiKey, undefined); assert.equal((await embeddings.publicConfig()).hasKey, true);
        const library = { libraryId: 'lib', memories: { ring: { id: 'ring', title: '银戒指', content: '第一次表白的礼物', lifecycle: 'active' }, breakfast: { id: 'breakfast', title: '早餐', content: '角色做的早餐', lifecycle: 'active' } } };
        await embeddings.update(library);
        assert.equal((await embeddings.ranks(library, '那枚戒指')).ranks[0].id, 'ring');
        const afterFirstQuery = requests;
        assert.equal((await embeddings.ranks(library, '那枚戒指')).ranks[0].id, 'ring');
        assert.equal(requests, afterFirstQuery);
        const later = { libraryId: 'queued', memories: { ...library.memories, newGift: { id: 'newGift', title: '新戒指', content: '新的礼物', lifecycle: 'active' } } };
        embeddings.queue({ libraryId: 'queued', memories: { ring: library.memories.ring } });
        embeddings.queue(later);
        await embeddings.pending.get('queued');
        assert.ok((await embeddings.load('queued')).vectors.newGift);
        await fs.writeFile(path.join(root, 'damaged.vectors.json'), '{incomplete');
        assert.deepEqual((await embeddings.load('damaged')).vectors, {});
        server.close();
        const fallback = await embeddings.ranks(library, '戒指', 200);
        assert.equal(fallback.ranks.length, 0); assert.ok(fallback.fallback);
    } finally { server.close(); await embeddings?.worker?.terminate(); await fs.rm(root, { recursive: true, force: true }); }
});
