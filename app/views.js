// HomeBudget AU — the five views. Each view is a plain function that takes
// the state and returns HTML. All figures come from data.js, so the numbers
// on screen always agree with the lines they add up from.

import {
  MONTH_LABEL, HOUSEHOLD_NAME, HOUSEHOLD_NOTE,
  incomeTotal, spendingTotal, leftOver, savingsRate,
  fiftyThirtyTwenty, billsTotals, goalProgress, money, pct,
} from './data.js';

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function barRow(label, amount, max, note) {
  const width = max > 0 ? Math.max(2, Math.round((amount / max) * 100)) : 0;
  return '<div class="bar-row"><span class="bar-label">' + esc(label) + '</span>' +
    '<span class="bar-track"><span class="bar-fill" style="width:' + width + '%"></span></span>' +
    '<span class="bar-value">' + money(amount) + '</span>' +
    (note ? '<span class="bar-note">' + esc(note) + '</span>' : '') + '</div>';
}

function donut(split) {
  // A simple SVG donut for the 50/30/20 split: needs, wants, savings.
  const r = 54;
  const c = 2 * Math.PI * r;
  const needsLen = (split.needsPct / 100) * c;
  const wantsLen = (split.wantsPct / 100) * c;
  const savedLen = (split.savedPct / 100) * c;
  return '<svg class="donut" viewBox="0 0 140 140" role="img" aria-label="50/30/20 split: needs ' +
    pct(split.needsPct) + ', wants ' + pct(split.wantsPct) + ', savings ' + pct(split.savedPct) + '">' +
    '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="#e7dfcd" stroke-width="22"></circle>' +
    '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="#14655a" stroke-width="22" stroke-dasharray="' +
    needsLen.toFixed(1) + ' ' + (c - needsLen).toFixed(1) + '" transform="rotate(-90 70 70)"></circle>' +
    '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="#e8a33d" stroke-width="22" stroke-dasharray="' +
    wantsLen.toFixed(1) + ' ' + (c - wantsLen).toFixed(1) + '" stroke-dashoffset="' + (-needsLen).toFixed(1) +
    '" transform="rotate(-90 70 70)"></circle>' +
    '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="#7fb069" stroke-width="22" stroke-dasharray="' +
    savedLen.toFixed(1) + ' ' + (c - savedLen).toFixed(1) + '" stroke-dashoffset="' + (-needsLen - wantsLen).toFixed(1) +
    '" transform="rotate(-90 70 70)"></circle>' +
    '<text x="70" y="66" text-anchor="middle" class="donut-big">' + pct(split.savedPct) + '</text>' +
    '<text x="70" y="84" text-anchor="middle" class="donut-small">saved</text></svg>';
}

