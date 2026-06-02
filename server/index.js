/**
 * souply-web production server.
 *
 * A bare nginx can't render share-link previews — social/iMessage/
 * Discord crawlers read the `<meta property="og:*">` tags out of the
 * INITIAL HTML and never run our JS. So this thin Express server does
 * two jobs nginx can't:
 *
 *   1. /t/:slug → fetch the shared template from souply-api and inject
 *      per-template OG/Twitter meta into index.html before sending it.
 *      Real users get the same shell (React Router hydrates and takes
 *      over); crawlers get a rich preview.
 *   2. SPA fallback — every other path serves index.html so deep links
 *      (/dashboard, /t/abc on refresh) don't 404.
 *
 * Everything else is plain static file serving with sane cache headers.
 *
 * Env:
 *   PORT              listen port (default 80; compose maps 8085→80)
 *   SSR_API_URL       server→souply-api base for the /t/:slug fetch.
 *                     Use the INTERNAL address (host IP / container) so
 *                     the prerender doesn't round-trip out through
 *                     Traefik. Default: http://192.168.1.212:3001
 *   PUBLIC_ORIGIN     canonical public origin for og:url (default test
 *                     subdomain; set to https://souply.lt in prod)
 *   OG_FALLBACK_IMAGE absolute URL of the default share image until the
 *                     dynamic per-template OG image endpoint ships
 */
import express from 'express';
import compression from 'compression';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');

const PORT = Number(process.env.PORT || 80);
const SSR_API_URL = (process.env.SSR_API_URL || 'http://192.168.1.212:3001').replace(/\/$/, '');
const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN || 'https://souply.manofoto.dpdns.org').replace(/\/$/, '');
const OG_FALLBACK_IMAGE = process.env.OG_FALLBACK_IMAGE || `${PUBLIC_ORIGIN}/og-default.png`;

// Default OG/Twitter card for every page that isn't a specific template
// (landing, dashboard, etc.). Domain-driven by PUBLIC_ORIGIN so there's
// nothing to hardcode for the souply.lt switch.
const DEFAULT_OG = {
    title: 'Souply — apsipirk išmaniai',
    description: 'Lietuvos maisto kainos vienoje vietoje — palygink kainas, sek nuolaidas, kurk pirkinių sąrašus.',
    url: PUBLIC_ORIGIN,
    image: OG_FALLBACK_IMAGE,
};

// Read the built shell once at boot. If it's missing the build step
// didn't run — fail fast rather than serve 404s for every route.
const indexHtml = readFileSync(path.join(DIST, 'index.html'), 'utf-8');

const app = express();
app.disable('x-powered-by');
app.use(compression());

/** Escape for an HTML attribute / text context. */
const esc = (s) =>
    String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

/** Inject OG/Twitter tags + override <title> in the shell HTML. */
function injectMeta(html, { title, description, url, image }) {
    const tags = [
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="Souply" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(description)}" />`,
        `<meta property="og:url" content="${esc(url)}" />`,
        `<meta property="og:image" content="${esc(image)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(title)}" />`,
        `<meta name="twitter:description" content="${esc(description)}" />`,
        `<meta name="twitter:image" content="${esc(image)}" />`,
    ].join('\n    ');
    return html
        .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
        .replace('</head>', `    ${tags}\n  </head>`);
}

// ── Share-link prerender ────────────────────────────────────────────
app.get('/t/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const r = await fetch(`${SSR_API_URL}/api/t/${encodeURIComponent(slug)}`, {
            headers: { accept: 'application/json' },
            signal: AbortSignal.timeout(4000),
        });
        if (!r.ok) throw new Error(`api ${r.status}`);
        const data = await r.json();
        const t = data.template ?? {};
        const itemCount = Array.isArray(data.items) ? data.items.length : 0;
        const handle = t.creatorHandle ? `@${t.creatorHandle}` : 'Souply';
        const title = t.name ? `${t.name} — Souply` : 'Souply';

        const savings =
            t.mostExpensiveTotalEur != null && t.cheapestTotalEur != null
                ? Math.max(0, Number(t.mostExpensiveTotalEur) - Number(t.cheapestTotalEur))
                : null;
        const desc = [`${itemCount} prekės`];
        if (savings != null && savings > 0) desc.push(`sutaupyk iki ${savings.toFixed(2)} €`);
        desc.push(`sąrašas nuo ${handle}`);

        const html = injectMeta(indexHtml, {
            title,
            description: desc.join(' · '),
            url: `${PUBLIC_ORIGIN}/t/${slug}`,
            image: OG_FALLBACK_IMAGE,
        });
        res.set('Cache-Control', 'public, max-age=300').type('html').send(html);
    } catch {
        // souply-api unreachable or slug not found → serve the plain
        // shell; the client renders its own loading / not-found state.
        res.type('html').send(indexHtml);
    }
});

// ── Apple Universal Links association ───────────────────────────────
// The AASA file is extension-less, so express.static would serve it as
// octet-stream. Apple wants JSON — serve it explicitly before static.
app.get('/.well-known/apple-app-site-association', (_req, res) => {
    res.type('application/json').sendFile(
        path.join(DIST, '.well-known', 'apple-app-site-association'),
    );
});

// ── Static assets ───────────────────────────────────────────────────
// Hashed bundles are fingerprinted → cache hard. index.html itself must
// never cache or a deploy serves a stale shell pointing at gone assets.
app.use(
    express.static(DIST, {
        index: false,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('index.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            } else if (/\.(js|css|woff2?|png|jpe?g|svg|webp|ico)$/.test(filePath)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        },
    }),
);

// ── SPA fallback ────────────────────────────────────────────────────
// Every non-template route (landing, dashboard, …) gets the default OG
// card so the homepage — the most-shared URL — previews with the brand
// image + title instead of a bare shell.
app.get('*', (_req, res) => {
    res.set('Cache-Control', 'no-cache').type('html').send(injectMeta(indexHtml, DEFAULT_OG));
});

app.listen(PORT, () => {
    console.log(`[souply-web] listening on :${PORT} — ssrApi=${SSR_API_URL} origin=${PUBLIC_ORIGIN}`);
});
