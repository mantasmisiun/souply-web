import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

// Using `vitest/config`'s `defineConfig` so the `test` block stays
// typed end-to-end. Falls back to vite's own config shape via the same
// re-exported function.

/**
 * Build id for the web version gate (Phase 4). A value that CHANGES every deploy, embedded
 * into the client bundle (VITE_BUILD_ID) AND emitted to dist/version.json so a running tab
 * can detect "the server has a newer build than the one I loaded" and prompt a reload.
 * Prefers the git short SHA (stable, greppable); falls back to a build timestamp when git
 * isn't available in the build context (e.g. a slim Docker layer).
 */
function resolveBuildId(): string {
    if (process.env.BUILD_ID) return process.env.BUILD_ID;
    try {
        return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
            .toString()
            .trim();
    } catch {
        return `t${Date.now()}`;
    }
}

const BUILD_ID = resolveBuildId();

export default defineConfig({
    plugins: [
        react(),
        {
            // Emit dist/version.json alongside the bundle so the server serves the SAME id the
            // client was built with (matched pair — no drift between shell and check).
            name: 'emit-version-json',
            apply: 'build',
            writeBundle(options) {
                const outDir = (options && options.dir) || path.resolve(__dirname, 'dist');
                try {
                    writeFileSync(path.join(outDir, 'version.json'), JSON.stringify({ buildId: BUILD_ID }));
                } catch {
                    /* non-fatal: the server falls back to an env/empty id */
                }
            },
        },
    ],
    define: {
        'import.meta.env.VITE_BUILD_ID': JSON.stringify(BUILD_ID),
    },
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
