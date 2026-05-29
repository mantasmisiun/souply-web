import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CategoriesPanel } from './CategoriesPanel';
import { ProductsPanel } from './ProductsPanel';
import { ProductRow } from './ProductRow';
import { AmountPickerModal } from './AmountPickerModal';
import { ProductGridSkeleton } from './ProductCardSkeleton';
import { searchProducts, type ProductRow as ProductRowData } from '@/lib/products';
import { useCreateTemplate } from '@/state/createTemplate';
import { needsAmountPicker } from '@/lib/canonicalStep';
import { type Category } from '@/lib/categories';

/**
 * Shared browse + add experience used by both the create-template flow
 * and the open-template view's Redaguoti mode. Carries:
 *
 *   - the search bar (top-left in a colour-aware strip)
 *   - the two-column body (CategoriesPanel ↔ ProductsPanel/results)
 *   - the AmountPickerModal for range / weighable products
 *
 * Items added here flow through `useCreateTemplate().addProduct(...)`.
 * The caller is responsible for seeding the state appropriately
 * (fresh draft vs. seeded from an existing template).
 *
 * Layout note: this panel owns its own search bar so it can be
 * dropped directly under whatever colour band the parent supplies,
 * including no band at all. CreateTemplateView pairs it with the
 * cover-colour picker; the open-template view pairs it with a thin
 * coverColor strip that's display-only.
 */
interface Props {
    /** Optional handler fired in addition to the local addProduct
     *  update — used by the Atverti edit mode to POST the new item
     *  to the server. May return the server-side itemId so we can
     *  thread it back into DraftItem.itemId for subsequent PATCH /
     *  DELETE round-trips on the rail's stepper. Returned promise's
     *  rejection is swallowed — a transient network blip shouldn't
     *  block the optimistic update. */
    onItemAdded?: (productId: number, quantity: number, unit: string | null) =>
        | Promise<number | undefined | void>
        | number
        | undefined
        | void;
}

export function TemplateBrowsePanel({ onItemAdded }: Props = {}) {
    const { t } = useTranslation();
    const { items, addProduct, increment, decrement, setItemServerId } = useCreateTemplate();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductRowData[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedL2, setSelectedL2] = useState<Category | null>(null);
    const debounceRef = useRef<number | null>(null);
    const [pickerProduct, setPickerProduct] = useState<ProductRowData | null>(null);

    const persist = useCallback((p: ProductRowData, qty: number) => {
        if (!onItemAdded) return;
        // Fire-and-forget. The returned itemId (when the POST is the
        // first time a product hits the template) is threaded back
        // into createTemplate state so the rail's +/- and trash
        // buttons can target the right row via PATCH / DELETE.
        Promise.resolve(onItemAdded(p.id, qty, p.unit ?? null))
            .then((maybeId) => {
                if (typeof maybeId === 'number' && Number.isFinite(maybeId)) {
                    setItemServerId(p.id, maybeId);
                }
            })
            .catch(() => {});
    }, [onItemAdded, setItemServerId]);

    const onAddRequest = useCallback((p: ProductRowData) => {
        if (needsAmountPicker(p)) {
            setPickerProduct(p);
            return;
        }
        addProduct(p);
        // Mirror the canonical-step default the create-flow uses so
        // the server-side row matches what the rail now shows.
        const qty = p.canonicalStep && p.canonicalStep > 0 ? p.canonicalStep : 1;
        persist(p, qty);
    }, [addProduct, persist]);

    const onPickerConfirm = useCallback((amount: number) => {
        if (!pickerProduct) return;
        addProduct(pickerProduct, amount);
        persist(pickerProduct, amount);
        setPickerProduct(null);
    }, [pickerProduct, addProduct, persist]);

    useEffect(() => {
        const trimmed = query.trim();
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        if (trimmed.length < 2) {
            setResults([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        debounceRef.current = window.setTimeout(async () => {
            try {
                const rows = await searchProducts(trimmed);
                setResults(Array.isArray(rows) ? rows : []);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 250);
        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, [query]);

    const qtyByProductId = useMemo(() => {
        const m: Record<number, number> = {};
        for (const it of items) m[it.productId] = it.quantity;
        return m;
    }, [items]);

    const showingSearch = query.trim().length >= 2;

    return (
        <div className="relative h-full flex flex-col">
            {/* Search bar lives in its own row so a parent doesn't
                have to decide where to put it. Wrap-and-cap so the
                bar never grows past a comfortable typing width. */}
            <div className="px-7 md:px-10 pt-5 md:pt-6">
                <div className="relative max-w-md">
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
                    />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('dashboard.templates.createSearchPlaceholder')}
                        className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-surface text-ink placeholder:text-ink-soft ring-1 ring-edge focus:ring-2 focus:ring-souply-beet/60 outline-none shadow-card transition"
                    />
                    {query.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear"
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-6 grid place-items-center rounded-full text-ink-soft hover:bg-surface-muted"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Body — two columns. Left categories stay put; the right
                column renders search results or the L3+products pair. */}
            <div className="flex-1 min-h-0 grid gap-5 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[290px_minmax(0,1fr)] px-7 md:px-10 pt-5 pb-0">
                <CategoriesPanel
                    selectedL2Id={selectedL2?.id ?? null}
                    onSelectL2={(l2) => setSelectedL2(l2)}
                />

                <div className="relative min-h-0">
                    <AnimatePresence mode="wait">
                        {showingSearch ? (
                            <motion.div
                                key="search-results"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.18 }}
                                className="absolute inset-0 overflow-y-auto pr-1 -mr-1 pb-10"
                            >
                                {searching ? (
                                    <ProductGridSkeleton />
                                ) : results.length === 0 ? (
                                    <div className="py-8 px-1 text-sm text-ink-soft">
                                        {t('dashboard.templates.createSearchNoResults')}
                                    </div>
                                ) : (
                                    <ul
                                        key={`search-${query.trim()}`}
                                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                                    >
                                        {results.map((p, i) => (
                                            <li
                                                key={p.id}
                                                className="card-enter"
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
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="products-panel"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.18 }}
                                className="absolute inset-0"
                            >
                                <ProductsPanel l2={selectedL2} onAddRequest={onAddRequest} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AmountPickerModal
                open={pickerProduct !== null}
                productName={pickerProduct?.name ?? ''}
                canonicalUnit={pickerProduct?.canonicalUnit}
                canonicalStep={pickerProduct?.canonicalStep}
                canonicalFamily={pickerProduct?.canonicalFamily}
                minAmount={pickerProduct?.minAmount ?? 0}
                maxAmount={pickerProduct?.maxAmount ?? 0}
                unit={pickerProduct?.unit ?? ''}
                isWeighable={!!pickerProduct?.hasWeighable}
                onConfirm={onPickerConfirm}
                onCancel={() => setPickerProduct(null)}
            />
        </div>
    );
}
