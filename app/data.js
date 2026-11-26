// HomeBudget AU — the household's figures and the maths that turns them into
// totals. Every total on screen is derived here from the line items below;
// no total is typed in by hand. Edits are kept in localStorage only.

export const STORAGE_KEY = 'homebudget-au-v1';

export const MONTH_LABEL = 'December 2026';
export const HOUSEHOLD_NAME = 'The Carter household';
export const HOUSEHOLD_NOTE = 'Two adults, two kids, Sydney. Take-home pay after tax.';

// Income lines, dollars per month.
export const EXAMPLE_INCOME = [
  { id: 'salary-a', label: 'Salary — Alex', amount: 5200 },
  { id: 'salary-b', label: 'Salary — Sam', amount: 2400 },
  { id: 'side', label: 'Side income — weekend markets', amount: 400 },
];

// Spending categories, dollars per month. `kind` drives the 50/30/20 split:
// "need" is a must-pay, "want" is a choice.
export const EXAMPLE_CATEGORIES = [
  { id: 'mortgage', label: 'Mortgage / rent', amount: 2200, kind: 'need' },
  { id: 'groceries', label: 'Groceries', amount: 900, kind: 'need' },
  { id: 'utilities', label: 'Utilities — power, water, gas', amount: 320, kind: 'need' },
  { id: 'transport', label: 'Transport — fuel & Opal', amount: 380, kind: 'need' },
  { id: 'insurance', label: 'Insurance — home & car', amount: 210, kind: 'need' },
  { id: 'health', label: 'Health — GP, dentist, scripts', amount: 180, kind: 'need' },
  { id: 'kids', label: 'Kids & school', amount: 194, kind: 'need' },
  { id: 'eating-out', label: 'Eating out & takeaway', amount: 260, kind: 'want' },
  { id: 'subscriptions', label: 'Subscriptions — streaming & apps', amount: 95, kind: 'want' },
  { id: 'entertainment', label: 'Entertainment & outings', amount: 140, kind: 'want' },
  { id: 'clothing', label: 'Clothing', amount: 120, kind: 'want' },
  { id: 'household', label: 'Household & pets', amount: 301, kind: 'want' },
];

// Bills due this month. `paid` is the starting state; ticking a bill in the
// Bills view moves its amount between unpaid and paid.
export const EXAMPLE_BILLS = [
  { id: 'bill-mortgage', label: 'Mortgage repayment', provider: 'Big Four Bank', amount: 2200, due: '1 Dec', paid: false },
  { id: 'bill-power', label: 'Electricity', provider: 'Energy retailer', amount: 240, due: '8 Dec', paid: true },
  { id: 'bill-internet', label: 'Internet — NBN 100', provider: 'NBN provider', amount: 89, due: '12 Dec', paid: false },
  { id: 'bill-water', label: 'Water', provider: 'Sydney Water', amount: 120, due: '15 Dec', paid: true },
  { id: 'bill-car-ins', label: 'Car insurance', provider: 'Insurer', amount: 168, due: '18 Dec', paid: false },
  { id: 'bill-phone', label: 'Mobile phones × 2', provider: 'Telco', amount: 120, due: '21 Dec', paid: true },
  { id: 'bill-rates', label: 'Council rates', provider: 'Local council', amount: 250, due: '28 Dec', paid: false },
];

// Savings goals. `monthly` is the planned contribution per month.
export const EXAMPLE_GOALS = [
  { id: 'goal-emergency', label: 'Emergency fund', note: 'Three months of essentials, for a rainy day.', target: 12000, saved: 4500, monthly: 600 },
  { id: 'goal-holiday', label: 'Family holiday — Queensland', note: 'Flights, a week away, and spending money.', target: 3000, saved: 1200, monthly: 300 },
  { id: 'goal-car', label: 'Next car', note: 'Replacing the old hatchback in a couple of years.', target: 8000, saved: 2100, monthly: 450 },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function exampleState() {
  return {
    income: clone(EXAMPLE_INCOME),
    categories: clone(EXAMPLE_CATEGORIES),
    bills: clone(EXAMPLE_BILLS),
    goals: clone(EXAMPLE_GOALS),
  };
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return exampleState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.income) || !Array.isArray(parsed.categories)) return exampleState();
    return parsed;
  } catch {
    return exampleState();
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full store: the page still works for the session.
  }
}

export function resetState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
  return exampleState();
}

// ---- Totals, all derived from the lines above ----

export function sum(lines) {
  return lines.reduce((total, line) => total + Number(line.amount || 0), 0);
}

export function incomeTotal(state) {
  return sum(state.income);
}

export function spendingTotal(state) {
  return sum(state.categories);
}

export function leftOver(state) {
  return incomeTotal(state) - spendingTotal(state);
}

export function savingsRate(state) {
  const income = incomeTotal(state);
  if (income <= 0) return 0;
  return (leftOver(state) / income) * 100;
}

// 50/30/20 split: needs and wants come from the categories, savings is what
// is left over. Each share is a percentage of take-home pay.
export function fiftyThirtyTwenty(state) {
  const income = incomeTotal(state);
  const needs = sum(state.categories.filter((c) => c.kind === 'need'));
  const wants = sum(state.categories.filter((c) => c.kind === 'want'));
  const saved = leftOver(state);
  if (income <= 0) return { needs: 0, wants: 0, saved: 0, needsPct: 0, wantsPct: 0, savedPct: 0 };
  return {
    needs,
    wants,
    saved,
    needsPct: (needs / income) * 100,
    wantsPct: (wants / income) * 100,
    savedPct: (saved / income) * 100,
  };
}

export function billsTotals(state) {
  const unpaid = sum(state.bills.filter((b) => !b.paid));
  const paid = sum(state.bills.filter((b) => b.paid));
  return { unpaid, paid, total: unpaid + paid, count: state.bills.length };
}

export function goalProgress(goal) {
  const remaining = Math.max(0, goal.target - goal.saved);
  const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
  const months = goal.monthly > 0 ? Math.ceil(remaining / goal.monthly) : null;
  return { remaining, pct, months };
}

export function money(amount) {
  const value = Math.round(Number(amount || 0));
  return '$' + value.toLocaleString('en-AU');
}

export function pct(value, decimals = 1) {
  return Number(value || 0).toFixed(decimals) + '%';
}
