import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { startVersionWatch } from '@/lib/versionWatcher';

/**
 * Web version gate UI (Phase 4). A dismissible bottom banner shown when a NEWER build has
 * been deployed than the one this tab loaded — the browser equivalent of the app's store
 * gate, but a reload is instant so it's a soft nudge, not a hard block. "Reload" fetches the
 * fresh shell; dismiss hides it for this session.
 */
export function UpdateToast() {
    const { t } = useTranslation();
    const [show, setShow] = useState(false);

    useEffect(() => startVersionWatch(() => setShow(true)), []);

    if (!show) return null;

    return (
        <div
            role="status"
            style={{
                position: 'fixed',
                left: '50%',
                bottom: 20,
                transform: 'translateX(-50%)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                maxWidth: '92vw',
                padding: '12px 16px',
                borderRadius: 12,
                background: '#1F2937',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                fontSize: 14,
            }}
        >
            <span>{t('updateToast.message')}</span>
            <button
                onClick={() => window.location.reload()}
                style={{
                    background: '#EC4899',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                }}
            >
                {t('updateToast.reload')}
            </button>
            <button
                onClick={() => setShow(false)}
                aria-label={t('updateToast.dismiss')}
                style={{ background: 'transparent', color: '#9CA3AF', border: 'none', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
            >
                ×
            </button>
        </div>
    );
}
