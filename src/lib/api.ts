/**
 * Thin fetch wrapper for the souply-api REST endpoints. Tonight it's
 * unauthenticated (mirrors the basket-app anonymous flow) so we can prove
 * the pipeline end-to-end against `Basket-DB-Test`. When real OAuth lands,
 * the JWT goes into `Authorization: Bearer ...` here — the rest of the
 * codebase doesn't change.
 *
 * Why a hand-rolled helper rather than TanStack Query directly:
 *  - We want one place to swap base URLs (localhost dev → api.souply.lt
 *    prod) without touching every call site.
 *  - We want one place to inject the JWT header once OAuth is wired.
 *  - We want one place to surface non-2xx errors with the API's JSON
 *    error body so screens don't all reinvent the same try/catch.
 */

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
    // Plain class fields rather than constructor parameter properties so
    // we stay compatible with `erasableSyntaxOnly` (which forbids the
    // shorthand) — see tsconfig.app.json.
    status: number;
    body?: unknown;

    constructor(status: number, message: string, body?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
    const headers = new Headers(opts.headers);
    if (opts.body !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, {
        ...opts,
        headers,
        // Send/receive the httpOnly session cookie (set by /api/auth/oauth)
        // on every request so verified-only endpoints authenticate. CORS
        // on souply-api has credentials:true + an explicit origin allowlist.
        credentials: 'include',
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });

    if (res.status === 204) return undefined as T;
    const text = await res.text();
    const parsed = text ? safeJson(text) : undefined;
    if (!res.ok) {
        throw new ApiError(res.status, `${opts.method ?? 'GET'} ${path} → ${res.status}`, parsed);
    }
    return parsed as T;
}

function safeJson(text: string): unknown {
    try { return JSON.parse(text); } catch { return text; }
}

export const api = {
    get:  <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET'  }),
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'POST', body }),
    patch:<T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'PATCH', body }),
    del:  <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
};