export function dashboardView(state) {
  const income = incomeTotal(state);
  const spending = spendingTotal(state);
  const left = leftOver(state);
  const rate = savingsRate(state);
  const split = fiftyThirtyTwenty(state);
  const bills = billsTotals(state);
  const maxSpend = Math.max(...state.categories.map((c) => c.amount));
  const topSpend = [...state.categories].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const nextBill = state.bills.filter((b) => !b.paid).sort((a, b) => a.due.localeCompare(b.due))[0];

  return '<section class="page-head">' +
    '<p class="eyebrow">' + esc(HOUSEHOLD_NAME) + ' · ' + esc(MONTH_LABEL) + '</p>' +
    '<h1>Where the money goes this month</h1>' +
    '<p class="lede">' + esc(HOUSEHOLD_NOTE) + ' Every dollar below is worked out from the lines in the Planner — change a figure there and this page follows.</p></section>' +
    '<section class="stat-grid" aria-label="Month at a glance">' +
    '<article class="stat"><span class="stat-label">Take-home pay</span><span class="stat-value" id="stat-income">' + money(income) + '</span><span class="stat-sub">per month</span></article>' +
    '<article class="stat"><span class="stat-label">Planned spending</span><span class="stat-value" id="stat-spending">' + money(spending) + '</span><span class="stat-sub">across ' + state.categories.length + ' categories</span></article>' +
    '<article class="stat stat-good"><span class="stat-label">Left over</span><span class="stat-value" id="stat-leftover">' + money(left) + '</span><span class="stat-sub">to save or invest</span></article>' +
    '<article class="stat stat-good"><span class="stat-label">Savings rate</span><span class="stat-value" id="stat-rate">' + pct(rate) + '</span><span class="stat-sub">of take-home pay</span></article>' +
    '</section>' +
    '<section class="two-col">' +
    '<article class="card"><h2>Biggest spending</h2>' +
    topSpend.map((c) => barRow(c.label, c.amount, maxSpend)).join('') +
    '<p class="card-link"><a href="#/planner">Edit every category in the Planner →</a></p></article>' +
    '<article class="card"><h2>The 50/30/20 rule</h2><div class="split-wrap">' + donut(split) +
    '<ul class="legend">' +
    '<li><span class="swatch swatch-needs"></span>Needs — ' + money(split.needs) + ' · ' + pct(split.needsPct) + ' <span class="muted">(rule says 50%)</span></li>' +
    '<li><span class="swatch swatch-wants"></span>Wants — ' + money(split.wants) + ' · ' + pct(split.wantsPct) + ' <span class="muted">(rule says 30%)</span></li>' +
    '<li><span class="swatch swatch-saved"></span>Savings — ' + money(split.saved) + ' · ' + pct(split.savedPct) + ' <span class="muted">(rule says 20%)</span></li>' +
    '</ul></div>' +
    '<p>This household spends a little over the needs target and well under on wants — the gap goes straight to savings. See the Guide for how the rule works.</p></article>' +
    '</section>' +
    '<section class="two-col">' +
    '<article class="card"><h2>Bills due in ' + esc(MONTH_LABEL) + '</h2>' +
    '<p class="big-number">' + money(bills.unpaid) + ' <span class="muted">still to pay</span></p>' +
    '<p>' + bills.count + ' bills totalling ' + money(bills.total) + '. ' + money(bills.paid) + ' already paid.</p>' +
    (nextBill ? '<p>Next up: <strong>' + esc(nextBill.label) + ' — ' + money(nextBill.amount) + '</strong>, due ' + esc(nextBill.due) + '.</p>' : '<p>All bills are paid. Nice work.</p>') +
    '<p class="card-link"><a href="#/bills">See and tick off bills →</a></p></article>' +
    '<article class="card"><h2>Savings goals</h2>' +
    state.goals.map((g) => {
      const p = goalProgress(g);
      return '<p class="goal-line"><strong>' + esc(g.label) + '</strong> — ' + money(g.saved) + ' of ' + money(g.target) +
        ' (' + pct(p.pct, 0) + ')' + (p.months === null ? '' : ' · ' + p.months + ' months to go at ' + money(g.monthly) + '/month') + '</p>';
    }).join('') +
    '<p class="card-link"><a href="#/savings">Adjust goals and contributions →</a></p></article>' +
    '</section>';
}

