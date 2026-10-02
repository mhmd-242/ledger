import React, { useState, useRef, useEffect } from 'react';
import { Category, Expense } from '../../types';
import { CategoryIcon } from '../Common/CategoryIcon';
import { formatETB, getTodayString } from '../../utils/formatters';
import { Calendar, FileText, Check, ArrowRight, Sparkles } from 'lucide-react';

interface QuickAddViewProps {
  categories: Category[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  todayExpenses: Expense[];
  onManageCategories: () => void;
}

export const QuickAddView: React.FC<QuickAddViewProps> = ({
  categories,
  onAddExpense,
  todayExpenses,
  onManageCategories,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]?.id || 'food'
  );
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccessAnimated, setIsSuccessAnimated] = useState<boolean>(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Autofocus the amount field on mount for rapid entry
  useEffect(() => {
    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update default selected category if categories load/change
  useEffect(() => {
    if (!categories.some((c) => c.id === selectedCategoryId) && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Regex allows empty, or positive number with up to 2 decimal places
    if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) {
      setAmountStr(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  const parsedAmount = parseFloat(amountStr);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isValidAmount) {
      setErrorMsg('Enter a valid amount greater than 0');
      amountInputRef.current?.focus();
      return;
    }

    if (!selectedCategoryId) {
      setErrorMsg('Please select a category');
      return;
    }

    // Trigger subtle success animation
    setIsSuccessAnimated(true);
    setTimeout(() => setIsSuccessAnimated(false), 300);

    onAddExpense({
      amount: Math.round(parsedAmount * 100) / 100,
      categoryId: selectedCategoryId,
      note: note.trim() || undefined,
      date,
    });

    // Reset amount & note, keep category for rapid repeat logging
    setAmountStr('');
    setNote('');
    setErrorMsg('');

    // Re-focus amount input for the next log
    amountInputRef.current?.focus();
  };

  const todayTotal = todayExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Hero Header Area: Calm, purposeful, numbers as hero */}
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            Quick Add
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Log an expense
          </h2>
        </div>

        <div className="text-right">
          <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            Today's spend
          </span>
          <span className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100 font-mono">
            {formatETB(todayTotal)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount Input Card - Hero of the screen */}
        <div className={`p-4 rounded-2xl bg-surface-card border transition-all ${
          errorMsg
            ? 'border-red-500/80 ring-2 ring-red-500/20'
            : 'border-surface-border hover:border-neutral-300 dark:hover:border-neutral-700'
        }`}>
          <label
            htmlFor="expense-amount"
            className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1"
          >
            Amount (ETB)
          </label>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-neutral-400 dark:text-neutral-500 font-mono select-none">
              ETB
            </span>
            <input
              id="expense-amount"
              ref={amountInputRef}
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              autoComplete="off"
              placeholder="0.00"
              value={amountStr}
              onChange={handleAmountChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="w-full text-3xl font-extrabold tabular-nums font-mono text-neutral-900 dark:text-neutral-100 bg-transparent placeholder-neutral-300 dark:placeholder-neutral-700 outline-none"
            />
          </div>

          {errorMsg && (
            <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Category Picker - At most 1 tap to pick */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Category
            </label>
            <button
              type="button"
              onClick={onManageCategories}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit categories
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all min-h-[56px] select-none ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-sm'
                      : 'border-surface-border bg-surface-card hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-white shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs leading-tight truncate w-full">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Optional Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-card border border-surface-border">
            <label
              htmlFor="expense-date"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Date</span>
            </label>
            <input
              id="expense-date"
              type="date"
              value={date}
              max={getTodayString()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-base font-medium text-neutral-900 dark:text-neutral-100 bg-transparent outline-none cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-surface-card border border-surface-border">
            <label
              htmlFor="expense-note"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Optional note</span>
            </label>
            <input
              id="expense-note"
              type="text"
              placeholder="e.g. Lunch with team"
              value={note}
              maxLength={60}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-base text-neutral-900 dark:text-neutral-100 bg-transparent placeholder-neutral-400 outline-none"
            />
          </div>
        </div>

        {/* Primary Save Action */}
        <button
          type="submit"
          disabled={!isValidAmount}
          className={`w-full h-13 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-md min-h-[48px] ${
            isSuccessAnimated
              ? 'bg-emerald-600 text-white scale-[0.98]'
              : isValidAmount
              ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99] shadow-blue-500/25'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed shadow-none'
          }`}
        >
          {isSuccessAnimated ? (
            <>
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Logged!</span>
            </>
          ) : (
            <>
              <span>Save {isValidAmount ? formatETB(parsedAmount) : 'Expense'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Today's Logged List Preview (Quick verification) */}
      {todayExpenses.length > 0 && (
        <div className="mt-8 border-t border-surface-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Logged Today ({todayExpenses.length})
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Latest at top
            </span>
          </div>

          <div className="space-y-2">
            {todayExpenses.slice(0, 3).map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-card border border-surface-border text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat?.color || '#64748b' }}
                    >
                      <CategoryIcon name={cat?.iconName || 'MoreHorizontal'} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                        {cat?.name || 'Expense'}
                      </p>
                      {item.note && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold tabular-nums font-mono text-neutral-900 dark:text-neutral-100">
                    {formatETB(item.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* First run guidance if 0 expenses logged today */}
      {todayExpenses.length === 0 && (
        <div className="mt-8 p-4 rounded-xl bg-surface-card border border-surface-border/80 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            <p className="font-semibold text-neutral-800 dark:text-neutral-200 mb-0.5">
              Instant 3-tap logging
            </p>
            <p>
              Type the amount above, tap a category chip, and tap Save. Expenses are saved locally in ETB.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
