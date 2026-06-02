import {
    BarChart3, Bell, BookOpen, Calendar, CalendarHeart, ClipboardList, Coins, Eye, Filter,
    Gauge, History, LineChart, Repeat2, Route, ScanLine, Share2, ShieldCheck, Sparkles,
    Sprout, Store, Users, UserSquare2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Landing-page carousel cards, split by audience. Tonight they live in
 * a single static module; tomorrow's onboarding flow on mobile will
 * import the same `id` keys + i18n bodies so a card written here doesn't
 * need re-translating to surface in the app.
 *
 * Order matters — early indices are seen first. We open with the
 * elevator-pitch features (compare, scan, habits) and close with the
 * vibe + provenance features (LT-made, no-account, weekly-saver).
 */

export type FeatureId =
    | 'compare' | 'scan' | 'habits' | 'discounts' | 'history' | 'bestStore' | 'perKg'
    | 'quickRepeat' | 'multiStore' | 'route' | 'monthly' | 'privacy'
    | 'shared' | 'seasonal' | 'noAccount' | 'lt';

export type CreatorFeatureId =
    | 'share' | 'savings' | 'recipe' | 'publish' | 'profile' | 'visibility' | 'stats';

export interface FeatureCard<TId extends string = string> {
    id: TId;
    icon: LucideIcon;
    /** Translation key prefix — appended with `.title` / `.body`. */
    i18n: string;
}

export const userFeatures: FeatureCard<FeatureId>[] = [
    { id: 'compare',     icon: Store,         i18n: 'features.user.compare' },
    { id: 'scan',        icon: ScanLine,      i18n: 'features.user.scan' },
    { id: 'habits',      icon: Sparkles,      i18n: 'features.user.habits' },
    { id: 'discounts',   icon: Bell,          i18n: 'features.user.discounts' },
    { id: 'history',     icon: History,       i18n: 'features.user.history' },
    { id: 'bestStore',   icon: Gauge,         i18n: 'features.user.bestStore' },
    { id: 'perKg',       icon: LineChart,     i18n: 'features.user.perKg' },
    { id: 'quickRepeat', icon: Repeat2,       i18n: 'features.user.quickRepeat' },
    { id: 'multiStore',  icon: Filter,        i18n: 'features.user.multiStore' },
    { id: 'route',       icon: Route,         i18n: 'features.user.route' },
    { id: 'monthly',     icon: Calendar,      i18n: 'features.user.monthly' },
    { id: 'privacy',     icon: ShieldCheck,   i18n: 'features.user.privacy' },
    { id: 'shared',      icon: Users,         i18n: 'features.user.shared' },
    { id: 'seasonal',    icon: CalendarHeart, i18n: 'features.user.seasonal' },
    { id: 'noAccount',   icon: Sprout,        i18n: 'features.user.noAccount' },
    { id: 'lt',          icon: ClipboardList, i18n: 'features.user.lt' },
];

export const creatorFeatures: FeatureCard<CreatorFeatureId>[] = [
    { id: 'share',    icon: Share2,      i18n: 'features.creator.share' },
    { id: 'savings',  icon: Coins,       i18n: 'features.creator.savings' },
    { id: 'recipe',   icon: BookOpen,    i18n: 'features.creator.recipe' },
    { id: 'publish',  icon: Sparkles,    i18n: 'features.creator.publish' },
    { id: 'profile',    icon: UserSquare2, i18n: 'features.creator.profile' },
    { id: 'visibility', icon: Eye,         i18n: 'features.creator.visibility' },
    { id: 'stats',      icon: BarChart3,   i18n: 'features.creator.stats' },
];
