/**
 * Web version watcher (Phase 4). Compares the build id this tab was loaded with
 * (VITE_BUILD_ID, embedded at build time) against the server's currently-deployed id
 * (GET /version.json, served no-cache). On a mismatch — i.e. a new deploy landed while this
 * tab stayed open — it invokes the callback so the UI can offer a reload.
 *
 * Polls on an interval AND when the tab regains focus/visibility (the common case: the user
 * comes back to a day-old tab). Fail-safe: no build id (dev), an offline poll, or a bad
 * response just does nothing — it never disrupts the running app.
 */

const OWN_BUILD_ID = import.meta.env.VITE_BUILD_ID as string | undefined;
const POLL_MS = 5 * 60 * 1000;

export function startVersionWatch(onNewVersion: () => void): () => void {
    // Nothing to compare against in dev (no embedded id) → no-op.
    if (!OWN_BUILD_ID) return () => {};

    let stopped = false;
    let notified = false;

    const check = async () => {
        if (stopped || notified) return;
        try {
            const res = await fetch('/version.json', { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            if (data?.buildId && data.buildId !== OWN_BUILD_ID) {
                notified = true;
                onNewVersion();
            }
        } catch {
            /* offline / server blip — try again next tick */
        }
    };

    const onVisible = () => {
        if (document.visibilityState === 'visible') void check();
    };

    const interval = window.setInterval(check, POLL_MS);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);
    void check(); // check once on start

    return () => {
        stopped = true;
        window.clearInterval(interval);
        document.removeEventListener('visibilitychange', onVisible);
        window.removeEventListener('focus', check);
    };
}
