import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { AppleMark, AndroidMark } from './BrandMarks';
import { cx } from '@/lib/cx';

type Platform = 'ios' | 'android';

/**
 * App-testing signup. Stored in localStorage tonight under the key
 * `souply.betaSignups`; tomorrow this same submit flow gets pointed at
 * Mailerlite or Resend (no UI change required — just swap the persist
 * call). Layout uses a segmented platform picker because most visitors
 * have a clear iOS/Android lean and the picker doubles as a hint that
 * Souply ships native, not just web.
 */
export function BetaSignup() {
    const { t } = useTranslation();
    const [platform, setPlatform] = useState<Platform>('ios');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        const trimmedName = name.trim();
        if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) return;
        if (trimmedName.length < 2) return;
        const existing = JSON.parse(localStorage.getItem('souply.betaSignups') ?? '[]');
        existing.push({ name: trimmedName, email: trimmedEmail, platform, at: Date.now() });
        localStorage.setItem('souply.betaSignups', JSON.stringify(existing));
        setDone(true);
        setName('');
        setEmail('');
    };

    return (
        <div className="w-full">
            <h3 className="text-sm font-semibold text-souply-ink mb-1">{t('cta.joinBeta')}</h3>
            <p className="text-xs text-souply-slate mb-4">{t('cta.joinBetaSub')}</p>

            <div
                role="tablist"
                aria-label="Platform"
                className="relative inline-flex w-full p-1 rounded-full bg-souply-mist/80 ring-1 ring-souply-border mb-3"
            >
                <span
                    aria-hidden
                    className={cx(
                        'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-card',
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
                            platform === p ? 'text-souply-ink' : 'text-souply-slate',
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
                    onChange={(e) => { setName(e.target.value); setDone(false); }}
                    className="px-3.5 py-2.5 text-sm rounded-xl bg-souply-mist/60 ring-1 ring-souply-border placeholder:text-souply-slate/70 text-souply-ink focus:outline-none focus:ring-2 focus:ring-souply-beetDeep/50 transition"
                />
                <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t('cta.emailPlaceholder')}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setDone(false); }}
                    className="px-3.5 py-2.5 text-sm rounded-xl bg-souply-mist/60 ring-1 ring-souply-border placeholder:text-souply-slate/70 text-souply-ink focus:outline-none focus:ring-2 focus:ring-souply-beetDeep/50 transition"
                />
                <button
                    type="submit"
                    className="px-3.5 py-2.5 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:bg-souply-beetDeep transition-colors"
                >
                    {t('cta.send')}
                </button>
            </form>

            <AnimatePresence>
                {done && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-center gap-2 text-xs text-souply-beetDeep"
                    >
                        <Check size={14} /> {t('cta.thanks')}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
