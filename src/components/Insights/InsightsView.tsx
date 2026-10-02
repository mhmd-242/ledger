import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../../types';
import { formatETB, formatMonthLabel, formatMonthShort } from '../../utils/formatters';
import { CategoryIcon } from '../Common/CategoryIcon';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface InsightsViewProps {
  transactions: Transaction[];
  categories: Category[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({ transactions, categories }) => {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthKey);
    transactions.forEach((t) => {
      if (t.date) {
        set.add(t.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions, currentMonthKey]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || currentMonthKey
  );

  const currentMonthIndex = availableMonths.indexOf(selectedMonth);
  const canGoNewer = currentMonthIndex > 0;
  const canGoOlder = currentMonthIndex < availableMonths.length - 1;

  const handlePrevMonth = () => {
    if (canGoOlder) setSelectedMonth(availableMonths[currentMonthIndex + 1]);
  };

  const handleNextMonth = () => {
    if (canGoNewer) setSelectedMonth(availableMonths[currentMonthIndex - 1]);
  };

  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date?.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Expenses only for spending breakdown
  const monthExpenses = useMemo(() => {
    return monthTransactions.filter((t) => (t.type || 'expense') === 'expense');
  }, [monthTransactions]);

  const monthExpensesTotal = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  const monthIncomeTotal = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  // Previous month comparison (expenses only)
  const previousMonthKey = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const prevMonthExpenseTotal = useMemo(() => {
    return transactions
      .filter((t) => t.date?.startsWith(previousMonthKey) && (t.type || 'expense') === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [transactions, previousMonthKey]);

  const monthComparison = useMemo(() => {
    if (prevMonthExpenseTotal === 0) {
      if (monthExpensesTotal === 0) return { text: 'No prior spending data', type: 'neutral' };
      return { text: 'First recorded spending this period', type: 'neutral' };
    }
    const diff = monthExpensesTotal - prevMonthExpenseTotal;
    const pct = Math.round((Math.abs(diff) / prevMonthExpenseTotal) * 100);

    if (diff < 0) {
      return {
        text: `${pct}% less than last month`,
        type: 'decrease',
      };
    } else if (diff > 0) {
      return {
        text: `${pct}% more than last month`,
        type: 'increase',
      };
    } else {
      return {
        text: 'Equal to last month',
        type: 'neutral',
      };
    }
  }, [monthExpensesTotal, prevMonthExpenseTotal]);

  // Category breakdown (expenses only)
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    monthExpenses.forEach((e) => {
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount);
    });

    const list: {
      categoryId: string;
      categoryName: string;
      amount: number;
      percentage: number;
      color: string;
      iconName: string;
    }[] = [];

    map.forEach((amount, catId) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = monthExpensesTotal > 0 ? (amount / monthExpensesTotal) * 100 : 0;
      list.push({
        categoryId: catId,
        categoryName: cat?.name || 'Other',
        amount,
        percentage,
        color: cat?.color || '#64748b',
        iconName: cat?.iconName || 'MoreHorizontal',
      });
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, categories, monthExpensesTotal]);

  // 6-Month Income vs Spending Trend
  const incomeVsSpendingData = useMemo(() => {
    const [selY, selM] = selectedMonth.split('-').map(Number);
    const monthsList: { label: string; income: number; spending: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(selY, selM - 1 - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const spending = transactions
        .filter((t) => t.date?.startsWith(k) && (t.type || 'expense') === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      const income = transactions
        .filter((t) => t.date?.startsWith(k) && t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

      monthsList.push({
        label: formatMonthShort(k),
        income: Math.round(income * 100) / 100,
        spending: Math.round(spending * 100) / 100,
      });
    }

    return monthsList;
  }, [selectedMonth, transactions]);

  const hasAnyTransactions = transactions.length > 0;

  if (!hasAnyTransactions) {
    return (
      <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
        <div className="mb-5">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            Insights
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Monthly Analysis
          </h2>
        </div>

        <div className="p-8 text-center rounded-2xl bg-surface-card border border-surface-border my-6">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            Charts appear once you add expenses
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Log your daily expenses and income to see category breakdowns and 6-month trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-6">
      {/* Month Selector Bar */}
      <div className="flex items-center justify-between p-1 bg-surface-card rounded-xl border border-surface-border">
        <button
          onClick={handlePrevMonth}
          disabled={!canGoOlder}
          aria-label="Previous month"
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
          {formatMonthLabel(selectedMonth)}
        </span>

        <button
          onClick={handleNextMonth}
          disabled={!canGoNewer}
          aria-label="Next month"
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Screen Hero: Spent this month (expenses only) & Income overview */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
        <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
          Spent this month
        </span>
        <div className="text-3xl font-extrabold tabular-nums font-mono text-neutral-900 dark:text-neutral-100 tracking-tight">
          {formatETB(monthExpensesTotal)}
        </div>

        {/* MoM Comparison */}
        <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {monthComparison.type === 'decrease' ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="w-4 h-4" />
                <span>{monthComparison.text}</span>
              </span>
            ) : monthComparison.type === 'increase' ? (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-4 h-4" />
                <span>{monthComparison.text}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-neutral-500">
                <Minus className="w-4 h-4" />
                <span>{monthComparison.text}</span>
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-neutral-400 dark:text-neutral-500 text-[11px] block">
              Income: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatETB(monthIncomeTotal)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown (Expenses Only) */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            Expense breakdown
          </h3>
          <span className="text-xs text-neutral-500">
            {categoryBreakdown.length} {categoryBreakdown.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            No expenses logged for this month yet.
          </div>
        ) : (
          <div>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatETB(Number(value)), 'Spend']}
                    contentStyle={{
                      backgroundColor: '#1e222b',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-3">
              {categoryBreakdown.map((item) => (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        <CategoryIcon name={item.iconName} className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {item.categoryName}
                      </span>
                      <span className="text-neutral-400 font-mono">
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>

                    <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                      {formatETB(item.amount)}
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, item.percentage)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6-Month Income vs Spending Bar Chart */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Income vs spending
            </h3>
            <span className="text-xs text-neutral-500">
              Last 6 months comparison
            </span>
          </div>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeVsSpendingData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#888' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#888' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatETB(Number(val)),
                  name === 'income' ? 'Income' : 'Spending',
                ]}
                contentStyle={{
                  backgroundColor: '#1e222b',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                formatter={(value) => (value === 'income' ? 'Income' : 'Spending')}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spending" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
