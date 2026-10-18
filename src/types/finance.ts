export type TransactionType =
  | 'income'
  | 'expense'
  | 'savings_contribution'
  | 'transfer'
  | 'loan_given'
  | 'loan_received'
  | 'loan_repayment'
  | 'debt_payment'
  | 'refund';

export type PaymentMethod =
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Mobile Wallet'
  | 'Other';

export type AccountType =
  | 'cash'
  | 'bank'
  | 'mobile_wallet'
  | 'savings'
  | 'credit_card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  color?: string;
  icon?: string;
  institutionName?: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  group: string; // e.g. 'Food & Dining', 'Housing', 'Income', etc.
  iconName: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  keywords?: string[];
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  categoryGroup: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  accountId: string;
  accountName: string;
  toAccountId?: string; // For transfers
  toAccountName?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  receiptName?: string;
  relatedEntityId?: string; // For loan or bill links
  isAutoCategorized?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Budget {
  id: string;
  categoryId?: string; // null or undefined for overall monthly budget
  categoryName?: string;
  period: 'monthly' | 'weekly' | 'custom';
  limit: number;
  currency: string;
  month: string; // YYYY-MM
  rolloverUnused?: boolean;
  alertThresholdPercent?: number; // e.g. 80
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string; // YYYY-MM-DD
  description?: string;
  color?: string;
  iconName?: string;
  accountId?: string; // linked savings account if any
  isCompleted?: boolean;
  createdAt: string;
  contributions: {
    id: string;
    amount: number;
    date: string;
    note?: string;
    transactionId?: string;
  }[];
}

export type LoanDirection = 'lent' | 'borrowed'; // 'lent' = money given to someone; 'borrowed' = money received from someone
export type LoanStatus = 'active' | 'fully_paid' | 'overdue';

export interface LoanPayment {
  id: string;
  date: string;
  amount: number;
  principalAmount: number;
  interestAmount?: number;
  notes?: string;
  transactionId?: string;
}

export interface Loan {
  id: string;
  title: string;
  personOrInstitution: string;
  direction: LoanDirection;
  originalPrincipal: number;
  outstandingPrincipal: number;
  interestRate?: number; // percentage
  currency: string;
  dateIssued: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  status: LoanStatus;
  notes?: string;
  payments: LoanPayment[];
  createdAt: string;
}

export type BillRecurrence = 'once' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type BillStatus = 'unpaid' | 'paid' | 'overdue';

export interface Bill {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  currency: string;
  dueDate: string; // YYYY-MM-DD
  recurrence: BillRecurrence;
  accountId?: string;
  paymentMethod?: PaymentMethod;
  status: BillStatus;
  lastPaidDate?: string;
  reminderDaysBefore?: number;
  autoPay?: boolean;
  notes?: string;
}

export interface UserSettings {
  userName: string;
  defaultCurrency: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  budgetPeriodStartDay: number; // 1-28
  notificationsEnabled: boolean;
  categoryLearningEnabled: boolean;
  hasCompletedOnboarding: boolean;
}

export type DateFilterRange = 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all' | 'custom';
