import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    base: './',
    // Library builds leave this flag for consumers. The host WebView has no Node process.
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
        lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'index.js', cssFileName: 'style' },
        target: 'es2022',
    },
});
