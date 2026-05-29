import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import lt from './locales/lt.json';
import en from './locales/en.json';

/**
 * Web-side i18next. Mirrors the basket-app's setup (LT primary, EN
 * fallback) but adds browser language detection because the marketing
 * page hits visitors before they're authenticated. Detection writes
 * the chosen language into localStorage under `souply.lang` so the
 * preference survives reloads.
 */
void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            lt: { translation: lt },
            en: { translation: en },
        },
        fallbackLng: 'lt',
        supportedLngs: ['lt', 'en'],
        defaultNS: 'translation',
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'souply.lang',
        },
        react: { useSuspense: false },
    });

export default i18n;
