// Budget math, mirroring the formulas in the original 50/30/20 sheet.
// Cell references in comments point back to that sheet.

export const GROUPS = ['needs', 'wants', 'savings']

export const GROUP_META = {
  needs: { label: 'Needs', longLabel: 'Needs' },
  wants: { label: 'Wants', longLabel: 'Wants' },
  savings: { label: 'Savings', longLabel: 'Investments / Savings' },
}

// T15:T17
export const DEFAULT_SPLIT = { needs: 0.5, wants: 0.3, savings: 0.2 }

// Dropdown lists from the sheet's data validation (B27:B40, H27:H40, M27:M40)
export const CATEGORY_SUGGESTIONS = {
  needs: ['Rent', 'Electricity bill', 'Water bill', 'Transportation', 'Petrol', 'Insurance', 'Groceries', 'Wifi', 'Mobile plan', 'Others'],
  wants: ['Eating out', 'Shopping', 'Self-pampering', 'Entertainment', 'Subscriptions', 'Gifts', 'Others'],
  savings: ['Emergency fund', 'Cash savings', 'Investments'],
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
const sum = (list, key) => list.reduce((s, x) => s + num(x[key]), 0)
// Excel's IFERROR(a/b, "") — null when the ratio is undefined
const ratio = (a, b) => (b ? a / b : null)

const MESSAGES = {
  overall: { over: '⛔ Overlimit! Time to reassess your spending', ok: '😊👍 No overspending here' },
  needs: { over: "🚨 Funds are lookin' tight", ok: '😊👍 So far, so good' },
  wants: { over: '⛔ Omg, stop spending pls', ok: '😊👍 So far, so good' },
}

function groupStatus(group, usage) {
  if (usage === null) return null
  if (group === 'savings') {
    // P25: hitting the savings target is the good outcome
    return usage >= 1
      ? { tone: 'good', text: '🚀 Look atchu big investor/saver!' }
      : { tone: 'bad', text: '⚠️ Your investments/savings need attention!' }
  }
  // B25 / H25
  return usage >= 1 ? { tone: 'bad', text: MESSAGES[group].over } : { tone: 'good', text: MESSAGES[group].ok }
}

// Conditional formatting on U6:U9 / F23 / K23 / P23
export function remainingTone(group, remaining) {
  if (group === 'savings') return remaining > 0 ? 'bad' : 'good'
  if (remaining < 0) return 'bad'
  if (remaining > 0) return 'good'
  return 'neutral'
}

export function computeMonth(month, split = DEFAULT_SPLIT) {
  const totalIncome = sum(month.incomes, 'amount') // E18

  const groups = {}
  for (const g of GROUPS) {
    const items = month[g]
    const recommended = totalIncome * num(split[g]) // F22 / K22 / P22, S6:S8
    const spent = sum(items, 'spent') // E41 / J41 / O41, T6:T8
    const planned = sum(items, 'budget') // C41 / I41 / N41
    const remaining = recommended - spent // F23 / K23 / P23, U6:U8
    const usage = ratio(spent, recommended)
    groups[g] = {
      recommended,
      spent,
      planned,
      remaining,
      usage,
      targetShare: num(split[g]),
      status: groupStatus(g, usage),
      remainingTone: remainingTone(g, remaining),
    }
  }

  const totalRecommended = GROUPS.reduce((s, g) => s + groups[g].recommended, 0) // S9
  const totalSpent = GROUPS.reduce((s, g) => s + groups[g].spent, 0) // T9
  const totalRemaining = totalRecommended - totalSpent // U9

  // U15:U17 — each group's share of everything spent
  for (const g of GROUPS) groups[g].share = ratio(groups[g].spent, totalSpent)

  // T10
  const overallUsage = ratio(totalSpent, totalRecommended)
  const overall =
    overallUsage === null
      ? null
      : overallUsage >= 1
        ? { tone: 'bad', text: MESSAGES.overall.over }
        : { tone: 'good', text: MESSAGES.overall.ok }

  return {
    totalIncome,
    totalRecommended,
    totalSpent,
    totalRemaining,
    totalRemainingTone: remainingTone('total', totalRemaining),
    overall,
    groups,
  }
}
