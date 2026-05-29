import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sparkles, Store } from 'lucide-react';
import i18n from '@/i18n';
import { renderWith } from '@/test/render';
import { FeatureCarousel } from './FeatureCarousel';
import type { FeatureCard } from '@/data/features';

const cards: FeatureCard[] = [
    { id: 'a', icon: Store,    i18n: 'features.user.compare' },
    { id: 'b', icon: Sparkles, i18n: 'features.user.habits' },
];

describe('FeatureCarousel', () => {
    beforeEach(async () => { await i18n.changeLanguage('lt'); });

    it('renders the first card by default', () => {
        renderWith(<FeatureCarousel cards={cards} audienceKey="user" />);
        expect(screen.getByText(i18n.t('features.user.compare.title'))).toBeInTheDocument();
    });

    it('advances to the next card on Next click', async () => {
        const user = userEvent.setup();
        renderWith(<FeatureCarousel cards={cards} audienceKey="user" />);
        await user.click(screen.getByRole('button', { name: i18n.t('carousel.next') }));
        expect(screen.getByText(i18n.t('features.user.habits.title'))).toBeInTheDocument();
    });

    it('jumps to a specific card via the dot tablist', async () => {
        const user = userEvent.setup();
        renderWith(<FeatureCarousel cards={cards} audienceKey="user" />);
        const dots = screen.getAllByRole('tab');
        await user.click(dots[1]);
        expect(screen.getByText(i18n.t('features.user.habits.title'))).toBeInTheDocument();
    });

    it('auto-advances on the configured interval', () => {
        vi.useFakeTimers();
        try {
            renderWith(<FeatureCarousel cards={cards} audienceKey="user" autoplayMs={500} />);
            expect(screen.getByText(i18n.t('features.user.compare.title'))).toBeInTheDocument();
            act(() => { vi.advanceTimersByTime(550); });
            expect(screen.getByText(i18n.t('features.user.habits.title'))).toBeInTheDocument();
        } finally {
            vi.useRealTimers();
        }
    });
});
