// HomeBudget AU — the router and the wiring. One job: show the right view
// for the hash, and make the controls in it change the state and re-render.

import {
  loadState, saveState, resetState,
  incomeTotal, spendingTotal, leftOver, savingsRate,
  fiftyThirtyTwenty, billsTotals, goalProgress, money, pct,
} from './data.js';
import { VIEWS } from './views.js';

const app = document.getElementById('app');
const navLinks = [...document.querySelectorAll('.site-nav a')];
let state = loadState();

function routeFromHash() {
  const hash = window.location.hash || '#/';
  const name = hash.replace(/^#\/?/, '').split('/')[0];
  return VIEWS[name] ? name : 'dashboard';
}

function render() {
  const route = routeFromHash();
  app.innerHTML = VIEWS[route](state);
  document.title = 'HomeBudget AU — ' + route[0].toUpperCase() + route.slice(1);
  navLinks.forEach((link) => {
    const active = link.dataset.route === route;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  wireControls(route);
  window.scrollTo(0, 0);
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

// Recompute every derived figure shown on the Planner and repaint the
// numbers in place, so editing feels instant without a full re-render.
function refreshPlannerNumbers() {
  const income = incomeTotal(state);
  const spending = spendingTotal(state);
  const left = leftOver(state);
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set('plan-income', money(income));
  set('plan-spending', money(spending));
  set('plan-leftover', money(left));
  set('plan-rate', pct(savingsRate(state)));
  set('income-total', money(income));
  set('spending-total', money(spending));
  const verdict = document.getElementById('split-verdict');
  if (verdict) {
    const split = fiftyThirtyTwenty(state);
    verdict.textContent = split.savedPct >= 20 && split.needsPct <= 55
      ? 'On track: savings are above the 20% target and needs are close to 50%.'
      : split.savedPct < 20
        ? 'Savings are under the 20% target. Look at the wants first — they are the easiest to trim.'
        : 'Needs are running high. A smaller mortgage or cheaper utilities move the needle most.';
  }
}

function wireControls(route) {
  if (route === 'planner') {
    app.querySelectorAll('input[data-income]').forEach((input) => {
      input.addEventListener('input', () => {
        const line = state.income.find((l) => l.id === input.dataset.income);
        if (line) {
          line.amount = toNumber(input.value, line.amount);
          saveState(state);
          refreshPlannerNumbers();
        }
      });
    });
    app.querySelectorAll('input[data-cat-amount]').forEach((input) => {
      input.addEventListener('input', () => {
        const line = state.categories.find((c) => c.id === input.dataset.catAmount);
        if (line) {
          line.amount = toNumber(input.value, line.amount);
          saveState(state);
          refreshPlannerNumbers();
        }
      });
    });
    app.querySelectorAll('input[data-cat-name]').forEach((input) => {
      input.addEventListener('change', () => {
        const line = state.categories.find((c) => c.id === input.dataset.catName);
        if (line && input.value.trim()) {
          line.label = input.value.trim();
          saveState(state);
        } else if (line) {
          input.value = line.label;
        }
      });
    });
    app.querySelectorAll('select[data-cat-kind]').forEach((select) => {
      select.addEventListener('change', () => {
        const line = state.categories.find((c) => c.id === select.dataset.catKind);
        if (line) {
          line.kind = select.value === 'want' ? 'want' : 'need';
          saveState(state);
          refreshPlannerNumbers();
        }
      });
    });
    const reset = document.getElementById('reset-example');
    if (reset) {
      reset.addEventListener('click', () => {
        state = resetState();
        saveState(state);
        render();
      });
    }
  }

  if (route === 'bills') {
    app.querySelectorAll('input[data-bill]').forEach((box) => {
      box.addEventListener('change', () => {
        const bill = state.bills.find((b) => b.id === box.dataset.bill);
        if (bill) {
          bill.paid = box.checked;
          saveState(state);
          render();
        }
      });
    });
  }

  if (route === 'savings') {
    app.querySelectorAll('input[data-goal-monthly]').forEach((slider) => {
      slider.addEventListener('input', () => {
        const goal = state.goals.find((g) => g.id === slider.dataset.goalMonthly);
        if (!goal) return;
        goal.monthly = toNumber(slider.value, goal.monthly);
        saveState(state);
        const label = document.getElementById('monthly-' + goal.id);
        if (label) label.textContent = money(goal.monthly);
        const eta = document.getElementById('eta-' + goal.id);
        if (eta) {
          const p = goalProgress(goal);
          eta.textContent = p.remaining <= 0
            ? 'Goal reached — time to pick the next one.'
            : p.months
              ? 'At ' + money(goal.monthly) + ' a month, this goal is reached in about ' + p.months + ' ' + (p.months === 1 ? 'month' : 'months') + '.'
              : 'Set a monthly contribution above to see when this goal is reached.';
        }
      });
    });
  }
}

window.addEventListener('hashchange', render);
render();
