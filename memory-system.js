import { MEMORY_CATEGORIES, estimateTokens, fingerprint, newId, normalizeMemory, tokenize } from './core.js';

const arr = value => Array.isArray(value) ? value : [];
const clean = value => String(value ?? '').trim();
export const memoryEligible = memory => memory && !memory.deletedAt && !memory.disabled && memory.lifecycle !== 'archived' && memory.lifecycle !== 'superseded';
export const memoryText = memory => `${memory.title} ${memory.content} ${arr(memory.people).join(' ')} ${arr(memory.aliases).join(' ')}`;
export const memoryLine = memory => `【${memory.category}｜${memory.status}${memory.lifecycle === 'superseded' ? '｜历史版本' : ''}】${memory.title}：${memory.content}${memory.storyTime ? `（故事时间：${memory.storyTime}）` : ''}`;
export function weightedRecallQueries(rows) {
    const latestUser = [...rows].reverse().find(row => row.isUser);
    if (!latestUser) return [];
    const prior = rows.slice(0, rows.lastIndexOf(latestUser)).slice(-2).reverse();
    const weights = [0.4, 0.3, 0.3], selected = [latestUser, ...prior].filter(row => row.body), total = selected.reduce((sum, _, index) => sum + weights[index], 0);
    return selected.map((row, index) => ({ text: row.body, weight: weights[index] / total }));
}
export function rankWeightedScores(scores, queries, count) {
    return Array.from({ length: count }, (_, index) => index).sort((a, b) => queries.reduce((sum, item, index) => sum + item.weight * (scores[index][b] - scores[index][a]), 0));
}

function validateCandidate(item, index, actId) {
    if (!item || typeof item !== 'object' || !MEMORY_CATEGORIES.includes(item.category)) throw new Error(`记忆 ${index + 1} 类别无效`);
    if (item.status != null && !['active', 'completed', 'cancelled', 'historical'].includes(item.status)) throw new Error(`记忆 ${index + 1} 状态无效`);
    const title = clean(item.title), content = clean(item.content);
    if (!title || !content || title.length > 120 || content.length > 500) throw new Error(`记忆 ${index + 1} 标题或内容为空、超长`);
    const sources = arr(item.sources).filter(source => source && typeof source === 'object').slice(0, 30).map(source => ({ actId, messageId: clean(source.messageId).slice(0, 120), excerpt: clean(source.excerpt).slice(0, 500) })).filter(source => source.messageId);
    return normalizeMemory({ category: item.category, title, content, people: item.people, aliases: item.aliases, importance: item.importance, status: item.status, storyTime: item.storyTime, sources, sourceActId: actId, sourceMessageIds: [...new Set(sources.map(source => source.messageId))] });
}

export function validateCandidates(raw, _rows, actId) {
    if (!Array.isArray(raw)) throw new Error('记忆结果必须是数组');
    if (raw.length > 30) throw new Error('单幕记忆候选超过 30 条');
    return raw.map((item, index) => validateCandidate(item, index, actId));
}

export function validateCandidateBatch(raw, _rows, actId) {
    if (!Array.isArray(raw)) throw new Error('记忆结果必须是数组');
    if (raw.length > 30) throw new Error('单幕记忆候选超过 30 条');
    const candidates = [], rejected = [];
    raw.forEach((item, index) => {
        try { candidates.push(validateCandidate(item, index, actId)); }
        catch (error) { rejected.push({ index: index + 1, title: clean(item?.title).slice(0, 120), reason: error.message }); }
    });
    return { candidates, rejected };
}

