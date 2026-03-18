import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import applyTheme, { defaultTheme } from '../theme/themeGenerator';
import { storage } from '../data/storage';

const PREFS_KEY = 'stravaAppUserPrefs';

interface ThemeContextValue {
  theme: any;
  setTheme: (theme: any) => void;
  colors: any;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => {
    return storage.getJSON(PREFS_KEY, defaultTheme);
  });
  const [colors, setColors] = useState(() => applyTheme(defaultTheme));

  useEffect(() => {
    storage.setJSON(PREFS_KEY, theme);
    const newColors = applyTheme(theme);
    setColors(newColors);
  }, [theme]);

  return React.createElement(ThemeContext.Provider, { value: { theme, setTheme, colors } }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
