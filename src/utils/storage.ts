import {
  Account,
  Bill,
  Budget,
  Category,
  Loan,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types/finance';
import { DEFAULT_CATEGORIES } from './categories';

const STORAGE_KEYS = {
  TRANSACTIONS: 'set_transactions_v1',
  ACCOUNTS: 'set_accounts_v1',
  BUDGETS: 'set_budgets_v1',
  SAVINGS: 'set_savings_v1',
  LOANS: 'set_loans_v1',
  BILLS: 'set_bills_v1',
  SETTINGS: 'set_settings_v1',
  CUSTOM_CATEGORIES: 'set_custom_categories_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Alex Morgan',
  defaultCurrency: 'USD',
  dateFormat: 'DD/MM/YYYY',
  theme: 'dark',
  timezone: 'UTC',
  budgetPeriodStartDay: 1,
  notificationsEnabled: true,
  categoryLearningEnabled: true,
  hasCompletedOnboarding: true,
};

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_checking',
    name: 'Primary Checking',
    type: 'bank',
    currency: 'USD',
    openingBalance: 4200,
    currentBalance: 4200,
    color: '#3b82f6',
    institutionName: 'Chase Bank',
    isDefault: true,
  },
  {
    id: 'acc_savings',
    name: 'High-Yield Savings',
    type: 'savings',
    currency: 'USD',
    openingBalance: 12500,
    currentBalance: 12500,
    color: '#10b981',
    institutionName: 'Marcus by Goldman',
  },
  {
    id: 'acc_credit',
    name: 'Sapphire Credit Card',
    type: 'credit_card',
    currency: 'USD',
    openingBalance: -450,
    currentBalance: -450,
    color: '#8b5cf6',
    institutionName: 'Chase Bank',
  },
  {
    id: 'acc_wallet',
    name: 'Cash Wallet',
    type: 'cash',
    currency: 'USD',
    openingBalance: 320,
    currentBalance: 320,
    color: '#f59e0b',
  },
  {
    id: 'acc_digital',
    name: 'Digital Wallet',
    type: 'mobile_wallet',
    currency: 'USD',
    openingBalance: 180,
    currentBalance: 180,
    color: '#06b6d4',
    institutionName: 'Apple Cash / PayPal',
  },
];

// Helper to get formatted date string for dynamic seed data relative to current date
function getRelativeDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const currentYearMonth = new Date().toISOString().slice(0, 7);

export const DEFAULT_BUDGETS: Budget[] = [
  {
    id: 'b_overall',
    period: 'monthly',
    limit: 3800,
    currency: 'USD',
    month: currentYearMonth,
    rolloverUnused: true,
    alertThresholdPercent: 80,
  },
  {
    id: 'b_food',
    categoryId: 'food_groceries',
    categoryName: 'Groceries',
    period: 'monthly',
    limit: 650,
    currency: 'USD',
    month: currentYearMonth,
    alertThresholdPercent: 85,
  },
  {
    id: 'b_dining',
    categoryId: 'food_restaurants',
    categoryName: 'Restaurants',
    period: 'monthly',
    limit: 400,
    currency: 'USD',
    month: currentYearMonth,
    alertThresholdPercent: 80,
  },
  {
    id: 'b_trans',
    categoryId: 'trans_fuel',
    categoryName: 'Fuel',
    period: 'monthly',
    limit: 220,
    currency: 'USD',
    month: currentYearMonth,
    alertThresholdPercent: 90,
  },
  {
    id: 'b_utilities',
    categoryId: 'util_electricity',
    categoryName: 'Electricity',
    period: 'monthly',
    limit: 180,
    currency: 'USD',
    month: currentYearMonth,
    alertThresholdPercent: 80,
  },
  {
    id: 'b_subs',
    categoryId: 'pers_subscriptions',
    categoryName: 'Subscriptions',
    period: 'monthly',
    limit: 90,
    currency: 'USD',
    month: currentYearMonth,
    alertThresholdPercent: 95,
  },
];

