import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ease } from '@/lib/motion';
import { resolveDisplayUnit, snapUpToStep } from '@/lib/canonicalStep';

interface Props {
    open: boolean;
    productName: string;
    /** Canonical display unit (kg/l/vnt/pak/rit) when the server has
     *  attached SP-derived metadata; otherwise we fall back to the
     *  legacy `unit` field (g/ml/vnt) and map g→kg, ml→l in the picker. */
    canonicalUnit?: string | null;
    canonicalStep?: number | null;
    canonicalFamily?: 'fluid' | 'count' | null;
    /** Legacy fallback shown in the subtitle when canonical is null. */
    minAmount: number;
    maxAmount: number;
    unit: string;
    isWeighable?: boolean;
    /** Receives the chosen amount in canonical units (kg / l / pack
     *  count). The basket calc service interprets this as the total
     *  requested — pack snapping happens server-side from there. */
    onConfirm: (amount: number) => void;
    onCancel: () => void;
}

/**
 * Web port of basket-app/components/AmountPickerModal.tsx. Same
 * picker UX so a creator filling a template feels the exact flow a
 * shopper using the basket sees — copy, canonical-step math, and
 * snap-up rounding all match. Used by the create-template flow when
 * a product is either weighable or has a true pack range (min≠max).
 */
