import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

/**
 * Invite landing at /join/:code — the surface a visitor lands on from a
 * trip/household QR or share link (Souply 2.0). Same job as the /t/:slug
 * template landing: show what the link is, then hand off to the app.
 *
 * Fed by GET /api/join/:code/preview, which is anonymous-friendly — the
 * code itself is the capability, so an uninstalled visitor still sees
 * what they were invited to. The CLAIM only happens inside the app
 * (requireUser), so this page never mutates anything.
 */

interface JoinPreview {
    scope: 'trip' | 'household';
    name: string | null;
    memberCount: number;
}

/** The app only exists on phones, so the deep-link CTA only makes sense on a
 *  mobile browser. On desktop we offer "Get Souply" → the marketing site. */
function isMobileDevice(): boolean {
    return typeof navigator !== 'undefined'
        && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function JoinInviteView() {
    const { code } = useParams<{ code: string }>();
    const { t } = useTranslation();
    const [data, setData] = useState<JoinPreview | null>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        if (!code) { setState('error'); return; }
        let cancelled = false;
        setState('loading');
        api.get<JoinPreview>(`/api/join/${encodeURIComponent(code)}/preview`)
            .then((res) => { if (!cancelled) { setData(res); setState('ready'); } })
            .catch(() => { if (!cancelled) setState('error'); });
        return () => { cancelled = true; };
    }, [code]);

    // On a phone, hand straight off to the app (one fewer tap). Fires once,
    // shortly after paint, so the page still renders as the fallback when the
    // app isn't installed. (iOS Universal Links don't fire from a QR/Camera
    // scan, which is why this web hop exists — same as /t/:slug.)
    useEffect(() => {
        if (!code || !isMobileDevice()) return;
        const id = window.setTimeout(() => {
            window.location.href = `souply://join/${code}`;
        }, 350);
        return () => window.clearTimeout(id);
    }, [code]);

    if (state === 'loading') {
        return (
            <div className="min-h-screen grid place-items-center bg-createWash text-souply-beet">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Loader2 className="animate-spin" size={20} /> {t('pages.joinInvite.loading')}
                </span>
            </div>
        );
    }

    // Unknown, revoked or expired code — the ONLY error shape the preview
    // returns (a plain 404), so one state covers them all.
    if (state === 'error' || !data) {
        return (
            <div className="min-h-screen grid place-items-center bg-createWash px-6 text-center">
                <div className="max-w-md">
                    <div className="text-4xl mb-3" aria-hidden>⌛</div>
                    <h1 className="text-lg font-bold mb-1">{t('pages.joinInvite.invalidTitle')}</h1>
                    <p className="text-sm text-ink-soft mb-6">{t('pages.joinInvite.invalidBody')}</p>
                    <Link to="/" className="text-sm font-semibold text-souply-beet hover:underline">
                        {t('brand.name')}
                    </Link>
                </div>
            </div>
        );
    }

    const mobile = isMobileDevice();
    const scopeKey = data.scope === 'household' ? 'household' : 'trip';
    const title = data.name
        ? t(`pages.joinInvite.${scopeKey}TitleNamed`, { name: data.name })
        : t(`pages.joinInvite.${scopeKey}Title`);

    return (
        <div className="min-h-screen bg-createWash text-ink">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <Link to="/" className="text-sm font-semibold text-souply-beet hover:underline">
                    {t('brand.name')}
                </Link>

                <div className="mt-16 text-center">
                    <div className="text-5xl mb-4" aria-hidden>{data.scope === 'household' ? '🏠' : '🛒'}</div>
                    <h1 className="text-xl font-bold leading-tight">{title}</h1>
                    <p className="text-sm text-ink-soft mt-2">
                        {t('pages.joinInvite.members', { count: data.memberCount })}
                    </p>
                    <p className="text-sm text-ink-soft mt-6 max-w-prose mx-auto">
                        {mobile ? t('pages.joinInvite.openHint') : t('pages.joinInvite.desktopHint')}
                    </p>

                    <div className="mt-8 grid place-items-center">
                        {mobile ? (
                            <a
                                href={`souply://join/${code}`}
                                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:brightness-95 transition"
                            >
                                {t('pages.joinInvite.openInApp')}
                            </a>
                        ) : (
                            <a
                                href="https://souply.lt"
                                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:brightness-95 transition"
                            >
                                {t('pages.joinInvite.getSouply')}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
