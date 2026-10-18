import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType, PaymentMethod } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import { exportTransactionsToCSV } from '../utils/storage';
import {
  Search,
  Plus,
  Download,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Copy,
  Edit2,
  Trash2,
  Paperclip,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    accounts,
    categories,
    settings,
    setIsAddModalOpen,
    setEditingTransaction,
    deleteTransaction,
    duplicateTransaction,
    setIsReportModalOpen,
  } = useFinance();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Deletion confirmation state
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Selected receipt preview modal
  const [previewReceipt, setPreviewReceipt] = useState<{ url: string; name?: string } | null>(null);

  // Filter & sort logic
  const filteredList = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchCat = tx.categoryName.toLowerCase().includes(q);
          const matchNotes = (tx.notes || '').toLowerCase().includes(q);
          const matchTags = (tx.tags || []).some((tag) => tag.toLowerCase().includes(q));
          if (!matchDesc && !matchCat && !matchNotes && !matchTags) return false;
        }

        // Type
        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        // Category
        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;

        // Account
        if (selectedAccount !== 'all') {
          if (tx.accountId !== selectedAccount && tx.toAccountId !== selectedAccount) return false;
        }

        // Payment Method
        if (selectedPaymentMethod !== 'all' && tx.paymentMethod !== selectedPaymentMethod) return false;

        // Date Range
        if (startDate && tx.date < startDate) return false;
        if (endDate && tx.date > endDate) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          return dateDiff !== 0 ? dateDiff : b.createdAt - a.createdAt;
        }
        if (sortBy === 'oldest') {
          const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
          return dateDiff !== 0 ? dateDiff : a.createdAt - b.createdAt;
        }
        if (sortBy === 'highest') {
          return b.amount - a.amount;
        }
        if (sortBy === 'lowest') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [
    transactions,
    searchTerm,
    selectedType,
    selectedCategory,
    selectedAccount,
    selectedPaymentMethod,
    startDate,
    endDate,
    sortBy,
  ]);

  const handleExportCSV = () => {
    const csvData = exportTransactionsToCSV(filteredList);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSelectedPaymentMethod('all');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedAccount !== 'all' ||
    selectedPaymentMethod !== 'all' ||
    startDate ||
    endDate;

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Transactions Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {filteredList.length} of {transactions.length} recorded entries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, tags, merchant or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Filter dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 pt-1 text-xs">
          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
              <option value="savings_contribution">Savings</option>
              <option value="loan_given">Loan Given</option>
              <option value="loan_repayment">Loan Repayment</option>
              <option value="debt_payment">Debt Payment</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method filter */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Payment Methods</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Wallet">Mobile Wallet</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center">
              <button
                onClick={clearAllFilters}
                className="w-full px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer text-center font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              No transactions match your search or filter criteria.
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Try adjusting your filters or record a new transaction.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
            >
              Add New Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredList.map((tx) => {
                  const isInc = tx.type === 'income' || tx.type === 'refund';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div>{tx.date}</div>
                        {tx.time && <div className="text-[10px] text-slate-400">{tx.time}</div>}
                      </td>

                      {/* Description & Tags */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{tx.description}</span>
                          {tx.receiptUrl && (
                            <button
                              onClick={() => setPreviewReceipt({ url: tx.receiptUrl!, name: tx.receiptName })}
                              title="View attached receipt"
                              className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {/* Notes or tags with zero-pill unboxed text */}
                        {((tx.tags && tx.tags.length > 0) || tx.notes) && (
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                            {tx.notes && <span>{tx.notes}</span>}
                            {tx.notes && tx.tags && tx.tags.length > 0 && <span aria-hidden="true">·</span>}
                            {tx.tags && tx.tags.map((t, idx) => (
                              <span key={idx} className="text-slate-500">#{t}</span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <div className="font-medium">{tx.categoryName}</div>
                        <div className="text-[10px] text-slate-400">{tx.categoryGroup}</div>
                      </td>

                      {/* Account */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <div>{tx.accountName}</div>
                        {tx.toAccountName && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span>&rarr; {tx.toAccountName}</span>
                          </div>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap capitalize">
                        {tx.paymentMethod}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono text-sm font-bold tabular-nums ${
                            isInc
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : tx.type === 'transfer'
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isInc ? '+' : tx.type === 'transfer' ? '' : '-'}
                          {formatCurrency(tx.amount, tx.currency)}
                        </span>
                        <div className="text-[10px] text-slate-400 capitalize">{tx.type.replace('_', ' ')}</div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingTransaction(tx)}
                            title="Edit transaction"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateTransaction(tx)}
                            title="Duplicate transaction"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTxId(tx.id)}
                            title="Delete transaction"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Delete Transaction?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action will permanently remove this transaction and automatically update the corresponding account balance.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingTxId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTransaction(deletingTxId);
                  setDeletingTxId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Receipt: {previewReceipt.name || 'Attachment'}
              </span>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 flex justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewReceipt.url}
                alt="Receipt proof"
                className="max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
