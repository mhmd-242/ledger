import React from 'react';
import { TabType } from '../../types';
import { Plus, Clock, PieChart, Target } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'add' as TabType,
      label: 'Add',
      icon: Plus,
      isPrimary: true,
    },
    {
      id: 'history' as TabType,
      label: 'History',
      icon: Clock,
      isPrimary: false,
    },
    {
      id: 'insights' as TabType,
      label: 'Insights',
      icon: PieChart,
      isPrimary: false,
    },
    {
      id: 'budgets' as TabType,
      label: 'Budgets',
      icon: Target,
      isPrimary: false,
    },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-surface-border pb-safe"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-label="Add new expense"
                aria-pressed={isActive}
                className={`relative flex items-center justify-center -top-3 w-13 h-13 p-3 rounded-full shadow-lg transition-transform active:scale-95 min-w-[48px] min-h-[48px] ${
                  isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-blue-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] min-w-[48px] transition-colors relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