export function AmountPickerModal({
    open,
    productName,
    canonicalUnit,
    canonicalStep,
    canonicalFamily,
    minAmount,
    maxAmount,
    unit,
    isWeighable = false,
    onConfirm,
    onCancel,
}: Props) {
    const { t, i18n } = useTranslation();

    // Resolve effective unit + step. New canonical fields win; legacy
    // props are a fallback for rows missing canonical metadata.
    const displayUnit = canonicalUnit ?? resolveDisplayUnit({ unit, isWeighable });
    const step = canonicalStep && canonicalStep > 0
        ? canonicalStep
        : (isWeighable || displayUnit === 'kg' || displayUnit === 'l' ? 0.1 : 1);
    const isFractional = step < 1 || canonicalFamily === 'fluid';

    // raw min/max ship in g/ml; convert to canonical-unit scale.
    const needsScale = (unit === 'g' || unit === 'ml') && (displayUnit === 'kg' || displayUnit === 'l');
    const scale = needsScale ? 1000 : 1;
    const displayMin = minAmount / scale;
    const displayMax = maxAmount / scale;

    const fmtAmount = useMemo(
        () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 3 }),
        [i18n.language],
    );

    const formatValue = (n: number): string => {
        if (!isFractional) return String(Math.round(n));
        return Number(n.toFixed(3)).toString();
    };

    const defaultAmount = step;
    const [inputText, setInputText] = useState(formatValue(defaultAmount));
    // Easter egg: when a creator types 50+ kg/l, we tease them once
    // with a "are you solving a math problem?" prompt before letting
    // them through. The override flag survives only the picker's
    // lifetime — sessionStorage keeps it from re-triggering elsewhere
    // in the same browser tab. After Tęsti, the cap rises to 999.
    const [showJoke, setShowJoke] = useState(false);
    const [pendingJokeAmount, setPendingJokeAmount] = useState<number | null>(null);

    useEffect(() => {
        if (open) setInputText(formatValue(defaultAmount));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, productName, step]);

    const parseInput = (): number => {
        const parsed = parseFloat(inputText.replace(',', '.'));
        return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultAmount;
    };

    const decrease = () => {
        const next = parseInput() - step;
        if (next >= step - 1e-9) {
            setInputText(formatValue(Math.round(next / step) * step));
        }
    };

    const increase = () => {
        const next = parseInput() + step;
        setInputText(formatValue(Math.round(next / step) * step));
    };

    const EASTER_EGG_KEY = 'souply.amountPicker.bigKgConfirmed';
    const isMassOrVolume = displayUnit === 'kg' || displayUnit === 'l';
    const HARD_CAP = 999;
    const JOKE_THRESHOLD = 50;

    const handleConfirm = () => {
        const raw = snapUpToStep(parseInput(), step);
        // Hard ceiling — independent of the joke gate so even a power
        // user can't add 10 000 kg of tomatoes by accident.
        const capped = Math.min(raw, HARD_CAP);
        const alreadyConfirmed = (() => {
            try { return sessionStorage.getItem(EASTER_EGG_KEY) === '1'; }
            catch { return false; }
        })();
        if (isMassOrVolume && capped >= JOKE_THRESHOLD && !alreadyConfirmed) {
            setPendingJokeAmount(capped);
            setShowJoke(true);
            return;
        }
        onConfirm(capped);
    };

    const handleJokeContinue = () => {
        try { sessionStorage.setItem(EASTER_EGG_KEY, '1'); } catch { /* private mode */ }
        const amount = pendingJokeAmount ?? snapUpToStep(parseInput(), step);
        setShowJoke(false);
        setPendingJokeAmount(null);
        onConfirm(Math.min(amount, HARD_CAP));
    };

    const handleJokeCancel = () => {
        setShowJoke(false);
        setPendingJokeAmount(null);
        // Drop the input back to a sane starting point so a quick re-tap
        // on Pridėti doesn't re-trigger the joke immediately.
        setInputText(formatValue(defaultAmount));
    };

    const subtitle = isWeighable
        ? t('amountPicker.weighable')
        : (displayMin === displayMax
            ? t('amountPicker.packages_one', { value: fmtAmount.format(displayMin), unit: displayUnit })
            : t('amountPicker.packages_other', { min: fmtAmount.format(displayMin), max: fmtAmount.format(displayMax), unit: displayUnit }));

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="amount-root"
                    className="fixed inset-0 grid place-items-center px-6"
                    style={{ zIndex: 50 }}
                >
                    <motion.div
                        key="amount-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        key="amount-dialog"
                        role="dialog"
                        aria-labelledby="amount-title"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.14 } }}
                        transition={{ duration: 0.24, ease: ease.soft }}
                        className="relative w-full max-w-sm rounded-3xl bg-surface text-ink ring-1 ring-edge shadow-pop p-6"
                    >
                        <h2 id="amount-title" className="text-base font-bold text-center mb-1">
                            {productName}
                        </h2>
                        <p className="text-[13px] text-ink-soft text-center mb-5">
                            {subtitle}
                        </p>

                        <div className="text-sm text-ink text-center mb-3">
                            {t('amountPicker.label')}
                        </div>

                        <div className="flex items-center justify-center gap-3 mb-5">
                            <button
                                type="button"
                                onClick={decrease}
                                aria-label="−"
                                className="shrink-0 size-11 rounded-full ring-2 ring-souply-beet grid place-items-center text-souply-beet hover:bg-beetTint transition"
                            >
                                <Minus size={20} strokeWidth={2.5} />
                            </button>

                            {/* Input + unit are glued together as a single
                                inline-flex group: the input sizes to its
                                content via `field-sizing: content` (cap
                                with min/max), and the unit sits flush
                                next to the digits so "0.5kg" reads as
                                one token instead of a number with a
                                far-off label. The whole group is
                                shrink-0 so neither it nor the buttons
                                can overflow the dialog padding. */}
                            <div className="shrink-0 inline-flex items-baseline gap-1 border-b-2 border-souply-beet">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    size={Math.max(2, inputText.length)}
                                    className="text-[26px] font-bold text-souply-beet text-right max-w-[5ch] py-1 bg-transparent outline-none"
                                />
                                <span className="text-base font-semibold text-ink-soft">
                                    {displayUnit}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={increase}
                                aria-label="+"
                                className="shrink-0 size-11 rounded-full ring-2 ring-souply-beet grid place-items-center text-souply-beet hover:bg-beetTint transition"
                            >
                                <Plus size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold ring-1 ring-edge text-ink-soft hover:bg-surface-muted transition"
                            >
                                {t('amountPicker.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-souply-beet text-white shadow-card hover:brightness-95 transition"
                            >
                                {t('amountPicker.add')}
                            </button>
                        </div>

                        {/* Easter-egg joke overlay — local to the dialog
                         * (not a separate portal) so backdrop dismiss on
                         * the outer modal still works while it's up.
                         * Stacks at z-10 inside the dialog so it sits
                         * on top of the picker controls. */}
                        <AnimatePresence>
                            {showJoke && (
                                <motion.div
                                    key="joke-veil"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute inset-0 grid place-items-center rounded-3xl bg-surface/95 backdrop-blur-sm p-6"
                                    style={{ zIndex: 10 }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 3, scale: 0.97 }}
                                        transition={{ duration: 0.22, ease: ease.soft }}
                                        className="w-full text-center"
                                    >
                                        <div className="text-2xl mb-2" aria-hidden>🤔</div>
                                        <h3 className="text-base font-bold text-ink mb-1.5">
                                            {t('amountPicker.jokeTitle')}
                                        </h3>
                                        <p className="text-[13px] leading-snug text-ink-soft mb-5 px-2">
                                            {t('amountPicker.jokeBody', {
                                                value: fmtAmount.format(pendingJokeAmount ?? 0),
                                                unit: displayUnit,
                                            })}
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleJokeCancel}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold ring-1 ring-edge text-ink-soft hover:bg-surface-muted transition"
                                            >
                                                {t('amountPicker.jokeCancel')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleJokeContinue}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-souply-beet text-white shadow-card hover:brightness-95 transition"
                                            >
                                                {t('amountPicker.jokeContinue')}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
