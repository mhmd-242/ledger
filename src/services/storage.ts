import { Transaction, Category, Budget, BackupData, TransactionType } from '../types';

const STORAGE_KEYS = {
  VERSION: 'ledger:v2',
  TRANSACTIONS: 'ledger:v2:transactions',
  EXPENSE_CATEGORIES: 'ledger:v2:expense_categories',
  INCOME_CATEGORIES: 'ledger:v2:income_categories',
  BUDGETS: 'ledger:v2:budgets',
  THEME: 'ledger_theme_v1',
  STARTING_BALANCE_PROMPTED: 'ledger:v2:starting_balance_prompted',
  // Legacy v1 keys
  LEGACY_EXPENSES: 'ledger_expenses_v1',
  LEGACY_CATEGORIES: 'ledger_categories_v1',
  LEGACY_BUDGETS: 'ledger_budgets_v1',
  LEGACY_INITIALIZED: 'ledger_initialized_v1',
};

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', iconName: 'Utensils', color: '#f97316', isCustom: false, type: 'expense' },
  { id: 'transport', name: 'Transport', iconName: 'Car', color: '#0284c7', isCustom: false, type: 'expense' },
  { id: 'housing', name: 'Housing', iconName: 'Home', color: '#6366f1', isCustom: false, type: 'expense' },
  { id: 'bills', name: 'Bills', iconName: 'Receipt', color: '#eab308', isCustom: false, type: 'expense' },
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingBag', color: '#ec4899', isCustom: false, type: 'expense' },
  { id: 'health', name: 'Health', iconName: 'HeartPulse', color: '#10b981', isCustom: false, type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', iconName: 'Film', color: '#8b5cf6', isCustom: false, type: 'expense' },
  { id: 'other_expense', name: 'Other', iconName: 'MoreHorizontal', color: '#64748b', isCustom: false, type: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', iconName: 'Briefcase', color: '#10b981', isCustom: false, type: 'income' },
  { id: 'freelance', name: 'Freelance', iconName: 'Smartphone', color: '#3b82f6', isCustom: false, type: 'income' },
  { id: 'gift', name: 'Gift', iconName: 'Gift', color: '#ec4899', isCustom: false, type: 'income' },
  { id: 'other_income', name: 'Other', iconName: 'MoreHorizontal', color: '#64748b', isCustom: false, type: 'income' },
];

export const EMPTY_BUDGETS: Budget = {
  overallMonthly: 0,
  categoryBudgets: {},
};

export const StorageService = {
  /**
   * Initializes storage with zero demo data.
   * Performs one-time cleanup of any legacy v1 mock data while preserving real user entries.
   */
  init(): void {
    const isV2 = localStorage.getItem(STORAGE_KEYS.VERSION);

    if (!isV2) {
      // One-time cleanup and migration from legacy v1
      let migratedTransactions: Transaction[] = [];

      try {
        const legacyExpensesRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_EXPENSES);
        if (legacyExpensesRaw) {
          const parsed = JSON.parse(legacyExpensesRaw);
          if (Array.isArray(parsed)) {
            // Filter out old seeded sample entries (ids starting with 'exp-demo-' or 'exp-hist-')
            migratedTransactions = parsed
              .filter((item: any) => {
                const id = String(item.id || '');
                return !id.startsWith('exp-demo-') && !id.startsWith('exp-hist-');
              })
              .map((item: any) => ({
                id: item.id || 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                type: (item.type === 'income' ? 'income' : 'expense') as TransactionType,
                amount: Math.abs(Number(item.amount) || 0),
                categoryId: item.categoryId || 'other_expense',
                note: item.note || undefined,
                date: item.date || new Date().toISOString().split('T')[0],
                createdAt: item.createdAt || Date.now(),
              }));
          }
        }
      } catch (err) {
        console.warn('Error migrating legacy data:', err);
      }

      // Save migrated transactions or empty array
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(migratedTransactions));

      // Setup clean categories if not present
      if (!localStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.INCOME_CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify(DEFAULT_INCOME_CATEGORIES));
      }

      // Check legacy budgets; if they had mock 24000, start clean at 0
      let budgetsToSave = EMPTY_BUDGETS;
      try {
        const legacyBudgets = localStorage.getItem(STORAGE_KEYS.LEGACY_BUDGETS);
        if (legacyBudgets) {
          const parsed = JSON.parse(legacyBudgets);
          // If it had the old default 24000, clear it
          if (parsed && parsed.overallMonthly !== 24000) {
            budgetsToSave = parsed;
          }
        }
      } catch {
        budgetsToSave = EMPTY_BUDGETS;
      }
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgetsToSave));

      // Clean up legacy keys
      localStorage.removeItem(STORAGE_KEYS.LEGACY_EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_INITIALIZED);

      // Mark v2 active
      localStorage.setItem(STORAGE_KEYS.VERSION, 'true');
    }
  },

  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            type: (item.type === 'income' ? 'income' : 'expense') as TransactionType,
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse transactions', e);
    }
    return [];
  },

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const transactions = this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      type: tx.type || 'expense',
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
    };
    transactions.unshift(newTx);
    this.saveTransactions(transactions);
    return newTx;
  },

  updateTransaction(updated: Transaction): void {
    const transactions = this.getTransactions().map((t) => (t.id === updated.id ? updated : t));
    this.saveTransactions(transactions);
  },

  deleteTransaction(id: string): Transaction | null {
    const transactions = this.getTransactions();
    const target = transactions.find((t) => t.id === id) || null;
    const filtered = transactions.filter((t) => t.id !== id);
    this.saveTransactions(filtered);
    return target;
  },

  restoreTransaction(tx: Transaction): void {
    const transactions = this.getTransactions();
    transactions.unshift(tx);
    this.saveTransactions(transactions);
  },

  // Backwards compatibility for expense-specific helpers
  getExpenses(): Transaction[] {
    return this.getTransactions().filter((t) => t.type === 'expense');
  },

  addExpense(expense: Omit<Transaction, 'id' | 'createdAt' | 'type'>): Transaction {
    return this.addTransaction({
      ...expense,
      type: 'expense',
    });
  },

  // Categories management
  getExpenseCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse expense categories', e);
    }
    return DEFAULT_EXPENSE_CATEGORIES;
  },

  saveExpenseCategories(cats: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(cats));
  },

  getIncomeCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCOME_CATEGORIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse income categories', e);
    }
    return DEFAULT_INCOME_CATEGORIES;
  },

  saveIncomeCategories(cats: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify(cats));
  },

  getAllCategories(): Category[] {
    return [...this.getExpenseCategories(), ...this.getIncomeCategories()];
  },

  addCategory(category: Omit<Category, 'id' | 'isCustom'>, type: TransactionType = 'expense'): Category {
    const isIncome = type === 'income';
    const list = isIncome ? this.getIncomeCategories() : this.getExpenseCategories();
    const newCat: Category = {
      ...category,
      type,
      id: 'cat_' + Date.now().toString(36),
      isCustom: true,
    };
    list.push(newCat);
    if (isIncome) {
      this.saveIncomeCategories(list);
    } else {
      this.saveExpenseCategories(list);
    }
    return newCat;
  },

  updateCategory(updated: Category): void {
    const isIncome = updated.type === 'income';
    const list = isIncome ? this.getIncomeCategories() : this.getExpenseCategories();
    const nextList = list.map((c) => (c.id === updated.id ? updated : c));
    if (isIncome) {
      this.saveIncomeCategories(nextList);
    } else {
      this.saveExpenseCategories(nextList);
    }
  },

  deleteCategory(categoryId: string, type: TransactionType = 'expense'): void {
    const isIncome = type === 'income';
    let list = isIncome ? this.getIncomeCategories() : this.getExpenseCategories();
    list = list.filter((c) => c.id !== categoryId);
    if (isIncome) {
      this.saveIncomeCategories(list);
    } else {
      this.saveExpenseCategories(list);
    }

    // Reassign existing transactions to other
    const fallbackId = isIncome ? 'other_income' : 'other_expense';
    const transactions = this.getTransactions().map((t) =>
      t.categoryId === categoryId ? { ...t, categoryId: fallbackId } : t
    );
    this.saveTransactions(transactions);
  },

  // Budgets
  getBudgets(): Budget {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse budgets', e);
    }
    return EMPTY_BUDGETS;
  },

  saveBudgets(budget: Budget): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budget));
  },

  // Starting balance
  setStartingBalance(amount: number, dateStr?: string): Transaction {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const startingTx: Transaction = {
      id: 'tx_opening_' + Date.now(),
      type: 'income',
      amount: Math.round(amount * 100) / 100,
      categoryId: 'salary',
      note: 'Opening balance',
      date: today,
      createdAt: Date.now(),
    };
    const transactions = this.getTransactions();
    transactions.unshift(startingTx);
    this.saveTransactions(transactions);
    localStorage.setItem(STORAGE_KEYS.STARTING_BALANCE_PROMPTED, 'true');
    return startingTx;
  },

  hasStartingBalancePrompted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.STARTING_BALANCE_PROMPTED) === 'true';
  },

  markStartingBalancePrompted(): void {
    localStorage.setItem(STORAGE_KEYS.STARTING_BALANCE_PROMPTED, 'true');
  },

  // Backup & Restore
  exportBackup(): string {
    const payload: BackupData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      transactions: this.getTransactions(),
      categories: this.getExpenseCategories(),
      incomeCategories: this.getIncomeCategories(),
      budgets: this.getBudgets(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString) as BackupData;
      if (!data) {
        return { success: false, error: 'Invalid backup file.' };
      }

      // Handle version 2 (transactions) or version 1 (expenses)
      let importedTransactions: Transaction[] = [];
      if (Array.isArray(data.transactions)) {
        importedTransactions = data.transactions.map((t: any) => ({
          ...t,
          type: (t.type === 'income' ? 'income' : 'expense') as TransactionType,
        }));
      } else if (Array.isArray(data.expenses)) {
        importedTransactions = data.expenses.map((e: any) => ({
          ...e,
          type: (e.type === 'income' ? 'income' : 'expense') as TransactionType,
        }));
      }

      this.saveTransactions(importedTransactions);

      if (Array.isArray(data.categories)) {
        this.saveExpenseCategories(data.categories);
      }
      if (Array.isArray(data.incomeCategories)) {
        this.saveIncomeCategories(data.incomeCategories);
      }
      if (data.budgets) {
        this.saveBudgets(data.budgets);
      }

      localStorage.setItem(STORAGE_KEYS.VERSION, 'true');
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to parse JSON file. Please ensure it is valid.' };
    }
  },

  clearAll(): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify(DEFAULT_INCOME_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(EMPTY_BUDGETS));
    localStorage.removeItem(STORAGE_KEYS.STARTING_BALANCE_PROMPTED);
  },
};
