import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentCode, applyAccentTheme, getSavedAccent } from '../lib/theme';

interface ThemeContextType {
  accent: AccentCode;
  setAccent: (accent: AccentCode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accent, setAccentState] = useState<AccentCode>(() => getSavedAccent());

  useEffect(() => {
    applyAccentTheme(accent);
  }, [accent]);

  const setAccent = (newAccent: AccentCode) => {
    setAccentState(newAccent);
    applyAccentTheme(newAccent);
  };

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
