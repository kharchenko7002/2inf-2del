// c:\projects\kostian_task\frontend\components\ui\ThemeSwitcher.tsx

'use client';

import React from 'react';
import { Theme } from '../../types';
import { useThemeContext } from '../../context/ThemeContext';

const themes: { value: Theme; label: string; description: string; preview: string }[] = [
  {
    value: 'white',
    label: 'Light',
    description: 'Clean white interface',
    preview: 'bg-white border-gray-200',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes',
    preview: 'bg-gray-900 border-gray-700',
  },
  {
    value: 'blue',
    label: 'Blue',
    description: 'Deep ocean blue',
    preview: 'bg-slate-900 border-slate-700',
  },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeContext();

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`
            relative p-3 rounded-xl border-2 transition-all duration-200 text-left
            ${
              theme === t.value
                ? 'border-blue-500 shadow-md'
                : 'border-[var(--border-color)] hover:border-blue-300'
            }
          `}
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {/* Preview swatch */}
          <div
            className={`w-full h-8 rounded-md border mb-2 ${t.preview}`}
          />
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {t.label}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t.description}
          </p>
          {theme === t.value && (
            <div className="absolute top-2 right-2">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