export function plannerView(state) {
  const income = incomeTotal(state);
  const spending = spendingTotal(state);
  const left = leftOver(state);
  const split = fiftyThirtyTwenty(state);
  const maxSpend = Math.max(...state.categories.map((c) => c.amount), 1);

  return '<section class="page-head">' +
    '<p class="eyebrow">Planner · ' + esc(MONTH_LABEL) + '</p>' +
    '<h1>Plan the month, dollar by dollar</h1>' +
    '<p class="lede">Type a new amount in any box and the totals, the savings rate and the 50/30/20 split update straight away. Your changes are saved on this device.</p></section>' +
    '<section class="stat-grid" aria-label="Plan totals">' +
    '<article class="stat"><span class="stat-label">Take-home pay</span><span class="stat-value" id="plan-income">' + money(income) + '</span></article>' +
    '<article class="stat"><span class="stat-label">Planned spending</span><span class="stat-value" id="plan-spending">' + money(spending) + '</span></article>' +
    '<article class="stat"><span class="stat-label">Left over</span><span class="stat-value" id="plan-leftover">' + money(left) + '</span></article>' +
    '<article class="stat"><span class="stat-label">Savings rate</span><span class="stat-value" id="plan-rate">' + pct(savingsRate(state)) + '</span></article>' +
    '</section>' +
    '<section class="two-col">' +
    '<article class="card"><h2>Income</h2>' +
    state.income.map((line) =>
      '<label class="edit-row"><span>' + esc(line.label) + '</span>' +
      '<span class="money-input">$<input type="number" min="0" step="10" value="' + line.amount + '" data-income="' + esc(line.id) + '" aria-label="' + esc(line.label) + ' amount"></span></label>'
    ).join('') +
    '<p class="row-total">Total income <strong id="income-total">' + money(income) + '</strong></p></article>' +
    '<article class="card"><h2>50 / 30 / 20 check</h2><div class="split-wrap">' + donut(split) +
    '<ul class="legend">' +
    '<li><span class="swatch swatch-needs"></span>Needs ' + pct(split.needsPct) + ' <span class="muted">(aim 50%)</span></li>' +
    '<li><span class="swatch swatch-wants"></span>Wants ' + pct(split.wantsPct) + ' <span class="muted">(aim 30%)</span></li>' +
    '<li><span class="swatch swatch-saved"></span>Savings ' + pct(split.savedPct) + ' <span class="muted">(aim 20%)</span></li>' +
    '</ul></div>' +
    '<p id="split-verdict">' + splitVerdict(split) + '</p></article>' +
    '</section>' +
    '<section class="card"><h2>Spending categories</h2>' +
    '<p>Needs are the must-pays; wants are the choices. Change a category name or amount — the chart and the split follow.</p>' +
    state.categories.map((c) =>
      '<div class="edit-row category-row"><input type="text" value="' + esc(c.label) + '" data-cat-name="' + esc(c.id) + '" aria-label="Category name">' +
      '<select data-cat-kind="' + esc(c.id) + '" aria-label="Need or want">' +
      '<option value="need"' + (c.kind === 'need' ? ' selected' : '') + '>Need</option>' +
      '<option value="want"' + (c.kind === 'want' ? ' selected' : '') + '>Want</option></select>' +
      '<span class="money-input">$<input type="number" min="0" step="5" value="' + c.amount + '" data-cat-amount="' + esc(c.id) + '" aria-label="' + esc(c.label) + ' amount"></span>' +
      '<span class="bar-track slim"><span class="bar-fill" style="width:' + Math.max(2, Math.round((c.amount / maxSpend) * 100)) + '%"></span></span></div>'
    ).join('') +
    '<p class="row-total">Total spending <strong id="spending-total">' + money(spending) + '</strong></p>' +
    '<p><button type="button" class="btn" id="reset-example">Reset to the example household</button> <span class="muted">Puts every figure back to the Carters’ December plan.</span></p>' +
    '</section>';
}

function splitVerdict(split) {
  if (split.savedPct >= 20 && split.needsPct <= 55) {
    return 'On track: savings are above the 20% target and needs are close to 50%.';
  }
  if (split.savedPct < 20) {
    return 'Savings are under the 20% target. Look at the wants first — they are the easiest to trim.';
  }
  return 'Needs are running high. A smaller mortgage or cheaper utilities move the needle most.';
}

