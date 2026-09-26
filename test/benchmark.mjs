import { performance } from 'node:perf_hooks';
import { SearchIndex } from '../server/search.mjs';

const sizes = process.argv.slice(2).map(Number).filter(Number.isInteger);
for (const size of sizes.length ? sizes : [5000, 10000, 50000]) {
    const memories = {};
    for (let i = 0; i < size; i++) memories[`m${i}`] = { id: `m${i}`, title: `第${i}次约会的礼物`, content: `玩家和角色在地点${i % 100}谈到了早餐、戒指和未来安排。`.repeat(7), aliases: [`纪念物${i}`], people: [], importance: 3, lifecycle: 'active', entityIds: [], sources: [] };
    const library = { memories, entities: {}, edges: {} }, begin = performance.now(), index = new SearchIndex(library), buildMs = performance.now() - begin, durations = [];
    for (let i = 0; i < 200; i++) { const start = performance.now(); index.recall(`纪念物${i * 37 % size} 地点${i % 100}`); durations.push(performance.now() - start); }
    durations.sort((a, b) => a - b);
    console.log(JSON.stringify({ size, buildMs: Math.round(buildMs), p50Ms: +durations[99].toFixed(1), p95Ms: +durations[189].toFixed(1), heapMB: Math.round(process.memoryUsage().heapUsed / 1048576) }));
}
