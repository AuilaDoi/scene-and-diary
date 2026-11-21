import { estimateTokens, memoryLine, tokenize, fingerprint } from './core.js';
import { createMemoryRetriever, rankRecallCandidates } from './memory-system.js';
import { embed, rerank, loadVectors, saveVectors, cacheKey, semanticErrorDetail } from './semantic.js';
import { eligible, EDGE_TYPES } from './state-v7.js';

export function archive(state) {
    return state.diaries.filter(item => !item.needsReview).slice().sort((a, b) => b.createdAt - a.createdAt);
}

function pack(items, limit, budget, text, block) {
    const selected = [], skipped = [];
    let cost = 0;
    for (const item of items) {
        const next = block([...selected, item].map(text));
        if (selected.length >= limit || estimateTokens(next) > budget) { skipped.push(item); continue; }
        selected.push(item);
        cost = estimateTokens(next);
    }
    return { selected, skipped, cost, content: selected.length ? block(selected.map(text)) : '' };
}
const wrapper = name => entries => '[' + name + ']\n' + entries.join('\n\n') + '\n[/' + name + ']';

export function diarySelection(state) {
    const diaries = archive(state), settings = state.settings;
    const full = pack(diaries.slice(0, settings.recentDiaryCount), settings.recentDiaryCount, settings.recentDiaryBudget ?? Infinity,
        item => item.title + '\n' + item.body, wrapper('scene&diary 近期日记'));
    full.content = full.selected.length ? wrapper('scene&diary 近期日记')([...full.selected].reverse().map(item => item.title + '\n' + item.body)) : '';
    const ids = new Set(full.selected.map(item => item.id));
    return { full, history: diaries.filter(item => !ids.has(item.id) && !item.summaryPending && item.summary)
        .map(item => ({ id: item.id, title: item.title, content: item.summary })) };
}

export function selectFacts(facts, ranked, edges, query, settings) {
    const byId = new Map(facts.map(item => [item.id, item]));
    const direct = [
        ...facts.filter(item => item.permanent).sort((a, b) => b.importance - a.importance).map(memory => ({ memory, score: 1, via: '常驻' })),
        ...ranked.filter(item => !item.memory.permanent && item.score >= settings.recallScoreThreshold),
    ];
    const block = wrapper('scene&diary 长期事实');
    const budget = settings.memoryTokenBudget;
    const line = item => memoryLine(item.memory);
    const seeds = pack(direct, settings.recallLimit, budget, line, block);
    const included = new Set(seeds.selected.map(item => item.memory.id));
    const queryTerms = new Set(tokenize(query));
    const relevance = new Map(ranked.map(item => [item.memory.id, item.score]));
    const neighborHits = [];
    for (const seed of seeds.selected) {
        for (const edge of edges) {
            const type = EDGE_TYPES[edge.type];
            if (!type) continue;
            const id = edge.from === seed.memory.id ? edge.to : type.reverse && edge.to === seed.memory.id ? edge.from : null;
            const memory = byId.get(id);
            if (!memory || included.has(id)) continue;
            const score = relevance.get(id) ?? 0;
            if (score < settings.recallScoreThreshold && !tokenize(memory.content).some(word => queryTerms.has(word))) continue;
            included.add(id);
            neighborHits.push({ memory, score, via: type.label, reason: edge.reason });
        }
    }
    neighborHits.sort((a, b) => b.score - a.score);
    const result = pack([...seeds.selected, ...neighborHits], settings.recallLimit, budget, line, block);
    return { ...result, skipped: [...seeds.skipped, ...result.skipped] };
}

