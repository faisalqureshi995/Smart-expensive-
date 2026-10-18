import React, { useState, useRef, useEffect } from 'react';
import { useFinance, ActiveNavTab } from '../context/FinanceContext';
import { Plus, ChevronDown, Moon, Sun, FileSpreadsheet } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddModalOpen, setIsReportModalOpen, settings, updateSettings } = useFinance();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const moreTabs: { id: ActiveNavTab; label: string }[] = [
    { id: 'savings', label: 'Savings Goals' },
    { id: 'loans', label: 'Loans & Debts' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'bills', label: 'Bills & Reminders' },
    { id: 'settings', label: 'Settings' },
  ];

  const isMoreActive = moreTabs.some((t) => t.id === activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-90"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
          <span>Smart Expense Tracker</span>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'transactions'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'budgets'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Budgets
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'analytics'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Analytics
          </button>

          {/* More Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1 py-1 ${
                isMoreActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{isMoreActive ? moreTabs.find((t) => t.id === activeTab)?.label || 'More' : 'More'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                {moreTabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: 1 primary action group */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Report export shortcut */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            aria-label="Generate financial report"
            title="Generate Financial Report"
            className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
};
