import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import { VisitorBody } from './SideBand';
import { CreatorAuthPanel } from './CreatorAuthPanel';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { ease } from '@/lib/motion';

/**
 * Mobile-only (`sm:hidden`) landing sheet. On phones the desktop band is
 * hidden; a pink left-chevron tab sits on the right edge, and tapping it
 * slides this sheet in (sign-up form + creator section). Closing slides it
 * back off-right.
 *
 * Login is NOT offered on mobile web — tapping the creator CTA opens an info
 * view that points the visitor to the app beta or to desktop. This is a plain
 * overlay (no framer `layoutId`), so it never interferes with the desktop
 * band's morph animation.
 */
interface Props {
    /** Owned by App (same state the carousel reads), so the visitor↔creator
     *  view persists across closing/reopening the sheet AND re-themes the
     *  carousel behind it. */
    bandView: 'visitor' | 'creator-auth';
    onOpenCreatorAuth: () => void;
    onBackToVisitor: () => void;
}

export function MobileLandingSheet({ bandView, onOpenCreatorAuth, onBackToVisitor }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const view = bandView === 'creator-auth' ? 'login-info' : 'main';
    const year = new Date().getFullYear();

    // Don't reset the view on open — reopening returns to wherever the visitor
    // was (creator panel or sign-up), matching the persisted bandView.
    const openSheet = () => { setOpen(true); };

    return (
        <div className="sm:hidden">
            {/* Pull tab — pink left-chevron on the right edge while closed. */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        key="tab"
                        type="button"
                        onClick={openSheet}
                        aria-label={t('cta.mobileOpenPanel')}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        // Themed "lip" (bg-surface = white in light, dark in dark)
                        // so it stands out against the pink page; the chevron
                        // itself is pink. Sits near the top, not centred.
                        className="fixed right-0 top-6 z-40 grid place-items-center h-14 w-10 rounded-l-2xl bg-surface text-souply-beet shadow-pop ring-1 ring-edge/60"
                    >
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.aside
                            key="sheet"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.32, ease: ease.soft }}
                            className="fixed inset-y-0 right-0 z-50 w-[88vw] max-w-sm flex"
                        >
                            {/* Rounding + clip live on this inner wrapper (the aside
                                itself animates `x`). iOS Safari won't clip border-radius +
                                overflow-hidden when an ancestor is transformed, so the
                                scrolling content bled past the corners. translateZ(0)
                                promotes THIS node to its own compositing layer, where the
                                rounded clip is honoured — the reliable iOS fix. */}
                            <div className="relative flex-1 min-h-0 flex flex-col bg-surface shadow-band rounded-l-[32px] overflow-hidden [transform:translateZ(0)] [will-change:transform]">
                            <header className="flex items-center justify-between gap-2 px-6 pt-6 pb-2">
                                <div className="flex items-center gap-1.5">
                                    <ThemeToggle />
                                    <LanguageSwitcher />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label={t('cta.mobileClose')}
                                    className="size-9 grid place-items-center rounded-full text-ink-soft hover:bg-surface-muted hover:text-ink transition"
                                >
                                    <X size={18} />
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-7">
                                {view === 'main' ? (
                                    /* Reuse the EXACT desktop visitor content — sign-up
                                       form + "who it's for" personas + creator benefits
                                       — so mobile and desktop never drift. The creator
                                       CTA opens the no-login info view instead of OAuth. */
                                    <VisitorBody onOpenCreatorAuth={onOpenCreatorAuth} />
                                ) : (
                                    /* Same creator-auth page as desktop (back + title +
                                       benefit bullets), but the Google/Apple block is
                                       replaced by the no-login message + a button that
                                       redirects back to the landing sign-up. */
                                    <CreatorAuthPanel
                                        onBack={onBackToVisitor}
                                        onSubmit={() => {}}
                                        onGoogleCredential={() => {}}
                                        authSlot={
                                            <div className="mt-1 pt-4 border-t border-edge/60 flex flex-col gap-3">
                                                <p className="text-[13px] text-ink-soft leading-relaxed">{t('cta.mobileLoginBody')}</p>
                                                <button
                                                    type="button"
                                                    onClick={onBackToVisitor}
                                                    className="w-full inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:bg-beetTint-strong transition"
                                                >
                                                    {t('cta.mobileSignUpApp')}
                                                </button>
                                            </div>
                                        }
                                    />
                                )}

                                <footer className="mt-auto text-[11px] text-ink-soft/80 leading-relaxed">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link to="/legal/privacy" className="hover:text-ink transition">{t('footer.privacy')}</Link>
                                        <span className="opacity-30">·</span>
                                        <Link to="/legal/terms" className="hover:text-ink transition">{t('footer.terms')}</Link>
                                        <span className="opacity-30">·</span>
                                        <a href="mailto:support@souply.lt" className="hover:text-ink transition">{t('footer.contact')}</a>
                                    </div>
                                    <div>{t('footer.rights', { year })}</div>
                                </footer>
                            </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
