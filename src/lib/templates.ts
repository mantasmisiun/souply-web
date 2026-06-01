import { api } from './api';

/**
 * BasketTemplate row shape returned by the souply-api templates list
 * endpoint. Mirrors `souply-app/utils/basketTemplatesApi.ts` so the
 * three clients (api, mobile, web) stay in lockstep on the wire format.
 *
 * `0 | 1` for boolean-ish columns is intentional — mysql2 returns
 * TINYINT(1) as a number, and we keep it that way so the wire format
 * matches what the DB emits without a server-side translation layer.
 */
export interface BasketTemplate {
    id: number;
    userId: string;
    name: string;
    isDefault: 0 | 1;
    autoUpdate: 0 | 1;
    visibility: 'private' | 'unlisted' | 'public';
    shareSlug: string | null;
    creatorHandle: string | null;
    sourceTemplateId: number | null;
    useCount: number;
    /** mysql2 returns DECIMAL as string — preserved end-to-end so we
     *  don't lose precision converting to Number in the API layer. */
    collectiveSavingsEur: string;
    snapshotCheapestChainId: number | null;
    snapshotTotalEur: string | null;
    snapshotRunnerUpEur: string | null;
    snapshotCalculatedAt: string | null;
    lastAutoUpdateDelta: number | null;
    lastAutoUpdateAt: string | null;
    createdAt: string;
    updatedAt: string;
    itemCount: number;
}

/** GET /api/basket-templates/user/{userId} — list owned templates,
 *  newest first. Empty array when the user has no templates yet. */
export const listTemplatesForUser = (userId: string) =>
    api.get<BasketTemplate[]>(`/api/basket-templates/user/${encodeURIComponent(userId)}`);

/** DELETE /api/basket-templates/{id}. Server returns 204 on success. */
export const deleteTemplate = (id: number) =>
    api.del<void>(`/api/basket-templates/${id}`);

export interface CreateTemplateBody {
    userId: string;
    name: string;
    autoUpdate?: boolean;
    /** Defaults server-side to 'private' if omitted. Web sends this
     *  explicitly so the creator's choice in the rail slider applies
     *  on the first INSERT — no follow-up PATCH to set visibility. */
    visibility?: 'private' | 'unlisted' | 'public';
    items?: Array<{
        productId: number;
        quantity: number;
        unit?: string | null;
        sortOrder?: number;
    }>;
}

export interface CreateTemplateResult {
    id: number;
    userId: string;
    name: string;
    itemCount: number;
}

/** POST /api/basket-templates. Creates the template + bulk-inserts the
 *  items in one round-trip so the dashboard refresh after save shows
 *  the final shape on the first request. */
export const createTemplate = (body: CreateTemplateBody) =>
    api.post<CreateTemplateResult>('/api/basket-templates', body);

export interface PatchTemplateBody {
    name?: string;
    autoUpdate?: boolean;
    visibility?: 'private' | 'unlisted' | 'public';
}

/** POST /api/basket-templates/{id}/items. Appends a single item to
 *  an existing template. Used by the Atverti Redaguoti flow so each
 *  product tap persists immediately — no "save" button required. */
export const addTemplateItem = (templateId: number, body: {
    productId: number;
    quantity: number;
    unit?: string | null;
    sortOrder?: number;
}) =>
    api.post<{ id: number; templateId: number; productId: number; quantity: number }>(
        `/api/basket-templates/${templateId}/items`,
        body,
    );

export interface TemplateItem {
    id: number;
    templateId: number;
    productId: number;
    name: string;
    quantity: string | number;
    unit: string | null;
    imageUrls?: string | (string | null)[] | null;
    sortOrder: number;
}

/** GET /api/basket-templates/{id}/items. Returns the row order via
 *  `sortOrder` so the client renders the rail in the persisted order. */
export const listTemplateItems = (templateId: number) =>
    api.get<TemplateItem[]>(`/api/basket-templates/${templateId}/items`);

/** PATCH /api/basket-templates/{templateId}/items/{itemId}. Used by
 *  the Atverti edit flow when a creator changes an existing item's
 *  quantity via the rail stepper. */
export const patchTemplateItem = (templateId: number, itemId: number, body: { quantity?: number; sortOrder?: number }) =>
    api.patch<void>(`/api/basket-templates/${templateId}/items/${itemId}`, body);

/** DELETE /api/basket-templates/{templateId}/items/{itemId}. Used by
 *  the rail's trash button on an existing item. */
export const deleteTemplateItem = (templateId: number, itemId: number) =>
    api.del<void>(`/api/basket-templates/${templateId}/items/${itemId}`);

/** PATCH /api/basket-templates/{id}. Updates the metadata fields the
 *  server accepts (name / autoUpdate / visibility). Returns 204 on
 *  success. Item-list edits go through dedicated item endpoints; for
 *  the Redaguoti flow tonight we only PATCH name so the rest of the
 *  draft fields are out of scope. */
export const patchTemplate = (id: number, body: PatchTemplateBody) =>
    api.patch<void>(`/api/basket-templates/${id}`, body);

/** Public shared-template payload returned by GET /api/t/{slug}. Shape
 *  mirrors the server's `resolveSlug`: a `template` block plus the
 *  resolved item list. Used by the read-only public /t/:slug view. */
export interface SharedTemplate {
    template: {
        id: number;
        name: string;
        creatorHandle: string | null;
        useCount: number;
        visibility: 'public' | 'unlisted' | 'private';
        cheapestChainId: number | null;
        cheapestTotalEur: number | null;
        runnerUpTotalEur: number | null;
        mostExpensiveTotalEur: number | null;
        calculatedAt: string | null;
    };
    items: Array<{
        productId: number;
        productName: string;
        quantity: number;
        unit: string | null;
        imageUrls: (string | null)[] | null;
    }>;
}

/** GET /api/t/{slug}. Public, unauthenticated — the surface a visitor
 *  lands on from a QR / share link. 404s when the slug is unknown or
 *  the template is private. */
export const getSharedTemplate = (slug: string) =>
    api.get<SharedTemplate>(`/api/t/${encodeURIComponent(slug)}`);
