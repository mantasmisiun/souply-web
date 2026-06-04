import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, AtSign, BarChart3, Share2, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AppleSignInButton } from './AppleSignInButton';
import { DEV_AUTH_ENABLED } from '@/lib/devAuth';

interface Props {
    /** Apple + dev-bypass CTA. (Google now uses the real GIS button via
     *  `onGoogleCredential`.) */
    onSubmit: (mode: 'login' | 'signup') => void;
    /** Real Google sign-in: GIS hands up the ID-token credential. */
    onGoogleCredential: (idToken: string) => void;
    /** Real Apple sign-in: Apple JS popup hands up the id_token. */
    onAppleCredential?: (idToken: string) => void;
    onBack: () => void;
    /** Which CTA, if any, is currently waiting on the auth + templates
     *  fetch round-trip. The clicked button swaps its brand mark for
     *  a spinner and disables both buttons so a user can't double-fire
     *  while the network is still in flight. */
    pending?: 'login' | 'signup' | null;
    /** When provided, replaces the Google/Apple sign-in block (everything
     *  else — back link, title, benefit bullets — stays identical). Used by
     *  the mobile landing sheet, where web login isn't offered. */
    authSlot?: ReactNode;
}

/**
 * Right-band content shown after the visitor taps "Esu kūrėja(s)".
 *
 *   1. Back link + title (no subtitle — the title is enough framing
 *      now that the persona blocks below carry the explanation).
 *   2. OAuth: Google + Apple. Same backend handler; analytics decides
 *      which funnel by provider.
 *   3. Three benefit bullets — "what you get" as a creator. The
 *      persona "who it's for" blocks now live on the visitor screen,
 *      so here we reassure the visitor right before they sign in.
 */
export function CreatorAuthPanel({ onSubmit, onGoogleCredential, onAppleCredential, onBack, pending = null, authSlot }: Props) {
    const { t } = useTranslation();
    const benefits: { icon: LucideIcon; titleKey: string; bodyKey: string }[] = [
        { icon: Share2,    titleKey: 'cta.creatorIntroBullet1', bodyKey: 'cta.creatorIntroBulletBody1' },
        { icon: AtSign,    titleKey: 'cta.creatorIntroBullet2', bodyKey: 'cta.creatorIntroBulletBody2' },
        { icon: BarChart3, titleKey: 'cta.creatorIntroBullet3', bodyKey: 'cta.creatorIntroBulletBody3' },
    ];
    const busy = pending !== null;

    return (
        <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={onBack}
                disabled={busy}
                className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeft size={14} /> {t('cta.back')}
            </button>

            <h3 className="text-base font-semibold text-ink">{t('cta.creatorLogin')}</h3>

            {/* Benefit bullets — "what you get". Bigger type than the old
                checkmark list (icon tile + text-sm title + text-[13px]
                body). Shown above the sign-in buttons so the visitor
                reads the value props before committing. */}
            <ul className="flex flex-col gap-3.5">
                {benefits.map(({ icon: Icon, titleKey, bodyKey }) => (
                    <li key={titleKey} className="flex gap-3">
                        <span className="grid place-items-center size-9 shrink-0 rounded-xl bg-beetTint text-souply-beetDeep">
                            <Icon size={16} strokeWidth={2} />
                        </span>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="text-sm font-semibold text-ink leading-tight">
                                {t(titleKey)}
                            </div>
                            <p className="text-[13px] text-ink-soft leading-snug mt-1">
                                {t(bodyKey)}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Sign-in buttons — placed under the benefits. Soft divider
                above so they read as the action that follows the pitch.
                On mobile `authSlot` replaces this whole block (no web login). */}
            {authSlot ?? (
            <div className="mt-1 pt-4 border-t border-edge/60 flex flex-col gap-2 items-stretch">
                {/* Real Google sign-in (GIS renders Google's own button).
                    Renders nothing if VITE_GOOGLE_CLIENT_ID is unset — the
                    dev bypass below still covers sign-in then. */}
                <div className="min-h-[44px]">
                    <GoogleSignInButton onCredential={onGoogleCredential} disabled={busy} />
                </div>
                {/* Real Sign in with Apple (web). Renders nothing until the
                    Services ID env is set, so local/dev just shows Google. */}
                <AppleSignInButton onCredential={onAppleCredential ?? (() => {})} disabled={busy} />

                {/* DEV-ONLY bypass — rendered only when the dev-auth gate
                    is on (test/dev builds). Tree-shaken out of production
                    builds entirely (DEV_AUTH_ENABLED is a const false
                    there), so this shortcut can never reach prod. Until
                    Phase 5 ships real OAuth, the Google/Apple buttons
                    above also route through this same gated bypass. */}
                {DEV_AUTH_ENABLED && (
                    <button
                        type="button"
                        onClick={() => onSubmit('login')}
                        disabled={busy}
                        className="mt-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border-2 border-dashed border-souply-beet/50 text-souply-beet text-xs font-bold uppercase tracking-wide hover:bg-beetTint transition disabled:cursor-not-allowed"
                    >
                        <Wrench size={13} /> Dev sign-in (skip auth → 000…)
                    </button>
                )}
            </div>
            )}
        </div>
    );
}
