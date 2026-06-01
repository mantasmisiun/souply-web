import { sampleCoverFor } from '@/data/sampleTemplates';
import { getCoverOverride } from '@/lib/coverOverrides';
import type { SampleTemplate } from '@/data/sampleTemplates';
import type { BasketTemplate } from '@/lib/templates';

/**
 * Map a server `BasketTemplate` row to the `SampleTemplate` shape the
 * dashboard cards + Atverti view render. Extracted from DashboardGrid so
 * the URL-sync hook can resolve a `?t=:id` deep-link to the same object
 * the grid would have opened.
 *
 * Cover colour/emoji come from the deterministic `sampleCoverFor(id)`
 * unless the creator picked their own — the localStorage override wins
 * until souply-api stores cover as real columns (see lib/coverOverrides).
 */
export function toCardData(row: BasketTemplate): SampleTemplate {
    const cover = sampleCoverFor(row.id);
    const override = getCoverOverride(row.id);
    return {
        id: row.id,
        name: row.name,
        visibility: row.visibility,
        autoUpdate: row.autoUpdate === 1,
        itemCount: row.itemCount,
        useCount: row.useCount,
        // TODO(api): backfill visitCount from the share-redirect / QR-scan
        // counter once souply-api ships the aggregator. Anonymous rows
        // show 0 for now; the stats card explainer covers what's tracked.
        visitCount: 0,
        collectiveSavingsEur: row.collectiveSavingsEur,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        coverColor: override?.coverColor ?? cover.coverColor,
        coverImage: override?.coverImage ?? cover.coverImage,
        emoji: cover.emoji,
    };
}
