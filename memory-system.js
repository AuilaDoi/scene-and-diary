import { fingerprint, tokenize } from './core.js';

const clean = value => String(value ?? '').trim();
export const memoryText = memory => clean(memory.content);

const indexCache = new Map();
function lexicalIndex(memories, revision) {
    const key = `${revision}:${fingerprint(memories.map(memory => `${memory.id}\u0000${memoryText(memory)}`).join('\u0001'))}`;
    if (indexCache.has(key)) return indexCache.get(key);
    const docs = memories.map(memory => { const terms = tokenize(memoryText(memory)), tf = new Map(); for (const term of terms) tf.set(term, (tf.get(term) || 0) + 1); return { memory, tf, length: terms.length }; });
    const df = new Map(); for (const doc of docs) for (const term of doc.tf.keys()) df.set(term, (df.get(term) || 0) + 1);
    const result = { docs, df, average: docs.reduce((sum, doc) => sum + doc.length, 0) / Math.max(1, docs.length) };
    indexCache.set(key, result); if (indexCache.size > 3) indexCache.delete(indexCache.keys().next().value); return result;
}
function normalizeRelevance(pool) {
    const max = pool[0]?.score || 1;
    return pool.map(item => ({
        ...item,
        // A weak match stays weak even when it leads the pool.
        relevance: Math.min(item.score / max, item.evidenceRelevance),
    }));
}
const cosine = (a, b) => { if (!a || !b || a.length !== b.length) return 0; let dot = 0, an = 0, bn = 0; for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; an += a[i] ** 2; bn += b[i] ** 2; } return an && bn ? dot / Math.sqrt(an * bn) : 0; };
export function createMemoryRetriever(memories, revision = null, { poolSize = 30 } = {}) {
    const ordinary = memories.filter(memory => memory && !memory.deletedAt && !memory.permanent);
    const index = lexicalIndex(ordinary, revision);
    const currentById = new Map(ordinary.map(memory => [memory.id, memory]));
    return (query, { vectors = new Map(), queryVector = null } = {}) => {
        const terms = tokenize(query);
        const lexical = index.docs.map(doc => {
            const hits = terms.filter(term => doc.tf.has(term)), direct = clean(doc.memory.content) && query.toLowerCase().includes(clean(doc.memory.content).toLowerCase());
            const score = hits.reduce((sum, term) => { const tf = doc.tf.get(term), df = index.df.get(term); return sum + Math.log(1 + (ordinary.length - df + .5) / (df + .5)) * tf * 2.2 / (tf + 1.2 * (.25 + .75 * doc.length / Math.max(1, index.average))); }, 0) + (direct ? 2 : 0);
            return { memory: currentById.get(doc.memory.id), score, evidenceRelevance: score / (score + .5), hits, source: direct ? 'exact' : 'lexical' };
        }).sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id)).slice(0, poolSize);
        const semantic = queryVector ? ordinary.filter(memory => vectors.has(memory.id)).map(memory => { const score = cosine(queryVector, vectors.get(memory.id)); return { memory, score, evidenceRelevance: Math.max(0, Math.min(1, score)), hits: [], source: 'vector' }; }).sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id)).slice(0, poolSize) : [];
        const scores = new Map();
        for (const [channel, items] of [['lexical', lexical], ['vector', semantic]]) {
            items.forEach((item, rank) => {
                if (item.evidenceRelevance <= 0) return;
                const previous = scores.get(item.memory.id) || { ...item, score: 0, evidenceRelevance: 0, channels: [] };
                previous.score += 1 / (60 + rank + 1);
                previous.evidenceRelevance = Math.max(previous.evidenceRelevance, item.evidenceRelevance);
                previous.channels.push(channel);
                scores.set(item.memory.id, previous);
            });
        }

        const pool = [...scores.values()].sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id)).slice(0, poolSize);
        return normalizeRelevance(pool);
    };
}
