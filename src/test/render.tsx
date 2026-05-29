import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { AuthProvider } from '@/state/auth';

/**
 * Test render helper. Wraps the unit-under-test in the providers it
 * actually needs (i18n + auth). Anything heavier (router, react-query)
 * gets added per-test rather than baked in here, so a switcher test
 * doesn't accidentally rely on a route segment for free.
 */
export function renderWith(
    ui: ReactElement,
    opts?: Omit<RenderOptions, 'wrapper'>,
) {
    const Wrapper = ({ children }: { children: ReactNode }) => (
        <I18nextProvider i18n={i18n}>
            <AuthProvider>{children}</AuthProvider>
        </I18nextProvider>
    );
    return render(ui, { wrapper: Wrapper, ...opts });
}
