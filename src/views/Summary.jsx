import { useStore } from '../store.jsx'
import { GROUPS, GROUP_META } from '../lib/budget.js'
import { money } from '../lib/format.js'
import { SplitBars, TargetBars } from '../components/Charts.jsx'
import GroupIcon from '../components/GroupIcon.jsx'
import InstallHint from '../components/InstallHint.jsx'
import Status from '../components/Status.jsx'

export default function Summary({ goTo }) {
  const { month, summary, settings, patchMonth } = useStore()
  const cur = settings.currency

  return (
    <div className="view">
      <InstallHint />

      <section className="card hero">
        <div className="hero-label">Remaining this month</div>
        <div className={`hero-value tone-${summary.totalRemainingTone}`}>{money(summary.totalRemaining, cur)}</div>
        <div className="hero-sub muted">
          Spent {money(summary.totalSpent, cur)} of {money(summary.totalRecommended, cur)}
        </div>
        <Status status={summary.overall} />
        <div className="period">
          <label>
            <span>Start date</span>
            <input type="date" value={month.startDate} onChange={(e) => patchMonth({ startDate: e.target.value })} />
          </label>
          <span className="period-to muted">to</span>
          <label>
            <span>End date</span>
            <input type="date" value={month.endDate} onChange={(e) => patchMonth({ endDate: e.target.value })} />
          </label>
        </div>
      </section>

      {summary.totalIncome === 0 ? (
        <section className="card callout">
          <p>
            <strong>💰 Add your income first.</strong> Your recommended budgets are worked out from your income after
            tax and deductions.
          </p>
          <button type="button" className="btn primary" onClick={() => goTo('income')}>
            Add income
          </button>
        </section>
      ) : (
        <>
          <section className="card">
            <h2 className="card-title">Recommended budget vs amount spent</h2>
            <TargetBars summary={summary} currency={cur} />
          </section>

          <section className="card">
            <h2 className="card-title">Breakdown of amount spent</h2>
            <SplitBars summary={summary} />
          </section>
        </>
      )}

      <section className="card">
        <h2 className="card-title">Monthly summary ({cur})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="num">Recommended</th>
              <th className="num">Spent</th>
              <th className="num">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => {
              const s = summary.groups[g]
              return (
                <tr key={g} className="clickable" onClick={() => goTo(g)}>
                  <td>
                    <GroupIcon group={g} size="sm" />
                    {GROUP_META[g].label}
                  </td>
                  <td className="num">{money(s.recommended, '')}</td>
                  <td className="num">{money(s.spent, '')}</td>
                  <td className={`num tone-${s.remainingTone}`}>{money(s.remaining, '')}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="num">{money(summary.totalRecommended, '')}</td>
              <td className="num">{money(summary.totalSpent, '')}</td>
              <td className={`num tone-${summary.totalRemainingTone}`}>{money(summary.totalRemaining, '')}</td>
            </tr>
          </tfoot>
        </table>
        <p className="muted small legend-note">
          <span className="tone-good">Green</span> = doing good · <span className="tone-bad">Red</span> = attention
          needed
        </p>
      </section>

      <p className="disclaimer muted small">
        For educational purposes only and not financial advice.
      </p>
    </div>
  )
}
