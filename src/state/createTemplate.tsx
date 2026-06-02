import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ProductRow } from '@/lib/products';
import { createTemplate as apiCreateTemplate, patchTemplate as apiPatchTemplate, patchTemplateItem, deleteTemplateItem } from '@/lib/templates';
import { DEFAULT_COVER_COLOR } from '@/lib/coverColors';
import { DEFAULT_PRESET_KEY } from '@/data/coverPresets';
import { resolveCanonicalStep, resolveDisplayUnit } from '@/lib/canonicalStep';

/** Cover image is either a curated preset (deterministic; rendered
 *  by `findPreset(iconKey).emoji`) or a custom emoji glyph picked by
 *  the creator from the EmojiPicker grid. No file-upload path —
 *  emojis carry no licensing baggage, scale to any screen, render
 *  with zero MinIO load, and look identical across surfaces. */
export type CoverImage =
    | { kind: 'preset'; iconKey: string }
    | { kind: 'emoji'; emoji: string };

export const DEFAULT_COVER_IMAGE: CoverImage = { kind: 'preset', iconKey: DEFAULT_PRESET_KEY };

/** Visibility surfaced in the create-flow + open-view sliders. The
 *  binary choice maps to the server's three-valued `visibility` column
 *  (`unlisted` is a legacy state we don't expose here — anything ≠
 *  `public` is treated as private when deciding whether to show share
 *  affordances). */
export type DraftVisibility = 'private' | 'public';

/** Shape used to seed the draft when entering edit or duplicate. */
export interface DraftSeed {
    name: string;
    coverColor: string;
    coverImage: CoverImage;
    items: DraftItem[];
    visibility: DraftVisibility;
    /** The template's real server-side visibility (3-state). Lets save()
     *  preserve `unlisted` when the creator doesn't touch the public
     *  toggle. Defaults to `visibility` when omitted (fresh create/dup). */
    originalVisibility?: 'private' | 'unlisted' | 'public';
    /** Pass the existing template id when seeding for Redaguoti so
     *  the save call PATCHes instead of inserting a new row. */
    editingId: number | null;
}

/**
 * Cross-screen state for the "Naujas šablonas" flow. Lives at App
 * level so the CreateTemplateView (pink area) and TemplateBuilderRail
 * (white panel) share one source of truth — adding a product on the
 * left updates the items list on the right without prop drilling or
 * pub/sub gymnastics.
 *
 * Decision: keep template name + items in plain React state rather
 * than persisting drafts to localStorage. A creator who clicks Cancel
 * almost certainly wants a clean slate; auto-recovery surprises more
 * often than it helps for this flow.
 */
export interface DraftItem {
    productId: number;
    name: string;
    imageUrl: string | null;
    /** Quantity in canonical units (kg, l, vnt, pak, rit). +/− buttons
     *  step by `canonicalStep`; the modal supplies the initial value
     *  for weighable + ranged products. */
    quantity: number;
    /** Canonical display unit shown next to the qty in the rail and
     *  on the QuantityControl pill ("0.5 kg", "1 vnt"). Resolved from
     *  the product's canonicalUnit / unit pair at add-time. */
    unit: string | null;
    /** Step the +/− buttons should walk by. Stored on the item so the
     *  rail's stepper can find it without re-resolving from a Product
     *  row we no longer have on hand. */
    step: number;
    /** Server-side BasketTemplateItem.id. Present when the row was
     *  seeded from listTemplateItems() OR when a brand-new add has
     *  round-tripped through POST. Used by the Atverti edit flow to
     *  PATCH / DELETE the row when the creator adjusts amounts in
     *  the rail. Undefined for items that haven't been persisted yet
     *  (the post is in flight). */
    itemId?: number;
}

