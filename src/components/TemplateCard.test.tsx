import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '@/i18n';
import { renderWith } from '@/test/render';
import { TemplateCard } from './TemplateCard';
import type { SampleTemplate } from '@/data/sampleTemplates';

const tpl: SampleTemplate = {
    id: 99,
    name: 'Testas',
    visibility: 'public',
    autoUpdate: true,
    itemCount: 5,
    useCount: 12,
    collectiveSavingsEur: '34.00',
    updatedAt: new Date().toISOString(),
    cover: ['#FDE7ED', '#EB6784'],
    emoji: '🧪',
};

describe('TemplateCard', () => {
    beforeEach(async () => { await i18n.changeLanguage('lt'); });

    it('renders title, visibility tag, and auto-update tag', () => {
        renderWith(<TemplateCard template={tpl} onDelete={() => {}} />);
        expect(screen.getByText('Testas')).toBeInTheDocument();
        expect(screen.getByText(i18n.t('dashboard.templates.tagPublic'))).toBeInTheDocument();
        expect(screen.getByText(i18n.t('dashboard.templates.tagAuto'))).toBeInTheDocument();
    });

    it('opens inline delete confirm, requires explicit confirm to call onDelete', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        renderWith(<TemplateCard template={tpl} onDelete={onDelete} />);

        // The action row icon button and the confirm CTA share the
        // localised "Ištrinti" label — disambiguate by position rather
        // than re-labelling, since both labels are intentionally the
        // same word in the design.
        const allDelete = () =>
            screen.getAllByRole('button', { name: i18n.t('dashboard.templates.action.delete') });

        await user.click(allDelete()[0]);
        expect(screen.getByText(i18n.t('dashboard.templates.deleteConfirmTitle'))).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: i18n.t('dashboard.templates.cancel') }));
        expect(onDelete).not.toHaveBeenCalled();

        await user.click(allDelete()[0]);
        await user.click(screen.getByRole('button', { name: i18n.t('dashboard.templates.deleteConfirm') }));
        expect(onDelete).toHaveBeenCalledWith(99);
    });

    it('exposes the 6 primary action buttons', () => {
        renderWith(<TemplateCard template={tpl} onDelete={() => {}} />);
        for (const key of ['open', 'share', 'stats', 'duplicate', 'archive', 'delete']) {
            expect(
                screen.getByRole('button', { name: i18n.t(`dashboard.templates.action.${key}`) }),
            ).toBeInTheDocument();
        }
    });
});
