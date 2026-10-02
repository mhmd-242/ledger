# Ledger - Personal Expense Tracker

A calm, fast, mobile-first web app designed for logging expenses in under 10 seconds and tracking monthly spending trends in **Ethiopian Birr (ETB)**.

Built with **React**, **TypeScript**, **Tailwind CSS**, and **Recharts**. Fully offline-first with zero accounts, no tracking, and local storage persistence.

---

## Features

- **Fast 2-Tap Logging**: Autofocused numeric keypad (`inputmode="decimal"`), quick category chips, and thumb-reachable action. Adding an expense takes at most 2 taps after typing the amount.
- **ETB Currency First**: All monetary values are formatted with `Intl.NumberFormat` using monospaced tabular numerals (`tabular-nums`) for clean column alignment.
- **Flexible Categories**: Includes standard categories (*Food, Transport, Housing, Bills, Shopping, Health, Entertainment, Other*) plus a custom category builder with icon and color customization.
- **Chronological History**: Expenses grouped by day (*Today*, *Yesterday*, or date) with instant search, category filters, inline editing, and a **5-second Undo toast** on deletion.
- **Insights & Trends**:
  - Interactive Recharts donut chart with category percentage breakdown.
  - 6-month spending trend bar chart.
  - Month-over-month comparison (*e.g., "12% less than last month"*).
- **Spending Budgets**:
  - Set an overall monthly limit and individual category budgets.
  - Clear visual progress bars with non-alarming warnings at 80% and prominent alerts when exceeded.
- **Offline & Backup**: Persists entirely in `localStorage` through a decoupled storage service. Export your data to a clean JSON file or import backups anytime.
- **Light & Dark Theme**: Restrained, accessible slate/charcoal neutrals (no purple AI gradients) with contrast ratios $\ge 4.5:1$.
- **Add to Home Screen (PWA feel)**: Optimized for phone screens ($360\text{px} - 430\text{px}$) with safe-area spacing and minimum $44\text{px}$ touch targets.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage (`StorageService` abstraction)

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. Clone your repository:
   ```bash
   git clone https://github.com/mhmd-242/ledger.git
   cd ledger
   
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`). For the best preview, use your browser's device toolbar at 360-430px width.

### Build for production

```bash
npm run build
```

The output goes to the `dist/` folder. To test the production build locally:

```bash
npm run preview
```

### Deploy

The app is a static site, so it works on any static host. On Vercel, import the GitHub repo and use these settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Every push to `master` redeploys automatically.

## Data & Privacy

All data is stored in your browser's `localStorage`. Nothing is sent to a server. Clearing your browser data will erase your expenses, so use **Export** in the app regularly to save a JSON backup, and **Import** to restore it.

## Project Structure

```
src/        App source (components, storage service, utilities)
public/     Static assets
index.html  App entry
```
