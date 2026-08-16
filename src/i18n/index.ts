import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fa from './locales/fa';
import en from './locales/en';

const resources = {
  fa: { translation: fa },
  en: { translation: en },
};

const savedLang = localStorage.getItem('app_language') || 'fa';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'fa',
  interpolation: {
    escapeValue: false,
  },
});

export function setAppLanguage(lang: 'fa' | 'en') {
  i18n.changeLanguage(lang);
  localStorage.setItem('app_language', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
}

// Initial direction setting
document.documentElement.lang = savedLang;
document.documentElement.dir = savedLang === 'fa' ? 'rtl' : 'ltr';

export default i18n;
