/**
 * Mirrors basket-app/utils/canonicalStep.ts so the web template flow
 * snaps quantities to the same packs the mobile app does. The server
 * (basket-api / souply-api) attaches `canonicalUnit` / `canonicalStep`
 * / `canonicalFamily` to every Product row from browse / search /
 * detail endpoints — when present we use them verbatim so the UI
 * stays consistent with the basket-calc service's pack math.
 *
 * Legacy fallback: pre-canonical rows (cached responses, ancient
 * clients, Products with no SPs) get g→kg / ml→l mapping and step
 * 0.1 for weighable/kg/l, 1 otherwise.
 */
export interface ProductCanonical {
    canonicalUnit?: string | null;
    canonicalStep?: number | null;
    canonicalFamily?: 'fluid' | 'count' | null;
    /** Different endpoints name this field differently — accept both. */
    isWeighable?: boolean;
    hasWeighable?: boolean | number;
    unit?: string | null;
}

export function resolveDisplayUnit(p: ProductCanonical): string {
    if (p.canonicalUnit) return p.canonicalUnit;
    const u = p.unit;
    if (u === 'g')  return 'kg';
    if (u === 'ml') return 'l';
    return u ?? '';
}

export function resolveCanonicalStep(p: ProductCanonical): number {
    if (p.canonicalStep && p.canonicalStep > 0) return p.canonicalStep;
    const isWeighable = !!(p.isWeighable ?? p.hasWeighable);
    const displayUnit = resolveDisplayUnit(p);
    if (isWeighable || displayUnit === 'kg' || displayUnit === 'l') return 0.1;
    return 1;
}

/**
 * Round a free-form numeric input UP to the next valid step multiple
 * ≥ step. Used by the picker on confirm so a user can't request a
 * quantity that wouldn't correspond to a whole pack.
 */
export function snapUpToStep(value: number, step: number): number {
    if (!Number.isFinite(value) || value <= 0) return step;
    const snapped = Math.max(step, Math.ceil(value / step) * step);
    return Math.round(snapped * 1000) / 1000;
}

/** Should this product open the AmountPickerModal on tap?
 *  Mirrors the mobile rule: a true range (min ≠ max) OR a weighable
 *  product. Single-pack non-weighables get added directly with their
 *  canonical step as the initial qty. */
export function needsAmountPicker(p: ProductCanonical & { minAmount: number | null; maxAmount: number | null }): boolean {
    const hasRange = p.minAmount !== null && p.maxAmount !== null && p.minAmount !== p.maxAmount;
    return hasRange || !!(p.isWeighable ?? p.hasWeighable);
}
