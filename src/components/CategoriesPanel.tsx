import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { listL1Categories, listSubcategories, type Category } from '@/lib/categories';
import { DISCOUNTS_L2_ID } from '@/lib/products';
import { cx } from '@/lib/cx';

/** Pseudo-category for the Nuolaidos shortcut — selecting it makes
 *  ProductsPanel load discounted products instead of a category. */
const DISCOUNTS_CAT: Category = { id: DISCOUNTS_L2_ID, name: 'Nuolaidos', parentCategoryId: null };

const CATEGORY_ICONS: Record<string, string> = {
    'Daržovės ir vaisiai': '🫜',
    'Pieno gaminiai, kiaušiniai ir majonezas': '🥛',
    'Duonos gaminiai ir konditerija': '🍞',
    'Mėsa, žuvis ir kulinarija': '🥩',
    'Bakalėja': '🫙',
    'Šaldytas maistas': '🧊',
    'Gėrimai': '🥤',
    'Kūdikių ir vaikų prekės': '🍼',
    'Kosmetika ir higiena': '🧴',
    'Švaros ir gyvūnų prekės': '🧹',
    'Namai ir laisvalaikis': '🏠',
};

interface Props {
    selectedL2Id: number | null;
    onSelectL2: (l2: Category, l1: Category) => void;
}

/**
 * L1 / L2 picker that mirrors the mobile basket-app CategoriesList:
 * a single rounded card per L1 that EXPANDS to reveal its L2 children
 * inside the same card body (top-divider separator, chevron-right on
 * each L2 row). The L1's left border flips from neutral to brand-pink
 * to signal "this section is open", and the expanded row gets a soft
 * wash so the open-state reads at a glance.
 *
 * Key fix vs. the previous iteration: the L2 list is structurally
 * INSIDE the L1 card (one shared rounded clip), not a separate floating
 * card below. Same visual gravity as the mobile app's Naršyti screen.
 */
