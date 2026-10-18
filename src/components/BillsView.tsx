import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Bill, BillRecurrence, PaymentMethod } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import {
  Bell,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  X,
  CreditCard,
} from 'lucide-react';

export const BillsView: React.FC = () => {
  const {
    bills,
    categories,
    accounts,
    settings,
    addBill,
    updateBill,
    deleteBill,
    payBill,
  } = useFinance();

  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Pay modal state
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [payAccountId, setPayAccountId] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<BillRecurrence>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Debit Card');
  const [accountId, setAccountId] = useState('');
  const [reminderDays, setReminderDays] = useState('3');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingBill(null);
    setName('');
    const utilCat = categories.find((c) => c.group === 'Utilities & Bills') || categories[0];
    setCategoryId(utilCat.id);
    setAmount('');
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setRecurrence('monthly');
    setPaymentMethod('Debit Card');
    setAccountId(accounts[0]?.id || '');
    setReminderDays('3');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Bill) => {
    setEditingBill(b);
    setName(b.name);
    setCategoryId(b.categoryId);
    setAmount(b.amount.toString());
    setDueDate(b.dueDate);
    setRecurrence(b.recurrence);
    setPaymentMethod(b.paymentMethod || 'Debit Card');
    setAccountId(b.accountId || accounts[0]?.id || '');
    setReminderDays((b.reminderDaysBefore || 3).toString());
    setNotes(b.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    const cat = categories.find((c) => c.id === categoryId) || categories[0];

    const payload = {
      name: name.trim(),
      categoryId: cat.id,
      categoryName: cat.name,
      amount: num,
      currency: settings.defaultCurrency,
      dueDate,
      recurrence,
      accountId: accountId || undefined,
      paymentMethod,
      reminderDaysBefore: parseInt(reminderDays) || 3,
      status: (editingBill ? editingBill.status : 'unpaid') as any,
      notes: notes.trim() || undefined,
    };

    if (editingBill) {
      updateBill(editingBill.id, payload);
    } else {
      addBill(payload);
    }

    setIsModalOpen(false);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBill) return;
    payBill(payingBill.id, payAccountId || undefined);
    setPayingBill(null);
  };

  const filteredBills = bills.filter((b) => {
    if (filterStatus === 'unpaid') return b.status === 'unpaid';
    if (filterStatus === 'paid') return b.status === 'paid';
    return true;
  });

  const unpaidTotal = bills
    .filter((b) => b.status === 'unpaid')
    .reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bills & Recurring Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Total pending bills:{' '}
            <strong className="text-amber-600 dark:text-amber-400 font-mono">
              {formatCurrency(unpaidTotal, settings.defaultCurrency)}
            </strong>
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bill or Subscription</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Bills ({bills.length})
        </button>
        <button
          onClick={() => setFilterStatus('unpaid')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterStatus === 'unpaid'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Unpaid / Upcoming ({bills.filter((b) => b.status === 'unpaid').length})
        </button>
        <button
          onClick={() => setFilterStatus('paid')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterStatus === 'paid'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Paid History ({bills.filter((b) => b.status === 'paid').length})
        </button>
      </div>

      {/* Bills Grid */}
      {filteredBills.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            No bills match this filter.
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Track electricity, water, internet, rent, subscriptions, or tuition fees.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            Create Your First Bill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBills.map((bill) => {
            const isPaid = bill.status === 'paid';
            const daysDiff = Math.ceil(
              (new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
            );
            const isOverdue = !isPaid && daysDiff < 0;

            return (
              <div
                key={bill.id}
                className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {bill.name}
                        </h3>
                        {isPaid ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Overdue
                          </span>
                        ) : null}
                      </div>

                      {/* Zero-Pill metadata: unboxed with typographic separators */}
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <span>{bill.categoryName}</span>
                        <span aria-hidden="true">&bull;</span>
                        <span className="capitalize">{bill.recurrence}</span>
                        {bill.paymentMethod && (
                          <>
                            <span aria-hidden="true">&bull;</span>
                            <span>{bill.paymentMethod}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(bill)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Due Date & Amount */}
                  <div className="pt-2 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-700/60">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span
                        className={
                          isOverdue
                            ? 'text-rose-600 dark:text-rose-400 font-medium'
                            : daysDiff <= 3 && !isPaid
                            ? 'text-amber-600 dark:text-amber-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        {isPaid
                          ? `Paid on ${bill.lastPaidDate || bill.dueDate}`
                          : isOverdue
                          ? `Overdue (${Math.abs(daysDiff)} days ago)`
                          : `Due ${bill.dueDate} (in ${daysDiff}d)`}
                      </span>
                    </div>

                    <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {formatCurrency(bill.amount, bill.currency)}
                    </p>
                  </div>

                  {bill.notes && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{bill.notes}</p>
                  )}
                </div>

                {/* Bottom Action Group */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end">
                  {isPaid ? (
                    <button
                      onClick={() =>
                        updateBill(bill.id, {
                          status: 'unpaid',
                          lastPaidDate: undefined,
                        })
                      }
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Mark as Unpaid
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPayingBill(bill);
                        setPayAccountId(bill.accountId || accounts[0]?.id || '');
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Bill & Log Expense</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Bill Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Pay Bill: {payingBill.name}
              </h3>
              <button
                onClick={() => setPayingBill(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Amount to be paid:{' '}
              <strong className="font-mono text-slate-900 dark:text-white">
                {formatCurrency(payingBill.amount, payingBill.currency)}
              </strong>
            </p>

            <form onSubmit={handleConfirmPay} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pay From Account *
                </label>
                <select
                  required
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {editingBill ? 'Edit Bill Record' : 'Add Bill / Subscription'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricity Bill, Fiber Internet, Netflix"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({settings.defaultCurrency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="120"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {categories
                      .filter((c) => c.type === 'expense' || c.type === 'both')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.group} &gt; {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Recurrence
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as BillRecurrence)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="once">One-time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Linked Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Wallet">Mobile Wallet</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Consumer account number, portal URL, billing cycles..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
