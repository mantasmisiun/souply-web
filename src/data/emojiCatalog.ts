/**
 * Curated food/grocery emoji catalog for the "Custom" cover picker.
 *
 * We deliberately don't ship a full emoji set (no full keyboard, no
 * `emoji-mart`) because (a) it ramps the bundle by ~150 KB for a
 * one-shot use, and (b) any template's identity is a food / grocery
 * item — letting the creator pick 💩 or 🎉 would just produce ugly
 * cards. The catalog covers the personas souply targets:
 *
 *   - dietitian (fruit, vegetables, grains)
 *   - influencer / lifestyle (trendy fruit, indulgence sweets)
 *   - sports-diet creator (protein, dairy, fitness drinks)
 *   - generalist (meals, drinks, condiments)
 *
 * Add new glyphs at the end of each group so the existing visual
 * order stays stable across releases — creators build muscle memory
 * for where their go-to emoji lives.
 */
export interface EmojiGroup {
    labelKey: string;
    emojis: string[];
}

export const EMOJI_GROUPS: EmojiGroup[] = [
    {
        labelKey: 'cover.emojiGroup.fruit',
        emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🥭', '🍑', '🍒', '🍍', '🥥', '🥝'],
    },
    {
        labelKey: 'cover.emojiGroup.veg',
        emojis: ['🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🧅', '🧄', '🍠', '🍆', '🫑'],
    },
    {
        labelKey: 'cover.emojiGroup.protein',
        emojis: ['🥚', '🥩', '🍗', '🍖', '🥓', '🐟', '🦐', '🦀', '🦞', '🥜', '🫘', '🧀'],
    },
    {
        labelKey: 'cover.emojiGroup.grain',
        emojis: ['🍞', '🥐', '🥖', '🥯', '🥨', '🧇', '🥞', '🍳', '🥣', '🍙', '🍚'],
    },
    {
        labelKey: 'cover.emojiGroup.meal',
        emojis: ['🥗', '🥘', '🍲', '🍜', '🍝', '🍱', '🍣', '🌮', '🌯', '🥙', '🍔', '🍕', '🌭', '🍟', '🥪', '🍤'],
    },
    {
        labelKey: 'cover.emojiGroup.sweet',
        emojis: ['🍰', '🧁', '🥧', '🍫', '🍩', '🍪', '🍭', '🍮', '🍯', '🍡', '🍧', '🍨', '🍦'],
    },
    {
        labelKey: 'cover.emojiGroup.drink',
        emojis: ['🥤', '🧃', '🧋', '🥛', '☕', '🍵', '🥃', '🍹', '🍸', '🍷', '🍺', '🍶', '🥂'],
    },
];
