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
import { UpdateToast } from './components/UpdateToast';

// Must run before render so init catches errors thrown during the first paint.
initSentry();

// Chunk-load recovery (Phase 4 web gate): after a deploy replaces the hashed JS chunks this
// tab's shell references, a lazy `import()` 404s and would white-screen. Vite fires
// `vite:preloadError` for exactly that — reload once to fetch the fresh index.html + chunk
// map. A short time-window guard prevents a reload loop if the failure is actually persistent
// (a genuinely broken chunk), while still allowing recovery from a LATER deploy in the same
// long-lived session.
window.addEventListener('vite:preloadError', () => {
    try {
        const KEY = 'souply.chunkReloadAt';
        const last = Number(sessionStorage.getItem(KEY) || '0');
        if (Date.now() - last < 10_000) return; // just reloaded → don't loop
        sessionStorage.setItem(KEY, String(Date.now()));
        window.location.reload();
    } catch {
        /* sessionStorage blocked (private mode) — skip the guard, do nothing rather than loop */
    }
});

// BrowserRouter sits OUTSIDE the providers so any of them can use
// navigation hooks (login→/dashboard, surface URL-sync) in later steps.
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <EnvBanner />
        <UpdateToast />
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
