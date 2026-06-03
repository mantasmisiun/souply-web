import { useEffect } from 'react';
import { APP_ENV } from '@/lib/env';

/**
 * Non-production marker: a fixed top pill + a `[ENV]` document-title prefix +
 * a robots `noindex` so staging never gets indexed. Renders nothing (and
 * leaves indexing alone) in production. Fixed + pointer-events:none so it
 * never disturbs the dashboard layout/animations.
 *   DEV → blue · STAGING → amber (red reserved for danger).
 */
const BADGE = {
    dev: { label: 'DEV', bg: '#2563EB' },
    staging: { label: 'STAGING', bg: '#D97706' },
    prod: null,
} as const;

export function EnvBanner() {
    const cfg = BADGE[APP_ENV];
    useEffect(() => {
        if (!cfg) return;
        const tag = `[${cfg.label}]`;
        if (!document.title.startsWith(tag)) document.title = `${tag} ${document.title}`;
        let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'robots';
            document.head.appendChild(meta);
        }
        meta.content = 'noindex, nofollow';
    }, [cfg]);

    if (!cfg) return null;
    return (
        <div
            aria-hidden
            style={{
                position: 'fixed',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                pointerEvents: 'none',
                background: cfg.bg,
                color: '#fff',
                font: '700 11px/1 system-ui, sans-serif',
                letterSpacing: 1.5,
                padding: '4px 14px',
                borderRadius: '0 0 8px 8px',
            }}
        >
            {cfg.label}
        </div>
    );
}
