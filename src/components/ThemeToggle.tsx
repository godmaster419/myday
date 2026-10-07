import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  variant?: 'segmented' | 'compact';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  currentTheme,
  onThemeChange,
  variant = 'segmented',
}) => {
  const options: { value: ThemeMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" />, tooltip: 'Cream Light Mode' },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" />, tooltip: 'Warm Espresso Dark Mode' },
    { value: 'system', label: 'Auto', icon: <Monitor className="w-3.5 h-3.5" />, tooltip: 'System Default' },
  ];

  if (variant === 'compact') {
    // Cycles through: light -> dark -> system -> light
    const nextTheme: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };

    const activeOption = options.find(o => o.value === currentTheme) || options[2];

    return (
      <button
        onClick={() => onThemeChange(nextTheme[currentTheme])}
        title={`Theme: ${activeOption.tooltip} (Click to switch)`}
        aria-label={`Current theme is ${activeOption.label}. Click to cycle theme.`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-surface-200/80 dark:border-surface-700/80 bg-surface-50/80 dark:bg-surface-800/80 hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 text-xs font-medium transition-all cursor-pointer shadow-2xs"
      >
        <span className="text-primary-600 dark:text-primary-400">
          {activeOption.icon}
        </span>
        <span className="hidden sm:inline text-[11px] font-semibold">{activeOption.label}</span>
      </button>
    );
  }

  // Segmented 3-pill toggle
  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className="inline-flex items-center p-1 rounded-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xs"
    >
      {options.map((opt) => {
        const isSelected = currentTheme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onThemeChange(opt.value)}
            title={opt.tooltip}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
              isSelected
                ? 'bg-white dark:bg-surface-800 text-primary-700 dark:text-primary-300 shadow-xs border border-surface-200/60 dark:border-surface-700/60'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
