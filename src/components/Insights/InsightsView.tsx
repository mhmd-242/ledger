import React, { useState, useMemo } from 'react';
import { Expense, Category } from '../../types';
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
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface InsightsViewProps {
  expenses: Expense[];
  categories: Category[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({ expenses, categories }) => {
  // Determine available months from expenses or current date
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthKey);
    expenses.forEach((e) => {
      if (e.date) {
        set.add(e.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [expenses, currentMonthKey]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || currentMonthKey
  );

  // Month navigation
  const currentMonthIndex = availableMonths.indexOf(selectedMonth);
  const canGoNewer = currentMonthIndex > 0;
  const canGoOlder = currentMonthIndex < availableMonths.length - 1;

  const handlePrevMonth = () => {
    if (canGoOlder) setSelectedMonth(availableMonths[currentMonthIndex + 1]);
  };

  const handleNextMonth = () => {
    if (canGoNewer) setSelectedMonth(availableMonths[currentMonthIndex - 1]);
  };

  // Expenses for the selected month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date?.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const monthTotal = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  // Previous month comparison
  const previousMonthKey = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const prevMonthTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date?.startsWith(previousMonthKey))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, previousMonthKey]);

  const monthComparison = useMemo(() => {
    if (prevMonthTotal === 0) {
      if (monthTotal === 0) return { diffPct: 0, text: 'No prior data to compare', type: 'neutral' };
      return { diffPct: 100, text: 'First recorded spending this period', type: 'neutral' };
    }
    const diff = monthTotal - prevMonthTotal;
    const pct = Math.round((Math.abs(diff) / prevMonthTotal) * 100);

    if (diff < 0) {
      return {
        diffPct: pct,
        diffAmount: Math.abs(diff),
        text: `${pct}% less than last month`,
        type: 'decrease',
      };
    } else if (diff > 0) {
      return {
        diffPct: pct,
        diffAmount: diff,
        text: `${pct}% more than last month`,
        type: 'increase',
      };
    } else {
      return {
        diffPct: 0,
        diffAmount: 0,
        text: 'Equal to last month',
        type: 'neutral',
      };
    }
  }, [monthTotal, prevMonthTotal]);

  // Category breakdown for selected month
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
      const percentage = monthTotal > 0 ? (amount / monthTotal) * 100 : 0;
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
  }, [monthExpenses, categories, monthTotal]);

  // 6-Month Trend Data
  const trendData = useMemo(() => {
    const [selY, selM] = selectedMonth.split('-').map(Number);
    const monthsList: { key: string; label: string; amount: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(selY, selM - 1 - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const sum = expenses
        .filter((e) => e.date?.startsWith(k))
        .reduce((acc, e) => acc + e.amount, 0);

      monthsList.push({
        key: k,
        label: formatMonthShort(k),
        amount: Math.round(sum * 100) / 100,
      });
    }

    return monthsList;
  }, [selectedMonth, expenses]);

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

      {/* Screen Hero Metric: Primary number on this screen */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
        <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
          Spent this month
        </span>
        <div className="text-3xl font-extrabold tabular-nums font-mono text-neutral-900 dark:text-neutral-100 tracking-tight">
          {formatETB(monthTotal)}
        </div>

        {/* Month-over-month comparison */}
        <div className="mt-3 pt-3 border-t border-surface-border flex items-center gap-2 text-xs">
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
          {prevMonthTotal > 0 && (
            <span className="text-neutral-400 dark:text-neutral-500 font-mono tabular-nums">
              ({formatETB(prevMonthTotal)} prev)
            </span>
          )}
        </div>
      </div>

      {/* Category Breakdown (Donut + Horizontal Bars) */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            Category breakdown
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
            {/* Donut Chart */}
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

            {/* Horizontal Bar Breakdown with Amounts and Percentages */}
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

                  {/* Horizontal progress bar */}
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

      {/* Monthly Trends (Last 6 Months Bar Chart) */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              6-Month trends
            </h3>
            <span className="text-xs text-neutral-500">
              Monthly spending totals
            </span>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                formatter={(val: any) => [formatETB(Number(val)), 'Total']}
                contentStyle={{
                  backgroundColor: '#1e222b',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Bar
                dataKey="amount"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                activeBar={{ fill: '#3b82f6' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
