/**
 * Placeholder for a product card while the L2/L3 fetch is in flight.
 * Mimics the real card's layout so the eye doesn't jump when actual
 * data lands — square image area, two text lines, bottom CTA strip.
 *
 * `animate-pulse` is Tailwind's built-in opacity flash (0.5 → 1 → 0.5
 * over 2 s). Modern skeleton pattern, GPU-cheap, and the browser can
 * pause it when the tab is backgrounded — same reasoning as the
 * card-enter keyframe used for real cards.
 */
export function ProductCardSkeleton() {
    return (
        <div className="h-full flex flex-col bg-surface rounded-xl ring-1 ring-edge-subtle shadow-card p-3 animate-pulse">
            <div className="w-full aspect-square mb-2 rounded-lg bg-surface-muted" />
            <div className="flex-1 min-w-0 mb-2.5 space-y-1.5">
                <div className="h-3 w-4/5 rounded bg-surface-muted" />
                <div className="h-3 w-3/5 rounded bg-surface-muted" />
                <div className="h-2.5 w-2/5 rounded bg-surface-muted mt-1" />
            </div>
            <div className="h-8 w-full rounded-lg bg-surface-muted" />
        </div>
    );
}

/** Grid of N skeletons in the same layout the real product grid uses,
 *  so a slow first-load reads like the data is rendering progressively
 *  rather than "nothing then everything." 8 fills a typical 4-column
 *  viewport's first two rows. */
export function ProductGridSkeleton({ count = 8 }: { count?: number } = {}) {
    return (
        <ul
            aria-busy="true"
            aria-label="Loading products"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
            {Array.from({ length: count }).map((_, i) => (
                <li key={i}>
                    <ProductCardSkeleton />
                </li>
            ))}
        </ul>
    );
}
