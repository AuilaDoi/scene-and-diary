<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { diary, fact, saveFact, clean } from '../../state-v8.js';
import { useWorkspace } from '../workspace';
import SearchField from '../SearchField.vue';
import TextField from '../TextField.vue';
import SaveAction from '../SaveAction.vue';

const props = defineProps<{ kind: 'diaries' | 'memory' }>();
const { view, host, run } = useWorkspace();
const journal = computed(() => props.kind === 'diaries');
const label = computed(() => journal.value ? '日记' : '记忆点');
const query = ref(''), draft = ref(null), creating = ref(false), saving = ref(false);
let opener: HTMLElement;
let original = '';
const rows = computed(() => {
    const state = view.value.state;
    if (!state) return [];
    const items = journal.value ? [...state.diaries].sort((a,b) => b.createdAt - a.createdAt) : state.memories;
    const needle = query.value.trim().toLowerCase();
    return items.filter(item => item.id === draft.value?.id || [item.title, item.body, item.content, item.storyTime].join('\n').toLowerCase().includes(needle));
});
const cards = computed(() => creating.value ? [draft.value, ...rows.value.filter(row => row.id !== draft.value.id)] : rows.value);
function edit(item, event) {
    opener = event.currentTarget;
    creating.value = !item;
    original = item ? JSON.stringify(item) : '';
    draft.value = item ? { ...item } : journal.value ? diary({ title: '新日记' }) : fact();
}
function close() {
    draft.value = null; creating.value = false;
    nextTick(() => opener?.focus({ preventScroll: true }));
}
async function save() {
    const activeDraft = draft.value;
    const value = { ...activeDraft };
    if (!clean(journal.value ? value.body : value.content)) throw new Error('请填写正文。');
    saving.value = true;
    try {
        await host.mutate(state => {
            const list = journal.value ? state.diaries : state.memories;
            const i = list.findIndex(item => item.id === value.id);
            if (!creating.value && i < 0) throw new Error('条目已删除。');
            if (i >= 0 && JSON.stringify(list[i]) !== original) throw new Error('条目已变化，请重新打开核对。');
            if (journal.value) {
                const item = diary({ ...value, needsReview: false, updatedAt: Date.now() });
                if (i < 0) state.diaries.push(item); else state.diaries[i] = item;
                state.characterGrowth.reviewRecommended = true;
            } else saveFact(state, value, i >= 0 ? value.id : null);
            original = JSON.stringify(list.find(item => item.id === value.id));
        });
        if (draft.value === activeDraft) close();
    } finally {
        saving.value = false;
    }
}
async function toggleLock() {
    const id = draft.value.id;
    await host.mutate(state => {
        const item = state.memories.find(x => x.id === id);
        if (!item || JSON.stringify(item) !== original) throw new Error('条目已变化，请重新打开核对。');
        item.locked = !item.locked;
        original = JSON.stringify(item);
    });
    draft.value.locked = view.value.state.memories.find(x => x.id === id).locked;
}
function remove() {
    if (!window.confirm('删除此' + label.value + '？')) return;
    return run(async () => {
        const id = draft.value.id;
        await host.mutate(state => {
            if (journal.value) { state.diaries = state.diaries.filter(item => item.id !== id); state.characterGrowth.reviewRecommended = true; }
            else {
                if (state.memories.find(item => item.id === id)?.locked) throw new Error('请先解锁。');
                state.memories = state.memories.filter(item => item.id !== id); state.memoryRevision++;
            }
        });
        close();
    });
}
</script>
<template>
    <p v-if="!view.state" class="sd-card">{{ view.blocker }}</p>
    <template v-else>
        <section class="sd-card sd-stack">
            <SearchField v-model="query" :label="'搜索' + label" />
            <div><button :disabled="saving" @click="edit(null, $event)">新建{{ label }}</button></div>
        </section>
        <article v-for="item in cards" :key="item.id" class="sd-card sd-stack">
            <template v-if="draft?.id === item.id">
                <h3>编辑{{ label }}</h3>
                <fieldset class="sd-stack" :disabled="draft.locked || saving">
                    <label class="sd-field">标题<input v-model="draft.title"></label>
                    <TextField v-if="journal" v-model="draft.body" label="日记正文" :rows="12" />
                    <template v-else>
                        <TextField v-model="draft.content" label="内容" />
                        <label class="sd-field">故事时间<input v-model="draft.storyTime"></label>
                        <label class="sd-field">重要度<input type="number" v-model.number="draft.importance" min="1" max="5"></label>
                        <label><input type="checkbox" v-model="draft.permanent"> 常驻</label>
                    </template>
                </fieldset>
                <div class="sd-actions sd-sticky">
                    <button v-if="!creating && !journal" :disabled="saving" @click="run(toggleLock)">{{ draft.locked ? '解锁' : '锁定' }}</button>
                    <button v-if="!creating && !draft.locked" class="sd-danger" :disabled="saving" @click="remove">删除</button>
                    <SaveAction :action="save" :label="'保存' + label" :disabled="draft.locked" />
                </div>
            </template>
            <template v-else>
                <h3>{{ item.title }}</h3>
                <p v-if="journal">{{ new Date(item.createdAt).toLocaleDateString() }} {{ item.needsReview ? '· 待复核' : '' }}</p>
                <p v-else>重要度 {{ item.importance }} {{ item.storyTime }} {{ item.permanent ? '· 常驻' : '' }} {{ item.locked ? '· 已锁定' : '' }}</p>
                <p class="sd-snippet">{{ journal ? item.body : item.content }}</p>
            </template>
            <div v-show="draft?.id !== item.id"><button :disabled="saving" @click="edit(item, $event)">查看与编辑</button></div>
        </article>
        <p v-if="!cards.length" class="sd-card">没有符合条件的{{ label }}。</p>
    </template>
</template>
