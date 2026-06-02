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
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        const trimmedName = name.trim();
        if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) return;
        if (trimmedName.length < 2) return;
        setError(false);
        setSubmitting(true);
        try {
            const lang = i18n.language?.startsWith('en') ? 'en' : 'lt';
            await submitBetaSignup({ name: trimmedName, email: trimmedEmail, platform, lang });
            setDone(true);
            setName('');
            setEmail('');
        } catch {
            setError(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-sm font-semibold text-ink mb-1">{t('cta.joinBeta')}</h3>
            <p className="text-xs text-ink-soft mb-4">{t('cta.joinBetaSub')}</p>

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
                <input
                    type="text"
                    autoComplete="name"
                    placeholder={t('cta.namePlaceholder')}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setDone(false); setError(false); }}
                    className="px-3.5 py-2.5 text-sm rounded-xl bg-surface-muted ring-1 ring-edge placeholder:text-ink-soft/70 text-ink focus:outline-none focus:ring-2 focus:ring-beetTint-strong/50 transition"
                />
                <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t('cta.emailPlaceholder')}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setDone(false); setError(false); }}
                    className="px-3.5 py-2.5 text-sm rounded-xl bg-surface-muted ring-1 ring-edge placeholder:text-ink-soft/70 text-ink focus:outline-none focus:ring-2 focus:ring-beetTint-strong/50 transition"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:bg-beetTint-strong transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {t('cta.send')}
                </button>
            </form>

            <AnimatePresence>
                {done && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-center gap-2 text-xs text-beetTint-strong"
                    >
                        <Check size={14} /> {t('cta.thanks')}
                    </motion.div>
                )}
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
        </div>
    );
}
