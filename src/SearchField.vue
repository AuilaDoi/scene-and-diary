<script setup lang="ts">
defineProps<{ label: string }>();
const model = defineModel<string>();
</script>
<template><label class="sd-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input v-model="model" type="search" :aria-label="label" :placeholder="label"></label></template>
