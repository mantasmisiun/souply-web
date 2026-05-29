import { api } from './api';

/**
 * Souply category tree. The mobile app browses L1 → L2 → product list
 * (via `/api/categories/{l2Id}/all-products-with-amounts`); we mirror
 * the same shape on web so the dev pipeline + future shared logic
 * stays bit-for-bit equivalent.
 */
export interface Category {
    id: number;
    name: string;
    /** Canonical Lithuanian name — used for icon lookup on the
     *  category-icon map below. Server returns it on
     *  `/api/categories/*` endpoints alongside the localised `name`. */
    nameKey?: string;
    parentCategoryId: number | null;
}

export const listL1Categories = () =>
    api.get<Category[]>('/api/categories');

export const listSubcategories = (parentId: number) =>
    api.get<Category[]>(`/api/categories/${parentId}/subcategories`);
