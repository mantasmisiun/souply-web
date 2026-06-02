import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CalendarDays, ChevronRight, Smartphone, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { BetaSignup } from './BetaSignup';
import { CreatorAuthPanel } from './CreatorAuthPanel';
import { cx } from '@/lib/cx';

type View = 'visitor' | 'creator-auth';

interface Props {
    view: View;
    onOpenCreatorAuth: () => void;
    onBackToVisitor: () => void;
    onAuthenticated: (mode: 'login' | 'signup') => void;
    /** Real Google sign-in: GIS hands up the ID-token credential. */
    onGoogleCredential: (idToken: string) => void;
    /** When true, band is animating to merge with the left-edge
     *  dashboard panel — outer page handles the position, this just
     *  fades its content out so the merge reads as one motion. */
    isMerging?: boolean;
    /** Forwarded straight to CreatorAuthPanel so the clicked CTA shows
     *  a spinner while App.tsx waits on the auth + templates fetch. */
    pendingAuthMode?: 'login' | 'signup' | null;
}

/**
 * The white "raised from the screen" vertical band on the right edge
 * of the landing page. Two views:
 *   1. visitor — brand mark + lang switcher, beta sign-up, and the
 *      "Kūrėjo prisijungimas" CTA that opens the auth panel. The
 *      audience (shopper vs creator) is *not* exposed as a pill here;
 *      the carousel re-themes itself automatically when the visitor
 *      taps into creator auth.
 *   2. creator-auth — OAuth buttons (Google + Apple) over a back link
 *      so the same band slot toggles between marketing and auth
 *      without the visitor losing spatial orientation.
 * Becomes the dashboard's left rail after authentication — that
 * transformation is owned by the parent (`App`), the band itself just
 * exposes `isMerging` to fade its public content out before the parent
 * slides + reshapes the panel.
 */
export function SideBand({
    view,
    onOpenCreatorAuth, onBackToVisitor, onAuthenticated, onGoogleCredential,
    isMerging = false,
    pendingAuthMode = null,
}: Props) {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <div
            className={cx(
                'relative h-full w-full bg-surface rounded-l-[40px] md:rounded-[40px] shadow-band',
                'overflow-hidden',
            )}
            data-testid="side-band"
        >
            {/* Subtle inner gloss line up top — sells the "carved" look */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
            />

            <div className="flex flex-col h-full p-7 md:p-8">
                <header className="flex items-center justify-between gap-2">
                    <BrandMark />
                    <div className="flex items-center gap-1.5">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: isMerging ? 0 : 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 flex flex-col justify-between gap-8 mt-10"
                    >
                        {view === 'visitor' ? (
                            <VisitorBody onOpenCreatorAuth={onOpenCreatorAuth} />
                        ) : (
                            <CreatorAuthPanel
                                onSubmit={onAuthenticated}
                                onGoogleCredential={onGoogleCredential}
                                onBack={onBackToVisitor}
                                pending={pendingAuthMode}
                            />
                        )}

                        <footer className="text-[11px] text-ink-soft/80 leading-relaxed">
                            <div className="flex items-center gap-3 mb-2">
                                <Link to="/legal/privacy" className="hover:text-ink transition">{t('footer.privacy')}</Link>
                                <span className="opacity-30">·</span>
                                <Link to="/legal/terms" className="hover:text-ink transition">{t('footer.terms')}</Link>
                                <span className="opacity-30">·</span>
                                <a href="mailto:support@souply.lt" className="hover:text-ink transition">{t('footer.contact')}</a>
                            </div>
                            <div>{t('footer.rights', { year })}</div>
                        </footer>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function BrandMark() {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-2">
            <span className="grid place-items-center size-9 rounded-2xl bg-souply-beet text-white font-display font-bold shadow-card">
                S
            </span>
            <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight text-ink">{t('brand.name')}</div>
                <div className="text-[10px] text-ink-soft/80 uppercase tracking-[0.18em]">.lt</div>
            </div>
        </div>
    );
}

function VisitorBody({ onOpenCreatorAuth }: { onOpenCreatorAuth: () => void }) {
    const { t } = useTranslation();
    // "Who it's for" persona blocks — moved here from the creator-auth
    // panel so a visitor can self-identify BEFORE deciding to log in.
    // Content unchanged; the auth panel now carries the "what you get"
    // benefit bullets instead.
    const personas: { icon: LucideIcon; nameKey: string; bodyKey: string }[] = [
        { icon: CalendarDays, nameKey: 'cta.creatorPersona1', bodyKey: 'cta.creatorBenefit1' },
        { icon: Stethoscope,  nameKey: 'cta.creatorPersona2', bodyKey: 'cta.creatorBenefit2' },
        { icon: BookOpen,     nameKey: 'cta.creatorPersona3', bodyKey: 'cta.creatorBenefit3' },
        { icon: Smartphone,   nameKey: 'cta.creatorPersona4', bodyKey: 'cta.creatorBenefit4' },
    ];
    return (
        <div className="flex flex-col gap-7">
            <BetaSignup />

            {/* Creator explainer + CTA. Lives under the divider so the
                beta-tester (top) and would-be creator (bottom) paths are
                visually separated. The persona blocks let a visitor see
                "is this me?" before tapping through to log in. */}
            <div className="pt-5 border-t border-edge/60 flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-ink">
                    {t('cta.creatorIntroTitle')}
                </h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                    {t('cta.creatorIntroBody')}
                </p>

                <h5 className="mt-1 text-xs font-bold tracking-wider uppercase text-ink-soft">
                    {t('cta.creatorBenefitsHeading')}
                </h5>
                <ul className="flex flex-col gap-3.5">
                    {personas.map(({ icon: Icon, nameKey, bodyKey }) => (
                        <li key={nameKey} className="flex gap-3">
                            <span className="grid place-items-center size-9 shrink-0 rounded-xl bg-beetTint text-souply-beetDeep">
                                <Icon size={16} strokeWidth={2} />
                            </span>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="text-sm font-semibold text-ink leading-tight">
                                    {t(nameKey)}
                                </div>
                                <p className="text-[13px] text-ink-soft leading-snug mt-1">
                                    {t(bodyKey)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    onClick={onOpenCreatorAuth}
                    /* `bg-ink text-surface` swaps both colours with the
                     * theme: dark button + light text in light mode,
                     * light button + dark text in dark mode. Always
                     * high-contrast against the band, never competes
                     * with the pink beta CTA above. */
                    className="mt-2 group w-full inline-flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-ink text-surface text-sm font-semibold shadow-card hover:opacity-90 transition"
                >
                    <span>{t('cta.creatorLogin')}</span>
                    <ChevronRight size={16} className="opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
