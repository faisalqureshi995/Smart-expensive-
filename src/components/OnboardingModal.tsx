import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../utils/currencies';
import { Sparkles, Globe, DollarSign, Wallet, ArrowRight, Check, X } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { settings, updateSettings, accounts, updateAccount, addBudget } = useFinance();

  const [step, setStep] = useState(1);
  const [chosenCurrency, setChosenCurrency] = useState(settings.defaultCurrency);
  const [userName, setUserName] = useState(settings.userName);
  const [startingBalance, setStartingBalance] = useState('3000');
  const [initialMonthlyBudget, setInitialMonthlyBudget] = useState('2500');

  if (settings.hasCompletedOnboarding) return null;

  const handleFinish = () => {
    updateSettings({
      defaultCurrency: chosenCurrency,
      userName: userName.trim() || 'User',
      hasCompletedOnboarding: true,
    });

    if (accounts.length > 0) {
      const numBal = parseFloat(startingBalance);
      if (!isNaN(numBal)) {
        updateAccount(accounts[0].id, {
          openingBalance: numBal,
          currentBalance: numBal,
          currency: chosenCurrency,
        });
      }
    }

    const numBudget = parseFloat(initialMonthlyBudget);
    if (!isNaN(numBudget) && numBudget > 0) {
      addBudget({
        limit: numBudget,
        currency: chosenCurrency,
        period: 'monthly',
        month: new Date().toISOString().slice(0, 7),
        alertThresholdPercent: 80,
      });
    }
  };

  const handleSkip = () => {
    updateSettings({ hasCompletedOnboarding: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Progress dots & Skip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  step === s
                    ? 'bg-emerald-500 w-6'
                    : step > s
                    ? 'bg-emerald-300 dark:bg-emerald-700'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            Skip setup &rarr;
          </button>
        </div>

        {/* Step 1: Welcome & Currency */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome to Smart Expense Tracker
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Let's configure your profile and default currency in a few seconds.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Choose Your Primary Currency
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pt-1">
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setChosenCurrency(c.code)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                        chosenCurrency === c.code
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm">{c.flag}</span>
                      <span className="font-mono text-xs">{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Starting Account Balance */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Set Your Starting Balance
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your approximate cash & bank balance to begin tracking.
              </p>
            </div>

            <div className="pt-2 text-xs">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Total Available Balance ({chosenCurrency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-base font-semibold"
                  placeholder="3000"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                You can create separate cards, cash wallets, and savings accounts anytime.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                &larr; Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Monthly Budget */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Monthly Spending Budget
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Set a monthly spending limit to receive pacing alerts and stay in control.
              </p>
            </div>

            <div className="pt-2 text-xs">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Monthly Budget Limit ({chosenCurrency})
              </label>
              <input
                type="number"
                step="any"
                value={initialMonthlyBudget}
                onChange={(e) => setInitialMonthlyBudget(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-base font-semibold"
                placeholder="2500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                You can adjust this or add category-specific budgets later.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                &larr; Back
              </button>
              <button
                onClick={handleFinish}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
