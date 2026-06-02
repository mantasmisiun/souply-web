import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError } from '@/lib/api';
import { deleteTemplate as apiDeleteTemplate, listTemplatesForUser, type BasketTemplate } from '@/lib/templates';
import { useAuth } from './auth';

/**
 * Shared templates state. Both the dashboard rail (stats: count, total
 * uses, total savings) and the dashboard grid (the cards themselves)
 * read from this context so we make ONE GET per session instead of
 * each component re-fetching.
 *
 * Avoiding TanStack Query for now — a single resource read + a single
 * mutate covers everything we need. If the dashboard ever grows to
 * 3+ resources or needs background refetch / stale-while-revalidate,
 * trade this up for `@tanstack/react-query` (the mobile app uses it).
 */
interface TemplatesContextValue {
    templates: BasketTemplate[];
    loading: boolean;
    error: string | null;
    /** True once the first fetch *for the current userId* has settled
     *  (success or failure). App.tsx waits on this before kicking off
     *  the band-slide animation so the dashboard never reveals empty
     *  while the network is still in flight. Resets to false when
     *  userId changes (e.g. signout/sign-in as someone else). */
    ready: boolean;
    refresh: () => Promise<void>;
    remove: (id: number) => Promise<void>;
    /** Derived aggregates the Rail renders without iterating the list
     *  itself; precomputed once per templates update. */
    totals: {
        templates: number;
        uses: number;
        /** EUR as a Number — only used for display; precision-safe
         *  enough because individual rows are bounded ≤ 1M EUR. */
        savings: number;
    };
}

const TemplatesCtx = createContext<TemplatesContextValue | null>(null);

export function TemplatesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const userId = user?.id ?? '';
    const [templates, setTemplates] = useState<BasketTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    /** Tracks the userId the last attempted fetch was for. We compare
     *  against the current `userId` to derive `ready`: a transient
     *  mismatch means the fetch effect hasn't caught up yet, so we
     *  hold the animation. */
    const [settledForUserId, setSettledForUserId] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) {
            setTemplates([]);
            setSettledForUserId(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const rows = await listTemplatesForUser(userId);
            setTemplates(rows);
        } catch (err) {
            const message = err instanceof ApiError
                ? `API ${err.status}: ${err.message}`
                : (err as Error).message ?? 'Unknown error';
            setError(message);
            setTemplates([]);
        } finally {
            setLoading(false);
            // Record settlement in `finally` so transient errors still
            // free the App's gating effect — the dashboard renders with
            // an error banner instead of stalling on a permanent
            // "loading" screen.
            setSettledForUserId(userId);
        }
    }, [userId]);

    useEffect(() => { refresh(); }, [refresh]);

    // Live-ish savings: refetch when the creator returns to the tab and on a
    // gentle interval while it's visible. The savings number is accrued
    // server-side when followers shop, so a focus + slow poll picks up new
    // value without websockets. Skipped while the tab is hidden to avoid
    // pointless background requests.
    useEffect(() => {
        if (!userId) return;
        const onFocus = () => { if (document.visibilityState === 'visible') refresh(); };
        document.addEventListener('visibilitychange', onFocus);
        window.addEventListener('focus', onFocus);
        const id = window.setInterval(() => {
            if (document.visibilityState === 'visible') refresh();
        }, 60_000);
        return () => {
            document.removeEventListener('visibilitychange', onFocus);
            window.removeEventListener('focus', onFocus);
            window.clearInterval(id);
        };
    }, [userId, refresh]);

    const remove = useCallback(async (id: number) => {
        // Optimistic; revert via refetch on failure.
        setTemplates((prev) => prev.filter((p) => p.id !== id));
        try {
            await apiDeleteTemplate(id);
        } catch {
            refresh();
        }
    }, [refresh]);

    const totals = useMemo(() => ({
        templates: templates.length,
        uses:      templates.reduce((s, t) => s + (t.useCount ?? 0), 0),
        savings:   templates.reduce((s, t) => s + Number(t.collectiveSavingsEur ?? 0), 0),
    }), [templates]);

    const ready = !!userId && settledForUserId === userId;

    const value = useMemo<TemplatesContextValue>(
        () => ({ templates, loading, error, ready, refresh, remove, totals }),
        [templates, loading, error, ready, refresh, remove, totals],
    );

    return <TemplatesCtx.Provider value={value}>{children}</TemplatesCtx.Provider>;
}

export function useTemplates(): TemplatesContextValue {
    const ctx = useContext(TemplatesCtx);
    if (!ctx) throw new Error('useTemplates must be used inside <TemplatesProvider>');
    return ctx;
}
