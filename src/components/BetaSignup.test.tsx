import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import { renderWith } from '@/test/render';
import { BetaSignup } from './BetaSignup';

describe('BetaSignup', () => {
    beforeEach(async () => {
        await i18n.changeLanguage('lt');
        window.localStorage.clear();
    });

    it('rejects a submit without name + valid email', async () => {
        const user = userEvent.setup();
        renderWith(<BetaSignup />);
        await user.type(screen.getByPlaceholderText(i18n.t('cta.emailPlaceholder')), 'not-an-email');
        await user.click(screen.getByRole('button', { name: i18n.t('cta.send') }));
        expect(window.localStorage.getItem('souply.betaSignups')).toBeNull();
        expect(screen.queryByText(i18n.t('cta.thanks'))).not.toBeInTheDocument();
    });

    it('persists name + email + platform on a valid submit and shows thanks', async () => {
        const user = userEvent.setup();
        renderWith(<BetaSignup />);
        await user.click(screen.getByRole('tab', { name: /android/i }));
        await user.type(screen.getByPlaceholderText(i18n.t('cta.namePlaceholder')), 'Mantas Misiūnas');
        await user.type(screen.getByPlaceholderText(i18n.t('cta.emailPlaceholder')), 'tu@email.lt');
        await user.click(screen.getByRole('button', { name: i18n.t('cta.send') }));
        const stored = JSON.parse(window.localStorage.getItem('souply.betaSignups') ?? '[]');
        expect(stored).toHaveLength(1);
        expect(stored[0]).toMatchObject({
            name: 'Mantas Misiūnas',
            email: 'tu@email.lt',
            platform: 'android',
        });
        expect(screen.getByText(i18n.t('cta.thanks'))).toBeInTheDocument();
    });

    it('uses the "Gauti kvietimą" CTA text', () => {
        renderWith(<BetaSignup />);
        expect(screen.getByRole('button', { name: 'Gauti kvietimą' })).toBeInTheDocument();
    });
});
