import React, { useState, useRef, useEffect } from 'react';
import { Category, Transaction, TransactionType } from '../../types';
import { CategoryIcon } from '../Common/CategoryIcon';
import { formatETB, getTodayString } from '../../utils/formatters';
import { Calendar, FileText, Check, ArrowRight, Wallet, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface QuickAddViewProps {
  expenseCategories: Category[];
  incomeCategories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  todaySpent: number;
  monthIncome: number;
  totalBalance: number;
  todayTransactions: Transaction[];
  onManageCategories: (type: TransactionType) => void;
  onOpenStartingBalance: () => void;
  showStartingBalancePrompt: boolean;
  onDismissStartingBalancePrompt: () => void;
}

export const QuickAddView: React.FC<QuickAddViewProps> = ({
  expenseCategories,
  incomeCategories,
  onAddTransaction,
  todaySpent,
  monthIncome,
  totalBalance,
  todayTransactions,
  onManageCategories,
  onOpenStartingBalance,
  showStartingBalancePrompt,
  onDismissStartingBalancePrompt,
}) => {
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccessAnimated, setIsSuccessAnimated] = useState<boolean>(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  const activeCategories = transactionType === 'expense' ? expenseCategories : incomeCategories;

  // Autofocus the amount field on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update default selected category whenever active category list or transaction type changes
  useEffect(() => {
    if (activeCategories.length > 0) {
      if (!activeCategories.some((c) => c.id === selectedCategoryId)) {
        setSelectedCategoryId(activeCategories[0].id);
      }
    } else {
      setSelectedCategoryId('');
    }
  }, [activeCategories, transactionType, selectedCategoryId]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
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

    setIsSuccessAnimated(true);
    setTimeout(() => setIsSuccessAnimated(false), 300);

    onAddTransaction({
      type: transactionType,
      amount: Math.round(parsedAmount * 100) / 100,
      categoryId: selectedCategoryId,
      note: note.trim() || undefined,
      date,
    });

    setAmountStr('');
    setNote('');
    setErrorMsg('');
    amountInputRef.current?.focus();
  };

  const isNegativeBalance = totalBalance < 0;

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Starting Balance Prompt Banner if not configured yet */}
      {showStartingBalancePrompt && (
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Set starting balance
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Enter your current cash or bank funds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenStartingBalance}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Set now
            </button>
            <button
              onClick={onDismissStartingBalancePrompt}
              aria-label="Dismiss banner"
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Screen Hero Metric: Balance as primary number */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Total Balance
          </span>
          {isNegativeBalance ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 text-[11px] font-bold">
              <AlertTriangle className="w-3 h-3" />
              <span>Negative balance</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Available</span>
            </span>
          )}
        </div>

        {/* Primary Hero Number */}
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-extrabold tabular-nums font-mono tracking-tight ${
            isNegativeBalance ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'
          }`}>
            {isNegativeBalance ? `-${formatETB(Math.abs(totalBalance))}` : formatETB(totalBalance)}
          </span>
        </div>

        {/* Secondary Numbers: Spent Today & Income this month */}
        <div className="mt-4 pt-3 border-t border-surface-border grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-0.5">
              Spent today
            </span>
            <span className="font-bold tabular-nums font-mono text-neutral-900 dark:text-neutral-100 text-sm">
              {formatETB(todaySpent)}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-0.5">
              Income this month
            </span>
            <span className="font-bold tabular-nums font-mono text-emerald-600 dark:text-emerald-400 text-sm">
              {formatETB(monthIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Control Toggle: Expense | Income */}
      <div className="p-1 rounded-xl bg-surface-card border border-surface-border flex items-center">
        <button
          type="button"
          onClick={() => setTransactionType('expense')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            transactionType === 'expense'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Expense</span>
        </button>

        <button
          type="button"
          onClick={() => setTransactionType('income')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
            transactionType === 'income'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Income</span>
        </button>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div className={`p-4 rounded-2xl bg-surface-card border transition-all ${
          errorMsg
            ? 'border-red-500/80 ring-2 ring-red-500/20'
            : 'border-surface-border hover:border-neutral-300 dark:hover:border-neutral-700'
        }`}>
          <label
            htmlFor="transaction-amount"
            className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1"
          >
            {transactionType === 'income' ? 'Income Amount (ETB)' : 'Expense Amount (ETB)'}
          </label>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-neutral-400 dark:text-neutral-500 font-mono select-none">
              ETB
            </span>
            <input
              id="transaction-amount"
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

        {/* Categories Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {transactionType === 'income' ? 'Income Category' : 'Expense Category'}
            </label>
            <button
              type="button"
              onClick={() => onManageCategories(transactionType)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit categories
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {activeCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all min-h-[56px] select-none ${
                    isSelected
                      ? transactionType === 'income'
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold shadow-sm'
                        : 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-sm'
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

        {/* Date & Note Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-card border border-surface-border">
            <label
              htmlFor="transaction-date"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Date</span>
            </label>
            <input
              id="transaction-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-base font-medium text-neutral-900 dark:text-neutral-100 bg-transparent outline-none cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-surface-card border border-surface-border">
            <label
              htmlFor="transaction-note"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Optional note</span>
            </label>
            <input
              id="transaction-note"
              type="text"
              placeholder={transactionType === 'income' ? 'e.g. Monthly salary' : 'e.g. Coffee & pastry'}
              value={note}
              maxLength={60}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-base text-neutral-900 dark:text-neutral-100 bg-transparent placeholder-neutral-400 outline-none"
            />
          </div>
        </div>

        {/* Primary Save Button */}
        <button
          type="submit"
          disabled={!isValidAmount}
          className={`w-full h-13 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-md min-h-[48px] ${
            isSuccessAnimated
              ? 'bg-emerald-600 text-white scale-[0.98]'
              : isValidAmount
              ? transactionType === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] shadow-emerald-500/25'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99] shadow-blue-500/25'
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
              <span>
                Save {isValidAmount ? formatETB(parsedAmount) : ''} {transactionType === 'income' ? 'Income' : 'Expense'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Logged Today section */}
      {todayTransactions.length > 0 ? (
        <div className="pt-2 border-t border-surface-border">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Logged Today ({todayTransactions.length})
            </span>
          </div>

          <div className="space-y-2">
            {todayTransactions.slice(0, 4).map((item) => {
              const cats = item.type === 'income' ? incomeCategories : expenseCategories;
              const cat = cats.find((c) => c.id === item.categoryId);
              const isIncome = item.type === 'income';

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
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                          {cat?.name || 'Transaction'}
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isIncome ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}>
                          {isIncome ? '+ Income' : 'Expense'}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className={`font-bold tabular-nums font-mono ${
                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100'
                  }`}>
                    {isIncome ? `+${formatETB(item.amount)}` : formatETB(item.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
