import { Minus, Plus } from 'lucide-react';

interface Props {
    quantity: number;
    onDecrement: () => void;
    onIncrement: () => void;
    /** Optional display unit appended after the quantity ("1 vnt",
     *  "0.5 kg"). Omit for the dimensionless case. */
    unit?: string | null;
}

/**
 * Web port of basket-app's QuantityControl — replaces the "Įtraukti"
 * CTA on a product card once the product has been added. Brand-pink
 * outlined pill with -/+ on the ends and the live count in the middle.
 * Sized to occupy the same slot as the original button so the card's
 * height doesn't jump when a product flips between states.
 *
 * When `unit` is supplied the middle reads "0.5 kg" instead of "0.5";
 * keeps a creator's eye on the unit they're stepping in (especially
 * for weighable products where the step is 0.1 kg).
 */
export function QuantityControl({ quantity, onDecrement, onIncrement, unit }: Props) {
    const display = formatQty(quantity);
    return (
        <div className="w-full inline-flex items-center justify-between rounded-lg ring-2 ring-souply-beet px-2.5 py-1.5 bg-surface">
            <button
                type="button"
                onClick={onDecrement}
                aria-label="Sumažinti"
                className="grid place-items-center size-6 rounded text-souply-beet hover:bg-beetTint transition-colors"
            >
                <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="text-[13px] font-bold text-souply-beet nums min-w-[2ch] text-center">
                {display}{unit ? <span className="ml-0.5 font-semibold text-souply-beet/85">{unit}</span> : null}
            </span>
            <button
                type="button"
                onClick={onIncrement}
                aria-label="Padidinti"
                className="grid place-items-center size-6 rounded text-souply-beet hover:bg-beetTint transition-colors"
            >
                <Plus size={14} strokeWidth={2.5} />
            </button>
        </div>
    );
}

/** Strip trailing zeros + clamp at 3 decimals. 0.500 → "0.5", 1.0 →
 *  "1", 2.345 → "2.345". Matches the basket-app's display rounding. */
function formatQty(n: number): string {
    if (!Number.isFinite(n)) return '0';
    if (Number.isInteger(n)) return String(n);
    return Number(n.toFixed(3)).toString();
}
