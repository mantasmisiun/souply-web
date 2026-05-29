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
    visitCount: 47,
    collectiveSavingsEur: '34.00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverColor: '#EB6784',
    coverImage: { kind: 'preset' as const, iconKey: 'basket' },
    emoji: '🧪',
};

const noop = () => {};

describe('TemplateCard', () => {
    beforeEach(async () => { await i18n.changeLanguage('lt'); });

    it('renders title and visibility tag, no longer renders auto badge', () => {
        renderWith(
            <TemplateCard template={tpl} onOpen={noop} onShare={noop} onDuplicate={noop} onDelete={noop} />,
        );
        expect(screen.getByText('Testas')).toBeInTheDocument();
        expect(screen.getByText(i18n.t('dashboard.templates.tagPublic'))).toBeInTheDocument();
        // Auto badge was deliberately removed from the card — verify
        // it isn't rendered even though autoUpdate=true on the row.
        expect(screen.queryByText(i18n.t('dashboard.templates.tagAuto'))).toBeNull();
    });

    it('delegates delete to the parent (no inline confirm)', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        renderWith(
            <TemplateCard template={tpl} onOpen={noop} onShare={noop} onDuplicate={noop} onDelete={onDelete} />,
        );
        await user.click(screen.getByRole('button', { name: i18n.t('dashboard.templates.action.delete') }));
        // Card just emits intent — parent (DashboardGrid) opens the
        // ConfirmDialog. So the card itself shouldn't show the
        // confirm copy.
        expect(screen.queryByText(i18n.t('dashboard.templates.deleteConfirmTitle'))).toBeNull();
        expect(onDelete).toHaveBeenCalledWith(tpl);
    });

    it('fires onOpen / onShare / onDuplicate / onDelete from the action row', async () => {
        const user = userEvent.setup();
        const onOpen = vi.fn();
        const onShare = vi.fn();
        const onDuplicate = vi.fn();
        const onDelete = vi.fn();
        renderWith(
            <TemplateCard template={tpl} onOpen={onOpen} onShare={onShare} onDuplicate={onDuplicate} onDelete={onDelete} />,
        );
        await user.click(screen.getByRole('button', { name: i18n.t('dashboard.templates.action.open') }));
        await user.click(screen.getByRole('button', { name: i18n.t('dashboard.templates.action.share') }));
        await user.click(screen.getByRole('button', { name: i18n.t('dashboard.templates.action.duplicate') }));
        await user.click(screen.getByRole('button', { name: i18n.t('dashboard.templates.action.delete') }));
        expect(onOpen).toHaveBeenCalledWith(tpl);
        expect(onShare).toHaveBeenCalledWith(tpl);
        expect(onDuplicate).toHaveBeenCalledWith(tpl);
        expect(onDelete).toHaveBeenCalledWith(tpl);
        // Stats + archive should be GONE from the action row.
        expect(screen.queryByRole('button', { name: i18n.t('dashboard.templates.action.stats') })).toBeNull();
        expect(screen.queryByRole('button', { name: i18n.t('dashboard.templates.action.archive') })).toBeNull();
    });
});
