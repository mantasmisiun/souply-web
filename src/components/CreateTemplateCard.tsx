import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

interface Props {
    onPress: () => void;
}

/**
 * "Create template" tile. Lives as the first card in the dashboard
 * grid so the primary creator action is always one click away and
 * occupies the same spatial slot regardless of how many templates a
 * creator owns.
 *
 * Minimalist by design: dashed outline, centred icon + label, no
 * cover band. Reads as "outline of a card that wants to be filled
 * in" rather than another stat surface competing with the real
 * template cards beside it.
 */
export function CreateTemplateCard({ onPress }: Props) {
    const { t } = useTranslation();
    return (
        <motion.button
            type="button"
            onClick={onPress}
            layout
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            /* `bg-createWash/85` carries a touch of the pink page
             * through so the card visually nests into the page
             * instead of stamping a hard rectangle. On expand the
             * page bg animates to opaque `--create-wash`, so as
             * the card grows the underlying pink fades to cream
             * (or lifted dark) and the card appears to "paint"
             * the surface. Other dashboard cards use the same
             * token at the same opacity so the grid reads as one
             * family. */
            className="group w-full h-full min-h-[300px] rounded-3xl bg-createWash/85
                       border-2 border-dashed border-createWash
                       hover:bg-createWash transition
                       flex flex-col items-center justify-center gap-3 p-8"
            aria-label={t('dashboard.templates.createCardLabel')}
        >
            <span
                className="grid place-items-center size-14 rounded-2xl bg-souply-beet text-white
                           shadow-card group-hover:bg-souply-beetDeep transition-colors"
            >
                <Plus size={26} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-ink">
                {t('dashboard.templates.createCardLabel')}
            </span>
        </motion.button>
    );
}
