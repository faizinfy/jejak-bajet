import { GROUPS, GROUP_META } from '../lib/budget.js'
import { money, percent } from '../lib/format.js'

// "Recommended budget vs amount spent" — one bar per group on a shared scale.
// The wash is the recommended budget, the solid bar is what was spent.
export function TargetBars({ summary, currency }) {
  const max = Math.max(1, ...GROUPS.flatMap((g) => [summary.groups[g].recommended, summary.groups[g].spent]))
  const pct = (v) => `${Math.min(100, (v / max) * 100)}%`

  return (
    <div className="tbars">
      {GROUPS.map((g) => {
        const s = summary.groups[g]
        const label = `${GROUP_META[g].label}: spent ${money(s.spent, currency)} of ${money(s.recommended, currency)} recommended`
        return (
          <div key={g} className="tbar-row" title={label} aria-label={label}>
            <div className="tbar-head">
              <span className="tbar-name">
                <span className={`swatch swatch-${g}`} />
                {GROUP_META[g].label}
              </span>
              <span className="tbar-values">
                <strong>{money(s.spent, currency)}</strong>
                <span className="muted"> / {money(s.recommended, currency)}</span>
              </span>
            </div>
            <div className="tbar-track">
              <div className={`tbar-target fill-${g}`} style={{ width: pct(s.recommended) }} />
              <div className={`tbar-spent fill-${g}`} style={{ width: pct(s.spent) }} />
              {s.recommended > 0 && <div className="tbar-tick" style={{ left: pct(s.recommended) }} />}
            </div>
          </div>
        )
      })}
      <div className="legend">
        <span>
          <span className="legend-key key-solid" /> Amount spent
        </span>
        <span>
          <span className="legend-key key-wash" /> Recommended budget
        </span>
      </div>
    </div>
  )
}

function StackBar({ label, shares }) {
  const parts = GROUPS.filter((g) => shares[g] > 0)
  return (
    <div className="stack-row">
      <span className="stack-label">{label}</span>
      <div className="stack-bar">
        {parts.length === 0 ? (
          <div className="stack-empty" />
        ) : (
          parts.map((g) => (
            <div
              key={g}
              className={`stack-seg fill-${g}`}
              style={{ flexGrow: shares[g] }}
              title={`${GROUP_META[g].label}: ${percent(shares[g])}`}
            />
          ))
        )}
      </div>
    </div>
  )
}

// "Breakdown of amount spent (%)" — actual split of spending vs the target split.
export function SplitBars({ summary }) {
  const actual = Object.fromEntries(GROUPS.map((g) => [g, summary.groups[g].share || 0]))
  const target = Object.fromEntries(GROUPS.map((g) => [g, summary.groups[g].targetShare]))

  return (
    <div className="split">
      <StackBar label="Actual" shares={actual} />
      <StackBar label="Target" shares={target} />
      <table className="split-table">
        <thead>
          <tr>
            <th />
            <th>Actual</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          {GROUPS.map((g) => (
            <tr key={g}>
              <td>
                <span className={`swatch swatch-${g}`} />
                {GROUP_META[g].label}
              </td>
              <td className="num">{percent(summary.groups[g].share)}</td>
              <td className="num muted">{percent(summary.groups[g].targetShare, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
