import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Using `vitest/config`'s `defineConfig` so the `test` block stays
// typed end-to-end. Falls back to vite's own config shape via the same
// re-exported function.
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        css: false,
    },
});
