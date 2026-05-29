import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FeatureCard } from '@/data/features';
import { FeatureCardMockup } from './FeatureCardMockup';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';

interface Props {
    cards: FeatureCard[];
    /** Bumping this resets the index — used to restart from card 0 when
     *  the audience flips between user and creator so the new set always
     *  opens with its anchor pitch. */
    audienceKey: string;
    autoplayMs?: number;
}

interface State { index: number; dir: 1 | -1; }
type Action = { type: 'next' } | { type: 'prev' } | { type: 'goto'; index: number };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'next': return { index: (state.index + 1), dir: 1 };
        case 'prev': return { index: (state.index - 1), dir: -1 };
        case 'goto': return { index: action.index, dir: action.index > state.index ? 1 : -1 };
    }
}

/**
 * Auto-advancing carousel of feature mockups. Behaviour notes:
 *  - 6s default cadence (matches mobile onboarding feel — long enough
 *    to read the body, short enough to keep momentum).
 *  - Pauses on hover, focus inside, or window blur so we don't burn
 *    cycles for a non-watching visitor.
 *  - Keyboard arrows are global when the carousel has focus; pages
 *    advance by one card and reset the autoplay timer.
 *  - AnimatePresence with `mode="popLayout"` keeps height stable while
 *    cross-fading + sliding cards — no layout pump.
 */
export function FeatureCarousel({ cards, audienceKey, autoplayMs = 6000 }: Props) {
    const { t } = useTranslation();
    const [{ index, dir }, dispatch] = useReducer(reducer, { index: 0, dir: 1 });
    const rootRef = useRef<HTMLDivElement>(null);
    const pausedRef = useRef(false);
    const cardCount = cards.length;
    const safeIndex = ((index % cardCount) + cardCount) % cardCount;
    const current = cards[safeIndex];

    // Reset on audience change so the new card set starts at zero.
    useEffect(() => { dispatch({ type: 'goto', index: 0 }); }, [audienceKey]);

    useEffect(() => {
        if (cardCount <= 1) return;
        const tick = window.setInterval(() => {
            if (!pausedRef.current) dispatch({ type: 'next' });
        }, autoplayMs);
        return () => window.clearInterval(tick);
    }, [autoplayMs, cardCount]);

    const onMouseEnter = useCallback(() => { pausedRef.current = true; }, []);
    const onMouseLeave = useCallback(() => { pausedRef.current = false; }, []);
    const onFocus = useCallback(() => { pausedRef.current = true; }, []);
    const onBlur = useCallback(() => { pausedRef.current = false; }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!rootRef.current?.contains(document.activeElement)) return;
            if (e.key === 'ArrowRight') { dispatch({ type: 'next' }); e.preventDefault(); }
            if (e.key === 'ArrowLeft')  { dispatch({ type: 'prev' }); e.preventDefault(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const variants = useMemo(() => ({
        enter:  (d: number) => ({ x: d > 0 ? 64 : -64, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:   (d: number) => ({ x: d > 0 ? -64 : 64, opacity: 0 }),
    }), []);

    return (
        <div
            ref={rootRef}
            tabIndex={0}
            aria-roledescription="carousel"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onFocus}
            onBlur={onBlur}
            className="relative w-full max-w-3xl outline-none focus-visible:ring-2 focus-visible:ring-beetTint-strong/40 rounded-[40px]"
            data-testid="feature-carousel"
        >
            <div className="relative min-h-[440px] md:min-h-[480px] flex items-center">
                <AnimatePresence custom={dir} mode="popLayout" initial={false}>
                    <motion.div
                        key={`${audienceKey}-${safeIndex}`}
                        custom={dir}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.55, ease: ease.soft }}
                        className="w-full"
                    >
                        <FeatureCardMockup
                            icon={current.icon}
                            title={t(`${current.i18n}.title`)}
                            body={t(`${current.i18n}.body`)}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-6 gap-4">
                <button
                    type="button"
                    aria-label={t('carousel.prev')}
                    onClick={() => dispatch({ type: 'prev' })}
                    /* Carousel sits over the pink page, so we use
                     * surface (white in light, dark in dark) for the
                     * button background and ink (the inverse) for the
                     * arrow itself — same contrast against pink in
                     * both themes. */
                    className="size-11 rounded-full bg-surface text-ink ring-1 ring-surface/40 shadow-card hover:opacity-90 transition"
                >
                    <ChevronLeft className="mx-auto" size={20} />
                </button>

                <div role="tablist" className="flex items-center gap-2">
                    {cards.map((card, i) => (
                        <button
                            key={card.id}
                            type="button"
                            role="tab"
                            aria-selected={i === safeIndex}
                            aria-label={t('carousel.dotLabel', { n: i + 1 })}
                            onClick={() => dispatch({ type: 'goto', index: i })}
                            className={cx(
                                'h-2 rounded-full transition-all duration-300',
                                i === safeIndex
                                    ? 'w-6 bg-surface'
                                    : 'w-2 bg-surface/55 hover:bg-surface/80',
                            )}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    aria-label={t('carousel.next')}
                    onClick={() => dispatch({ type: 'next' })}
                    /* Carousel sits over the pink page, so we use
                     * surface (white in light, dark in dark) for the
                     * button background and ink (the inverse) for the
                     * arrow itself — same contrast against pink in
                     * both themes. */
                    className="size-11 rounded-full bg-surface text-ink ring-1 ring-surface/40 shadow-card hover:opacity-90 transition"
                >
                    <ChevronRight className="mx-auto" size={20} />
                </button>
            </div>
        </div>
    );
}
