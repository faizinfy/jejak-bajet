import { useState } from 'react'
import { useStore } from '../store.jsx'
import { CATEGORY_SUGGESTIONS, GROUP_META } from '../lib/budget.js'
import { money, percent } from '../lib/format.js'
import GroupIcon from '../components/GroupIcon.jsx'
import { IconPlus } from '../components/Icons.jsx'
import MoneyInput from '../components/MoneyInput.jsx'
import Sheet from '../components/Sheet.jsx'
import Status from '../components/Status.jsx'

function ItemSheet({ group, item, currency, onSave, onDelete, onClose }) {
  const [name, setName] = useState(item?.name || '')
  const [budget, setBudget] = useState(item?.budget || 0)
  const [spent, setSpent] = useState(item?.spent || 0)
  const listId = `suggest-${group}`

  return (
    <Sheet title={item ? 'Edit category' : 'New category'} onClose={onClose}>
      {(close) => (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onSave({ ...item, name: name.trim(), budget, spent })
            close()
          }}
        >
          <label className="field">
            <span>Category</span>
            <input list={listId} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" autoFocus={!item} />
            <datalist id={listId}>
              {CATEGORY_SUGGESTIONS[group].map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Budget</span>
            <MoneyInput value={budget} onChange={setBudget} currency={currency} />
          </label>
          <label className="field">
            <span>Amount spent</span>
            <MoneyInput value={spent} onChange={setSpent} currency={currency} />
          </label>
          <button type="submit" className="btn primary" disabled={!name.trim()}>
            Save
          </button>
          {item && (
            <button type="button" className="btn danger" onClick={() => onDelete() && close()}>
              Delete category
            </button>
          )}
        </form>
      )}
    </Sheet>
  )
}

function SpendSheet({ item, currency, onSave, onClose }) {
  const [amount, setAmount] = useState(0)
  return (
    <Sheet title={`Add to ${item.name}`} onClose={onClose}>
      {(close) => (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!amount) return
            onSave(amount)
            close()
          }}
        >
          <label className="field">
            <span>Amount spent</span>
            <MoneyInput value={0} onChange={setAmount} currency={currency} autoFocus />
          </label>
          <p className="muted small">
            {money(item.spent, currency)} → <strong>{money(Number(item.spent) + amount, currency)}</strong>
            {item.budget > 0 && <> of {money(item.budget, currency)} budget</>}
          </p>
          <button type="submit" className="btn primary" disabled={!amount}>
            Add spending
          </button>
        </form>
      )}
    </Sheet>
  )
}

export default function Group({ group }) {
  const { month, summary, settings, saveRow, removeRow, addSpent } = useStore()
  const [editing, setEditing] = useState(null) // item, or {} for new
  const [spending, setSpending] = useState(null)
  const cur = settings.currency
  const meta = GROUP_META[group]
  const s = summary.groups[group]
  const items = month[group]
  const overPlanned = s.planned - s.recommended

  return (
    <div className="view">
      <section className="card">
        <h1 className="group-title">
          <GroupIcon group={group} />
          {meta.longLabel} <span className="muted">({percent(s.targetShare, 0)})</span>
        </h1>
        <dl className="stats">
          <div>
            <dt>Recommended</dt>
            <dd>{money(s.recommended, cur)}</dd>
          </div>
          <div>
            <dt>Spent</dt>
            <dd>{money(s.spent, cur)}</dd>
          </div>
          <div>
            <dt>Remainder</dt>
            <dd className={`tone-${s.remainingTone}`}>{money(s.remaining, cur)}</dd>
          </div>
          <div>
            <dt>Share of spending</dt>
            <dd>{percent(s.share)}</dd>
          </div>
        </dl>
        <Status status={s.status} />
        {summary.totalIncome === 0 && <p className="muted small">Add income to see your recommended budget.</p>}
      </section>

      <section className="card list-card">
        <ul className="items">
          {items.map((item) => {
            const usage = item.budget > 0 ? item.spent / item.budget : item.spent > 0 ? 1.01 : 0
            const over = item.spent > item.budget
            return (
              <li key={item.id} className="item">
                <button type="button" className="item-main" onClick={() => setEditing(item)}>
                  <div className="item-top">
                    <span className="item-name">{item.name || 'Untitled'}</span>
                    <span className="item-values">
                      <strong>{money(item.spent, cur)}</strong>
                      <span className="muted"> / {money(item.budget, cur)}</span>
                    </span>
                  </div>
                  <div className="meter">
                    <div className={`meter-fill ${over ? 'meter-over' : `fill-${group}`}`} style={{ width: `${Math.min(1, usage) * 100}%` }} />
                  </div>
                  {over && <div className="item-note tone-bad">Over budget by {money(item.spent - item.budget, cur)}</div>}
                </button>
                <button type="button" className="icon-btn add-spend" aria-label={`Add spending to ${item.name}`} onClick={() => setSpending(item)}>
                  <IconPlus />
                </button>
              </li>
            )
          })}
        </ul>
        <button type="button" className="btn ghost add-row" onClick={() => setEditing({})}>
          <IconPlus /> Add category
        </button>
        <div className="totals">
          <span>Total</span>
          <span>
            <strong>{money(s.spent, cur)}</strong>
            <span className="muted"> / {money(s.planned, cur)}</span>
          </span>
        </div>
      </section>

      {summary.totalIncome > 0 && (
        <p className={`small planned-note ${overPlanned > 0 ? 'tone-bad' : 'muted'}`}>
          Your category budgets add up to {money(s.planned, cur)}
          {overPlanned > 0
            ? ` — ${money(overPlanned, cur)} more than recommended.`
            : ` of the ${money(s.recommended, cur)} recommended.`}
        </p>
      )}

      {editing && (
        <ItemSheet
          group={group}
          item={editing.id ? editing : null}
          currency={cur}
          onClose={() => setEditing(null)}
          onSave={(row) => saveRow(group, row)}
          onDelete={() => {
            if (!window.confirm(`Delete "${editing.name}"?`)) return false
            removeRow(group, editing.id)
            return true
          }}
        />
      )}
      {spending && (
        <SpendSheet
          item={spending}
          currency={cur}
          onClose={() => setSpending(null)}
          onSave={(amount) => addSpent(group, spending.id, amount)}
        />
      )}
    </div>
  )
}