function words(value) { return tokenize(value); }
function frequencyTerms(value) { const source = String(value || '').toLocaleLowerCase(), output = []; try { if (Intl.Segmenter) for (const part of new Intl.Segmenter('zh', { granularity: 'word' }).segment(source)) if (part.isWordLike && part.segment.trim()) output.push(part.segment); } catch {} for (const run of source.match(/[\u4e00-\u9fff]{2,}/g) || []) for (let i = 0; i < run.length - 1; i++) output.push(run.slice(i, i + 2)); return output.concat(source.match(/[a-z0-9_-]{2,}/g) || []); }
const indexCache = new Map();
function lexicalIndex(memories, revision) {
    const key = revision == null ? null : `${revision}:${fingerprint(memories.map(memory => `${memory.id}\u0000${memoryText(memory)}`).join('\u0001'))}`;
    if (key && indexCache.has(key)) return indexCache.get(key);
    const docs = memories.map(memory => { const terms = frequencyTerms(memoryText(memory)), tf = new Map(); for (const term of terms) tf.set(term, (tf.get(term) || 0) + 1); return { memory, tf, length: terms.length }; });
    const df = new Map(); for (const doc of docs) for (const term of doc.tf.keys()) df.set(term, (df.get(term) || 0) + 1);
    const result = { docs, df, average: docs.reduce((sum, doc) => sum + doc.length, 0) / Math.max(1, docs.length) };
    if (key) { indexCache.set(key, result); if (indexCache.size > 3) indexCache.delete(indexCache.keys().next().value); }
    return result;
}
function overlap(a, b) { const aa = new Set(words(a)), bb = new Set(words(b)); return [...aa].filter(word => bb.has(word)).length / Math.max(1, Math.min(aa.size, bb.size)); }
export function findMemoryNeighbors(candidates, memories, perCandidate = 5, cap = 30) {
    const groups = candidates.map(candidate => ({ candidateId: candidate.id, neighbors: memories.filter(memoryEligible).map(memory => ({ memory, score: overlap(memoryText(candidate), memoryText(memory)) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id)).slice(0, perCandidate).map(item => item.memory.id) }));
    const allowed = new Set(groups.flatMap(group => group.neighbors).slice(0, cap));
    return groups.map(group => ({ ...group, neighbors: group.neighbors.filter(id => allowed.has(id)) }));
}

export function planMemoryChanges(candidates, memories, proposals = null) {
    const byCandidate = new Map(candidates.map(candidate => [candidate.id, candidate]));
    const byTarget = new Map(memories.map(memory => [memory.id, memory]));
    if (proposals != null && !Array.isArray(proposals)) throw new Error('记忆维护结果必须是数组');
    const operations = proposals ?? candidates.map(candidate => ({ action: 'add', candidateId: candidate.id }));
    const seen = new Set();
    const planned = operations.map((raw, index) => {
        const action = clean(raw?.action), candidate = byCandidate.get(clean(raw?.candidateId)), target = byTarget.get(clean(raw?.targetId));
        if (!['add', 'merge', 'supersede', 'set_status', 'archive', 'skip'].includes(action)) throw new Error(`维护操作 ${index + 1} 不支持`);
        if (!candidate && ['add', 'merge', 'supersede', 'set_status', 'archive'].includes(action)) throw new Error(`维护操作 ${index + 1} 的候选不存在`);
        if (!target && ['merge', 'supersede', 'set_status', 'archive'].includes(action)) throw new Error(`维护操作 ${index + 1} 的目标不存在`);
        if (target?.locked && !['skip'].includes(action)) throw new Error(`锁定记忆 ${target.title} 不可由模型修改`);
        if (action === 'archive' && (target.permanent || target.category === 'promise' && target.status === 'active')) throw new Error('常驻或未完成承诺不可归档');
        if (action === 'set_status' && !['completed', 'cancelled', 'historical', 'active'].includes(raw.status)) throw new Error('维护状态无效');
        const key = candidate?.id || `target:${target?.id}`;
        if (seen.has(key)) throw new Error('记忆维护存在重复操作');
        seen.add(key);
        return { id: newId('operation'), action, candidateId: candidate?.id || null, targetId: target?.id || null, status: action === 'set_status' ? raw.status : null, reason: clean(raw.reason).slice(0, 300), accepted: action !== 'skip' };
    });
    if (candidates.some(candidate => !seen.has(candidate.id))) throw new Error('有候选记忆缺少维护决策');
    return planned;
}

export function applyMemoryChanges(state, candidates, operations, transactionId = newId('maintenance')) {
    const before = structuredClone(state.memories), result = structuredClone(state.memories);
    const map = new Map(result.map(memory => [memory.id, memory]));
    const candidateMap = new Map(candidates.map(candidate => [candidate.id, candidate]));
    for (const operation of operations.filter(item => item.accepted)) {
        const candidate = candidateMap.get(operation.candidateId), target = map.get(operation.targetId);
        if (candidate && (!clean(candidate.title) || clean(candidate.title).length > 120 || !clean(candidate.content) || clean(candidate.content).length > 500)) throw new Error('编辑后的记忆标题或内容无效');
        if (target?.locked) throw new Error('锁定记忆在预览后发生变化');
        if (operation.action === 'add') { if (!candidate) throw new Error('候选已失效'); const added = normalizeMemory(candidate); result.push(added); map.set(added.id, added); }
        if (operation.action === 'merge') { if (!candidate || !target) throw new Error('合并目标已失效'); target.sources = [...arr(target.sources), ...candidate.sources].filter((source, index, all) => all.findIndex(other => other.messageId === source.messageId && other.excerpt === source.excerpt) === index); target.sourceMessageIds = [...new Set(target.sources.map(source => source.messageId))]; target.revision++; const existing = map.get(candidate.id); if (existing && existing.id !== target.id) { existing.lifecycle = 'archived'; existing.mergedInto = target.id; existing.revision++; } }
        if (operation.action === 'supersede') { if (!candidate || !target || candidate.id === target.id) throw new Error('替代目标已失效'); target.lifecycle = 'superseded'; target.revision++; const existing = map.get(candidate.id); if (existing) { existing.supersedes = [...new Set([...arr(existing.supersedes), target.id])]; existing.revision++; } else { const added = normalizeMemory({ ...candidate, supersedes: [target.id] }); result.push(added); map.set(added.id, added); } }
        if (operation.action === 'set_status') { if (!target || !candidate) throw new Error('状态目标或候选已失效'); target.status = operation.status; target.sources = [...arr(target.sources), ...arr(candidate.sources)]; target.revision++; }
        if (operation.action === 'archive') { if (!target || !candidate || target.permanent || target.category === 'promise' && target.status === 'active') throw new Error('归档目标不可用'); target.lifecycle = 'archived'; target.revision++; }
    }
    state.memories = result;
    state.memoryRevision = (+state.memoryRevision || 0) + 1;
    state.maintenanceHistory ||= [];
    state.maintenanceHistory.push({ transactionId, before, after: structuredClone(result), revision: state.memoryRevision, at: Date.now() });
    return state;
}

const vectorCosine = (a, b) => { if (!a || !b || a.length !== b.length) return 0; let dot = 0, an = 0, bn = 0; for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; an += a[i] ** 2; bn += b[i] ** 2; } return an && bn ? dot / Math.sqrt(an * bn) : 0; };
export function retrieveMemories(memories, query, settings, { vectors = new Map(), queryVector = null, queries = null, queryVectors = null, revision = null } = {}) {
    const retrospective = /以前|过去|当时|曾经|之前|还记得|回忆/.test(query);
    const eligible = memories.filter(memory => memoryEligible(memory) || retrospective && memory.lifecycle === 'superseded' && !memory.deletedAt && !memory.disabled), permanent = eligible.filter(memory => memory.permanent && memory.lifecycle !== 'superseded'), ordinary = eligible.filter(memory => !permanent.includes(memory));
    const weighted = Array.isArray(queries) && queries.length ? queries.filter(item => item?.text).map(item => ({ text: item.text, weight: item.weight })) : [{ text: query, weight: 1 }];
    const index = lexicalIndex(ordinary, revision);
    const lexical = index.docs.map(doc => {
        const memory = doc.memory, hits = new Set(); let exact = false, score = 0;
        for (const item of weighted) {
            const terms = [...new Set(frequencyTerms(item.text))], matched = terms.filter(term => doc.tf.has(term));
            matched.forEach(term => hits.add(term));
            const direct = [memory.title, ...arr(memory.aliases)].some(label => clean(label) && item.text.toLowerCase().includes(clean(label).toLowerCase()));
            const bm25 = matched.reduce((sum, term) => { const tf = doc.tf.get(term), df = index.df.get(term); return sum + Math.log(1 + (ordinary.length - df + 0.5) / (df + 0.5)) * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * doc.length / Math.max(1, index.average))); }, 0);
            score += item.weight * (bm25 + (direct ? 2 : 0)); exact ||= direct;
        }
        return { memory, score, hits: [...hits], source: exact ? 'exact' : 'lexical' };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 30);
    const weightedVectors = Array.isArray(queryVectors) && queryVectors.length ? queryVectors : queryVector ? [{ vector: queryVector, weight: 1 }] : [];
    const semantic = weightedVectors.length ? ordinary.map(memory => ({ memory, score: weightedVectors.reduce((sum, item) => sum + item.weight * vectorCosine(item.vector, vectors.get(memory.id)), 0), hits: [], source: 'vector' })).filter(item => item.score > 0.15).sort((a, b) => b.score - a.score).slice(0, 30) : [];
    const scores = new Map();
    for (const [channel, items] of [['lexical', lexical], ['vector', semantic]]) items.forEach((item, rank) => { const previous = scores.get(item.memory.id) || { ...item, score: 0, sources: [] }; previous.score += 1 / (60 + rank + 1); previous.sources.push(channel); scores.set(item.memory.id, previous); });
    const ranked = [...scores.values()].sort((a, b) => b.score - a.score || a.memory.id.localeCompare(b.memory.id));
    const selected = permanent.slice(0, +settings.recallLimit).map(memory => ({ memory, score: 0, hits: [], permanent: true, source: 'permanent' }));
    let budgetUsed = selected.reduce((total, item) => total + estimateTokens(memoryLine(item.memory)), 0);
    const remaining = ranked.slice(), maxScore = Math.max(...ranked.map(item => item.score), 0.0001);
    while (remaining.length && selected.length < +settings.recallLimit) {
        remaining.sort((a, b) => (b.score / maxScore * 0.8 - Math.max(0, ...selected.filter(item => !item.permanent).map(item => overlap(memoryText(b.memory), memoryText(item.memory)))) * 0.2) - (a.score / maxScore * 0.8 - Math.max(0, ...selected.filter(item => !item.permanent).map(item => overlap(memoryText(a.memory), memoryText(item.memory)))) * 0.2));
        const item = remaining.shift(), cost = estimateTokens(memoryLine(item.memory));
        if (budgetUsed + cost <= +settings.memoryTokenBudget) { selected.push({ ...item, permanent: false }); budgetUsed += cost; }
    }
    return { query, selected, candidates: [...permanent.map(memory => ({ memory, score: 0, hits: [], permanent: true })), ...ranked], budgetUsed, degraded: !weightedVectors.length && !!settings.semantic?.enabled };
}
