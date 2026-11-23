<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{ action: () => unknown; label: string; success?: string; disabled?: boolean }>();
const pending = ref(false), message = ref(''), failed = ref(false);
async function save() {
    if (pending.value) return;
    pending.value = true; failed.value = false; message.value = '';
    try { await props.action(); message.value = props.success || ''; }
    catch (error) { failed.value = true; message.value = error.message; }
    finally { pending.value = false; }
}
</script>
<template>
    <button type="button" class="sd-primary" :disabled="disabled || pending" @click="save">{{ pending ? '保存中…' : label }}</button>
    <span v-if="message" :role="failed ? 'alert' : 'status'">{{ message }}</span>
</template>
