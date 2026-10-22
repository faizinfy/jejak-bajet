import { useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { DEFAULT_SPLIT, GROUPS, GROUP_META } from '../lib/budget.js'
import { emptyData, monthLabel, sampleData } from '../lib/model.js'
import GroupIcon from '../components/GroupIcon.jsx'
import { IconBack, IconShare } from '../components/Icons.jsx'
import { isStandalone } from '../components/InstallHint.jsx'

const toPct = (split) => Object.fromEntries(GROUPS.map((g) => [g, String(Math.round(split[g] * 1000) / 10)]))

function SplitEditor() {
  const { settings, setSplit } = useStore()
  const [pct, setPct] = useState(() => toPct(settings.split))
  const total = GROUPS.reduce((s, g) => s + (parseFloat(pct[g]) || 0), 0)
  const valid = Math.abs(total - 100) < 0.01
  const changed = GROUPS.some((g) => (parseFloat(pct[g]) || 0) / 100 !== settings.split[g])

  return (
    <section className="card">
      <h2 className="card-title">Budget split</h2>
      <p className="muted small">How much of your income goes to each category. Must add up to 100%.</p>
      <div className="split-inputs">
        {GROUPS.map((g) => (
          <label key={g} className="field">
            <span>
              <GroupIcon group={g} size="sm" />
              {GROUP_META[g].label}
            </span>
            <div className="money-input">
              <input
                type="text"
                inputMode="decimal"
                value={pct[g]}
                onChange={(e) => setPct({ ...pct, [g]: e.target.value.replace(/[^0-9.]/g, '') })}
              />
              <span className="money-suffix">%</span>
            </div>
          </label>
        ))}
      </div>
      <p className={`small ${valid ? 'muted' : 'tone-bad'}`}>Total: {Math.round(total * 10) / 10}%</p>
      <div className="row-buttons">
        <button
          type="button"
          className="btn primary"
          disabled={!valid || !changed}
          onClick={() => setSplit(Object.fromEntries(GROUPS.map((g) => [g, (parseFloat(pct[g]) || 0) / 100])))}
        >
          Save split
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setPct(toPct(DEFAULT_SPLIT))
            setSplit({ ...DEFAULT_SPLIT })
          }}
        >
          Reset to 50/30/20
        </button>
      </div>
    </section>
  )
}

async function exportBackup(data) {
  const name = `jejak-bajet-backup-${new Date().toISOString().slice(0, 10)}.json`
  const file = new File([JSON.stringify(data, null, 2)], name, { type: 'application/json' })
  // On iPhone the share sheet lets you save to Files, AirDrop or email it
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Jejak Bajet backup' })
      return
    } catch (err) {
      if (err.name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function Settings({ onBack }) {
  const { data, monthKey, month, replaceAll, deleteMonth } = useStore()
  const fileRef = useRef(null)
  const [message, setMessage] = useState('')

  const importFile = async (file) => {
    try {
      replaceAll(JSON.parse(await file.text()))
      setMessage('Backup restored.')
    } catch (err) {
      setMessage(`Could not import: ${err.message}`)
    }
  }

  return (
    <>
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}>
          <IconBack />
        </button>
        <h1 className="topbar-title">Settings</h1>
        <span className="icon-btn-spacer" />
      </header>

      <main className="content view">
        <SplitEditor />

        {!isStandalone() && (
          <section className="card">
            <h2 className="card-title">Add to iPhone Home Screen</h2>
            <ol className="steps small">
              <li>Open this page in Safari.</li>
              <li>
                Tap <IconShare className="inline-icon" /> <b>Share</b>.
              </li>
              <li>
                Choose <b>Add to Home Screen</b>, then <b>Add</b>.
              </li>
            </ol>
          </section>
        )}

        <section className="card">
          <h2 className="card-title">Your data</h2>
          <p className="muted small">
            Saved on this device only. Export a backup now and then — clearing Safari data removes it.
          </p>
          <div className="stack-buttons">
            <button type="button" className="btn" onClick={() => exportBackup(data)}>
              Export backup
            </button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              Import backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f && window.confirm('Replace all current data with this backup?')) importFile(f)
              }}
            />
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (window.confirm('Replace all current data with the sample budget (February 2024)?')) {
                  replaceAll(sampleData())
                  onBack()
                }
              }}
            >
              Load sample data
            </button>
            {month && (
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  if (window.confirm(`Delete the budget for ${monthLabel(monthKey)}?`)) {
                    deleteMonth(monthKey)
                    onBack()
                  }
                }}
              >
                Delete {monthLabel(monthKey)}
              </button>
            )}
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (window.confirm('Delete ALL months and settings? This cannot be undone.')) {
                  replaceAll(emptyData())
                  onBack()
                }
              }}
            >
              Delete all data
            </button>
          </div>
          {message && <p className="small">{message}</p>}
        </section>

        <p className="disclaimer muted small">
          Jejak Bajet · 50/30/20 budget · For educational purposes only and not financial advice.
        </p>
      </main>
    </>
  )
}