export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal_emergency',
    name: 'Emergency Fund (6 Months)',
    targetAmount: 18000,
    currentAmount: 12500,
    currency: 'USD',
    targetDate: '2026-12-31',
    description: 'Core financial safety net covering 6 months of living expenses.',
    color: '#10b981',
    accountId: 'acc_savings',
    createdAt: '2026-01-01',
    contributions: [
      { id: 'c1', amount: 500, date: getRelativeDateStr(12), note: 'Monthly auto-save' },
      { id: 'c2', amount: 300, date: getRelativeDateStr(42), note: 'Freelance bonus' },
    ],
  },
  {
    id: 'goal_travel',
    name: 'Japan Autumn Journey',
    targetAmount: 4500,
    currentAmount: 2800,
    currency: 'USD',
    targetDate: '2026-10-15',
    description: 'Flights, ryokan stays, rail pass, and dining in Kyoto and Tokyo.',
    color: '#3b82f6',
    createdAt: '2026-02-15',
    contributions: [
      { id: 'c3', amount: 400, date: getRelativeDateStr(8), note: 'Payday allocation' },
      { id: 'c4', amount: 400, date: getRelativeDateStr(38), note: 'Payday allocation' },
    ],
  },
  {
    id: 'goal_gadget',
    name: 'New Workstation Laptop',
    targetAmount: 2200,
    currentAmount: 1650,
    currency: 'USD',
    targetDate: '2026-11-30',
    description: 'High-performance laptop upgrade for engineering and freelance projects.',
    color: '#8b5cf6',
    createdAt: '2026-03-01',
    contributions: [
      { id: 'c5', amount: 250, date: getRelativeDateStr(5), note: 'Freelance deposit' },
    ],
  },
];

export const DEFAULT_LOANS: Loan[] = [
  {
    id: 'loan_lent_1',
    title: 'Camera Equipment Advance',
    personOrInstitution: 'David Chen',
    direction: 'lent',
    originalPrincipal: 1200,
    outstandingPrincipal: 450,
    interestRate: 0,
    currency: 'USD',
    dateIssued: getRelativeDateStr(45),
    dueDate: getRelativeDateStr(-20), // 20 days in future
    status: 'active',
    notes: 'Short term loan for professional lens purchase. Bi-weekly repayment.',
    payments: [
      { id: 'lp1', date: getRelativeDateStr(30), amount: 400, principalAmount: 400, notes: 'Installment 1' },
      { id: 'lp2', date: getRelativeDateStr(15), amount: 350, principalAmount: 350, notes: 'Installment 2' },
    ],
    createdAt: getRelativeDateStr(45),
  },
  {
    id: 'loan_borrowed_1',
    title: 'Studio Monitor Installment',
    personOrInstitution: 'TechMart Financing',
    direction: 'borrowed',
    originalPrincipal: 800,
    outstandingPrincipal: 200,
    interestRate: 0,
    currency: 'USD',
    dateIssued: getRelativeDateStr(60),
    dueDate: getRelativeDateStr(-10),
    status: 'active',
    notes: '0% APR promo financing for dual 4K monitors.',
    payments: [
      { id: 'lp3', date: getRelativeDateStr(40), amount: 300, principalAmount: 300, notes: 'Auto-debit' },
      { id: 'lp4', date: getRelativeDateStr(10), amount: 300, principalAmount: 300, notes: 'Auto-debit' },
    ],
    createdAt: getRelativeDateStr(60),
  },
];

