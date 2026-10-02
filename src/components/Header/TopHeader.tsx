import React from 'react';
import { Sun, Moon, Database, Tags } from 'lucide-react';

interface TopHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCategories: () => void;
  onOpenBackup: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenCategories,
  onOpenBackup,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface-bg/90 backdrop-blur-md border-b border-surface-border transition-colors">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            L
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
              Ledger
            </h1>
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Personal expenses · ETB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenCategories}
            aria-label="Manage categories"
            title="Manage categories"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Tags className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenBackup}
            aria-label="Backup and data settings"
            title="Backup and settings"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
