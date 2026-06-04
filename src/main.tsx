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
import { Sentry, initSentry } from './lib/sentry';

// Must run before render so init catches errors thrown during the first paint.
initSentry();

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
                                <Sentry.ErrorBoundary
                                    fallback={
                                        <div style={{ padding: 24, textAlign: 'center', fontFamily: 'system-ui' }}>
                                            <p>Įvyko klaida. Pabandykite atnaujinti puslapį.</p>
                                            <button onClick={() => window.location.reload()}>Atnaujinti</button>
                                        </div>
                                    }
                                >
                                    <App />
                                </Sentry.ErrorBoundary>
                            </TemplateViewProvider>
                        </CreateTemplateProvider>
                    </TemplatesProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
);
