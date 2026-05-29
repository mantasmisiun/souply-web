import { useTranslation } from 'react-i18next';
import { Globe2, Lock } from 'lucide-react';

interface Props {
    value: 'private' | 'public';
    onChange: (next: 'private' | 'public') => void;
    /** Disables interaction; useful while the PATCH round-trip is in
     *  flight in the open-template view. */
    disabled?: boolean;
}

/**
 * Sliding pill toggle for template visibility — same interaction
 * pattern as the LT/EN switcher in the SideBand. Binary Private /
 * Public; the legacy `unlisted` value (third option on the server)
 * isn't surfaced here so the UX stays on one decision.
 *
 * When `private` the dashboard card hides its Share affordance and
 * the ShareModal explains that the QR + link are inactive — same
 * rule the mobile basket-app uses for a creator-private template.
 */
export function VisibilitySlider({ value, onChange, disabled = false }: Props) {
    const { t } = useTranslation();
    const isPublic = value === 'public';
    return (
        <div className="w-full">
            <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-1">
                {t('dashboard.templates.visibilityLabel')}
            </div>
            <div
                role="group"
                aria-label={t('dashboard.templates.visibilityLabel')}
                aria-disabled={disabled || undefined}
                className={
                    'relative w-full inline-flex rounded-xl bg-surface-muted p-1 ring-1 ring-edge ' +
                    (disabled ? 'opacity-60 pointer-events-none' : '')
                }
            >
                {/* Sliding capsule. Positions to the active half via a
                 * percentage transform so the pill stays correct at any
                 * container width (no JS measurement needed). */}
                <span
                    aria-hidden
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-souply-beet shadow-card transition-transform duration-300 ease-out"
                    style={{ transform: isPublic ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
                />
                <button
                    type="button"
                    onClick={() => onChange('private')}
                    aria-pressed={!isPublic}
                    disabled={disabled}
                    className={
                        'relative z-10 flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold py-1.5 transition-colors ' +
                        (!isPublic ? 'text-white' : 'text-ink-soft hover:text-ink')
                    }
                >
                    <Lock size={12} strokeWidth={2.5} />
                    {t('dashboard.templates.tagPrivate')}
                </button>
                <button
                    type="button"
                    onClick={() => onChange('public')}
                    aria-pressed={isPublic}
                    disabled={disabled}
                    className={
                        'relative z-10 flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold py-1.5 transition-colors ' +
                        (isPublic ? 'text-white' : 'text-ink-soft hover:text-ink')
                    }
                >
                    <Globe2 size={12} strokeWidth={2.5} />
                    {t('dashboard.templates.tagPublic')}
                </button>
            </div>
        </div>
    );
}
