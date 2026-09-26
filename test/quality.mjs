import { cases } from './quality-fixtures.mjs';
import { SearchIndex } from '../server/search.mjs';
import { recallMemories } from '../core.js';

const memories = Object.fromEntries(cases.map(item => [item.id, { ...item, kind: item.id.includes('breakfast') || item.id === 'allergy' || item.id === 'nickname' || item.id === 'tea' ? 'fact' : 'event', category: 'event', importance: 3, people: [], entityIds: [], sources: [], lifecycle: 'active', status: 'active' }]));
const index = new SearchIndex({ memories, entities: {}, edges: {} });
const scores = { old: [], text: [] };
for (const item of cases) for (const query of item.queries) {
    const old = recallMemories(Object.values(memories), query, { recallLimit: 8, memoryTokenBudget: 1200 }).selected.map(row => row.memory.id);
    const text = index.recall(query, { recallLimit: 8, memoryTokenBudget: 1200 }).selected.map(row => row.memory.id);
    if (process.argv.includes('--debug') && (!text.includes(item.id) || !old.includes(item.id))) console.log(JSON.stringify({ query, gold: item.id, old: old.indexOf(item.id), text: text.indexOf(item.id) }));
    for (const [name, ids] of [['old', old], ['text', text]]) { const rank = ids.indexOf(item.id); scores[name].push({ hit: rank >= 0 ? 1 : 0, ndcg: rank >= 0 ? 1 / Math.log2(rank + 2) : 0 }); }
}
const metrics = {};
for (const [name, values] of Object.entries(scores)) { metrics[name] = { recallAt8: values.reduce((sum, item) => sum + item.hit, 0) / values.length, ndcgAt8: values.reduce((sum, item) => sum + item.ndcg, 0) / values.length }; console.log(JSON.stringify({ mode: name, queries: values.length, recallAt8: +metrics[name].recallAt8.toFixed(3), ndcgAt8: +metrics[name].ndcgAt8.toFixed(3) })); }
if (metrics.text.recallAt8 < metrics.old.recallAt8) process.exitCode = 1;
