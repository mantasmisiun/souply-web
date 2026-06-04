import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { SampleTemplate } from '@/data/sampleTemplates';
import type { CoverImage } from '@/state/createTemplate';
import { CoverColorPicker } from './CoverColorPicker';
import { CoverPicturePicker } from './CoverPicturePicker';
import { ease } from '@/lib/motion';

interface Props {
    template: SampleTemplate | null;
    onCancel: () => void;
    /** Receives the chosen name + cover for the new copy. Parent (the
     *  DashboardGrid) seeds the create-template state with these
     *  plus the original template's products, then opens the create
     *  flow so the creator lands directly in the items list ready to
     *  tweak. */
    onConfirm: (next: { name: string; coverColor: string; coverImage: CoverImage }) => void;
}

/**
 * Duplicate-template modal. Coloured top band with the source
 * template's cover (same picker UX as the create flow's top bar +
 * rail), a single name field defaulting to `{name}_kopija`, and the
 * Atšaukti / Kurti kopiją CTA pair. Submitting hands off to the
 * parent which seeds the create-template state and opens the
 * builder so the user can tweak items before saving.
 */
export function DuplicateModal({ template, onCancel, onConfirm }: Props) {
    const { t } = useTranslation();
    // Seed local state each time a new template comes in so the
    // modal opens with the correct defaults (and doesn't leak the
    // previous template's choices when the same modal instance is
    // re-used).
    const [name, setName] = useState('');
    const [coverColor, setCoverColor] = useState('#EB6784');
    const [coverImage, setCoverImage] = useState<CoverImage>({ kind: 'preset', iconKey: 'basket' });

    useEffect(() => {
        if (!template) return;
        setName(`${template.name}${t('dashboard.templates.duplicate.copySuffix')}`);
        setCoverColor(template.coverColor);
        setCoverImage(template.coverImage);
    }, [template, t]);

    const canSubmit = name.trim().length > 0;

    return (
        <AnimatePresence>
            {template && (
                <motion.div
                    key="dup-root"
                    className="fixed inset-0 grid place-items-center px-6"
                    style={{ zIndex: 50 }}
                >
                    <motion.div
                        key="dup-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        key="dup-dialog"
                        role="dialog"
                        aria-labelledby="dup-title"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.14 } }}
                        transition={{ duration: 0.24, ease: ease.soft }}
                        className="relative w-full max-w-md rounded-3xl bg-surface text-ink ring-1 ring-edge shadow-pop overflow-hidden"
                    >
                        {/* Coloured top band — picture picker on the
                            left, colour picker on the right, both
                            animating the band background so the
                            preview is the modal itself. Same pattern
                            we use in CreateTemplateView. */}
                        <motion.div
                            animate={{ backgroundColor: coverColor }}
                            transition={{ duration: 0.25 }}
                            className="relative px-5 py-4 flex items-center gap-4 shadow-card"
                        >
                            <CoverPicturePicker
                                value={coverImage}
                                onChange={setCoverImage}
                                bgColor={coverColor}
                                hideLabel
                            />
                            <div className="ml-auto">
                                <CoverColorPicker value={coverColor} onChange={setCoverColor} />
                            </div>
                        </motion.div>

                        <div className="p-6 flex flex-col gap-5">
                            <div>
                                <h2 id="dup-title" className="text-base font-semibold mb-1">
                                    {t('dashboard.templates.duplicate.title')}
                                </h2>
                                <p className="text-[13px] text-ink-soft leading-snug">
                                    {t('dashboard.templates.duplicate.body')}
                                </p>
                            </div>

                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-1">
                                    {t('dashboard.templates.duplicate.nameLabel')}
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={100}
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                    className="w-full px-3.5 py-2.5 text-base font-semibold rounded-xl bg-surface-muted ring-1 ring-edge placeholder:text-ink-faint text-ink focus:outline-none focus:ring-2 focus:ring-souply-beet/60 transition"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold ring-1 ring-edge text-ink-soft hover:bg-surface-muted transition"
                                >
                                    {t('dashboard.templates.cancel')}
                                </button>
                                <button
                                    type="button"
                                    disabled={!canSubmit}
                                    onClick={() => onConfirm({ name: name.trim(), coverColor, coverImage })}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-souply-beet text-white shadow-card hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    {t('dashboard.templates.duplicate.create')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
