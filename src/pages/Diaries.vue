<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TextField from '../TextField.vue';
import SearchField from '../SearchField.vue';
import { clean, diary } from '../../state-v7.js';
import { useWorkspace } from '../workspace';

const { view, host, run, select } = useWorkspace();
const query = ref('');
const state = computed(() => view.value.state);
const selected = ref<string | null>(null);
const draft = ref(null);
const items = computed(() => [...(state.value?.diaries || [])].sort((a, b) => b.createdAt - a.createdAt));
const waiting = computed(() => items.value.filter(item => item.summaryPending).map(item => item.id));
const list = computed(() => items.value.filter(item => (item.title + '\n' + item.body + '\n' + item.summary).toLowerCase().includes(query.value.trim().toLowerCase())));
const current = computed(() => items.value.find(item => item.id === selected.value));
watch(() => current.value?.updatedAt, () => { if (current.value) draft.value = { ...current.value }; }, { immediate: true });

function edit(item = null) {
    selected.value = item?.id || null;
    draft.value = item ? { ...item } : diary({ body: '', summary: '', title: '' });
}
function save(confirmSummary = false) {
    return run(async () => {
        if (!clean(draft.value.body)) throw new Error('请填写日记正文。');
        if (confirmSummary && !clean(draft.value.summary)) throw new Error('请先填写摘要。');
        const before = current.value;
        const summaryPending = confirmSummary ? false : before ? (before.body !== draft.value.body || before.summaryPending) : !clean(draft.value.summary);
        const saved = diary({ ...draft.value, summaryPending, needsReview: false, updatedAt: Date.now() });
        await host.mutate(next => {
            const index = next.diaries.findIndex(item => item.id === saved.id);
            if (index < 0 && before) throw new Error('该日记已删除。');
            if (index >= 0) next.diaries[index] = saved;
            else next.diaries.push(saved);
            if (!before || before.body !== saved.body || before.needsReview) next.characterGrowth.reviewRecommended = true;
        });
        edit(saved);
    });
}
function remove() {
    if (!current.value || !window.confirm('删除这篇日记及其摘要？')) return;
    const id = current.value.id;
    return run(async () => {
        await host.mutate(next => { next.diaries = next.diaries.filter(item => item.id !== id); next.characterGrowth.reviewRecommended = true; });
        draft.value = null; selected.value = null;
    });
}
</script>
<template>
    <p v-if="!state" class="sd-card">{{ view.blocker }}</p>
    <template v-else>
        <div class="sd-card sd-stack">
            <SearchField v-model="query" label="搜索日记标题、正文与摘要" />
            <div class="sd-actions">
                <button class="sd-primary" @click="edit()">新建日记</button>
                <button v-if="view.busy.includes('summary')" @click="host.cancel('summary')">取消摘要任务</button>
                <button v-else-if="waiting.length && view.channels.some(channel => channel.id === state.settings.bindings.summary)" @click="run(() => host.summarizeAll(waiting))">补全 {{ waiting.length }} 篇摘要</button>
                <button v-else-if="waiting.length" @click="select('settings')">配置摘要渠道</button>
            </div>
            <p v-if="view.summaryProgress" role="status">{{ view.summaryProgress }}</p>
        </div>
        <section v-if="draft" class="sd-card sd-stack">
            <header class="sd-section-title"><h3>{{ current ? '编辑日记' : '新建日记' }}</h3><button @click="draft = null; selected = null">关闭编辑</button></header>
            <label class="sd-field">标题<input v-model="draft.title"></label>
            <TextField v-model="draft.body" label="正文" :rows="12" />
            <TextField v-model="draft.summary" :label="current?.summaryPending ? '摘要 · 待核对' : '单篇摘要'" :rows="5" />
            <div class="sd-sticky sd-actions">
                <button v-if="current" class="sd-danger" @click="remove">删除</button>
                <button v-if="current && !view.busy.includes('summary')" @click="run(() => host.summarizeAll([current.id]))">重生成摘要</button>
                <button @click="save()">保存日记</button>
                <button class="sd-primary" @click="save(true)">保存并确认摘要</button>
            </div>
        </section>
        <p v-if="!list.length" class="sd-card">没有符合条件的日记。</p>
        <article v-for="item in list" :key="item.id" class="sd-card sd-listrow">
            <div><h3>{{ item.title }}</h3><p>{{ new Date(item.createdAt).toLocaleDateString() }}<span v-if="item.summaryPending"> · 摘要待核对</span><span v-if="item.needsReview"> · 日记待复核</span></p><p class="sd-snippet">{{ item.summary || item.body }}</p></div>
            <button @click="edit(item)">查看与编辑</button>
        </article>
    </template>
</template>