export const DEFAULT_BILLS: Bill[] = [
  {
    id: 'bill_rent',
    name: 'Apartment Rent',
    categoryId: 'house_rent',
    categoryName: 'Rent',
    amount: 1450,
    currency: 'USD',
    dueDate: getRelativeDateStr(-14), // In 14 days
    recurrence: 'monthly',
    accountId: 'acc_checking',
    paymentMethod: 'Bank Transfer',
    status: 'unpaid',
    reminderDaysBefore: 3,
    autoPay: false,
    notes: 'Due on the 1st of every month via landlord portal',
  },
  {
    id: 'bill_electric',
    name: 'City Power & Electric',
    categoryId: 'util_electricity',
    categoryName: 'Electricity',
    amount: 128.4,
    currency: 'USD',
    dueDate: getRelativeDateStr(-3), // Due in 3 days!
    recurrence: 'monthly',
    accountId: 'acc_checking',
    paymentMethod: 'Debit Card',
    status: 'unpaid',
    reminderDaysBefore: 3,
    autoPay: true,
  },
  {
    id: 'bill_internet',
    name: 'Fiber Internet (1 Gbps)',
    categoryId: 'util_internet',
    categoryName: 'Internet',
    amount: 75.0,
    currency: 'USD',
    dueDate: getRelativeDateStr(-8), // In 8 days
    recurrence: 'monthly',
    accountId: 'acc_credit',
    paymentMethod: 'Credit Card',
    status: 'unpaid',
    reminderDaysBefore: 2,
  },
  {
    id: 'bill_cloud',
    name: 'Cloud Infrastructure & Tools',
    categoryId: 'pers_subscriptions',
    categoryName: 'Subscriptions',
    amount: 32.0,
    currency: 'USD',
    dueDate: getRelativeDateStr(4), // Paid 4 days ago
    recurrence: 'monthly',
    accountId: 'acc_credit',
    paymentMethod: 'Credit Card',
    status: 'paid',
    lastPaidDate: getRelativeDateStr(4),
  },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_salary_1',
    type: 'income',
    amount: 4850,
    currency: 'USD',
    categoryId: 'inc_salary',
    categoryName: 'Salary',
    categoryGroup: 'Income',
    description: 'Tech Systems Monthly Salary',
    date: getRelativeDateStr(2),
    time: '09:00',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Bank Transfer',
    tags: ['salary', 'direct-deposit'],
    notes: 'Direct payroll deposit for current cycle',
    createdAt: Date.now() - 2 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'tx_groceries_1',
    type: 'expense',
    amount: 142.6,
    currency: 'USD',
    categoryId: 'food_groceries',
    categoryName: 'Groceries',
    categoryGroup: 'Food & Dining',
    description: 'Whole Foods Market Weekly Stockup',
    date: getRelativeDateStr(1),
    time: '17:35',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Debit Card',
    tags: ['organic', 'pantry'],
    isAutoCategorized: true,
    createdAt: Date.now() - 1 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'tx_dining_1',
    type: 'expense',
    amount: 68.5,
    currency: 'USD',
    categoryId: 'food_restaurants',
    categoryName: 'Restaurants',
    categoryGroup: 'Food & Dining',
    description: 'Artisan Bistro Dinner with Team',
    date: getRelativeDateStr(2),
    time: '20:15',
    accountId: 'acc_credit',
    accountName: 'Sapphire Credit Card',
    paymentMethod: 'Credit Card',
    tags: ['dinner', 'team'],
    isAutoCategorized: true,
    createdAt: Date.now() - 2 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'tx_fuel_1',
    type: 'expense',
    amount: 52.4,
    currency: 'USD',
    categoryId: 'trans_fuel',
    categoryName: 'Fuel',
    categoryGroup: 'Transportation',
    description: 'Shell Gas Station Full Tank',
    date: getRelativeDateStr(3),
    time: '11:20',
    accountId: 'acc_credit',
    accountName: 'Sapphire Credit Card',
    paymentMethod: 'Credit Card',
    isAutoCategorized: true,
    tags: ['commute'],
    createdAt: Date.now() - 3 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'tx_freelance_1',
    type: 'income',
    amount: 950,
    currency: 'USD',
    categoryId: 'inc_freelance',
    categoryName: 'Freelance & Contract',
    categoryGroup: 'Income',
    description: 'UI Design System Milestone Payout',
    date: getRelativeDateStr(5),
    time: '14:00',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Bank Transfer',
    tags: ['client', 'design'],
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'tx_savings_1',
    type: 'savings_contribution',
    amount: 500,
    currency: 'USD',
    categoryId: 'food_groceries', // Category placeholder
    categoryName: 'Emergency Fund',
    categoryGroup: 'Savings',
    description: 'Contribution to Emergency Fund',
    date: getRelativeDateStr(5),
    time: '15:00',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    toAccountId: 'acc_savings',
    toAccountName: 'High-Yield Savings',
    paymentMethod: 'Bank Transfer',
    tags: ['savings-auto'],
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'tx_coffee_1',
    type: 'expense',
    amount: 9.75,
    currency: 'USD',
    categoryId: 'food_coffee',
    categoryName: 'Tea & Coffee',
    categoryGroup: 'Food & Dining',
    description: 'Starbucks Morning Oat Latte',
    date: getRelativeDateStr(4),
    time: '08:45',
    accountId: 'acc_digital',
    accountName: 'Digital Wallet',
    paymentMethod: 'Mobile Wallet',
    isAutoCategorized: true,
    createdAt: Date.now() - 4 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'tx_pharmacy_1',
    type: 'expense',
    amount: 34.2,
    currency: 'USD',
    categoryId: 'health_medicines',
    categoryName: 'Medicines',
    categoryGroup: 'Health',
    description: 'CVS Pharmacy Vitamins & Pain Relief',
    date: getRelativeDateStr(6),
    time: '16:10',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Debit Card',
    isAutoCategorized: true,
    createdAt: Date.now() - 6 * 86400000,
    updatedAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'tx_transfer_1',
    type: 'transfer',
    amount: 200,
    currency: 'USD',
    categoryId: 'other_misc',
    categoryName: 'Transfer',
    categoryGroup: 'Transfer',
    description: 'ATM Cash Withdrawal',
    date: getRelativeDateStr(7),
    time: '12:30',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    toAccountId: 'acc_wallet',
    toAccountName: 'Cash Wallet',
    paymentMethod: 'Cash',
    notes: 'Pocket cash for local vendors',
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'tx_sub_1',
    type: 'expense',
    amount: 19.99,
    currency: 'USD',
    categoryId: 'pers_subscriptions',
    categoryName: 'Subscriptions',
    categoryGroup: 'Personal',
    description: 'Netflix 4K Streaming Subscription',
    date: getRelativeDateStr(8),
    time: '03:00',
    accountId: 'acc_credit',
    accountName: 'Sapphire Credit Card',
    paymentMethod: 'Credit Card',
    isAutoCategorized: true,
    createdAt: Date.now() - 8 * 86400000,
    updatedAt: Date.now() - 8 * 86400000,
  },
  {
    id: 'tx_groceries_2',
    type: 'expense',
    amount: 112.4,
    currency: 'USD',
    categoryId: 'food_groceries',
    categoryName: 'Groceries',
    categoryGroup: 'Food & Dining',
    description: 'Trader Joe Produce & Supplies',
    date: getRelativeDateStr(10),
    time: '18:40',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Debit Card',
    isAutoCategorized: true,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'tx_fuel_2',
    type: 'expense',
    amount: 48.0,
    currency: 'USD',
    categoryId: 'trans_fuel',
    categoryName: 'Fuel',
    categoryGroup: 'Transportation',
    description: 'Chevron Petrol Station',
    date: getRelativeDateStr(14),
    time: '10:05',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Debit Card',
    isAutoCategorized: true,
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'tx_salary_prev',
    type: 'income',
    amount: 4850,
    currency: 'USD',
    categoryId: 'inc_salary',
    categoryName: 'Salary',
    categoryGroup: 'Income',
    description: 'Tech Systems Monthly Salary',
    date: getRelativeDateStr(32),
    time: '09:00',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Bank Transfer',
    tags: ['salary'],
    createdAt: Date.now() - 32 * 86400000,
    updatedAt: Date.now() - 32 * 86400000,
  },
  {
    id: 'tx_groceries_prev',
    type: 'expense',
    amount: 185.0,
    currency: 'USD',
    categoryId: 'food_groceries',
    categoryName: 'Groceries',
    categoryGroup: 'Food & Dining',
    description: 'Costco Wholesale Bulk Shopping',
    date: getRelativeDateStr(35),
    time: '14:20',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Debit Card',
    isAutoCategorized: true,
    createdAt: Date.now() - 35 * 86400000,
    updatedAt: Date.now() - 35 * 86400000,
  },
  {
    id: 'tx_rent_prev',
    type: 'expense',
    amount: 1450,
    currency: 'USD',
    categoryId: 'house_rent',
    categoryName: 'Rent',
    categoryGroup: 'Housing',
    description: 'Monthly Apartment Lease Payment',
    date: getRelativeDateStr(33),
    time: '10:00',
    accountId: 'acc_checking',
    accountName: 'Primary Checking',
    paymentMethod: 'Bank Transfer',
    tags: ['rent'],
    createdAt: Date.now() - 33 * 86400000,
    updatedAt: Date.now() - 33 * 86400000,
  },
];

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key "${key}":`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key "${key}":`, err);
  }
}

