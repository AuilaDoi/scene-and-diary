<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import SaveAction from '../SaveAction.vue';
import TextField from '../TextField.vue';
import RawResponse from '../RawResponse.vue';
import { writeGrowth } from '../../state-v8.js';
import { useWorkspace } from '../workspace';

const { view, host, run, select } = useWorkspace();
const recent = computed(() => Math.min(validCount.value, view.value.state?.settings.growthDiaryCount ?? 0));
const validCount = computed(() => view.value.state?.diaries.filter(item => !item.needsReview && item.body.trim()).length ?? 0);
const profile = computed(() => view.value.state?.characterGrowth);
const current = ref('');
const candidate = ref('');
watch(() => profile.value?.revision, () => current.value = profile.value?.content || '', { immediate: true });
watch(() => view.value.growthPreview, value => candidate.value = value?.content || '', { immediate: true });
</script>
<template>
    <p v-if="!profile" class="sd-card">{{ view.blocker }}</p>
    <template v-else>
        <details v-if="view.state.legacyGrowthDraft" class="sd-card"><summary>升级前的成长待审稿</summary><p class="sd-prose">{{ view.state.legacyGrowthDraft }}</p></details>
        <section class="sd-card sd-stack">
            <header class="sd-section-title"><h3>当前角色画像</h3></header>
            <p v-if="profile.reviewRecommended" class="sd-status">历史材料有变更，可核对现画像或发起重整。</p>
            <TextField v-model="current" label="人格、关系与当前状态" :rows="12" />
            <div class="sd-sticky sd-actions"><SaveAction :action="() => host.mutate(next => writeGrowth(next, current))" label="保存画像" success="画像已保存" /></div>
        </section>
        <section class="sd-card sd-stack">
            <header class="sd-section-title"><h3>根据日记更新画像</h3></header>
            <p v-if="view.growthProgress" role="status">{{ view.growthProgress }}</p>
            <template v-if="view.growthFailure">
                <p class="sd-alert" role="alert">{{ view.growthFailure.message }}</p>
                <RawResponse :content="view.growthFailure.rawResponse" />
            </template>
            <div v-if="view.growthPreview?.changed" class="sd-compare">
                <label class="sd-field">现画像<textarea :value="profile.content" rows="10" readonly /></label>
                <TextField v-model="candidate" label="重整后画像" :rows="10" />
            </div>
            <p v-if="view.growthPreview">使用了 {{ view.growthPreview.count }} 篇日记。{{ view.growthPreview.changed ? '' : '没有实质变化。' }}</p>
            <div class="sd-actions">
                <button v-if="view.busy.includes('growth')" @click="host.cancel('growth')">取消重整</button>
                <template v-else-if="view.growthPreview">
                    <button @click="host.discardGrowth">保留现稿</button><button v-if="view.growthPreview.changed" class="sd-primary" @click="run(() => host.acceptGrowth(candidate))">应用候选画像</button>
                </template>
                <template v-else-if="view.channels.some(channel => channel.id === view.state?.settings.bindings.growth)"><button :disabled="!recent" @click="run(() => host.generateGrowth('recent'))">追踪最新动态（{{ recent }} 篇）</button><button :disabled="!validCount" @click="run(() => host.generateGrowth('global'))">全局重建（{{ validCount }} 篇）</button></template>
                <button v-else @click="select('settings')">配置成长渠道</button>
            </div>
        </section>
    </template>
</template>
