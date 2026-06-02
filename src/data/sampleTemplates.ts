/**
 * Placeholder template data for the dashboard demo. Shape matches the
 * forthcoming `/api/basket-templates/user/{userId}` payload so swapping
 * the source tomorrow is a single fetch swap, not a re-render rewrite.
 *
 * Numbers are picked to be plausible without being suspiciously round.
 * Cover swatches reuse the Souply palette so the page reads as one
 * coherent surface even before real product photography exists.
 */

export type TemplateVisibility = 'public' | 'unlisted' | 'private';

export interface SampleTemplate {
    id: number;
    name: string;
    visibility: TemplateVisibility;
    autoUpdate: boolean;
    itemCount: number;
    useCount: number;
    /** Link clicks + QR scans. Distinct from `useCount` — a visit
     *  just means the share URL was hit; `useCount` counts visits
     *  that progressed to "Skaičiuoti" + a generated shopping list. */
    visitCount: number;
    /** EUR, decimal string keeps server parity (mysql2 returns DECIMAL as string). */
    collectiveSavingsEur: string;
    /** ISO timestamps. createdAt is the "Sukurta" date; updatedAt auto-bumps
     *  on every write so it's NOT used for the edited stat. */
    createdAt: string;
    updatedAt: string;
    /** Set only on content edits (name / cover / items); null = never edited.
     *  Drives the "Sukurta → Redaguota" stat + its date. */
    editedAt: string | null;
    /** Solid cover colour — also drives the basket's left edge and
     *  bookmark icon in the consumer app, so a creator picks it once
     *  in the create-template flow and the identity carries through. */
    coverColor: string;
    /** Cover image — same `CoverImage` shape as the create-template
     *  draft: either a curated preset (rendered via
     *  findPreset(iconKey).emoji) or a custom emoji glyph from the
     *  EmojiPicker. No image-upload variant. */
    coverImage:
        | { kind: 'preset'; iconKey: string }
        | { kind: 'emoji'; emoji: string };
    /** Emoji vibe — placeholder until cover photography exists. */
    emoji: string;
}

const days = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const sampleTemplates: SampleTemplate[] = [
    {
        id: 1, name: 'Sveiki pusryčiai savaitei', visibility: 'public', autoUpdate: true,
        itemCount: 14, useCount: 1284, visitCount: 4815, collectiveSavingsEur: '732.50',
        createdAt: days(20), updatedAt: days(2), editedAt: days(2), coverColor: '#EB6784',
        coverImage: { kind: 'preset', iconKey: 'apple' }, emoji: '🥣',
    },
    {
        id: 2, name: 'Vegetariška savaitė', visibility: 'public', autoUpdate: false,
        itemCount: 22, useCount: 643, visitCount: 2104, collectiveSavingsEur: '418.10',
        createdAt: days(5), updatedAt: days(5), editedAt: null, coverColor: '#4FAE52',
        coverImage: { kind: 'preset', iconKey: 'salad' }, emoji: '🥗',
    },
    {
        id: 3, name: 'Šventinis stalas dviem', visibility: 'unlisted', autoUpdate: false,
        itemCount: 31, useCount: 198, visitCount: 612, collectiveSavingsEur: '294.00',
        createdAt: days(30), updatedAt: days(11), editedAt: days(11), coverColor: '#F0AE3F',
        coverImage: { kind: 'preset', iconKey: 'avocado' }, emoji: '🥂',
    },
    {
        id: 4, name: 'Sporto savaitė — 4 treniruotės', visibility: 'public', autoUpdate: true,
        itemCount: 18, useCount: 421, visitCount: 1487, collectiveSavingsEur: '187.40',
        createdAt: days(8), updatedAt: days(1), editedAt: days(1), coverColor: '#5571E1',
        coverImage: { kind: 'preset', iconKey: 'protein' }, emoji: '🏋️',
    },
    {
        id: 5, name: 'Krepšelis studentui', visibility: 'public', autoUpdate: false,
        itemCount: 12, useCount: 902, visitCount: 3104, collectiveSavingsEur: '512.80',
        createdAt: days(7), updatedAt: days(7), editedAt: null, coverColor: '#A65EE0',
        coverImage: { kind: 'preset', iconKey: 'smoothie' }, emoji: '🎓',
    },
    {
        id: 6, name: 'Vakaras prie ekrano', visibility: 'private', autoUpdate: false,
        itemCount: 9,  useCount: 0,   visitCount: 0,    collectiveSavingsEur: '0.00',
        createdAt: days(0), updatedAt: days(0), editedAt: null, coverColor: '#1F1B1D',
        coverImage: { kind: 'preset', iconKey: 'apple' }, emoji: '🍿',
    },
];

/** Deterministic cover colour + image + emoji for a server-side
 *  template id. Used so a fetched template always looks the same
 *  across reloads without the API needing to ship cover artwork
 *  yet. Swap with real cover images once the dashboard supports
 *  template-level art. */
export function sampleCoverFor(id: number): Pick<SampleTemplate, 'coverColor' | 'coverImage' | 'emoji'> {
    const palette = sampleTemplates;
    const idx = Math.abs(id) % palette.length;
    return {
        coverColor: palette[idx].coverColor,
        coverImage: palette[idx].coverImage,
        emoji:      palette[idx].emoji,
    };
}

export const sampleProfile = {
    name: 'Mantas Misiūnas',
    handle: 'mantasm',
    avatarUrl: null as string | null,
    stats: {
        templates: sampleTemplates.length,
        uses: sampleTemplates.reduce((s, t) => s + t.useCount, 0),
        savingsEur: sampleTemplates.reduce((s, t) => s + Number(t.collectiveSavingsEur), 0).toFixed(2),
        followers: 1842,
    },
};
