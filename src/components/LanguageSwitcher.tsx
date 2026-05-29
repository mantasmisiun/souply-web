import { useTranslation } from 'react-i18next';
import { cx } from '@/lib/cx';

/**
 * Two-state LT/EN pill. Persisted lang lives in localStorage via the
 * i18next detector, so changing it here also survives reload + the
 * dashboard route. Designed as a single visual unit (the sliding pill
 * on the active option) so it reads as one control, not two buttons.
 */
export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const langs = ['lt', 'en'] as const;
    const active = i18n.resolvedLanguage === 'en' ? 'en' : 'lt';

    return (
        <div
            role="group"
            aria-label="Language"
            className="relative inline-flex p-1 rounded-full bg-souply-mist/80 ring-1 ring-souply-border"
        >
            <span
                aria-hidden
                className={cx(
                    'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-card',
                    'transition-transform duration-300 ease-out',
                    active === 'en' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0',
                )}
            />
            {langs.map((code) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => i18n.changeLanguage(code)}
                    aria-pressed={active === code}
                    className={cx(
                        'relative z-10 px-3.5 py-1 text-xs font-semibold tracking-wide',
                        'transition-colors duration-200',
                        active === code ? 'text-souply-ink' : 'text-souply-slate',
                    )}
                >
                    {code.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