export function billsView(state) {
  const totals = billsTotals(state);
  const unpaid = state.bills.filter((b) => !b.paid);
  const paid = state.bills.filter((b) => b.paid);

  function billRow(b) {
    return '<li class="bill-row' + (b.paid ? ' is-paid' : '') + '">' +
      '<label class="bill-check"><input type="checkbox" data-bill="' + esc(b.id) + '"' + (b.paid ? ' checked' : '') + '>' +
      '<span class="bill-check-label">' + (b.paid ? 'Paid' : 'Mark paid') + '</span></label>' +
      '<span class="bill-main"><strong>' + esc(b.label) + '</strong><span class="muted">' + esc(b.provider) + '</span></span>' +
      '<span class="bill-due">Due ' + esc(b.due) + '</span>' +
      '<span class="bill-amount">' + money(b.amount) + '</span></li>';
  }

  return '<section class="page-head">' +
    '<p class="eyebrow">Bills · ' + esc(MONTH_LABEL) + '</p>' +
    '<h1>Bills, due dates and what is left to pay</h1>' +
    '<p class="lede">Tick a bill when you pay it and it moves to the paid list, with the totals updated at once. Nothing here is a direct debit — ticking is just your own record.</p></section>' +
    '<section class="stat-grid stat-grid-3" aria-label="Bill totals">' +
    '<article class="stat"><span class="stat-label">Still to pay</span><span class="stat-value" id="bills-unpaid">' + money(totals.unpaid) + '</span><span class="stat-sub" id="bills-unpaid-count">' + unpaid.length + ' of ' + totals.count + ' bills</span></article>' +
    '<article class="stat"><span class="stat-label">Already paid</span><span class="stat-value" id="bills-paid">' + money(totals.paid) + '</span><span class="stat-sub">' + paid.length + ' of ' + totals.count + ' bills</span></article>' +
    '<article class="stat"><span class="stat-label">All bills this month</span><span class="stat-value" id="bills-total">' + money(totals.total) + '</span><span class="stat-sub">' + esc(MONTH_LABEL) + '</span></article>' +
    '</section>' +
    '<section class="card"><h2>To pay</h2>' +
    (unpaid.length ? '<ul class="bill-list">' + unpaid.map(billRow).join('') + '</ul>' : '<p class="empty-note">Nothing left to pay this month. Every bill is ticked off.</p>') +
    '</section>' +
    '<section class="card"><h2>Paid</h2>' +
    (paid.length ? '<ul class="bill-list">' + paid.map(billRow).join('') + '</ul>' : '<p class="empty-note">Nothing paid yet. Tick a bill above when you pay it.</p>') +
    '<p class="hint">Tip: pay the mortgage first — at ' + money(2200) + ' it is more than two-thirds of the month’s bills. Then knock over the small ones so they stop nagging.</p></section>';
}

export function savingsView(state) {
  const totalSaved = state.goals.reduce((t, g) => t + g.saved, 0);
  const totalTarget = state.goals.reduce((t, g) => t + g.target, 0);
  const totalMonthly = state.goals.reduce((t, g) => t + g.monthly, 0);

  return '<section class="page-head">' +
    '<p class="eyebrow">Savings · ' + esc(MONTH_LABEL) + '</p>' +
    '<h1>Savings goals, and how fast you get there</h1>' +
    '<p class="lede">Drag a contribution slider and the months-to-goal change on the spot. The left-over figure from the Planner — ' + money(leftOver(state)) + ' a month — is what funds all three goals.</p></section>' +
    '<section class="stat-grid stat-grid-3" aria-label="Savings totals">' +
    '<article class="stat"><span class="stat-label">Saved so far</span><span class="stat-value">' + money(totalSaved) + '</span><span class="stat-sub">of ' + money(totalTarget) + ' in goals</span></article>' +
    '<article class="stat"><span class="stat-label">Planned saving</span><span class="stat-value">' + money(totalMonthly) + '</span><span class="stat-sub">a month across all goals</span></article>' +
    '<article class="stat"><span class="stat-label">Left over each month</span><span class="stat-value">' + money(leftOver(state)) + '</span><span class="stat-sub">from the Planner</span></article>' +
    '</section>' +
    state.goals.map((g) => {
      const p = goalProgress(g);
      return '<section class="card goal-card"><div class="goal-head"><h2>' + esc(g.label) + '</h2>' +
        '<span class="goal-amounts"><strong>' + money(g.saved) + '</strong> of ' + money(g.target) + '</span></div>' +
        '<p>' + esc(g.note) + '</p>' +
        '<div class="progress" role="progressbar" aria-valuenow="' + Math.round(p.pct) + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + esc(g.label) + ' progress">' +
        '<span class="progress-fill" style="width:' + Math.min(100, p.pct).toFixed(1) + '%"></span></div>' +
        '<p class="goal-pct">' + pct(p.pct, 0) + ' there · ' + money(p.remaining) + ' to go</p>' +
        '<label class="slider-row"><span>Monthly contribution: <strong id="monthly-' + esc(g.id) + '">' + money(g.monthly) + '</strong></span>' +
        '<input type="range" min="0" max="1500" step="50" value="' + g.monthly + '" data-goal-monthly="' + esc(g.id) + '" aria-label="Monthly contribution to ' + esc(g.label) + '"></label>' +
        '<p class="goal-eta" id="eta-' + esc(g.id) + '">' + etaText(g, p) + '</p></section>';
    }).join('') +
    '<section class="card"><h2>How to pick a contribution</h2>' +
    '<p>Start with the emergency fund — three months of essentials before anything else. Once it is full, roll its monthly amount into the next goal. A dollar saved in January is worth the same in December; the habit is what compounds.</p></section>';
}

