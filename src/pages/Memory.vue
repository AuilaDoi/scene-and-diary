<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { CATEGORIES, EDGE_TYPES, eligible, normalizeEdges, edgeKey, saveFact, deleteFact, mergeFacts } from '../../state-v7.js';
import TextField from '../TextField.vue';
import SearchField from '../SearchField.vue';
import { useWorkspace } from '../workspace';

const { view, host, run, select } = useWorkspace();
const state = computed(() => view.value.state);
const tab = ref('facts'), query = ref('');
const editor = ref<any>(null), selected = ref('');
const edge = ref<any>(null), originalKey = ref('');
const approved = ref<any[]>([]);
const merge = ref(false), mergeSource = ref(''), mergeContent = ref('');
const byId = computed(() => new Map<string, { title: string; content: string }>((state.value?.memories || []).map(item => [item.id, item])));
const active = computed(() => (state.value?.memories || []).filter(eligible));
const pending = computed(() => (state.value?.memories || []).filter(item => !eligible(item)));
const filtered = computed(() => (tab.value === 'pending' ? pending.value : active.value).filter(item =>
    [item.title, item.content, ...item.people, ...item.aliases].join('\n').toLowerCase().includes(query.value.trim().toLowerCase())));
const neighbors = computed(() => (state.value?.edges || []).filter(item => item.from === selected.value || item.to === selected.value));
const title = id => byId.value.get(id)?.title || id;
watch(() => JSON.stringify(state.value?.graphPreview), () => { approved.value = JSON.parse(JSON.stringify(state.value?.graphPreview?.edges || [])); }, { immediate: true });

function edit(item = null) {
    editor.value = item ? { ...item, peopleText: item.people.join('、'), aliasesText: item.aliases.join('、') }
        : { title: '', category: 'preference', content: '', importance: 3, storyTime: '', peopleText: '', aliasesText: '', permanent: false };
}
function storeFact() {
    return run(async () => {
        const { id, title, content, category, importance, storyTime, permanent, peopleText, aliasesText } = editor.value;
        const split = value => value.split(/[、，,\r\n]+/).map(part => part.trim()).filter(Boolean);
        await host.mutate(next => saveFact(next, { title, content, category, importance, storyTime, permanent, people: split(peopleText), aliases: split(aliasesText) }, id));
        editor.value = null;
    });
}
function toggle(item, property) {
    return run(() => host.mutate(next => {
        const memory = next.memories.find(memory => memory.id === item.id);
        if (!memory) throw new Error('该事实已删除。');
        if (memory.locked && property !== 'locked') throw new Error('请先解锁。');
        memory[property] = !memory[property]; next.memoryRevision++;
        if (editor.value?.id === item.id) editor.value[property] = memory[property];
    }));
}
function removeFact() {
    if (!editor.value || !window.confirm('删除此事实及其相关边？')) return;
    const id = editor.value.id;
    return run(async () => { await host.mutate(next => deleteFact(next, id)); editor.value = null; });
}
function openEdge(item = null) {
    edge.value = item ? { ...item } : { from: selected.value, to: '', type: 'stored_at', reason: '' };
    originalKey.value = item ? edgeKey(item) : '';
}
function storeEdge() {
    const item = { ...edge.value };
    return run(async () => {
        await host.mutate(next => {
            const others = next.edges.filter(item => edgeKey(item) !== originalKey.value);
            const edges = normalizeEdges([...others, item], next.memories);
            if (edges.length !== others.length + 1) throw new Error('请选择不同的事实、关系类型并填写依据，且避免重复关系。');
            next.edges = edges;
        });
        selected.value = item.from; edge.value = null;
    });
}
function removeEdge() {
    if (!window.confirm('删除这条关系？')) return;
    return run(async () => { await host.mutate(next => { next.edges = next.edges.filter(item => edgeKey(item) !== originalKey.value); }); edge.value = null; });
}
function applyMerge() {
    if (!window.confirm('将来源事实合并到选定事实，并重定向相关边？')) return;
    return run(async () => {
        await host.mutate(next => mergeFacts(next, selected.value, [mergeSource.value], mergeContent.value));
        merge.value = false;
    });
}
</script>

