# Jejak Bajet 💸

A simple monthly budget app built on the **50/30/20 rule**: 50% of your income for needs,
30% for wants and 20% for savings and investments.

It is based on the "50/30/20 Budget Sheet" spreadsheet and does the same calculations,
in a phone-friendly app you can add to your iPhone Home Screen.

> For educational purposes only. This is not financial advice.

## Features

- **Summary**: money left this month, the overall status, start and end dates, a
  recommended-vs-spent chart, your actual split vs the target split, and the monthly
  summary table (green = doing good, red = attention needed).
- **Income**: income sources with payday and amount after tax and deductions. Shows the
  recommended budget for needs, wants and savings.
- **Needs / Wants / Savings**: categories with a budget and amount spent. Tap **+** to add
  spending as you go. Shows the remainder, the status message and categories that are
  over budget.
- **Months**: each month is its own budget. A new month can copy the previous one: income
  and category budgets carry over, amounts spent reset to 0.
- **Settings**: change the split (default 50/30/20), export or import a backup, load
  sample data, delete a month or all data.
- **Works like an app on iPhone**: full screen from the Home Screen, works offline after the
  first visit, follows light and dark mode.

## How the numbers work

The app uses the same formulas as the spreadsheet:

| App | Spreadsheet |
| --- | --- |
| Total income = sum of income received | `E18` |
| Recommended budget = income × 50% / 30% / 20% | `F22`, `K22`, `P22` (`S6:S8`) |
| Amount spent per group = sum of category amounts spent | `E41`, `J41`, `O41` |
| Remainder = recommended − spent | `F23`, `K23`, `P23` (`U6:U8`) |
| Share of spending = group spent ÷ total spent | `U15:U17` |
| Status messages ("Overlimit!", "Funds are lookin' tight", …) | `T10`, `B25`, `H25`, `P25` |
| Green / red remainders (savings stay red until the target is reached) | conditional formatting on `U6:U9` |

The sheet's February 2024 example gives exactly the same results in the app
(Settings → Load sample data).

## Getting started

Requires Node.js 16 or newer.

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (also reachable from your phone on the same Wi-Fi) |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run icons` | Regenerate the app icons in `public/icons/` |

**Corporate network?** If `npm install` hangs, your network may be inspecting HTTPS traffic
with a company certificate that Node doesn't trust. Point Node at a file containing that
certificate before installing (ask IT for it, or export it from the Windows certificate store):

```bash
export NODE_EXTRA_CA_CERTS=/path/to/company-ca.pem
```

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import this repository.
2. Keep the defaults. Vercel detects Vite (build command `npm run build`, output `dist`).
3. Every push to `main` deploys again.

`vercel.json` stops the service worker file from being cached, so updates reach users.

## Add to iPhone Home Screen

1. Open the deployed `*.vercel.app` URL in **Safari**.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.

The app then opens full screen with its own icon.

## Your data

Data is saved in the browser's local storage, on your device only. Nothing is sent to a server.

- On iPhone, data in Safari and data in the Home Screen app are **separate**. Use
  **Settings → Export backup** and **Import backup** to move data between them.
- Clearing Safari's website data deletes it. Export a backup now and then.

## Project structure

```
src/
  lib/budget.js     All calculations (mirrors the spreadsheet formulas)
  lib/model.js      Data shape, new month, sample data, backup validation
  lib/storage.js    Saving and loading (localStorage now, Supabase later)
  lib/format.js     Money, percent and date formatting
  store.jsx         App state and actions
  views/            Summary, Income, Needs/Wants/Savings, Settings
  components/       Charts, month picker, bottom sheet, inputs, icons
public/
  manifest.webmanifest, sw.js, icons/   Home Screen and offline support
scripts/
  generate-icons.mjs                    Draws the app icons (no dependencies)
```

## Roadmap: Supabase

Next phase is to save data in Supabase so it syncs across devices.
Only `src/lib/storage.js` needs to change: `loadData` and `saveData` are already async.
A possible table layout:

| Table | Columns |
| --- | --- |
| `settings` | `user_id`, `needs_pct`, `wants_pct`, `savings_pct`, `currency` |
| `months` | `id`, `user_id`, `month_key` (e.g. `2026-10`), `start_date`, `end_date` |
| `incomes` | `id`, `month_id`, `name`, `payday`, `amount` |
| `budget_items` | `id`, `month_id`, `group` (`needs` / `wants` / `savings`), `name`, `budget`, `spent` |

## Tech

React 18 and Vite 4, with plain CSS and no other runtime dependencies.
Charts are drawn with HTML and CSS.
