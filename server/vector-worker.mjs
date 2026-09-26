import { parentPort } from 'node:worker_threads';

const libraries = new Map();
parentPort.on('message', message => {
    try {
        if (message.type === 'set') {
            libraries.set(message.libraryId, Object.entries(message.vectors).map(([id, value]) => ({ id, vector: Float32Array.from(value.vector) })));
            parentPort.postMessage({ requestId: message.requestId, ok: true }); return;
        }
        if (message.type === 'query') {
            const query = Float32Array.from(message.vector), scores = [];
            for (const row of libraries.get(message.libraryId) || []) {
                if (row.vector.length !== query.length) continue;
                let score = 0; for (let i = 0; i < query.length; i++) score += row.vector[i] * query[i];
                scores.push({ id: row.id, score, reason: 'vector' });
            }
            scores.sort((a, b) => b.score - a.score);
            parentPort.postMessage({ requestId: message.requestId, ranks: scores.slice(0, 100) });
        }
    } catch (error) { parentPort.postMessage({ requestId: message.requestId, error: error.message }); }
});
