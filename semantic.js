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
async function read(key) { const db = await openDb(); try { return await new Promise((resolve, reject) => { const request = db.transaction(STORE).objectStore(STORE).get(key); request.onsuccess = () => resolve(request.result || null); request.onerror = () => reject(request.error); }); } finally { db.close(); } }
async function write(key, value) { const db = await openDb(); try { await new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(value, key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); } finally { db.close(); } }
export const cacheKey = (identity, config, memory) => [identity.account, identity.chat, identity.space, config.endpoint, config.model, config.dimensions || '', memory.id, fingerprint(memoryText(memory))].join('|');
export function validateSemanticEndpoint(value) { let url; try { url = new URL(value); } catch { throw new Error('向量接口地址无效'); } if (!['http:', 'https:'].includes(url.protocol)) throw new Error('向量接口须为 HTTP(S) 地址'); if (url.username || url.password || [...url.searchParams.keys()].some(key => /key|secret|token|password|auth/i.test(key))) throw new Error('请不要把密钥放在向量接口地址中'); return url.href; }
export async function embed(inputs, config, key, timeoutMs = 3000) {
    const endpoint = validateSemanticEndpoint(config.endpoint);
    if (!config.model) throw new Error('未设置向量模型');
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(endpoint, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ model: config.model, input: inputs, ...(config.dimensions ? { dimensions: config.dimensions } : {}) }), signal: controller.signal });
        if (!response.ok) throw new Error(`向量服务返回 ${response.status}`);
        const data = await response.json(), vectors = data?.data?.sort((a, b) => a.index - b.index).map(item => item.embedding);
        if (!Array.isArray(vectors) || vectors.length !== inputs.length || vectors.some(vector => !Array.isArray(vector) || !vector.length || vector.some(number => !Number.isFinite(number)))) throw new Error('向量服务返回的数据无效');
        const width = vectors[0].length;
        if (vectors.some(vector => vector.length !== width) || config.dimensions && width !== config.dimensions) throw new Error('向量维度不匹配');
        return vectors;
    } finally { clearTimeout(timer); }
}
export async function loadVectors(memories, identity, config) {
    const pairs = await Promise.all(memories.map(async memory => [memory.id, await read(cacheKey(identity, config, memory))]));
    return new Map(pairs.filter(([, vector]) => Array.isArray(vector)));
}
export async function indexVectors(memories, identity, config, key) {
    for (let i = 0; i < memories.length; i += 16) {
        const batch = memories.slice(i, i + 16), cached = await loadVectors(batch, identity, config), missing = batch.filter(memory => !cached.has(memory.id));
        if (!missing.length) continue;
        const vectors = await embed(missing.map(memoryText), config, key, 30000);
        for (let j = 0; j < missing.length; j++) await write(cacheKey(identity, config, missing[j]), vectors[j]);
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}
