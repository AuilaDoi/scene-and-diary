import { fingerprint } from './core.js';
import { memoryText } from './memory-system.js';

const DB = 'scene_diary_vectors_v1';
const STORE = 'vectors';
const openDb = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});
export const cacheKey = (identity, config, memory) => ['content-only-v1', identity.account, identity.chat, identity.space, config.endpoint, config.model, config.dimensions || '', memory.id, fingerprint(memoryText(memory))].join('|');
export function validateSemanticEndpoint(value, label = '向量') { let url; try { url = new URL(value); } catch { throw new Error(`${label}接口地址无效`); } if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${label}接口须为 HTTP(S) 地址`); if (url.username || url.password || [...url.searchParams.keys()].some(key => /key|secret|token|password|auth/i.test(key))) throw new Error(`请不要把密钥放在${label}接口地址中`); return url.href; }
export function semanticErrorDetail(error, secrets = []) {
    const parts = [], seen = new Set();
    for (let current = error; current && !seen.has(current) && seen.size < 3; current = current.cause) {
        seen.add(current);
        const message = typeof current === 'string' ? current : current.message || current.error?.message || current.code || current.name || '未知错误';
        parts.push(`${current.name && current.name !== 'Error' ? `${current.name}: ` : ''}${message}`);
    }
    let detail = parts.join('；原因：') || '未知错误';
    for (const secret of secrets.filter(Boolean)) detail = detail.split(secret).join('[已隐藏]');
    return detail.replace(/Bearer\s+[^\s"']+/gi, 'Bearer [已隐藏]').replace(/((?:api[_-]?key|token|secret|password|authorization)["']?\s*[:=]\s*["']?)[^\s"'&,}]+/gi, '$1[已隐藏]').slice(0, 1200);
}
async function serviceJson(response, label, key) {
    if (!response.ok) {
        let data;
        try { data = typeof response.text === 'function' ? await response.text() : await response.json(); } catch { /* Preserve the HTTP status if the error body cannot be read. */ }
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = { message: data }; } }
        const message = data?.error?.message || data?.message || (typeof data?.error === 'string' ? data.error : '');
        const code = data?.error?.code || data?.code;
        throw new Error(semanticErrorDetail(`${label}服务返回 HTTP ${response.status}${code ? `（${code}）` : ''}${message ? `：${message}` : ''}`, [key]));
    }
    try { return await response.json(); }
    catch (error) { if (error?.name === 'AbortError') throw error; throw new Error(`${label}响应不是有效 JSON：${semanticErrorDetail(error, [key])}`); }
}
export async function rerank(query, documents, config, key, { signal } = {}) {
    const endpoint = validateSemanticEndpoint(config.rerankEndpoint, '重排');
    if (!config.rerankModel) throw new Error('未设置重排模型');
    if (!documents.length) return [];
    const response = await fetch(endpoint, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ model: config.rerankModel, query, documents, top_n: documents.length }), signal });
    const data = await serviceJson(response, '重排', key), results = data?.results;
    if (!Array.isArray(results)) throw new Error('重排服务返回的数据无效：缺少 results 数组');
    if (results.length !== documents.length) throw new Error(`重排服务返回的数据无效：提交 ${documents.length} 条，返回 ${results.length} 条`);
    if (results.some(item => !Number.isInteger(item?.index) || item.index < 0 || item.index >= documents.length)) throw new Error('重排服务返回的数据无效：结果索引缺失或越界');
    if (new Set(results.map(item => item.index)).size !== results.length) throw new Error('重排服务返回的数据无效：结果索引重复');
    if (results.some(item => !Number.isFinite(item.relevance_score))) throw new Error('重排服务返回的数据无效：相关性分数不是有限数值');
    return results.slice().sort((a, b) => a.index - b.index).map(item => item.relevance_score);
}
export async function embed(inputs, config, key, { signal } = {}) {
    const endpoint = validateSemanticEndpoint(config.endpoint);
    if (!config.model) throw new Error('未设置向量模型');
    const response = await fetch(endpoint, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ model: config.model, input: inputs, ...(config.dimensions ? { dimensions: config.dimensions } : {}) }), signal });
    const data = await serviceJson(response, '向量', key);
    if (!Array.isArray(data?.data) || data.data.length !== inputs.length || data.data.some(item => !Number.isInteger(item.index) || item.index < 0 || item.index >= inputs.length) || new Set(data.data.map(item => item.index)).size !== inputs.length) throw new Error('向量结果索引无效');
    const vectors = data.data.slice().sort((a, b) => a.index - b.index).map(item => item.embedding);
    if (vectors.some(vector => !Array.isArray(vector) || !vector.length || vector.some(number => !Number.isFinite(number)))) throw new Error('向量服务返回的数据无效');
    const width = vectors[0]?.length;
    if (vectors.some(vector => vector.length !== width) || config.dimensions && width !== config.dimensions) throw new Error('向量维度不匹配');
    return vectors;
}
export async function loadVectors(memories, identity, config) {
    if (!memories.length) return new Map();
    const db = await openDb();
    try {
        const store = db.transaction(STORE).objectStore(STORE);
        const pairs = await Promise.all(memories.map(memory => new Promise((resolve, reject) => {
            const request = store.get(cacheKey(identity, config, memory));
            request.onsuccess = () => resolve([memory.id, request.result]);
            request.onerror = () => reject(request.error);
        })));
        return new Map(pairs.filter(([, vector]) => Array.isArray(vector)));
    } finally { db.close(); }
}
async function writeVectors(memories, vectors, identity, config) {
    const db = await openDb();
    try {
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite'), store = tx.objectStore(STORE);
            tx.oncomplete = resolve; tx.onerror = tx.onabort = () => reject(tx.error || new Error('向量缓存写入中止'));
            memories.forEach((memory, index) => store.put(vectors[index], cacheKey(identity, config, memory)));
        });
    } finally { db.close(); }
}
const indexQueues = new Map();
export function indexVectors(memories, identity, config, key) {
    // One writer per namespace; repeated snapshots share work, newer ones recheck the cache after waiting.
    const space = JSON.stringify([identity, config.endpoint, config.model, config.dimensions]), snapshot = JSON.stringify([key, memories.map(memory => [memory.id, memoryText(memory)])]);
    let queue = indexQueues.get(space);
    if (!queue) { queue = { tail: Promise.resolve(), pending: new Map() }; indexQueues.set(space, queue); }
    if (queue.pending.has(snapshot)) return queue.pending.get(snapshot);
    const frozen = structuredClone({ memories, identity, config });
    const task = queue.tail.catch(() => {}).then(async () => {
        for (let i = 0; i < frozen.memories.length; i += 16) {
            const batch = frozen.memories.slice(i, i + 16), cached = await loadVectors(batch, frozen.identity, frozen.config), missing = batch.filter(memory => !cached.has(memory.id));
            if (!missing.length) continue;
            const vectors = await embed(missing.map(memoryText), frozen.config, key);
            await writeVectors(missing, vectors, frozen.identity, frozen.config);
        }
    }).finally(() => {
        queue.pending.delete(snapshot);
        if (!queue.pending.size) indexQueues.delete(space);
    });
    queue.pending.set(snapshot, task); queue.tail = task;
    return task;
}
