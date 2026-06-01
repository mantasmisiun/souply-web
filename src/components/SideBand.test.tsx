import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import { renderWith } from '@/test/render';
import { SideBand } from './SideBand';

describe('SideBand', () => {
    beforeEach(async () => { await i18n.changeLanguage('lt'); });

    it('shows the beta signup and creator-login CTA on the visitor view', () => {
        const noop = () => {};
        renderWith(
            <SideBand
                view="visitor"
                onOpenCreatorAuth={noop}
                onBackToVisitor={noop}
                onAuthenticated={noop}
                onGoogleCredential={noop}
            />,
        );
        expect(screen.getByText(i18n.t('cta.joinBeta'))).toBeInTheDocument();
        expect(screen.getByRole('button', { name: i18n.t('cta.creatorLogin') })).toBeInTheDocument();
    });

    it('routes the creator-login button to the auth callback', async () => {
        const user = userEvent.setup();
        const onOpenCreatorAuth = vi.fn();
        renderWith(
            <SideBand
                view="visitor"
                onOpenCreatorAuth={onOpenCreatorAuth}
                onBackToVisitor={() => {}}
                onAuthenticated={() => {}}
                onGoogleCredential={() => {}}
            />,
        );
        await user.click(screen.getByRole('button', { name: i18n.t('cta.creatorLogin') }));
        expect(onOpenCreatorAuth).toHaveBeenCalledOnce();
    });

    it('in creator-auth view, Apple + dev buttons call onAuthenticated with the right mode', async () => {
        const user = userEvent.setup();
        const onAuthenticated = vi.fn();
        renderWith(
            <SideBand
                view="creator-auth"
                onOpenCreatorAuth={() => {}}
                onBackToVisitor={() => {}}
                onAuthenticated={onAuthenticated}
                onGoogleCredential={() => {}}
            />,
        );
        // Google is now the real GIS button (no onAuthenticated). Apple
        // still routes through onAuthenticated('signup'); the gated dev
        // bypass routes through onAuthenticated('login').
        await user.click(screen.getByRole('button', { name: new RegExp(i18n.t('cta.loginApple'), 'i') }));
        expect(onAuthenticated).toHaveBeenLastCalledWith('signup');
        await user.click(screen.getByRole('button', { name: /skip auth/i }));
        expect(onAuthenticated).toHaveBeenLastCalledWith('login');
    });
});
