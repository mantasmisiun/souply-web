import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { AppleMark, AndroidMark } from './BrandMarks';
import { submitBetaSignup } from '@/lib/beta';
import { cx } from '@/lib/cx';

type Platform = 'ios' | 'android';

/**
 * App-testing signup. Submits to `POST /api/beta-signups`, which
 * persists the row server-side and fires an internal notification email
 * (see souply-api betaSignupController). Layout uses a segmented
 * platform picker because most visitors have a clear iOS/Android lean
 * and the picker doubles as a hint that Souply ships native, not just web.
 */
export function BetaSignup() {
    const { t, i18n } = useTranslation();
    const [platform, setPlatform] = useState<Platform>('ios');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);
    const [alreadyInvited, setAlreadyInvited] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(false);
    const [accepted, setAccepted] = useState(false);
    // Per-field "touched" so the inline hints only appear once a field has been
    // visited (blurred), not while the user is still typing the first char.
    const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({});

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    // Gate the button: name must look like "First Last" (≥2 words), email must
    // be well-formed, terms ticked, and no submit already in flight.
    const nameValid = trimmedName.split(/\s+/).filter(Boolean).length >= 2;
    const emailValid = /^\S+@\S+\.\S+$/.test(trimmedEmail);
    const canSubmit = nameValid && emailValid && accepted && !submitting;
    // Inline field errors — shown only after the field is touched so they tell
    // the user what to fix without nagging mid-typing.
    const nameError = touched.name && !nameValid;
    const emailError = touched.email && !emailValid;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError(false);
        setSubmitting(true);
        try {
            const lang = i18n.language?.startsWith('en') ? 'en' : 'lt';
            // Resolves only once the invite email has actually been sent (the
            // API awaits it); rejects on send failure → error state below.
            const res = await submitBetaSignup({ name: trimmedName, email: trimmedEmail, platform, lang });
            setAlreadyInvited(res?.alreadyInvited === true);
            setDone(true);
        } catch {
            setError(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-sm font-semibold text-ink mb-1">{t('cta.joinBeta')}</h3>
            {!done && <p className="text-xs text-ink-soft mb-4">{t('cta.joinBetaSub')}</p>}

            {done ? (
                /* Success — replace the whole form so there's nothing to
                   resubmit; just the confirmation that the invite was sent. */
                <div className="flex items-start gap-2.5 rounded-2xl bg-beetTint/30 ring-1 ring-edge px-4 py-3.5">
                    <Check size={18} className="mt-0.5 text-beetTint-strong shrink-0" />
                    <div>
                        <div className="text-sm font-semibold text-ink">
                            {t(alreadyInvited ? 'cta.alreadyOnList' : 'cta.invitationSent')}
                        </div>
                        <div className="text-xs text-ink-soft mt-0.5">
                            {t(alreadyInvited ? 'cta.alreadyOnListSub' : 'cta.invitationSentSub')}
                        </div>
                    </div>
                </div>
            ) : (
            <>
            <div
                role="tablist"
                aria-label="Platform"
                className="relative inline-flex w-full p-1 rounded-full bg-surface-muted ring-1 ring-edge mb-3"
            >
                <span
                    aria-hidden
                    className={cx(
                        'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-surface shadow-card',
                        'transition-transform duration-300 ease-out',
                        platform === 'android' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0',
                    )}
                />
                {(['ios', 'android'] as const).map((p) => (
                    <button
                        key={p}
                        type="button"
                        role="tab"
                        aria-selected={platform === p}
                        onClick={() => setPlatform(p)}
                        className={cx(
                            'relative z-10 flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold',
                            platform === p ? 'text-ink' : 'text-ink-soft',
                        )}
                    >
                        {p === 'ios' ? <AppleMark size={14} /> : <AndroidMark size={14} />}
                        {p === 'ios' ? t('cta.iosLabel') : t('cta.androidLabel')}
                    </button>
                ))}
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <input
                        type="text"
                        autoComplete="name"
                        placeholder={t('cta.namePlaceholder')}
                        value={name}
                        onChange={(e) => { setName(e.target.value); setDone(false); setAlreadyInvited(false); setError(false); }}
                        onBlur={() => setTouched((s) => ({ ...s, name: true }))}
                        aria-invalid={nameError || undefined}
                        className={cx(
                            'px-3.5 py-2.5 text-sm rounded-xl bg-surface-muted ring-1 placeholder:text-ink-soft/70 text-ink focus:outline-none focus:ring-2 transition',
                            nameError ? 'ring-red-400 focus:ring-red-400/50' : 'ring-edge focus:ring-beetTint-strong/50',
                        )}
                    />
                    {nameError && <span className="text-[11px] text-red-500 px-1">{t('cta.nameError')}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder={t('cta.emailPlaceholder')}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setDone(false); setAlreadyInvited(false); setError(false); }}
                        onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                        aria-invalid={emailError || undefined}
                        className={cx(
                            'px-3.5 py-2.5 text-sm rounded-xl bg-surface-muted ring-1 placeholder:text-ink-soft/70 text-ink focus:outline-none focus:ring-2 transition',
                            emailError ? 'ring-red-400 focus:ring-red-400/50' : 'ring-edge focus:ring-beetTint-strong/50',
                        )}
                    />
                    {emailError && <span className="text-[11px] text-red-500 px-1">{t('cta.emailError')}</span>}
                </div>
                <label className="flex items-start gap-2 mt-0.5 text-xs text-ink-soft cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-edge text-souply-beet focus:ring-2 focus:ring-beetTint-strong/50"
                    />
                    <span>
                        {t('cta.acceptTermsPrefix')}
                        <a
                            href="/legal/terms"
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-ink transition"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {t('cta.acceptTermsLink')}
                        </a>
                    </span>
                </label>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:bg-beetTint-strong transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {t('cta.send')}
                </button>
            </form>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-xs text-beetTint-strong"
                    >
                        {t('cta.sendError')}
                    </motion.div>
                )}
            </AnimatePresence>
            </>
            )}
        </div>
    );
}