export function CategoriesPanel({ selectedL2Id, onSelectL2 }: Props) {
    const [l1, setL1] = useState<Category[]>([]);
    const [l1Loading, setL1Loading] = useState(true);
    const [l2Cache, setL2Cache] = useState<Record<number, Category[]>>({});
    const [expandedL1, setExpandedL1] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        setL1Loading(true);
        listL1Categories()
            .then((rows) => { if (!cancelled) setL1(Array.isArray(rows) ? rows : []); })
            .catch(() => { if (!cancelled) setL1([]); })
            .finally(() => { if (!cancelled) setL1Loading(false); });
        return () => { cancelled = true; };
    }, []);

    const toggleL1 = useCallback(async (cat: Category) => {
        setExpandedL1((prev) => (prev === cat.id ? null : cat.id));
        if (l2Cache[cat.id]) return;
        try {
            const rows = await listSubcategories(cat.id);
            setL2Cache((prev) => ({ ...prev, [cat.id]: Array.isArray(rows) ? rows : [] }));
        } catch {
            setL2Cache((prev) => ({ ...prev, [cat.id]: [] }));
        }
    }, [l2Cache]);

    // Auto-expand the L1 that contains the currently selected L2 across
    // re-renders (e.g. if the user navigates back into the surface).
    const parentOfSelected = useMemo(() => {
        if (selectedL2Id == null) return null;
        for (const [l1Id, subs] of Object.entries(l2Cache)) {
            if (subs.some((s) => s.id === selectedL2Id)) return Number(l1Id);
        }
        return null;
    }, [selectedL2Id, l2Cache]);

    useEffect(() => {
        if (parentOfSelected != null) setExpandedL1(parentOfSelected);
    }, [parentOfSelected]);

    const discountsSelected = selectedL2Id === DISCOUNTS_L2_ID;

    return (
        <div className="h-full flex flex-col">
            {/* Nuolaidos shortcut — pinned above the category tree, mirrors
                the mobile app's discounts card. Selecting it loads the
                flat discounted-product list into the add flow. */}
            <button
                type="button"
                onClick={() => onSelectL2(DISCOUNTS_CAT, DISCOUNTS_CAT)}
                className={cx(
                    'mb-2 w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-colors',
                    'border-l-[3px] shadow-card ring-1',
                    discountsSelected
                        ? 'bg-beetTint ring-souply-beet/40 border-l-souply-beet'
                        : 'bg-surface ring-edge-subtle border-l-surface/0 hover:bg-surface-muted',
                )}
            >
                <span className="text-lg" aria-hidden>🔥</span>
                <span className="text-sm font-semibold text-ink">Nuolaidos</span>
            </button>

            {l1Loading ? (
                <div className="grid place-items-center py-10 text-souply-beet">
                    <Loader2 className="animate-spin" size={22} />
                </div>
            ) : (
                <ul className="space-y-2 overflow-y-auto pr-1 -mr-1">
                    {l1.map((cat, i) => (
                        <L1Row
                            key={cat.id}
                            index={i}
                            cat={cat}
                            expanded={expandedL1 === cat.id}
                            l2={l2Cache[cat.id] ?? null}
                            selectedL2Id={selectedL2Id}
                            onToggle={() => toggleL1(cat)}
                            onSelectL2={(l2) => onSelectL2(l2, cat)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

interface L1Props {
    cat: Category;
    /** Position in the list — drives the card-enter stagger so the
     *  first row arrives ~50 ms after mount and each subsequent row
     *  trails it by 35 ms. Capped inside the CSS keyframe at index 30
     *  so a long L1 list doesn't end with a 1-second pause. */
    index: number;
    expanded: boolean;
    l2: Category[] | null;
    selectedL2Id: number | null;
    onToggle: () => void;
    onSelectL2: (l2: Category) => void;
}

function L1Row({ cat, index, expanded, l2, selectedL2Id, onToggle, onSelectL2 }: L1Props) {
    return (
        <li
            /* Single rounded surface card per L1. `overflow-hidden`
             * + the inner top-divider on the L2 list gives the same
             * "attached drawer" feel the mobile app uses. The left
             * border indicates open state without painting the whole
             * row a different colour. */
            className={cx(
                'card-enter',
                'overflow-hidden rounded-xl bg-surface ring-1 ring-edge-subtle shadow-card transition-colors',
                'border-l-[3px]',
                expanded ? 'border-l-souply-beet' : 'border-l-surface/0',
            )}
            style={{ ['--i' as string]: index }}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className={cx(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    'text-ink hover:bg-surface-muted',
                    expanded && 'bg-accent-wash',
                )}
            >
                <span className="text-lg shrink-0">
                    {CATEGORY_ICONS[cat.nameKey ?? cat.name] || '📦'}
                </span>
                <span className="flex-1 text-[14px] font-semibold leading-tight">
                    {cat.name}
                </span>
                <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    className={expanded ? 'text-souply-beet' : 'text-ink-soft'}
                >
                    <ChevronDown size={16} />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24 }}
                        className="overflow-hidden border-t border-edge-subtle"
                    >
                        {!l2 ? (
                            <div className="py-3 px-4 text-[12px] text-ink-soft inline-flex items-center gap-2">
                                <Loader2 className="animate-spin" size={12} /> …
                            </div>
                        ) : l2.length === 0 ? (
                            <div className="py-3 px-4 text-[12px] text-ink-soft">—</div>
                        ) : (
                            <ul>
                                {l2.map((sub, i) => {
                                    const selected = selectedL2Id === sub.id;
                                    return (
                                        <li
                                            key={sub.id}
                                            className={cx(
                                                /* Per-row divider that
                                                 * leaves the icon-column
                                                 * gutter clean — mirrors
                                                 * the mobile divider
                                                 * marginLeft. */
                                                i > 0 && 'border-t border-edge-subtle/70',
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => onSelectL2(sub)}
                                                aria-current={selected ? 'true' : undefined}
                                                className={cx(
                                                    'w-full flex items-center gap-2 pl-10 pr-4 py-2.5 text-left transition-colors',
                                                    selected
                                                        ? 'bg-souply-beet text-white font-semibold'
                                                        : 'text-ink hover:bg-surface-muted',
                                                )}
                                            >
                                                <span className="flex-1 text-[13px] leading-tight">
                                                    {sub.name}
                                                </span>
                                                <ChevronRight
                                                    size={14}
                                                    className={selected ? 'text-white/80' : 'text-souply-beet'}
                                                />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    );
}
