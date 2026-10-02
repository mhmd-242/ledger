import { Expense, Category, Budget, BackupData } from '../types';

const STORAGE_KEYS = {
  EXPENSES: 'ledger_expenses_v1',
  CATEGORIES: 'ledger_categories_v1',
  BUDGETS: 'ledger_budgets_v1',
  THEME: 'ledger_theme_v1',
  INITIALIZED: 'ledger_initialized_v1',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', iconName: 'Utensils', color: '#f97316', isCustom: false },
  { id: 'transport', name: 'Transport', iconName: 'Car', color: '#0284c7', isCustom: false },
  { id: 'housing', name: 'Housing', iconName: 'Home', color: '#6366f1', isCustom: false },
  { id: 'bills', name: 'Bills', iconName: 'Receipt', color: '#eab308', isCustom: false },
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingBag', color: '#ec4899', isCustom: false },
  { id: 'health', name: 'Health', iconName: 'HeartPulse', color: '#10b981', isCustom: false },
  { id: 'entertainment', name: 'Entertainment', iconName: 'Film', color: '#8b5cf6', isCustom: false },
  { id: 'other', name: 'Other', iconName: 'MoreHorizontal', color: '#64748b', isCustom: false },
];

export const DEFAULT_BUDGETS: Budget = {
  overallMonthly: 24000,
  categoryBudgets: {
    food: 5500,
    transport: 2800,
    housing: 8000,
    bills: 2500,
    shopping: 2000,
    health: 1200,
    entertainment: 1500,
    other: 800,
  },
};

/**
 * Generate sensible demo expenses for the past 6 months to showcase trends and charts.
 */
function generateDemoExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const now = new Date();

  // Helper to format date YYYY-MM-DD
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Add realistic entries for current month (today and past few days)
  const currentDays = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Today entries
  expenses.push({
    id: 'exp-demo-1',
    amount: 145.0,
    categoryId: 'food',
    note: 'Lunch at Kaldi\'s Coffee',
    date: formatDate(now),
    createdAt: Date.now() - 3600000 * 2,
  });

  expenses.push({
    id: 'exp-demo-2',
    amount: 85.0,
    categoryId: 'transport',
    note: 'Ride to office',
    date: formatDate(now),
    createdAt: Date.now() - 3600000 * 5,
  });

  // Yesterday entries
  if (currentDays > 1) {
    const yday = new Date(currentYear, currentMonth, currentDays - 1);
    expenses.push({
      id: 'exp-demo-3',
      amount: 420.0,
      categoryId: 'food',
      note: 'Grocery & fruits',
      date: formatDate(yday),
      createdAt: Date.now() - 86400000,
    });
    expenses.push({
      id: 'exp-demo-4',
      amount: 1200.0,
      categoryId: 'bills',
      note: 'Ethio Telecom Fiber',
      date: formatDate(yday),
      createdAt: Date.now() - 86400000 - 10000,
    });
  }

  // Earlier in current month
  if (currentDays > 3) {
    const d3 = new Date(currentYear, currentMonth, Math.max(1, currentDays - 3));
    expenses.push({
      id: 'exp-demo-5',
      amount: 650.0,
      categoryId: 'shopping',
      note: 'New work notebook & stationery',
      date: formatDate(d3),
      createdAt: Date.now() - 86400000 * 3,
    });
  }

  // Rent / Housing for 1st of month
  const rentDate = new Date(currentYear, currentMonth, 1);
  expenses.push({
    id: 'exp-demo-rent',
    amount: 7500.0,
    categoryId: 'housing',
    note: 'Monthly Apartment Rent',
    date: formatDate(rentDate),
    createdAt: Date.now() - 86400000 * Math.max(1, currentDays - 1),
  });

  // Previous 5 months data to make 6-month trend chart look rich
  const pastMonthsData = [
    { offset: 1, total: 21450, breakdown: { housing: 7500, food: 5200, transport: 2700, bills: 2400, shopping: 1800, entertainment: 1200, health: 650 } },
    { offset: 2, total: 19800, breakdown: { housing: 7500, food: 4900, transport: 2600, bills: 2200, shopping: 1100, entertainment: 900, health: 600 } },
    { offset: 3, total: 23100, breakdown: { housing: 7500, food: 5600, transport: 2900, bills: 2500, shopping: 2400, entertainment: 1400, health: 800 } },
    { offset: 4, total: 18900, breakdown: { housing: 7500, food: 4600, transport: 2400, bills: 2100, shopping: 1200, entertainment: 700, health: 400 } },
    { offset: 5, total: 20500, breakdown: { housing: 7500, food: 5100, transport: 2650, bills: 2300, shopping: 1550, entertainment: 1000, health: 400 } },
  ];

  pastMonthsData.forEach((pm, pIdx) => {
    const targetDate = new Date(currentYear, currentMonth - pm.offset, 15);
    const dStr = formatDate(targetDate);
    Object.entries(pm.breakdown).forEach(([catId, amt], idx) => {
      expenses.push({
        id: `exp-hist-${pIdx}-${idx}`,
        amount: amt,
        categoryId: catId,
        note: `Summary logged`,
        date: dStr,
        createdAt: targetDate.getTime(),
      });
    });
  });

  return expenses;
}