function etaText(goal, progress) {
  if (progress.remaining <= 0) return 'Goal reached — time to pick the next one.';
  if (!progress.months) return 'Set a monthly contribution above to see when this goal is reached.';
  const word = progress.months === 1 ? 'month' : 'months';
  return 'At ' + money(goal.monthly) + ' a month, this goal is reached in about ' + progress.months + ' ' + word + '.';
}

export function guideView(state) {
  const split = fiftyThirtyTwenty(state);
  return '<section class="page-head">' +
    '<p class="eyebrow">Guide</p>' +
    '<h1>The household budget, in plain English</h1>' +
    '<p class="lede">No jargon, no spreadsheets to download. Five ideas that keep a household budget working month after month.</p></section>' +
    '<section class="card guide-card"><h2>1 · Start with what lands in the bank</h2>' +
    '<p>Budget on take-home pay, not salary. This household brings home ' + money(incomeTotal(state)) + ' a month after tax — that is the only number the plan can spend. If pay varies, budget on your lowest usual month and treat a good month as a bonus.</p></section>' +
    '<section class="card guide-card"><h2>2 · The 50/30/20 rule</h2>' +
    '<p>Roughly half of take-home pay on needs, thirty percent on wants, twenty percent on savings. The Carter household sits at ' + pct(split.needsPct) + ' needs, ' + pct(split.wantsPct) + ' wants and ' + pct(split.savedPct) + ' savings — over on needs, well under on wants, and saving more than the rule asks. The rule is a compass, not a pass mark: rent in Sydney makes 50% needs hard, and that is fine if savings still clear 20%.</p></section>' +
    '<section class="card guide-card"><h2>3 · Give every dollar a job before the month starts</h2>' +
    '<p>Plan spending of ' + money(spendingTotal(state)) + ' against income of ' + money(incomeTotal(state)) + ' and the ' + money(leftOver(state)) + ' left over is not spare change — it is the savings transfer, made on payday before anything else can eat it. Money with no job gets spent; money with a job gets saved.</p></section>' +
    '<section class="card guide-card"><h2>4 · Pay the bills on their dates, not when you remember</h2>' +
    '<p>December holds ' + money(billsTotals(state).total) + ' in bills, and the mortgage alone is ' + money(2200) + '. List every due date, pay the big ones first, and tick them off here so nothing is paid twice or missed. A missed bill costs late fees; a double-paid one costs a phone call.</p></section>' +
    '<section class="card guide-card"><h2>5 · Save for named things, not “savings”</h2>' +
    '<p>An emergency fund, a holiday and a car beat one vague pile. When a goal has a name, a target and a monthly amount, you can see the finish line — and moving the slider on the Savings page shows it move. Revisit the plan on the first Sunday of each month; fifteen minutes is enough.</p></section>' +
    '<section class="card"><h2>Try it yourself</h2>' +
    '<p>Head to the <a href="#/planner">Planner</a> and change Groceries from ' + money(900) + ' to ' + money(1000) + '. Watch the left-over figure and the savings rate move. Then put it back — or don’t, if the new number is the honest one.</p></section>';
}

export const VIEWS = {
  dashboard: dashboardView,
  planner: plannerView,
  bills: billsView,
  savings: savingsView,
  guide: guideView,
};
