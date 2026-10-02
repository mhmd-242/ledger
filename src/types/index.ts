export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  note?: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isCustom?: boolean;
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
  expenses: Expense[];
  categories: Category[];
  budgets: Budget;
}
