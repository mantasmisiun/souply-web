import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy as CopyIcon, Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import type { SampleTemplate } from '@/data/sampleTemplates';
import { shareTemplate } from '@/lib/templates';
import { ease } from '@/lib/motion';

interface Props {
    template: SampleTemplate | null;
    onClose: () => void;
}

/**
 * Branded share surface. Renders a QR code coloured with the
 * template's `coverColor` so the visual still ties back to the
 * template identity, plus a copy-to-clipboard link row.
 *
 * QR format choice — PNG. SVG would scale crisper for print but
 * 90% of real shares are screenshots / Instagram stories / Snap
 * stickers where a 1024 px square PNG drops straight in. We render
 * a 256 px on-screen canvas for the modal preview, then export at
 * 1024 px from a hidden off-screen canvas so the download stays
 * sharp even after a creator's social network re-compresses it.
 *
 * Link format: `https://souply.lt/t/{shareSlug || id}`. The real
 * shareSlug lands when souply-api's share-link mint endpoint is
 * wired through; until then we fall back to the numeric id so the
 * UX is testable today.
 */
const ON_SCREEN_QR_PX = 192;
const DOWNLOAD_QR_PX = 1024;
// Centre logo: clear a quiet zone slightly larger than the logo (so no data
// dots touch it) and float the real Souply mark in it — no white box/border.
const QR_CLEAR_PX = 52;
const QR_LOGO_PX = 34;
const SOUPLY_LOGO = '/souply-logo.png';
// 1×1 transparent PNG — handed to qrcode.react purely so its `excavate` clears
// the centre modules; the visible logo is overlaid separately at a smaller size.
const TRANSPARENT_PX =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export function ShareModal({ template, onClose }: Props) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const canvasRef = useRef<HTMLDivElement | null>(null);

    // The real resolvable link uses the server-minted slug (not the numeric
    // id — /t/:slug resolves by slug). Mint it when the modal opens for a
    // shareable (non-private) template. Built off the dashboard's own origin
    // so it's environment-correct (localhost / test / souply.lt).
    const [slug, setSlug] = useState<string | null>(null);
    const [minting, setMinting] = useState(false);
    const shareUrl = useMemo(() => {
        if (!template || !slug) return '';
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://souply.lt';
        return `${origin}/t/${slug}`;
    }, [template, slug]);

    useEffect(() => {
        if (!template || template.visibility === 'private') { setSlug(null); return; }
        let cancelled = false;
        setMinting(true);
        shareTemplate(template.id)
            .then((res) => { if (!cancelled) setSlug(res.slug); })
            .catch(() => { if (!cancelled) setSlug(null); })
            .finally(() => { if (!cancelled) setMinting(false); });
        return () => { cancelled = true; };
    }, [template]);

    // Reset the "Copied!" pill the next time the modal re-opens for
    // a different template (or re-opens for the same one).
    useEffect(() => {
        if (template) setCopied(false);
    }, [template]);

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            // Clipboard rejected (insecure context, permissions). Fall
            // through silently — the link is already visible in the
            // input, the user can copy manually.
        }
    };

    const onDownload = () => {
        if (!template) return;
        // Render an OFF-screen high-res canvas just for export. We
        // can't use the on-screen one because it's sized for the
        // modal preview (192 px); upscaling that would be blurry.
        const exportRoot = document.createElement('div');
        exportRoot.style.position = 'absolute';
        exportRoot.style.left = '-10000px';
        document.body.appendChild(exportRoot);
        // We have to render through React to use QRCodeCanvas. The
        // simplest robust path: programmatically draw on a fresh
        // canvas via the qrcode lib's stable interface. For a
        // dependency-light path, we just reuse the in-DOM canvas
        // and scale up by re-rendering — but here, the easier
        // technique is to grab the on-screen canvas + redraw on a
        // larger one with image-smoothing disabled.
        const onScreen = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
        if (!onScreen) {
            document.body.removeChild(exportRoot);
            return;
        }
        const big = document.createElement('canvas');
        big.width = DOWNLOAD_QR_PX;
        big.height = DOWNLOAD_QR_PX;
        const ctx = big.getContext('2d');
        if (!ctx) {
            document.body.removeChild(exportRoot);
            return;
        }
        // White background under the QR — important for some camera
        // apps that misread transparent pixels as noise. We paint
        // before drawing the QR so it survives any future move to a
        // QR style with an alpha-cutout pattern.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, DOWNLOAD_QR_PX, DOWNLOAD_QR_PX);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(onScreen, 0, 0, DOWNLOAD_QR_PX, DOWNLOAD_QR_PX);

        const exportBlob = () => {
            big.toBlob((blob) => {
                document.body.removeChild(exportRoot);
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // Filename uses the template name, sanitised. Keeps the
                // download recognisable in the creator's gallery.
                const safe = template.name.replace(/[^\w-]+/g, '_').slice(0, 60) || `template-${template.id}`;
                a.download = `${safe}-qr.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, 'image/png');
        };

        // The cleared centre zone is already baked into the on-screen canvas
        // (excavate removed those modules), so we only redraw the logo crisply
        // at hi-res — no white badge/border. Sized to match the on-screen ratio
        // so the breathing room around it scales identically.
        const logo = new Image();
        logo.onload = () => {
            const logoSz = Math.round(DOWNLOAD_QR_PX * (QR_LOGO_PX / ON_SCREEN_QR_PX));
            const c = DOWNLOAD_QR_PX / 2;
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(logo, c - logoSz / 2, c - logoSz / 2, logoSz, logoSz);
            exportBlob();
        };
        logo.onerror = exportBlob; // logo failed to load → export the plain QR
        logo.src = SOUPLY_LOGO;
    };

    return (
        <AnimatePresence>
            {template && (
                <motion.div
                    key="share-root"
                    className="fixed inset-0 grid place-items-center px-6"
                    style={{ zIndex: 50 }}
                >
                    <motion.div
                        key="share-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        key="share-dialog"
                        role="dialog"
                        aria-labelledby="share-title"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.14 } }}
                        transition={{ duration: 0.24, ease: ease.soft }}
                        className="relative w-full max-w-md rounded-3xl bg-surface text-ink ring-1 ring-edge shadow-pop overflow-hidden"
                    >
                        {/* Branded header band — same coverColor as the
                            template so the share screen reads as part
                            of the same identity, not a generic dialog. */}
                        <div
                            className="relative px-6 pt-5 pb-4"
                            style={{ backgroundColor: template.coverColor }}
                        >
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="absolute right-3 top-3 size-8 grid place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                            >
                                <X size={16} />
                            </button>
                            <h2 id="share-title" className="text-base font-bold text-white">
                                {t('dashboard.templates.share.title')}
                            </h2>
                            <p className="text-[13px] text-white/85 leading-snug mt-1 max-w-[28ch]">
                                {t('dashboard.templates.share.body')}
                            </p>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            {/* Private templates: render the QR but
                                desaturate + dim, and surface a hint
                                strip explaining why share is muted.
                                We still draw the QR so the spatial
                                layout doesn't pop when the creator
                                flips visibility back to Public from
                                the open-view slider — the modal feels
                                consistent across both states. */}
                            {template.visibility === 'private' && (
                                <div className="rounded-2xl bg-beetTint text-beetTint-strong text-[13px] leading-snug p-3 ring-1 ring-beetTint-strong/30">
                                    {t('dashboard.templates.share.disabledPrivate')}
                                </div>
                            )}
                            {/* QR. Foreground colour locked to a dark
                                ink so cameras read it reliably; the
                                cover colour drives the surrounding
                                surface, not the modules themselves.
                                On private templates we render the
                                same QR but in greyscale + reduced
                                opacity so a creator visually sees
                                "this exists but is off." */}
                            <div
                                ref={canvasRef}
                                className={
                                    'relative self-center p-3 rounded-2xl bg-white ring-1 ring-edge ' +
                                    (template.visibility === 'private' || !shareUrl ? 'opacity-40 grayscale' : '')
                                }
                            >
                                <QRCodeCanvas
                                    value={shareUrl || 'https://souply.lt'}
                                    size={ON_SCREEN_QR_PX}
                                    bgColor="#ffffff"
                                    fgColor="#1F1B1D"
                                    level="H"
                                    // Excavate a clean quiet zone in the centre
                                    // (modules removed, not covered) so the logo
                                    // never sits on top of data dots.
                                    imageSettings={{
                                        src: TRANSPARENT_PX,
                                        width: QR_CLEAR_PX,
                                        height: QR_CLEAR_PX,
                                        excavate: true,
                                    }}
                                />
                                {/* The real Souply logo, centred in the cleared
                                    zone — smaller than the cleared square, so it
                                    has breathing room and no box/border. The
                                    download canvas redraws it crisply at hi-res;
                                    level="H" keeps the code scannable. */}
                                <span aria-hidden className="absolute inset-0 grid place-items-center pointer-events-none">
                                    <img src={SOUPLY_LOGO} alt="" width={QR_LOGO_PX} height={QR_LOGO_PX} />
                                </span>
                            </div>

                            <div>
                                <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-1.5">
                                    {t('dashboard.templates.share.link')}
                                </div>
                                <div className="flex items-stretch gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        placeholder={template.visibility === 'private' ? '—' : (minting ? '…' : '—')}
                                        onFocus={(e) => e.target.select()}
                                        disabled={!shareUrl}
                                        className="flex-1 min-w-0 px-3 py-2 text-sm rounded-xl bg-surface-muted text-ink placeholder:text-ink-faint ring-1 ring-edge focus:ring-2 focus:ring-souply-beet/60 outline-none transition disabled:cursor-not-allowed"
                                    />
                                    <button
                                        type="button"
                                        onClick={onCopy}
                                        disabled={!shareUrl}
                                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-souply-beet text-white hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        {copied
                                            ? <><Check size={14} /> {t('dashboard.templates.share.copied')}</>
                                            : <><CopyIcon size={14} /> {t('dashboard.templates.share.copyLink')}</>}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onDownload}
                                disabled={!shareUrl}
                                className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-ink text-surface hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <Download size={15} />
                                {t('dashboard.templates.share.downloadQr')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
