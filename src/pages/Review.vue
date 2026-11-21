<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { CATEGORIES, TASKS } from '../../state-v7.js';
import TextField from '../TextField.vue';
import { useWorkspace } from '../workspace';

const props = defineProps<{ kind: string; part: any; transaction: any }>();
const { view, host, run, select } = useWorkspace();
const value = ref<any>();
const blank = () => props.kind === 'diary' ? { title: '', body: '', summary: '' } : props.kind === 'growth' ? { changed: true, content: '' } : [];
watch(() => JSON.stringify(props.part.value), () => {
    value.value = props.part.value ? JSON.parse(JSON.stringify(props.part.value)) : blank();
}, { immediate: true });
const labels = { idle: '待生成', running: '生成中', error: '可重试', draft: '待确认', confirmed: '已确认', skipped: '已跳过', outdated: '需重新评估' };
const actions = { new: '新增', duplicate: '重复', supplement: '补充', update: '状态变化' };
const enabled = computed(() => props.kind !== 'growth' || props.transaction.results.diary.status === 'confirmed');
const running = computed(() => view.value.busy.includes('close:' + props.kind));
const hasChannel = computed(() => view.value.channels.some(channel => channel.id === view.value.state?.settings.bindings[props.kind]));
const oldFact = id => view.value.state?.memories.find(item => item.id === id);
function review(skip = false, confirm = true) {
    return run(() => host.reviewPart(props.kind, JSON.parse(JSON.stringify(value.value)), skip, confirm));
}
</script>

<template>
    <article class="sd-card sd-stack">
        <header class="sd-section-title"><h3>{{ TASKS[kind] }}</h3><span class="sd-pill">{{ labels[part.status] }}</span></header>
        <p v-if="part.error" class="sd-alert">{{ part.error }}</p>
        <p v-if="kind === 'growth' && !enabled && part.status !== 'skipped'">确认日记后开始成长评估。</p>
        <p v-if="kind === 'growth' && part.status === 'outdated'">日记内容已变更。可参考旧草稿，重新评估或修订后确认。</p>
        <template v-if="enabled && !running">
            <template v-if="kind === 'diary'">
                <label class="sd-field">标题<input v-model="value.title"></label>
                <TextField v-model="value.body" label="第一人称正文" :rows="9" />
                <TextField v-model="value.summary" label="单篇摘要" :rows="4" />
            </template>
            <template v-else-if="kind === 'growth'">
                <label><input type="checkbox" v-model="value.changed"> 本幕有实质变化</label>
                <div v-if="value.changed" class="sd-compare">
                    <label class="sd-field">当前画像<textarea :value="view.state?.characterGrowth.content" readonly rows="8" /></label>
                    <TextField v-model="value.content" label="候选画像" :rows="8" />
                </div>
            </template>
            <template v-else>
                <p v-if="part.value && !value.length">本幕没有合格事实。</p>
                <details class="sd-subcard" v-for="proposal in value" :key="proposal.id" open>
                    <summary>{{ actions[proposal.action] }} · {{ proposal.value.title }}</summary>
                    <div class="sd-stack">
                        <p v-if="oldFact(proposal.targetId)"><strong>已有事实</strong><br>{{ oldFact(proposal.targetId).content }}</p>
                        <label v-if="proposal.action !== 'duplicate'"><input type="checkbox" v-model="proposal.accepted" :disabled="oldFact(proposal.targetId)?.locked"> 接受这条建议<span v-if="oldFact(proposal.targetId)?.locked">（目标已锁定）</span></label>
                        <label class="sd-field">类别<select v-model="proposal.value.category"><option disabled value="">请选择</option><option v-for="(label, key) in CATEGORIES" :key="key" :value="key">{{ label }}</option></select></label>
                        <label class="sd-field">标题<input v-model="proposal.value.title"></label>
                        <TextField v-model="proposal.value.content" label="拟保存内容" :rows="3" />
                        <div class="sd-form-grid">
                            <label class="sd-field">故事时间<input v-model="proposal.value.storyTime"></label>
                            <label class="sd-field">重要度<input type="number" v-model.number="proposal.value.importance" min="1" max="5"></label>
                        </div>
                    </div>
                </details>
            </template>
        </template>
        <div v-if="running" class="sd-actions"><button @click="host.cancel('close:' + kind)">取消本项请求</button></div>
        <div v-else-if="enabled" class="sd-actions">
            <button v-if="hasChannel" @click="run(() => host.runClose(kind))">{{ part.status === 'idle' ? '生成' : '重新生成' }}</button>
            <button v-else @click="select('settings')">配置渠道</button>
            <button v-if="kind !== 'memory' || part.value" @click="review(false, false)">保存草稿</button>
            <button v-if="kind !== 'memory' || part.value" class="sd-primary" @click="review()">确认{{ TASKS[kind] }}</button>
            <button @click="review(true)">{{ kind === 'diary' ? '跳过日记和成长评估' : '跳过本项' }}</button>
        </div>
    </article>
</template>
