import { parentPort } from 'node:worker_threads';
import { SearchIndex } from './search.mjs';

parentPort.on('message', library => {
    try {
        const index = new SearchIndex(library);
        parentPort.postMessage({ docs: index.docs, postings: index.postings, entities: index.entities, facts: index.facts, sources: index.sources, successors: index.successors, edges: index.edges, permanent: index.permanent, totalLength: index.totalLength });
    } catch (error) { parentPort.postMessage({ error: error.message }); }
});
