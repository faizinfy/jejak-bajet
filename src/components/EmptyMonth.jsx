import { useStore } from '../store.jsx'
import { monthLabel, sampleData } from '../lib/model.js'

export default function EmptyMonth() {
  const { data, monthKey, createMonth, replaceAll } = useStore()
  const keys = Object.keys(data.months).sort()
  // Carry over from the closest earlier month, or the latest one if none are earlier
  const source = keys.filter((k) => k < monthKey).pop() || keys[keys.length - 1]

  return (
    <div className="empty">
      <div className="empty-emoji">💸</div>
      <h1>No budget for {monthLabel(monthKey)} yet</h1>
      <p className="muted">
        Plan with the 50/30/20 rule: 50% of income for needs, 30% for wants and 20% for savings and investments.
      </p>
      <div className="stack-buttons">
        {source && (
          <button type="button" className="btn primary" onClick={() => createMonth(monthKey, source)}>
            Copy from {monthLabel(source)}
          </button>
        )}
        <button type="button" className={`btn ${source ? '' : 'primary'}`} onClick={() => createMonth(monthKey, null)}>
          Start a new budget
        </button>
        {keys.length === 0 && (
          <button type="button" className="btn ghost" onClick={() => replaceAll(sampleData())}>
            Try with sample data
          </button>
        )}
      </div>
      {source && <p className="muted small">Copying keeps your income and category budgets, and resets the amounts spent.</p>}
    </div>
  )
}
