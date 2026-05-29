import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, BarChart3, Copy, MoreHorizontal, Share2, Trash2, Archive,
    Wand2, Globe2, Link as LinkIcon, Lock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SampleTemplate } from '@/data/sampleTemplates';
import { cx } from '@/lib/cx';

interface Props {
    template: SampleTemplate;
    onDelete: (id: number) => void;
}

const fmtEur = (n: number) =>
    new Intl.NumberFormat('lt-LT', { maximumFractionDigits: 0 }).format(n);

function relative(iso: string, t: (k: string, v?: Record<string, unknown>) => string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return t('dashboard.templates.updated', { when: `${Math.max(1, mins)} min.` });
    const hours = Math.round(mins / 60);
    if (hours < 24) return t('dashboard.templates.updated', { when: `${hours} val.` });
    const days = Math.round(hours / 24);
    return t('dashboard.templates.updated', { when: `${days} d.` });
}

/**
 * Dashboard template card. Heftier than the mobile list-row equivalent
 * on purpose — desktop has the pixel budget for: cover band with
 * gradient + emoji, name, three visibility/auto tags, three-stat row
 * (uses · saved · updated), and the six-action row (open / share /
 * stats / duplicate / archive / delete-with-confirm).
 *
 * The delete confirm is inline (slide-down) instead of a modal so
 * keyboard flow stays on the card and the rest of the grid doesn't
 * dim — feels lighter for a destructive action that's reversible by
 * tomorrow's server-side soft-delete.
 */
export function TemplateCard({ template, onDelete }: Props) {
    const { t } = useTranslation();
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <motion.article
            layout
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="group relative overflow-hidden rounded-3xl bg-white ring-1 ring-souply-border/80 shadow-card hover:shadow-pop transition-shadow"
        >
            {/* Cover band */}
            <div
                className="relative h-28"
                style={{ background: `linear-gradient(135deg, ${template.cover[0]} 0%, ${template.cover[1]} 100%)` }}
            >
                <div className="absolute inset-0 flex items-center justify-between px-5">
                    <span className="text-4xl drop-shadow-sm">{template.emoji}</span>
                    <div className="flex flex-col items-end gap-1">
                        <VisibilityTag visibility={template.visibility} t={t} />
                        {template.autoUpdate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/85 text-souply-beetDeep text-[10px] font-semibold">
                                <Wand2 size={10} /> {t('dashboard.templates.tagAuto')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-souply-ink leading-tight">{template.name}</h3>
                    <div className="text-xs text-souply-slate mt-0.5">
                        {template.itemCount} {template.itemCount === 1 ? 'prekė' : (template.itemCount < 10 ? 'prekės' : 'prekių')}
                    </div>
                </div>

                <dl className="grid grid-cols-3 gap-3 py-3 border-y border-souply-border/60 nums">
                    <Stat label={t('dashboard.templates.uses', { count: '' }).replace(/\{\{.*?\}\}/g, '').trim() || 'Naudojimai'}
                          value={new Intl.NumberFormat('lt-LT').format(template.useCount)} />
                    <Stat label="Sutaupyta" value={`${fmtEur(Number(template.collectiveSavingsEur))} €`} accent />
                    <Stat label="Atnaujinta" value={relative(template.updatedAt, t).replace(/^Atnaujinta /, '').replace(/^Updated /, '')} />
                </dl>

                {/* Action row */}
                <div className="flex items-center gap-1.5">
                    <PrimaryAction icon={ArrowUpRight} label={t('dashboard.templates.action.open')} />
                    <IconBtn icon={Share2}  label={t('dashboard.templates.action.share')} />
                    <IconBtn icon={BarChart3} label={t('dashboard.templates.action.stats')} />
                    <IconBtn icon={Copy}     label={t('dashboard.templates.action.duplicate')} />
                    <IconBtn icon={Archive}  label={t('dashboard.templates.action.archive')} />
                    <IconBtn icon={Trash2}   label={t('dashboard.templates.action.delete')} danger onClick={() => setConfirmOpen(true)} />
                    <button
                        aria-label="More"
                        className="ml-auto size-8 grid place-items-center rounded-lg text-souply-slate hover:bg-souply-mist transition"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Inline delete confirm */}
            <AnimatePresence>
                {confirmOpen && (
                    <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 8, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-x-3 bottom-3 rounded-2xl bg-souply-ink text-white p-4 shadow-pop"
                    >
                        <div className="text-sm font-semibold">{t('dashboard.templates.deleteConfirmTitle')}</div>
                        <div className="text-xs opacity-80 mb-3">{t('dashboard.templates.deleteConfirmBody')}</div>
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 transition"
                            >
                                {t('dashboard.templates.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(template.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-souply-beet hover:bg-souply-beetDeep transition"
                            >
                                {t('dashboard.templates.deleteConfirm')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="text-center">
            <div className={cx(
                'text-base font-bold leading-none',
                accent ? 'text-souply-beetDeep' : 'text-souply-ink',
            )}>
                {value}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-souply-slate mt-1">
                {label}
            </div>
        </div>
    );
}

function PrimaryAction({ icon: Icon, label }: { icon: typeof ArrowUpRight; label: string }) {
    return (
        <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-souply-ink text-white text-xs font-semibold hover:bg-black transition"
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
                    ? 'text-souply-slate hover:bg-souply-beetMuted hover:text-souply-beetDeep'
                    : 'text-souply-slate hover:bg-souply-mist hover:text-souply-ink',
            )}
        >
            <Icon size={15} />
        </button>
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
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/85 text-souply-ink text-[10px] font-semibold">
            <Icon size={10} /> {label}
        </span>
    );
}
