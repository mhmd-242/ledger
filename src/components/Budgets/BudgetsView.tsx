import React, { useState, useMemo } from 'react';
import { Expense, Category, Budget } from '../../types';
import { formatETB } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Sliders,
  X,
  Target,
} from 'lucide-react';

interface BudgetsViewProps {
  expenses: Expense[];
  categories: Category[];
  budget: Budget;
  onUpdateBudget: (newBudget: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  expenses,
  categories,
  budget,
  onUpdateBudget,
}) => {
  // Current month key
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Current month total spend
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date?.startsWith(currentMonthKey));
  }, [expenses, currentMonthKey]);

  const currentMonthTotalSpend = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  // Modal edit state
  const [editingCategoryBudget, setEditingCategoryBudget] = useState<{
    id: string; // 'overall' or categoryId
    name: string;
    currentLimit: number;
  } | null>(null);

  const [editLimitInput, setEditLimitInput] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  const openBudgetEditor = (id: string, name: string, currentLimit: number) => {
    setEditingCategoryBudget({ id, name, currentLimit });
    setEditLimitInput(currentLimit.toString());
    setEditError('');
  };

  const handleSaveBudgetLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryBudget) return;

    const parsed = parseFloat(editLimitInput);
    if (isNaN(parsed) || parsed < 0) {
      setEditError('Enter a valid positive number');
      return;
    }

    const rounded = Math.round(parsed * 100) / 100;

    if (editingCategoryBudget.id === 'overall') {
      onUpdateBudget({
        ...budget,
        overallMonthly: rounded,
      });
    } else {
      onUpdateBudget({
        ...budget,
        categoryBudgets: {
          ...budget.categoryBudgets,
          [editingCategoryBudget.id]: rounded,
        },
      });
    }

    setEditingCategoryBudget(null);
  };

  // Spending per category this month
  const categorySpendMap = useMemo(() => {
    const map = new Map<string, number>();
    currentMonthExpenses.forEach((e) => {
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount);
    });
    return map;
  }, [currentMonthExpenses]);

  // Overall budget metrics
  const overallLimit = budget.overallMonthly || 0;
  const overallUsedPct = overallLimit > 0 ? (currentMonthTotalSpend / overallLimit) * 100 : 0;
  const overallRemaining = Math.max(0, overallLimit - currentMonthTotalSpend);
  const overallOverAmount = currentMonthTotalSpend > overallLimit ? currentMonthTotalSpend - overallLimit : 0;

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-6">
      {/* Screen Hero Metric: Primary number is Remaining or Budget */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            Monthly Budgets
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Spending targets
          </h2>
        </div>

        <button
          onClick={() => openBudgetEditor('overall', 'Overall Monthly Budget', overallLimit)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Edit limit</span>
        </button>
      </div>

      {/* Overall Monthly Card */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Remaining this month
            </span>
            <div className="text-3xl font-extrabold tabular-nums font-mono text-neutral-900 dark:text-neutral-100 tracking-tight mt-0.5">
              {overallOverAmount > 0 ? (
                <span className="text-red-600 dark:text-red-400">
                  -{formatETB(overallOverAmount)}
                </span>
              ) : (
                formatETB(overallRemaining)
              )}
            </div>
          </div>

          {/* Status Badge with both icon and text */}
          {overallUsedPct > 100 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Over limit</span>
            </div>
          ) : overallUsedPct >= 80 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold shrink-0">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>80% warning</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>On track</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span>
              Spent <strong className="font-mono text-neutral-800 dark:text-neutral-200">{formatETB(currentMonthTotalSpend)}</strong>
            </span>
            <span>
              Target <strong className="font-mono text-neutral-800 dark:text-neutral-200">{formatETB(overallLimit)}</strong>
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                overallUsedPct > 100
                  ? 'bg-red-500'
                  : overallUsedPct >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallUsedPct)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-neutral-400 mt-1 font-mono">
            <span>{overallUsedPct.toFixed(1)}% consumed</span>
            <span>{Math.max(0, 100 - overallUsedPct).toFixed(1)}% remaining</span>
          </div>
        </div>
      </div>

      {/* Category Budgets List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            Category Budgets
          </h3>
          <span className="text-xs text-neutral-500">
            Tap to edit target
          </span>
        </div>

        <div className="space-y-2.5">
          {categories.map((cat) => {
            const spent = categorySpendMap.get(cat.id) || 0;
            const limit = budget.categoryBudgets[cat.id] || 0;
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            const isExceeded = limit > 0 && spent > limit;
            const isNearLimit = limit > 0 && pct >= 80 && !isExceeded;

            return (
              <div
                key={cat.id}
                onClick={() => openBudgetEditor(cat.id, `${cat.name} Budget`, limit)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    openBudgetEditor(cat.id, `${cat.name} Budget`, limit);
                  }
                }}
                className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                        {cat.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status warning badge */}
                    {isExceeded && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Over</span>
                      </span>
                    )}
                    {isNearLimit && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3 h-3" />
                        <span>{pct.toFixed(0)}%</span>
                      </span>
                    )}

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {formatETB(spent)}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {' / '}{limit > 0 ? formatETB(limit) : 'No limit'}
                      </span>
                    </div>

                    <Edit3 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-500 opacity-60 ml-1" />
                  </div>
                </div>

                {/* Category Progress Bar */}
                {limit > 0 ? (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isExceeded
                            ? 'bg-red-500'
                            : isNearLimit
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>{pct.toFixed(0)}% of limit</span>
                      <span>
                        {isExceeded
                          ? `+${formatETB(spent - limit)} over`
                          : `${formatETB(limit - spent)} left`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400">
                    Tap to set monthly spending target
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Limit Edit Modal */}
      {editingCategoryBudget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface-card border border-surface-border p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                  {editingCategoryBudget.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingCategoryBudget(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudgetLimit} className="space-y-4">
              <div>
                <label
                  htmlFor="budget-amount-input"
                  className="block text-xs font-semibold text-neutral-500 mb-1"
                >
                  Monthly limit (ETB)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-neutral-400 font-bold">
                    ETB
                  </span>
                  <input
                    id="budget-amount-input"
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    value={editLimitInput}
                    onChange={(e) => {
                      if (e.target.value === '' || /^\d+(\.\d{0,2})?$/.test(e.target.value)) {
                        setEditLimitInput(e.target.value);
                        setEditError('');
                      }
                    }}
                    className="w-full pl-13 pr-3 py-2.5 rounded-xl bg-surface-bg border border-surface-border font-mono font-bold text-lg text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500"
                  />
                </div>
                {editError && <p className="text-xs text-red-500 mt-1">{editError}</p>}
                <p className="text-[11px] text-neutral-400 mt-1">
                  Set to 0 to remove budget limit.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategoryBudget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                >
                  Save target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
