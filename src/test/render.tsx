import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { AuthProvider } from '@/state/auth';
import { TemplatesProvider } from '@/state/templates';
import { CreateTemplateProvider } from '@/state/createTemplate';
import { TemplateViewProvider } from '@/state/templateView';
import { ThemeProvider } from '@/state/theme';

/**
 * Test render helper. Wraps the unit-under-test in every provider the
 * runtime tree carries (theme + i18n + auth + templates + createTemplate).
 * Templates context fetches `/api/basket-templates/user/{userId}` on
 * mount, so tests that mount components which transitively read it
 * should mock `fetch` first (see `src/App.test.tsx`).
 */
export function renderWith(
    ui: ReactElement,
    opts?: Omit<RenderOptions, 'wrapper'>,
) {
    const Wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>
            <I18nextProvider i18n={i18n}>
                <AuthProvider>
                    <TemplatesProvider>
                        <CreateTemplateProvider>
                            <TemplateViewProvider>{children}</TemplateViewProvider>
                        </CreateTemplateProvider>
                    </TemplatesProvider>
                </AuthProvider>
            </I18nextProvider>
        </ThemeProvider>
    );
    return render(ui, { wrapper: Wrapper, ...opts });
}
