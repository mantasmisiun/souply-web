import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppleMark } from './BrandMarks';

/**
 * Real Sign in with Apple (web) via Apple's JS SDK in popup mode. On success
 * Apple returns an `id_token` whose audience is our **Services ID**
 * (VITE_APPLE_SERVICES_ID, e.g. lt.souply.web); we hand it to the same
 * `/api/auth/oauth` exchange the Google button uses (provider='apple').
 *
 * Renders nothing when the Services ID / redirect URI aren't configured (local
 * dev), so the panel just shows Google there. Requires the Services ID's domain
 * (souply.lt) to be verified in the Apple Developer portal for sign-in to work.
 */
const SERVICES_ID = import.meta.env.VITE_APPLE_SERVICES_ID as string | undefined;
const REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined;
const APPLE_JS =
    'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

interface AppleAuthResponse {
    authorization?: { id_token?: string; code?: string };
    user?: unknown;
}
interface AppleIDApi {
    auth: {
        init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void;
        signIn: () => Promise<AppleAuthResponse>;
    };
}
declare global {
    interface Window { AppleID?: AppleIDApi }
}

let scriptPromise: Promise<void> | null = null;
function loadAppleJs(): Promise<void> {
    if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
    if (window.AppleID) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = APPLE_JS;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('apple-js-load-failed'));
        document.head.appendChild(s);
    });
    return scriptPromise;
}

export function AppleSignInButton({
    onCredential, disabled,
}: {
    onCredential: (idToken: string) => void;
    disabled?: boolean;
}) {
    const { t } = useTranslation();
    const [busy, setBusy] = useState(false);
    const configured = Boolean(SERVICES_ID && REDIRECT_URI);

    if (!configured) return null;

    const onClick = async () => {
        if (busy || disabled) return;
        setBusy(true);
        try {
            await loadAppleJs();
            if (!window.AppleID) return;
            window.AppleID.auth.init({
                clientId: SERVICES_ID as string,
                scope: 'name email',
                redirectURI: REDIRECT_URI as string,
                usePopup: true,
            });
            const res = await window.AppleID.auth.signIn();
            const idToken = res?.authorization?.id_token;
            if (idToken) onCredential(idToken);
        } catch {
            // User closed the popup or Apple returned an error → no-op; the
            // panel stays put so they can retry or use Google.
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={busy || disabled}
            // Apple HIG: black button + white text in light, inverse in dark —
            // bg-ink/text-surface flip with the theme.
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-ink text-surface text-sm font-semibold shadow-card hover:opacity-90 transition disabled:cursor-not-allowed disabled:hover:opacity-100"
        >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <AppleMark size={16} />}
            {t('cta.loginApple')}
        </button>
    );
}
