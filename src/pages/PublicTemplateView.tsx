import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, HelpCircle } from 'lucide-react';
import { getSharedTemplate, type SharedTemplate } from '@/lib/templates';
import { formatEur } from '@/lib/formatNumber';
import { findPreset } from '@/data/coverPresets';
import type { CoverImage } from '@/state/createTemplate';

/** Resolve a cover image to its emoji glyph (preset → looked-up emoji). */
function coverEmoji(image: CoverImage | null): string | null {
    if (!image) return null;
    return image.kind === 'emoji' ? image.emoji : findPreset(image.iconKey).emoji;
}

/**
 * Read-only public template view at /t/:slug — the surface a visitor
 * lands on from a QR code or share link. No band/rail; its own minimal
 * layout. The server already prerenders OG meta for this path (see
 * souply-web/server/index.js), so social previews and this live view
 * describe the same template.
 *
 * Fed by the public, unauthenticated GET /api/t/:slug. A 404 (unknown
 * slug or private template) renders the not-found state rather than the
 * app shell.
 */
function firstImage(urls: (string | null)[] | null): string | null {
    if (!Array.isArray(urls)) return null;
    return urls.find((u): u is string => typeof u === 'string' && u.length > 0) ?? null;
}

/** The app only exists on phones, so the deep-link CTA only makes sense on a
 *  mobile browser. On desktop we offer "Get Souply" → the marketing site. */
