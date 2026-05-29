import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Theme state. Three sources, in priority order:
 *
 *   1. User preference (saved by the toggle). Persisted to localStorage
 *      under `souply.theme` so a creator's pick survives reloads.
 *   2. OS preference via `prefers-color-scheme`. Re-evaluated whenever
 *      the OS flips (e.g. macOS Auto switches at sunset).
 *   3. Fallback: 'light'.
 *
 * Adapter pattern: components don't read `prefers-color-scheme`
 * themselves — they consume `effective` (the resolved 'light'|'dark')
 * and the CSS variables under `[data-theme]` do the actual style swap.
 */
export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

interface State {
    /** What the user picked. Defaults to 'system'. */
    mode: ThemeMode;
    /** Resolved value applied to <html data-theme>. */
    effective: EffectiveTheme;
    setMode: (m: ThemeMode) => void;
    /** Click cycle: light → dark → system → light … */
    cycle: () => void;
}

const STORAGE_KEY = 'souply.theme';
const Ctx = createContext<State | null>(null);

function detectSystem(): EffectiveTheme {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStored(): ThemeMode {
    if (typeof window === 'undefined') return 'system';
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>(() => readStored());
    const [systemPref, setSystemPref] = useState<EffectiveTheme>(() => detectSystem());

    // React to OS theme flips while the tab is open. The mql.addEventListener
    // path handles Safari + modern Chrome / Firefox; older browsers use
    // addListener which we cover for completeness.
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = () => setSystemPref(mql.matches ? 'dark' : 'light');
        apply();
        if (mql.addEventListener) {
            mql.addEventListener('change', apply);
            return () => mql.removeEventListener('change', apply);
        }
        mql.addListener(apply);
        return () => mql.removeListener(apply);
    }, []);

    const effective: EffectiveTheme = mode === 'system' ? systemPref : mode;

    // Write `data-theme` to <html> so the CSS-variable bundle in
    // index.css takes effect. Also sets `color-scheme` for native
    // form-control colouring (date pickers, scrollbars, etc.).
    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.dataset.theme = effective;
        document.documentElement.style.colorScheme = effective;
    }, [effective]);

    const setMode = useCallback((next: ThemeMode) => {
        setModeState(next);
        try { window.localStorage?.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
    }, []);

    const cycle = useCallback(() => {
        const order: ThemeMode[] = ['light', 'dark', 'system'];
        const next = order[(order.indexOf(mode) + 1) % order.length];
        setMode(next);
    }, [mode, setMode]);

    const value = useMemo<State>(
        () => ({ mode, effective, setMode, cycle }),
        [mode, effective, setMode, cycle],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThemeMode(): State {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useThemeMode must be used inside <ThemeProvider>');
    return ctx;
}
