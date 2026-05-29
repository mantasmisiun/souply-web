import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Each test gets a fresh DOM + cleared mocks. Without this, components
// from the previous test (especially anything with Framer Motion or
// portals) leak across tests and produce false-positive matches.
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

// jsdom doesn't ship matchMedia — Framer Motion uses it to detect
// prefers-reduced-motion. Without this shim every test that mounts a
// `motion.*` component throws.
if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }),
    });
}

// jsdom 29 + Vitest 4 dropped the default localStorage exposure in some
// setups. Polyfill a minimal in-memory store so feature tests can treat
// it as if it were a real browser.
if (typeof window.localStorage === 'undefined' || !window.localStorage) {
    const store = new Map<string, string>();
    const ls: Storage = {
        get length() { return store.size; },
        clear: () => { store.clear(); },
        getItem: (k) => (store.has(k) ? store.get(k)! : null),
        key: (i) => Array.from(store.keys())[i] ?? null,
        removeItem: (k) => { store.delete(k); },
        setItem: (k, v) => { store.set(k, String(v)); },
    };
    Object.defineProperty(window, 'localStorage', { value: ls, writable: true });
    Object.defineProperty(globalThis, 'localStorage', { value: ls, writable: true });
}