function isMobileDevice(): boolean {
    return typeof navigator !== 'undefined'
        && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function PublicTemplateView() {
    const { slug } = useParams<{ slug: string }>();
    const { t, i18n } = useTranslation();
    const [data, setData] = useState<SharedTemplate | null>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        if (!slug) { setState('error'); return; }
        let cancelled = false;
        setState('loading');
        getSharedTemplate(slug)
            .then((res) => { if (!cancelled) { setData(res); setState('ready'); } })
            .catch(() => { if (!cancelled) setState('error'); });
        return () => { cancelled = true; };
    }, [slug]);

    if (state === 'loading') {
        return (
            <div className="min-h-screen grid place-items-center bg-createWash text-souply-beet">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Loader2 className="animate-spin" size={20} /> {t('pages.publicTemplate.loading')}
                </span>
            </div>
        );
    }

    if (state === 'error' || !data) {
        return (
            <div className="min-h-screen grid place-items-center bg-createWash px-6 text-center">
                <div className="max-w-md">
                    <div className="text-4xl mb-3" aria-hidden>🛒</div>
                    <p className="text-sm text-ink-soft mb-6">{t('pages.publicTemplate.notFound')}</p>
                    <Link to="/" className="text-sm font-semibold text-souply-beet hover:underline">
                        {t('brand.name')}
                    </Link>
                </div>
            </div>
        );
    }

    // The creator turned this template private after sharing. The link still
    // resolves (not a 404) but there's nothing to act on — explain it.
    if (data.template.visibility === 'private') {
        return (
            <div className="min-h-screen grid place-items-center bg-createWash px-6 text-center">
                <div className="max-w-md">
                    <div className="text-4xl mb-3" aria-hidden>🔒</div>
                    <h1 className="text-lg font-bold mb-1">{t('pages.publicTemplate.privateTitle')}</h1>
                    <p className="text-sm text-ink-soft mb-6">{t('pages.publicTemplate.privateBody')}</p>
                    <Link to="/" className="text-sm font-semibold text-souply-beet hover:underline">
                        {t('brand.name')}
                    </Link>
                </div>
            </div>
        );
    }

    const { template, snapshot, items } = data;
    const handle = template.creatorHandle ? `@${template.creatorHandle}` : t('brand.name');
    const emoji = coverEmoji(template.coverImage);
    // "Save up to €X" — only when the template has been calculated (snapshot
    // present) and the priciest store actually costs more than the cheapest.
    const saveUpTo =
        snapshot.mostExpensiveTotalEur != null && snapshot.cheapestTotalEur != null
            ? Math.max(0, snapshot.mostExpensiveTotalEur - snapshot.cheapestTotalEur)
            : null;

    // Show a short preview of the basket — first few items, then a "+N items"
    // summary so a long list doesn't dominate the landing.
    const MAX_ITEMS = 3;
    const shownItems = items.slice(0, MAX_ITEMS);
    const overflow = items.length - shownItems.length;
    const mobile = isMobileDevice();

    return (
        <div className="min-h-screen bg-createWash text-ink">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <Link to="/" className="text-sm font-semibold text-souply-beet hover:underline">
                    {t('brand.name')}
                </Link>

                {/* Compact header: themed emoji circle on the left, template
                    name on the right with item count + creator handle under it. */}
                <header className="mt-6 flex items-center gap-4">
                    <div
                        className="size-16 rounded-2xl grid place-items-center shadow-card shrink-0"
                        style={{ backgroundColor: template.coverColor ?? '#EB6784' }}
                    >
                        {emoji && <span className="text-3xl" aria-hidden>{emoji}</span>}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold leading-tight">{template.name}</h1>
                        <p className="text-sm text-ink-soft mt-0.5">
                            {t('pages.publicTemplate.items', { count: items.length })} · {t('pages.publicTemplate.by', { handle })}
                        </p>
                    </div>
                </header>

                {saveUpTo != null && saveUpTo > 0 && (
                    <div className="mt-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-souply-beet/10 text-souply-beet text-sm font-bold pl-4 pr-3 py-2">
                            {t('pages.publicTemplate.saveUpTo', { amount: formatEur(saveUpTo, i18n.language) })}
                            <button
                                type="button"
                                onClick={() => setShowHelp((v) => !v)}
                                aria-label={t('pages.publicTemplate.saveUpToHelp')}
                                className="inline-grid place-items-center rounded-full hover:bg-souply-beet/15 transition"
                            >
                                <HelpCircle size={15} />
                            </button>
                        </span>
                        {showHelp && (
                            <p className="mt-2 max-w-prose text-xs text-ink-soft leading-relaxed">
                                {t('pages.publicTemplate.saveUpToHelp')}
                            </p>
                        )}
                    </div>
                )}

                <ul className="mt-6 space-y-2">
                    {shownItems.map((it) => {
                        const img = firstImage(it.imageUrls);
                        return (
                            <li
                                key={it.productId}
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-surface ring-1 ring-edge shadow-card"
                            >
                                <div className="size-11 rounded-lg bg-surface-muted grid place-items-center overflow-hidden shrink-0">
                                    {img
                                        ? <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                                        : <span className="text-lg opacity-50">🫜</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold leading-tight">{it.productName}</div>
                                    {/* SP pack size (not the creator's quantity) — muted, only when known. */}
                                    {it.packAmount != null && it.packUnit && (
                                        <div className="text-xs text-ink-soft mt-0.5">{Number(it.packAmount)} {it.packUnit}</div>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-souply-beet nums shrink-0">
                                    {Number(it.quantity)}{it.unit ? ` ${it.unit}` : ''}
                                </span>
                            </li>
                        );
                    })}
                    {overflow > 0 && (
                        <li className="text-center text-sm font-semibold text-ink-soft py-2">
                            {t('pages.publicTemplate.moreItems', { count: overflow })}
                        </li>
                    )}
                </ul>

                <div className="mt-8 grid place-items-center">
                    {/* On a phone: custom-scheme deep link → opens the app to
                        this template. On desktop the app can't open, so offer
                        the marketing site instead. */}
                    {mobile ? (
                        <a
                            href={`souply://t/${slug}`}
                            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:brightness-95 transition"
                        >
                            {t('pages.publicTemplate.openInApp')}
                        </a>
                    ) : (
                        <a
                            href="https://souply.lt"
                            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:brightness-95 transition"
                        >
                            {t('pages.publicTemplate.getSouply')}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
