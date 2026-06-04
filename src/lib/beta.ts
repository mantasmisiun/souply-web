import { api } from './api';

/** POST /api/beta-signups — captures a landing-page beta signup and AWAITS the
 *  invite email send. Resolves once the invite is sent (or was already sent);
 *  rejects (ApiError 502) if the send failed, so the form can show an error and
 *  let the visitor retry. Public/unauthenticated. */
export const submitBetaSignup = (body: {
    name: string;
    email: string;
    platform: 'ios' | 'android';
    lang?: 'lt' | 'en';
}) => api.post<{ ok: boolean; emailSent?: boolean; alreadyInvited?: boolean }>('/api/beta-signups', body);
