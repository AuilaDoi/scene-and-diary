<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TextField from '../TextField.vue';
import { writeGrowth } from '../../state-v7.js';
import { useWorkspace } from '../workspace';

const { view, host, run, select } = useWorkspace();
const profile = computed(() => view.value.state?.characterGrowth);
const current = ref('');
const candidate = ref('');
watch(() => profile.value?.revision, () => current.value = profile.value?.content || '', { immediate: true });
watch(() => view.value.growthPreview, value => candidate.value = value?.content || '', { immediate: true });
</script>
<template>
    <p v-if="!profile" class="sd-card">{{ view.blocker }}</p>
    <template v-else>
        <section class="sd-card sd-stack">
            <header class="sd-section-title"><h3>当前角色画像</h3></header>
            <p v-if="profile.reviewRecommended" class="sd-status">历史材料有变更，可核对现画像或发起重整。</p>
            <TextField v-model="current" label="人格、关系与当前状态" :rows="12" />
            <div class="sd-sticky sd-actions"><button class="sd-primary" @click="run(() => host.mutate(next => writeGrowth(next, current)))">保存画像</button></div>
        </section>
        <section class="sd-card sd-stack">
            <header class="sd-section-title"><h3>全局成长重整</h3></header>
            <p v-if="view.growthProgress" role="status">{{ view.growthProgress }}</p>
            <div v-if="view.growthPreview" class="sd-compare">
                <label class="sd-field">现画像<textarea :value="profile.content" rows="10" readonly /></label>
                <TextField v-model="candidate" label="重整后画像" :rows="10" />
            </div>
            <div class="sd-actions">
                <button v-if="view.busy.includes('growth')" @click="host.cancel('growth')">取消重整</button>
                <template v-else-if="view.growthPreview">
                    <button @click="host.discardGrowth">保留现稿</button><button class="sd-primary" @click="run(() => host.acceptGrowth(candidate))">应用候选画像</button>
                </template>
                <button v-else-if="view.channels.some(channel => channel.id === view.state?.settings.bindings.growth)" @click="run(host.generateGrowth)">根据全部有效日记重整</button>
                <button v-else @click="select('settings')">配置成长渠道</button>
            </div>
        </section>
    </template>
</template>
