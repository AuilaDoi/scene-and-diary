<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { TASKS } from '../../state-v8.js';
import TextField from '../TextField.vue';
import RawResponse from '../RawResponse.vue';
import { useWorkspace } from '../workspace';

const props = defineProps<{ kind: string; part: any; transaction: any }>();
const { view, host, run, select } = useWorkspace();
const value = ref<any>();
const blank = () => props.kind === 'diary' ? { title: '', body: '' } : [];
watch(() => JSON.stringify(props.part.value), () => {
    value.value = props.part.value ? JSON.parse(JSON.stringify(props.part.value)) : blank();
}, { immediate: true });
const labels = { idle: '待生成', running: '生成中', error: '可重试', draft: '待确认', confirmed: '已确认', skipped: '已跳过', outdated: '需重新评估' };
const running = computed(() => view.value.busy.includes('close:' + props.kind));
const hasChannel = computed(() => view.value.channels.some(channel => channel.id === view.value.state?.settings.bindings[props.kind]));
function review(skip = false, confirm = true) {
    return run(() => host.reviewPart(props.kind, JSON.parse(JSON.stringify(value.value)), skip, confirm));
}
</script>

<template>
    <article class="sd-card sd-stack">
        <header class="sd-section-title"><h3>{{ TASKS[kind] }}</h3><span class="sd-pill">{{ labels[part.status] }}</span></header>
        <p v-if="part.error" class="sd-alert">{{ part.error }}</p>
        <RawResponse v-if="part.status === 'error'" :content="view.closeRawResponses[kind]" />
        <template v-if="!running">
            <template v-if="kind === 'diary'">
                <label class="sd-field">标题<input v-model="value.title"></label>
                <TextField v-model="value.body" label="第一人称正文" :rows="9" />
            </template>
            <template v-else>
                <p v-if="part.value && !value.length">本幕没有合格事实。</p>
                <details class="sd-subcard" v-for="proposal in value" :key="proposal.id" open>
                    <summary>新增 · {{ proposal.value.title }}</summary>
                    <div class="sd-stack">
                        <label><input type="checkbox" v-model="proposal.accepted"> 保存此记忆点</label>
                        <label><input type="checkbox" v-model="proposal.value.permanent"> 常驻记忆</label>
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
        <div v-else class="sd-actions">
            <button v-if="hasChannel" @click="run(() => host.runClose(kind))">{{ part.status === 'idle' ? '生成' : '重新生成' }}</button>
            <button v-else @click="select('settings')">配置渠道</button>
            <button v-if="kind !== 'memory' || part.value" @click="review(false, false)">保存草稿</button>
            <button v-if="kind !== 'memory' || part.value" class="sd-primary" @click="review()">确认{{ TASKS[kind] }}</button>
            <button @click="review(true)">跳过本项</button>
        </div>
    </article>
</template>
