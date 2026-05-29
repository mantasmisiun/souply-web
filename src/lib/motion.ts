import type { Transition } from 'framer-motion';

/**
 * Shared motion presets. Keeping easing + durations in one place keeps
 * every animation in the app on the same "feel" budget — no jitter
 * between, say, the band slide and the card stagger because someone
 * picked a different cubic-bezier.
 */
export const ease = {
    /** Soft material-style ease used by Tailwind's `ease-in-out`. */
    soft: [0.16, 1, 0.3, 1] as [number, number, number, number],
    /** Bouncy enough to feel alive without the wobble that breaks
     *  perceived weight (great for cards entering). */
    pop: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

export const dur = {
    quick: 0.32,
    base: 0.5,
    band: 0.9,
    page: 0.7,
};

export const t = {
    soft: { duration: dur.base, ease: ease.soft } satisfies Transition,
    band: { duration: dur.band, ease: ease.soft } satisfies Transition,
    pop: { duration: dur.quick, ease: ease.pop } satisfies Transition,
};
