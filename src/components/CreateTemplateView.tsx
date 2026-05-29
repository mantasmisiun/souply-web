import { motion } from 'framer-motion';
import { CoverColorPicker } from './CoverColorPicker';
import { TemplateBrowsePanel } from './TemplateBrowsePanel';
import { useCreateTemplate } from '@/state/createTemplate';

/**
 * Pink-area surface during the create-template flow. Hosts the
 * coloured cover-colour picker strip on top and the shared
 * TemplateBrowsePanel below (search + categories + products + amount
 * modal). The Atverti view re-uses the same browse panel in its
 * Redaguoti tab, just without the colour strip.
 */
export function CreateTemplateView() {
    const { coverColor, setCoverColor } = useCreateTemplate();

    return (
        <div className="relative h-full flex flex-col">
            {/* Coloured top bar with the cover-colour picker — gives
                the creator a live preview of the template's identity
                as they pick the colour. Strip is animated so colour
                swaps feel like a paintbrush. */}
            <motion.div
                animate={{ backgroundColor: coverColor }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-end px-7 md:px-10 py-4 shadow-card"
            >
                <CoverColorPicker value={coverColor} onChange={setCoverColor} />
            </motion.div>

            <div className="flex-1 min-h-0">
                <TemplateBrowsePanel />
            </div>
        </div>
    );
}
