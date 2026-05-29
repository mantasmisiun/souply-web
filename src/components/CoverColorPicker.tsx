import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { Pipette, Check } from 'lucide-react';
import { COVER_COLOR_SWATCHES, isValidHex } from '@/lib/coverColors';
import { cx } from '@/lib/cx';

interface Props {
    value: string;
    onChange: (hex: string) => void;
}

/**
 * Cover-colour picker for the create-template top bar. Two rows of
 * affordance:
 *
 *   1. Inline swatch row — 6 curated brand colours, one tap to apply.
 *      The currently-active swatch gets a white check mark (no extra
 *      ring) because the swatches already sit on the coloured top bar
 *      and a ring would either disappear against the active swatch's
 *      own colour or fight the top bar.
 *
 *   2. Pipette button — opens a popover anchored beneath the picker
 *      containing react-colorful's `HexColorPicker` plus a hex text
 *      input so a creator can paste an exact brand colour.
 *
 * Popover dismisses on outside-click and Escape. Hex input commits
 * onBlur (and on Enter) so an in-progress edit doesn't fight the
 * colour-wheel handle for state.
 */
export function CoverColorPicker({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [hexInput, setHexInput] = useState(value);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => { setHexInput(value); }, [value]);

    // Outside-click + Escape to close. Anchored to the picker root so
    // clicking inside the popover (the wheel handle, the hex input)
    // doesn't fire the dismiss.
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const commitHex = () => {
        const next = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
        if (isValidHex(next)) onChange(next);
        else setHexInput(value);
    };

    return (
        <div ref={rootRef} className="relative flex items-center gap-1.5">
            {COVER_COLOR_SWATCHES.map((hex) => {
                const active = hex.toLowerCase() === value.toLowerCase();
                return (
                    <button
                        key={hex}
                        type="button"
                        aria-label={`Spalva ${hex}`}
                        aria-pressed={active}
                        onClick={() => onChange(hex)}
                        className={cx(
                            'size-7 rounded-full grid place-items-center transition-transform',
                            'ring-1 ring-white/20 hover:scale-110',
                            active && 'scale-110 ring-2 ring-white',
                        )}
                        style={{ backgroundColor: hex }}
                    >
                        {active && <Check size={14} className="text-white drop-shadow" strokeWidth={3} />}
                    </button>
                );
            })}

            {/* Custom hex picker */}
            <button
                type="button"
                aria-label="Pasirinkti pasirinktinę spalvą"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={cx(
                    'size-7 rounded-full grid place-items-center transition-transform',
                    'bg-white/20 ring-1 ring-white/40 hover:scale-110 hover:bg-white/30 text-white',
                    open && 'scale-110 bg-white/30',
                )}
            >
                <Pipette size={14} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="popover"
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12 } }}
                        transition={{ duration: 0.18 }}
                        /* Anchor under the pipette button; right-align so
                         * the popover never overflows the page edge on
                         * the create surface's right side. */
                        className="absolute top-full right-0 mt-3 z-30 w-[244px] p-3 rounded-2xl bg-surface text-ink ring-1 ring-edge shadow-pop"
                    >
                        {/* react-colorful uses its own CSS via the
                         *  default `react-colorful` class; we override
                         *  the inner saturation/hue widths through
                         *  the wrapper width above. */}
                        <HexColorPicker color={value} onChange={onChange} />
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-ink-soft">HEX</span>
                            <input
                                type="text"
                                value={hexInput}
                                onChange={(e) => setHexInput(e.target.value)}
                                onBlur={commitHex}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        commitHex();
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }}
                                spellCheck={false}
                                className="flex-1 px-2 py-1.5 text-xs font-mono uppercase rounded-md bg-surface-muted text-ink ring-1 ring-edge focus:ring-2 focus:ring-souply-beet/60 outline-none transition"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