export function createRetrieval(state, scope, log, signal, { localOnly = false, strict = false } = {}) {
    const config = state.settings.semantic;
    const settings = state.settings;
    const sessionIndexes = new Map();
    return async (documents, query, collection, { includePermanent = false, useImportance = true, excludeId = null } = {}) => {
        signal?.throwIfAborted();
        if (!documents.length || !query.trim()) return [];
        const started = performance.now();
        const revision = collection === '历史日记' ? fingerprint(JSON.stringify(documents)) : state.memoryRevision;
        const retrieve = createMemoryRetriever(documents, collection + ':' + revision, { includePermanent });
        const corpus = documents.filter(item => includePermanent || !item.permanent);
        const secrets = [scope.embeddingKey, scope.rerankKey];
        const identity = { account: scope.account, chat: scope.chat, space: state.memorySpaceId + ':' + collection };
        const trace = (stage, status, title, details = []) => log({ stage: collection + ' · ' + stage, status, title, details, ms: performance.now() - started });
        const fallback = error => {
            signal?.throwIfAborted();
            if (strict) throw error;
            trace('语义服务', 'warning', semanticErrorDetail(error, secrets));
        };
        let ranked = retrieve(query, { useImportance, excludeId });
        trace('BM25', 'success', '候选 ' + ranked.length + ' 条');
        if (!localOnly && config.enabled && corpus.length) {
            try {
                const indexKey = collection + ':' + revision + ':' + includePermanent;
                if (!sessionIndexes.has(indexKey)) sessionIndexes.set(indexKey, indexedVectors(corpus, identity, config, scope, signal));
                const index = sessionIndexes.get(indexKey);
                const anchor = excludeId && corpus.find(item => item.id === excludeId && item.content === query);
                const [vectors, [queryVector]] = await Promise.all([
                    index,
                    anchor ? index.then(vectors => [vectors.get(anchor.id)]) : embed([query], config, scope.embeddingKey, { signal }),
                ]);
                signal?.throwIfAborted();
                ranked = retrieve(query, { vectors, queryVector, useImportance, excludeId });
                trace('向量', 'success', '索引 ' + vectors.size + ' 条');
            } catch (error) { fallback(error); }
        }
        if (!localOnly && config.rerank && ranked.length) {
            try {
                const scores = await rerank(query, ranked.map(item => item.memory.content), config, scope.rerankKey, { signal });
                ranked = rankRecallCandidates(ranked, scores, { absolute: true, useImportance });
                trace('重排', 'success', '重排 ' + scores.length + ' 条');
            } catch (error) { fallback(error); }
        }
        trace('排名', 'success', '候选按相关性排列', ranked.slice(0, Math.max(8, settings.recallLimit)).map(item => item.score.toFixed(3) + ' ' + item.memory.title));
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

export async function continuity(state, query, rank, log) {
    const diary = diarySelection(state);
    const facts = state.memories.filter(eligible);
    const [memoryRanked, diaryRanked] = await Promise.all([
        state.settings.memoryTokenBudget && state.settings.recallLimit ? rank(facts, query, '事实') : [],
        state.settings.historyBudget ? rank(diary.history, query, '历史日记', { useImportance: false }) : [],
    ]);
    const history = pack(diaryRanked.filter(item => item.score >= state.settings.recallScoreThreshold).map(item => item.memory),
        Infinity, state.settings.historyBudget, item => item.title + '\n' + item.content, wrapper('scene&diary 历史经历摘要'));
    const memory = selectFacts(facts, memoryRanked, state.edges, query, state.settings);
    for (const [stage, group] of [['近期日记', diary.full], ['历史经历摘要', history], ['事实及一跳关系', memory]]) {
        const name = item => item.memory?.title || item.title;
        log({ stage, status: 'success', title: group.selected.length + ' 条 · 约 ' + group.cost + ' token',
            details: [...group.selected.map(item => ['注入', name(item), item.via, item.reason].filter(Boolean).join(' · ')), ...group.skipped.map(item => '因数量／额度跳过 · ' + name(item))] });
    }
    const growth = state.settings.growthEnabled && state.characterGrowth.content.trim();
    return [growth && wrapper('scene&diary 当前角色画像')([growth]), diary.full.content, history.content, memory.content].filter(Boolean).join('\n\n');
}

export function localPreview(state, query) {
    const rank = createRetrieval(state, {}, () => {}, null, { localOnly: true });
    return continuity(state, query, rank, () => {});
}
