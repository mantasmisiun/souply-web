/**
 * Local override map for per-template cover identity (colour + emoji
 * preset OR uploaded image). Lives in localStorage so the creator's
 * choices survive a reload — the souply-api templates row doesn't
 * carry `coverColor` or `coverImage` columns yet, so until the
 * server-side schema lands we paint these on top of `sampleCoverFor`
 * in DashboardGrid.toCardData.
 *
 * TODO(api): drop this file the moment the API ships
 * `BasketTemplate.coverColor` + `BasketTemplate.coverImageKey` +
 * `BasketTemplate.coverPresetIconKey` and the templates list endpoint
 * returns them. Callers reading getCoverOverride(id) will just see
 * undefined and fall through to the server values.
 */
import type { CoverImage } from '@/state/createTemplate';

const STORAGE_KEY = 'souply.cover-overrides.v1';

interface Override {
    coverColor?: string;
    coverImage?: CoverImage;
}

type Map = Record<number, Override>;

function readMap(): Map {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed as Map : {};
    } catch {
        return {};
    }
}

function writeMap(m: Map): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
    } catch { /* quota or private mode — silent */ }
}

export function getCoverOverride(templateId: number): Override | undefined {
    return readMap()[templateId];
}

export function setCoverOverride(templateId: number, next: Override): void {
    const m = readMap();
    m[templateId] = { ...m[templateId], ...next };
    writeMap(m);
}
