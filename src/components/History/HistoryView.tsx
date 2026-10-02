import React, { useState, useMemo } from 'react';
import { Expense, Category } from '../../types';
import { CategoryIcon } from '../Common/CategoryIcon';
import { formatETB, formatDateGroup } from '../../utils/formatters';
import { Search, Edit2, Trash2, Calendar, FileText, X } from 'lucide-react';

interface HistoryViewProps {
  expenses: Expense[];
  categories: Category[];
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (expense: Expense) => void;
  onNavigateToAdd: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  expenses,
  categories,
  onDeleteExpense,
  onUpdateExpense,
  onNavigateToAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Edit form state
  const [editAmount, setEditAmount] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditCategoryId(expense.categoryId);
    setEditNote(expense.note || '');
    setEditDate(expense.date);
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const parsed = parseFloat(editAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setEditError('Enter a valid amount greater than 0');
      return;
    }

    onUpdateExpense({
      ...editingExpense,
      amount: Math.round(parsed * 100) / 100,
      categoryId: editCategoryId,
      note: editNote.trim() || undefined,
      date: editDate,
    });

    setEditingExpense(null);
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesCategory =
        selectedCategoryFilter === 'all' || item.categoryId === selectedCategoryFilter;
      const cat = categories.find((c) => c.id === item.categoryId);
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.note?.toLowerCase().includes(query) ||
        cat?.name.toLowerCase().includes(query) ||
        item.amount.toString().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [expenses, selectedCategoryFilter, searchQuery, categories]);

  // Group by day (date string)
  const groupedExpenses = useMemo(() => {
    const groups: { date: string; items: Expense[]; total: number }[] = [];
    const dateMap = new Map<string, Expense[]>();

    // Sort newest date first
    const sorted = [...filteredExpenses].sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });

    sorted.forEach((item) => {
      const list = dateMap.get(item.date) || [];
      list.push(item);
      dateMap.set(item.date, list);
    });

    dateMap.forEach((items, date) => {
      const total = items.reduce((sum, item) => sum + item.amount, 0);
      groups.push({ date, items, total });
    });

    return groups;
  }, [filteredExpenses]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Screen Hero Metric */}
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            History
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Past expenses
          </h2>
        </div>

        <div className="text-right">
          <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            Total in view
          </span>
          <span className="text-base font-bold tabular-nums text-neutral-900 dark:text-neutral-100 font-mono">
            {formatETB(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <label htmlFor="history-search" className="sr-only">
            Search expenses
          </label>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            id="history-search"
            type="text"
            placeholder="Search note, category or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-surface-card border border-surface-border text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-blue-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category horizontal pill filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              selectedCategoryFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-surface-card border border-surface-border text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            All ({expenses.length})
          </button>
          {categories.map((c) => {
            const count = expenses.filter((e) => e.categoryId === c.id).length;
            if (count === 0 && selectedCategoryFilter !== c.id) return null;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryFilter(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
                  selectedCategoryFilter === c.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-surface-card border border-surface-border text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.name}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grouped Day List */}
      {groupedExpenses.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface-card border border-surface-border my-6">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            No expenses found
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            {searchQuery || selectedCategoryFilter !== 'all'
              ? 'Try clearing the search or category filter.'
              : 'Start logging your daily expenses in under 10 seconds.'}
          </p>
          {searchQuery || selectedCategoryFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Reset filters
            </button>
          ) : (
            <button
              onClick={onNavigateToAdd}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Add first expense
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedExpenses.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Day Section Header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {formatDateGroup(group.date)}
                </span>
                <span className="text-xs font-mono tabular-nums text-neutral-500 dark:text-neutral-400 font-medium">
                  {formatETB(group.total)}
                </span>
              </div>

              {/* Items Card List */}
              <div className="rounded-2xl bg-surface-card border border-surface-border divide-y divide-surface-border overflow-hidden">
                {group.items.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: cat?.color || '#64748b' }}
                        >
                          <CategoryIcon
                            name={cat?.iconName || 'MoreHorizontal'}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 leading-tight truncate">
                            {cat?.name || 'Expense'}
                          </p>
                          {item.note && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal truncate mt-0.5">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold tabular-nums font-mono text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                          {formatETB(item.amount)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit expense"
                            aria-label={`Edit ${cat?.name || 'expense'}`}
                            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(item.id)}
                            title="Delete expense"
                            aria-label={`Delete ${cat?.name || 'expense'}`}
                            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface-card border border-surface-border p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Edit expense
              </h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Amount (ETB)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editAmount}
                  onChange={(e) => {
                    if (e.target.value === '' || /^\d+(\.\d{0,2})?$/.test(e.target.value)) {
                      setEditAmount(e.target.value);
                      setEditError('');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-surface-border font-mono font-bold text-lg text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500"
                />
                {editError && <p className="text-xs text-red-500 mt-1">{editError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  Category
                </label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-surface-border text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-surface-border text-sm text-neutral-900 dark:text-neutral-100 outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Note</span>
                </label>
                <input
                  type="text"
                  value={editNote}
                  maxLength={60}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-bg border border-surface-border text-sm text-neutral-900 dark:text-neutral-100 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-border text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
