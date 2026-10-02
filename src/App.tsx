import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, Category, Budget, TabType, ToastAction, TransactionType } from './types';
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
import { StartingBalanceModal } from './components/Settings/StartingBalanceModal';
import { Toast } from './components/Common/Toast';

export const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ledger_theme_v1');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState<Budget>({
    overallMonthly: 0,
    categoryBudgets: {},
  });

  const [activeTab, setActiveTab] = useState<TabType>('add');

  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<TransactionType>('expense');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isStartingBalanceModalOpen, setIsStartingBalanceModalOpen] = useState(false);
  const [showStartingBalancePrompt, setShowStartingBalancePrompt] = useState(false);

  const [toast, setToast] = useState<ToastAction | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ledger_theme_v1', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ledger_theme_v1', 'light');
    }
  }, [isDarkMode]);

  const loadData = useCallback(() => {
    StorageService.init();
    const txs = StorageService.getTransactions();
    setTransactions(txs);
    setExpenseCategories(StorageService.getExpenseCategories());
    setIncomeCategories(StorageService.getIncomeCategories());
    setBudget(StorageService.getBudgets());

    // Check if starting balance should be prompted (only on fresh installs with 0 transactions and not previously prompted)
    if (txs.length === 0 && !StorageService.hasStartingBalancePrompted()) {
      setShowStartingBalancePrompt(true);
    } else {
      setShowStartingBalancePrompt(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = useCallback(
    (message: string, actionLabel?: string, onAction?: () => void, duration = 5000) => {
      const id = Date.now().toString();
      setToast({ id, message, actionLabel, onAction, duration });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Transaction handlers
  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    StorageService.addTransaction(txData);
    setTransactions(StorageService.getTransactions());
    const cats = txData.type === 'income' ? incomeCategories : expenseCategories;
    const cat = cats.find((c) => c.id === txData.categoryId);
    const label = txData.type === 'income' ? 'Income logged in' : 'Expense saved in';
    showToast(`${label} ${cat?.name || 'Category'}`);
    setShowStartingBalancePrompt(false);
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    StorageService.updateTransaction(updated);
    setTransactions(StorageService.getTransactions());
    showToast('Record updated');
  };

  const handleDeleteTransaction = (id: string) => {
    const deletedItem = StorageService.deleteTransaction(id);
    setTransactions(StorageService.getTransactions());

    if (deletedItem) {
      showToast(
        `${deletedItem.type === 'income' ? 'Income' : 'Expense'} record deleted`,
        'Undo',
        () => {
          StorageService.restoreTransaction(deletedItem);
          setTransactions(StorageService.getTransactions());
          showToast('Record restored');
        },
        5000
      );
    }
  };

  const handleSaveStartingBalance = (amount: number) => {
    StorageService.setStartingBalance(amount);
    setTransactions(StorageService.getTransactions());
    setShowStartingBalancePrompt(false);
    showToast('Starting balance recorded');
  };

  // Category handlers
  const handleAddCategory = (newCat: Omit<Category, 'id' | 'isCustom'>, type: TransactionType) => {
    StorageService.addCategory(newCat, type);
    if (type === 'income') {
      setIncomeCategories(StorageService.getIncomeCategories());
    } else {
      setExpenseCategories(StorageService.getExpenseCategories());
    }
    showToast(`Category "${newCat.name}" created`);
  };

  const handleUpdateCategory = (cat: Category) => {
    StorageService.updateCategory(cat);
    if (cat.type === 'income') {
      setIncomeCategories(StorageService.getIncomeCategories());
    } else {
      setExpenseCategories(StorageService.getExpenseCategories());
    }
    showToast('Category updated');
  };

  const handleDeleteCategory = (catId: string, type: TransactionType) => {
    StorageService.deleteCategory(catId, type);
    if (type === 'income') {
      setIncomeCategories(StorageService.getIncomeCategories());
    } else {
      setExpenseCategories(StorageService.getExpenseCategories());
    }
    setTransactions(StorageService.getTransactions());
    showToast('Category deleted');
  };

  // Budget handler
  const handleUpdateBudget = (newBudget: Budget) => {
    StorageService.saveBudgets(newBudget);
    setBudget(newBudget);
    showToast('Monthly target saved');
  };

  // Live financial metrics
  const todayStr = getTodayString();
  const currentMonthKey = todayStr.slice(0, 7);

  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === todayStr);
  }, [transactions, todayStr]);

  const todaySpent = useMemo(() => {
    return todayTransactions
      .filter((t) => (t.type || 'expense') === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  const monthIncome = useMemo(() => {
    return transactions
      .filter((t) => t.date?.startsWith(currentMonthKey) && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthKey]);

  const totalBalance = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return income - expense;
  }, [transactions]);

  const allCategories = useMemo(() => {
    return [...expenseCategories, ...incomeCategories];
  }, [expenseCategories, incomeCategories]);

  return (
    <div className="min-h-screen bg-surface-bg text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      <TopHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenCategories={() => {
          setCategoryModalType('expense');
          setIsCategoriesModalOpen(true);
        }}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'add' && (
          <QuickAddView
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            onAddTransaction={handleAddTransaction}
            todaySpent={todaySpent}
            monthIncome={monthIncome}
            totalBalance={totalBalance}
            todayTransactions={todayTransactions}
            onManageCategories={(type) => {
              setCategoryModalType(type);
              setIsCategoriesModalOpen(true);
            }}
            onOpenStartingBalance={() => setIsStartingBalanceModalOpen(true)}
            showStartingBalancePrompt={showStartingBalancePrompt}
            onDismissStartingBalancePrompt={() => {
              StorageService.markStartingBalancePrompted();
              setShowStartingBalancePrompt(false);
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            transactions={transactions}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onNavigateToAdd={() => setActiveTab('add')}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView transactions={transactions} categories={allCategories} />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            transactions={transactions}
            categories={expenseCategories}
            budget={budget}
            onUpdateBudget={handleUpdateBudget}
          />
        )}
      </main>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <CategoryManagerModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        initialType={categoryModalType}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={loadData}
        onOpenStartingBalance={() => setIsStartingBalanceModalOpen(true)}
      />

      <StartingBalanceModal
        isOpen={isStartingBalanceModalOpen}
        onClose={() => setIsStartingBalanceModalOpen(false)}
        onSaveStartingBalance={handleSaveStartingBalance}
      />
    </div>
  );
};

export default App;
