import { createApp } from 'vue';
import App from './App.vue';
import { createHost, VERSION_LABEL } from '../host-v8.js';
import { WORKSPACE, createWorkspace } from './workspace';
import './style.css';

function mountEntry(openWorkbench: () => void) {
    const button = document.createElement('button');
    button.className = 'menu_button sd-qr-entry';
    button.type = 'button';
    button.title = '打开 scene&diary 剧幕工作台';
    button.setAttribute('aria-label', button.title);
    button.innerHTML = '<i class="fa-solid fa-clapperboard" aria-hidden="true"></i><span>剧幕工作台</span>';
    button.addEventListener('click', openWorkbench);

    const sendForm = document.getElementById('send_form');
    function attach() {
        const qr = sendForm?.querySelector('#qr--bar') || document.querySelector('#qr--popout > .qr--body');
        const container = qr || document.getElementById('extensionsMenu');
        if (container && button.parentElement !== container) container.prepend(button);
    }

    // Quick Replies replaces the complete bar when it refreshes or toggles popout.
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true });
    if (sendForm) observer.observe(sendForm, { childList: true });
    attach();
}

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
        mountEntry(workspace.openWorkbench);
        void workspace.run(runtime.connect);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
}
