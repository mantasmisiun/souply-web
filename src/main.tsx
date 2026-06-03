import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './i18n';
import App from './App';
import { EnvBanner } from './components/EnvBanner';
import { AuthProvider } from './state/auth';
import { TemplatesProvider } from './state/templates';
import { CreateTemplateProvider } from './state/createTemplate';
import { TemplateViewProvider } from './state/templateView';
import { ThemeProvider } from './state/theme';

// BrowserRouter sits OUTSIDE the providers so any of them can use
// navigation hooks (login→/dashboard, surface URL-sync) in later steps.
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <EnvBanner />
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <TemplatesProvider>
                        <CreateTemplateProvider>
                            <TemplateViewProvider>
                                <App />
                            </TemplateViewProvider>
                        </CreateTemplateProvider>
                    </TemplatesProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
);
