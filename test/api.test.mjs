import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { init } from '../server/index.mjs';

test('plugin routes open, commit and recall within the authenticated user directory', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'scene-api-'));
    try {
        const routes = new Map(), router = { get: (name, handler) => routes.set(`GET ${name}`, handler), post: (name, handler) => routes.set(`POST ${name}`, handler) }; await init(router);
        async function call(method, route, body = {}) {
            let status = 200, data; const req = { body, user: { directories: { root } } }, res = { status: code => { status = code; return res; }, json: value => { data = value; return res; } };
            await routes.get(`${method} ${route}`)(req, res); return { status, data };
        }
        assert.equal((await call('GET', '/capabilities')).data.protocol, 1);
        const opened = (await call('POST', '/libraries/open', { chatKey: 'chat-a' })).data;
        const operation = { type: 'add_memory', value: { id: 'memory1', title: '摩天轮表白', content: '角色在摩天轮表白', sources: [{ actId: 1, messageId: 'msg1', hash: 'hash1', excerpt: '在摩天轮表白' }] } };
        const committed = await call('POST', '/transactions/commit', { libraryId: opened.libraryId, requestId: 'tx1', expectedRevision: 0, operations: [operation], sourceSnapshot: [{ actId: 1, messageId: 'msg1', hash: 'hash1' }] });
        assert.equal(committed.status, 200); assert.equal(committed.data.revision, 1);
        const recalled = await call('POST', '/recall', { libraryId: opened.libraryId, query: '摩天轮', settings: {} });
        assert.equal(recalled.data.selected[0].memory.id, 'memory1');
        const elsewhere = await fs.mkdtemp(path.join(os.tmpdir(), 'scene-api-other-'));
        const otherReq = { body: { libraryId: opened.libraryId, query: '摩天轮' }, user: { directories: { root: elsewhere } } }, otherRes = { status: () => otherRes, json: value => value };
        let other; otherRes.json = value => { other = value; return otherRes; }; await routes.get('POST /recall')(otherReq, otherRes);
        assert.equal(other.selected.length, 0); await fs.rm(elsewhere, { recursive: true, force: true });
    } finally { await fs.rm(root, { recursive: true, force: true }); }
});
