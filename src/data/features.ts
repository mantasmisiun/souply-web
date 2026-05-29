import {
    BarChart3, Bell, BookOpen, Bot, Calendar, CalendarHeart, ClipboardList, Coins, Filter,
    Gauge, History, KeyRound, Leaf, LineChart, Mic, Repeat2, ScanLine, Share2, Sparkles,
    Sprout, Store, Trophy, Users, UserSquare2, Wallet,
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
    | 'gamify' | 'quickRepeat' | 'multiStore' | 'alts' | 'monthly' | 'recovery'
    | 'shared' | 'seasonal' | 'veggie' | 'voice' | 'weekly' | 'noAccount' | 'lt';

export type CreatorFeatureId =
    | 'share' | 'savings' | 'recipe' | 'publish' | 'profile' | 'auto' | 'stats';

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
    { id: 'gamify',      icon: Trophy,        i18n: 'features.user.gamify' },
    { id: 'quickRepeat', icon: Repeat2,       i18n: 'features.user.quickRepeat' },
    { id: 'multiStore',  icon: Filter,        i18n: 'features.user.multiStore' },
    { id: 'alts',        icon: Coins,         i18n: 'features.user.alts' },
    { id: 'monthly',     icon: Calendar,      i18n: 'features.user.monthly' },
    { id: 'recovery',    icon: KeyRound,      i18n: 'features.user.recovery' },
    { id: 'shared',      icon: Users,         i18n: 'features.user.shared' },
    { id: 'seasonal',    icon: CalendarHeart, i18n: 'features.user.seasonal' },
    { id: 'veggie',      icon: Leaf,          i18n: 'features.user.veggie' },
    { id: 'voice',       icon: Mic,           i18n: 'features.user.voice' },
    { id: 'weekly',      icon: Wallet,        i18n: 'features.user.weekly' },
    { id: 'noAccount',   icon: Sprout,        i18n: 'features.user.noAccount' },
    { id: 'lt',          icon: ClipboardList, i18n: 'features.user.lt' },
];

export const creatorFeatures: FeatureCard<CreatorFeatureId>[] = [
    { id: 'share',    icon: Share2,      i18n: 'features.creator.share' },
    { id: 'savings',  icon: Coins,       i18n: 'features.creator.savings' },
    { id: 'recipe',   icon: BookOpen,    i18n: 'features.creator.recipe' },
    { id: 'publish',  icon: Sparkles,    i18n: 'features.creator.publish' },
    { id: 'profile',  icon: UserSquare2, i18n: 'features.creator.profile' },
    { id: 'auto',     icon: Bot,         i18n: 'features.creator.auto' },
    { id: 'stats',    icon: BarChart3,   i18n: 'features.creator.stats' },
];
