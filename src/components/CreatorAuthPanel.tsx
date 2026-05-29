import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, BookOpen, CalendarDays, Loader2, Smartphone, Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppleMark, GoogleMark } from './BrandMarks';

interface Props {
    /** Two CTAs that look identical visually; analytics distinguishes
     *  the funnel server-side based on which one fired. */
    onSubmit: (mode: 'login' | 'signup') => void;
    onBack: () => void;
    /** Which CTA, if any, is currently waiting on the auth + templates
     *  fetch round-trip. The clicked button swaps its brand mark for
     *  a spinner and disables both buttons so a user can't double-fire
     *  while the network is still in flight. */
    pending?: 'login' | 'signup' | null;
}

/**
 * Right-band content shown after the visitor taps "Esu kūrėja(s)".
 *
 *   1. Back link + title (no subtitle — the title is enough framing
 *      now that the persona blocks below carry the explanation).
 *   2. OAuth: Google + Apple. Same backend handler; analytics decides
 *      which funnel by provider.
 *   3. Four persona blocks — one per role we explicitly target. Each
 *      block shows an icon + role name + a one-sentence "this is what
 *      it does for YOU". Spaced out enough to be scannable, not a wall.
 */
export function CreatorAuthPanel({ onSubmit, onBack, pending = null }: Props) {
    const { t } = useTranslation();
    const personas: { icon: LucideIcon; nameKey: string; bodyKey: string }[] = [
        { icon: CalendarDays, nameKey: 'cta.creatorPersona1', bodyKey: 'cta.creatorBenefit1' },
        { icon: Stethoscope,  nameKey: 'cta.creatorPersona2', bodyKey: 'cta.creatorBenefit2' },
        { icon: BookOpen,     nameKey: 'cta.creatorPersona3', bodyKey: 'cta.creatorBenefit3' },
        { icon: Smartphone,   nameKey: 'cta.creatorPersona4', bodyKey: 'cta.creatorBenefit4' },
    ];
    const busy = pending !== null;

    return (
        <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={onBack}
                disabled={busy}
                className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeft size={14} /> {t('cta.back')}
            </button>

            <h3 className="text-base font-semibold text-ink">{t('cta.creatorLogin')}</h3>

            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={() => onSubmit('login')}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface ring-1 ring-edge text-ink text-sm font-semibold shadow-card hover:bg-surface-muted transition disabled:cursor-not-allowed disabled:hover:bg-surface"
                >
                    {pending === 'login'
                        ? <Loader2 size={16} className="animate-spin text-souply-beet" />
                        : <GoogleMark size={16} />}
                    {t('cta.loginGoogle')}
                </button>
                <button
                    type="button"
                    onClick={() => onSubmit('signup')}
                    disabled={busy}
                    /* Apple HIG: black button + white text in light,
                     * white button + black text in dark. The inverse
                     * `bg-ink text-surface` pair flips both with theme. */
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-ink text-surface text-sm font-semibold shadow-card hover:opacity-90 transition disabled:cursor-not-allowed disabled:hover:opacity-100"
                >
                    {pending === 'signup'
                        ? <Loader2 size={16} className="animate-spin" />
                        : <AppleMark size={16} />}
                    {t('cta.loginApple')}
                </button>
            </div>

            {/* Persona blocks — spaced for breathing room, body type
                bumped to text-sm so the value props don't read as fine
                print. Soft divider above so they feel like a section,
                not a footer. */}
            <div className="mt-3 pt-4 border-t border-edge/60 flex flex-col gap-4">
                <h4 className="text-xs font-bold tracking-wider uppercase text-ink-soft">
                    {t('cta.creatorBenefitsHeading')}
                </h4>
                <ul className="flex flex-col gap-3.5">
                    {personas.map(({ icon: Icon, nameKey, bodyKey }) => (
                        <li key={nameKey} className="flex gap-3">
                            <span className="grid place-items-center size-9 shrink-0 rounded-xl bg-beetTint text-souply-beetDeep">
                                <Icon size={16} strokeWidth={2} />
                            </span>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="text-sm font-semibold text-ink leading-tight">
                                    {t(nameKey)}
                                </div>
                                <p className="text-[13px] text-ink-soft leading-snug mt-1">
                                    {t(bodyKey)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
