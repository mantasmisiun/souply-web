import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ease } from '@/lib/motion';

interface Props {
    open: boolean;
    title: string;
    body: string;
    yesLabel: string;
    noLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    /** Brand-pink confirm by default; `danger` swaps it for the deeper
     *  beet so destructive confirmations (delete account etc.) read
     *  with more weight if we reuse this component later. */
    danger?: boolean;
}

/**
 * Lightweight confirmation modal. Rendered above everything else
 * (`zIndex: 50`) so it overlays the band and the dashboard without
 * needing a portal — App owns the open state, the band swap during
 * un-merging unmounts the dialog naturally once the user has
 * committed.
 *
 * Keyboard: Escape cancels, Enter confirms. Focus trap deferred —
 * the two buttons are siblings so Tab moves between them and Shift+Tab
 * walks back; good enough for a 2-button modal.
 */
export function ConfirmDialog({
    open, title, body, yesLabel, noLabel, onConfirm, onCancel, danger = false,
}: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
            else if (e.key === 'Enter') onConfirm();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onCancel, onConfirm]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="confirm-root"
                    className="fixed inset-0 grid place-items-center px-6"
                    style={{ zIndex: 50 }}
                >
                    {/* Backdrop — captures clicks-outside as cancel */}
                    <motion.div
                        key="confirm-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        key="confirm-dialog"
                        role="alertdialog"
                        aria-labelledby="confirm-title"
                        aria-describedby="confirm-body"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.14 } }}
                        transition={{ duration: 0.24, ease: ease.soft }}
                        className="relative w-full max-w-sm rounded-3xl bg-surface text-ink ring-1 ring-edge shadow-pop p-6"
                    >
                        <h2 id="confirm-title" className="text-base font-semibold mb-1.5">
                            {title}
                        </h2>
                        <p id="confirm-body" className="text-sm text-ink-soft leading-relaxed mb-5">
                            {body}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-surface-muted text-ink hover:bg-surface-inset transition"
                            >
                                {noLabel}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                autoFocus
                                className={
                                    'px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-card transition ' +
                                    (danger
                                        ? 'bg-souply-beetDeep hover:brightness-95'
                                        : 'bg-souply-beet hover:brightness-95')
                                }
                            >
                                {yesLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
