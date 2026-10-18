import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DateFilterRange, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  Calendar,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    financialSummary,
    filteredTransactions,
    settings,
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    budgets,
    savingsGoals,
    bills,
    payBill,
    setIsAddModalOpen,
    setActiveTab,
    setEditingTransaction,
    categories,
    transactions,
  } = useFinance();

  const currentMonthLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate dynamic insights based strictly on user data
  const insights = useMemo(() => {
    const list: { text: string; type: 'info' | 'warning' | 'success' }[] = [];

    // 1. Budget insight
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const overallBudget = budgets.find((b) => !b.categoryId && b.month === currentMonthStr) || budgets.find((b) => !b.categoryId);
    if (overallBudget && overallBudget.limit > 0) {
      const utilPercent = Math.round((financialSummary.totalExpenses / overallBudget.limit) * 100);
      if (utilPercent > 100) {
        list.push({
          text: `You have exceeded your monthly budget by ${formatCurrency(financialSummary.totalExpenses - overallBudget.limit, settings.defaultCurrency)} (${utilPercent}% spent).`,
          type: 'warning',
        });
      } else if (utilPercent >= 80) {
        list.push({
          text: `You have utilized ${utilPercent}% of your monthly budget. Suggested daily allowance: ${formatCurrency(financialSummary.remainingBudget / 10, settings.defaultCurrency)}.`,
          type: 'warning',
        });
      } else {
        list.push({
          text: `You have used ${utilPercent}% of your monthly budget, remaining on track with ${formatCurrency(financialSummary.remainingBudget, settings.defaultCurrency)} available.`,
          type: 'success',
        });
      }
    }

    // 2. Savings rate insight
    if (financialSummary.totalIncome > 0) {
      const rate = financialSummary.savingsRate;
      if (rate > 20) {
        list.push({
          text: `Healthy savings rate: You are saving ${rate}% of your recorded income this period.`,
          type: 'success',
        });
      } else if (rate > 0) {
        list.push({
          text: `Current savings rate is ${rate}% of income. Aim for at least 20% to accelerate your financial goals.`,
          type: 'info',
        });
      }
    }

    // 3. Upcoming bills insight
    const pendingBills = bills.filter((b) => b.status === 'unpaid');
    if (pendingBills.length > 0) {
      const nextBill = pendingBills.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0];
      const daysUntil = Math.ceil(
        (new Date(nextBill.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );
      if (daysUntil <= 0) {
        list.push({
          text: `Overdue bill: "${nextBill.name}" (${formatCurrency(nextBill.amount, nextBill.currency)}) was due on ${nextBill.dueDate}.`,
          type: 'warning',
        });
      } else if (daysUntil <= 5) {
        list.push({
          text: `Upcoming bill: "${nextBill.name}" (${formatCurrency(nextBill.amount, nextBill.currency)}) is due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`,
          type: 'info',
        });
      }
    }

    // 4. Comparison to previous period for top category
    const currentMonthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      const now = new Date();
      return (
        t.type === 'expense' &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    });

    const prevMonthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        t.type === 'expense' &&
        d.getFullYear() === prev.getFullYear() &&
        d.getMonth() === prev.getMonth()
      );
    });

    if (currentMonthExpenses.length > 0 && prevMonthExpenses.length > 0) {
      const currTrans = currentMonthExpenses.filter((t) => t.categoryGroup === 'Transportation').reduce((s, t) => s + t.amount, 0);
      const prevTrans = prevMonthExpenses.filter((t) => t.categoryGroup === 'Transportation').reduce((s, t) => s + t.amount, 0);
      if (prevTrans > 0 && currTrans > prevTrans * 1.15) {
        list.push({
          text: `Transportation spending is ${Math.round(((currTrans - prevTrans) / prevTrans) * 100)}% higher than last month.`,
          type: 'info',
        });
      }
    }

    return list.slice(0, 3);
  }, [financialSummary, budgets, bills, settings, transactions]);

  // Spending by category breakdown for doughnut visualization
  const categorySpending = useMemo(() => {
    const map: Record<string, { name: string; amount: number; color: string }> = {};

    filteredTransactions
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

    return Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredTransactions, categories]);

  // Overall budget utilization
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const overallBudget = budgets.find((b) => !b.categoryId && b.month === currentMonthStr) || budgets.find((b) => !b.categoryId);
  const budgetLimit = overallBudget?.limit || 0;
  const budgetUsedPercent = budgetLimit > 0 ? Math.min(100, Math.round((financialSummary.totalExpenses / budgetLimit) * 100)) : 0;

  // Recent 6 transactions
  const recentTransactions = filteredTransactions.slice(0, 6);

  // Upcoming 3 bills
  const upcomingBills = bills
    .filter((b) => b.status === 'unpaid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Period Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {settings.userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Financial overview for <strong>{currentMonthLabel}</strong>
          </p>
        </div>

        {/* Date Filter Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {(
            [
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'last_3_months', label: '3 Months' },
              { id: 'this_year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom' },
            ] as { id: DateFilterRange; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setDateRange(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                dateRange === item.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers */}
      {dateRange === 'custom' && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium">Custom Range:</span>
          <div className="flex items-center gap-2">
            <label className="text-slate-600 dark:text-slate-400">From:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-600 dark:text-slate-400">To:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* Real Financial Insights Section */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                ins.type === 'warning'
                  ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                  : ins.type === 'success'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                  : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200'
              }`}
            >
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">{ins.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* 8 Primary Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Income */}
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(financialSummary.totalIncome, settings.defaultCurrency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Recorded inflows</p>
        </div>

        {/* Total Expenses */}
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            {formatCurrency(financialSummary.totalExpenses, settings.defaultCurrency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Direct spending</p>
        </div>

        {/* Net Available Balance */}
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Net Accounts</span>
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(financialSummary.netBalance, settings.defaultCurrency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Across all accounts</p>
        </div>

        {/* Total Savings */}
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Savings</span>
            <PiggyBank className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(financialSummary.totalSavings, settings.defaultCurrency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{savingsGoals.length} Active Goals</p>
        </div>

        {/* Remaining Monthly Budget */}
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Remaining Budget</span>
            <PieChart className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(financialSummary.remainingBudget, settings.defaultCurrency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {budgetLimit > 0 ? `${100 - budgetUsedPercent}% limit left` : 'No budget set'}
          </p>
        </div>

        {/* Money Lent */}
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Money Lent</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(financialSummary.moneyLent, settings.defaultCurrency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">To be collected</p>
        </div>

        {/* Money Borrowed */}
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Money Borrowed</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(financialSummary.moneyBorrowed, settings.defaultCurrency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Outstanding debt</p>
        </div>

        {/* Upcoming Bills */}
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Pending Bills</span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
            {formatCurrency(financialSummary.upcomingBillsTotal, settings.defaultCurrency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{upcomingBills.length} unpaid bills</p>
        </div>
      </div>

      {/* Main Charts & Visual Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spending Breakdown & Budget Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget Utilization Progress Card */}
          <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Monthly Budget Utilization
                </h3>
                <p className="text-xs text-slate-500">
                  {formatCurrency(financialSummary.totalExpenses, settings.defaultCurrency)} spent of{' '}
                  {formatCurrency(budgetLimit, settings.defaultCurrency)} budget
                </p>
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {budgetUsedPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  budgetUsedPercent > 100
                    ? 'bg-rose-500'
                    : budgetUsedPercent >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUsedPercent)}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Remaining: {formatCurrency(financialSummary.remainingBudget, settings.defaultCurrency)}</span>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Budgets</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Spending by Top Categories */}
          <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Top Spending Categories
                </h3>
                <p className="text-xs text-slate-500">Distribution for current filter</p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                Full Analytics &rarr;
              </button>
            </div>

            {categorySpending.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No expense transactions recorded in this date range.
              </div>
            ) : (
              <div className="space-y-3">
                {categorySpending.map((cat) => {
                  const percent =
                    financialSummary.totalExpenses > 0
                      ? Math.round((cat.amount / financialSummary.totalExpenses) * 100)
                      : 0;
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-500">{percent}%</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(cat.amount, settings.defaultCurrency)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions Table */}
          <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Recent Transactions
                </h3>
                <p className="text-xs text-slate-500">Latest entries in your ledger</p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                View All ({filteredTransactions.length}) &rarr;
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400 mb-3">No transactions found for this period.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  Record First Transaction
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentTransactions.map((tx) => {
                  const isInc = tx.type === 'income' || tx.type === 'refund';
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setEditingTransaction(tx)}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isInc
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : tx.type === 'transfer'
                              ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isInc ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : tx.type === 'transfer' ? (
                            <Wallet className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {tx.description}
                          </p>
                          {/* Zero-Pill metadata: unboxed with typographic separators */}
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                            <span>{tx.categoryName}</span>
                            <span aria-hidden="true">·</span>
                            <span>{tx.accountName}</span>
                            <span aria-hidden="true">·</span>
                            <span>{tx.date}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <p
                          className={`text-sm font-semibold font-mono tabular-nums ${
                            isInc
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : tx.type === 'transfer'
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isInc ? '+' : tx.type === 'transfer' ? '' : '-'}
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                        <span className="text-[10px] text-slate-400 capitalize">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Bills & Savings Goals Spotlight */}
        <div className="space-y-6">
          {/* Upcoming Bills Widget */}
          <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Upcoming Bills
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('bills')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                Manage &rarr;
              </button>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span>All bills are paid up to date!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((bill) => {
                  const daysDiff = Math.ceil(
                    (new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                  );
                  const isOverdue = daysDiff < 0;

                  return (
                    <div
                      key={bill.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {bill.name}
                        </p>
                        <p
                          className={`text-[11px] font-medium ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : daysDiff <= 3
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {isOverdue ? `Overdue by ${Math.abs(daysDiff)}d` : `Due in ${daysDiff}d (${bill.dueDate})`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                          {formatCurrency(bill.amount, bill.currency)}
                        </span>
                        <button
                          onClick={() => payBill(bill.id)}
                          title="Mark as paid & log expense"
                          className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer transition-colors"
                        >
                          Pay
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Savings Goals Spotlight */}
          <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Savings Goals
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('savings')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                View Goals &rarr;
              </button>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No savings goals created yet.
              </div>
            ) : (
              <div className="space-y-4">
                {savingsGoals.slice(0, 3).map((goal) => {
                  const progress = Math.min(
                    100,
                    Math.round((goal.currentAmount / goal.targetAmount) * 100)
                  );
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-900 dark:text-white truncate">
                          {goal.name}
                        </span>
                        <span className="font-mono text-slate-500">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>{formatCurrency(goal.currentAmount, goal.currency)}</span>
                        <span>{formatCurrency(goal.targetAmount, goal.currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
