import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/state/auth';
import { useTemplates } from '@/state/templates';
import { sampleProfile } from '@/data/sampleTemplates';
import { ltPluralSuffix } from '@/lib/ltPlural';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

interface Props {
    /** Asks the parent (App) to open the logout-confirm dialog. App
     *  owns the dialog so it can sequence the un-merging animation
     *  precisely after Yes — the rail itself is unmounted mid-animation
     *  and a locally-owned modal would disappear with it. */
    onLogoutRequest?: () => void;
}

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
export function DashboardRail({ onLogoutRequest }: Props = {}) {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { totals } = useTemplates();
    const profile = sampleProfile;
    const name = user?.name ?? profile.name;
    const handle = user?.handle ?? profile.handle;
    // Fallback to a direct logout (no animation) when App hasn't wired
    // the confirm flow — defensive, never expected in production.
    const handleLogout = onLogoutRequest ?? logout;

    /** Pluralise stat labels for LT using CLDR rules. EN's noun list
     *  collapses to one/other which i18next handles automatically, but
     *  we route through the same suffix path for one consistent label
     *  resolution lookup. */
    const labelFor = (base: 'templates' | 'uses', count: number) => {
        const suffix = i18n.language === 'lt'
            ? ltPluralSuffix(count)
            : (count === 1 ? 'one' : 'other');
        return t(`dashboard.stats.${base}_${suffix}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full p-7 md:p-8 gap-7"
        >
            <header className="flex items-center justify-between gap-2">
                <span className="grid place-items-center size-9 rounded-2xl bg-souply-beet text-white font-display font-bold shadow-card">
                    S
                </span>
                <div className="flex items-center gap-1.5">
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Identity block */}
            <section>
                <div className="flex items-center gap-3">
                    <div className="size-14 rounded-full bg-gradient-to-br from-beetTint to-souply-beet ring-1 ring-white/15 shadow-card grid place-items-center">
                        <span className="font-display text-xl font-bold text-white">
                            {name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                        </span>
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-semibold text-ink">{name}</div>
                        <div className="text-xs text-ink-soft">{t('dashboard.username', { handle })}</div>
                    </div>
                </div>
            </section>

            {/* Stats — three tiles read from the live templates
                provider. Followers tile parked until the creator
                profile aggregator endpoint lands and there's something
                real to count. */}
            <section className="grid grid-cols-3 gap-2 nums">
                <StatTile label={labelFor('templates', totals.templates)} value={String(totals.templates)} />
                <StatTile label={labelFor('uses', totals.uses)}           value={fmt(totals.uses)} />
                <StatTile label={t('dashboard.stats.savings')}            value={`${fmt(totals.savings)} €`} accent />
            </section>

            <div className="flex-1" />

            <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-ink-soft hover:bg-white/5 hover:text-ink text-sm font-medium transition"
            >
                <LogOut size={14} /> {t('dashboard.logout')}
            </button>
        </motion.div>
    );
}

function StatTile({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="p-3 rounded-2xl bg-surface-muted ring-1 ring-white/5">
            <div className={accent ? 'text-beetTint-strong font-bold text-lg leading-none' : 'text-ink font-bold text-lg leading-none'}>
                {value}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ink-soft mt-1">{label}</div>
        </div>
    );
}
