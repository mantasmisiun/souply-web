import * as Sentry from '@sentry/react';
import { APP_ENV } from './env';

// Public, write-only ingest DSN — safe to ship in the bundle (it can only
// POST events). Overridable at build time via VITE_SENTRY_DSN.
const DEFAULT_DSN =
    'https://45634d7d9179cc23b3f7873e659feb21@o4511502732361728.ingest.de.sentry.io/4511502743699536';

const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined) ?? DEFAULT_DSN;

/**
 * Initialise crash reporting. No-op in local dev so we don't ship our own
 * console errors to Sentry; staging + prod report tagged by APP_ENV.
 * Error Monitoring only — no tracing/replay integrations (free-tier quota).
 */
export function initSentry(): void {
    if (APP_ENV === 'dev' || !dsn) return;
    Sentry.init({
        dsn,
        environment: APP_ENV,
        integrations: [],
        tracesSampleRate: 0,
    });
}

export { Sentry };
