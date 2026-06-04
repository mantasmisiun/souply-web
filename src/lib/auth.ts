import { api } from './api';

/** Verified-user shape returned by souply-api auth endpoints. */
export interface ApiUser {
    id: string;
    username: string | null;
    displayName: string | null;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    avatarUrl: string | null;
    email: string | null;
    authProvider: string | null;
}

/** App-side user shape consumed by the dashboard (id + display + handle). */
export interface AppUser {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    handle: string;
    avatarUrl?: string | null;
}

export function toAppUser(u: ApiUser): AppUser {
    const firstName = u.firstName?.trim() ?? '';
    const lastName = u.lastName?.trim() ?? '';
    const name = [firstName, lastName].filter(Boolean).join(' ')
        || u.displayName?.trim()
        || (u.email ? u.email.split('@')[0] : '')
        || 'Kūrėjas';
    return { id: u.id, name, firstName, lastName, handle: u.username ?? '', avatarUrl: u.avatarUrl };
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

/** GET /api/users/:id/profile — public-readable identity fields (avatar +
 *  name + handle). Used to hydrate the dev bypass from server state so an
 *  app-set avatar/name shows on the web too. */
export const fetchUserIdentity = (id: string) =>
    api.get<{ avatarUrl: string | null; firstName: string | null; lastName: string | null; username: string | null }>(
        `/api/users/${id}/profile`,
    );

/** POST /api/auth/logout — clear the session cookie. */
export const logoutSession = () => api.post<void>('/api/auth/logout');

/** PATCH /api/users/me/profile — edit the creator's name. */
export const updateProfile = (body: { firstName?: string; lastName?: string; displayName?: string; bio?: string }) =>
    api.patch<void>('/api/users/me/profile', body);

/** POST /api/users/me/avatar — upload a new avatar (base64, no data: prefix). */
export const uploadAvatar = (imageBase64: string) =>
    api.post<{ avatarUrl: string }>('/api/users/me/avatar', { imageBase64 });
