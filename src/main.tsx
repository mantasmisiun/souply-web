import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';
import { AuthProvider } from './state/auth';
import { TemplatesProvider } from './state/templates';
import { CreateTemplateProvider } from './state/createTemplate';
import { TemplateViewProvider } from './state/templateView';
import { ThemeProvider } from './state/theme';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
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
    </StrictMode>,
);
