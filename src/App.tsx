import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { PublicTemplateView } from './pages/PublicTemplateView';
import { JoinInviteView } from './pages/JoinInviteView';
import { AuthCallback } from './pages/AuthCallback';
import { LegalPage } from './pages/LegalPage';
import { NotFound } from './pages/NotFound';
import { SideBand } from './components/SideBand';
import { MobileLandingSheet } from './components/MobileLandingSheet';
import { FeatureCarousel } from './components/FeatureCarousel';
import { DashboardRail } from './components/DashboardRail';
import { DashboardGrid } from './components/DashboardGrid';
import { CreateTemplateView } from './components/CreateTemplateView';
import { TemplateBuilderRail } from './components/TemplateBuilderRail';
import { TemplateOpenSurface } from './components/TemplateOpenSurface';
import { TemplateViewRail } from './components/TemplateViewRail';
import { CoverColorPicker } from './components/CoverColorPicker';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CreateUsernameModal } from './components/CreateUsernameModal';
import { userFeatures, creatorFeatures } from './data/features';
import { useAuth } from './state/auth';
import { useCreateTemplate } from './state/createTemplate';
import { useTemplates } from './state/templates';
import { useTemplateView } from './state/templateView';
import { useThemeMode } from './state/theme';
import { useSyncDashboardUrl } from './hooks/useSyncDashboardUrl';
import { COVER_GRADIENT_OVERLAY } from './lib/coverGradient';
import { DEV_AUTH_ENABLED, DEV_USER } from './lib/devAuth';
import { oauthSignIn, toAppUser, fetchUserIdentity } from './lib/auth';
import { ease, dur } from './lib/motion';

/**
 * Top-level layout choreography, modelled as a 4-step phase machine
 * so the post-login choreography lines up to the millisecond:
 *
 *   idle           — landing page. Carousel left, band right.
 *   auth-pending   — user clicked an OAuth CTA. The clicked button
 *                    shows a spinner; nothing else has moved yet. We
 *                    fire `login()` synchronously so TemplatesProvider
 *                    starts its fetch immediately; the animation
 *                    waits until that fetch settles. If we kicked off
 *                    the band slide here, a slow network would land
 *                    the user in an empty dashboard.
 *   merging        — templates are loaded. Band starts sliding right →
 *                    left over the carousel like an eraser; in the
 *                    same frame the dashboard panel mounts in its
 *                    final position with `clip-path: inset(0 0 0 100%)`
 *                    and animates the left inset down to 0 over the
 *                    same `dur.band` window. The visible left edge of
 *                    the dashboard tracks the band's trailing right
 *                    edge — cards reveal in the space the band leaves
 *                    behind, never on top of a moving panel.
 *   dashboard      — band has landed, content swaps from SideBand to
 *                    DashboardRail, carousel unmounts. Steady state.
 *
 * Band uses layoutId="band" to morph between positions; the clip-path
 * is timed to the same `dur.band` and `ease.soft` so the two motions
 * read as one piece of choreography even though they're separate
 * Framer animations.
 */
type Phase = 'idle' | 'auth-pending' | 'merging' | 'dashboard' | 'un-merging';

/**
 * Top-level route host. The landing + dashboard experience (the
 * morph/phase machine) lives in `LandingOrDashboard`, rendered at BOTH
 * `/` and `/dashboard` — the SAME component instance at the same tree
 * position, so navigating between them doesn't unmount the band and the
 * layoutId morphs survive (Step 2 wires the login→/dashboard nav + auth
 * guard). The other routes are standalone surfaces with their own
 * layouts.
 */
