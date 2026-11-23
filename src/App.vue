<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useWorkspace, download, type Page } from './workspace';
import Workbench from './pages/Workbench.vue';
import Growth from './pages/Growth.vue';
import Diaries from './pages/Diaries.vue';
import Memory from './pages/Memory.vue';
import Settings from './pages/Settings.vue';
import Diagnostics from './pages/Diagnostics.vue';

const { view, host, opened, page, error, notice, run, select } = useWorkspace();
const tabs = [
    { id: 'workbench', label: '剧幕工作台', icon: 'fa-clapperboard', component: Workbench },
    { id: 'growth', label: '角色成长', icon: 'fa-seedling', component: Growth },
    { id: 'diaries', label: '日记档案', icon: 'fa-book-open', component: Diaries },
    { id: 'memory', label: '长期记忆', icon: 'fa-bookmark', component: Memory },
] as const;
const pages = { ...Object.fromEntries(tabs.map(tab => [tab.id, tab.component])), settings: Settings, diagnostics: Diagnostics };
const component = computed(() => pages[page.value] || Workbench);
const readOnly = computed(() => view.value.blocker.startsWith('检测到 SP') && view.value.persisted);
const readOnlyDiaries = computed(() => readOnly.value?.diaries || readOnly.value?.acts
    ?.filter(act => act.diary).map(act => ({ id: act.id, title: act.title, body: act.diary })) || []);
const rootTitle = computed(() => tabs.find(tab => tab.id === page.value)?.label || (page.value === 'settings' ? '设置' : '诊断'));

const toolbarBottom = ref(0), viewportHeight = ref(window.innerHeight);
watch(opened, (visible, _, cleanup) => {
    if (!visible) return;
    const bar = document.getElementById('top-settings-holder');
    function measure() {
        viewportHeight.value = window.visualViewport?.height || window.innerHeight;
        toolbarBottom.value = bar && getComputedStyle(bar).visibility !== 'hidden' ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (bar) observer.observe(bar);
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    cleanup(() => { observer.disconnect(); window.removeEventListener('resize', measure); window.visualViewport?.removeEventListener('resize', measure); });
});
let opener: HTMLElement | null = null;
watch(opened, value => {
    if (value) opener = document.activeElement as HTMLElement;
    else opener?.focus();
});
function escape(event: KeyboardEvent) {
    if (event.key === 'Escape' && !event.defaultPrevented && opened.value) { opened.value = false; event.stopPropagation(); }
}
document.addEventListener('keydown', escape);
onBeforeUnmount(() => document.removeEventListener('keydown', escape));

function exportContent() {
    return run(() => download(host.backup(), 'scene-diary-' + view.value.chatId + '.json'));
}
</script>

<template>
    <div v-if="opened" class="sd-backdrop" :style="{ '--sd-toolbar-bottom': toolbarBottom + 'px', '--sd-viewport-height': viewportHeight + 'px' }" data-tt-mobile-surface="backdrop" @click.self="opened = false">
        <section class="sd-window" data-tt-mobile-surface="fullscreen-window" role="dialog" aria-modal="true" aria-labelledby="sd-title">
            <header class="sd-header">
                <div class="sd-heading"><i class="fa-solid fa-clapperboard" aria-hidden="true"></i><h2 id="sd-title" tabindex="-1">{{ rootTitle }}</h2></div>
                <div class="sd-actions">
                    <button class="sd-icon" title="设置" aria-label="设置" :aria-pressed="page === 'settings'" @click="select('settings')"><i class="fa-solid fa-gear"></i></button>
                    <button class="sd-icon" title="诊断" aria-label="诊断" :aria-pressed="page === 'diagnostics'" @click="select('diagnostics')"><i class="fa-solid fa-list-check"></i></button>
                    <button class="sd-icon" title="关闭" aria-label="关闭" @click="opened = false"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </header>
            <nav class="sd-tabs" aria-label="剧幕工作台导航">
                <button v-for="tab in tabs" :key="tab.id" :aria-current="page === tab.id ? 'page' : undefined" @click="select(tab.id as Page)">
                    <i :class="'fa-solid ' + tab.icon" aria-hidden="true"></i><span>{{ tab.label }}</span>
                </button>
            </nav>
            <div class="sd-body">
                <aside v-if="view.saveError" class="sd-alert" role="alert">
                    <span>保存失败。{{ view.saveError }} 当前内容仍可编辑。</span>
                    <div class="sd-actions"><button @click="run(host.save)">重试保存</button><button v-if="view.state" @click="exportContent">导出内容</button></div>
                </aside>
                <aside v-if="error" class="sd-alert" role="alert">{{ error }}</aside>
                <aside v-if="notice" class="sd-status" role="status">{{ notice }}</aside>
                <template v-if="readOnly && ['growth', 'diaries', 'memory'].includes(page)">
                    <p class="sd-status">{{ view.blocker }} 已有内容可查阅。</p>
                    <section v-if="page === 'growth'" class="sd-card sd-stack"><h3>当前角色画像</h3><p class="sd-prose">{{ readOnly.characterGrowth?.content || '尚未建立画像。' }}</p></section>
                    <article v-else-if="page === 'diaries'" v-for="item in readOnlyDiaries" :key="item.id" class="sd-card sd-stack">
                        <h3>{{ item.title }}</h3><p class="sd-prose">{{ item.body }}</p>
                    </article>
                    <article v-else v-for="item in readOnly.memories || []" :key="item.id" class="sd-card sd-stack">
                        <h3>{{ item.title }}</h3><p class="sd-prose">{{ item.content }}</p>
                    </article>
                </template>
                <p v-else-if="readOnly && page === 'settings'" class="sd-card">{{ view.blocker }}</p>
                <component v-else :is="component" :key="view.chatId + '-' + page" />
            </div>
            <footer class="sd-footer" aria-live="polite">
                <span v-if="view.pendingSaves">正在保存…</span><span v-else-if="view.saveError">保存失败</span><span v-else-if="view.saved">已提交宿主保存</span><span v-else>scene&amp;diary</span>
            </footer>
        </section>
    </div>
</template>
