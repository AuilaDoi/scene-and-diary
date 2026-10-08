const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const durationText = ms => ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
export function createRecallTrace() { return { startedAt: Date.now(), status: 'running', events: [], result: null }; }
export function logRecall(trace, stage, status, message, detail = '') {
    trace.events.push({ elapsed: Date.now() - trace.startedAt, stage, status, message, detail });
}
export function finishRecallTrace(trace, recall, status = 'done') {
    trace.status = status; trace.elapsed = Date.now() - trace.startedAt;
    const ranks = new Map(recall?.candidates.map((item, index) => [item.memory.id, index]));
    if (recall) trace.result = {
        count: recall.selected.length, budget: recall.budgetUsed, rejected: recall.rejectedCandidates.length,
        groups: recall.groups.map(group => ({ score: group.score, permanent: group.permanent, seeds: group.seedIds, members: group.members.map(item => ({ id: item.memory.id, title: item.memory.title || '未命名记忆', linked: !!item.linked })).sort((a, b) => Number(a.linked) - Number(b.linked) || (a.linked ? 0 : (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity))) })),
    };
}
export function renderRecallDiagnostics(trace, continuity) {
    if (!trace) return '<p class="scene-diary-muted">尚无召回记录。发送消息后，这里会展示最近一次召回流程。</p>';
    const labels = { running: '进行中', done: '完成', degraded: '降级完成', cancelled: '已取消', failed: '失败' };
    const statuses = { start: '开始', ok: '成功', skip: '跳过', warn: '回退', error: '失败', cancel: '取消' };
    const result = trace.result;
    const headline = `${labels[trace.status] || trace.status} · ${durationText(trace.elapsed ?? Date.now() - trace.startedAt)}${result ? ` · ${result.groups.length} 组 / ${result.count} 条` : ''}`;
    const settled = new Set(trace.events.filter(event => ['ok', 'error', 'cancel'].includes(event.status)).map(event => event.stage));
    const logs = trace.events.filter(event => event.status !== 'start' || !settled.has(event.stage)).map(event => `<li class="scene-diary-log-row" data-log-status="${escape(event.status)}"><span class="scene-diary-log-time">+${durationText(event.elapsed)}</span><div><strong>${escape(event.stage)}</strong> <span class="scene-diary-log-status">${statuses[event.status] || escape(event.status)}</span><p>${escape(event.message)}</p>${event.detail ? `<details><summary>查看具体原因</summary><pre>${escape(event.detail)}</pre></details>` : ''}</div></li>`).join('');
    const groups = result?.groups.map((group, index) => {
        const seeds = group.members.filter(item => group.seeds.includes(item.id)).map(item => item.title).join(' / ');
        return `<li class="scene-diary-recall-group"><strong>第 ${index + 1} 组 · ${escape(seeds)}</strong><p class="scene-diary-muted">${group.permanent ? '含常驻记忆 · ' : ''}组分数 ${group.score.toFixed(3)} · ${group.members.length} 条</p><ol>${group.members.map(item => `<li>${escape(item.title)} <span class="scene-diary-muted">${item.linked ? '关联条目' : '召回种子'}</span></li>`).join('')}</ol></li>`;
    }).join('');
    const injection = continuity ? `<p class="scene-diary-muted">上下文注入：${continuity.included ? '已注入' : escape(continuity.reason || '未注入')}${continuity.dryRun ? '（预览）' : ''}</p>` : '';
    return `<p class="scene-diary-diagnostic-summary">${escape(new Date(trace.startedAt).toLocaleTimeString())} · ${escape(headline)}</p><h4>召回流程</h4><ol class="scene-diary-log">${logs}</ol>${result ? `<h4>最终召回结果</h4><p class="scene-diary-muted">按最终组顺序展示 · 预算约 ${result.budget} tokens · ${result.rejected} 条候选低于最低分数</p>${groups ? `<ol class="scene-diary-recall-groups">${groups}</ol>` : '<p>本次没有记忆组通过召回筛选。</p>'}` : ''}${injection}`;
}
