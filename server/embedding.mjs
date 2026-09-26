import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Worker } from 'node:worker_threads';

const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const text = memory => `${memory.title} ${memory.content} ${(memory.aliases || []).join(' ')}`.trim();
function normalize(vector) {
    if (!Array.isArray(vector) || vector.length < 2 || vector.length > 8192 || vector.some(x => !Number.isFinite(x))) throw new Error('Invalid embedding vector');
    const norm = Math.hypot(...vector); if (!norm) throw new Error('Zero embedding vector');
    return vector.map(x => x / norm);
}
export class Embeddings {
    constructor(root) { this.root = root; this.pending = new Map(); this.queued = new Map(); this.indexCache = new Map(); this.queryCache = new Map(); this.worker = null; this.waiting = new Map(); this.workerVersion = new Map(); }
    async workerRequest(message, timeout = 1000) {
        if (!this.worker) {
            this.worker = new Worker(new URL('./vector-worker.mjs', import.meta.url)); this.worker.unref();
            this.worker.on('message', result => { const pending = this.waiting.get(result.requestId); if (!pending) return; this.waiting.delete(result.requestId); clearTimeout(pending.timer); result.error ? pending.reject(new Error(result.error)) : pending.resolve(result); });
            this.worker.on('error', error => { for (const pending of this.waiting.values()) { clearTimeout(pending.timer); pending.reject(error); } this.waiting.clear(); this.worker = null; this.workerVersion.clear(); });
        }
        const requestId = crypto.randomUUID();
        return new Promise((resolve, reject) => { const timer = setTimeout(() => { this.waiting.delete(requestId); reject(new Error('Vector worker timeout')); }, timeout); this.waiting.set(requestId, { resolve, reject, timer }); this.worker.postMessage({ ...message, requestId }); });
    }
    async config() { try { return JSON.parse(await fs.readFile(path.join(this.root, 'embedding-config.json'), 'utf8')); } catch (error) { if (error.code === 'ENOENT') return { enabled: false }; throw error; } }
    async publicConfig() { const { apiKey, ...rest } = await this.config(); return { ...rest, hasKey: !!apiKey }; }
    async saveConfig(input) {
        const before = await this.config();
        const url = String(input.baseUrl || '').trim();
        if (input.enabled) { const parsed = new URL(url); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid embedding URL'); if (!input.model) throw new Error('Embedding model required'); }
        const config = { enabled: !!input.enabled, baseUrl: url, model: String(input.model || '').trim(), apiKey: input.apiKey ? String(input.apiKey) : before.apiKey || '', dimension: +input.dimension || 0, batchSize: Math.max(1, Math.min(16, +input.batchSize || 16)) };
        await fs.mkdir(this.root, { recursive: true }); await fs.writeFile(path.join(this.root, 'embedding-config.json'), JSON.stringify(config)); this.queryCache.clear();
        return this.publicConfig();
    }
    async vector(value, config, signal) {
        const endpoint = `${config.baseUrl.replace(/\/$/, '').replace(/\/embeddings$/, '')}/embeddings`;
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` }, body: JSON.stringify({ model: config.model, input: value }), signal });
        if (!response.ok) throw new Error(`Embedding HTTP ${response.status}`);
        const result = await response.json(), rows = result.data?.slice().sort((a, b) => a.index - b.index);
        if (!rows || rows.length !== (Array.isArray(value) ? value.length : 1)) throw new Error('Embedding response count mismatch');
        const vectors = rows.map(row => normalize(row.embedding));
        if (vectors.some(item => item.length !== vectors[0].length) || (config.dimension && vectors[0].length !== config.dimension)) throw new Error('Embedding dimension mismatch');
        return vectors;
    }
    async test() { const config = await this.config(); if (!config.enabled) throw new Error('Embedding disabled'); const vectors = await this.vector(['测试'], config, AbortSignal.timeout(5000)); return { ok: true, dimension: vectors[0].length }; }
    async load(libraryId) { if (this.indexCache.has(libraryId)) { const saved = this.indexCache.get(libraryId); this.indexCache.delete(libraryId); this.indexCache.set(libraryId, saved); return saved; } let saved; try { saved = JSON.parse(await fs.readFile(path.join(this.root, `${libraryId}.vectors.json`), 'utf8')); } catch (error) { if (error.code === 'ENOENT' || error instanceof SyntaxError) saved = { fingerprint: '', vectors: {} }; else throw error; } saved.version ||= 0; this.indexCache.set(libraryId, saved); while (this.indexCache.size > 3) this.indexCache.delete(this.indexCache.keys().next().value); return saved; }
    async save(libraryId, saved) { const target = path.join(this.root, `${libraryId}.vectors.json`), temp = `${target}.${crypto.randomUUID()}.tmp`; await fs.mkdir(this.root, { recursive: true }); try { await fs.writeFile(temp, JSON.stringify(saved)); await fs.rename(temp, target); } finally { await fs.rm(temp, { force: true }); } }
    async update(library) {
        const config = await this.config(); if (!config.enabled) return { enabled: false };
        const fingerprint = hash(`${config.baseUrl}\u0000${config.model}\u0000${config.dimension}`), saved = await this.load(library.libraryId);
        if (saved.fingerprint !== fingerprint) { saved.fingerprint = fingerprint; saved.vectors = {}; }
        const pending = Object.values(library.memories).filter(memory => !memory.deletedAt && memory.lifecycle !== 'superseded' && (!saved.vectors[memory.id] || saved.vectors[memory.id].hash !== hash(text(memory))));
        for (let i = 0; i < pending.length; i += config.batchSize) {
            const batch = pending.slice(i, i + config.batchSize), vectors = await this.vector(batch.map(text), config, AbortSignal.timeout(20000));
            batch.forEach((memory, index) => saved.vectors[memory.id] = { hash: hash(text(memory)), vector: vectors[index] });
            await this.save(library.libraryId, saved);
        }
        for (const id of Object.keys(saved.vectors)) if (!library.memories[id] || library.memories[id].deletedAt) delete saved.vectors[id];
        saved.version = (saved.version || 0) + 1; this.workerVersion.delete(library.libraryId);
        await this.save(library.libraryId, saved);
        return { enabled: true, indexed: Object.keys(saved.vectors).length, pending: pending.length };
    }
    queue(library) {
        this.queued.set(library.libraryId, library);
        if (this.pending.has(library.libraryId)) return this.pending.get(library.libraryId);
        const task = (async () => { while (this.queued.has(library.libraryId)) { const next = this.queued.get(library.libraryId); this.queued.delete(library.libraryId); try { await this.update(next); } catch { /* Text retrieval remains available; retry is user-controlled. */ } } })().finally(() => this.pending.delete(library.libraryId));
        this.pending.set(library.libraryId, task); return task;
    }
    async ranks(library, query, timeout = 1500) {
        const config = await this.config(); if (!config.enabled) return { ranks: [], fallback: 'disabled' };
        try {
            const deadline = Date.now() + timeout, fingerprint = hash(`${config.baseUrl}\u0000${config.model}\u0000${config.dimension}`), cacheKey = `${fingerprint}\u0000${query}`;
            let vector = this.queryCache.get(cacheKey);
            if (!vector) { vector = (await this.vector([query], config, AbortSignal.timeout(timeout)))[0]; this.queryCache.set(cacheKey, vector); if (this.queryCache.size > 64) this.queryCache.delete(this.queryCache.keys().next().value); }
            const saved = await this.load(library.libraryId);
            if (saved.fingerprint !== fingerprint) return { ranks: [], fallback: 'index rebuilding' };
            const remaining = () => { const ms = deadline - Date.now(); if (ms <= 0) throw new Error('Embedding recall timeout'); return ms; };
            if (this.workerVersion.get(library.libraryId) !== saved.version) { await this.workerRequest({ type: 'set', libraryId: library.libraryId, vectors: saved.vectors }, remaining()); this.workerVersion.set(library.libraryId, saved.version); }
            const scores = (await this.workerRequest({ type: 'query', libraryId: library.libraryId, vector }, remaining())).ranks;
            const valid = [];
            for (const row of scores) {
                const id = row.id, entry = saved.vectors[id];
                const memory = library.memories[id]; if (!memory || !entry || memory.deletedAt || memory.dirty || memory.lifecycle !== 'active' || entry.hash !== hash(text(memory)) || entry.vector.length !== vector.length) continue;
                valid.push(row);
            }
            return { ranks: valid.slice(0, 40), fallback: '' };
        } catch (error) { return { ranks: [], fallback: error.message }; }
    }
}
