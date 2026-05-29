import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BetaSignup } from './BetaSignup';
import { CreatorAuthPanel } from './CreatorAuthPanel';
import { cx } from '@/lib/cx';

type View = 'visitor' | 'creator-auth';

interface Props {
    view: View;
    onOpenCreatorAuth: () => void;
    onBackToVisitor: () => void;
    onAuthenticated: () => void;
    /** When true, band is animating to merge with the left-edge
     *  dashboard panel — outer page handles the position, this just
     *  fades its content out so the merge reads as one motion. */
    isMerging?: boolean;
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
    onOpenCreatorAuth, onBackToVisitor, onAuthenticated,
    isMerging = false,
}: Props) {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <div
            className={cx(
                'relative h-full w-full bg-white rounded-l-[40px] md:rounded-[40px] shadow-band',
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
                <header className="flex items-center justify-between">
                    <BrandMark />
                    <LanguageSwitcher />
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
                                onBack={onBackToVisitor}
                            />
                        )}

                        <footer className="text-[11px] text-souply-slate/80 leading-relaxed">
                            <div className="flex items-center gap-3 mb-2">
                                <a href="#" className="hover:text-souply-ink transition">{t('footer.privacy')}</a>
                                <span className="opacity-30">·</span>
                                <a href="#" className="hover:text-souply-ink transition">{t('footer.terms')}</a>
                                <span className="opacity-30">·</span>
                                <a href="#" className="hover:text-souply-ink transition">{t('footer.contact')}</a>
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
                <div className="text-sm font-semibold tracking-tight text-souply-ink">{t('brand.name')}</div>
                <div className="text-[10px] text-souply-slate/80 uppercase tracking-[0.18em]">.lt</div>
            </div>
        </div>
    );
}

function VisitorBody({ onOpenCreatorAuth }: { onOpenCreatorAuth: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-7">
            <BetaSignup />

            <div className="pt-2 border-t border-souply-border/60">
                <button
                    type="button"
                    onClick={onOpenCreatorAuth}
                    className="group w-full inline-flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-souply-ink text-white text-sm font-semibold shadow-card hover:bg-black transition"
                >
                    <span>{t('cta.creatorLogin')}</span>
                    <ChevronRight size={16} className="opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
