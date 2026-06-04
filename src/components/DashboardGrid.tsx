import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TemplateCard } from './TemplateCard';
import { CreateTemplateCard } from './CreateTemplateCard';
import { ConfirmDialog } from './ConfirmDialog';
import { ShareModal } from './ShareModal';
import { DuplicateModal } from './DuplicateModal';
import { useTemplates } from '@/state/templates';
import { useCreateTemplate, type CoverImage } from '@/state/createTemplate';
import { useTemplateView } from '@/state/templateView';
import { useThemeMode } from '@/state/theme';
import { toCardData } from '@/lib/templateCard';
import type { SampleTemplate } from '@/data/sampleTemplates';
import { ease, dur } from '@/lib/motion';

/**
 * Right side of the dashboard. Pulls the templates list from the
 * shared TemplatesProvider — the rail's stats read from the same
 * provider so we make one fetch per session. Cards stagger in after
 * the band-merge animation lands; refresh and delete buttons hit the
 * same provider mutators so optimistic updates apply everywhere at
 * once.
 */
interface Props {
    /** True while App is running the band's reverse slide (un-merging).
     *  Cards animate out to the right + fade so the dashboard appears
     *  to be carried off-stage by the band, mirroring the entry. */
    reverse?: boolean;
}

export function DashboardGrid({ reverse = false }: Props = {}) {
    const { t } = useTranslation();
    const { templates, loading, error, refresh, remove } = useTemplates();
    const { effective } = useThemeMode();
    const cards = useMemo(() => templates.map(toCardData), [templates]);

    const { open: openCreate, openWithDraft } = useCreateTemplate();
    const { open: openTemplateView } = useTemplateView();
    const onCreate = openCreate;

    // Three modals owned at the grid level so they survive any
    // single card's unmount and so there's only one share/duplicate
    // popover in the DOM at a time. Each tracks its target template;
    // null = closed.
    const [shareTemplate, setShareTemplate]         = useState<SampleTemplate | null>(null);
    const [duplicateTemplate, setDuplicateTemplate] = useState<SampleTemplate | null>(null);
    const [deleteTemplate, setDeleteTemplate]       = useState<SampleTemplate | null>(null);

    const onConfirmDuplicate = ({ name, coverColor, coverImage }: { name: string; coverColor: string; coverImage: CoverImage }) => {
        if (!duplicateTemplate) return;
        // Duplicate = fresh template seeded with the original's
        // items + the creator's chosen overrides. editingId=null so
        // the save call POSTs a new row. Visibility starts at
        // 'private' on every fresh template regardless of the source
        // — the creator opts into Public via the rail slider once
        // they're sure the copy is ready to share.
        openWithDraft({
            name,
            coverColor,
            coverImage,
            items: [], // TODO: backfill items from the source template once item-list endpoint is wired here.
            visibility: 'private',
            editingId: null,
        });
        setDuplicateTemplate(null);
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: { transition: { delayChildren: 0.35, staggerChildren: 0.08 } },
            }}
            className="px-8 md:px-12 py-10"
        >
            <motion.header
                variants={{
                    hidden: { opacity: 0, y: 10 },
                    show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                className="flex items-end justify-between mb-7 gap-3"
            >
                {/* Page bg is pink in both themes. Light theme reads
                    cleaner with the title in white; dark theme reads
                    more refined with a deep neutral so the heading
                    doesn't shout against an otherwise muted UI. */}
                <h1
                    className={
                        'font-display text-3xl md:text-4xl font-bold tracking-tight ' +
                        (effective === 'dark' ? 'text-[#1F1B1D]' : 'text-white')
                    }
                >
                    {t('dashboard.templates.title')}
                </h1>
                {loading && !cards.length ? null : (
                    <button
                        type="button"
                        onClick={refresh}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition"
                        aria-label="Refresh templates"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : undefined} />
                        {loading ? '…' : 'Atnaujinti'}
                    </button>
                )}
            </motion.header>

            {error && (
                <div className="mb-5 p-4 rounded-2xl bg-beetTint text-beetTint-strong text-sm">
                    Nepavyko užkrauti šablonų: {error}
                </div>
            )}

            <AnimatePresence mode="popLayout">
                {loading && !cards.length ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-3xl bg-white/80 ring-1 ring-edge p-12 text-center text-ink-soft flex flex-col items-center gap-3"
                    >
                        <Loader2 className="animate-spin text-souply-beet" size={28} />
                        <span className="text-sm">Užkraunama…</span>
                    </motion.div>
                ) : (
                    // Explicit initial/animate on each child rather than
                    // variant inheritance — AnimatePresence's popLayout
                    // mode + the intermediate layout-only grid container
                    // can swallow the inherited "show" state and leave
                    // children stuck at the hidden opacity:0 baseline.
                    <motion.div
                        layout
                        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    >
                        {/* Create card always lives in slot 0 so the
                            primary creator action is one click away
                            regardless of how many templates exist.
                            layoutId="create-surface" makes the card
                            morph into the full pink surface when the
                            flow opens AND back into the card on
                            Atšaukti — Framer interpolates between
                            the surface rect and the card rect either
                            way. No `initial` / `animate` here on
                            purpose: any opacity-0 entry state would
                            make the morphing element invisible
                            during the return shrink, so the user
                            would only see the page-bg colour fade
                            and not the surface collapsing back into
                            the card. The layout tween (ease.soft,
                            no spring) keeps the shrink from
                            overshooting past the card's resting
                            box. */}
                        <motion.div
                            key="__create"
                            layout
                            layoutId="create-surface"
                            transition={{
                                layout: { duration: 0.45, ease: ease.soft },
                            }}
                        >
                            <CreateTemplateCard onPress={onCreate} />
                        </motion.div>

                        {/* Cards slide in from the right while the band
                            slides left (entry), paced so the longest
                            card animation ends exactly when the band
                            lands. On `reverse` (un-merging) they slide
                            back out to the right and fade — mirror
                            timing so the dashboard appears carried off
                            by the band's return slide. Tight stagger
                            (40ms) so siblings don't race each other.
                            Spring removed: horizontal springs overshoot
                            their column on entry. */}
                        {cards.map((tpl, i) => (
                            <motion.div
                                key={tpl.id}
                                layout
                                initial={{ opacity: 0, x: 64 }}
                                animate={reverse ? { opacity: 0, x: 64 } : { opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 32, transition: { duration: 0.2 } }}
                                transition={{
                                    delay: i * 0.04,
                                    duration: Math.max(0.5, dur.band - i * 0.04),
                                    ease: ease.soft,
                                }}
                            >
                                <TemplateCard
                                    template={tpl}
                                    onOpen={openTemplateView}
                                    onShare={setShareTemplate}
                                    onDuplicate={setDuplicateTemplate}
                                    onDelete={setDeleteTemplate}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <ShareModal
                template={shareTemplate}
                onClose={() => setShareTemplate(null)}
            />
            <DuplicateModal
                template={duplicateTemplate}
                onCancel={() => setDuplicateTemplate(null)}
                onConfirm={onConfirmDuplicate}
            />
            <ConfirmDialog
                open={deleteTemplate !== null}
                title={t('dashboard.templates.deleteConfirmTitle')}
                body={t('dashboard.templates.deleteConfirmBody')}
                yesLabel={t('dashboard.templates.deleteConfirm')}
                noLabel={t('dashboard.templates.cancel')}
                danger
                onConfirm={() => {
                    const tpl = deleteTemplate;
                    setDeleteTemplate(null);
                    if (tpl) remove(tpl.id);
                }}
                onCancel={() => setDeleteTemplate(null)}
            />
        </motion.div>
    );
}
