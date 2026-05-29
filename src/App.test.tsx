import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import { renderWith } from '@/test/render';
import App from './App';

/**
 * High-level transition test. We don't pixel-test the band's geometry
 * (that's framer-motion's job) — we verify the visible state machine:
 *
 *   1. Landing → visitor band visible, dashboard absent.
 *   2. Tap "Kūrėjo prisijungimas" → auth panel mounts in the band.
 *   3. Tap "Continue with Google" → after the band-travel timeout the
 *      dashboard rail + grid mount and the visitor UI is gone.
 *
 * Real timers throughout: the merge timeout is ~1s, comfortably under
 * the 10s default test budget we set below. Fake timers interact badly
 * with React 19's automatic batching here.
 */
describe('<App /> login transition', () => {
    beforeEach(async () => { await i18n.changeLanguage('lt'); });

    it('starts on landing and lands on the dashboard after OAuth', async () => {
        const user = userEvent.setup();
        renderWith(<App />);

        expect(screen.getByText(i18n.t('cta.joinBeta'))).toBeInTheDocument();
        expect(screen.queryByText(i18n.t('dashboard.templates.title'))).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: i18n.t('cta.creatorLogin') }));
        const googleBtn = await screen.findByRole('button', { name: new RegExp(i18n.t('cta.loginGoogle'), 'i') });
        await user.click(googleBtn);

        await waitFor(
            () => expect(screen.getByText(i18n.t('dashboard.templates.title'))).toBeInTheDocument(),
            { timeout: 4000 },
        );
        expect(screen.queryByText(i18n.t('cta.joinBeta'))).not.toBeInTheDocument();
    }, 10000);
});
