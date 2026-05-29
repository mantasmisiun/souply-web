import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTemplateView } from '@/state/templateView';
import type { SampleTemplate } from '@/data/sampleTemplates';
import { ease } from '@/lib/motion';
import { addTemplateItem } from '@/lib/templates';
import { TemplateBrowsePanel } from './TemplateBrowsePanel';

/**
 * Right-area surface when a template is open via Atverti. Mirrors
 * the create flow's right area structurally — same coverColor band
 * across the top, same shared TemplateBrowsePanel in Redaguoti mode
 * — so a creator's muscle memory carries over. The Peržiūra tab
 * promotes the three stats from the dashboard card to centre stage.
 *
 * The morph-from-card-to-surface uses `layoutId="template-${id}"`
 * matching the TemplateCard, so the open animation reads the same
 * way Kurti šabloná's expand reads.
 *
 * Item adds in Redaguoti mode flow through the shared
 * createTemplate state (the rail seeds it on mount) and additionally
 * fire `POST /api/basket-templates/{id}/items` so changes persist
 * immediately — no save button required.
 */
/**
 * Atverti main surface. Hosts BOTH tabs:
 *
 *   Peržiūra → StatsView (four stat tiles with flip-on-i)
 *   Redaguoti → TemplateBrowsePanel (same shared component the
 *               create flow uses for search + categories + add)
 *
 * Tab swap is one AnimatePresence opacity crossfade — the section
 * itself never unmounts and its layoutId="template-${id}" stays
 * connected to the dashboard card across mode changes. That means
 * flipping Peržiūra ↔ Redaguoti doesn't reload anything: the
 * createTemplate state stays seeded, the items list keeps its rows,
 * and the rail keeps its current scroll position.
 */
export function TemplateOpenSurface() {
    const { viewing, tab } = useTemplateView();
    if (!viewing) return null;
    const templateId = viewing.id;
    const onItemAdded = async (productId: number, quantity: number, unit: string | null): Promise<number | undefined> => {
        if (templateId <= 0) return undefined; // sample card
        try {
            const result = await addTemplateItem(templateId, { productId, quantity, unit, sortOrder: 0 });
            return result?.id;
        } catch { return undefined; }
    };
    return (
        <motion.section
            layout
            layoutId={`template-${templateId}`}
            transition={{ duration: 0.45, ease: ease.soft, layout: { duration: 0.45, ease: ease.soft } }}
            className="absolute inset-y-0 left-0 right-0 sm:pl-[420px] overflow-hidden bg-createWash"
            style={{ zIndex: 2 }}
        >
            <div className="h-full flex flex-col pt-16">
                <div className="relative flex-1 min-h-0">
                    {/* Both branches stay mounted; visibility toggled with opacity +
                        pointer-events. Keeps TemplateBrowsePanel's CategoriesPanel
                        fetch alive across tab switches so the list never re-loads. */}
                    <motion.div
                        animate={{ opacity: tab === 'preview' ? 1 : 0 }}
                        transition={{ duration: 0.22, ease: ease.soft }}
                        className="absolute inset-0 overflow-y-auto"
                        style={{ pointerEvents: tab === 'preview' ? 'auto' : 'none' }}
                        aria-hidden={tab !== 'preview'}
                    >
                        <StatsView template={viewing} />
                    </motion.div>
                    <motion.div
                        animate={{ opacity: tab === 'edit' ? 1 : 0 }}
                        transition={{ duration: 0.22, ease: ease.soft }}
                        className="absolute inset-0"
                        style={{ pointerEvents: tab === 'edit' ? 'auto' : 'none' }}
                        aria-hidden={tab !== 'edit'}
                    >
                        <TemplateBrowsePanel onItemAdded={onItemAdded} />
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}

function StatsView({ template }: { template: SampleTemplate }) {
    const { t, i18n } = useTranslation();
    const fmt = useMemo(
        () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }),
        [i18n.language],
    );
    const edited = new Date(template.updatedAt).getTime() > new Date(template.createdAt).getTime();
    const dateValue = new Date(edited ? template.updatedAt : template.createdAt)
        .toLocaleDateString(i18n.language);
    const dateLabel = t(edited ? 'dashboard.templates.statsUpdated' : 'dashboard.templates.statsCreated');
    return (
        <div className="max-w-5xl px-7 md:px-10 pt-7 md:pt-10 pb-10">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-ink">{template.name}</h2>
                <p className="text-sm text-ink-soft mt-1">
                    {template.itemCount} prekės · {template.visibility === 'public' ? 'Vieša' : template.visibility === 'unlisted' ? 'Su nuoroda' : 'Privati'}
                </p>
            </header>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label={t('dashboard.templates.statsVisits')}
                    value={fmt.format(template.visitCount)}
                    explainer={t('dashboard.templates.statsVisitsExplainer')}
                />
                <StatCard
                    label={t('dashboard.templates.statsUses')}
                    value={fmt.format(template.useCount)}
                    explainer={t('dashboard.templates.statsUsesExplainer')}
                />
                <StatCard
                    label={t('dashboard.templates.statsHelpedSave')}
                    value={`${fmt.format(Number(template.collectiveSavingsEur))} €`}
                    accent
                    explainer={t('dashboard.templates.statsHelpedSaveExplainer')}
                />
                <StatCard
                    label={dateLabel}
                    value={dateValue}
                />
            </div>
        </div>
    );
}