export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingOrDashboard />} />
            <Route path="/dashboard" element={<LandingOrDashboard />} />
            <Route path="/t/:slug" element={<PublicTemplateView />} />
            <Route path="/join/:code" element={<JoinInviteView />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/legal/privacy" element={<LegalPage kind="privacy" />} />
            <Route path="/legal/terms" element={<LegalPage kind="terms" />} />
            <Route path="/legal/delete-account" element={<LegalPage kind="delete" />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function LandingOrDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user, isAuthed, restoring, login, logout } = useAuth();
    const { active: creating, coverColor, setCoverColor } = useCreateTemplate();
    const { viewing: viewingTemplate, tab: viewingTab } = useTemplateView();
    const { ready: templatesReady } = useTemplates();
    const { effective } = useThemeMode();
    const [bandView, setBandView] = useState<'visitor' | 'creator-auth'>('visitor');
    const [phase, setPhase] = useState<Phase>(isAuthed ? 'dashboard' : 'idle');
    const [pendingAuthMode, setPendingAuthMode] = useState<'login' | 'signup' | null>(null);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    // First sign-in with no @handle yet → require the username modal.
    const [usernameNeeded, setUsernameNeeded] = useState(false);

    // Bridge the open-surface state (?t=:id / ?tab=edit / ?create=1) to the
    // URL so the back button closes surfaces and ?t=:id deep-links work.
    useSyncDashboardUrl();

    /* Page background flips between brand pink (default) and a neutral
     * wash when the create-template flow is active. Cream in light and
     * a deep mobile-darkBg in dark — both let the pink accents (active
     * L2, L3 chips, "Į šabloną" CTAs, product highlights) pop instead
     * of blending with the page. */
    const PAGE_BG_PINK   = '#EB6784';
    const PAGE_BG_CREATE = effective === 'dark' ? '#302C34' : '#FBF3E6';
    const pageBg = creating ? PAGE_BG_CREATE : PAGE_BG_PINK;
    // Carousel audience is implicit — opening the creator auth panel
    // switches the cards to the creator-focused set; backing out flips
    // them back to the shopper set.
    const audience: 'user' | 'creator' = bandView === 'creator-auth' ? 'creator' : 'user';

    /**
     * OAuth CTA click. We fire login() synchronously so TemplatesProvider
     * picks up the userId and starts fetching — but we deliberately do
     * NOT start the band slide here. The phase stays at 'auth-pending'
     * until `templatesReady` flips true via the effect below.
     */
    const onAuthenticated = (mode: 'login' | 'signup') => {
        if (phase !== 'idle') return; // double-tap guard
        // DEV BYPASS — gated by lib/devAuth (build flag + host guard).
        // When disabled (prod build) this branch is dead-code-eliminated
        // and the dev UUID never ships. Real Google/Apple OAuth replaces
        // the bypass here in Phase 5; for now a disabled bypass means the
        // CTA simply doesn't authenticate (the dev button isn't rendered
        // either, so this is unreachable in prod until Phase 5).
        if (!DEV_AUTH_ENABLED) {
            console.warn('[auth] dev bypass disabled in this build; real OAuth lands in Phase 5');
            return;
        }
        setPendingAuthMode(mode);
        setPhase('auth-pending');
        login({ id: DEV_USER.id, name: DEV_USER.name, handle: DEV_USER.handle });
        // Hydrate avatar + name from server state so anything set on the app
        // (for the same user id) shows here too.
        fetchUserIdentity(DEV_USER.id)
            .then((f) => {
                const fn = f.firstName ?? '', ln = f.lastName ?? '';
                const nm = [fn, ln].filter(Boolean).join(' ') || DEV_USER.name;
                login({ id: DEV_USER.id, name: nm, firstName: fn, lastName: ln, handle: f.username ?? DEV_USER.handle, avatarUrl: f.avatarUrl });
            })
            .catch(() => { /* keep the local DEV_USER */ });
    };

    /**
     * Real Google sign-in. GIS hands us the ID-token credential; we
     * exchange it at /api/auth/oauth (which sets the session cookie and
     * returns the verified user), then drive the same phase machine as
     * the dev bypass so the merge animation plays. On failure we fall
     * back to the landing state.
     */
    const onGoogleCredential = async (idToken: string) => {
        if (phase !== 'idle') return;
        setPendingAuthMode('login');
        setPhase('auth-pending');
        try {
            const { user } = await oauthSignIn({ provider: 'google', idToken });
            login(toAppUser(user));
            // First sign-in (no username yet) → require a @handle. The modal
            // overlays the dashboard; it's not dismissible until one is set.
            if (!user.username) setUsernameNeeded(true);
        } catch {
            setPendingAuthMode(null);
            setPhase('idle');
        }
    };

    /** Real Sign in with Apple (web) — same exchange + phase machine as
     *  Google; the Apple JS popup hands up the id_token. */
    const onAppleCredential = async (idToken: string) => {
        if (phase !== 'idle') return;
        setPendingAuthMode('signup');
        setPhase('auth-pending');
        try {
            const { user } = await oauthSignIn({ provider: 'apple', idToken });
            login(toAppUser(user));
            if (!user.username) setUsernameNeeded(true);
        } catch {
            setPendingAuthMode(null);
            setPhase('idle');
        }
    };

    /**
     * Restore: once /api/auth/me settles with a cookie-authed creator,
     * jump straight to the dashboard (no merge replay — a reload
     * shouldn't animate). Only fires from the idle landing state.
     */
    useEffect(() => {
        if (!restoring && isAuthed && phase === 'idle') {
            setPhase('dashboard');
            // Safety net: a creator who signed in but never set a @handle
            // (e.g. closed the tab during the modal) gets re-prompted on the
            // next visit, so the "must pick a username" rule always holds.
            if (user && !user.handle) setUsernameNeeded(true);
        }
    }, [restoring, isAuthed, phase, user]);

    /**
     * Gate 1: auth-pending → merging once templates are loaded.
     * Kept as a side-effect-free transition (no setTimeout here) so
     * its cleanup doesn't fire when the phase change triggers a
     * re-run — bug we hit when both transitions lived in one effect:
     * the `merging` re-render cancelled the timeout that was supposed
     * to advance us to `dashboard`, leaving the rail forever empty.
     */
    useEffect(() => {
        if (phase !== 'auth-pending') return;
        if (!isAuthed) return;
        if (!templatesReady) return;
        setPendingAuthMode(null);
        setPhase('merging');
    }, [phase, isAuthed, templatesReady]);

    /**
     * Gate 2: merging → dashboard after the band's travel time + a
     * one-frame tail. Owns its own effect so the timer is tied to
     * the `merging` phase's lifetime — when phase advances to
     * `dashboard`, the timer has already fired (clearTimeout on an
     * already-fired timer is a no-op), and the cleanup is benign.
     */
    useEffect(() => {
        if (phase !== 'merging') return;
        const tail = window.setTimeout(() => setPhase('dashboard'), dur.band * 1000 + 60);
        return () => window.clearTimeout(tail);
    }, [phase]);

    /**
     * Logout: open confirm dialog. Owned by App so the dialog survives
     * the rail unmounting mid-animation (it would disappear with the
     * rail if owned by DashboardRail). Confirm kicks off un-merging;
     * Cancel just dismisses.
     */
    const requestLogout = () => setLogoutConfirmOpen(true);

    const confirmLogout = () => {
        setLogoutConfirmOpen(false);
        // Reset the landing band view BEFORE entering un-merging so
        // that, when the SideBand mounts at the end of the slide, it
        // opens on the visitor copy — not the creator-auth form the
        // user left it on before logging in.
        setBandView('visitor');
        setPhase('un-merging');
    };

    /**
     * Gate 3: un-merging → idle after the band's reverse slide. Mirror
     * of Gate 2 — same dur.band + 60 ms tail so login and logout feel
     * like the same animation played both directions. logout() fires
     * at the moment of phase reset so AuthProvider clears the user and
     * TemplatesProvider drops the cached templates.
     */
    useEffect(() => {
        if (phase !== 'un-merging') return;
        const tail = window.setTimeout(() => {
            logout();
            setPhase('idle');
        }, dur.band * 1000 + 60);
        return () => window.clearTimeout(tail);
    }, [phase, logout]);

    /**
     * Route ⟷ phase sync. The phase machine owns the ANIMATION; the URL
     * just follows it on the two TERMINAL phases (not mid-transition),
     * so login lands on /dashboard, logout returns to /, and an authed
     * direct-load of / is pushed to /dashboard — without replaying the
     * merge slide mid-flight. Navigating between / and /dashboard keeps
     * the SAME LandingOrDashboard instance mounted (same route element
     * type/position), so the band + layoutId morphs are never torn down.
     */
    useEffect(() => {
        // While auth is still restoring we don't yet know the terminal phase.
        // `phase` is transiently 'idle' during a reload of an authed session,
        // so syncing now would navigate('/') and DROP the query string
        // (?create=1 / ?t=) before the surface can be restored. Wait for the
        // restore to settle — by then pathname already matches the phase, so
        // no navigate fires and the params survive.
        if (restoring) return;
        if (phase === 'dashboard' && pathname !== '/dashboard') {
            navigate('/dashboard', { replace: true });
        } else if (phase === 'idle' && pathname !== '/') {
            navigate('/', { replace: true });
        }
    }, [phase, pathname, navigate, restoring]);

    /**
     * Auth guard. A logged-out visit to /dashboard (direct nav, refresh
     * after logout, bookmark) bounces to the landing page. Wired to
     * today's simulated `isAuthed`; Phase 5 swaps only the source. Done
     * as an in-component effect rather than a <RequireAuth> wrapper on
     * purpose — a wrapper would change the route element type between
     * / and /dashboard and unmount the morphing band.
     */
    useEffect(() => {
        if (restoring) return; // don't bounce before auth is known (drops the query)
        if (!isAuthed && pathname === '/dashboard') {
            navigate('/', { replace: true });
        }
    }, [isAuthed, pathname, navigate, restoring]);

    const features = audience === 'user' ? userFeatures : creatorFeatures;
    // Carousel rides the whole landing/morph window — mounted from
    // idle through both directions of the slide. It only disappears
    // in the steady `dashboard` state. On un-merging it re-mounts at
    // the moment the band starts sliding back, so the slide visually
    // un-erases it as the band's left edge passes back over.
    const showCarousel  = phase !== 'dashboard';
    // Band sits in the left rail ONLY while the dashboard is being
    // built up or steady — when un-merging fires the band's className
    // flips back to floating-right and layoutId morphs it back.
    const bandAtLeft    = phase === 'merging' || phase === 'dashboard';
    // Dashboard stays mounted through un-merging so its clip-path can
    // animate back (cards slide / fade out as the clip rolls in from
    // the right). Unmounts at phase=idle.
    const showDashboard = phase === 'merging' || phase === 'dashboard' || phase === 'un-merging';
    // Rail content (creator details + stats + sign out) lives in the
    // band during both `dashboard` and `un-merging`, so the user can
    // see their profile slide away with the band instead of snapping
    // to the SideBand mid-motion.
    const railInBand    = phase === 'dashboard' || phase === 'un-merging';

    return (
        <motion.main
            initial={false}
            animate={{ backgroundColor: pageBg }}
            transition={{ duration: dur.base, ease: ease.soft }}
            className="relative min-h-screen w-full overflow-hidden"
        >
            {/* Diffuse light spots — keeps the pink from feeling flat */}
            <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-[36rem] rounded-full bg-souply-blush opacity-60 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 right-10 size-[28rem] rounded-full bg-beetTint-strong opacity-30 blur-3xl" />

            {/* Carousel — mounted through the merging phase on purpose
                so the band actually has something to pass over. Exits
                at the moment phase flips to 'dashboard' (band has
                already landed and the clip-reveal has uncovered the
                grid), so the carousel under the band's footprint
                disappears off-stage with a quick fade. */}
            <AnimatePresence>
                {showCarousel && (
                    <motion.div
                        key="carousel"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ duration: dur.base, ease: ease.soft }}
                        // Scrollable: at large device display-zoom / text size the
                        // card grows past the viewport. Centring it (items-center)
                        // inside an overflow-hidden page clipped the title (top) and
                        // the arrows + dots (bottom). The min-h-full inner wrapper
                        // keeps the normal fits-in-viewport case perfectly centred,
                        // and lets it scroll only when it can't fit.
                        className="absolute inset-y-0 left-0 right-0 md:right-[420px] overflow-x-hidden overflow-y-auto px-8 md:pl-20 md:pr-12"
                        style={{ zIndex: 1 }}
                    >
                        <div className="min-h-full flex items-center justify-center py-6 md:py-16">
                            <FeatureCarousel cards={features} audienceKey={audience} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dashboard panel — mounted across merging + dashboard +
                un-merging. During merging the clip-path animates from
                100% (fully clipped) to 0 (fully visible) over dur.band;
                during un-merging it runs in reverse so cards collapse
                back behind the moving band. After merging the section
                stays mounted with no further animation; subsequent
                re-mounts (when the create-template flow closes) skip
                the entry via `initial={false}` so they don't replay
                the reveal. */}
            {showDashboard && !creating && !viewingTemplate && (
                <motion.section
                    initial={phase === 'merging' ? { clipPath: 'inset(0 0 0 100%)' } : false}
                    animate={{ clipPath: phase === 'un-merging' ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0)' }}
                    transition={{ duration: dur.band, ease: ease.soft }}
                    /* Solid pink bg matches the page so the section's
                     * transparent gutters (between cards / left of the
                     * 420 px padding) don't expose the carousel
                     * underneath during the reveal. The page bg
                     * itself is the same hex, so the painted bg is
                     * visually invisible in steady state. */
                    className="absolute inset-y-0 left-0 right-0 sm:pl-[420px] overflow-y-auto"
                    style={{ zIndex: 2, backgroundColor: PAGE_BG_PINK }}
                >
                    <DashboardGrid reverse={phase === 'un-merging'} />
                </motion.section>
            )}

            {/* THE BAND — single morphing element. The className flip
                between right-floating and left-rail happens the moment
                phase enters 'merging', so the band starts sliding at
                the same instant the dashboard begins its clip reveal.
                layoutId="band" handles the position interpolation;
                the duration + easing here match the dashboard's
                clip animation so the band's right edge tracks the
                dashboard's revealing left edge throughout the slide.

                bg-surface / shadow-band / rounded live on THIS outer
                element so the visible panel is owned by the morphing
                layoutId — not by whichever inner view is currently
                mounted. Without this, the inner content swap at the
                end of un-merging (rail block → SideBand) would
                briefly remove the bg and the user would see the band
                "disappear, then load in" between frames. With bg on
                the outer, the panel paints continuously across every
                content swap; inner views only own their content. */}
            <motion.div
                layout
                layoutId="band"
                transition={{ duration: dur.band, ease: ease.soft, layout: { duration: dur.band, ease: ease.soft } }}
                className={
                    bandAtLeft
                        ? 'absolute top-0 bottom-0 left-0 w-[88vw] sm:w-[420px] bg-surface shadow-band md:rounded-r-[40px] overflow-hidden'
                        // Landing band is desktop-only; on mobile it's replaced
                        // by the slide-in MobileLandingSheet (rendered below).
                        : 'hidden sm:block absolute top-4 bottom-4 right-4 md:top-6 md:bottom-6 md:right-6 w-[88vw] sm:w-[380px] md:w-[400px] bg-surface shadow-band rounded-l-[40px] md:rounded-[40px] overflow-hidden'
                }
                style={{ zIndex: 10 }}
            >
                {railInBand ? (
                    <motion.div
                        /* Fade the rail's CONTENT — not the panel itself.
                         * bg / shadow / rounded live on the outer
                         * motion.div above, so this opacity animation
                         * never touches the panel's visible surface and
                         * the user always sees the band even when the
                         * rail content has dissolved mid-slide. By the
                         * end of un-merging the content is at opacity
                         * 0, so the swap to SideBand doesn't snap a
                         * profile block in over a sliding panel. */
                        animate={{ opacity: phase === 'un-merging' ? 0 : 1 }}
                        transition={{ duration: phase === 'un-merging' ? 0.35 : 0.3, ease: ease.soft }}
                        className="relative h-full w-full"
                    >
                        <AnimatePresence mode="wait">
                            {/* viewingTemplate ranks above creating
                                because the view rail seeds
                                createTemplate state on mount (it needs
                                the items list bound to the same place
                                the Redaguoti panel writes into). That
                                seed flips `active` to true, so if we
                                gated on creating first the rail would
                                immediately swap to TemplateBuilderRail
                                and the Peržiūra/Redaguoti switch would
                                vanish in the same render cycle. */}
                            {viewingTemplate ? (
                                /* Unified Atverti rail — same component
                                 * for both Peržiūra and Redaguoti so
                                 * switching tabs only re-renders the
                                 * inner controls (cover picker, name
                                 * input, stepper) read-only ↔ editable.
                                 * The rail itself never unmounts, the
                                 * items list keeps its rows, the tab
                                 * switcher stays visible across modes. */
                                <motion.div
                                    key="view-rail"
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.28, ease: ease.soft }}
                                    className="absolute inset-0"
                                >
                                    <TemplateViewRail />
                                </motion.div>
                            ) : creating ? (
                                <motion.div
                                    key="builder-rail"
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.28, ease: ease.soft }}
                                    className="absolute inset-0"
                                >
                                    <TemplateBuilderRail onSaved={() => { /* state already cleared by save() */ }} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="dashboard-rail"
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 16 }}
                                    transition={{ duration: 0.28, ease: ease.soft }}
                                    className="absolute inset-0"
                                >
                                    <DashboardRail onLogoutRequest={requestLogout} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <SideBand
                        view={bandView}
                        isMerging={phase === 'merging'}
                        pendingAuthMode={pendingAuthMode}
                        onOpenCreatorAuth={() => setBandView('creator-auth')}
                        onBackToVisitor={() => setBandView('visitor')}
                        onAuthenticated={onAuthenticated}
                        onGoogleCredential={onGoogleCredential}
                        onAppleCredential={onAppleCredential}
                    />
                )}
            </motion.div>

            {/* Mobile-only landing sheet (`sm:hidden` inside). On phones the
                desktop band above is hidden; this gives a pink pull-tab + a
                slide-in sheet with the sign-up form and a no-login creator
                info view. */}
            {phase === 'idle' && (
                <MobileLandingSheet
                    bandView={bandView}
                    onOpenCreatorAuth={() => setBandView('creator-auth')}
                    onBackToVisitor={() => setBandView('visitor')}
                />
            )}

            {/* Atverti surface — hosts BOTH tabs internally. The
                page-level coloured bar paints the top across rail +
                main; the surface starts below the bar via its internal
                `pt-16`. Mounting is gated only on `viewingTemplate`
                (not on the tab) so flipping Peržiūra ↔ Redaguoti
                doesn't unmount CategoriesPanel and force a re-fetch. */}
            {phase === 'dashboard' && viewingTemplate && (
                <TemplateOpenSurface />
            )}
            {/* Page-level coloured top band — rendered for BOTH
                Peržiūra and Redaguoti so the bar extends behind the
                rail in either tab. Lives at zIndex 3: above the
                right-area surface (z=2) so the colour paints the
                top stripe AND the rounded-corner cutout where the
                rail clips out, but below the band (z=10) so the
                rail body keeps its bg-surface look.

                In Redaguoti mode we additionally overlay the
                CoverColorPicker on the right edge of the bar so it
                reads exactly like the create flow's top bar — same
                location, same component, no duplicate strip. */}
            {phase === 'dashboard' && viewingTemplate && (
                <motion.div
                    aria-hidden={viewingTab !== 'edit'}
                    animate={{ backgroundColor: coverColor }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-0 left-0 right-0 h-16 shadow-card"
                    style={{ zIndex: 3, pointerEvents: viewingTab === 'edit' ? 'auto' : 'none', backgroundImage: COVER_GRADIENT_OVERLAY }}
                >
                    {viewingTab === 'edit' && (
                        <div className="h-full flex items-center justify-end px-7 md:px-10">
                            <CoverColorPicker value={coverColor} onChange={setCoverColor} />
                        </div>
                    )}
                </motion.div>
            )}

            {/* Edit-mode surface removed — TemplateOpenSurface now
                renders BOTH tabs internally with an AnimatePresence
                cross-fade so the layoutId-bound section never
                unmounts when the user flips Peržiūra ↔ Redaguoti. */}

            {/* Create-template surface. Same layoutId="create-surface"
                connection as the Kurti šabloná card so the card grows
                into the surface on open and shrinks back on cancel.
                Only rendered when no template is being viewed. */}
            {phase === 'dashboard' && !viewingTemplate && creating && (
                <motion.section
                    layoutId="create-surface"
                    transition={{ duration: 0.45, ease: ease.soft }}
                    /* Same `bg-createWash` as the Kurti šabloná card —
                     * keeps the surface a single solid colour through
                     * the morph so the card visually grows into the
                     * page rather than crossfading. */
                    className="absolute inset-y-0 left-0 right-0 sm:pl-[420px] overflow-hidden bg-createWash"
                    style={{ zIndex: 2 }}
                >
                    <CreateTemplateView />
                </motion.section>
            )}
            {/* Page-level coloured top band for the create flow — same
                treatment as the Atverti bar so the colour extends behind
                the rail's rounded-corner cutout (zIndex 3: above the
                surface at z=2, below the band at z=10). The create flow
                is always "editing", so the CoverColorPicker is always
                shown on the right. CreateTemplateView's own bar was
                removed in favour of this so the two flows match. */}
            {phase === 'dashboard' && !viewingTemplate && creating && (
                <motion.div
                    animate={{ backgroundColor: coverColor }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-0 left-0 right-0 h-16 shadow-card"
                    style={{ zIndex: 3, backgroundImage: COVER_GRADIENT_OVERLAY }}
                >
                    <div className="h-full flex items-center justify-end px-7 md:px-10">
                        <CoverColorPicker value={coverColor} onChange={setCoverColor} />
                    </div>
                </motion.div>
            )}

            <ConfirmDialog
                open={logoutConfirmOpen}
                title={t('dashboard.logoutConfirm.title')}
                body={t('dashboard.logoutConfirm.body')}
                yesLabel={t('dashboard.logoutConfirm.yes')}
                noLabel={t('dashboard.logoutConfirm.no')}
                onConfirm={confirmLogout}
                onCancel={() => setLogoutConfirmOpen(false)}
            />

            <CreateUsernameModal
                open={usernameNeeded}
                onDone={(username) => {
                    if (user) login({ ...user, handle: username });
                    setUsernameNeeded(false);
                }}
            />
        </motion.main>
    );
}
