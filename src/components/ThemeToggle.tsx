import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemeMode, type ThemeMode } from '@/state/theme';

/**
 * Theme cycle button — three states, single click cycles
 *   light → dark → system → light …
 * The icon swaps with a quick fade+rotate so the click has a clear
 * "something happened" reaction without a full-screen flash. Stored
 * preference survives reloads (see ThemeProvider).
 */
export function ThemeToggle() {
    const { mode, cycle } = useThemeMode();
    const label = labelFor(mode);

    return (
        <button
            type="button"
            onClick={cycle}
            aria-label={label}
            title={label}
            className="relative inline-grid place-items-center size-9 rounded-full bg-surface-muted ring-1 ring-edge-subtle text-ink-soft hover:text-ink hover:bg-surface transition-colors"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={mode}
                    initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    className="grid place-items-center"
                >
                    <Icon mode={mode} />
                </motion.span>
            </AnimatePresence>
        </button>
    );
}

function Icon({ mode }: { mode: ThemeMode }) {
    if (mode === 'light')  return <Sun     size={15} />;
    if (mode === 'dark')   return <Moon    size={15} />;
    return <Monitor size={15} />;
}

function labelFor(mode: ThemeMode): string {
    if (mode === 'light')  return 'Šviesi tema (kitas: tamsi)';
    if (mode === 'dark')   return 'Tamsi tema (kitas: sisteminė)';
    return 'Sisteminė tema (kitas: šviesi)';
}
