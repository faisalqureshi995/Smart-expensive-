import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencies';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Layers,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    accounts,
    categories,
    budgets,
    savingsGoals,
    loans,
    settings,
  } = useFinance();

  const [timeframe, setTimeframe] = useState<'3_months' | '6_months' | 'year'>('6_months');
  const [selectedAccFilter, setSelectedAccFilter] = useState<string>('all');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Filter transactions based on account filter
  const targetTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedAccFilter !== 'all') {
        if (t.accountId !== selectedAccFilter && t.toAccountId !== selectedAccFilter) return false;
      }
      return true;
    });
  }, [transactions, selectedAccFilter]);

  // 1. Monthly Income vs Expenses Bar Chart Data
  const monthlyBarData = useMemo(() => {
    const monthsBack = timeframe === '3_months' ? 3 : timeframe === '6_months' ? 6 : 12;
    const result: { monthKey: string; label: string; income: number; expense: number; net: number }[] = [];

    const now = new Date();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'short' });

      let inc = 0;
      let exp = 0;

      targetTransactions.forEach((t) => {
        if (t.date.startsWith(key)) {
          if (t.type === 'income') inc += t.amount;
          else if (t.type === 'expense') exp += t.amount;
          else if (t.type === 'refund') exp = Math.max(0, exp - t.amount);
        }
      });

      result.push({
        monthKey: key,
        label,
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }

    return result;
  }, [targetTransactions, timeframe]);

  const maxBarValue = Math.max(
    1,
    ...monthlyBarData.map((m) => Math.max(m.income, m.expense))
  );

  // 2. Spending by Category (Doughnut data)
  const categoryData = useMemo(() => {
    const map: Record<string, { name: string; amount: number; color: string }> = {};

    targetTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        const name = t.categoryName || 'Other';
        const color = cat?.color || '#94a3b8';
        if (!map[name]) {
          map[name] = { name, amount: 0, color };
        }
        map[name].amount += t.amount;
      });

    const list = Object.values(map).sort((a, b) => b.amount - a.amount);
    const totalExp = list.reduce((s, c) => s + c.amount, 0);

    return { list, totalExp };
  }, [targetTransactions, categories]);

  // SVG Doughnut Arc Calculations
  const doughnutSegments = useMemo(() => {
    const { list, totalExp } = categoryData;
    if (totalExp === 0) return [];

    let currentAngle = 0;
    return list.slice(0, 6).map((item) => {
      const percentage = (item.amount / totalExp) * 100;
      const angle = (item.amount / totalExp) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return {
        ...item,
        percentage: Number(percentage.toFixed(1)),
        startAngle,
        endAngle: currentAngle,
      };
    });
  }, [categoryData]);

  // Helper for SVG arc path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians),
      };
    };

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // 3. Payment Method Distribution
  const paymentMethodData = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;

    targetTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const m = t.paymentMethod || 'Other';
        map[m] = (map[m] || 0) + t.amount;
        total += t.amount;
      });

    return Object.entries(map)
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [targetTransactions]);

  // 4. Cash Flow Summary
  const cashFlow = useMemo(() => {
    let inflows = 0;
    let outflows = 0;

    targetTransactions.forEach((t) => {
      if (t.type === 'income' || t.type === 'refund' || t.type === 'loan_received') {
        inflows += t.amount;
      } else if (t.type === 'expense' || t.type === 'loan_repayment') {
        outflows += t.amount;
      }
    });

    return {
      inflows,
      outflows,
      net: inflows - outflows,
    };
  }, [targetTransactions]);

  // 5. Loan Balances Overview
  const loanStats = useMemo(() => {
    const lent = loans
      .filter((l) => l.direction === 'lent' && l.status !== 'fully_paid')
      .reduce((s, l) => s + l.outstandingPrincipal, 0);

    const borrowed = loans
      .filter((l) => l.direction === 'borrowed' && l.status !== 'fully_paid')
      .reduce((s, l) => s + l.outstandingPrincipal, 0);

    return { lent, borrowed, net: lent - borrowed };
  }, [loans]);

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Visual Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive breakdown of cash flow, category distribution, and trends
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Account Filter */}
          <select
            value={selectedAccFilter}
            onChange={(e) => setSelectedAccFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setTimeframe('3_months')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                timeframe === '3_months'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setTimeframe('6_months')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                timeframe === '6_months'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                timeframe === 'year'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              1 Year
            </button>
          </div>
        </div>
      </div>

      {/* Cash Flow Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Total Inflows</span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(cashFlow.inflows, settings.defaultCurrency)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Total Outflows</span>
            <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              -{formatCurrency(cashFlow.outflows, settings.defaultCurrency)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Net Cash Flow</span>
            <p
              className={`text-xl font-bold font-mono ${
                cashFlow.net >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {cashFlow.net >= 0 ? '+' : ''}
              {formatCurrency(cashFlow.net, settings.defaultCurrency)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Monthly Income vs Expenses Bar Chart */}
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-500">Monthly side-by-side comparison</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-400">Expenses</span>
              </div>
            </div>
          </div>

          {/* SVG Responsive Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-700/80">
            {monthlyBarData.map((m) => {
              const incHeight = Math.max(4, Math.round((m.income / maxBarValue) * 180));
              const expHeight = Math.max(4, Math.round((m.expense / maxBarValue) * 180));

              return (
                <div key={m.monthKey} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full">
                    {/* Income Bar */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className="w-3 sm:w-5 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all duration-300"
                        style={{ height: `${incHeight}px` }}
                      />
                    </div>

                    {/* Expense Bar */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className="w-3 sm:w-5 bg-rose-500 hover:bg-rose-600 rounded-t-sm transition-all duration-300"
                        style={{ height: `${expHeight}px` }}
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[11px] text-slate-400">
            Hover over bars to inspect monthly volume
          </div>
        </div>

        {/* 2. Spending by Category Doughnut Chart */}
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Spending by Category
              </h3>
              <p className="text-xs text-slate-500">Distribution of total expenses</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {formatCurrency(categoryData.totalExp, settings.defaultCurrency)}
            </span>
          </div>

          {doughnutSegments.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No recorded spending in this view.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              {/* Doughnut SVG */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                    className="dark:stroke-slate-700"
                  />
                  {doughnutSegments.map((seg, idx) => {
                    const strokeDasharray = `${(seg.percentage * 251.2) / 100} 251.2`;
                    // Calculate stroke-dashoffset
                    const priorPercentage = doughnutSegments
                      .slice(0, idx)
                      .reduce((s, prev) => s + prev.percentage, 0);
                    const strokeDashoffset = -((priorPercentage * 251.2) / 100);

                    return (
                      <circle
                        key={seg.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={hoveredSlice === seg.name ? '15' : '12'}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(seg.name)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400">
                    {hoveredSlice || 'Total'}
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    {hoveredSlice
                      ? `${doughnutSegments.find((s) => s.name === hoveredSlice)?.percentage}%`
                      : formatCurrency(categoryData.totalExp, settings.defaultCurrency, true)}
                  </span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="flex-1 space-y-2 w-full text-xs">
                {doughnutSegments.map((item) => (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredSlice(item.name)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                      hoveredSlice === item.name ? 'bg-slate-100 dark:bg-slate-700/60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500">{item.percentage}%</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.amount, settings.defaultCurrency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Payment Method Distribution Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Payment Method Breakdown
            </h3>
            <p className="text-xs text-slate-500">Spending channels distribution</p>
          </div>

          <div className="space-y-3">
            {paymentMethodData.map((item) => (
              <div key={item.method} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {item.method}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500">{item.percentage}%</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount, settings.defaultCurrency)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Loans & Debts Position Card */}
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Outstanding Debt vs Receivables
            </h3>
            <p className="text-xs text-slate-500">Money lent vs borrowed balance</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Money Lent (Receivable)
              </span>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(loanStats.lent, settings.defaultCurrency)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Others owe you</p>
            </div>

            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40">
              <span className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                Money Borrowed (Payable)
              </span>
              <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(loanStats.borrowed, settings.defaultCurrency)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">You owe lenders</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Net Loan Position</span>
            <span
              className={`font-mono font-bold ${
                loanStats.net >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {loanStats.net >= 0 ? '+' : ''}
              {formatCurrency(loanStats.net, settings.defaultCurrency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
