import { useTranslation } from 'react-i18next';
import { cx } from '@/lib/cx';

/**
 * Two-state LT/EN pill. Persisted lang lives in localStorage via the
 * i18next detector, so changing it here also survives reload + the
 * dashboard route. The semantic CSS-variable tokens (bg-surface-muted,
 * text-ink, etc.) flip automatically with the active theme so the
 * switcher reads correctly on light AND dark surfaces — no `onDark`
 * prop required.
 */
export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const langs = ['lt', 'en'] as const;
    const active = i18n.resolvedLanguage === 'en' ? 'en' : 'lt';

    return (
        <div
            role="group"
            aria-label="Language"
            className="relative inline-flex p-1 rounded-full bg-surface-muted ring-1 ring-edge-subtle"
        >
            <span
                aria-hidden
                // Pill width matches each button (50% of track minus
                // the 4px container padding). Translating by exactly
                // 100% (its own width) lands it dead-on over the second
                // button — `+4px` overshoots and off-centres the EN
                // label.
                className={cx(
                    'absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-surface shadow-card',
                    'transition-transform duration-300 ease-out',
                    active === 'en' ? 'translate-x-full' : 'translate-x-0',
                )}
            />
            {langs.map((code) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => i18n.changeLanguage(code)}
                    aria-pressed={active === code}
                    // flex-1 + min-w-[40px] guarantees each button occupies
                    // exactly half the track, so the sliding pill (sized
                    // `w-[calc(50%-4px)]`) lines up under the text in both
                    // positions — "EN" being slightly narrower than "LT"
                    // doesn't decentre the highlight.
                    className={cx(
                        'relative z-10 flex-1 min-w-[40px] text-center px-3.5 py-1 text-xs font-semibold tracking-wide transition-colors duration-200',
                        active === code ? 'text-ink' : 'text-ink-soft',
                    )}
                >
                    {code.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
