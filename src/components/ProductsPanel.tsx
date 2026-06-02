import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCreateTemplate } from '@/state/createTemplate';
import { listSubcategories, type Category } from '@/lib/categories';
import { listProductsByL2, listDiscountedProducts, DISCOUNTS_L2_ID, type ProductRow as ProductRowData } from '@/lib/products';
import { ProductRow } from './ProductRow';
import { ProductGridSkeleton } from './ProductCardSkeleton';
import { cx } from '@/lib/cx';

interface Props {
    /** Currently-selected L2 — null means show the "pick a category" empty
     *  state on the right column. */
    l2: Category | null;
    /** Tap-handler for a product card. Parent decides whether to add
     *  immediately (single-pack, non-weighable) or open the amount
     *  picker modal (range or weighable). */
    onAddRequest: (p: ProductRowData) => void;
}

/**
 * Right column inside the create-template surface. Shows:
 *   1. Friendly empty state when no L2 is picked.
 *   2. A horizontal L3 chip strip (filters) above the product grid
 *      once an L2 is selected. "All" is the default and reflects the
 *      full set returned by /all-products-with-amounts.
 *   3. The filtered products list — uses the same ProductRow as the
 *      search results so add behavior is identical.
 *
 * Products fetched once per L2 selection (no refetch when toggling
 * L3 chips, which filter client-side by `categoryId`). The mobile
 * basket-app uses the same approach in app/browse/[categoryId].tsx.
 */
export function ProductsPanel({ l2, onAddRequest }: Props) {
    const { t } = useTranslation();
    const { items, increment, decrement } = useCreateTemplate();

    const [products, setProducts] = useState<ProductRowData[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [l3, setL3] = useState<Category[]>([]);
    const [selectedL3, setSelectedL3] = useState<number | null>(null);
    /** Tracks the last L2 id we've reset state for. Lets us detect a
     *  prop change DURING render and flip into the loading branch in
     *  the same commit as the L2 tap — otherwise React batches the
     *  loading flip into the post-fetch render and the skeleton
     *  barely flashes (or doesn't show at all on cached fetches). */
    const [trackedL2Id, setTrackedL2Id] = useState<number | null | undefined>(undefined);

    if ((l2?.id ?? null) !== trackedL2Id) {
        // React 18's officially-supported "set state during render"
        // pattern — synchronous, runs before the commit, so the very
        // first paint with the new l2 is already on the skeleton.
        setTrackedL2Id(l2?.id ?? null);
        setSelectedL3(null);
        setProducts([]);
        setL3([]);
        setProductsLoading(l2 != null);
    }

    useEffect(() => {
        if (!l2) return;
        let cancelled = false;
        // Nuolaidos shortcut: one flat list of discounted products, no L3
        // chips (discounts span every category, so subcategory filters
        // don't apply).
        if (l2.id === DISCOUNTS_L2_ID) {
            listDiscountedProducts()
                .catch(() => [])
                .then((prods) => {
                    if (cancelled) return;
                    setProducts(Array.isArray(prods) ? prods : []);
                    setL3([]);
                })
                .finally(() => { if (!cancelled) setProductsLoading(false); });
            return () => { cancelled = true; };
        }
        Promise.all([
            listProductsByL2(l2.id).catch(() => []),
            listSubcategories(l2.id).catch(() => []),
        ]).then(([prods, subs]) => {
            if (cancelled) return;
            setProducts(Array.isArray(prods) ? prods : []);
            setL3(Array.isArray(subs) ? subs : []);
        }).finally(() => {
            if (!cancelled) setProductsLoading(false);
        });
        return () => { cancelled = true; };
    }, [l2]);

    const qtyByProductId = useMemo(() => {
        const m: Record<number, number> = {};
        for (const it of items) m[it.productId] = it.quantity;
        return m;
    }, [items]);

    // Filter products client-side by selected L3 chip. The server
    // returns rows from L3 children too via /all-products-with-amounts,
    // so each row carries `categoryId` we can match against. When no
    // chip is selected we show everything.
    const filtered = useMemo(() => {
        if (selectedL3 == null) return products;
        return products.filter((p) => p.categoryId === selectedL3);
    }, [products, selectedL3]);

    if (!l2) {
        return (
            <div className="h-full flex items-center justify-center text-center px-8">
                <div className="max-w-xs text-ink-soft">
                    <div className="text-3xl mb-3">🛍️</div>
                    <div className="text-sm leading-relaxed">
                        Pasirink kategoriją kairėje, kad pamatytum prekes.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* L3 chips strip — bottom border doubles as the scroll's
                top clip line. We drop the bottom margin so the scroll
                container's top edge sits flush against the border;
                cards scrolling up disappear exactly at the separator
                instead of leaving a sliver of pink page peeking
                between border and first row. */}
            {l3.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-3 border-b border-edge">
                    <ChipBtn
                        active={selectedL3 === null}
                        onClick={() => setSelectedL3(null)}
                    >
                        Visos
                    </ChipBtn>
                    {l3.map((c) => (
                        <ChipBtn
                            key={c.id}
                            active={selectedL3 === c.id}
                            onClick={() => setSelectedL3(c.id)}
                        >
                            {c.name}
                        </ChipBtn>
                    ))}
                </div>
            )}

            {/* Products grid — pb-10 keeps the last row from touching
                the viewport edge as it scrolls into view; the scroll
                container itself extends to the viewport bottom (the
                parent body's pb is zero on the create surface), so
                the bottom clip line is the screen edge. */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 pt-3 pb-10">
                <AnimatePresence mode="wait">
                    {productsLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <ProductGridSkeleton />
                        </motion.div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-8 px-1 text-sm text-ink-soft"
                        >
                            {t('dashboard.templates.createSearchNoResults')}
                        </motion.div>
                    ) : (
                        /* Single motion.div wraps the entire grid so the
                         * transition between L2s is one cheap opacity
                         * fade — NOT 200 per-item Framer animations.
                         * Inside, the plain <ul>/<li> use the CSS
                         * card-enter keyframe for the left-slide stagger
                         * on entry. AnimatePresence mode="wait" then
                         * fades the old grid out before the skeleton
                         * mounts, so the L2-swap reads as a smooth
                         * fade-through-skeleton instead of a hard cut. */
                        <motion.div
                            key={`l2-${l2.id}-l3-${selectedL3 ?? 'all'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filtered.map((p, i) => (
                                    <li
                                        key={p.id}
                                        className="card-enter"
                                        /* CSS stagger via index var — no
                                         * per-item JS, so the entry of
                                         * 200 cards costs effectively
                                         * zero main-thread time. */
                                        style={{ ['--i' as string]: i }}
                                    >
                                        <ProductRow
                                            product={p}
                                            quantity={qtyByProductId[p.id] ?? 0}
                                            onAdd={() => onAddRequest(p)}
                                            onIncrement={() => increment(p.id)}
                                            onDecrement={() => decrement(p.id)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ChipBtn({
    children, active, onClick,
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cx(
                /* Mobile basket-app CategoryBubbles style: solid surface
                 * card with an edge ring as the inactive state, brand
                 * pink as the active state. Strong contrast against the
                 * pink page in both themes — no more translucent chips
                 * disappearing into the page. */
                'px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ring-1',
                active
                    ? 'bg-souply-beet text-white ring-souply-beet shadow-card'
                    : 'bg-surface text-ink ring-edge hover:bg-surface-muted',
            )}
        >
            {children}
        </button>
    );
}
