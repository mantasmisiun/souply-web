/**
 * Per-chain brand colour palette used by ChainLogoStrip when the
 * server hasn't bundled a logo image for a row. Mirrors
 * basket-app/utils/chainBrandName.ts colour table 1:1 so a missing
 * logo on web reads the same colour as the same row on mobile.
 */
const CHAIN_BRAND_COLORS_BY_ID: Record<number, string> = {
    1: '#003DA5', // Maxima / Barbora — blue
    2: '#E2001A', // Rimi — red
    3: '#1F8B3A', // Iki — green
    4: '#F28C00', // Norfa — orange
    5: '#FFD500', // Lidl — yellow
};

export function chainBrandColorById(chainId: number): string {
    return CHAIN_BRAND_COLORS_BY_ID[chainId] ?? '#9E9E9E';
}