interface State {
    /** Mode flag — App watches this to swap surfaces. */
    active: boolean;
    name: string;
    items: DraftItem[];
    /** Hex string. Drives the create surface's top bar AND, after save,
     *  the saved template's cover band + the basket's left edge /
     *  bookmark icon in the consumer app. Defaults to brand pink so
     *  the flow opens "Souply-coloured" out of the box. */
    coverColor: string;
    /** Either a preset icon (rendered on coverColor bg) or an uploaded
     *  photo. Drives the rail's avatar, the dashboard card's cover
     *  circle, the basket bookmark in the consumer app, and the
     *  basket-instance icon shown to anyone who reuses this template. */
    coverImage: CoverImage;
    /** Defaults to 'private'. Drives whether the dashboard card and
     *  the open-view rail surface the Share affordance, and whether
     *  the ShareModal renders an active or muted QR / link. */
    visibility: DraftVisibility;
    /** When non-null we're editing an existing template — `save()` will
     *  PATCH against this id instead of POSTing a new row. Duplicate
     *  flow keeps this null so it creates a fresh row from the seed. */
    editingId: number | null;
    saving: boolean;
    error: string | null;
    /** Start the flow with a clean draft. */
    open: () => void;
    /** Start the flow seeded from another template. `editingId` is
     *  set when the caller wants the save to update an existing row
     *  (Redaguoti); leave null for duplicate (Dubliuoti) where save
     *  inserts a fresh template carrying the seeded items. */
    openWithDraft: (draft: DraftSeed) => void;
    /** Tear down + clear state. */
    cancel: () => void;
    setName: (name: string) => void;
    setCoverColor: (hex: string) => void;
    setCoverImage: (img: CoverImage) => void;
    setVisibility: (v: DraftVisibility) => void;
    /** Replace the entire items list. Used by the Atverti edit flow
     *  after fetching the template's items from the server — keeps
     *  the rail's display synced with what was persisted. */
    setItems: (items: DraftItem[]) => void;
    /** Patch a single item by productId. Used to backfill the
     *  server-side itemId once the POST that created the row returns,
     *  so subsequent PATCH / DELETE calls in the rail know which row
     *  to target. */
    setItemServerId: (productId: number, itemId: number) => void;
    /** Add a product. No-op if already present (we just bump its
     *  quantity by one canonical step instead so users don't
     *  accidentally clutter the list by mashing the + button). When
     *  `initialQty` is omitted the product's canonical step is used —
     *  pass an explicit value when adding from the AmountPickerModal. */
    addProduct: (p: ProductRow, initialQty?: number) => void;
    setQuantity: (productId: number, q: number) => void;
    /** +/- helpers used by the product cards in the create-template
     *  surface (mirror basket-app's QuantityControl wiring). */
    increment: (productId: number) => void;
    decrement: (productId: number) => void;
    removeItem: (productId: number) => void;
    /** Persist the draft to souply-api and clear local state. Returns
     *  the created template id on success so the dashboard can refresh
     *  and optionally focus the new card. */
    save: (userId: string) => Promise<number | null>;
}

const Ctx = createContext<State | null>(null);

