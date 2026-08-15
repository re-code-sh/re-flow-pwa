import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import faTranslations from './locales/fa.json';
import enTranslations from './locales/en.json';

const resources = {
  fa: {
    translation: faTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fa',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'reflow_language',
    },
  });

export function updateDocumentDirection(lang: string) {
  const isRtl = lang === 'fa';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
}

// Set initial direction
updateDocumentDirection(i18n.language || 'fa');

// Listen for language change events
i18n.on('languageChanged', (lang) => {
  updateDocumentDirection(lang);
});

export default i18n;
