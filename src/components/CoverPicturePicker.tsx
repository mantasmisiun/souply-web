import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COVER_PRESETS, findPreset } from '@/data/coverPresets';
import { EMOJI_GROUPS } from '@/data/emojiCatalog';
import type { CoverImage } from '@/state/createTemplate';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';

interface Props {
    value: CoverImage;
    onChange: (img: CoverImage) => void;
    /** Drives the bg of the preset / custom tiles + the trigger
     *  circle. The glyph itself carries no background. */
    bgColor: string;
    /** Hides the trigger label (label is normally shown next to the
     *  avatar). Set when the picker is embedded in a tight layout
     *  where the label would crowd other controls. */
    hideLabel?: boolean;
    /** Disables the popover trigger so the avatar reads as a static
     *  display. Used by the Atverti rail in Peržiūra mode — same
     *  visual position as Redaguoti, but no popover, no edits. */
    disabled?: boolean;
}

/**
 * Avatar-style picker. Click the circle → dropdown:
 *
 *   ┌──────────────┐
 *   │ ◯ ◯ ◯ ◯ ◯    │  preset row (curated 5)
 *   │ ✨ Pasirinkti │  "Custom" button — opens the emoji grid
 *   └──────────────┘
 *
 * Custom view replaces the preset grid in-place with the curated
 * food/grocery emoji catalog. Picking one writes
 * `{ kind: 'emoji', emoji }` to state; the avatar everywhere renders
 * the same glyph on the cover-coloured circle. No upload pipeline,
 * no MinIO writes — the creator's identity stays purely text.
 */
