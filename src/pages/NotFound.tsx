import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/** Catch-all 404. Minimal standalone layout (no band/rail). */
export function NotFound() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen grid place-items-center bg-souply-beet px-6 text-center">
            <div className="max-w-md">
                <div className="text-6xl font-black text-white mb-3">404</div>
                <h1 className="text-xl font-bold text-white mb-2">{t('pages.notFound.title')}</h1>
                <p className="text-sm text-white/80 mb-6">{t('pages.notFound.body')}</p>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-souply-beet text-sm font-semibold shadow-card hover:brightness-95 transition"
                >
                    {t('pages.notFound.home')}
                </Link>
            </div>
        </div>
    );
}
