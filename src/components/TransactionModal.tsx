import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, PaymentMethod } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import { X, Sparkles, Check, Upload, Tag, ArrowRightLeft, DollarSign } from 'lucide-react';

export const TransactionModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingTransaction,
    setEditingTransaction,
    accounts,
    categories,
    settings,
    addTransaction,
    updateTransaction,
    getCategorySuggestion,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Debit Card');
  const [notes, setNotes] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [receiptName, setReceiptName] = useState<string>('');

  const [suggestion, setSuggestion] = useState<ReturnType<typeof getCategorySuggestion>>(null);
  const [isAutoCategoryAccepted, setIsAutoCategoryAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Default account
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
      setAccountId(defaultAcc.id);
    }
  }, [accounts, accountId]);

  // Load editing transaction if provided
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || '12:00');
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || '');
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setTagsInput(editingTransaction.tags ? editingTransaction.tags.join(', ') : '');
      setReceiptUrl(editingTransaction.receiptUrl || '');
      setReceiptName(editingTransaction.receiptName || '');
    } else {
      // Reset form
      setType('expense');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      setNotes('');
      setTagsInput('');
      setReceiptUrl('');
      setReceiptName('');
      setSuggestion(null);
      setIsAutoCategoryAccepted(false);
      setErrorMsg('');
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [editingTransaction, isAddModalOpen]);

  // Auto-category suggestion on typing description
  useEffect(() => {
    if (!description.trim() || editingTransaction) {
      setSuggestion(null);
      return;
    }

    const match = getCategorySuggestion(description, type);
    if (match) {
      setSuggestion(match);
      // Auto apply if user hasn't manually selected yet
      if (!categoryId || !isAutoCategoryAccepted) {
        setCategoryId(match.category.id);
        setIsAutoCategoryAccepted(true);
      }
    } else {
      setSuggestion(null);
    }
  }, [description, type]);

  if (!isAddModalOpen && !editingTransaction) return null;

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptUrl(reader.result as string);
        setReceiptName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a description for the transaction.');
      return;
    }

    const selectedAccount = accounts.find((a) => a.id === accountId);
    if (!selectedAccount) {
      setErrorMsg('Please select a valid account.');
      return;
    }

    let finalCategory = categories.find((c) => c.id === categoryId);
    if (!finalCategory) {
      // Fallback category
      finalCategory = categories.find((c) => c.id === (type === 'income' ? 'inc_other' : 'other_misc')) || categories[0];
    }

    let targetAccountName: string | undefined = undefined;
    if (type === 'transfer' || type === 'savings_contribution') {
      if (!toAccountId || toAccountId === accountId) {
        setErrorMsg('Please select a different destination account.');
        return;
      }
      const toAcc = accounts.find((a) => a.id === toAccountId);
      targetAccountName = toAcc?.name;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      type,
      amount: numericAmount,
      currency: selectedAccount.currency || settings.defaultCurrency,
      categoryId: finalCategory.id,
      categoryName: finalCategory.name,
      categoryGroup: finalCategory.group,
      description: description.trim(),
      date,
      time,
      accountId,
      accountName: selectedAccount.name,
      toAccountId: toAccountId || undefined,
      toAccountName: targetAccountName,
      paymentMethod,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      receiptUrl: receiptUrl || undefined,
      receiptName: receiptName || undefined,
      isAutoCategorized: Boolean(suggestion && suggestion.category.id === finalCategory.id),
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    handleClose();
  };

  const typesList: { id: TransactionType; label: string }[] = [
    { id: 'expense', label: 'Expense' },
    { id: 'income', label: 'Income' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'savings_contribution', label: 'Savings' },
    { id: 'loan_given', label: 'Loan Given' },
    { id: 'loan_repayment', label: 'Loan Repay' },
    { id: 'debt_payment', label: 'Debt Payment' },
    { id: 'refund', label: 'Refund' },
  ];

  const filteredCategories = categories.filter((c) => {
    if (type === 'income') return c.type === 'income' || c.type === 'both';
    return c.type === 'expense' || c.type === 'both';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record financial activity with instant categorization
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50">
              {errorMsg}
            </div>
          )}

          {/* Transaction Type Segmented Bar */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              {typesList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setType(item.id);
                    setSuggestion(null);
                  }}
                  className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer truncate ${
                    type === item.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Amount ({settings.defaultCurrency}) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-base font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Account */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Account *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* To Account (only if transfer or savings) */}
          {(type === 'transfer' || type === 'savings_contribution') && (
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
              <label className="block text-xs font-medium text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Destination Account *</span>
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select destination...</option>
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Description with Auto-Suggest */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Description *
            </label>
            <input
              type="text"
              placeholder="e.g., Grocery stockup at Trader Joe, Shell Petrol, Electric Bill..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />

            {/* Smart categorization badge */}
            {suggestion && (
              <div className="mt-2 flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Auto-matched category: <strong>{suggestion.category.name}</strong> ({Math.round(suggestion.confidence * 100)}% match)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId(suggestion.category.id);
                    setIsAutoCategoryAccepted(true);
                  }}
                  className="px-2 py-0.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>Apply</span>
                </button>
              </div>
            )}
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setIsAutoCategoryAccepted(false);
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.group} &gt; {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Wallet">Mobile Wallet</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tags & Receipt (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. food, trip, tax-deductible"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Receipt Attachment (Optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 cursor-pointer text-center truncate">
                  <span>{receiptName ? receiptName : 'Upload receipt image...'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
                {receiptUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptUrl('');
                      setReceiptName('');
                    }}
                    className="p-2 text-rose-500 hover:text-rose-700 text-xs"
                    title="Remove receipt"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Additional memo or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {editingTransaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
