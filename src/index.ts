import { createApp } from 'vue';
import App from './App.vue';
import { createHost, VERSION_LABEL } from '../host-v7.js';
import { WORKSPACE, createWorkspace } from './workspace';
import './style.css';

export function install(getContext, applyPrompt) {
    const runtime = createHost(getContext, applyPrompt);
    Object.assign(globalThis, { sceneDiaryRearrangeChat: runtime.rearrange, sceneDiary: { version: VERSION_LABEL, ...runtime } });
    const mount = () => {
        if (document.getElementById('scene-diary-root')) return;
        const root = document.createElement('div');
        root.id = 'scene-diary-root';
        document.body.append(root);
        const workspace = createWorkspace(runtime);
        createApp(App).provide(WORKSPACE, workspace).mount(root);
        const toolbar = document.getElementById('send_but');
        if (toolbar) {
            const button = document.createElement('button');
            button.className = 'sd-host-entry';
            button.type = 'button';
            button.title = '打开 scene&diary 剧幕工作台';
            button.setAttribute('aria-label', button.title);
            button.innerHTML = '<i class="fa-solid fa-clapperboard" aria-hidden="true"></i>';
            button.addEventListener('click', workspace.openWorkbench);
            toolbar.before(button);
            workspace.hasToolbar.value = true;
        }
        void workspace.run(runtime.connect);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
}
