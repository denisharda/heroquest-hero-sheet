import React, { createContext, useContext, ReactNode } from 'react';
import { Theme, ThemeName } from '@/types';
import { fantasyTheme } from './fantasy';
import { darkFantasyTheme } from './darkFantasy';
import { useThemeStore } from '@/store/themeStore';

const themes: Record<ThemeName, Theme> = {
  fantasy: fantasyTheme,
  darkFantasy: darkFantasyTheme,
};

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { themeName, setThemeName } = useThemeStore();
  const theme = themes[themeName];

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
  };

  const toggleTheme = () => {
    setThemeName(themeName === 'fantasy' ? 'darkFantasy' : 'fantasy');
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { themes };