export function resetAllToDemo(): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
  localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(DEFAULT_SAVINGS_GOALS));
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(DEFAULT_LOANS));
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(DEFAULT_BILLS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
}

export function wipeAllUserData(): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  const cleanAccounts = DEFAULT_ACCOUNTS.map((acc) => ({ ...acc, currentBalance: 0, openingBalance: 0 }));
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(cleanAccounts));
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify([]));
}

export function exportFullDataAsJSON(): string {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    settings: loadStoredData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    accounts: loadStoredData(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS),
    categories: loadStoredData(STORAGE_KEYS.CUSTOM_CATEGORIES, []),
    transactions: loadStoredData(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS),
    budgets: loadStoredData(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS),
    savingsGoals: loadStoredData(STORAGE_KEYS.SAVINGS, DEFAULT_SAVINGS_GOALS),
    loans: loadStoredData(STORAGE_KEYS.LOANS, DEFAULT_LOANS),
    bills: loadStoredData(STORAGE_KEYS.BILLS, DEFAULT_BILLS),
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = [
    'Date',
    'Time',
    'Type',
    'Description',
    'Category',
    'Category Group',
    'Amount',
    'Currency',
    'Account',
    'Destination Account',
    'Payment Method',
    'Notes',
    'Tags',
  ];

  const rows = transactions.map((t) => [
    t.date,
    t.time || '',
    t.type,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.categoryName || '').replace(/"/g, '""')}"`,
    `"${(t.categoryGroup || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.currency,
    `"${(t.accountName || '').replace(/"/g, '""')}"`,
    `"${(t.toAccountName || '').replace(/"/g, '""')}"`,
    t.paymentMethod || '',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
    `"${(t.tags || []).join(';')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
