// c:\projects\kostian_task\frontend\context\ThemeContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Theme } from '../types';
import { useAuthContext } from './AuthContext';
import { userApi } from '../services/api';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  applyTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'theme-blue', 'theme-white');

  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'blue') {
    root.classList.add('theme-blue');
  }
  // 'white' is the default, no class needed
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuthContext();
  const [theme, setThemeState] = useState<Theme>('white');

  useEffect(() => {
    if (user?.theme) {
      setThemeState(user.theme);
      applyThemeToDocument(user.theme);
    }
  }, [user?.theme]);

  const applyTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDocument(newTheme);
  }, []);

  const setTheme = useCallback(
    async (newTheme: Theme) => {
      applyTheme(newTheme);
      try {
        const res = await userApi.updateTheme(newTheme);
        updateUser(res.data.data);
      } catch (err) {
        console.error('Failed to save theme:', err);
      }
    },
    [applyTheme, updateUser]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
