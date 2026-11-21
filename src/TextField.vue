<script setup lang="ts">
defineProps<{ label: string; rows?: number; readonly?: boolean }>();
const model = defineModel<string>();
</script>
<template>
    <label class="sd-field"><span>{{ label }}</span><textarea v-model="model" :rows="rows || 6" :readonly="readonly" /></label>
</template>
