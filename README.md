# HomeBudget AU

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/robertyygu-lab/homebudget-au/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/robertyygu-lab/homebudget-au/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A household budget site that runs entirely offline in a browser, on a desktop
and on a phone. Built for the make.fun bounty
**“Make the best household budget site”**
(`best-household-budget-site-20261126-1457`).

## What it is

A working budget for an example Australian household (the Carters, December
2026): take-home pay $8,000 a month, planned spending $5,300 across twelve
categories, $2,700 left over — a 33.8% savings rate. Five pages, each reached
from the top navigation:

- **Dashboard** — the month at a glance, biggest spending, the 50/30/20 split,
  bills still to pay and savings goals.
- **Planner** — edit any income or spending figure and the totals, savings
  rate and 50/30/20 split update live; rename categories, switch needs and
  wants, reset to the example.
- **Bills** — seven December bills totalling $3,187; tick one paid and the
  unpaid/paid totals move at once.
- **Savings** — three goals (emergency fund, holiday, next car) with a
  contribution slider that recomputes the months to each goal.
- **Guide** — the budget in plain English: the 50/30/20 rule, paying bills on
  their dates, and saving for named things.

Edits are saved in the browser's local storage only. Nothing is sent anywhere
and nothing is fetched: no libraries, no web fonts, no network requests.

## Run it

```sh
node serve.ts          # http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-frontend.ts`.

## Layout

- `app/index.html` — the page shell and navigation
- `app/style.css` — the whole look, one stylesheet
- `app/data.js` — the household's figures and every total derived from them
- `app/views.js` — the five views
- `app/app.js` — the hash router and the controls
- `main.ts`, `serve.ts`, `vendor/makefun-frontend.ts`
- `screenshots/` — renders of the site, listed in `shots.json`

## Licence

MIT — see `LICENSE`.
