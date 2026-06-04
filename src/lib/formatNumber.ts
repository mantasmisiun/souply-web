/**
 * Locale-aware number formatting for dashboard stats, mirroring the app:
 * the decimal separator follows the active language — dot in EN, comma in LT.
 * Always pass the active i18n language (`i18n.language`); never hardcode a
 * locale, or EN users get a comma.
 */
export function formatEur(value: number | string, locale: string): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .format(Number.isFinite(n) ? n : 0);
}

export function formatCount(value: number | string, locale: string): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
        .format(Number.isFinite(n) ? n : 0);
}