/**
 * Storage Service Module
 * Cleanly separates data persistence so it can easily be swapped with an API or SQLite/IndexedDB later.
 */
export const StorageService = {
  init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(generateDemoExpenses()));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  },

  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse expenses', e);
      return [];
    }
  },

  saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const expenses = this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
    };
    expenses.unshift(newExpense);
    this.saveExpenses(expenses);
    return newExpense;
  },

  updateExpense(updated: Expense): void {
    const expenses = this.getExpenses().map((e) => (e.id === updated.id ? updated : e));
    this.saveExpenses(expenses);
  },

  deleteExpense(id: string): Expense | null {
    const expenses = this.getExpenses();
    const target = expenses.find((e) => e.id === id) || null;
    const filtered = expenses.filter((e) => e.id !== id);
    this.saveExpenses(filtered);
    return target;
  },

  restoreExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    // Insert back maintaining createdAt or top
    expenses.unshift(expense);
    this.saveExpenses(expenses);
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse categories', e);
    }
    return DEFAULT_CATEGORIES;
  },

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory(category: Omit<Category, 'id' | 'isCustom'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...category,
      id: 'cat_' + Date.now().toString(36),
      isCustom: true,
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  },

  updateCategory(updated: Category): void {
    const categories = this.getCategories().map((c) => (c.id === updated.id ? updated : c));
    this.saveCategories(categories);
  },

  deleteCategory(categoryId: string): void {
    let categories = this.getCategories();
    categories = categories.filter((c) => c.id !== categoryId);
    this.saveCategories(categories);

    // Reassign expenses under deleted category to 'other'
    const expenses = this.getExpenses().map((e) =>
      e.categoryId === categoryId ? { ...e, categoryId: 'other' } : e
    );
    this.saveExpenses(expenses);
  },

  getBudgets(): Budget {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse budgets', e);
    }
    return DEFAULT_BUDGETS;
  },

  saveBudgets(budget: Budget): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budget));
  },

  exportBackup(): string {
    const payload: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      expenses: this.getExpenses(),
      categories: this.getCategories(),
      budgets: this.getBudgets(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString) as BackupData;
      if (!data || !Array.isArray(data.expenses) || !Array.isArray(data.categories)) {
        return { success: false, error: 'Invalid backup format. Missing required fields.' };
      }
      this.saveExpenses(data.expenses);
      this.saveCategories(data.categories);
      if (data.budgets) {
        this.saveBudgets(data.budgets);
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to parse JSON file. Please ensure it is valid.' };
    }
  },

  resetDemo(): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(generateDemoExpenses()));
  },

  clearAll(): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
  },
};
