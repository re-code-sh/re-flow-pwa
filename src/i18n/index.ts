import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import faTranslation from './locales/fa.json';
import enTranslation from './locales/en.json';

const resources = {
  fa: { translation: faTranslation },
  en: { translation: enTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fa',
    lng: localStorage.getItem('taknoghte_lang') || 'fa',
    interpolation: {
      escapeValue: false, // react already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'taknoghte_lang',
    },
  });

export function updateDocumentDirection(lang: string) {
  const isRtl = lang === 'fa';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  localStorage.setItem('taknoghte_lang', lang);
}

// Update direction initially and on change
updateDocumentDirection(i18n.language || 'fa');
i18n.on('languageChanged', (lang) => {
  updateDocumentDirection(lang);
});

export default i18n;
