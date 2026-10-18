import React, { useState } from 'react';
import { useFinance, ActiveNavTab } from '../context/FinanceContext';
import { LayoutDashboard, ReceiptText, PieChart, BarChart3, MoreHorizontal, Target, Landmark, Wallet, Bell, Settings, X, Plus } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddModalOpen } = useFinance();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const mainTabs: { id: ActiveNavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const moreTabs: { id: ActiveNavTab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'savings', label: 'Savings Goals', icon: Target, desc: 'Track emergency funds & targets' },
    { id: 'loans', label: 'Loans & Debts', icon: Landmark, desc: 'Money lent & borrowed records' },
    { id: 'accounts', label: 'Accounts', icon: Wallet, desc: 'Wallets, cards & bank accounts' },
    { id: 'bills', label: 'Bills & Reminders', icon: Bell, desc: 'Recurring expenses & utilities' },
    { id: 'settings', label: 'Settings', icon: Settings, desc: 'Currency, preferences & export' },
  ];

  return (
    <>
      {/* Floating Action Button for mobile */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        aria-label="Add transaction"
        className="md:hidden fixed right-4 bottom-20 z-40 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white shadow-lg flex items-center justify-center cursor-pointer transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-16 pb-safe">
        <div className="grid grid-cols-5 items-center h-full max-w-md mx-auto px-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMoreSheetOpen(false);
                }}
                className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate">{tab.label}</span>
              </button>
            );
          })}

          {/* More trigger */}
          <button
            onClick={() => setIsMoreSheetOpen(true)}
            className={`min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              moreTabs.some((t) => t.id === activeTab)
                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] mt-0.5 tracking-tight truncate">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Sheet */}
      {isMoreSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreSheetOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
            {/* Grab handle */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Additional Sections</h3>
              <button
                onClick={() => setIsMoreSheetOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMoreSheetOpen(false);
                    }}
                    className={`min-h-[48px] w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tab.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
