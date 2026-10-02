export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note?: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

// Backwards compatibility alias
export type Expense = Transaction;

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isCustom?: boolean;
  type?: TransactionType; // defaults to 'expense'
}

export interface Budget {
  overallMonthly: number;
  categoryBudgets: Record<string, number>; // categoryId -> amount
}

export type TabType = 'add' | 'history' | 'insights' | 'budgets';

export interface ToastAction {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  transactions?: Transaction[];
  expenses?: Transaction[]; // backward compatibility
  categories?: Category[];
  incomeCategories?: Category[];
  budgets: Budget;
}
