import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Privacy / Terms stub. Real copy lands in Phase 10 (required for the
 * Google OAuth verification + GDPR). The route + URL must exist now so
 * the OAuth consent screen can point at a live privacy URL.
 */
export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
    const { t } = useTranslation();
    const title = t(kind === 'privacy' ? 'pages.legal.privacyTitle' : 'pages.legal.termsTitle');
    return (
        <div className="min-h-screen bg-surface text-ink px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="text-sm font-semibold text-souply-beet hover:underline">
                    ← {t('brand.name')}
                </Link>
                <h1 className="text-2xl font-bold mt-4 mb-3">{title}</h1>
                <p className="text-sm text-ink-soft">{t('pages.legal.placeholder')}</p>
            </div>
        </div>
    );
}
