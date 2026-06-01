import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

/**
 * OAuth return target (Google/Apple). Stub for now — Phase 5/6 will
 * exchange the provider token for a session cookie here and redirect
 * to /dashboard. Today it just shows a spinner so the route exists and
 * the redirect URI can be registered with the OAuth providers up front.
 */
export function AuthCallback() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen grid place-items-center bg-souply-beet">
            <div className="inline-flex items-center gap-3 text-white">
                <Loader2 className="animate-spin" size={22} />
                <span className="text-sm font-semibold">{t('pages.authCallback.signingIn')}</span>
            </div>
        </div>
    );
}
