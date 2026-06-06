import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    icon: LucideIcon;
    title: string;
    body: string;
}

/**
 * Single-card visual used inside the landing carousel. Two columns:
 * left — heading + one-line body + tiny brand tag, right — phone-shaped
 * mockup panel holding the feature's icon over the Souply gradient.
 * Once we have real app screenshots, the right column swaps to an
 * `<img>` while the left stays identical.
 */
export function FeatureCardMockup({ icon: Icon, title, body }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,260px)] gap-8 items-center w-full">
            <div className="text-left">
                <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-beetTint text-beetTint-strong text-[11px] font-semibold tracking-wider uppercase">
                    <span className="size-1.5 rounded-full bg-souply-beet" />
                    Souply
                </div>
                {/* On the pink page we want the inverse of the
                 *  surface tokens — white-ish text in light theme,
                 *  dark text in dark theme — so the words always
                 *  contrast against pink, not against the band. */}
                <h2 className="font-display font-bold text-surface tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.05] mb-4">
                    {title}
                </h2>
                <p className="text-surface/80 text-base md:text-lg leading-relaxed max-w-md">
                    {body}
                </p>
            </div>
            <motion.div
                initial={{ rotateY: 8, rotateX: -2 }}
                whileHover={{ rotateY: -6, rotateX: 4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                className="relative mx-auto md:mx-0"
                style={{ perspective: 1000 }}
            >
                {/* Height is viewport-capped (and width follows the 1:2 phone
                    aspect) so at large display-zoom the mockup shrinks to fit
                    instead of forcing the page to scroll. */}
                <div className="relative aspect-[1/2] h-[min(420px,42vh)] rounded-[40px] mockup-grad shadow-pop ring-1 ring-white/40">
                    {/* Faux notch + screen content */}
                    <div className="absolute inset-x-0 top-2 h-6 flex justify-center">
                        <span className="w-20 h-5 rounded-full bg-ink/40" />
                    </div>
                    <div className="absolute inset-3 top-10 rounded-[28px] bg-white/15 backdrop-blur-[2px] ring-1 ring-white/30 flex items-center justify-center">
                        <Icon size={84} strokeWidth={1.4} className="text-white/90 drop-shadow-md" />
                    </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-3 w-32 rounded-full bg-black/20 blur-md" />
            </motion.div>
        </div>
    );
}
