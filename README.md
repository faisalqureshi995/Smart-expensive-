# Smart Expense Tracker

> A modern, private-first personal finance management application with intelligent expense tracking, automated categorization, monthly budget planning, savings goals, debt management, and interactive visual reports.

[![Deploy to GitHub Pages](https://github.com/faisalqureshi995/Smart-expensive/actions/workflows/deploy.yml/badge.svg)](https://github.com/faisalqureshi995/Smart-expensive/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-emerald?style=flat&logo=github)](https://faisalqureshi995.github.io/Smart-expensive/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌐 Live Application

The application is deployed on **GitHub Pages**:
🔗 **[https://faisalqureshi995.github.io/Smart-expensive/](https://faisalqureshi995.github.io/Smart-expensive/)**

---

## ✨ Features

- **Dashboard & Financial Health Insights**
  - Real-time calculated summary cards: Income, Expenses, Net Balance, Total Savings, Remaining Monthly Budget, Money Lent, Money Borrowed, and Pending Bills.
  - Dynamic rule-based insights: Budget pacing percentage, month-over-month category variance, savings rate percentage, and upcoming bill alerts.
  - Date range filters: *This Month*, *Last Month*, *3 Months*, *This Year*, *All Time*, and *Custom Date Range*.

- **Smart Auto-Categorization & Transactions Ledger**
  - **9 Accounting Transaction Types**: *Income*, *Expense*, *Savings Contribution*, *Account Transfer*, *Loan Given*, *Loan Received*, *Loan Repayment*, *Debt Payment*, and *Refund*.
  - **Accounting Integrity**: Transfers between accounts and savings contributions never artificially inflate income or expense totals.
  - **Hybrid Categorization Assistant**: Instant keyword matching with merchant learning from previous transactions and one-tap category application.
  - Searchable transaction ledger with multi-attribute filtering (Type, Category, Account, Payment Method, Date Range), sorting, duplicate action, and **CSV export**.

- **Budgets & Pacing Control**
  - Master monthly spending limits alongside category-specific budgets (Food, Fuel, Dining, Subscriptions, Utilities, etc.).
  - Computes remaining balance, utilization percentage, overspending alerts, and **suggested daily spending allowance**.

- **Savings Goals & Emergency Funds**
  - Multi-goal tracking with progress meters, target completion dates, and contribution/withdrawal history.
  - Integrated one-tap deposits and withdrawals with automated account balance reconciliation.

- **Loans & Debts (Receivables & Payables)**
  - Dedicated tracking for money lent to others versus money borrowed from creditors or installment plans.
  - Installment repayment recording that updates outstanding principal balances and logs linked accounting transactions.

- **Accounts & Wallets**
  - Multi-account management: Cash Wallets, Bank Checking, High-Yield Savings, Mobile Wallets, and Credit Cards.
  - Internal double-entry fund transfer modal that moves balances seamlessly between accounts.

- **Bills & Recurring Reminders**
  - Recurring schedule support (weekly, monthly, quarterly, yearly, or one-time) with overdue countdowns.
  - Quick **Pay Bill** action that marks bills as paid and automatically logs the corresponding expense in the ledger.

- **Interactive Analytics & Visual Reports**
  - Monthly Income vs Expenses bar chart, Interactive Category Doughnut chart with slice hover and percentages, Payment Method distribution, and Net Cash Flow summary.
  - Printable Financial Audit Statement formatted for paper and PDF export (`window.print()`).

- **Global Localization & Privacy**
  - Supports 12 global currencies (PKR, USD, EUR, GBP, AED, SAR, INR, CAD, AUD, JPY, SGD, CHF) with proper symbols and formatting.
  - Light and Dark mode options with persistent settings.
  - Fully client-side storage (localStorage) with JSON backup & restore capabilities.

---

## 🚀 GitHub Pages & CI/CD Deployment

This repository uses **GitHub Actions** (`.github/workflows/deploy.yml`) to automatically build and publish the application to GitHub Pages whenever changes are pushed to the `main` branch.

### Initial GitHub Repository Configuration

To enable GitHub Pages for this repository:

1. Navigate to your GitHub repository:
   **[https://github.com/faisalqureshi995/Smart-expensive](https://github.com/faisalqureshi995/Smart-expensive)**
2. Click on the **Settings** tab.
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, choose **GitHub Actions** (instead of "Deploy from a branch").
5. Push a commit to the `main` branch, or trigger the workflow manually:
   - Go to the **Actions** tab.
   - Select **Deploy to GitHub Pages** in the left workflow list.
   - Click **Run workflow** > **Run workflow**.
6. Once the workflow completes, your app will be live at:
   **[https://faisalqureshi995.github.io/Smart-expensive/](https://faisalqureshi995.github.io/Smart-expensive/)**

---

## 🛠️ Local Development & Build

### Prerequisites
- Node.js (v20+ recommended) or Bun (v1.1+)

### Installation
Clone the repository:
```bash
git clone https://github.com/faisalqureshi995/Smart-expensive.git
cd Smart-expensive
```

Install dependencies:
```bash
# Using Bun (preferred):
bun install

# Or using npm:
npm install --legacy-peer-deps
```

### Start Development Server
```bash
# Using Bun:
bun run dev

# Or using npm:
npm run dev
```
The app will run at `http://localhost:3000/Smart-expensive/` (or `http://localhost:3000/` with automatic redirect).

### Production Build
```bash
# Using Bun:
bun run build

# Or using npm:
npm run build
```
The static production assets will be generated in the `dist/` directory, ready to be served by GitHub Pages or any static file host.

---

## 📂 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions workflow for automated Pages deployment
├── public/
│   └── 404.html              # SPA routing fallback for GitHub Pages
├── src/
│   ├── components/
│   │   ├── AccountsView.tsx      # Multi-account & fund transfer management
│   │   ├── AnalyticsView.tsx     # SVG charts & financial breakdown
│   │   ├── BillsView.tsx         # Recurring bills & reminders
│   │   ├── BudgetsView.tsx       # Master & category monthly budgets
│   │   ├── DashboardView.tsx     # Summary KPI cards & insights
│   │   ├── Header.tsx            # Top navigation bar & theme toggle
│   │   ├── LoansView.tsx         # Money lent vs borrowed tracker
│   │   ├── MobileNav.tsx         # Bottom navigation for mobile viewports
│   │   ├── OnboardingModal.tsx   # First-run welcome & currency setup
│   │   ├── ReportsModal.tsx      # Printable audit & statement report
│   │   ├── SavingsView.tsx       # Savings goals & contribution history
│   │   ├── SettingsView.tsx      # Preferences, custom categories & backup
│   │   ├── TransactionModal.tsx  # Add/Edit transaction with auto-categorization
│   │   └── TransactionsView.tsx  # Searchable transactions ledger
│   ├── context/
│   │   └── FinanceContext.tsx    # State management, accounting engine & CRUD
│   ├── types/
│   │   └── finance.ts            # TypeScript interfaces & domain models
│   ├── utils/
│   │   ├── categories.ts         # Categories & keyword suggestion engine
│   │   ├── currencies.ts         # Multi-currency formatting & configs
│   │   └── storage.ts            # Local persistence, demo seeds, CSV/JSON export
│   ├── App.tsx                   # Main layout container
│   ├── index.css                 # Tailwind CSS v4 imports & print utilities
│   └── main.tsx                  # Application entry point
├── index.html                    # HTML shell
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite configuration with /Smart-expensive/ base path
```

---

## 🔒 Security & Privacy

- **Zero Third-Party Telemetry**: No trackers or external telemetry services.
- **Client-Side Persistence**: Financial data is securely stored inside the user's browser `localStorage`.
- **Export & Portability**: Users retain complete ownership of their data with instant JSON snapshot backup and CSV transaction export.

---

## 📄 License
This project is open-source and available under the Apache-2.0 License.
