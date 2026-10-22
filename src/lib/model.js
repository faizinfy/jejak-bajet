import { CATEGORY_SUGGESTIONS, DEFAULT_SPLIT, GROUPS } from './budget.js'

export const SCHEMA_VERSION = 1

export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

const pad = (n) => String(n).padStart(2, '0')

export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function monthKeyOf(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function parseMonthKey(key) {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m }
}

export function shiftMonthKey(key, delta) {
  const { year, month } = parseMonthKey(key)
  return monthKeyOf(new Date(year, month - 1 + delta, 1))
}

export function monthLabel(key, style = 'long') {
  const { year, month } = parseMonthKey(key)
  return new Date(year, month - 1, 1).toLocaleDateString('en-MY', { month: style, year: 'numeric' })
}

function defaultPeriod(key) {
  const { year, month } = parseMonthKey(key)
  return {
    startDate: toISODate(new Date(year, month - 1, 1)),
    endDate: toISODate(new Date(year, month, 0)),
  }
}

export function emptyData() {
  return {
    version: SCHEMA_VERSION,
    settings: { split: { ...DEFAULT_SPLIT }, currency: 'RM' },
    currentMonth: monthKeyOf(),
    months: {},
  }
}

// A brand-new month, either blank (suggested category names) or carried over
// from a previous month: same incomes and category budgets, spending reset.
export function createMonth(key, copyFrom) {
  const base = { id: uid(), key, ...defaultPeriod(key) }
  if (copyFrom) {
    const month = {
      ...base,
      incomes: copyFrom.incomes.map((i) => ({ ...i, id: uid(), payday: '' })),
    }
    for (const g of GROUPS) month[g] = copyFrom[g].map((i) => ({ ...i, id: uid(), spent: 0 }))
    return month
  }
  const month = {
    ...base,
    incomes: [{ id: uid(), name: 'Salary', payday: '', amount: 0 }],
  }
  for (const g of GROUPS) {
    month[g] = CATEGORY_SUGGESTIONS[g]
      .filter((n) => n !== 'Others')
      .map((name) => ({ id: uid(), name, budget: 0, spent: 0 }))
  }
  return month
}

const items = (rows) => rows.map(([name, budget, spent]) => ({ id: uid(), name, budget, spent }))

// The worked example from the sheet (February 2024)
export function sampleData() {
  const key = '2024-02'
  return {
    ...emptyData(),
    currentMonth: key,
    months: {
      [key]: {
        id: uid(),
        key,
        startDate: '2024-02-01',
        endDate: '2024-02-29',
        incomes: [
          { id: uid(), name: 'Paycheck 1', payday: '2024-02-25', amount: 3500 },
          { id: uid(), name: 'Side hustle 1', payday: '2024-02-26', amount: 1200 },
          { id: uid(), name: 'Side hustle 2', payday: '2024-02-27', amount: 800 },
        ],
        needs: items([
          ['Rent', 500, 500],
          ['Electricity bill', 100, 60],
          ['Water bill', 20, 15],
          ['Transportation', 100, 100],
          ['Petrol', 300, 300],
          ['Insurance', 1000, 1000],
          ['Groceries', 400, 400],
          ['Wifi', 50, 50],
          ['Mobile plan', 30, 30],
        ]),
        wants: items([
          ['Eating out', 600, 545],
          ['Shopping', 300, 300],
          ['Self-pampering', 400, 350],
          ['Entertainment', 50, 50],
          ['Subscriptions', 100, 100],
          ['Gifts', 50, 0],
        ]),
        savings: items([
          ['Emergency fund', 400, 400],
          ['Cash savings', 300, 200],
          ['Investments', 300, 600],
        ]),
      },
    },
  }
}

// Accepts anything that came out of storage or an import file and returns a
// well-formed data object (or throws if it is clearly not ours).
export function normalizeData(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.months !== 'object') {
    throw new Error('Not a Jejak Bajet backup file')
  }
  const base = emptyData()
  const data = {
    version: SCHEMA_VERSION,
    settings: { ...base.settings, ...raw.settings, split: { ...base.settings.split, ...raw.settings?.split } },
    currentMonth: typeof raw.currentMonth === 'string' ? raw.currentMonth : base.currentMonth,
    months: {},
  }
  for (const [key, m] of Object.entries(raw.months)) {
    if (!/^\d{4}-\d{2}$/.test(key) || !m) continue
    const period = defaultPeriod(key)
    const month = { id: m.id || uid(), key, startDate: m.startDate || period.startDate, endDate: m.endDate || period.endDate }
    month.incomes = (m.incomes || []).map((i) => ({ id: i.id || uid(), name: String(i.name ?? ''), payday: i.payday || '', amount: Number(i.amount) || 0 }))
    for (const g of GROUPS) {
      month[g] = (m[g] || []).map((i) => ({ id: i.id || uid(), name: String(i.name ?? ''), budget: Number(i.budget) || 0, spent: Number(i.spent) || 0 }))
    }
    data.months[key] = month
  }
  return data
}
