import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { getSharedTemplate, type SharedTemplate } from '@/lib/templates';

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

export function PublicTemplateView() {
    const { slug } = useParams<{ slug: string }>();
    const { t } = useTranslation();
    const [data, setData] = useState<SharedTemplate | null>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

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

    const { template, items } = data;
    const handle = template.creatorHandle ? `@${template.creatorHandle}` : t('brand.name');

    return (
        <div className="min-h-screen bg-createWash text-ink">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <Link to="/" className="text-sm font-semibold text-souply-beet hover:underline">
                    {t('brand.name')}
                </Link>

                <header className="mt-5 mb-6">
                    <h1 className="text-2xl font-bold">{template.name}</h1>
                    <p className="text-sm text-ink-soft mt-1">
                        {t('pages.publicTemplate.items', { count: items.length })} · {t('pages.publicTemplate.by', { handle })}
                    </p>
                </header>

                <ul className="space-y-2">
                    {items.map((it) => {
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
                                <span className="flex-1 text-sm font-semibold leading-tight">{it.productName}</span>
                                <span className="text-xs font-bold text-souply-beet nums shrink-0">
                                    {Number(it.quantity)}{it.unit ? ` ${it.unit}` : ''}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-8 grid place-items-center">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:brightness-95 transition"
                    >
                        {t('pages.publicTemplate.openInApp')}
                    </button>
                </div>
            </div>
        </div>
    );
}
