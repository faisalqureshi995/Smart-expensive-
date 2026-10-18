import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../utils/currencies';
import { exportFullDataAsJSON, exportTransactionsToCSV } from '../utils/storage';
import {
  Settings as SettingsIcon,
  Globe,
  Palette,
  Calendar,
  Layers,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Check,
  AlertCircle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    categories,
    addCustomCategory,
    deleteCustomCategory,
    resetDemoData,
    clearAllData,
    transactions,
  } = useFinance();

  const [currencySearch, setCurrencySearch] = useState('');
  const [userName, setUserName] = useState(settings.userName);
  const [saveStatus, setSaveStatus] = useState(false);

  // Custom Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState('Personal');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');

  // Confirmation modals
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ userName: userName.trim() });
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCustomCategory({
      name: newCatName.trim(),
      group: newCatGroup,
      iconName: 'Tag',
      color: newCatColor,
      type: newCatType,
    });

    setNewCatName('');
  };

  const handleExportJSON = () => {
    const jsonStr = exportFullDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_expense_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleExportCSV = () => {
    const csvStr = exportTransactionsToCSV(transactions);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            if (parsed.settings) localStorage.setItem('set_settings_v1', JSON.stringify(parsed.settings));
            if (parsed.accounts) localStorage.setItem('set_accounts_v1', JSON.stringify(parsed.accounts));
            if (parsed.transactions) localStorage.setItem('set_transactions_v1', JSON.stringify(parsed.transactions));
            if (parsed.budgets) localStorage.setItem('set_budgets_v1', JSON.stringify(parsed.budgets));
            if (parsed.savingsGoals) localStorage.setItem('set_savings_v1', JSON.stringify(parsed.savingsGoals));
            if (parsed.loans) localStorage.setItem('set_loans_v1', JSON.stringify(parsed.loans));
            if (parsed.bills) localStorage.setItem('set_bills_v1', JSON.stringify(parsed.bills));
            window.location.reload();
          }
        } catch (err) {
          alert('Invalid backup file. Please provide a valid JSON export.');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const customCats = categories.filter((c) => c.isCustom);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure currencies, regional formatting, visual themes, and data backups
        </p>
      </div>

      {/* Profile & Name Card */}
      <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Personal Information
        </h3>

        <form onSubmit={handleSaveProfile} className="flex flex-col sm:flex-row items-end gap-3 text-xs">
          <div className="flex-1 w-full">
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Your Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            {saveStatus ? <Check className="w-4 h-4" /> : null}
            <span>{saveStatus ? 'Saved!' : 'Update Name'}</span>
          </button>
        </form>
      </div>

      {/* Currency Selection Card */}
      <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Default Display Currency</span>
            </h3>
            <p className="text-xs text-slate-500">
              Active currency: <strong>{settings.defaultCurrency}</strong>
            </p>
          </div>

          <input
            type="text"
            placeholder="Search currency..."
            value={currencySearch}
            onChange={(e) => setCurrencySearch(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white w-full sm:w-48"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1 max-h-56 overflow-y-auto">
          {filteredCurrencies.map((c) => {
            const isSelected = settings.defaultCurrency.toUpperCase() === c.code.toUpperCase();
            return (
              <button
                key={c.code}
                onClick={() => updateSettings({ defaultCurrency: c.code })}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold font-mono">
                    {c.code} ({c.symbol})
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{c.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date & Theme Preferences Card */}
      <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>Regional & Appearance Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Visual Theme */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`p-2.5 rounded-xl border font-medium text-center cursor-pointer transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Light Mode
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`p-2.5 rounded-xl border font-medium text-center cursor-pointer transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Dark Mode
              </button>
            </div>
          </div>

          {/* Date Format */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 17/10/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/17/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Manager Card */}
      <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Category Customization</span>
        </h3>

        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="text"
            required
            placeholder="New Category Name..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />

          <select
            value={newCatGroup}
            onChange={(e) => setNewCatGroup(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="Food & Dining">Food & Dining</option>
            <option value="Housing">Housing</option>
            <option value="Transportation">Transportation</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Utilities & Bills">Utilities & Bills</option>
            <option value="Personal">Personal</option>
            <option value="Financial">Financial</option>
            <option value="Income">Income</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="expense">Expense Category</option>
            <option value="income">Income Category</option>
          </select>

          <button
            type="submit"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>

        {customCats.length > 0 && (
          <div className="pt-2 space-y-1">
            <span className="text-[11px] font-medium text-slate-500">Your Custom Categories:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {customCats.map((cat) => (
                <div
                  key={cat.id}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg text-xs flex items-center gap-2"
                >
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {cat.name} ({cat.group})
                  </span>
                  <button
                    onClick={() => deleteCustomCategory(cat.id)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Backup, Export & Reset Card */}
      <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Data Storage, Export & Privacy</span>
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          All financial data is stored securely in your private browser sandbox. You can download complete data backups, export transactions to CSV, or restore from a previously saved JSON snapshot.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Backup Everything (JSON)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Transactions (CSV)</span>
          </button>

          <label className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Restore Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>

        {/* Danger zone / demo resets */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Demo Data</span>
            </button>

            <button
              onClick={() => setConfirmWipe(true)}
              className="px-3 py-1.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe All Data (Fresh Start)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Reset Demo Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Reset Demo Data?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will reload sample transactions, accounts, budgets, and loans so you can explore the features again with fresh demo content.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setConfirmReset(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Wipe Modal */}
      {confirmWipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-5 h-5" />
              <span>Wipe All Records?</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action will permanently delete all transactions, budgets, goals, and debts, leaving a completely clean slate with zero balances.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmWipe(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setConfirmWipe(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Permanently Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
