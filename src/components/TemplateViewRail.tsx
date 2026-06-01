import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Minus, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/state/auth';
import { useTemplateView } from '@/state/templateView';
import { useCreateTemplate, type DraftItem, type DraftVisibility, type CoverImage } from '@/state/createTemplate';
import { useTemplates } from '@/state/templates';
import { CoverPicturePicker } from './CoverPicturePicker';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { VisibilitySlider } from './VisibilitySlider';
import { setCoverOverride } from '@/lib/coverOverrides';
import { cx } from '@/lib/cx';

/**
 * Unified Atverti rail — same component for both Peržiūra and
 * Redaguoti. Switching tabs no longer remounts the rail, so:
 *
 *   - the items list keeps its rows (no spinner replay)
 *   - the cover + name + visibility stay where the creator left them
 *   - layout is stable — only individual controls re-render as
 *     read-only ↔ editable
 *
 * Structure (top → bottom):
 *
 *   Header        — back button (closes the view) + theme + lang.
 *   Cover + name  — CoverPicturePicker (disabled in Peržiūra) +
 *                   text input (read-only in Peržiūra).
 *   Tab switcher  — Peržiūra / Redaguoti, always visible so the
 *                   creator can flip back from edit mode without
 *                   losing context.
 *   Items list    — read-only in Peržiūra; +/- + 🗑 in Redaguoti.
 *   Error banner  — surfaces save errors when present.
 *   Visibility    — slider, editable in both modes (server-side
 *                   publish wall handled in createTemplate.save()).
 *   Save button   — disabled when there are no metadata changes;
 *                   on click it PATCHes name + visibility and
 *                   closes the view so the surface morphs back
 *                   into its dashboard card via layoutId.
 */