export function CoverPicturePicker({ value, onChange, bgColor, hideLabel = false, disabled = false }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [showEmojiPanel, setShowEmojiPanel] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    // Disabled trigger: snap any open popover shut so the next time
    // the picker is re-enabled it starts on the curated grid again.
    useEffect(() => {
        if (disabled && open) {
            setOpen(false);
            setShowEmojiPanel(false);
        }
    }, [disabled, open]);

    // Close on click-outside + Escape.
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) {
                setOpen(false);
                setShowEmojiPanel(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (showEmojiPanel) setShowEmojiPanel(false);
            else setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, showEmojiPanel]);

    // Reset to the preset view whenever the popover closes so the
    // creator always re-opens to the curated 5 (the "I usually pick
    // from here" muscle memory).
    useEffect(() => {
        if (!open) setShowEmojiPanel(false);
    }, [open]);

    const TriggerInner = () => {
        const glyph = value.kind === 'preset' ? findPreset(value.iconKey).emoji : value.emoji;
        return (
            <span
                className="grid place-items-center w-full h-full"
                style={{ backgroundColor: bgColor }}
            >
                <span className="text-2xl leading-none select-none" aria-hidden>
                    {glyph}
                </span>
            </span>
        );
    };

    return (
        <div ref={rootRef} className="relative flex items-center gap-3">
            <button
                type="button"
                onClick={() => { if (!disabled) setOpen((v) => !v); }}
                aria-expanded={open}
                aria-label={t('cover.changeLabel')}
                aria-disabled={disabled || undefined}
                disabled={disabled}
                className={cx(
                    'size-14 rounded-full overflow-hidden ring-2 transition-shadow shadow-card',
                    open ? 'ring-souply-beet' : (disabled ? 'ring-edge cursor-default' : 'ring-white/30 hover:ring-white/60'),
                )}
            >
                <TriggerInner />
            </button>
            {!hideLabel && (
                <div className="flex flex-col gap-0.5 leading-tight">
                    <span className="text-[10px] uppercase tracking-wider text-ink-soft">
                        {t('cover.label')}
                    </span>
                    <span className="text-xs font-semibold text-ink">
                        {t('cover.changeLabel')}
                    </span>
                </div>
            )}

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="cover-popover"
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12 } }}
                        transition={{ duration: 0.2, ease: ease.soft }}
                        className="absolute top-full left-0 mt-3 z-30 w-[320px] p-3 rounded-2xl bg-surface text-ink ring-1 ring-edge shadow-pop"
                    >
                        {showEmojiPanel ? (
                            <EmojiPanel
                                value={value}
                                bgColor={bgColor}
                                onPick={(emoji) => {
                                    onChange({ kind: 'emoji', emoji });
                                    setShowEmojiPanel(false);
                                    setOpen(false);
                                }}
                                onBack={() => setShowEmojiPanel(false)}
                            />
                        ) : (
                            <PresetPanel
                                value={value}
                                bgColor={bgColor}
                                onPickPreset={(iconKey) => {
                                    onChange({ kind: 'preset', iconKey });
                                    setOpen(false);
                                }}
                                onOpenCustom={() => setShowEmojiPanel(true)}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PresetPanel({
    value, bgColor, onPickPreset, onOpenCustom,
}: {
    value: CoverImage;
    bgColor: string;
    onPickPreset: (iconKey: string) => void;
    onOpenCustom: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div>
            <div className="grid grid-cols-3 gap-2">
                {COVER_PRESETS.map((p) => {
                    const active = value.kind === 'preset' && value.iconKey === p.iconKey;
                    return (
                        <button
                            key={p.iconKey}
                            type="button"
                            onClick={() => onPickPreset(p.iconKey)}
                            aria-label={t(p.labelKey)}
                            aria-pressed={active}
                            className={cx(
                                'aspect-square rounded-2xl grid place-items-center transition-transform hover:scale-105',
                                'ring-2',
                                active ? 'ring-souply-beet' : 'ring-transparent',
                            )}
                            style={{ backgroundColor: bgColor }}
                        >
                            <span className="text-2xl leading-none select-none" aria-hidden>
                                {p.emoji}
                            </span>
                        </button>
                    );
                })}
                {/* Sixth tile: Custom — opens the curated emoji grid */}
                <button
                    type="button"
                    onClick={onOpenCustom}
                    aria-label={t('cover.customAction')}
                    aria-pressed={value.kind === 'emoji'}
                    className={cx(
                        'aspect-square rounded-2xl grid place-items-center transition-transform hover:scale-105',
                        'ring-2 bg-surface-muted text-ink-soft hover:bg-surface-inset',
                        value.kind === 'emoji' ? 'ring-souply-beet text-ink' : 'ring-edge',
                    )}
                >
                    <Sparkles size={20} />
                </button>
            </div>
            <div className="mt-3 text-[11px] text-ink-soft leading-snug">
                {t('cover.presetHint')}
            </div>
        </div>
    );
}

function EmojiPanel({
    value, bgColor, onPick, onBack,
}: {
    value: CoverImage;
    bgColor: string;
    onPick: (emoji: string) => void;
    onBack: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label={t('cover.back')}
                    className="size-6 grid place-items-center rounded-md text-ink-soft hover:text-ink hover:bg-surface-muted transition"
                >
                    <ArrowLeft size={14} />
                </button>
                <span className="text-[11px] uppercase tracking-wider text-ink-soft">
                    {t('cover.customAction')}
                </span>
            </div>
            <div className="max-h-[280px] overflow-y-auto pr-1 -mr-1 space-y-3">
                {EMOJI_GROUPS.map((g) => (
                    <section key={g.labelKey}>
                        <h4 className="text-[10px] uppercase tracking-wider text-ink-soft mb-1.5 px-1">
                            {t(g.labelKey)}
                        </h4>
                        <ul className="grid grid-cols-6 gap-1.5">
                            {g.emojis.map((emoji) => {
                                const active = value.kind === 'emoji' && value.emoji === emoji;
                                return (
                                    <li key={emoji}>
                                        <button
                                            type="button"
                                            onClick={() => onPick(emoji)}
                                            aria-label={emoji}
                                            aria-pressed={active}
                                            className={cx(
                                                'aspect-square w-full rounded-lg grid place-items-center transition-transform hover:scale-110 ring-2',
                                                active ? 'ring-souply-beet' : 'ring-transparent',
                                            )}
                                            style={{ backgroundColor: bgColor }}
                                        >
                                            <span className="text-lg leading-none select-none" aria-hidden>
                                                {emoji}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