/**
 * Single stat card. Renders its value on the front side; the info
 * button in the top-right flips the card to the back side showing
 * `explainer`. Cards without an explainer (the date stat) don't
 * paint the info button — the affordance is gated entirely by the
 * presence of the prop.
 *
 * The flip is a real 3D rotateY rather than a fade-swap so the
 * gesture reads as "turn the card over" rather than "swap the
 * label" — matches how mobile apps flip stat tiles for the same
 * pattern. backface-visibility hides the side facing away.
 */
function StatCard({
    label, value, accent = false, explainer,
}: {
    label: string;
    value: string;
    accent?: boolean;
    explainer?: string;
}) {
    const { t } = useTranslation();
    const [flipped, setFlipped] = useState(false);
    const flippable = !!explainer;
    return (
        <div className="relative min-h-[124px]" style={{ perspective: '1000px' }}>
            <motion.div
                className="absolute inset-0"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: ease.soft }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <div
                    className="absolute inset-0 rounded-2xl bg-surface ring-1 ring-edge p-5 shadow-card"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    {flippable && (
                        <button
                            type="button"
                            onClick={() => setFlipped(true)}
                            aria-label={t('dashboard.templates.statsExplainerOpen')}
                            className="absolute top-2.5 right-2.5 size-6 grid place-items-center rounded-full text-ink-soft hover:bg-surface-muted hover:text-ink transition"
                        >
                            <Info size={14} />
                        </button>
                    )}
                    <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2 pr-6">
                        {label}
                    </div>
                    <div className={'text-3xl font-bold leading-none ' + (accent ? 'text-beetTint-strong' : 'text-ink')}>
                        {value}
                    </div>
                </div>
                {/* Back — explicit close button in the same corner
                    the info button lives on the front side, so the
                    affordance mirrors itself. The card body is a
                    plain div, not a button, so a stray tap on the
                    explainer text doesn't surprise-flip the card.
                    The corner button is the single, obvious way to
                    return to the value. */}
                <div
                    className="absolute inset-0 rounded-2xl bg-surface ring-1 ring-edge p-5 shadow-card text-left"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setFlipped(false)}
                        aria-label={t('dashboard.templates.statsExplainerClose')}
                        className="absolute top-2.5 right-2.5 size-6 grid place-items-center rounded-full text-ink-soft hover:bg-surface-muted hover:text-ink transition"
                    >
                        <X size={14} />
                    </button>
                    <div className="text-[10px] uppercase tracking-wider text-souply-beet mb-2 pr-6">
                        {label}
                    </div>
                    <p className="text-[13px] leading-snug text-ink-soft">
                        {explainer}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
