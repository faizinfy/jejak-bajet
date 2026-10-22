const moneyFmt = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

export function money(value, currency = 'RM') {
  const n = Number(value) || 0
  const sign = n < 0 ? '−' : ''
  return `${sign}${currency ? currency + ' ' : ''}${moneyFmt.format(Math.abs(n))}`
}

export function percent(value, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '–'
  return `${(value * 100).toFixed(digits).replace(/\.0+$/, '')}%`
}

export function shortDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
}

export function parseAmount(text) {
  const n = parseFloat(String(text).replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}
