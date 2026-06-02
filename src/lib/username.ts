import { api, ApiError } from './api';

/** Mirrors the server's username rejection reasons (souply-api authController). */
export type UsernameRejectReason =
    | 'taken' | 'reserved' | 'too-short' | 'too-long' | 'rate-limited' | 'bad-format';

function reasonFrom(e: unknown): UsernameRejectReason {
    if (e instanceof ApiError && e.body && typeof (e.body as { error?: unknown }).error === 'string') {
        return (e.body as { error: string }).error as UsernameRejectReason;
    }
    return 'bad-format';
}

/** GET /api/users/username-available?u= — debounced availability check.
 *  Cookie-authed (verified-only endpoint), which is fine: it's called only
 *  after sign-in has set the session cookie. */
export async function checkUsernameAvailable(
    candidate: string,
): Promise<{ available: boolean; reason?: UsernameRejectReason }> {
    try {
        return await api.get<{ available: boolean; reason?: UsernameRejectReason }>(
            `/api/users/username-available?u=${encodeURIComponent(candidate)}`,
        );
    } catch (e) {
        return { available: false, reason: reasonFrom(e) };
    }
}

/** PATCH /api/users/me/username — claim the handle. */
export async function setUsername(
    candidate: string,
): Promise<{ ok: true; username: string } | { ok: false; reason: UsernameRejectReason }> {
    try {
        const res = await api.patch<{ username: string }>('/api/users/me/username', { username: candidate });
        return { ok: true, username: res.username };
    } catch (e) {
        return { ok: false, reason: reasonFrom(e) };
    }
}
