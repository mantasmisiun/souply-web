import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// versionWatcher reads import.meta.env.VITE_BUILD_ID at module load, so stub the env and
// dynamic-import fresh per test.
describe('startVersionWatch', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv('VITE_BUILD_ID', 'build-1');
    });
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('invokes the callback when the served buildId differs (new deploy)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ buildId: 'build-2' }) }));
        const { startVersionWatch } = await import('./versionWatcher');
        const cb = vi.fn();
        const stop = startVersionWatch(cb);
        await vi.waitFor(() => expect(cb).toHaveBeenCalledTimes(1));
        stop();
    });

    it('does NOT fire when the buildId matches (same deploy)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ buildId: 'build-1' }) }));
        const { startVersionWatch } = await import('./versionWatcher');
        const cb = vi.fn();
        const stop = startVersionWatch(cb);
        await new Promise((r) => setTimeout(r, 30));
        expect(cb).not.toHaveBeenCalled();
        stop();
    });

    it('is a no-op with no embedded build id (dev)', async () => {
        vi.stubEnv('VITE_BUILD_ID', '');
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        const { startVersionWatch } = await import('./versionWatcher');
        const cb = vi.fn();
        startVersionWatch(cb)();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(cb).not.toHaveBeenCalled();
    });

    it('fails safe on a fetch error (no callback, no throw)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        const { startVersionWatch } = await import('./versionWatcher');
        const cb = vi.fn();
        const stop = startVersionWatch(cb);
        await new Promise((r) => setTimeout(r, 30));
        expect(cb).not.toHaveBeenCalled();
        stop();
    });
});
