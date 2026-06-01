import { motion } from 'framer-motion';
import {
    ArrowUpRight, Copy, Share2, Trash2,
    Globe2, Link as LinkIcon, Lock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SampleTemplate } from '@/data/sampleTemplates';
import { findPreset } from '@/data/coverPresets';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';
import { COVER_GRADIENT_OVERLAY } from '@/lib/coverGradient';

/** True when the row has been edited since creation (updatedAt is
 *  strictly newer than createdAt). The card switches its date stat
 *  between "Sukurta" and "Atnaujinta" based on this. */
function wasEdited(t: SampleTemplate): boolean {
    return new Date(t.updatedAt).getTime() > new Date(t.createdAt).getTime();
}

interface Props {
    template: SampleTemplate;
    onOpen: (t: SampleTemplate) => void;
    onShare: (t: SampleTemplate) => void;
    onDuplicate: (t: SampleTemplate) => void;
    onDelete: (t: SampleTemplate) => void;
}

const fmtEur = (n: number) =>
    new Intl.NumberFormat('lt-LT', { maximumFractionDigits: 0 }).format(n);

/** Short numeric date used in the dashboard stat row. We want
 *  "2025-05-23" / locale-equivalent — NOT a "2 val." relative
 *  string — because once a template is older than a few days the
 *  relative form gets meaningless ("47 d." reads worse than a date). */
function shortDate(iso: string, locale: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(locale);
}

/**
 * Dashboard template card. Heftier than the mobile list-row equivalent
 * on purpose — desktop has the pixel budget for: cover band with cover
 * avatar, name, three-stat row (uses · saved · updated), and the four-
 * action row (open / share / duplicate / delete).
 *
 * `layoutId="template-${id}"` connects the card to the full-screen
 * template-open surface in App.tsx, so Atverti morphs the card into a
 * detail view the same way Kurti šabloną morphs into the create
 * surface. Card-level destructive UX (delete) and copy actions live
 * in modals owned by DashboardGrid; the card just emits intent.
 */
export function TemplateCard({ template, onOpen, onShare, onDuplicate, onDelete }: Props) {
    const { t, i18n } = useTranslation();
    const edited = wasEdited(template);
    const dateValue = shortDate(edited ? template.updatedAt : template.createdAt, i18n.language);
    const dateLabel = t(edited ? 'dashboard.templates.statsUpdated' : 'dashboard.templates.statsCreated');
    return (
        <motion.article
            layout
            layoutId={`template-${template.id}`}
            transition={{ layout: { duration: 0.45, ease: ease.soft } }}
            whileHover={{ y: -3 }}
            /* Shadow is an INLINE style (not a Tailwind token) on purpose:
             * it renders without depending on a tailwind.config reload,
             * and it's tinted warm-dark (beet-brown) rather than grey so
             * it actually reads against the saturated pink dashboard
             * page — a neutral grey shadow vanishes on pink. Border (not
             * ring) so the inline box-shadow doesn't clobber the ring's
             * own box-shadow. */
            className="group relative overflow-hidden rounded-3xl bg-createWash border border-edge transition-transform"
            style={{
                boxShadow:
                    '0 1px 0 rgba(255,255,255,.55) inset, 0 20px 40px -20px rgba(74,20,38,.45), 0 9px 18px -10px rgba(74,20,38,.34), 0 2px 6px -2px rgba(74,20,38,.30)',
            }}
        >
            {/* Cover band — solid `coverColor`, same hex that drives
                the basket's left edge + bookmark icon in the consumer
                app. Cover circle on the left shows either the chosen
                preset icon or the uploaded photo; mirrors the avatar
                the basket-app puts on the bookmark for a signed-in
                creator so the identity is consistent across surfaces. */}
            <div
                className="relative h-28"
                style={{
                    backgroundColor: template.coverColor,
                    // Colour on the left, fading to near-white on the right
                    // (lit-from-left look). Subtle inset shadow at the
                    // bottom edge so the cover reads as a raised panel
                    // sitting above the card body.
                    backgroundImage: COVER_GRADIENT_OVERLAY,
                    boxShadow: 'inset 0 -10px 16px -12px rgba(31,27,29,.22)',
                }}
            >
                <div className="absolute inset-0 flex items-center justify-between px-5">
                    <CoverAvatar
                        image={template.coverImage}
                        bgColor={template.coverColor}
                    />
                    {/* Auto-update badge removed deliberately — the
                        information lives in the stats row + open view
                        instead. Visibility tag stays as the single
                        identity badge on the cover. */}
                    <VisibilityTag visibility={template.visibility} t={t} />
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-ink leading-tight">{template.name}</h3>
                    <div className="text-xs text-ink-soft mt-0.5">
                        {template.itemCount} {template.itemCount === 1 ? 'prekė' : (template.itemCount < 10 ? 'prekės' : 'prekių')}
                    </div>
                </div>

                <dl className="grid grid-cols-3 gap-3 py-3 border-y border-edge nums">
                    <Stat label={t('dashboard.templates.statsUses')}        value={new Intl.NumberFormat('lt-LT').format(template.useCount)} />
                    <Stat label={t('dashboard.templates.statsHelpedSave')}  value={`${fmtEur(Number(template.collectiveSavingsEur))} €`} accent />
                    <Stat label={dateLabel}                                  value={dateValue} />
                </dl>

                {/* Action row — lean: open is the primary CTA;
                    share, duplicate, delete cover the day-to-day. */}
                <div className="flex items-center gap-1.5">
                    <PrimaryAction
                        icon={ArrowUpRight}
                        label={t('dashboard.templates.action.open')}
                        onClick={() => onOpen(template)}
                    />
                    {/* Share button is gated on visibility — a private
                        template has no useful URL or QR, so we just
                        don't surface the affordance. Toggle via the
                        rail slider (create flow) or the open-view
                        slider (Atverti) to flip back to Public. */}
                    {template.visibility !== 'private' && (
                        <IconBtn icon={Share2} label={t('dashboard.templates.action.share')} onClick={() => onShare(template)} />
                    )}
                    <IconBtn icon={Copy}   label={t('dashboard.templates.action.duplicate')} onClick={() => onDuplicate(template)} />
                    <IconBtn icon={Trash2} label={t('dashboard.templates.action.delete')} danger onClick={() => onDelete(template)} />
                </div>
            </div>
        </motion.article>
    );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="text-center">
            <div className={cx(
                'text-base font-bold leading-none',
                accent ? 'text-beetTint-strong' : 'text-ink',
            )}>
                {value}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-soft mt-1">
                {label}
            </div>
        </div>
    );
}

