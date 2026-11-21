<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { blankChannel, fetchModels, saveChannels, testChannel, validatedChannel } from '../../channels.js';
import { settingsV7, TASKS } from '../../state-v7.js';
import { validateTagPair } from '../../core.js';
import { validateSemanticEndpoint } from '../../semantic.js';
import TextField from '../TextField.vue';
import { useWorkspace } from '../workspace';

const { view, host, run, notice, select } = useWorkspace();
const settings = ref(null), draft = ref(null), modelList = ref<string[]>([]);
const working = ref(false);
let request: AbortController | null = null;
onBeforeUnmount(() => request?.abort());
const context = host.getContext;
const keyStore = () => context().accountStorage;
const embedKey = ref(keyStore()?.getItem('scene_diary_embedding_key') || '');
const rerankKey = ref(keyStore()?.getItem('scene_diary_rerank_key') || '');
const initial = computed(() => JSON.stringify(view.value.state?.settings || null));
const tags = ref({});
watch(initial, source => {
    settings.value = JSON.parse(source);
    if (!settings.value) return;
    const out = {};
    for (const role of ['user', 'character']) {
        out[role] = {};
        for (const field of ['bodyTagPairs', 'storyTimeTagPairs']) {
            out[role][field] = settings.value.extraction[role][field].map(pair => pair.open + ' ' + pair.close).join('\n');
        }
    }
    tags.value = out;
}, { immediate: true });

function edit(channel = blankChannel()) {
    draft.value = { ...channel }; modelList.value = [];
}
function saveChannel() {
    return run(() => {
        const valid = validatedChannel(draft.value);
        saveChannels(context(), [...view.value.channels.filter(item => item.id !== valid.id), valid]);
        host.refresh(); draft.value = null; notice.value = '渠道已提交保存。';
    });
}
function removeChannel() {
    if (!draft.value || !window.confirm('删除该渠道？已绑定的任务需要重新选择。')) return;
    return run(() => {
        saveChannels(context(), view.value.channels.filter(item => item.id !== draft.value.id)); host.refresh(); draft.value = null;
    });
}
async function channelRequest(kind: 'models' | 'test') {
    const controller = request = new AbortController();
    working.value = true;
    const channel = { ...draft.value };
    try {
        await run(async () => {
            if (kind === 'models') {
                modelList.value = await fetchModels(context(), channel, controller.signal);
                notice.value = '返回 ' + modelList.value.length + ' 个模型。';
            } else {
                const result = await testChannel(context(), channel, controller.signal);
                if (result.ok !== true) throw new Error('渠道返回了意外的测试结果。');
                notice.value = '结构化渠道测试通过。';
            }
        });
    } finally { request = null; working.value = false; }
}
function tagPairs(text) {
    return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
        const [open, close] = line.split(/\s+/);
        const pair = validateTagPair({ open, close });
        if (!pair) throw new Error('标签对无效。每行填写一对同名开始和结束标签。');
        return pair;
    });
}
function saveSettings() {
    return run(async () => {
        const value = JSON.parse(JSON.stringify(settings.value));
        for (const role of ['user', 'character']) for (const field of ['bodyTagPairs', 'storyTimeTagPairs']) {
            value.extraction[role][field] = tagPairs(tags.value[role][field]);
        }
        if (value.semantic.enabled) {
            value.semantic.endpoint = validateSemanticEndpoint(value.semantic.endpoint);
            if (!value.semantic.model.trim()) throw new Error('请填写 Embedding 模型。');
        }
        if (value.semantic.rerank) {
            value.semantic.rerankEndpoint = validateSemanticEndpoint(value.semantic.rerankEndpoint, '重排');
            if (!value.semantic.rerankModel.trim()) throw new Error('请填写重排模型。');
        }
        const validBindings = Object.fromEntries(Object.entries(value.bindings).filter(([, id]) => view.value.channels.some(item => item.id === id)));
        const prefs = keyStore();
        for (const [key, secret] of [['scene_diary_embedding_key', embedKey.value], ['scene_diary_rerank_key', rerankKey.value]]) {
            if (secret.trim()) prefs?.setItem(key, secret.trim());
            else prefs?.removeItem(key);
        }
        await host.mutate(next => {
            next.settings = settingsV7({ ...value, bindings: validBindings });
            if (Object.keys(TASKS).every(task => next.settings.bindings[task])) next.connectionSetupNeeded = false;
        });
    });
}
</script>

