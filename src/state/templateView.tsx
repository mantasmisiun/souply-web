import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SampleTemplate } from '@/data/sampleTemplates';
import { listTemplateItems } from '@/lib/templates';
import { useCreateTemplate, type DraftItem, type DraftVisibility } from './createTemplate';

/**
 * "Atverti" surface state. App-level so the open view can morph from
 * the card position via `layoutId="template-${id}"`.
 *
 * Seeding lives here (not on the rail) so that flipping between
 * Peržiūra ↔ Redaguoti, which unmounts / remounts the rail
 * component, never cancels the in-flight items fetch and never
 * resets the items list. The state of the open template is
 * effectively a singleton from the moment the creator taps Atverti
 * until they close the view.
 */
export type TemplateViewTab = 'preview' | 'edit';

interface State {
    viewing: SampleTemplate | null;
    tab: TemplateViewTab;
    /** True from open() until the initial items fetch resolves. The
     *  rail subscribes to this for its spinner so empty templates
     *  don't render "loading" forever after the fetch returns
     *  zero rows. */
    itemsLoading: boolean;
    open: (t: SampleTemplate) => void;
    close: () => void;
    setTab: (tab: TemplateViewTab) => void;
}

const Ctx = createContext<State | null>(null);

export function TemplateViewProvider({ children }: { children: ReactNode }) {
    const [viewing, setViewing] = useState<SampleTemplate | null>(null);
    const [tab, setTab] = useState<TemplateViewTab>('preview');
    const [itemsLoading, setItemsLoading] = useState(false);
    const { openWithDraft, setItems, cancel } = useCreateTemplate();

    const open = useCallback((t: SampleTemplate) => {
        setViewing(t);
        setTab('preview');
        const startVis: DraftVisibility = t.visibility === 'public' ? 'public' : 'private';
        openWithDraft({
            name: t.name,
            coverColor: t.coverColor,
            coverImage: t.coverImage,
            items: [],
            visibility: startVis,
            // Carry the real 3-state visibility so save() can preserve
            // `unlisted` (shared-by-link) rather than coercing it to private.
            originalVisibility: t.visibility,
            editingId: t.id,
        });
        if (t.id <= 0) {
            setItemsLoading(false);
            return;
        }
        setItemsLoading(true);
        listTemplateItems(t.id)
            .then((rows) => {
                const draftItems: DraftItem[] = rows.map((it) => {
                    // The stored `unit` column is usually null, so derive the
                    // display unit + stepper from the server-derived isWeighable
                    // (matching the app: kg / 0.1 step vs vnt. / 1 step).
                    const weighable = !!it.isWeighable;
                    return {
                        productId: it.productId,
                        name: it.name,
                        imageUrl: extractImage(it.imageUrls),
                        quantity: typeof it.quantity === 'string' ? Number(it.quantity) || 1 : it.quantity,
                        unit: it.unit ?? (weighable ? 'kg' : 'vnt.'),
                        step: weighable || it.unit === 'kg' || it.unit === 'l' ? 0.1 : 1,
                        itemId: it.id,
                    };
                });
                setItems(draftItems);
            })
            .catch(() => { /* swallow — empty-state surfaces the failure */ })
            .finally(() => setItemsLoading(false));
    }, [openWithDraft, setItems]);

    const close = useCallback(() => {
        cancel();
        setViewing(null);
    }, [cancel]);

    const value = useMemo<State>(
        () => ({ viewing, tab, itemsLoading, open, close, setTab }),
        [viewing, tab, itemsLoading, open, close],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTemplateView(): State {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useTemplateView must be used inside <TemplateViewProvider>');
    return ctx;
}

function extractImage(raw: unknown): string | null {
    if (!raw) return null;
    let arr: unknown = raw;
    if (typeof arr === 'string') {
        try { arr = JSON.parse(arr); } catch { return null; }
    }
    if (!Array.isArray(arr)) return null;
    const first = (arr as unknown[]).find((u) => typeof u === 'string' && u.length > 0);
    return typeof first === 'string' ? first : null;
}
