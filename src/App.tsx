import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, Category, Budget, TabType, ToastAction } from './types';
import { StorageService } from './services/storage';
import { getTodayString } from './utils/formatters';
import { TopHeader } from './components/Header/TopHeader';
import { BottomNav } from './components/Navigation/BottomNav';
import { QuickAddView } from './components/QuickAdd/QuickAddView';
import { HistoryView } from './components/History/HistoryView';
import { InsightsView } from './components/Insights/InsightsView';
import { BudgetsView } from './components/Budgets/BudgetsView';
import { CategoryManagerModal } from './components/Categories/CategoryManagerModal';
import { BackupModal } from './components/Settings/BackupModal';
import { Toast } from './components/Common/Toast';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ledger_theme_v1');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // App data state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState<Budget>({
    overallMonthly: 0,
    categoryBudgets: {},
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('add');

  // Modal states
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<ToastAction | null>(null);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ledger_theme_v1', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ledger_theme_v1', 'light');
    }
  }, [isDarkMode]);

  // Load initial data
  const loadData = useCallback(() => {
    StorageService.init();
    setExpenses(StorageService.getExpenses());
    setCategories(StorageService.getCategories());
    setBudget(StorageService.getBudgets());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Trigger Toast helper with auto-dismiss
  const showToast = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void, duration = 5000) => {
      const id = Date.now().toString();
      setToast({ id, message, actionLabel, onAction, duration });
    },
    []
  );

  // Toast auto-timer
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Handlers for expenses
  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    StorageService.addExpense(expenseData);
    setExpenses(StorageService.getExpenses());
    const cat = categories.find((c) => c.id === expenseData.categoryId);
    showToast(`Expense saved in ${cat?.name || 'Category'}`);
  };

  const handleUpdateExpense = (updated: Expense) => {
    StorageService.updateExpense(updated);
    setExpenses(StorageService.getExpenses());
    showToast('Expense updated');
  };

  const handleDeleteExpense = (id: string) => {
    const deletedItem = StorageService.deleteExpense(id);
    setExpenses(StorageService.getExpenses());

    if (deletedItem) {
      showToast(
        'Expense deleted',
        'Undo',
        () => {
          StorageService.restoreExpense(deletedItem);
          setExpenses(StorageService.getExpenses());
          showToast('Expense restored');
        },
        5000
      );
    }
  };

  // Handlers for categories
  const handleAddCategory = (newCat: Omit<Category, 'id' | 'isCustom'>) => {
    StorageService.addCategory(newCat);
    setCategories(StorageService.getCategories());
    showToast(`Category "${newCat.name}" added`);
  };

  const handleUpdateCategory = (cat: Category) => {
    StorageService.updateCategory(cat);
    setCategories(StorageService.getCategories());
    showToast('Category renamed');
  };

  const handleDeleteCategory = (catId: string) => {
    StorageService.deleteCategory(catId);
    setCategories(StorageService.getCategories());
    setExpenses(StorageService.getExpenses());
    showToast('Category removed (expenses moved to Other)');
  };

  // Budget handler
  const handleUpdateBudget = (newBudget: Budget) => {
    StorageService.saveBudgets(newBudget);
    setBudget(newBudget);
    showToast('Budget target saved');
  };

  // Today's expenses for quick add screen preview
  const todayStr = getTodayString();
  const todayExpenses = useMemo(() => {
    return expenses.filter((e) => e.date === todayStr);
  }, [expenses, todayStr]);

  return (
    <div className="min-h-screen bg-surface-bg text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <TopHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenCategories={() => setIsCategoriesModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'add' && (
          <QuickAddView
            categories={categories}
            onAddExpense={handleAddExpense}
            todayExpenses={todayExpenses}
            onManageCategories={() => setIsCategoriesModalOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            expenses={expenses}
            categories={categories}
            onDeleteExpense={handleDeleteExpense}
            onUpdateExpense={handleUpdateExpense}
            onNavigateToAdd={() => setActiveTab('add')}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView expenses={expenses} categories={categories} />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            expenses={expenses}
            categories={categories}
            budget={budget}
            onUpdateBudget={handleUpdateBudget}
          />
        )}
      </main>

      {/* Undo / Info Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Bottom Main Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Categories Management Modal */}
      <CategoryManagerModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Data Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={loadData}
      />
    </div>
  );
};

export default App;
