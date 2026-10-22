# Jejak Bajet

A simple 50/30/20 monthly budget app, based on the "50/30/20 Budget Sheet" spreadsheet.
Built with React + Vite. Data is stored in the browser (localStorage) for now.

## How it works

Same logic as the sheet:

| App | Sheet |
| --- | --- |
| Total income = sum of income received | `E18` |
| Recommended budget = income × 50% / 30% / 20% | `F22`, `K22`, `P22` (`S6:S8`) |
| Amount spent per group = sum of category "amount spent" | `E41`, `J41`, `O41` |
| Remainder = recommended − spent | `F23`, `K23`, `P23` (`U6:U8`) |
| Share of spending = group spent ÷ total spent | `U15:U17` |
| Status messages (overlimit, funds tight, big saver…) | `T10`, `B25`, `H25`, `P25` |
| Green / red remaining amounts (savings: red until the target is reached) | conditional formatting on `U6:U9` |

Each month is its own budget (like duplicating the sheet). A new month can be copied from the
previous one: incomes and category budgets carry over, amounts spent reset to 0.
The split (50/30/20 by default) can be changed in Settings.

## Develop

```bash
npm install
npm run dev
```

`npm run build` outputs to `dist/`. `npm run icons` regenerates the PNG icons in `public/icons/`.

## Deploy to Vercel

Import the repo in Vercel — it detects Vite automatically (build `npm run build`, output `dist`).
`vercel.json` stops the service worker from being cached.

## Add to iPhone Home Screen

Open the deployed URL in Safari → Share → **Add to Home Screen**. The app opens full-screen,
works offline after the first visit, and keeps its data on the phone.

Note: data saved in Safari and data saved in the Home Screen app are separate on iOS.
Use **Settings → Export backup / Import backup** to move or keep a copy of your data.

## Code map

- `src/lib/budget.js` — all calculations (mirrors the sheet formulas)
- `src/lib/model.js` — data shape, new month / sample data, import validation
- `src/lib/storage.js` — persistence (localStorage today; swap for Supabase here)
- `src/store.jsx` — app state and actions
- `src/views/` — Summary, Income, Needs/Wants/Savings, Settings

## Next phase: Supabase

Only `src/lib/storage.js` needs to change (`loadData` / `saveData` are already async).
The data maps naturally to tables: `months` (key, start_date, end_date), `incomes`
(month_id, name, payday, amount) and `budget_items` (month_id, group, name, budget, spent),
plus a `settings` row per user.
