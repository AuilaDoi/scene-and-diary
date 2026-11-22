import { memoryLine, buildRecallQuery, isNormalRpMessage, fingerprint } from './core.js';
import { createMemoryRetriever } from './memory-system.js';
import { embed, rerank, loadVectors, saveVectors, cacheKey, semanticErrorDetail } from './semantic.js';
import { eligible } from './state-v8.js';

export function queryFor(chat, settings) {
    const rows = chat.filter(row => isNormalRpMessage(row) && typeof row.mes === 'string' && row.mes.trim());
    let end = rows.length;
    while (end && !rows[end - 1].is_user) end--;
    return buildRecallQuery(rows.slice(Math.max(0, end - settings.queryDepth - 1), end), settings.extraction);
}

export function createRetrieval(state, scope, log, signal, { localOnly = false } = {}) {
    const config = state.settings.semantic;
    const trace = (stage, title, details = [], status = 'success') => log({ stage, title, details, status });
    const warn = (stage, error) => {
        signal?.throwIfAborted();
        trace(stage, semanticErrorDetail(error, [scope.embeddingKey, scope.rerankKey]), [], 'warning');
    };
    return async (documents, query) => {
        const corpus = documents.filter(item => eligible(item) && !item.permanent);
        if (!corpus.length || !query.trim()) return [];
        const identity = { account: scope.account, chat: scope.chat, space: state.memorySpaceId + ':事实' };
        const retrieve = createMemoryRetriever(corpus, state.memoryRevision, { poolSize: state.settings.retrievalCount });
        let vectors, queryVector;
        if (!localOnly && config.enabled) {
            try {
                [vectors, [queryVector]] = await Promise.all([
                    indexedVectors(corpus, identity, config, scope, signal), embed([query], config, scope.embeddingKey, { signal }),
                ]);
            } catch (error) { warn('向量检索', error); }
        }
        signal?.throwIfAborted();
        const pool = retrieve(query, { vectors, queryVector });
        trace('初检', (vectors ? 'BM25 + 向量' : 'BM25') + ' · ' + pool.length + ' 条');
        let scores = pool.map(item => item.relevance), source = '检索相关度';
        if (!localOnly && config.rerank && pool.length) {
            try {
                scores = await rerank(query, pool.map(item => item.memory.content), config, scope.rerankKey, { signal });
                source = 'rerank';
            } catch (error) { warn('重排', error); }
        }
        signal?.throwIfAborted();
        const ranked = pool.map((item, i) => ({ ...item, score: (80 * Math.max(0, Math.min(1, scores[i])) + 5 * (item.memory.importance - 1)) / 100 }))
            .sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id));
        trace('精排', source, ranked.map(item => item.score.toFixed(3) + ' ' + item.memory.title));
        return ranked;
    };
}
const queues = new Map();
async function indexedVectors(documents, identity, config, scope, signal) {
    const namespace = 'scene-diary';
    const key = 'vectors-' + fingerprint(JSON.stringify([identity.space, config.endpoint, config.model, config.dimensions]));
    const queueKey = JSON.stringify([identity, key]);
    const previous = queues.get(queueKey);
    const task = Promise.resolve(previous).catch(() => {}).then(async () => {
        signal?.throwIfAborted();
        const store = scope.store;
        const cached = store ? await store.getJson({ namespace, key }) || {} : null;
        const vectors = cached ? new Map(documents.flatMap(item => {
            const value = cached[cacheKey(identity, config, item)];
            return Array.isArray(value) ? [[item.id, value]] : [];
        })) : await loadVectors(documents, identity, config);
        const missing = documents.filter(item => !vectors.has(item.id));
        for (let offset = 0; offset < missing.length; offset += 16) {
            const batch = missing.slice(offset, offset + 16);
            const values = await embed(batch.map(item => item.content), config, scope.embeddingKey, { signal });
            signal?.throwIfAborted();
            if (!store) await saveVectors(batch, values, identity, config);
            batch.forEach((item, index) => vectors.set(item.id, values[index]));
        }
        if (store && (missing.length || Object.keys(cached).length !== vectors.size)) {
            const value = Object.fromEntries(documents.map(item => [cacheKey(identity, config, item), vectors.get(item.id)]));
            await store.setJson({ namespace, key, value });
        }
        return vectors;
    });
    queues.set(queueKey, task);
    try { return await task; }
    finally { if (queues.get(queueKey) === task) queues.delete(queueKey); }
}

const block = (name, items) => items.length ? '[scene&diary ' + name + ']\n' + items.join('\n\n') + '\n[/scene&diary ' + name + ']' : '';
export async function continuity(state, query, rank, log) {
    const settings = state.settings;
    const diaries = state.diaries.filter(item => !item.needsReview && item.body.trim()).sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, settings.recentDiaryCount).reverse();
    const memories = state.memories.filter(eligible), pinned = memories.filter(item => item.permanent);
    const ranked = settings.retrievalCount && settings.candidateCount && query.trim() ? await rank(memories.filter(item => !item.permanent), query) : [];
    const candidates = ranked.slice(0, settings.candidateCount), selected = candidates.filter(item => item.score > settings.recallScoreThreshold);
    log({ stage: '注入', status: 'success', title: '常驻 ' + pinned.length + ' · 初检 ' + ranked.length + ' · 精排候选 ' + candidates.length + ' · 阈值淘汰 ' + (candidates.length - selected.length) + ' · 普通记忆注入 ' + selected.length,
        details: [...pinned.map(item => '常驻 · ' + item.title), ...selected.map(item => '召回 · ' + item.memory.title)] });
    return [block('当前角色画像', settings.growthEnabled && state.characterGrowth.content ? [state.characterGrowth.content] : []),
        block('近期日记', diaries.map(item => item.title + '\n' + item.body)), block('常驻记忆', pinned.map(memoryLine)),
        block('长期记忆', selected.map(item => memoryLine(item.memory)))].filter(Boolean).join('\n\n');
}
export function localPreview(state, query) {
    return continuity(state, query, createRetrieval(state, {}, () => {}, null, { localOnly: true }), () => {});
}
