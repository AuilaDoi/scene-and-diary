import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    base: './',
    build: {
        lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'index.js', cssFileName: 'style' },
        target: 'es2022',
    },
});
