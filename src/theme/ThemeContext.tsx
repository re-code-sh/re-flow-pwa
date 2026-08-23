import React, { createContext, useContext, useEffect, useState } from 'react';
import { APP_ACCENTS, AppAccentKey, applyAccentToDom, AccentColor } from './tokens';

interface ThemeContextType {
  accent: AppAccentKey;
  setAccent: (accent: AppAccentKey) => void;
  accentColor: AccentColor;
  availableAccents: AccentColor[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ACCENT_STORAGE_KEY = 'taknoghte_accent';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accent, setAccentState] = useState<AppAccentKey>(() => {
    const saved = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (saved && saved in APP_ACCENTS) {
      return saved as AppAccentKey;
    }
    return 'ember';
  });

  const setAccent = (newAccent: AppAccentKey) => {
    if (newAccent in APP_ACCENTS) {
      setAccentState(newAccent);
      localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
      applyAccentToDom(newAccent);
    }
  };

  useEffect(() => {
    applyAccentToDom(accent);
  }, [accent]);

  return (
    <ThemeContext.Provider
      value={{
        accent,
        setAccent,
        accentColor: APP_ACCENTS[accent],
        availableAccents: Object.values(APP_ACCENTS),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