<template>
    <section class="sd-card sd-stack">
        <header class="sd-section-title"><h3>API 渠道</h3><button class="sd-primary" :disabled="working" @click="edit()">新增渠道</button></header>
        <p>渠道在当前酒馆账户内共用，任务分派按聊天保存。</p>
        <div class="sd-listrow" v-for="channel in view.channels" :key="channel.id"><div><strong>{{ channel.name }}</strong><p>{{ channel.model }}</p></div><button :disabled="working" @click="edit(channel)">编辑</button></div>
        <form v-if="draft" class="sd-subcard sd-stack" @submit.prevent="saveChannel">
            <div class="sd-form-grid">
                <label class="sd-field">名称<input v-model="draft.name" autocomplete="off" required></label>
                <label class="sd-field">OpenAI 兼容 API 地址<input v-model.trim="draft.url" type="url" placeholder="https://example.com/v1" required></label>
                <label class="sd-field">API Key<input v-model="draft.key" type="password" autocomplete="new-password"></label>
                <label class="sd-field">模型<input v-model="draft.model" list="sd-channel-models" required><datalist id="sd-channel-models"><option v-for="model in modelList" :key="model" :value="model" /></datalist></label>
                <label class="sd-field">温度<input v-model.number="draft.temperature" type="number" min="0" max="2" step="0.05" required></label>
                <label class="sd-field">最大输出 token<input v-model.number="draft.maxTokens" type="number" min="1" step="1" required></label>
            </div>
            <div class="sd-actions">
                <button v-if="working" type="button" @click="request?.abort()">取消请求</button>
                <template v-else><button type="button" @click="channelRequest('models')">获取模型列表</button><button type="button" @click="channelRequest('test')">测试渠道</button></template>
                <button type="button" :disabled="working" @click="draft = null">关闭</button>
                <button v-if="view.channels.some(channel => channel.id === draft.id)" type="button" class="sd-danger" :disabled="working" @click="removeChannel">删除</button>
                <button class="sd-primary" :disabled="working">保存渠道</button>
            </div>
        </form>
    </section>
    <p v-if="!settings" class="sd-card">{{ view.blocker }}</p>
    <form v-else class="sd-stack" @submit.prevent="saveSettings">
        <section class="sd-card sd-stack">
            <h3>任务分派</h3>
            <div class="sd-form-grid">
                <label v-for="(label, task) in TASKS" :key="task" class="sd-field">{{ label }}
                    <select v-model="settings.bindings[task]"><option :value="undefined">请选择渠道</option><option v-for="channel in view.channels" :key="channel.id" :value="channel.id">{{ channel.name }}</option></select>
                </label>
            </div>
        </section>
        <details class="sd-card" open>
            <summary>上下文与召回</summary>
            <div class="sd-stack">
                <label><input type="checkbox" v-model="settings.growthEnabled"> 注入当前画像</label>
                <div class="sd-form-grid">
                    <label class="sd-field">近期日记篇数<input v-model.number="settings.recentDiaryCount" type="number" min="0" max="20" required></label>
                    <label class="sd-field">近期日记额度（留空不限）<input v-model.number="settings.recentDiaryBudget" type="number" min="0"></label>
                    <label class="sd-field">历史摘要额度<input v-model.number="settings.historyBudget" type="number" min="0" required></label>
                    <label class="sd-field">长期事实额度<input v-model.number="settings.memoryTokenBudget" type="number" min="0" required></label>
                    <label class="sd-field">用于查询的近邻消息数<input v-model.number="settings.recallMessageCount" type="number" min="1" max="20" required></label>
                    <label class="sd-field">事实条数上限<input v-model.number="settings.recallLimit" type="number" min="0" max="30" required></label>
                    <label class="sd-field">召回分数门槛<input v-model.number="settings.recallScoreThreshold" type="number" min="0" max="1" step=".01" required></label>
                    <label class="sd-field">图谱候选数量<input v-model.number="settings.maintenanceCandidateLimit" type="number" min="1" max="60" required></label>
                    <label class="sd-field">整理分数门槛<input v-model.number="settings.maintenanceScoreThreshold" type="number" min="0" max="1" step=".01" required></label>
                </div>
                <p>额度采用估算 token。单篇或单条超出可用额度时会跳过，可在诊断中查看。</p>
            </div>
        </details>
        <details class="sd-card">
            <summary>Embedding 与重排</summary>
            <div class="sd-stack">
                <label><input type="checkbox" v-model="settings.semantic.enabled"> 使用向量检索</label>
                <div class="sd-form-grid">
                    <label class="sd-field">Embedding 完整地址<input v-model.trim="settings.semantic.endpoint" type="url" placeholder="https://example.com/v1/embeddings"></label>
                    <label class="sd-field">Embedding 模型<input v-model.trim="settings.semantic.model"></label>
                    <label class="sd-field">Embedding 密钥<input v-model="embedKey" type="password" autocomplete="new-password"></label>
                    <label class="sd-field">向量维度（可选）<input v-model.number="settings.semantic.dimensions" type="number" min="1"></label>
                </div>
                <label><input type="checkbox" v-model="settings.semantic.rerank"> 使用 rerank 重排</label>
                <div class="sd-form-grid">
                    <label class="sd-field">Rerank 完整地址<input v-model.trim="settings.semantic.rerankEndpoint" type="url" placeholder="https://example.com/v1/rerank"></label>
                    <label class="sd-field">Rerank 模型<input v-model.trim="settings.semantic.rerankModel"></label>
                    <label class="sd-field">Rerank 密钥<input v-model="rerankKey" type="password" autocomplete="new-password"></label>
                </div>
            </div>
        </details>
        <details class="sd-card">
            <summary>正文和故事时间标签</summary>
            <div class="sd-stack">
                <p>每行填写一对开始和结束标签，中间用空格分隔。正文标签留空时使用完整消息。</p>
                <div v-for="role in ['user', 'character']" :key="role" class="sd-stack">
                    <h3>{{ role === 'user' ? '玩家' : '角色' }}</h3>
                    <TextField v-model="tags[role].bodyTagPairs" label="正文标签" :rows="2" />
                    <TextField v-model="tags[role].storyTimeTagPairs" label="故事时间标签" :rows="2" />
                    <label><input type="checkbox" v-model="settings.extraction[role].requiredStoryTime"> 故事时间必填</label>
                </div>
            </div>
        </details>
        <details class="sd-card">
            <summary>任务提示词</summary>
            <div class="sd-stack">
                <label class="sd-field">日记目标长度<input v-model="settings.diaryTargetLength"></label>
                <TextField v-for="(label, task) in { diary: '日记', growth: '角色成长', memory: '事实提取', maintenance: '图谱整理' }" :key="task" v-model="settings.prompts[task]" :label="label" :rows="3" />
            </div>
        </details>
        <div class="sd-actions sd-sticky"><button type="button" @click="select('diagnostics')">查看诊断</button><button class="sd-primary">保存聊天设置</button></div>
    </form>
</template>
