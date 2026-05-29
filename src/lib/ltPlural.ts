/**
 * Lithuanian noun-plural suffix resolver — CLDR rules:
 *
 *   one   — last digit 1, except teens (11–19)  → "šablonas"
 *   few   — last digit 2–9, except teens 12–19  → "šablonai"
 *   other — everything else (0, 10–20, 100, …)  → "šablonų"
 *
 * Mirrors `souply-app/utils/ltPlural.ts`. We resolve the suffix
 * ourselves rather than leaning on i18next's plural picker because
 * Lithuanian's three-form rule depends on `Intl.PluralRules`, which
 * some runtimes ship with reduced ICU data and silently collapse to
 * one/other — leaking forms like "1 šablonų" through. Picking the
 * suffix here works regardless of runtime support.
 */
export type LtPluralSuffix = 'one' | 'few' | 'other';

export function ltPluralSuffix(count: number): LtPluralSuffix {
    const n = Math.abs(Math.trunc(count));
    const lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 19) return 'other';
    const last = n % 10;
    if (last === 1) return 'one';
    if (last >= 2 && last <= 9) return 'few';
    return 'other';
}
