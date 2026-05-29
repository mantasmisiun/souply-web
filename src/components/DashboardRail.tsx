import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/state/auth';
import { sampleProfile } from '@/data/sampleTemplates';
import { LanguageSwitcher } from './LanguageSwitcher';

const fmt = (n: number) => new Intl.NumberFormat('lt-LT', { maximumFractionDigits: 0 }).format(n);

/**
 * Dashboard left rail. Carries everything the visitor expects after the
 * band finishes its slide:
 *   - Avatar / brand mark, name + @handle
 *   - Four-up stats (templates · uses · saved · followers)
 *   - "New template" CTA
 *   - Language switcher + sign-out at the very bottom
 *
 * Contents fade IN after a 150ms beat so they don't fight the band's
 * size morph for the eye — `initial=opacity:0 → opacity:1` with a small
 * delay reads as "panel arrived first, contents settled second."
 */
export function DashboardRail() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const profile = sampleProfile;
    const name = user?.name ?? profile.name;
    const handle = user?.handle ?? profile.handle;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full p-7 md:p-8 gap-7"
        >
            <header className="flex items-center justify-between">
                <span className="grid place-items-center size-9 rounded-2xl bg-souply-beet text-white font-display font-bold shadow-card">
                    S
                </span>
                <LanguageSwitcher />
            </header>

            {/* Identity block */}
            <section>
                <div className="flex items-center gap-3">
                    <div className="size-14 rounded-full bg-gradient-to-br from-souply-beetMuted to-souply-beet ring-1 ring-white shadow-card grid place-items-center">
                        <span className="font-display text-xl font-bold text-white">
                            {name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                        </span>
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-semibold text-souply-ink">{name}</div>
                        <div className="text-xs text-souply-slate">{t('dashboard.username', { handle })}</div>
                    </div>
                </div>
            </section>

            {/* Stats grid */}
            <section className="grid grid-cols-2 gap-2 nums">
                <StatTile label={t('dashboard.stats.templates')} value={String(profile.stats.templates)} />
                <StatTile label={t('dashboard.stats.uses')}      value={fmt(profile.stats.uses)} />
                <StatTile label={t('dashboard.stats.savings')}   value={`${fmt(Number(profile.stats.savingsEur))} €`} accent />
                <StatTile label={t('dashboard.stats.followers')} value={fmt(profile.stats.followers)} />
            </section>

            <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-souply-ink text-white text-sm font-semibold shadow-card hover:bg-black transition"
            >
                <Sparkles size={16} />
                {t('dashboard.templates.newCta')}
            </button>

            <div className="flex-1" />

            <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-souply-slate hover:bg-souply-mist hover:text-souply-ink text-sm font-medium transition"
            >
                <LogOut size={14} /> {t('dashboard.logout')}
            </button>
        </motion.div>
    );
}

function StatTile({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="p-3 rounded-2xl bg-souply-mist/70 ring-1 ring-souply-border/70">
            <div className={accent ? 'text-souply-beetDeep font-bold text-lg leading-none' : 'text-souply-ink font-bold text-lg leading-none'}>
                {value}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-souply-slate mt-1">{label}</div>
        </div>
    );
}
