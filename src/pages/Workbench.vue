<script setup lang="ts">
import { computed, ref } from 'vue';
import { currentAct } from '../../core.js';
import { PARTS, TASKS } from '../../state-v8.js';
import { download, useWorkspace } from '../workspace';
import Review from './Review.vue';

const { view, host, run, select } = useWorkspace();
const from = ref(1);
const state = computed(() => view.value.state);
const act = computed(() => currentAct(state.value));
const transaction = computed(() => state.value?.pendingTransaction);
const ready = computed(() => PARTS.every(kind => ['confirmed', 'skipped'].includes(transaction.value?.results[kind]?.status)));
const showReview = () => document.getElementById('sd-close-review')?.scrollIntoView({ block: 'start' });
const confirmAction = (message: string) => window.confirm(message);
const bound = (kind: string) => view.value.channels.some(channel => channel.id === state.value?.settings.bindings[kind]);
</script>

<template>
    <div v-if="!state" class="sd-card sd-stack">
        <p>{{ view.blocker }}</p>
        <form v-if="view.blocker.startsWith('已有聊天')" class="sd-actions" @submit.prevent="run(() => host.takeOver(from - 1))">
            <label>从楼层 <input v-model.number="from" type="number" min="1" :max="Math.max(view.messages, 1)" required></label><button class="sd-primary">接管聊天</button>
        </form>
        <button v-if="view.blocker.startsWith('迁移备份失败')" @click="run(host.initialize)">重试迁移</button>
    </div>
    <template v-else>
        <header class="sd-hero sd-card">
            <div>
                <p class="sd-kicker">第 {{ act?.id }} 幕</p>
                <h3>{{ transaction ? '本幕待审核' : state.status === 'pending_next_act' ? '本幕已归档' : '当前幕' }}</h3>
                <p>{{ act?.messageIds.length || 0 }} 条归幕对话<span v-if="act?.startMessageIndex != null"> · 起始楼层 {{ act.startMessageIndex + 1 }}</span><span v-if="act?.endMessageIndex != null"> · 结束楼层 {{ act.endMessageIndex + 1 }}</span></p>
                <p v-if="state.status === 'pending_next_act'">下一条玩家消息将开启新幕。</p>
            </div>
            <button v-if="!transaction && state.status === 'active'" class="sd-primary" :disabled="!act?.messageIds.length" @click="run(host.openClose)">结束这一幕</button>
            <button v-else-if="transaction" class="sd-primary" @click="showReview">继续审核</button>
            <button v-else @click="select('diaries')">查看日记档案</button>
        </header>
        <p v-if="state.connectionSetupNeeded && Object.keys(TASKS).some(kind => !bound(kind))" class="sd-status">
            旧版连接已停用。请为尚未绑定的日记、记忆提取和成长任务配置自建渠道。 <button @click="select('settings')">打开设置</button>
        </p>
        <section v-if="transaction" id="sd-close-review" class="sd-stack">
            <Review v-for="kind in PARTS" :key="transaction.id + kind" :kind="kind" :part="transaction.results[kind]" :transaction="transaction" />
            <div class="sd-sticky sd-actions">
                <button @click="run(() => confirmAction('取消这次关幕并清除本次审核草稿？') && host.cancelClose())">取消关幕</button>
                <button class="sd-primary" :disabled="!ready" @click="run(host.confirmClose)">确认结束本幕</button>
            </div>
        </section>
        <details class="sd-card">
            <summary>备份与恢复</summary>
            <div class="sd-actions">
                <button @click="run(() => download(host.backup(), 'scene-diary-' + view.chatId + '.json'))">导出内容</button>
                <label class="sd-file">导入内容 <input type="file" accept=".json,application/json" @change="event => run(async () => {
                    const input = event.target as HTMLInputElement;
                    const file = input.files?.[0]; input.value = '';
                    if (!file) return;
                    const backup = JSON.parse(await file.text());
                    const message = '确认替换当前聊天的日记、画像和记忆点？';
                    if (confirmAction(message)) await host.import(backup);
                })"></label>
                <button @click="run(async () => download(await host.migrationBackup(), 'scene-diary-pre-upgrade-' + view.chatId + '.json'))">导出升级前整聊天备份</button>
            </div>
        </details>
    </template>
</template>
