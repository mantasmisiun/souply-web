import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import { renderWith } from '@/test/render';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
    beforeEach(async () => {
        await i18n.changeLanguage('lt');
    });

    it('renders both language buttons and marks current as pressed', () => {
        renderWith(<LanguageSwitcher />);
        const lt = screen.getByRole('button', { name: 'LT' });
        const en = screen.getByRole('button', { name: 'EN' });
        expect(lt).toHaveAttribute('aria-pressed', 'true');
        expect(en).toHaveAttribute('aria-pressed', 'false');
    });

    it('flips i18n language on click', async () => {
        renderWith(<LanguageSwitcher />);
        await userEvent.click(screen.getByRole('button', { name: 'EN' }));
        expect(i18n.resolvedLanguage).toBe('en');
        expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    });
});
