import path from 'node:path';
import { LibraryStore, id } from './engine.mjs';
import { Embeddings } from './embedding.mjs';

export const info = { id: 'scene-and-diary', name: 'scene&diary memory service', description: 'Per-chat memory transactions and retrieval' };
const PROTOCOL = 1;
const stores = new Map();
const embeddings = new Map();
function store(req) {
    const root = req.user?.directories?.root;
    if (!root) throw Object.assign(new Error('Authenticated user directory unavailable'), { status: 401 });
    const directory = path.join(root, 'scene-and-diary');
    if (!stores.has(directory)) { const instance = new LibraryStore(directory); stores.set(directory, instance); void instance.cleanup().catch(() => {}); }
    return stores.get(directory);
}
function embedding(req) { const root = store(req).root; if (!embeddings.has(root)) embeddings.set(root, new Embeddings(path.join(root, '_embedding'))); return embeddings.get(root); }
const wrap = action => async (req, res) => { try { res.json(await action(req)); } catch (error) { res.status(error.status || 500).json({ error: error.message }); } };
export async function init(router) {
    router.get('/capabilities', wrap(async req => { store(req); return { protocol: PROTOCOL, version: '0.3.0', features: ['transactions', 'entities', 'hybrid-recall', 'migration'] }; }));
    router.post('/libraries/open', wrap(async req => store(req).resolve(req.body.chatKey, req.body.libraryId, req.body.parentChatKey, req.body.retained, req.body.legacy || null)));
    router.post('/libraries/fork', wrap(async req => ({ libraryId: await store(req).fork(req.body.parentLibraryId, req.body.retained), revision: 0 })));
    router.post('/libraries/rename', wrap(async req => store(req).rename(req.body.oldChatKey, req.body.newChatKey)));
    router.post('/libraries/deleted', wrap(async req => store(req).deleted(req.body.chatKey)));
    router.post('/libraries/query', wrap(async req => store(req).query(req.body.libraryId, req.body)));
    router.post('/libraries/maintenance', wrap(async req => store(req).maintenance(req.body.libraryId, req.body.candidates || [])));
    router.post('/libraries/export', wrap(async req => store(req).export(req.body.libraryId)));
    router.post('/libraries/import', wrap(async req => store(req).import(req.body.data, req.body.chatKey)));
    router.post('/libraries/sources-changed', wrap(async req => store(req).markSources(req.body.libraryId, req.body.messageIds || [])));
    router.post('/transactions/prepare', wrap(async req => store(req).prepare(req.body.libraryId, req.body)));
    router.post('/transactions/commit', wrap(async req => { const result = await store(req).commit(req.body.libraryId, req.body); embedding(req).queue((await store(req).open(req.body.libraryId)).state); return result; }));
    router.post('/transactions/history', wrap(async req => store(req).history(req.body.libraryId)));
    router.post('/transactions/undo', wrap(async req => store(req).undo(req.body.libraryId, req.body.requestId)));
    router.post('/recall', wrap(async req => {
        const entry = await store(req).open(req.body.libraryId);
        const vector = req.body.settings?.semanticRecall ? await embedding(req).ranks(entry.state, req.body.query || '') : { ranks: [], fallback: 'disabled' };
        const result = entry.index.recall(req.body.query || '', req.body.settings || {}, vector.ranks, req.body.parts || []);
        return { ...result, revision: entry.state.revision, fallback: vector.fallback };
    }));
    router.post('/recall/order', wrap(async req => { const entry = await store(req).open(req.body.libraryId); return { ...entry.index.select(req.body.ids || [], req.body.settings || {}, req.body.query || ''), revision: entry.state.revision }; }));
    router.get('/embedding/config', wrap(async req => embedding(req).publicConfig()));
    router.post('/embedding/config', wrap(async req => { const result = await embedding(req).saveConfig(req.body); if (result.enabled) for (const entry of store(req).cache.values()) embedding(req).queue(entry.state); return result; }));
    router.post('/embedding/test', wrap(async req => embedding(req).test()));
    router.post('/embedding/rebuild', wrap(async req => { const entry = await store(req).open(req.body.libraryId); embedding(req).queue(entry.state); return { queued: true }; }));
}
