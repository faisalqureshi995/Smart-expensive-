import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  Bill,
  Budget,
  Category,
  DateFilterRange,
  Loan,
  SavingsGoal,
  Transaction,
  TransactionType,
  UserSettings,
} from '../types/finance';
import { DEFAULT_CATEGORIES, suggestCategory } from '../utils/categories';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BILLS,
  DEFAULT_BUDGETS,
  DEFAULT_LOANS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_SETTINGS,
  DEFAULT_TRANSACTIONS,
  loadStoredData,
  resetAllToDemo,
  saveStoredData,
  wipeAllUserData,
} from '../utils/storage';

export type ActiveNavTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'analytics'
  | 'savings'
  | 'loans'
  | 'accounts'
  | 'bills'
  | 'settings';

interface FinanceContextType {
  // Navigation & UI state
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;

  // Data collections
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  loans: Loan[];
  bills: Bill[];
  settings: UserSettings;

  // Filters
  dateRange: DateFilterRange;
  setDateRange: (r: DateFilterRange) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  selectedAccountId: string | 'all';
  setSelectedAccountId: (id: string | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (tx: Transaction) => void;

  // Account CRUD & Transfers
  addAccount: (account: Omit<Account, 'id' | 'currentBalance'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => void;

  // Budgets CRUD
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Savings Goals CRUD
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => void;
  updateSavingsGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToSavings: (goalId: string, amount: number, accountId?: string, note?: string) => void;
  withdrawFromSavings: (goalId: string, amount: number, accountId?: string, note?: string) => void;

  // Loans CRUD
  addLoan: (loan: Omit<Loan, 'id' | 'payments' | 'createdAt'>) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  recordLoanPayment: (loanId: string, amount: number, accountId: string, notes?: string) => void;

  // Bills CRUD
  addBill: (b: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, b: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  payBill: (billId: string, accountId?: string) => void;

  // Settings & Custom categories
  updateSettings: (updates: Partial<UserSettings>) => void;
  addCustomCategory: (cat: Omit<Category, 'id' | 'isCustom'>) => void;
  deleteCustomCategory: (id: string) => void;
  resetDemoData: () => void;
  clearAllData: () => void;

  // Categorization assistant
  getCategorySuggestion: (description: string, type: TransactionType) => ReturnType<typeof suggestCategory>;

  // Calculated properties
  filteredTransactions: Transaction[];
  financialSummary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    totalSavings: number;
    remainingBudget: number;
    moneyLent: number;
    moneyBorrowed: number;
    upcomingBillsTotal: number;
    savingsRate: number;
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Stored state
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadStoredData('set_settings_v1', DEFAULT_SETTINGS)
  );
  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadStoredData('set_accounts_v1', DEFAULT_ACCOUNTS)
  );
  const [customCategories, setCustomCategories] = useState<Category[]>(() =>
    loadStoredData('set_custom_categories_v1', [])
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadStoredData('set_transactions_v1', DEFAULT_TRANSACTIONS)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadStoredData('set_budgets_v1', DEFAULT_BUDGETS)
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() =>
    loadStoredData('set_savings_v1', DEFAULT_SAVINGS_GOALS)
  );
  const [loans, setLoans] = useState<Loan[]>(() =>
    loadStoredData('set_loans_v1', DEFAULT_LOANS)
  );
  const [bills, setBills] = useState<Bill[]>(() =>
    loadStoredData('set_bills_v1', DEFAULT_BILLS)
  );

  // Filters
  const [dateRange, setDateRange] = useState<DateFilterRange>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist changes
  useEffect(() => {
    saveStoredData('set_settings_v1', settings);
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    saveStoredData('set_accounts_v1', accounts);
  }, [accounts]);

  useEffect(() => {
    saveStoredData('set_custom_categories_v1', customCategories);
  }, [customCategories]);

  useEffect(() => {
    saveStoredData('set_transactions_v1', transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredData('set_budgets_v1', budgets);
  }, [budgets]);

  useEffect(() => {
    saveStoredData('set_savings_v1', savingsGoals);
  }, [savingsGoals]);

  useEffect(() => {
    saveStoredData('set_loans_v1', loans);
  }, [loans]);

  useEffect(() => {
    saveStoredData('set_bills_v1', bills);
  }, [bills]);

  // Combine default and custom categories
  const categories = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  // Date filtering logic
  const isDateInFilter = (dateStr: string): boolean => {
    if (dateRange === 'all') return true;

    const targetDate = new Date(dateStr + 'T00:00:00');
    const now = new Date();

    if (dateRange === 'this_month') {
      return (
        targetDate.getFullYear() === now.getFullYear() &&
        targetDate.getMonth() === now.getMonth()
      );
    }
    if (dateRange === 'last_month') {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        targetDate.getFullYear() === prevMonth.getFullYear() &&
        targetDate.getMonth() === prevMonth.getMonth()
      );
    }
    if (dateRange === 'last_3_months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return targetDate >= threeMonthsAgo && targetDate <= now;
    }
    if (dateRange === 'this_year') {
      return targetDate.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'custom') {
      if (customStartDate && targetDate < new Date(customStartDate + 'T00:00:00')) return false;
      if (customEndDate && targetDate > new Date(customEndDate + 'T23:59:59')) return false;
      return true;
    }
    return true;
  };

  // Filtered transactions for active view
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Date filter
      if (!isDateInFilter(tx.date)) return false;

      // Account filter
      if (selectedAccountId !== 'all') {
        if (tx.accountId !== selectedAccountId && tx.toAccountId !== selectedAccountId) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const catMatch = (tx.categoryName || '').toLowerCase().includes(q);
        const noteMatch = (tx.notes || '').toLowerCase().includes(q);
        const tagMatch = (tx.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!descMatch && !catMatch && !noteMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [transactions, dateRange, customStartDate, customEndDate, selectedAccountId, searchQuery]);

  // Financial calculations
  const financialSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpenses += tx.amount;
      } else if (tx.type === 'refund') {
        // Refund offsets expenses
        totalExpenses = Math.max(0, totalExpenses - tx.amount);
      }
    });

    const netBalance = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
    const totalSavings = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);

    // Current month budget calculations
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const overallBudget = budgets.find((b) => !b.categoryId && b.month === currentMonthStr) || budgets.find((b) => !b.categoryId);
    const budgetLimit = overallBudget ? overallBudget.limit : 0;
    const remainingBudget = Math.max(0, budgetLimit - totalExpenses);

    // Money lent vs borrowed
    const moneyLent = loans
      .filter((l) => l.direction === 'lent' && l.status !== 'fully_paid')
      .reduce((acc, l) => acc + l.outstandingPrincipal, 0);

    const moneyBorrowed = loans
      .filter((l) => l.direction === 'borrowed' && l.status !== 'fully_paid')
      .reduce((acc, l) => acc + l.outstandingPrincipal, 0);

    // Upcoming unpaid bills
    const upcomingBillsTotal = bills
      .filter((b) => b.status === 'unpaid')
      .reduce((acc, b) => acc + b.amount, 0);

    // Savings rate
    const savingsRate = totalIncome > 0 ? Math.round((Math.max(0, totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      totalSavings,
      remainingBudget,
      moneyLent,
      moneyBorrowed,
      upcomingBillsTotal,
      savingsRate,
    };
  }, [filteredTransactions, accounts, savingsGoals, budgets, loans, bills]);

  // Recompute account balance given a transaction delta
  const adjustAccountBalance = (
    tx: Pick<Transaction, 'type' | 'amount' | 'accountId' | 'toAccountId'>,
    isReversal = false
  ) => {
    const factor = isReversal ? -1 : 1;
    setAccounts((prev) =>
      prev.map((acc) => {
        let newBalance = acc.currentBalance;

        if (acc.id === tx.accountId) {
          switch (tx.type) {
            case 'income':
            case 'loan_received':
            case 'debt_payment':
            case 'refund':
              newBalance += tx.amount * factor;
              break;
            case 'expense':
            case 'transfer':
            case 'savings_contribution':
            case 'loan_given':
            case 'loan_repayment':
              newBalance -= tx.amount * factor;
              break;
          }
        }

        // Destination account for transfers or savings
        if (tx.toAccountId && acc.id === tx.toAccountId) {
          if (tx.type === 'transfer' || tx.type === 'savings_contribution') {
            newBalance += tx.amount * factor;
          }
        }

        return { ...acc, currentBalance: Number(newBalance.toFixed(2)) };
      })
    );
  };

  // Transaction CRUD handlers
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    adjustAccountBalance(newTx, false);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (!existing) return prev;

      // Revert old balance impact
      adjustAccountBalance(existing, true);

      const updated: Transaction = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };

      // Apply new balance impact
      adjustAccountBalance(updated, false);

      return prev.map((t) => (t.id === id ? updated : t));
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (existing) {
        adjustAccountBalance(existing, true);
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const duplicateTransaction = (tx: Transaction) => {
    const { id, createdAt, updatedAt, ...rest } = tx;
    addTransaction({
      ...rest,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      description: `${tx.description} (Copy)`,
    });
  };

  // Accounts CRUD
  const addAccount = (accData: Omit<Account, 'id' | 'currentBalance'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      currentBalance: accData.openingBalance,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const transferFunds = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!fromAcc || !toAcc || amount <= 0) return;

    addTransaction({
      type: 'transfer',
      amount,
      currency: fromAcc.currency,
      categoryId: 'other_misc',
      categoryName: 'Internal Transfer',
      categoryGroup: 'Transfer',
      description: `Transfer from ${fromAcc.name} to ${toAcc.name}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      accountId: fromAccountId,
      accountName: fromAcc.name,
      toAccountId: toAccountId,
      toAccountName: toAcc.name,
      paymentMethod: 'Bank Transfer',
      notes,
    });
  };

  // Budgets CRUD
  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newB: Budget = {
      ...b,
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setBudgets((prev) => [...prev, newB]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Savings Goals CRUD
  const addSavingsGoal = (g: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => {
    const newG: SavingsGoal = {
      ...g,
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      contributions: [],
    };
    setSavingsGoals((prev) => [...prev, newG]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const contributeToSavings = (
    goalId: string,
    amount: number,
    accountId?: string,
    note?: string
  ) => {
    if (amount <= 0) return;
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const newContribId = `contrib_${Date.now()}`;
    const newSaved = Number((goal.currentAmount + amount).toFixed(2));
    const isCompleted = newSaved >= goal.targetAmount;

    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: newSaved,
              isCompleted: isCompleted ? true : g.isCompleted,
              contributions: [
                {
                  id: newContribId,
                  amount,
                  date: new Date().toISOString().split('T')[0],
                  note,
                },
                ...g.contributions,
              ],
            }
          : g
      )
    );

    // If source account selected, log a savings contribution transaction that adjusts balance without treating it as an expense
    if (accountId) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc) {
        addTransaction({
          type: 'savings_contribution',
          amount,
          currency: goal.currency,
          categoryId: 'other_misc',
          categoryName: goal.name,
          categoryGroup: 'Savings',
          description: `Contribution to ${goal.name}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          accountId,
          accountName: acc.name,
          toAccountId: goal.accountId,
          toAccountName: goal.name,
          paymentMethod: 'Bank Transfer',
          notes: note,
          relatedEntityId: goalId,
        });
      }
    }
  };

  const withdrawFromSavings = (
    goalId: string,
    amount: number,
    accountId?: string,
    note?: string
  ) => {
    if (amount <= 0) return;
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const newSaved = Math.max(0, Number((goal.currentAmount - amount).toFixed(2)));

    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: newSaved,
              isCompleted: newSaved >= goal.targetAmount,
              contributions: [
                {
                  id: `with_${Date.now()}`,
                  amount: -amount,
                  date: new Date().toISOString().split('T')[0],
                  note: `Withdrawal: ${note || ''}`,
                },
                ...g.contributions,
              ],
            }
          : g
      )
    );

    if (accountId) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc) {
        addTransaction({
          type: 'income',
          amount,
          currency: goal.currency,
          categoryId: 'inc_other',
          categoryName: 'Savings Withdrawal',
          categoryGroup: 'Income',
          description: `Withdrawal from ${goal.name}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          accountId,
          accountName: acc.name,
          paymentMethod: 'Bank Transfer',
          notes: note,
          relatedEntityId: goalId,
        });
      }
    }
  };

  // Loans CRUD
  const addLoan = (loanData: Omit<Loan, 'id' | 'payments' | 'createdAt'>) => {
    const newL: Loan = {
      ...loanData,
      id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      payments: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLoans((prev) => [...prev, newL]);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  const recordLoanPayment = (
    loanId: string,
    amount: number,
    accountId: string,
    notes?: string
  ) => {
    const loan = loans.find((l) => l.id === loanId);
    const acc = accounts.find((a) => a.id === accountId);
    if (!loan || !acc || amount <= 0) return;

    const newOutstanding = Math.max(0, Number((loan.outstandingPrincipal - amount).toFixed(2)));
    const newStatus = newOutstanding <= 0 ? 'fully_paid' : loan.status;

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              outstandingPrincipal: newOutstanding,
              status: newStatus,
              payments: [
                {
                  id: `lp_${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  amount,
                  principalAmount: amount,
                  notes,
                },
                ...l.payments,
              ],
            }
          : l
      )
    );

    // Record linked accounting transaction:
    // If loan was borrowed: repaying it is a 'loan_repayment'
    // If loan was lent: receiving payment is a 'debt_payment'
    const txType: TransactionType = loan.direction === 'borrowed' ? 'loan_repayment' : 'debt_payment';

    addTransaction({
      type: txType,
      amount,
      currency: loan.currency,
      categoryId: 'fin_loan_repayments',
      categoryName: loan.direction === 'borrowed' ? 'Loan Repayment' : 'Debt Received',
      categoryGroup: 'Financial',
      description: `${loan.direction === 'borrowed' ? 'Repayment to' : 'Payment received from'} ${loan.personOrInstitution} (${loan.title})`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      accountId,
      accountName: acc.name,
      paymentMethod: 'Bank Transfer',
      notes,
      relatedEntityId: loanId,
    });
  };

  // Bills CRUD
  const addBill = (bData: Omit<Bill, 'id'>) => {
    const newB: Bill = {
      ...bData,
      id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setBills((prev) => [...prev, newB]);
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const payBill = (billId: string, accountId?: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    const targetAccId = accountId || bill.accountId || accounts[0]?.id;
    const targetAcc = accounts.find((a) => a.id === targetAccId);

    // Update bill status
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              status: 'paid',
              lastPaidDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );

    // Create corresponding expense transaction
    if (targetAcc) {
      addTransaction({
        type: 'expense',
        amount: bill.amount,
        currency: bill.currency,
        categoryId: bill.categoryId,
        categoryName: bill.categoryName,
        categoryGroup: 'Utilities & Bills',
        description: `Bill Payment: ${bill.name}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        paymentMethod: bill.paymentMethod || 'Debit Card',
        notes: `Paid ${bill.name} for due date ${bill.dueDate}`,
        relatedEntityId: billId,
      });
    }
  };

  // Settings & Custom categories
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const addCustomCategory = (catData: Omit<Category, 'id' | 'isCustom'>) => {
    const newCat: Category = {
      ...catData,
      id: `custom_cat_${Date.now()}`,
      isCustom: true,
    };
    setCustomCategories((prev) => [...prev, newCat]);
  };

  const deleteCustomCategory = (id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const resetDemoData = () => {
    resetAllToDemo();
    setSettings(DEFAULT_SETTINGS);
    setAccounts(DEFAULT_ACCOUNTS);
    setCustomCategories([]);
    setTransactions(DEFAULT_TRANSACTIONS);
    setBudgets(DEFAULT_BUDGETS);
    setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    setLoans(DEFAULT_LOANS);
    setBills(DEFAULT_BILLS);
  };

  const clearAllData = () => {
    wipeAllUserData();
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setLoans([]);
    setBills([]);
    setAccounts((prev) => prev.map((a) => ({ ...a, currentBalance: 0, openingBalance: 0 })));
  };

  // Category suggestion helper
  const getCategorySuggestion = (desc: string, type: TransactionType) => {
    return suggestCategory(desc, type, categories, transactions);
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        editingTransaction,
        setEditingTransaction,
        isReportModalOpen,
        setIsReportModalOpen,
        transactions,
        accounts,
        categories,
        budgets,
        savingsGoals,
        loans,
        bills,
        settings,
        dateRange,
        setDateRange,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        selectedAccountId,
        setSelectedAccountId,
        searchQuery,
        setSearchQuery,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToSavings,
        withdrawFromSavings,
        addLoan,
        updateLoan,
        deleteLoan,
        recordLoanPayment,
        addBill,
        updateBill,
        deleteBill,
        payBill,
        updateSettings,
        addCustomCategory,
        deleteCustomCategory,
        resetDemoData,
        clearAllData,
        getCategorySuggestion,
        filteredTransactions,
        financialSummary,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
