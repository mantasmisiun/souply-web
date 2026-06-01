import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Minus, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/state/auth';
import { useCreateTemplate } from '@/state/createTemplate';
import { useTemplates } from '@/state/templates';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { CoverPicturePicker } from './CoverPicturePicker';
import { VisibilitySlider } from './VisibilitySlider';
import { setCoverOverride } from '@/lib/coverOverrides';

interface Props {
    /** Called after a successful save so App can swap surfaces back
     *  to the dashboard and the grid can refetch. */
    onSaved: () => void;
    /** Optional cancel override. Default behaviour calls the
     *  createTemplate state's cancel() which tears down the draft —
     *  appropriate for the create flow. The Atverti edit flow passes
     *  a no-op-to-state handler that just flips the open view back
     *  to Peržiūra, leaving the seeded draft (and itemId references)
     *  intact so re-entering Redaguoti doesn't refetch. */
    onCancel?: () => void;
}

/**
 * Replaces the dashboard rail while the create-template flow is
 * active. Three sections:
 *   1. Header — back + lang switcher (keeps the language pill in the
 *      same screen slot so users don't lose it)
 *   2. Name input + items list (the actual draft)
 *   3. Footer — cancel + save
 *
 * Items stream into this rail as the creator taps products in the
 * pink area. Quantity is editable per row; remove pulls it out of
 * the draft entirely.
 */
/** "0.5", "1", "2.345" — strips trailing zeros, clamps at 3
 *  decimals so the qty pill stays readable for both vnt + kg flows. */
function formatQty(n: number): string {
    if (!Number.isFinite(n)) return '0';
    if (Number.isInteger(n)) return String(n);
    return Number(n.toFixed(3)).toString();
}

export function TemplateBuilderRail({ onSaved, onCancel }: Props) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { refresh } = useTemplates();
    const {
        name, items, saving, error,
        coverColor, coverImage, setCoverImage,
        visibility, setVisibility,
        setName, increment, decrement, removeItem,
        cancel, save,
    } = useCreateTemplate();
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = useCallback(async () => {
        if (!user?.id) return;
        setSubmitting(true);
        const id = await save(user.id);
        setSubmitting(false);
        if (id !== null) {
            // Persist the chosen cover (colour + emoji) so the dashboard
            // card paints what the creator picked — without this the card
            // falls back to the deterministic sampleCoverFor(id) "random"
            // colour. Mirrors the Atverti edit flow's save.
            // TODO(api): drop once BasketTemplate carries cover columns.
            setCoverOverride(id, { coverColor, coverImage });
            await refresh();
            onSaved();
        }
    }, [user?.id, save, refresh, onSaved, coverColor, coverImage]);

    const canSave = name.trim().length > 0 && items.length > 0 && !submitting && !saving;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full p-7 md:p-8 gap-5"
        >
            <header className="flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={onCancel ?? cancel}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition"
                >
                    <ArrowLeft size={16} />
                    {t('dashboard.templates.createCancel')}
                </button>
                <div className="flex items-center gap-1.5">
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Cover picture + name. The picture circle sits beside
                the name field so the creator sees the template's
                identity in the same place they're naming it — same
                spatial slot the dashboard card uses for cover + title. */}
            <div className="flex items-end gap-3">
                <CoverPicturePicker
                    value={coverImage}
                    onChange={setCoverImage}
                    bgColor={coverColor}
                    hideLabel
                />
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-1">
                        {t('dashboard.templates.createNameLabel')}
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('dashboard.templates.createNamePlaceholder')}
                        maxLength={100}
                        autoFocus
                        className="w-full px-3.5 py-2.5 text-base font-semibold rounded-xl bg-surface-muted ring-1 ring-white/10 placeholder:text-ink-faint text-ink focus:outline-none focus:ring-2 focus:ring-souply-beet/60 transition"
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">
                        {t('dashboard.templates.createItemsHeading')}
                    </h3>
                    {items.length > 0 && (
                        <span className="text-xs font-semibold text-ink-soft nums">
                            {items.length}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2">
                    <AnimatePresence initial={false} mode="popLayout">
                        {items.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-4 rounded-2xl border-2 border-dashed border-white/10 text-xs text-ink-soft text-center leading-relaxed"
                            >
                                {t('dashboard.templates.createItemsEmpty')}
                            </motion.div>
                        ) : (
                            <motion.ul layout className="space-y-1.5">
                                {items.map((it) => (
                                    <motion.li
                                        key={it.productId}
                                        layout
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 8, transition: { duration: 0.18 } }}
                                        className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-muted ring-1 ring-white/5"
                                    >
                                        <div className="size-10 rounded-lg bg-surface-subtle grid place-items-center overflow-hidden shrink-0">
                                            {it.imageUrl ? (
                                                <img src={it.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                /* Beetroot fallback — same mascot as
                                                 * basket-app's ProductImage so a
                                                 * picture-less row never looks like
                                                 * a missing asset. */
                                                <span className="text-lg opacity-50">🫜</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-ink leading-tight line-clamp-2">
                                                {it.name}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => decrement(it.productId)}
                                                aria-label="−"
                                                className="size-6 grid place-items-center rounded-md bg-surface text-ink-soft hover:text-ink ring-1 ring-white/10"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            {/* Quantity + unit. Weighable rows
                                                step by 0.1 kg via the state's
                                                canonical-step logic so the
                                                display reads "0.5 kg" etc. */}
                                            <span className="text-xs font-bold text-ink nums min-w-[2.25ch] text-center">
                                                {formatQty(it.quantity)}
                                                {it.unit && (
                                                    <span className="ml-0.5 font-semibold text-ink-soft">
                                                        {it.unit}
                                                    </span>
                                                )}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => increment(it.productId)}
                                                aria-label="+"
                                                className="size-6 grid place-items-center rounded-md bg-surface text-ink-soft hover:text-ink ring-1 ring-white/10"
                                            >
                                                <Plus size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(it.productId)}
                                                aria-label={t('dashboard.templates.createRemoveLabel')}
                                                className="size-6 grid place-items-center rounded-md text-ink-soft hover:bg-beetTint hover:text-beetTint-strong ml-0.5"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {error && (
                <div className="text-xs text-beetTint-strong bg-beetTint rounded-lg p-2.5">
                    {error}
                </div>
            )}

            {/* Visibility slider — defaults to Privatus on a fresh
                draft. Sits right above Save so the creator's last
                decision is "who can see this" before they commit.
                Public templates surface the Share button on the
                dashboard card; private templates hide it. */}
            <VisibilitySlider value={visibility} onChange={setVisibility} />

            <button
                type="button"
                onClick={onSubmit}
                disabled={!canSave}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:bg-beetTint-strong transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-souply-beet"
            >
                {submitting || saving
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Save size={16} />}
                {t('dashboard.templates.createSave')}
            </button>
        </motion.div>
    );
}
