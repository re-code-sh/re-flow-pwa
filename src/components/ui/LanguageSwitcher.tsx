import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { clsx } from 'clsx';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'fa';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={clsx(
        'pressable inline-flex items-center gap-2 px-3.5 py-2 rounded-[14px] bg-glass-b border border-line hover:border-white/20 text-ink text-sm font-semibold'
      )}
    >
      <LanguageRoundedIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
      <span>{currentLang === 'fa' ? 'فارسی (FA)' : 'English (EN)'}</span>
    </button>
  );
};
