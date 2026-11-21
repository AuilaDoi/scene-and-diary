<script setup lang="ts">
import { useWorkspace } from '../workspace';
const { view, host } = useWorkspace();
</script>
<template>
    <section class="sd-card sd-stack">
        <header class="sd-section-title"><h3>运行诊断</h3><button @click="host.cancelRecall">取消当前召回</button></header>
        <p v-if="!view.trace.length">暂无任务或召回记录。</p>
        <template v-for="(row, index) in view.trace" :key="index">
            <details v-if="row.details?.length" class="sd-log">
                <summary>{{ row.stage }} · {{ row.title }} <small v-if="row.ms != null">{{ Math.round(row.ms) }} ms</small></summary>
                <ul><li v-for="(detail, n) in row.details" :key="n">{{ detail }}</li></ul>
            </details>
            <p v-else class="sd-log" :class="{ 'sd-alert': row.status === 'error' || row.status === 'warning' }">{{ row.stage }} · {{ row.title }} <small v-if="row.ms != null">{{ Math.round(row.ms) }} ms</small></p>
        </template>
    </section>
</template>