export function CreateTemplateProvider({ children }: { children: ReactNode }) {
    const [active, setActive] = useState(false);
    const [name, setNameState] = useState('');
    const [items, setItems] = useState<DraftItem[]>([]);
    const [coverColor, setCoverColorState] = useState<string>(DEFAULT_COVER_COLOR);
    const [coverImage, setCoverImageState] = useState<CoverImage>(DEFAULT_COVER_IMAGE);
    const [visibility, setVisibilityState] = useState<DraftVisibility>('private');
    // The template's true server-side visibility when editing. The slider is
    // binary (private/public), but a template can be `unlisted` (shared by
    // link). We preserve that on save unless the creator actually flips the
    // public toggle — otherwise editing an unlisted template would silently
    // downgrade it to private and kill its live share link.
    const [originalVisibility, setOriginalVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const open = useCallback(() => {
        setActive(true);
        setNameState('');
        setItems([]);
        setCoverColorState(DEFAULT_COVER_COLOR);
        setCoverImageState(DEFAULT_COVER_IMAGE);
        setVisibilityState('private');
        setOriginalVisibility('private');
        setEditingId(null);
        setError(null);
    }, []);

    const openWithDraft = useCallback((draft: DraftSeed) => {
        setActive(true);
        setNameState(draft.name);
        setItems(draft.items);
        setCoverColorState(draft.coverColor);
        setCoverImageState(draft.coverImage);
        setVisibilityState(draft.visibility);
        setOriginalVisibility(draft.originalVisibility ?? draft.visibility);
        setEditingId(draft.editingId);
        setError(null);
    }, []);

    const cancel = useCallback(() => {
        setActive(false);
        setNameState('');
        setItems([]);
        setCoverColorState(DEFAULT_COVER_COLOR);
        setCoverImageState(DEFAULT_COVER_IMAGE);
        setVisibilityState('private');
        setOriginalVisibility('private');
        setEditingId(null);
        setError(null);
        setSaving(false);
    }, []);

    const setName = useCallback((n: string) => setNameState(n), []);
    const setCoverColor = useCallback((hex: string) => setCoverColorState(hex), []);
    const setCoverImage = useCallback((img: CoverImage) => setCoverImageState(img), []);
    const setVisibility = useCallback((v: DraftVisibility) => setVisibilityState(v), []);
    const setItemsAction = useCallback((next: DraftItem[]) => setItems(next), []);
    const setItemServerId = useCallback((productId: number, itemId: number) => {
        setItems((prev) => prev.map((it) =>
            it.productId === productId ? { ...it, itemId } : it,
        ));
    }, []);

    const addProduct = useCallback((p: ProductRow, initialQty?: number) => {
        const step = resolveCanonicalStep(p);
        const unit = resolveDisplayUnit(p) || null;
        // Default add-quantity = one canonical step. Same rule the
        // mobile app uses in app/browse/[categoryId].tsx → onAdd().
        const qty = initialQty && initialQty > 0 ? roundToStep(initialQty, step) : step;
        setItems((prev) => {
            const existing = prev.find((it) => it.productId === p.id);
            if (existing) {
                // Re-tap on an already-added product bumps it by one
                // step; this is the desktop equivalent of the mobile
                // "tap again → +1 pack". The user can also use the +
                // button on the QuantityControl.
                return prev.map((it) =>
                    it.productId === p.id
                        ? { ...it, quantity: roundToStep(it.quantity + step, step) }
                        : it,
                );
            }
            const imageUrl =
                Array.isArray(p.imageUrls) ? (p.imageUrls.find(Boolean) as string | undefined) ?? null
                : typeof p.imageUrls === 'string'
                    ? (() => { try { return (JSON.parse(p.imageUrls) as string[])[0] ?? null; } catch { return null; } })()
                    : null;
            return [
                ...prev,
                { productId: p.id, name: p.name, imageUrl, quantity: qty, unit, step },
            ];
        });
    }, []);

    const setQuantity = useCallback((productId: number, q: number) => {
        setItems((prev) =>
            prev.flatMap((it) => {
                if (it.productId !== productId) return [it];
                const next = roundToStep(Math.max(0, q), it.step);
                return next <= 0 ? [] : [{ ...it, quantity: next }];
            }),
        );
    }, []);

    /* The next three actions optimistically update local state AND
     * fire the matching server call when both editingId and the
     * item's persisted itemId are set (Atverti edit flow). Same
     * pattern the mobile basket-app uses when editing a draft.
     *
     * Side-effects live inside the setItems updater so they see the
     * authoritative `prev` snapshot — no risk of a fresh closure
     * over a stale items array when the user clicks the stepper
     * faster than React can re-render. StrictMode dev-mode will
     * double-invoke the updater, doubling the PATCH/DELETE: those
     * calls are idempotent on the server side so a duplicate is
     * harmless beyond a wasted network round-trip.
     */
    const increment = useCallback((productId: number) => {
        setItems((prev) =>
            prev.map((it) => {
                if (it.productId !== productId) return it;
                const next = roundToStep(it.quantity + it.step, it.step);
                if (editingId !== null && it.itemId !== undefined) {
                    patchTemplateItem(editingId, it.itemId, { quantity: next }).catch(() => {});
                }
                return { ...it, quantity: next };
            }),
        );
    }, [editingId]);

    const decrement = useCallback((productId: number) => {
        setItems((prev) =>
            prev.flatMap((it) => {
                if (it.productId !== productId) return [it];
                const next = roundToStep(it.quantity - it.step, it.step);
                if (next <= 0) {
                    if (editingId !== null && it.itemId !== undefined) {
                        deleteTemplateItem(editingId, it.itemId).catch(() => {});
                    }
                    return [];
                }
                if (editingId !== null && it.itemId !== undefined) {
                    patchTemplateItem(editingId, it.itemId, { quantity: next }).catch(() => {});
                }
                return [{ ...it, quantity: next }];
            }),
        );
    }, [editingId]);

    const removeItem = useCallback((productId: number) => {
        setItems((prev) =>
            prev.flatMap((it) => {
                if (it.productId !== productId) return [it];
                if (editingId !== null && it.itemId !== undefined) {
                    deleteTemplateItem(editingId, it.itemId).catch(() => {});
                }
                return [];
            }),
        );
    }, [editingId]);

    const save = useCallback(async (userId: string): Promise<number | null> => {
        if (!name.trim() || items.length === 0) {
            setError('Reikia pavadinimo ir bent vienos prekės.');
            return null;
        }
        setSaving(true);
        setError(null);
        try {
            // Edit mode: PATCH the metadata only. Item-list sync via
            // dedicated item endpoints is the follow-up — for tonight
            // we cover name updates so Redaguoti round-trips cleanly.
            // Duplicate / fresh-create both fall through to the POST
            // branch since their `editingId` is null.
            // Preserve `unlisted`: only send a visibility change when the
            // creator actually flipped the public toggle. If the toggle's
            // public-ness matches the original, keep the server's true
            // value (so an unlisted/shared template stays unlisted).
            const wasPublic = originalVisibility === 'public';
            const isPublic = visibility === 'public';
            const targetVisibility: 'private' | 'unlisted' | 'public' =
                isPublic === wasPublic ? originalVisibility : (isPublic ? 'public' : 'private');

            if (editingId != null) {
                // Publish-wall errors (401 auth-required / 412 username-required)
                // now surface as real save errors — OAuth is live, so a failed
                // publish must NOT be silently treated as success.
                await apiPatchTemplate(editingId, {
                    name: name.trim(),
                    visibility: targetVisibility,
                    coverColor,
                    coverImage,
                });
                cancel();
                return editingId;
            }
            const result = await apiCreateTemplate({
                userId,
                name: name.trim(),
                visibility: targetVisibility,
                coverColor,
                coverImage,
                items: items.map((it, i) => ({
                    productId: it.productId,
                    quantity: it.quantity,
                    unit: it.unit,
                    sortOrder: i,
                })),
            });
            cancel();
            return result.id;
        } catch (err) {
            setError((err as Error).message ?? 'Nepavyko išsaugoti.');
            setSaving(false);
            return null;
        }
    }, [name, items, visibility, originalVisibility, coverColor, coverImage, editingId, cancel]);

    const value = useMemo<State>(
        () => ({ active, name, items, coverColor, coverImage, visibility, editingId, saving, error, open, openWithDraft, cancel, setName, setCoverColor, setCoverImage, setVisibility, setItems: setItemsAction, setItemServerId, addProduct, setQuantity, increment, decrement, removeItem, save }),
        [active, name, items, coverColor, coverImage, visibility, editingId, saving, error, open, openWithDraft, cancel, setName, setCoverColor, setCoverImage, setVisibility, setItemsAction, setItemServerId, addProduct, setQuantity, increment, decrement, removeItem, save],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCreateTemplate(): State {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useCreateTemplate must be used inside <CreateTemplateProvider>');
    return ctx;
}

/** Snap a quantity to the nearest multiple of step and round away
 *  the IEEE-754 noise that accumulates from successive 0.1 additions
 *  (0.1 + 0.1 + 0.1 = 0.30000000000000004 → "0.3"). */
function roundToStep(value: number, step: number): number {
    if (!Number.isFinite(value) || value <= 0 || step <= 0) return 0;
    const snapped = Math.round(value / step) * step;
    return Math.round(snapped * 1000) / 1000;
}
