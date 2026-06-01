import { api } from './api';

/** Verified-user shape returned by souply-api auth endpoints. */
export interface ApiUser {
    id: string;
    username: string | null;
    displayName: string | null;
    bio?: string | null;
    avatarUrl: string | null;
    email: string | null;
    authProvider: string | null;
}

/** App-side user shape consumed by the dashboard (id + display + handle). */
export interface AppUser {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string | null;
}

export function toAppUser(u: ApiUser): AppUser {
    const name = u.displayName?.trim()
        || (u.email ? u.email.split('@')[0] : '')
        || 'Kūrėjas';
    return { id: u.id, name, handle: u.username ?? '', avatarUrl: u.avatarUrl };
}

/**
 * Stable anonymous UUID for the OAuth link step. The web has no
 * anonymous browsing session, but the endpoint requires one — and the
 * server dedupes by the Google identity (authProvider+subject) anyway,
 * so this only matters on the very first sign-in. Persisted so retries
 * reuse the same id.
 */
export function getAnonId(): string {
    const KEY = 'souply.anonId';
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(KEY, id);
    }
    return id;
}

/** POST /api/auth/oauth — verify the provider ID token, set the session
 *  cookie, return the verified user. */
export const oauthSignIn = (body: { provider: 'google' | 'apple'; idToken: string }) =>
    api.post<{ token: string; action: string; user: ApiUser }>(
        '/api/auth/oauth',
        { ...body, anonymousUserId: getAnonId() },
    );

/** GET /api/auth/me — current session's user (via cookie). 401 when not
 *  signed in. */
export const fetchMe = () => api.get<ApiUser>('/api/auth/me');

/** POST /api/auth/logout — clear the session cookie. */
export const logoutSession = () => api.post<void>('/api/auth/logout');
