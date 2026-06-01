import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTemplates } from '@/state/templates';
import { useTemplateView } from '@/state/templateView';
import { useCreateTemplate } from '@/state/createTemplate';
import { toCardData } from '@/lib/templateCard';

/**
 * Two-way bridge between the dashboard's open-surface state and the URL
 * query string:
 *
 *   ?t=:id            → Atverti surface open on that template
 *   ?t=:id&tab=edit   → … with the Redaguoti tab active
 *   ?create=1         → create-template flow open
 *
 * Why: so the browser **back button closes the open surface** (instead
 * of leaving the app), and a link like /dashboard?t=42 deep-links
 * straight into a template.
 *
 * Both directions derive the SAME canonical mapping and write only when
 * the result differs, so they converge without looping:
 *   - context → URL: a UI open/close/tab-change rewrites the query.
 *   - URL → context: a back/forward/deep-link reconciles the contexts.
 *
 * Opening a surface PUSHES a history entry (so back closes it); tab
 * flips and closes use REPLACE so they don't pile up history.
 *
 * `templateView.open` needs the full card object, so a `?t=:id` that
 * arrives before the templates list has loaded is retried automatically
 * (the effect re-runs when `templates` changes).
 */
export function useSyncDashboardUrl() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { templates } = useTemplates();
    const { viewing, tab, open: openView, close: closeView, setTab } = useTemplateView();
    const { active: creating, open: openCreate, cancel: cancelCreate } = useCreateTemplate();

    const tParam = searchParams.get('t');
    const tabParam = searchParams.get('tab');
    const createParam = searchParams.get('create');

    // ── URL → context ───────────────────────────────────────────────
    // CRITICAL: this effect depends ONLY on the URL params (+ templates),
    // NOT on viewing/creating/tab. If context state were in the deps, a
    // context change (e.g. openCreate setting creating=true) would re-run
    // this BEFORE the context→URL effect writes ?create=1 — so it'd see
    // "creating but no ?create in the URL", hit the cancel branch, and
    // race the two effects into a mount/unmount glitch loop. Reacting
    // only to URL changes makes this the reconciler for back/forward/
    // deep-link; context→URL owns the other direction. Context values are
    // read fresh from the closure of the render the URL change triggered.
    useEffect(() => {
        const id = tParam ? Number(tParam) : null;
        if (id != null && Number.isFinite(id)) {
            if (!viewing || viewing.id !== id) {
                const row = templates.find((r) => r.id === id);
                if (row) openView(toCardData(row));
                // else: templates not loaded yet → retry when they are.
            } else {
                const desiredTab = tabParam === 'edit' ? 'edit' : 'preview';
                if (tab !== desiredTab) setTab(desiredTab);
            }
        } else if (viewing) {
            closeView();
        } else if (createParam === '1') {
            if (!creating) openCreate();
        } else if (creating) {
            cancelCreate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tParam, tabParam, createParam, templates]);

    // ── context → URL ───────────────────────────────────────────────
    useEffect(() => {
        const next = new URLSearchParams(searchParams);
        // viewing wins over creating (templateView seeds createTemplate,
        // so `creating` is also true while a template is open).
        if (viewing) {
            next.set('t', String(viewing.id));
            if (tab === 'edit') next.set('tab', 'edit'); else next.delete('tab');
            next.delete('create');
        } else if (creating) {
            next.set('create', '1');
            next.delete('t'); next.delete('tab');
        } else {
            next.delete('t'); next.delete('tab'); next.delete('create');
        }

        if (next.toString() === searchParams.toString()) return;

        // Push only when a surface first opens (no-surface → surface) so
        // back closes it; tab flips / closes replace to keep history flat.
        const hadSurface = searchParams.has('t') || searchParams.get('create') === '1';
        const willHaveSurface = next.has('t') || next.get('create') === '1';
        setSearchParams(next, { replace: !(!hadSurface && willHaveSurface) });
    }, [viewing, tab, creating, searchParams, setSearchParams]);
}
