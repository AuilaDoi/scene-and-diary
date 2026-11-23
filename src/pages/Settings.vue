<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { blankChannel, fetchModels, saveChannels, testChannel, validatedChannel } from '../../channels.js';
import { settingsV8, TASKS } from '../../state-v8.js';
import { currentAct, validateTagPair } from '../../core.js';
import { dialogueMaterial, modulesFor, taskModules } from '../../tasks-v8.js';
import { validateSemanticEndpoint } from '../../semantic.js';
import SaveAction from '../SaveAction.vue';
import TextField from '../TextField.vue';
import { useWorkspace } from '../workspace';

const { view, host, run, notice, select } = useWorkspace();
const settings = ref(null), draft = ref(null), modelList = ref<string[]>([]);
const task = ref('diary'), mode = ref('recent'), previewOpen = ref(false), materialOpen = ref(false);
const dialogue = ref(null), dialogueError = ref('');
const dialogueSource = computed(() => {
    const act = currentAct(view.value.state);
    return act ? JSON.stringify([act.id, act.messageIds, view.value.dialogueRevision]) : '';
});
const wantsDialogue = computed(() => previewOpen.value && materialOpen.value && task.value !== 'growth');
const modelOpen = ref(false), search = ref(''), modelStatus = ref('');
const visibleModels = computed(() => modelList.value.filter(model => model.toLowerCase().includes(search.value.toLowerCase())));
watch([wantsDialogue, dialogueSource], async ([enabled, source], _old, onCleanup) => {
    if (!enabled || !source || dialogue.value?.source === source) return;
    let current = true;
    onCleanup(() => { current = false; });
    dialogueError.value = '';
    try {
        const messages = await host.readPreviewDialogue();
        if (current) dialogue.value = { source, messages };
    } catch (error) {
        if (current) dialogueError.value = error.message;
    }
});
const preview = computed(() => {
    const state = view.value.state;
    if (!state || !settings.value || !previewOpen.value) return null;
    const character = host.previewCharacter(task.value);
    return task.value === 'growth'
        ? modulesFor('growth', { ...state, settings: settings.value }, character, [], mode.value)
        : taskModules(task.value, settings.value, character, state.characterGrowth.content, '');
});
const materialPreview = computed(() => {
    if (!previewOpen.value || !materialOpen.value) return '';
    if (task.value === 'growth') return preview.value?.material;
    if (!dialogueSource.value) return '';
    if (dialogueError.value) return dialogueError.value;
    if (dialogue.value?.source !== dialogueSource.value) return '正在读取本幕对话…';
    try {
        return dialogueMaterial(dialogue.value.messages, draftExtraction(), host.previewCharacter(task.value));
    } catch (error) {
        return error.message;
    }
});
const settingsForm = ref<HTMLFormElement>();
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
    const stored = JSON.parse(source);
    settings.value = stored && settingsV8(stored);
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
    draft.value = { ...channel }; modelList.value = []; modelOpen.value = false; modelStatus.value = ''; search.value = '';
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
        modelStatus.value = ''; modelOpen.value = false;
        if (kind === 'models') {
            modelList.value = await fetchModels(context(), channel, controller.signal);
            search.value = ''; modelOpen.value = modelList.value.length > 0;
            modelStatus.value = modelOpen.value ? '返回 ' + modelList.value.length + ' 个模型。' : '渠道未提供模型，可手动填写。';
        } else {
            const result = await testChannel(context(), channel, controller.signal);
            if (result.ok !== true) throw new Error('渠道返回了意外的测试结果。');
            modelStatus.value = '渠道测试通过。';
        }
    } catch (error) { modelStatus.value = controller.signal.aborted ? '请求已取消。' : error.message; }
    finally { request = null; working.value = false; }
}
function tagPairs(text) {
    return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
        const [open, close] = line.split(/\s+/);
        const pair = validateTagPair({ open, close });
        if (!pair) throw new Error('标签对无效。每行填写一对同名开始和结束标签。');
        return pair;
    });
}
function draftExtraction() {
    return Object.fromEntries(['user', 'character'].map(role => [role, {
        requiredStoryTime: settings.value.extraction[role].requiredStoryTime,
        bodyTagPairs: tagPairs(tags.value[role].bodyTagPairs),
        storyTimeTagPairs: tagPairs(tags.value[role].storyTimeTagPairs),
    }]));
}
async function saveSettings() {
    if (!settingsForm.value?.reportValidity()) throw new Error('请检查设置中的数值。');
    const value = JSON.parse(JSON.stringify(settings.value));
    value.extraction = draftExtraction();
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
        next.settings = settingsV8({ ...value, bindings: validBindings });
        if (Object.keys(TASKS).every(task => next.settings.bindings[task])) next.connectionSetupNeeded = false;
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
                <label class="sd-field">模型<input v-model="draft.model" required></label>
                <label class="sd-field">温度<input v-model.number="draft.temperature" type="number" min="0" max="2" step="0.05" required></label>
                <label class="sd-field">最大输出 token<input v-model.number="draft.maxTokens" type="number" min="1" step="1" required></label>
            </div>
            <p v-if="modelStatus" role="status">{{ modelStatus }}</p>
            <section v-if="modelOpen" class="sd-subcard sd-stack">
                <label class="sd-field">搜索模型<input v-model="search" type="search"></label>
                <div class="sd-model-list"><button type="button" v-for="model in visibleModels" :key="model" :aria-pressed="model === draft.model"
                    @click="draft.model = model; modelOpen = false; modelStatus = '已选择 ' + model">{{ model }} {{ model === draft.model ? '✓' : '' }}</button></div>
                <p v-if="!visibleModels.length">没有匹配的模型。</p><button type="button" @click="modelOpen = false">收起列表</button>
            </section>
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
    <form v-else ref="settingsForm" class="sd-stack" @submit.prevent>
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
                    <label class="sd-field">近期日记篇数<input v-model.number="settings.recentDiaryCount" type="number" min="0" required></label>
                    <label class="sd-field">成长追踪日记篇数<input v-model.number="settings.growthDiaryCount" type="number" min="0" required></label>
                    <label class="sd-field">查询深度 d<input v-model.number="settings.queryDepth" type="number" min="0" required></label>
                    <label class="sd-field">初检数量 q<input v-model.number="settings.retrievalCount" type="number" min="0" required></label>
                    <label class="sd-field">精排候选数 r<input v-model.number="settings.candidateCount" type="number" min="0" required></label>
                    <label class="sd-field">召回分数门槛<input v-model.number="settings.recallScoreThreshold" type="number" min="0" max="1" step=".01" required></label>


                </div>

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
        <details class="sd-card" @toggle="previewOpen = ($event.target as HTMLDetailsElement).open">
            <summary>任务提示词</summary>
            <div class="sd-stack">
                <nav class="sd-segments"><button type="button" v-for="(label, key) in TASKS" :key="key" :aria-pressed="task === key" @click="task = key">{{ label }}</button></nav>
                <label v-if="task === 'growth'" class="sd-field">成长模式
                    <select v-model="mode"><option value="recent">追踪最新动态</option><option value="global">全局重建</option></select>
                </label>
                <TextField v-model="settings.prompts[task].system" label="系统提示词" />
                <details><summary>背景参考</summary><p class="sd-prose">{{ preview?.background || '暂无背景' }}</p></details>
                <TextField v-if="task === 'growth' && mode === 'global'" v-model="settings.prompts.growth.globalDescription" label="任务描述" />
                <TextField v-else v-model="settings.prompts[task].description" label="任务描述" />
                <details @toggle="materialOpen = ($event.target as HTMLDetailsElement).open"><summary>内容素材</summary>
                    <p class="sd-prose">{{ materialPreview || '暂无素材' }}</p>
                </details>
                <details><summary>格式规定</summary><p class="sd-prose">{{ preview?.format }}</p></details>
            </div>
        </details>
        <div class="sd-actions sd-sticky"><button type="button" @click="select('diagnostics')">查看诊断</button><SaveAction :action="saveSettings" label="保存聊天设置" success="聊天设置已保存" /></div>
    </form>
</template>
