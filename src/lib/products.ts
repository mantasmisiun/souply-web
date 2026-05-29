import { api } from './api';

/**
 * Subset of the Product wire format the create-template flow needs.
 * Mirrors the basket-app's `Product` interface in
 * `app/browse/[categoryId].tsx` so screens can be lifted between the
 * two surfaces with minimal reshaping.
 *
 * `imageUrls` arrives as either an array of strings (after JSON_AGG),
 * a JSON-stringified array, or null depending on the endpoint and
 * row state — clients have to defend against all three.
 */
export interface ChainLogo {
    chainId: number;
    logoUrl: string | null;
}

export interface ProductRow {
    id: number;
    name: string;
    brandName?: string | null;
    imageUrls?: (string | null | undefined)[] | string | null;
    /** Same polymorphism story as `imageUrls`: JSON_ARRAYAGG can land
     *  as an array, a JSON string, or null depending on endpoint. */
    chainLogos?: ChainLogo[] | string | null;
    minAmount: number | null;
    maxAmount: number | null;
    unit: string | null;
    hasWeighable?: boolean | number;
    /** Server-attached canonical display fields. Always kg / l / vnt /
     *  pak / rit when present; null on cached pre-canonical rows.
     *  See basket-api/src/services/productCanonical.ts. */
    canonicalUnit?: string | null;
    canonicalStep?: number | null;
    canonicalFamily?: 'fluid' | 'count' | null;
    categoryId?: number;
    categoryName?: string | null;
}

/** GET /api/categories/{l2Id}/all-products-with-amounts.
 *  Returns the flattened product list for an L2 category (server walks
 *  its L3 children too). `mode=sku` matches what the mobile app sends
 *  on the same route. */
export const listProductsByL2 = (l2Id: number) =>
    api.get<ProductRow[]>(`/api/categories/${l2Id}/all-products-with-amounts?mode=sku`);

export const searchProducts = (query: string) =>
    api.get<ProductRow[]>(`/api/products/search?q=${encodeURIComponent(query)}`);

/** Pick the first non-null URL from the polymorphic `imageUrls` field. */
export function firstImageUrl(raw: ProductRow['imageUrls']): string | null {
    if (!raw) return null;
    let arr: unknown = raw;
    if (typeof arr === 'string') {
        try { arr = JSON.parse(arr); } catch { return null; }
    }
    if (!Array.isArray(arr)) return null;
    const first = arr.find((u) => typeof u === 'string' && u.length > 0);
    return typeof first === 'string' ? first : null;
}
