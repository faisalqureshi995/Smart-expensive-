import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Budget } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle2, Calendar, Sparkles, X } from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    categories,
    transactions,
    settings,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form state
  const [isOverall, setIsOverall] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'custom'>('monthly');
  const [rollover, setRollover] = useState(false);
  const [threshold, setThreshold] = useState('80');

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());

  const openCreateModal = () => {
    setEditingBudget(null);
    setIsOverall(false);
    setCategoryId(categories.filter((c) => c.type === 'expense')[0]?.id || '');
    setLimit('');
    setPeriod('monthly');
    setRollover(false);
    setThreshold('80');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setIsOverall(!b.categoryId);
    setCategoryId(b.categoryId || '');
    setLimit(b.limit.toString());
    setPeriod(b.period);
    setRollover(Boolean(b.rolloverUnused));
    setThreshold((b.alertThresholdPercent || 80).toString());
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) return;

    const selectedCat = categories.find((c) => c.id === categoryId);

    const payload = {
      categoryId: isOverall ? undefined : categoryId,
      categoryName: isOverall ? undefined : selectedCat?.name || 'Category',
      limit: numLimit,
      period,
      currency: settings.defaultCurrency,
      month: currentYearMonth,
      rolloverUnused: rollover,
      alertThresholdPercent: parseInt(threshold) || 80,
    };

    if (editingBudget) {
      updateBudget(editingBudget.id, payload);
    } else {
      addBudget(payload);
    }

    setIsModalOpen(false);
  };

  // Calculate actual spending for each budget
  const calculateBudgetProgress = (b: Budget) => {
    const expenses = transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        // Month match
        const txMonth = t.date.slice(0, 7);
        if (txMonth !== currentYearMonth) return false;
        // Category match
        if (b.categoryId && t.categoryId !== b.categoryId) return false;
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = Math.max(0, b.limit - expenses);
    const utilization = b.limit > 0 ? Math.round((expenses / b.limit) * 100) : 0;
    const dailyAllowance = Math.max(0, Number((remaining / daysRemaining).toFixed(2)));

    return {
      spent: expenses,
      remaining,
      utilization,
      dailyAllowance,
      isExceeded: expenses > b.limit,
      isNearLimit: utilization >= (b.alertThresholdPercent || 80) && expenses <= b.limit,
    };
  };

  const overallBudget = budgets.find((b) => !b.categoryId);
  const categoryBudgets = budgets.filter((b) => Boolean(b.categoryId));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Budgets & Spending Limits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining in this monthly budget cycle
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Budget</span>
        </button>
      </div>

      {/* Overall Monthly Master Budget Card */}
      {overallBudget ? (
        (() => {
          const prog = calculateBudgetProgress(overallBudget);
          return (
            <div className="p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Overall Monthly Spending Limit
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Covers all eligible monthly recorded expenses
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(overallBudget)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBudget(overallBudget.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-slate-100 dark:border-slate-700/50 mb-4">
                <div>
                  <span className="text-xs text-slate-500">Budget Limit</span>
                  <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    {formatCurrency(overallBudget.limit, overallBudget.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Actual Spent</span>
                  <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                    {formatCurrency(prog.spent, overallBudget.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Remaining</span>
                  <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(prog.remaining, overallBudget.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Suggested Daily Limit</span>
                  <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                    {formatCurrency(prog.dailyAllowance, overallBudget.currency)}/day
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {prog.utilization}% utilized
                  </span>
                  {prog.isExceeded ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Budget exceeded by {formatCurrency(prog.spent - overallBudget.limit, overallBudget.currency)}
                    </span>
                  ) : prog.isNearLimit ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Approaching threshold limit
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Within safe spending limit
                    </span>
                  )}
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      prog.isExceeded
                        ? 'bg-rose-500'
                        : prog.isNearLimit
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, prog.utilization)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No Master Monthly Budget Configured
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Set a monthly cap to receive spending alerts and daily spending allowance suggestions.
          </p>
          <button
            onClick={() => {
              openCreateModal();
              setIsOverall(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            Create Master Monthly Budget
          </button>
        </div>
      )}

      {/* Category Specific Budgets */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Category Budgets ({categoryBudgets.length})
        </h3>

        {categoryBudgets.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center text-xs text-slate-400">
            No category-specific budgets configured yet. Click "Set New Budget" to set limits for Groceries, Fuel, Dining, etc.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => {
              const prog = calculateBudgetProgress(b);
              return (
                <div
                  key={b.id}
                  className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {b.categoryName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Daily target: {formatCurrency(prog.dailyAllowance, b.currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-500">
                      Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(prog.spent, b.currency)}</strong>
                    </span>
                    <span className="text-slate-500">
                      Limit: {formatCurrency(b.limit, b.currency)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        prog.isExceeded
                          ? 'bg-rose-500'
                          : prog.isNearLimit
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, prog.utilization)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-500">{prog.utilization}% used</span>
                    <span
                      className={`font-medium ${
                        prog.isExceeded
                          ? 'text-rose-600 dark:text-rose-400'
                          : prog.isNearLimit
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {prog.isExceeded
                        ? `Over by ${formatCurrency(prog.spent - b.limit, b.currency)}`
                        : `${formatCurrency(prog.remaining, b.currency)} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {editingBudget ? 'Edit Budget' : 'Set New Spending Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Type Switch: Overall vs Category */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Budget Scope
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setIsOverall(false)}
                    className={`py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                      !isOverall ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
                    }`}
                  >
                    Specific Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOverall(true)}
                    className={`py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                      isOverall ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500'
                    }`}
                  >
                    Master Total Budget
                  </button>
                </div>
              </div>

              {!isOverall && (
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {categories
                      .filter((c) => c.type === 'expense' || c.type === 'both')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.group} &gt; {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Budget Limit Amount ({settings.defaultCurrency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 500"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom Period</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Alert Warning Threshold
                  </label>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="70">70% of limit</option>
                    <option value="80">80% of limit</option>
                    <option value="90">90% of limit</option>
                    <option value="95">95% of limit</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rollover"
                  checked={rollover}
                  onChange={(e) => setRollover(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="rollover" className="text-slate-600 dark:text-slate-400">
                  Rollover unused budget to next cycle
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
