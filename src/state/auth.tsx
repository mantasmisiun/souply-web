import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchMe, logoutSession, toAppUser, type AppUser } from '@/lib/auth';

/**
 * Auth state. Real sessions are an httpOnly cookie set by
 * `POST /api/auth/oauth` (Google/Apple). On mount we restore the session
 * via `GET /api/auth/me` (sends the cookie); `login()` is called by the
 * sign-in flow once the cookie is set, and `logout()` clears the cookie
 * server-side. The gated dev-auth bypass also calls `login()` directly
 * (no cookie — client-only, doesn't survive reload, which is fine).
 */
// The session user is the AppUser shape (id + name/first/last + handle +
// avatarUrl) produced by toAppUser(). Defined once in lib/auth so the
// dashboard, profile editor, and this context all agree on the fields.
interface AuthState {
    user: AppUser | null;
    isAuthed: boolean;
    /** True until the initial session-restore (`/api/auth/me`) settles —
     *  lets the app avoid flashing the landing page for a returning,
     *  cookie-authed creator. */
    restoring: boolean;
    login: (user: AppUser) => void;
    logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [restoring, setRestoring] = useState(true);

    // Restore a cookie session on load. A 401 (anonymous visitor / dev
    // bypass without a cookie) just resolves to no user.
    useEffect(() => {
        let cancelled = false;
        fetchMe()
            .then((u) => { if (!cancelled) setUser(toAppUser(u)); })
            .catch(() => { /* not signed in */ })
            .finally(() => { if (!cancelled) setRestoring(false); });
        return () => { cancelled = true; };
    }, []);

    const login = useCallback((u: AppUser) => setUser(u), []);
    const logout = useCallback(() => {
        setUser(null);
        // Fire-and-forget cookie clear; a network blip shouldn't block
        // the local sign-out.
        logoutSession().catch(() => {});
    }, []);

    const value = useMemo<AuthState>(
        () => ({ user, isAuthed: user !== null, restoring, login, logout }),
        [user, restoring, login, logout],
    );
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
