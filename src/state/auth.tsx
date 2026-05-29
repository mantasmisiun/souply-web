import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Auth state. Tonight: a single in-memory boolean populated by clicking
 * the OAuth buttons (no network). Tomorrow this same hook gets a real
 * `login(provider)` that talks to souply-api and stores the issued JWT
 * in an httpOnly cookie; the rest of the app doesn't change.
 *
 * The shape is deliberately small so the wire-up tomorrow is a contract
 * widening, not a rewrite.
 */
interface User {
    name: string;
    handle: string;
}

interface AuthState {
    user: User | null;
    isAuthed: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const login = useCallback((u: User) => setUser(u), []);
    const logout = useCallback(() => setUser(null), []);
    const value = useMemo<AuthState>(
        () => ({ user, isAuthed: user !== null, login, logout }),
        [user, login, logout],
    );
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
