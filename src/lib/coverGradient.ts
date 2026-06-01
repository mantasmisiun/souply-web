/**
 * White-wash overlay for cover-coloured tops — the template-card cover
 * band and the Atverti / create page-level bar (so the look stays
 * consistent as a card morphs into the open surface).
 *
 * Painted ON TOP of the solid `coverColor` (as `background-image` over
 * `background-color`), it reads as lit from the left: full colour at the
 * left edge, fading to near-white on the right. It's a plain white
 * gradient — colour-independent — so it layers over any `coverColor`
 * without per-colour maths.
 *
 * Usage:
 *   style={{ backgroundColor: color, backgroundImage: COVER_GRADIENT_OVERLAY }}
 */
export const COVER_GRADIENT_OVERLAY =
    'linear-gradient(100deg, rgba(255,255,255,0) 26%, rgba(255,255,255,0.42) 62%, rgba(255,255,255,0.88) 100%)';
