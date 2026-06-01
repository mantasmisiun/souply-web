import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import { renderWith } from '@/test/render';
import { BetaSignup } from './BetaSignup';
import { submitBetaSignup } from '@/lib/beta';

// The form now POSTs to the API instead of writing localStorage; mock
// the transport so the test asserts the call + the success state.
vi.mock('@/lib/beta', () => ({
    submitBetaSignup: vi.fn(() => Promise.resolve({ ok: true })),
}));

describe('BetaSignup', () => {
    beforeEach(async () => {
        await i18n.changeLanguage('lt');
        vi.mocked(submitBetaSignup).mockClear();
    });

    it('rejects a submit without name + valid email', async () => {
        const user = userEvent.setup();
        renderWith(<BetaSignup />);
        await user.type(screen.getByPlaceholderText(i18n.t('cta.emailPlaceholder')), 'not-an-email');
        await user.click(screen.getByRole('button', { name: i18n.t('cta.send') }));
        expect(submitBetaSignup).not.toHaveBeenCalled();
        expect(screen.queryByText(i18n.t('cta.thanks'))).not.toBeInTheDocument();
    });

    it('submits name + email + platform on a valid submit and shows thanks', async () => {
        const user = userEvent.setup();
        renderWith(<BetaSignup />);
        await user.click(screen.getByRole('tab', { name: /android/i }));
        await user.type(screen.getByPlaceholderText(i18n.t('cta.namePlaceholder')), 'Mantas Misiūnas');
        await user.type(screen.getByPlaceholderText(i18n.t('cta.emailPlaceholder')), 'tu@email.lt');
        await user.click(screen.getByRole('button', { name: i18n.t('cta.send') }));

        expect(submitBetaSignup).toHaveBeenCalledWith({
            name: 'Mantas Misiūnas',
            email: 'tu@email.lt',
            platform: 'android',
        });
        expect(await screen.findByText(i18n.t('cta.thanks'))).toBeInTheDocument();
    });

    it('shows an error when the submit fails', async () => {
        vi.mocked(submitBetaSignup).mockRejectedValueOnce(new Error('network'));
        const user = userEvent.setup();
        renderWith(<BetaSignup />);
        await user.type(screen.getByPlaceholderText(i18n.t('cta.namePlaceholder')), 'Mantas Misiūnas');
        await user.type(screen.getByPlaceholderText(i18n.t('cta.emailPlaceholder')), 'tu@email.lt');
        await user.click(screen.getByRole('button', { name: i18n.t('cta.send') }));
        expect(await screen.findByText(i18n.t('cta.sendError'))).toBeInTheDocument();
        expect(screen.queryByText(i18n.t('cta.thanks'))).not.toBeInTheDocument();
    });

    it('uses the "Gauti kvietimą" CTA text', () => {
        renderWith(<BetaSignup />);
        expect(screen.getByRole('button', { name: 'Gauti kvietimą' })).toBeInTheDocument();
    });
});
