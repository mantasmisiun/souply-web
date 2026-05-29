import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { AppleMark, GoogleMark } from './BrandMarks';

interface Props {
    /** Two CTAs that look identical visually; analytics distinguishes
     *  the funnel server-side based on which one fired. */
    onSubmit: (mode: 'login' | 'signup') => void;
    onBack: () => void;
}

/**
 * Right-band content shown after the visitor taps "Esu kūrėja(s)".
 * Two OAuth buttons (Google + Apple) plus a back link. Visually
 * intentional that the two CTAs above the OAuth row look identical —
 * the difference between login and create is just analytics intent,
 * the OAuth flow is the same one used in the mobile app's
 * PublishWallModal.
 */
export function CreatorAuthPanel({ onSubmit, onBack }: Props) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-3">
            <button
                type="button"
                onClick={onBack}
                className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-souply-slate hover:text-souply-ink transition"
            >
                <ArrowLeft size={14} /> {t('cta.back')}
            </button>

            <h3 className="text-sm font-semibold text-souply-ink">{t('cta.creatorLogin')}</h3>
            <p className="text-xs text-souply-slate -mt-1">{t('cta.createCreator')}</p>

            <button
                type="button"
                onClick={() => onSubmit('login')}
                className="mt-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white ring-1 ring-souply-border text-souply-ink text-sm font-semibold shadow-card hover:bg-souply-mist transition"
            >
                <GoogleMark size={16} />
                {t('cta.loginGoogle')}
            </button>
            <button
                type="button"
                onClick={() => onSubmit('signup')}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-souply-ink text-white text-sm font-semibold shadow-card hover:bg-black transition"
            >
                <AppleMark size={16} />
                {t('cta.loginApple')}
            </button>
        </div>
    );
}