export function TemplateViewRail() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { refresh } = useTemplates();
    const { viewing, tab, setTab, close, itemsLoading } = useTemplateView();
    const {
        name, items, coverColor, coverImage, visibility,
        setName, setCoverImage, setVisibility,
        increment, decrement, removeItem,
        save, saving, error,
    } = useCreateTemplate();

    const isEdit = tab === 'edit';

    // Baselines for dirty tracking. Snapshotted whenever a new
    // template opens (templateView.open seeds createTemplate first,
    // so by the time this effect runs the state reflects the source
    // values).
    const [seededName, setSeededName] = useState<string>('');
    const [seededVisibility, setSeededVisibility] = useState<DraftVisibility>('private');
    const [seededCoverColor, setSeededCoverColor] = useState<string>('');
    const [seededCoverImage, setSeededCoverImage] = useState<CoverImage | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!viewing) return;
        setSeededName(viewing.name);
        setSeededVisibility(viewing.visibility === 'public' ? 'public' : 'private');
        // Cover baselines so a colour/emoji change flips the Save button
        // to enabled — templateView.open seeds createTemplate from these
        // same values, so on open current === seeded (not dirty).
        setSeededCoverColor(viewing.coverColor);
        setSeededCoverImage(viewing.coverImage);
    }, [viewing?.id]);

    const coverDirty =
        coverColor !== seededCoverColor ||
        JSON.stringify(coverImage) !== JSON.stringify(seededCoverImage);
    const dirty = name !== seededName || visibility !== seededVisibility || coverDirty;
    const canSave = dirty && !submitting && !saving;

    const onSubmit = useCallback(async () => {
        if (!user?.id || !viewing) return;
        // Persist the cover choices BEFORE save tears down the local
        // createTemplate state. The dashboard card reads this on the
        // next render and paints what the creator picked, not the
        // deterministic sample colour. TODO(api): drop once
        // BasketTemplate carries coverColor + coverImageKey.
        if (viewing.id > 0) {
            setCoverOverride(viewing.id, { coverColor, coverImage });
        }
        setSubmitting(true);
        const id = await save(user.id);
        setSubmitting(false);
        if (id !== null) {
            await refresh();
            close();
        }
    }, [user?.id, viewing, coverColor, coverImage, save, refresh, close]);

    if (!viewing) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full p-7 md:p-8 gap-5"
        >
            <header className="flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={close}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition"
                >
                    <ArrowLeft size={16} />
                    {/* Label reflects WHAT the click does: when nothing
                        has changed there's nothing to undo, so it
                        reads "Atgal" / "Back". The moment the creator
                        starts editing it flips to "Atšaukti" / "Cancel"
                        to signal the pending changes will be dropped.
                        Either way the click runs close() which morphs
                        the surface back into its dashboard card
                        without persisting metadata edits. */}
                    {dirty ? t('dashboard.templates.cancel') : t('dashboard.templates.back')}
                </button>
                <div className="flex items-center gap-1.5">
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Cover picker + name field. Both controls stay mounted
                across tab changes — the picker just disables its
                popover in Peržiūra and the input flips to read-only.
                That's what makes "switching tabs doesn't reload"
                actually true. */}
            <div className="flex items-end gap-3">
                <CoverPicturePicker
                    value={coverImage}
                    onChange={setCoverImage}
                    bgColor={coverColor}
                    hideLabel
                    disabled={!isEdit}
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
                        readOnly={!isEdit}
                        className={cx(
                            'w-full px-3.5 py-2.5 text-base font-semibold rounded-xl bg-surface-muted ring-1 ring-edge placeholder:text-ink-faint text-ink transition',
                            isEdit
                                ? 'focus:outline-none focus:ring-2 focus:ring-souply-beet/60'
                                : 'cursor-default',
                        )}
                    />
                </div>
            </div>

            {/* Tab switcher — always visible. Sliding pill follows
                the LanguageSwitcher's pattern: `left-1` anchors the
                capsule 4 px inside the container's padding, width is
                exactly half the track (minus the 4 px container pad),
                and translating by `translate-x-full` slides it
                precisely under the second button. The earlier
                `translate(calc(100% + 4px))` overshot by 4 px and
                made the pill bleed past the container's right edge. */}
            <div className="relative w-full inline-flex rounded-xl bg-surface-muted p-1 ring-1 ring-edge">
                <span
                    aria-hidden
                    className={cx(
                        'absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-souply-beet shadow-card transition-transform duration-300 ease-out',
                        tab === 'edit' ? 'translate-x-full' : 'translate-x-0',
                    )}
                />
                <button
                    type="button"
                    onClick={() => setTab('preview')}
                    aria-pressed={tab === 'preview'}
                    className={cx(
                        'relative z-10 flex-1 text-center text-[13px] font-semibold py-1.5 transition-colors',
                        tab === 'preview' ? 'text-white' : 'text-ink-soft hover:text-ink',
                    )}
                >
                    {t('dashboard.templates.tabPreview')}
                </button>
                <button
                    type="button"
                    onClick={() => setTab('edit')}
                    aria-pressed={tab === 'edit'}
                    className={cx(
                        'relative z-10 flex-1 text-center text-[13px] font-semibold py-1.5 transition-colors',
                        tab === 'edit' ? 'text-white' : 'text-ink-soft hover:text-ink',
                    )}
                >
                    {t('dashboard.templates.action.edit')}
                </button>
            </div>

            {/* Items list. Same rows in both modes — just the
                trailing controls swap between a static qty + unit
                pill and the editable stepper + trash. AnimatePresence
                inside the row handles the swap so the row itself
                doesn't unmount. */}
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
                        {itemsLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid place-items-center py-10 text-souply-beet"
                            >
                                <Loader2 className="animate-spin" size={20} />
                            </motion.div>
                        ) : items.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-4 rounded-2xl border-2 border-dashed border-edge text-xs text-ink-soft text-center leading-relaxed"
                            >
                                {t('dashboard.templates.createItemsEmpty')}
                            </motion.div>
                        ) : (
                            <motion.ul layout className="space-y-1.5">
                                {items.map((it) => (
                                    <ItemRow
                                        key={it.productId}
                                        item={it}
                                        editable={isEdit}
                                        onIncrement={() => increment(it.productId)}
                                        onDecrement={() => decrement(it.productId)}
                                        onRemove={() => removeItem(it.productId)}
                                        removeLabel={t('dashboard.templates.createRemoveLabel')}
                                    />
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

            <VisibilitySlider value={visibility} onChange={setVisibility} />

            <button
                type="button"
                onClick={onSubmit}
                disabled={!canSave}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:brightness-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
            >
                {submitting || saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {canSave
                    ? t('dashboard.templates.createSave')
                    : t('dashboard.templates.viewNoChanges')}
            </button>
        </motion.div>
    );
}

function ItemRow({
    item, editable, onIncrement, onDecrement, onRemove, removeLabel,
}: {
    item: DraftItem;
    editable: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
    onRemove: () => void;
    removeLabel: string;
}) {
    return (
        <motion.li
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8, transition: { duration: 0.18 } }}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-muted ring-1 ring-white/5"
        >
            <div className="size-10 rounded-lg bg-surface-subtle grid place-items-center overflow-hidden shrink-0">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <span className="text-lg opacity-50">🫜</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-ink leading-tight line-clamp-2">
                    {item.name}
                </div>
            </div>
            {editable ? (
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={onDecrement}
                        aria-label="−"
                        className="size-6 grid place-items-center rounded-md bg-surface text-ink-soft hover:text-ink ring-1 ring-edge"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold text-ink nums min-w-[2.25ch] text-center">
                        {formatQty(item.quantity)}
                        {item.unit && (
                            <span className="ml-0.5 font-semibold text-ink-soft">
                                {item.unit}
                            </span>
                        )}
                    </span>
                    <button
                        type="button"
                        onClick={onIncrement}
                        aria-label="+"
                        className="size-6 grid place-items-center rounded-md bg-surface text-ink-soft hover:text-ink ring-1 ring-edge"
                    >
                        <Plus size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label={removeLabel}
                        className="size-6 grid place-items-center rounded-md text-ink-soft hover:bg-beetTint hover:text-beetTint-strong ml-0.5"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            ) : (
                /* Read-only qty pill — same brand-pink outline as the
                 * editable QuantityControl so the rail's visual
                 * rhythm doesn't change between modes. Just no
                 * buttons, just the number + unit in the centre. */
                <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg ring-2 ring-souply-beet/40 bg-surface text-souply-beet shrink-0">
                    <span className="text-xs font-bold nums">
                        {formatQty(item.quantity)}
                    </span>
                    {item.unit && (
                        <span className="ml-0.5 text-[11px] font-semibold opacity-80">
                            {item.unit}
                        </span>
                    )}
                </div>
            )}
        </motion.li>
    );
}

function formatQty(n: number): string {
    if (!Number.isFinite(n)) return '0';
    if (Number.isInteger(n)) return String(n);
    return Number(n.toFixed(3)).toString();
}
