/**
 * Mirrors basket-app/utils/formatCurrency.ts → formatAmountStr.
 * Converts g→kg / ml→l when ≥ 1000, appends " (sveriamas)" for
 * weighable rows. Used in the basket/template-detail surfaces where
 * a single qty is displayed for a single product. Returns null when
 * we don't have enough to format (no amount or no unit) so callers
 * can omit the line cleanly.
 */
export function formatAmountStr(
    amount: number | string | null | undefined,
    unit: string | null | undefined,
    isWeighable?: boolean,
): string | null {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? null);
    if (num == null || Number.isNaN(num) || !unit) return null;
    let str: string;
    if (unit === 'g'  && num >= 1000) str = `${num / 1000} kg`;
    else if (unit === 'ml' && num >= 1000) str = `${num / 1000} l`;
    else                                   str = `${num} ${unit}`;
    if (isWeighable) str += ' (sveriamas)';
    return str;
}

/**
 * Browse / search card amount line. Mirrors the inline `amountText`
 * formatter in basket-app/app/browse/[categoryId].tsx — shows a
 * range ("500 g - 1 kg") when minAmount ≠ maxAmount, and a single
 * value otherwise. Does NOT append "(sveriamas)" because the
 * browse card surface already implies that via the AmountPicker
 * modal — the label there belongs only to the basket-row display
 * where the user has already committed an amount.
 *
 * `canonicalUnit` decides whether we cross over to `l/ml` (when
 * canonical is `l`) or stay in the default `kg/g` scale.
 */
export function formatBrowseAmount(p: {
    minAmount: number | null;
    maxAmount: number | null;
    canonicalUnit?: string | null;
}): string | null {
    const mn = p.minAmount;
    const mx = p.maxAmount;
    if (mn == null || mx == null) return null;
    const bigUnit   = p.canonicalUnit === 'l' ? 'l'  : 'kg';
    const smallUnit = p.canonicalUnit === 'l' ? 'ml' : 'g';
    const fmt = (v: number) => v >= 1000 ? `${v / 1000} ${bigUnit}` : `${v} ${smallUnit}`;
    const minN = Number(mn);
    const maxN = Number(mx);
    if (!Number.isFinite(minN) || !Number.isFinite(maxN)) return null;
    return minN === maxN ? fmt(minN) : `${fmt(minN)} - ${fmt(maxN)}`;
}
