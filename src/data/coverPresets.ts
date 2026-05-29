/**
 * Preset cover-image options offered before the creator uploads
 * their own. We render each as the bare emoji glyph on top of the
 * current coverColor — no background of its own, no PNG bundling,
 * no licensing — so the avatar always reads as part of the
 * template's identity and bundle size stays unchanged.
 *
 * Five spots: two healthy/dietitian, one influencer, one sports
 * diet, one general grocery — covers the personas souply targets
 * (recipe writer, dietitian, social-media creator, sports diet
 * planner). The 6th tile in the picker is reserved for "upload
 * your own".
 *
 * iconKey is the wire identifier persisted on BasketTemplate. If
 * you rename one, add a fallback in findPreset so older rows still
 * render something sensible.
 */
export interface CoverPreset {
    iconKey: string;
    /** The emoji glyph itself. Rendered as text so it carries no
     *  background — the colored cover circle behind it shows
     *  through everywhere outside the emoji's own pixels. */
    emoji: string;
    labelKey: string;
}

export const COVER_PRESETS: CoverPreset[] = [
    { iconKey: 'salad',    emoji: '🥗', labelKey: 'cover.preset.salad' },
    { iconKey: 'avocado',  emoji: '🥑', labelKey: 'cover.preset.avocado' },
    { iconKey: 'protein',  emoji: '🥩', labelKey: 'cover.preset.protein' },
    { iconKey: 'apple',    emoji: '🍎', labelKey: 'cover.preset.apple' },
    { iconKey: 'smoothie', emoji: '🥤', labelKey: 'cover.preset.smoothie' },
];

export const DEFAULT_PRESET_KEY = 'salad';

/** Look up a preset by its persisted iconKey; falls back to the
 *  default so a row with a stale key still renders something
 *  instead of an empty circle. */
export function findPreset(iconKey: string): CoverPreset {
    return COVER_PRESETS.find((p) => p.iconKey === iconKey) ?? COVER_PRESETS[0];
}
