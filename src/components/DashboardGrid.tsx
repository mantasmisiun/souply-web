import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { sampleTemplates, type SampleTemplate } from '@/data/sampleTemplates';
import { TemplateCard } from './TemplateCard';

/**
 * Right side of the dashboard. Holds the section title + the templates
 * grid. Cards are revealed with a stagger so the page reads as "the
 * rail arrived, then the cards trickled in" rather than a thudding
 * pop-in everywhere at once.
 *
 * The stagger delay starts at 350ms — gives the rail-merge animation
 * (~900ms total in `App`) time to settle so the eye isn't tracking two
 * motions in parallel.
 */
export function DashboardGrid() {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState<SampleTemplate[]>(sampleTemplates);

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
                className="flex items-end justify-between mb-7"
            >
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-souply-ink tracking-tight">
                        {t('dashboard.templates.title')}
                    </h1>
                </div>
            </motion.header>

            <AnimatePresence mode="popLayout">
                {templates.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-3xl bg-white/80 ring-1 ring-souply-border p-10 text-center text-souply-slate"
                    >
                        {t('dashboard.templates.empty')}
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    >
                        {templates.map((tpl) => (
                            <motion.div
                                key={tpl.id}
                                layout
                                variants={{
                                    hidden: { opacity: 0, y: 18, scale: 0.96 },
                                    show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 220, damping: 22 } },
                                }}
                                exit={{ opacity: 0, y: -10, scale: 0.96, transition: { duration: 0.25 } }}
                            >
                                <TemplateCard
                                    template={tpl}
                                    onDelete={(id) => setTemplates((prev) => prev.filter((p) => p.id !== id))}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
