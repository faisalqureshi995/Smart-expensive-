import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { TransactionModal } from './components/TransactionModal';
import { ReportsModal } from './components/ReportsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SavingsView } from './components/SavingsView';
import { LoansView } from './components/LoansView';
import { AccountsView } from './components/AccountsView';
import { BillsView } from './components/BillsView';
import { SettingsView } from './components/SettingsView';

const AppContent: React.FC = () => {
  const { activeTab } = useFinance();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Bar following Top Bar Contract */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'budgets' && <BudgetsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'savings' && <SavingsView />}
        {activeTab === 'loans' && <LoansView />}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'bills' && <BillsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile Navigation bar */}
      <MobileNav />

      {/* Global Modals */}
      <TransactionModal />
      <ReportsModal />
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
