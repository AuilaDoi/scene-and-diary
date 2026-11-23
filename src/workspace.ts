import { inject, nextTick, ref, shallowRef, triggerRef, type InjectionKey } from 'vue';
import { createHost } from '../host-v8.js';
import { semanticErrorDetail } from '../semantic.js';

export type Page = 'workbench' | 'growth' | 'diaries' | 'memory' | 'settings' | 'diagnostics';

export function createWorkspace(host: ReturnType<typeof createHost>) {
    const view = shallowRef(host.snapshot());
    const opened = ref(false);
    const page = ref<Page>('workbench');
    const error = ref('');
    const notice = ref('');
    let chatId = view.value.chatId;
    host.subscribe(snapshot => {
        view.value = snapshot;
        triggerRef(view);
        if (snapshot.chatId !== chatId) {
            chatId = snapshot.chatId;
            page.value = 'workbench';
            error.value = ''; notice.value = '';
        }
    });
    async function run<T>(job: () => T | Promise<T>): Promise<T | undefined> {
        error.value = ''; notice.value = '';
        const start = chatId;
        try { return await job(); }
        catch (failure) {
            if (start === chatId && failure?.name !== 'AbortError' && !view.value.saveError) {
                const keys = view.value.channels.map(channel => channel.key);
                const store = host.getContext().accountStorage;
                error.value = semanticErrorDetail(failure, [...keys, store?.getItem('scene_diary_embedding_key'), store?.getItem('scene_diary_rerank_key')]);
            }
        }
    }
    const openWorkbench = () => {
        page.value = 'workbench'; opened.value = true;
        void nextTick(() => document.getElementById('sd-title')?.focus());
    };
    const select = (value: Page) => {
        page.value = value; error.value = ''; notice.value = '';
    };
    return { host, view, opened, page, error, notice, run, openWorkbench, select };
}

export const WORKSPACE: InjectionKey<ReturnType<typeof createWorkspace>> = Symbol('scene-diary');
export const useWorkspace = () => inject(WORKSPACE)!;

export function download(value: unknown, name: string) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
