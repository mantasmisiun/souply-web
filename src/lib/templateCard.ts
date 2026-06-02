import { sampleCoverFor } from '@/data/sampleTemplates';
import type { SampleTemplate } from '@/data/sampleTemplates';
import type { BasketTemplate } from '@/lib/templates';

/**
 * Map a server `BasketTemplate` row to the `SampleTemplate` shape the
 * dashboard cards + Atverti view render. Extracted from DashboardGrid so
 * the URL-sync hook can resolve a `?t=:id` deep-link to the same object
 * the grid would have opened.
 *
 * Cover colour/emoji are now SERVER-OWNED (`row.coverColor` /
 * `row.coverImage`); they sync across devices, reach the app, and show on
 * the public share page. We fall back to the deterministic
 * `sampleCoverFor(id)` only when a template predates the cover columns
 * (both null).
 */
export function toCardData(row: BasketTemplate): SampleTemplate {
    const cover = sampleCoverFor(row.id);
    return {
        id: row.id,
        name: row.name,
        visibility: row.visibility,
        autoUpdate: row.autoUpdate === 1,
        itemCount: row.itemCount,
        useCount: row.useCount,
        // Real visit count — incremented server-side each time the public
        // /t/:slug share page is opened.
        visitCount: row.visitCount ?? 0,
        collectiveSavingsEur: row.collectiveSavingsEur,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        editedAt: row.editedAt ?? null,
        coverColor: row.coverColor ?? cover.coverColor,
        coverImage: row.coverImage ?? cover.coverImage,
        emoji: cover.emoji,
    };
}
