/**
 * Preselected swatches for the template cover band + the basket's
 * left edge / bookmark icon. Curated so any pick reads well against
 * cream surfaces in light mode and the lifted dark createWash in
 * dark mode — saturated enough to register as the template's
 * identity, never so washed-out that two adjacent templates blur
 * into each other on the dashboard grid.
 *
 * Order is the on-screen order in the swatch row: brand pink first
 * (also the default), then warm → cool. The custom-picker popover
 * lets a creator step outside this palette for a one-off colour.
 */
export const COVER_COLOR_SWATCHES = [
    '#EB6784', // brand pink — souply-beet, default
    '#D44B6C', // deep wine — souply-beetDeep
    '#F0AE3F', // amber
    '#4FAE52', // green
    '#5571E1', // blue
    '#A65EE0', // lavender
] as const;

export const DEFAULT_COVER_COLOR = COVER_COLOR_SWATCHES[0];

/** Validates a string is a 3- or 6-digit hex (with leading #). Used
 *  to guard the custom-picker input before committing to state. */
export function isValidHex(value: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}
