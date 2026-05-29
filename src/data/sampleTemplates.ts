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
    /** EUR, decimal string keeps server parity (mysql2 returns DECIMAL as string). */
    collectiveSavingsEur: string;
    /** ISO timestamp; relative-time helper formats it for the card. */
    updatedAt: string;
    /** Two-color gradient stops for the card's cover strip. */
    cover: [string, string];
    /** Emoji vibe — placeholder until cover photography exists. */
    emoji: string;
}

const days = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const sampleTemplates: SampleTemplate[] = [
    {
        id: 1, name: 'Sveiki pusryčiai savaitei', visibility: 'public', autoUpdate: true,
        itemCount: 14, useCount: 1284, collectiveSavingsEur: '732.50',
        updatedAt: days(2), cover: ['#FDE7ED', '#EB6784'], emoji: '🥣',
    },
    {
        id: 2, name: 'Vegetariška savaitė', visibility: 'public', autoUpdate: false,
        itemCount: 22, useCount: 643, collectiveSavingsEur: '418.10',
        updatedAt: days(5), cover: ['#E6F5E6', '#4FAE52'], emoji: '🥗',
    },
    {
        id: 3, name: 'Šventinis stalas dviem', visibility: 'unlisted', autoUpdate: false,
        itemCount: 31, useCount: 198, collectiveSavingsEur: '294.00',
        updatedAt: days(11), cover: ['#FFF2D1', '#F0AE3F'], emoji: '🥂',
    },
    {
        id: 4, name: 'Sporto savaitė — 4 treniruotės', visibility: 'public', autoUpdate: true,
        itemCount: 18, useCount: 421, collectiveSavingsEur: '187.40',
        updatedAt: days(1), cover: ['#E2EAFD', '#5571E1'], emoji: '🏋️',
    },
    {
        id: 5, name: 'Krepšelis studentui', visibility: 'public', autoUpdate: false,
        itemCount: 12, useCount: 902, collectiveSavingsEur: '512.80',
        updatedAt: days(7), cover: ['#F4E8FB', '#A65EE0'], emoji: '🎓',
    },
    {
        id: 6, name: 'Vakaras prie ekrano', visibility: 'private', autoUpdate: false,
        itemCount: 9,  useCount: 0,   collectiveSavingsEur: '0.00',
        updatedAt: days(0), cover: ['#1F1B1D', '#5B5358'], emoji: '🍿',
    },
];

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
