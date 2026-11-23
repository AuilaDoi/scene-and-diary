<script setup lang="ts">
defineProps<{ content?: string }>();
</script>

<template>
    <section v-if="content !== undefined" class="sd-subcard sd-stack">
        <h4>大模型原始回复</h4>
        <pre v-if="content" class="sd-raw-response" tabindex="0">{{ content }}</pre>
        <p v-else>模型返回了空文本。</p>
    </section>
</template>
