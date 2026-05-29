import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SideBand } from './components/SideBand';
import { FeatureCarousel } from './components/FeatureCarousel';
import { DashboardRail } from './components/DashboardRail';
import { DashboardGrid } from './components/DashboardGrid';
import { userFeatures, creatorFeatures } from './data/features';
import { useAuth } from './state/auth';
import { ease, dur } from './lib/motion';

/**
 * Top-level layout choreography.
 *
 *  - On the landing page the white panel sits docked to the right edge,
 *    raised 3D-style, hosting the audience switch + beta signup + creator
 *    login.
 *  - The carousel lives center-left, behind the panel's z-stack so when
 *    the panel slides over it on login the carousel passes underneath
 *    and never re-emerges on the right (per the brief).
 *  - The band uses Framer Motion's `layoutId="band"` trick: a single
 *    visual element morphs from "floating right column" to "left-rail
 *    of the dashboard" via an interpolated position + width animation.
 *    No teleport, no cross-fade — same physical panel.
 *  - The dashboard grid mounts AFTER the band finishes its slide so the
 *    cards can stagger in cleanly without competing with the morph.
 */
export default function App() {
    const { isAuthed, login } = useAuth();
    const [bandView, setBandView] = useState<'visitor' | 'creator-auth'>('visitor');
    // Carousel audience is implicit — opening the creator auth panel
    // switches the cards to the creator-focused set; backing out flips
    // them back to the shopper set.
    const audience: 'user' | 'creator' = bandView === 'creator-auth' ? 'creator' : 'user';
    /** Flips the moment the OAuth button is clicked — drives the band's
     *  right→left slide. We mount the dashboard contents only after the
     *  slide completes so the stagger animation has clean visual space. */
    const [merging, setMerging] = useState(false);

    const onAuthenticated = () => {
        setMerging(true);
        // Defer the "you're in" state by the band travel duration so the
        // dashboard rail mounts only once the band finishes morphing.
        // 80ms tail prevents a 1-frame flash of empty rail at the new
        // position.
        window.setTimeout(() => {
            login({ name: 'Mantas Misiūnas', handle: 'mantasm' });
            setMerging(false);
        }, dur.band * 1000 + 80);
    };

    const features = audience === 'user' ? userFeatures : creatorFeatures;

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-souply-beet">
            {/* Diffuse light spots — keeps the pink from feeling flat */}
            <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-[36rem] rounded-full bg-souply-blush opacity-60 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 right-10 size-[28rem] rounded-full bg-souply-beetDeep opacity-30 blur-3xl" />

            {/* Carousel — only rendered before auth; cross-fades out when login fires. */}
            <AnimatePresence>
                {!isAuthed && (
                    <motion.div
                        key="carousel"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: merging ? 0 : 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ duration: dur.base, ease: ease.soft }}
                        className="absolute inset-y-0 left-0 right-0 md:right-[420px] flex items-center justify-center px-6 md:pl-20 md:pr-12 pt-16 pb-16"
                        style={{ zIndex: 1 }}
                    >
                        <FeatureCarousel cards={features} audienceKey={audience} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* THE BAND — single morphing element. Position class swap
                triggers Framer Motion's automatic layout animation. */}
            <motion.div
                layout
                layoutId="band"
                transition={{ duration: dur.band, ease: ease.soft, layout: { duration: dur.band, ease: ease.soft } }}
                className={
                    isAuthed
                        ? 'absolute top-0 bottom-0 left-0 w-[88vw] sm:w-[420px]'
                        : 'absolute top-4 bottom-4 right-4 md:top-6 md:bottom-6 md:right-6 w-[88vw] sm:w-[380px] md:w-[400px]'
                }
                style={{ zIndex: 10 }}
            >
                {isAuthed ? (
                    <div className="relative h-full w-full bg-white shadow-band md:rounded-r-[40px]">
                        <DashboardRail />
                    </div>
                ) : (
                    <SideBand
                        view={bandView}
                        isMerging={merging}
                        onOpenCreatorAuth={() => setBandView('creator-auth')}
                        onBackToVisitor={() => setBandView('visitor')}
                        onAuthenticated={onAuthenticated}
                    />
                )}
            </motion.div>

            {/* Dashboard grid — mounted only after authentication, staggers in. */}
            <AnimatePresence>
                {isAuthed && (
                    <motion.section
                        key="dashboard-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-y-0 left-0 right-0 sm:pl-[420px] overflow-y-auto"
                        style={{ zIndex: 2 }}
                    >
                        <DashboardGrid />
                    </motion.section>
                )}
            </AnimatePresence>
        </main>
    );
}