function PrimaryAction({ icon: Icon, label, onClick }: { icon: typeof ArrowUpRight; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-souply-beet text-white text-xs font-semibold hover:bg-souply-beetDeep transition"
        >
            <Icon size={14} />
            {label}
        </button>
    );
}

function IconBtn({
    icon: Icon, label, onClick, danger = false,
}: {
    icon: typeof ArrowUpRight;
    label: string;
    onClick?: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={cx(
                'size-8 grid place-items-center rounded-lg transition',
                danger
                    ? 'text-ink-soft hover:bg-beetTint hover:text-beetTint-strong'
                    : 'text-ink-soft hover:bg-surface-muted hover:text-ink',
            )}
        >
            <Icon size={15} />
        </button>
    );
}

function CoverAvatar({ image, bgColor }: { image: SampleTemplate['coverImage']; bgColor: string }) {
    /* Both preset and emoji variants render the same way — a glyph
     * on top of the cover-coloured circle (with a soft black overlay
     * so the edges contrast). Preset just looks up the glyph via
     * iconKey; emoji uses the picked string directly. No image kind
     * any more — uploads got dropped in favour of the Custom emoji
     * picker. */
    const glyph = image.kind === 'preset' ? findPreset(image.iconKey).emoji : image.emoji;
    return (
        <div
            className="size-14 rounded-full grid place-items-center ring-2 ring-white/40 shadow-card"
            style={{
                backgroundColor: bgColor,
                backgroundImage: 'linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.18))',
            }}
        >
            <span className="text-2xl leading-none select-none" aria-hidden>
                {glyph}
            </span>
        </div>
    );
}

function VisibilityTag({
    visibility, t,
}: {
    visibility: SampleTemplate['visibility'];
    t: (k: string) => string;
}) {
    const map = {
        public:   { Icon: Globe2,   label: t('dashboard.templates.tagPublic') },
        unlisted: { Icon: LinkIcon, label: t('dashboard.templates.tagUnlisted') },
        private:  { Icon: Lock,     label: t('dashboard.templates.tagPrivate') },
    } as const;
    const { Icon, label } = map[visibility];
    /* `bg-surface text-ink` swaps both colours with the theme: light
     * paper + dark text in light mode, dark surface + light text in
     * dark mode. The old `bg-white/85 text-ink` rendered as light text
     * on a white pill in dark mode — invisible. */
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface text-ink text-[10px] font-semibold shadow-card">
            <Icon size={10} /> {label}
        </span>
    );
}
