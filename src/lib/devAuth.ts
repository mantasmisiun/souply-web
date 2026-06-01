/**
 * Dev-auth bypass gate.
 *
 * Until real OAuth (Phase 5) lands, the only way into the dashboard is a
 * dev shortcut that logs straight in as a fixed UUID. That shortcut MUST
 * NOT exist in a production build. It's gated three ways:
 *
 *   1. BUILD FLAG `VITE_ENABLE_DEV_AUTH === '1'` — the primary gate. Vite
 *      inlines this at build time, so when it's absent the expression is
 *      a constant `false` and the whole bypass branch is dead-code-
 *      eliminated from the bundle (the dev UUID never ships). The test
 *      build passes the flag; the prod build does not.
 *
 *      NOTE: we deliberately do NOT gate on `MODE !== 'production'` — the
 *      TEST deployment is itself built with `vite build` (production
 *      mode), so a MODE check would wrongly kill the bypass in testing.
 *      The explicit flag is what separates test from prod.
 *
 *   2. RUNTIME HOST GUARD — even if the flag somehow leaked into a build,
 *      the bypass refuses to activate on the production domain.
 *
 * Both must pass. `DEV_USER` reads the dev identity from build-time env
 * (only populated in the test build); in prod it's empty and unused.
 */
const PROD_HOSTS = ['souply.lt', 'www.souply.lt'];

function onProdHost(): boolean {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname;
    return PROD_HOSTS.some((p) => h === p || h.endsWith(`.${p}`));
}

export const DEV_AUTH_ENABLED =
    import.meta.env.VITE_ENABLE_DEV_AUTH === '1' && !onProdHost();

export const DEV_USER = {
    id: import.meta.env.VITE_DEV_USER_ID ?? '',
    name: import.meta.env.VITE_DEV_USER_NAME ?? 'Mantas Misiūnas',
    handle: import.meta.env.VITE_DEV_USER_HANDLE ?? 'mantasm',
};
