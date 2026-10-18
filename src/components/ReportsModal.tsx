import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencies';
import { Printer, Download, X, Calendar, DollarSign, PieChart, TrendingUp, TrendingDown } from 'lucide-react';

export const ReportsModal: React.FC = () => {
  const {
    isReportModalOpen,
    setIsReportModalOpen,
    transactions,
    budgets,
    savingsGoals,
    loans,
    accounts,
    settings,
  } = useFinance();

  const [reportType, setReportType] = useState<'monthly' | 'category' | 'budget' | 'annual'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  if (!isReportModalOpen) return null;

  const currentYear = selectedMonth.slice(0, 4);

  // Filter transactions for report period
  const reportTransactions = transactions.filter((t) => {
    if (reportType === 'annual') {
      return t.date.startsWith(currentYear);
    }
    return t.date.startsWith(selectedMonth);
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryMap: Record<string, { group: string; amount: number; count: number }> = {};

  reportTransactions.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpenses += t.amount;
      const key = t.categoryName || 'Other';
      if (!categoryMap[key]) {
        categoryMap[key] = { group: t.categoryGroup || 'General', amount: 0, count: 0 };
      }
      categoryMap[key].amount += t.amount;
      categoryMap[key].count += 1;
    } else if (t.type === 'refund') {
      totalExpenses = Math.max(0, totalExpenses - t.amount);
    }
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, data]) => ({
      name,
      group: data.group,
      amount: data.amount,
      count: data.count,
      percent: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Financial Statement & Audit Report
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Controls Toolbar (hidden when printing) */}
        <div className="no-print p-4 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Report Cadence:</span>
            <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setReportType('monthly')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  reportType === 'monthly'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly Summary
              </button>
              <button
                onClick={() => setReportType('category')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  reportType === 'category'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Category Audit
              </button>
              <button
                onClick={() => setReportType('annual')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  reportType === 'annual'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Annual {currentYear}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-500 font-medium">Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 space-y-6 text-slate-900 dark:text-white print-page bg-white dark:bg-slate-900">
          {/* Header Block */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h1 className="text-xl font-bold tracking-tight">Smart Expense Tracker</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Official Financial Statement & Accounting Audit
              </p>
            </div>

            <div className="text-right text-xs text-slate-500">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{settings.userName}</p>
              <p>
                Period:{' '}
                {reportType === 'annual'
                  ? `Calendar Year ${currentYear}`
                  : new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
              </p>
              <p className="text-[10px]">Currency: {settings.defaultCurrency}</p>
            </div>
          </div>

          {/* Core Balance Strip */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 font-mono">
            <div>
              <span className="text-xs text-slate-500 font-sans">Total Recorded Income</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(totalIncome, settings.defaultCurrency)}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-sans">Total Recorded Expenses</span>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                -{formatCurrency(totalExpenses, settings.defaultCurrency)}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-sans">Net Surplus / Savings</span>
              <p
                className={`text-xl font-bold ${
                  totalIncome - totalExpenses >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {totalIncome - totalExpenses >= 0 ? '+' : ''}
                {formatCurrency(totalIncome - totalExpenses, settings.defaultCurrency)}
              </p>
            </div>
          </div>

          {/* Category-wise Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Expense Allocation by Category
            </h3>

            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No expense transactions logged for this reporting period.
              </p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="py-2">Category</th>
                    <th className="py-2">Group</th>
                    <th className="py-2 text-center">Tx Count</th>
                    <th className="py-2 text-right">Share</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categoryBreakdown.map((cat) => (
                    <tr key={cat.name} className="py-2">
                      <td className="py-2 font-medium">{cat.name}</td>
                      <td className="py-2 text-slate-500">{cat.group}</td>
                      <td className="py-2 text-center text-slate-500 font-mono">{cat.count}</td>
                      <td className="py-2 text-right text-slate-500 font-mono">{cat.percent}%</td>
                      <td className="py-2 text-right font-mono font-semibold">
                        {formatCurrency(cat.amount, settings.defaultCurrency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Accounts & Positions Snapshot */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Account Balances Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40">
                  <p className="text-slate-500 truncate">{acc.name}</p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(acc.currentBalance, acc.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
            Generated by Smart Expense Tracker on {new Date().toLocaleDateString()} at{' '}
            {new Date().toLocaleTimeString()} &bull; Private & Confidential Financial Report
          </div>
        </div>
      </div>
    </div>
  );
};