<template>
    <p v-if="!state" class="sd-card">{{ view.blocker }}</p>
    <template v-else>
        <nav class="sd-segments" aria-label="长期记忆视图">
            <button :aria-pressed="tab === 'facts'" @click="tab = 'facts'; editor = null">事实表</button>
            <button :aria-pressed="tab === 'pending'" @click="tab = 'pending'; editor = null">待分类{{ pending.length ? ' · ' + pending.length : '' }}</button>
            <button :aria-pressed="tab === 'graph'" @click="tab = 'graph'; editor = null">记忆图谱</button>
        </nav>
        <template v-if="tab !== 'graph'">
            <div class="sd-card sd-stack">
                <SearchField v-model="query" label="搜索事实、人物、别名" />
                <p v-if="tab === 'pending'">这些旧条目保留原文和控制属性。保存新类别后恢复召回。</p>
                <div v-else class="sd-actions"><button class="sd-primary" @click="edit()">新增事实</button></div>
            </div>
            <section v-if="editor" class="sd-card sd-stack">
                <header class="sd-section-title"><h3>{{ editor.id ? '编辑事实' : '新建事实' }}</h3><button @click="editor = null">关闭编辑</button></header>
                <fieldset :disabled="editor.locked" class="sd-stack">
                    <div class="sd-form-grid">
                        <label class="sd-field">类别<select v-model="editor.category"><option v-if="!CATEGORIES[editor.category]" :value="editor.category">旧类别 · {{ editor.category }}</option><option v-for="(label, key) in CATEGORIES" :key="key" :value="key">{{ label }}</option></select></label>
                        <label class="sd-field">重要度<input type="number" v-model.number="editor.importance" min="1" max="5"></label>
                    </div>
                    <label class="sd-field">标题<input v-model="editor.title"></label>
                    <TextField v-model="editor.content" label="可独立理解的客观事实" />
                    <div class="sd-form-grid">
                        <label class="sd-field">故事时间<input v-model="editor.storyTime"></label>
                        <label class="sd-field">相关人物<input v-model="editor.peopleText"></label>
                        <label class="sd-field">别名<input v-model="editor.aliasesText"></label>
                    </div>
                    <label><input type="checkbox" v-model="editor.permanent"> 常驻</label>
                </fieldset>
                <div class="sd-sticky sd-actions">
                    <button v-if="editor.id" @click="toggle(editor, 'locked')">{{ editor.locked ? '解锁' : '锁定' }}</button>
                    <button v-if="editor.id && !editor.locked" class="sd-danger" @click="removeFact">删除</button>
                    <button class="sd-primary" :disabled="editor.locked" @click="storeFact">保存事实</button>
                </div>
            </section>
            <p v-if="!filtered.length" class="sd-card">没有符合条件的事实。</p>
            <article v-for="item in filtered" :key="item.id" class="sd-card sd-listrow">
                <div class="sd-stack"><h3>{{ item.title }}</h3><p>{{ CATEGORIES[item.category] || item.category }} · 重要度 {{ item.importance }}<span v-if="item.locked"> · 已锁定</span><span v-if="item.permanent"> · 常驻</span></p><p>{{ item.content }}</p></div>
                <div class="sd-actions"><button @click="edit(item)">查看与编辑</button><button v-if="tab === 'facts'" @click="selected = item.id; tab = 'graph'">关系</button></div>
            </article>
        </template>
        <template v-else>
            <section class="sd-card sd-stack">
                <header class="sd-section-title"><h3>节点与关系</h3><span>{{ active.length }} 个节点 · {{ state.edges.length }} 条边</span></header>
                <label class="sd-field">查看事实<select v-model="selected" @change="edge = null; merge = false"><option value="">请选择</option><option v-for="item in active" :key="item.id" :value="item.id">{{ item.title }}</option></select></label>
                <div v-if="byId.has(selected)" class="sd-graph">
                    <div class="sd-node"><h3>{{ title(selected) }}</h3><p>{{ byId.get(selected).content }}</p></div>
                    <div class="sd-branches">
                        <p v-if="!neighbors.length">该事实尚无关系。</p>
                        <div v-for="item in neighbors" :key="edgeKey(item)" class="sd-branch">
                            <button @click="openEdge(item)">{{ item.from === selected ? '→' : '←' }} {{ EDGE_TYPES[item.type].label }}</button>
                            <button class="sd-node" @click="selected = item.from === selected ? item.to : item.from; edge = null; merge = false">{{ title(item.from === selected ? item.to : item.from) }}</button>
                        </div>
                    </div>
                </div>
                <div class="sd-actions" v-if="selected"><button @click="openEdge()">新建关系</button><button @click="merge = !merge; mergeSource = ''; mergeContent = byId.get(selected)?.content || ''">合并事实</button></div>
                <div v-if="merge" class="sd-subcard sd-stack">
                    <label class="sd-field">合并到 {{ title(selected) }}<select v-model="mergeSource"><option value="">选择来源事实</option><option v-for="item in active.filter(item => !item.locked && item.id !== selected)" :key="item.id" :value="item.id">{{ item.title }}</option></select></label>
                    <p v-if="mergeSource">{{ byId.get(mergeSource)?.content }}</p>
                    <TextField v-model="mergeContent" label="合并后的正文" />
                    <button :disabled="!mergeSource" @click="applyMerge">确认合并</button>
                </div>
                <div v-if="edge" class="sd-subcard sd-stack">
                    <div class="sd-form-grid">
                        <label class="sd-field">起点<select v-model="edge.from"><option value="">请选择</option><option v-for="item in active" :key="item.id" :value="item.id">{{ item.title }}</option></select></label>
                        <label class="sd-field">终点<select v-model="edge.to"><option value="">请选择</option><option v-for="item in active" :key="item.id" :value="item.id">{{ item.title }}</option></select></label>
                    </div>
                    <label class="sd-field">类型<select v-model="edge.type"><option v-for="(item, type) in EDGE_TYPES" :key="type" :value="type">{{ item.label }}</option></select></label>
                    <p>{{ EDGE_TYPES[edge.type].meaning }}</p>
                    <TextField v-model="edge.reason" label="关系依据" :rows="3" />
                    <div class="sd-actions"><button @click="[edge.from, edge.to] = [edge.to, edge.from]">交换方向</button><button v-if="originalKey" class="sd-danger" @click="removeEdge">删除关系</button><button @click="edge = null">关闭</button><button class="sd-primary" @click="storeEdge">保存关系</button></div>
                </div>
            </section>
            <section class="sd-card sd-stack">
                <h3>整理图谱</h3>
                <p v-if="view.graphProgress" role="status">{{ view.graphProgress }}</p>
                <div class="sd-actions">
                    <button v-if="view.busy.includes('graph')" @click="host.cancel('graph')">取消整理</button>
                    <template v-else-if="view.channels.some(channel => channel.id === state.settings.bindings.graph)">
                        <button @click="run(() => host.organize('full'))">全量整理</button><button @click="run(() => host.organize('incremental'))">增量整理</button>
                    </template>
                    <button v-else @click="select('settings')">配置图谱渠道</button>
                </div>
                <div v-if="state.graphPreview" class="sd-stack">
                    <p>{{ state.graphPreview.mode === 'full' ? '批准后以勾选的关系替换现有图谱。' : '批准后增加勾选的关系。' }}</p>
                    <article v-for="item in approved" :key="edgeKey(item)" class="sd-subcard sd-stack">
                        <label><input type="checkbox" v-model="item.accepted"> {{ title(item.from) }} → {{ EDGE_TYPES[item.type].label }} → {{ title(item.to) }}</label>
                        <p>{{ byId.get(item.from)?.content }}<br>{{ byId.get(item.to)?.content }}</p>
                        <TextField v-model="item.reason" label="依据" :rows="2" />
                    </article>
                    <div class="sd-actions"><button @click="run(() => host.mutate(next => { next.graphPreview = null }))">取消预览</button><button class="sd-primary" @click="run(() => host.applyGraph(JSON.parse(JSON.stringify(approved))))">应用获批关系</button></div>
                </div>
            </section>
        </template>
    </template>
</template>
