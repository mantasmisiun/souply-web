import { api } from './api';

/** POST /api/beta-signups — captures a landing-page beta signup
 *  server-side (persisted + triggers an internal notification email).
 *  Public/unauthenticated. */
export const submitBetaSignup = (body: {
    name: string;
    email: string;
    platform: 'ios' | 'android';
    lang?: 'lt' | 'en';
}) => api.post<{ ok: true }>('/api/beta-signups', body);
