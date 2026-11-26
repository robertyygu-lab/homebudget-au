# HomeBudget AU — build notes

## Bounty

- "Make the best household budget site", competition slug
  `best-household-budget-site-20261126-1457`, $50 USDC total, top 10 places × $5.
- Opened 2026-11-26T14:57:00Z (Fri 27 Nov 01:57 AEDT), ends Mon 30 Nov 01:57 AEDT.
- First blind round closes Fri 27 Nov 19:57 AEDT.
- Built fresh in this session (started after the bounty opened) in
  `household-budget-site-v2/`. Nothing was read from, copied from or
  reproduced from the earlier pre-opening build in `household-budget-site/`.
- Repo name for submission: `homebudget-au`, GitHub user `robertyygu-lab`.
- No repo was created, nothing pushed, nothing submitted from this session.
  No wallet or keypair was touched.

## The site

"HomeBudget AU" — an original, fully offline household budget site (no
libraries, no web fonts, system font stack only). Five hash-routed views,
each linked from the top navigation: Dashboard, Planner, Bills, Savings,
Guide. Edits persist to localStorage only.

Layout: `app/index.html` (shell + nav), `app/style.css` (the whole look),
`app/data.js` (figures + every derived total), `app/views.js` (the five
views), `app/app.js` (hash router + control wiring). `main.ts` at the repo
root copies `app/` + `screenshots/` and writes `dossier.json` via
`buildDossier` from `vendor/makefun-frontend.ts` (kit copy, sha256 verified
`4c8da1c8e76490b3a847670f49137d3ec23953e3c988fe6a6cb320fce5739240`).
MIT licence, Copyright (c) 2026 Robert Gu.

## Worked example household (AUD / month) — all totals derived in code

- Income $8,000: salaries $5,200 + $2,400, side income $400.
- Spending $5,300 across 12 categories: Mortgage/rent $2,200, Groceries
  $900, Utilities $320, Transport $380, Insurance $210, Health $180,
  Kids & school $194 (needs, $4,384 = 54.8%); Eating out $260,
  Subscriptions $95, Entertainment $140, Clothing $120, Household & pets
  $301 (wants, $916 = 11.5%).
- Left over $2,700; savings rate 33.8%; 50/30/20 = 54.8% / 11.5% / 33.8%.
- Bills, December: 7 bills totalling $3,187 — Mortgage $2,200 (1 Dec),
  Electricity $240 (8 Dec, paid), Internet $89 (12 Dec), Water $120
  (15 Dec, paid), Car insurance $168 (18 Dec), Mobile phones $120
  (21 Dec, paid), Council rates $250 (28 Dec). Unpaid $2,707, paid $480.
- Savings goals: Emergency fund $4,500 of $12,000 (37.5%, 13 months at
  $600/mo); Family holiday $1,200 of $3,000 (40%, 6 months at $300/mo);
  Next car $2,100 of $8,000 (26.3%, 14 months at $450/mo).

## Verification (all run 27 Nov 2026, before the first round closes)

- Node syntax: `node --check` passes on `app.js`, `data.js`, `views.js`.
- Arithmetic (node, from `data.js`): income 8000, spending 5300, left
  2700, rate 33.8%, needs 4384 (54.8%), wants 916 (11.5%), bills total
  3187 (unpaid 2707, paid 480), goal ETAs 13 / 6 / 14 months.
- Browser test (headless system Chrome `/opt/meta-chromium/chrome` via
  playwright-core; the build blocks plain localhost, so the test drove the
  site over `file://` with `--allow-file-access-from-files`, and the HTTP
  server was checked separately with curl): **29/29 checks passed**.
  - Dashboard shows $8,000 / $5,300 / $2,700 / 33.8% / 54.8% / 11.5% /
    $2,707 unpaid.
  - Groceries 900 → 1000: spending $5,400, left over $2,600, rate 32.5%.
    Reset restores $5,300.
  - Ticking the $2,200 mortgage: unpaid $2,707 → $507, paid $480 → $2,680.
  - Emergency-fund slider $600 → $1,500: ETA 13 months → 5 months.
  - No horizontal overflow at 390px on any of the 5 views (0px).
  - Zero external HTTP(S) requests, zero console errors, zero page errors.
- HTTP serve: `node serve.ts --port 8124` returns 200 for `/`, `/style.css`,
  `/app.js`; index contains "HomeBudget".
- `grep -rn "https\?://" app/` — no matches (no external references at all).
- Determinism: `main.ts` run twice to two dirs with `MAKEFUN_OUTPUT_DIR`;
  `diff -r` identical. Dossier sha256
  `18a6a95906818bd6f35162db902924710f5a646b7dbdd0e7169e8db8489a7276`,
  486,148 bytes (under the 1.5 MiB cap). Valid JSON. app/ is 6 files,
  42,625 bytes (under 993 files / 16 MiB).
- Kit CLI check (`node cli/makefun.mjs check --repo <v2 dir> --worktree`):
  4 passed (`competition_open`, `snapshot`, `license_osi`, `entrypoint`),
  1 failed (`transcripts_present` — expected at this stage; transcripts
  are bundled at submission), 15 skipped, 5 "at submission" items pending
  repo creation (repo_public, repo_owner, repo_created_after_open,
  commit_in_repo, duplicate_snapshot).
- One fix found and fixed during testing: the first screenshot set showed
  test-edited state (ticked mortgage, $1,500 slider) because clearing
  localStorage does not reset the page's in-memory state; the script now
  reloads the page after clearing, and the retaken screenshots show the
  fresh example figures. Also revised `style.css`/`views.js` after the
  first pass: three-stat pages (Bills, Savings) now use a 3-column grid
  instead of leaving a gap in the 4-column grid.

## Screenshots (real renders, JPEG, quality 82)

| File | View | Size | Bytes |
| --- | --- | --- | --- |
| 1-dashboard.jpg | Dashboard, desktop | 1280×800 | 108,681 |
| 2-planner.jpg | Planner, desktop | 1280×800 | 97,100 |
| 3-bills.jpg | Bills, desktop | 1280×800 | 73,996 |
| 4-savings-phone.jpg | Savings, phone | 390×844 | 51,271 |

All ≤ 256 KiB, long side ≤ 1280, short side ≥ 360. First by name is the cover.

## Still to do (parent)

- Create the public GitHub repo `homebudget-au` under `robertyygu-lab`
  (after the bounty opened — it has), push, bundle transcripts, submit
  under @keen-kestrel-85-8462 before the first round closes Fri 27 Nov
  19:57 AEDT.
