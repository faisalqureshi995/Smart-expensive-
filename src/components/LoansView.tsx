import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Loan, LoanDirection } from '../types/finance';
import { formatCurrency } from '../utils/currencies';
import {
  Landmark,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  History,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

export const LoansView: React.FC = () => {
  const {
    loans,
    accounts,
    settings,
    addLoan,
    updateLoan,
    deleteLoan,
    recordLoanPayment,
  } = useFinance();

  const [filterDirection, setFilterDirection] = useState<'all' | 'lent' | 'borrowed'>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Repayment modal
  const [repayLoan, setRepayLoan] = useState<Loan | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayAccountId, setRepayAccountId] = useState('');
  const [repayNotes, setRepayNotes] = useState('');

  // History inspection modal
  const [historyLoan, setHistoryLoan] = useState<Loan | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [person, setPerson] = useState('');
  const [direction, setDirection] = useState<LoanDirection>('lent');
  const [principal, setPrincipal] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingLoan(null);
    setTitle('');
    setPerson('');
    setDirection('lent');
    setPrincipal('');
    setDueDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setNotes('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (l: Loan) => {
    setEditingLoan(l);
    setTitle(l.title);
    setPerson(l.personOrInstitution);
    setDirection(l.direction);
    setPrincipal(l.originalPrincipal.toString());
    setDueDate(l.dueDate || '');
    setNotes(l.notes || '');
    setIsCreateModalOpen(true);
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrincipal = parseFloat(principal);
    if (isNaN(numPrincipal) || numPrincipal <= 0) return;

    const payload = {
      title: title.trim(),
      personOrInstitution: person.trim(),
      direction,
      originalPrincipal: numPrincipal,
      outstandingPrincipal: editingLoan ? editingLoan.outstandingPrincipal : numPrincipal,
      currency: settings.defaultCurrency,
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: dueDate || undefined,
      status: (editingLoan ? editingLoan.status : 'active') as any,
      notes: notes.trim() || undefined,
    };

    if (editingLoan) {
      updateLoan(editingLoan.id, payload);
    } else {
      addLoan(payload);
    }

    setIsCreateModalOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayLoan) return;
    const num = parseFloat(repayAmount);
    if (isNaN(num) || num <= 0 || !repayAccountId) return;

    recordLoanPayment(repayLoan.id, num, repayAccountId, repayNotes);
    setRepayLoan(null);
    setRepayAmount('');
    setRepayNotes('');
  };

  const filteredLoans = loans.filter((l) => {
    if (filterDirection !== 'all' && l.direction !== filterDirection) return false;
    return true;
  });

  const totalLentOutstanding = loans
    .filter((l) => l.direction === 'lent' && l.status !== 'fully_paid')
    .reduce((s, l) => s + l.outstandingPrincipal, 0);

  const totalBorrowedOutstanding = loans
    .filter((l) => l.direction === 'borrowed' && l.status !== 'fully_paid')
    .reduce((s, l) => s + l.outstandingPrincipal, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Loans, Debts & Receivables
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track money lent to friends or borrowed from creditors and installment plans
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Loan / Debt</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Total Money Lent (Receivable)</span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalLentOutstanding, settings.defaultCurrency)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Owed to you by others</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Total Money Borrowed (Payable)</span>
            <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatCurrency(totalBorrowedOutstanding, settings.defaultCurrency)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Owed by you to creditors</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Net Position</span>
            <p
              className={`text-xl font-bold font-mono ${
                totalLentOutstanding >= totalBorrowedOutstanding
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {totalLentOutstanding >= totalBorrowedOutstanding ? '+' : ''}
              {formatCurrency(totalLentOutstanding - totalBorrowedOutstanding, settings.defaultCurrency)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Receivables minus debt</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit text-xs">
        <button
          onClick={() => setFilterDirection('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterDirection === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Records ({loans.length})
        </button>
        <button
          onClick={() => setFilterDirection('lent')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterDirection === 'lent'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Money Lent ({loans.filter((l) => l.direction === 'lent').length})
        </button>
        <button
          onClick={() => setFilterDirection('borrowed')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterDirection === 'borrowed'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Money Borrowed ({loans.filter((l) => l.direction === 'borrowed').length})
        </button>
      </div>

      {/* Loans Grid */}
      {filteredLoans.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            No debt or loan records found.
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Record money you have lent to others or installments you are paying off.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            Record New Loan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLoans.map((loan) => {
            const isLent = loan.direction === 'lent';
            const isPaid = loan.outstandingPrincipal <= 0;
            const repaidAmount = loan.originalPrincipal - loan.outstandingPrincipal;
            const repaidPercent = Math.min(
              100,
              Math.round((repaidAmount / loan.originalPrincipal) * 100)
            );

            return (
              <div
                key={loan.id}
                className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            isLent
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isLent ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                          {isLent ? 'Lent to' : 'Borrowed from'}: {loan.personOrInstitution}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {loan.title}
                      </h3>
                      {loan.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{loan.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(loan)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLoan(loan.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Issued: {loan.dateIssued}</span>
                    {loan.dueDate && (
                      <>
                        <span aria-hidden="true">&bull;</span>
                        <span>Due: {loan.dueDate}</span>
                      </>
                    )}
                  </div>

                  {/* Principal Figures */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-mono text-slate-500">Outstanding:</span>
                      <span
                        className={`font-mono text-base font-bold ${
                          isPaid
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isLent
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(loan.outstandingPrincipal, loan.currency)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${repaidPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{repaidPercent}% Repaid</span>
                      <span>Total: {formatCurrency(loan.originalPrincipal, loan.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Group */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  {isPaid ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Fully Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setRepayLoan(loan);
                        setRepayAmount(loan.outstandingPrincipal.toString());
                        setRepayAccountId(accounts[0]?.id || '');
                        setRepayNotes('');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{isLent ? 'Record Payment Received' : 'Record Repayment'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setHistoryLoan(loan)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                    title="View repayment installments"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Repayment Modal */}
      {repayLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {repayLoan.direction === 'lent' ? 'Collect Payment' : 'Pay Down Loan'}
              </h3>
              <button
                onClick={() => setRepayLoan(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {repayLoan.title} ({repayLoan.personOrInstitution}) &bull; Outstanding:{' '}
              <strong className="font-mono text-slate-900 dark:text-white">
                {formatCurrency(repayLoan.outstandingPrincipal, repayLoan.currency)}
              </strong>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Repayment Amount ({repayLoan.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {repayLoan.direction === 'lent' ? 'Account Deposited Into *' : 'Account Paid From *'}
                </label>
                <select
                  required
                  value={repayAccountId}
                  onChange={(e) => setRepayAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.currentBalance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Installment 3 of 4 via Bank Transfer"
                  value={repayNotes}
                  onChange={(e) => setRepayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRepayLoan(null)}
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

      {/* History Inspection Modal */}
      {historyLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Payment History: {historyLoan.title}
              </h3>
              <button
                onClick={() => setHistoryLoan(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {historyLoan.payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No repayments recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                {historyLoan.payments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {p.notes || 'Principal Repayment'}
                      </p>
                      <p className="text-[10px] text-slate-400">{p.date}</p>
                    </div>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount, historyLoan.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setHistoryLoan(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Loan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {editingLoan ? 'Edit Loan Record' : 'Record New Loan or Debt'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Direction *
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDirection('lent')}
                    className={`py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                      direction === 'lent'
                        ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    Money Lent (Receivable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('borrowed')}
                    className={`py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                      direction === 'borrowed'
                        ? 'bg-white dark:bg-slate-700 shadow-xs text-rose-600 dark:text-rose-400 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    Money Borrowed (Debt)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title / Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Camera Gear Advance, Laptop installment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Person or Financial Institution *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe, Bank of America, Retailer"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Original Principal ({settings.defaultCurrency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="1000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Terms, schedule, or conditions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
