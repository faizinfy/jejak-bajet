import { useState } from 'react'
import { useStore } from '../store.jsx'
import { GROUPS, GROUP_META } from '../lib/budget.js'
import { money, percent, shortDate } from '../lib/format.js'
import { IconPlus } from '../components/Icons.jsx'
import MoneyInput from '../components/MoneyInput.jsx'
import Sheet from '../components/Sheet.jsx'

function IncomeSheet({ income, currency, onSave, onDelete, onClose }) {
  const [name, setName] = useState(income?.name || '')
  const [payday, setPayday] = useState(income?.payday || '')
  const [amount, setAmount] = useState(income?.amount || 0)

  return (
    <Sheet title={income ? 'Edit income' : 'New income'} onClose={onClose}>
      {(close) => (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onSave({ ...income, name: name.trim(), payday, amount })
            close()
          }}
        >
          <label className="field">
            <span>Source</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paycheck, Side hustle" autoFocus={!income} />
          </label>
          <label className="field">
            <span>Payday</span>
            <input type="date" value={payday} onChange={(e) => setPayday(e.target.value)} />
          </label>
          <label className="field">
            <span>Received (after tax and deductions)</span>
            <MoneyInput value={amount} onChange={setAmount} currency={currency} />
          </label>
          <button type="submit" className="btn primary" disabled={!name.trim()}>
            Save
          </button>
          {income && (
            <button type="button" className="btn danger" onClick={() => onDelete() && close()}>
              Delete income
            </button>
          )}
        </form>
      )}
    </Sheet>
  )
}

export default function Income() {
  const { month, summary, settings, saveRow, removeRow } = useStore()
  const [editing, setEditing] = useState(null)
  const cur = settings.currency

  return (
    <div className="view">
      <section className="card hero">
        <div className="hero-label">💰 Income after tax and deductions</div>
        <div className="hero-value">{money(summary.totalIncome, cur)}</div>
        <dl className="stats stats-3">
          {GROUPS.map((g) => (
            <div key={g}>
              <dt>
                <span className={`swatch swatch-${g}`} />
                {GROUP_META[g].label} {percent(summary.groups[g].targetShare, 0)}
              </dt>
              <dd>{money(summary.groups[g].recommended, cur)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card list-card">
        <ul className="items">
          {month.incomes.map((inc) => (
            <li key={inc.id} className="item">
              <button type="button" className="item-main" onClick={() => setEditing(inc)}>
                <div className="item-top">
                  <span className="item-name">
                    {inc.name || 'Untitled'}
                    {inc.payday && <span className="muted small"> · {shortDate(inc.payday)}</span>}
                  </span>
                  <strong>{money(inc.amount, cur)}</strong>
                </div>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn ghost add-row" onClick={() => setEditing({})}>
          <IconPlus /> Add income
        </button>
        <div className="totals">
          <span>Total income</span>
          <strong>{money(summary.totalIncome, cur)}</strong>
        </div>
      </section>

      {editing && (
        <IncomeSheet
          income={editing.id ? editing : null}
          currency={cur}
          onClose={() => setEditing(null)}
          onSave={(row) => saveRow('incomes', row)}
          onDelete={() => {
            if (!window.confirm(`Delete "${editing.name}"?`)) return false
            removeRow('incomes', editing.id)
            return true
          }}
        />
      )}
    </div>
  )
}
