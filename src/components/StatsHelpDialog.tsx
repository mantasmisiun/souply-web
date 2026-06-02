import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShoppingCart, TrendingDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ease } from '@/lib/motion';

interface Props {
    open: boolean;
    onClose: () => void;
}

/**
 * Explains the per-template stats (Visits / Times used / You helped save).
 * Same copy as the in-app StatsHelpModal so both surfaces describe the
 * numbers identically. Opened by the `?` on a template card.
 */
export function StatsHelpDialog({ open, onClose }: Props) {
    const { t } = useTranslation();
    const rows = [
        { Icon: Eye, label: t('dashboard.templates.statsVisits'), body: t('dashboard.templates.statsVisitsExplainer') },
        { Icon: ShoppingCart, label: t('dashboard.templates.statsUses'), body: t('dashboard.templates.statsUsesExplainer') },
        { Icon: TrendingDown, label: t('dashboard.templates.statsHelpedSave'), body: t('dashboard.templates.statsHelpedSaveExplainer') },
    ];
    return (
        <AnimatePresence>
            {open && (
                <motion.div key="stats-help-root" className="fixed inset-0 grid place-items-center px-6" style={{ zIndex: 60 }}>
                    <motion.div
                        key="stats-help-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        key="stats-help-dialog"
                        role="dialog"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.14 } }}
                        transition={{ duration: 0.24, ease: ease.soft }}
                        className="relative w-full max-w-md rounded-3xl bg-surface text-ink ring-1 ring-edge shadow-pop p-6"
                    >
                        <button
                            type="button" onClick={onClose} aria-label="Close"
                            className="absolute right-3 top-3 size-8 grid place-items-center rounded-full bg-surface-muted hover:bg-edge text-ink-soft transition"
                        >
                            <X size={16} />
                        </button>
                        <h2 className="text-base font-bold mb-4">{t('dashboard.templates.statsHelpTitle')}</h2>
                        <div className="flex flex-col gap-3.5">
                            {rows.map(({ Icon, label, body }) => (
                                <div key={label} className="flex items-start gap-3">
                                    <Icon size={18} className="text-souply-beet mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm font-semibold">{label}</div>
                                        <div className="text-[13px] text-ink-soft leading-snug">{body}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
