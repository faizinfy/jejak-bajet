import { useStore } from '../store.jsx'
import { monthLabel, shiftMonthKey } from '../lib/model.js'
import { IconChevron } from './Icons.jsx'

export default function MonthBar() {
  const { monthKey, setCurrentMonth } = useStore()

  return (
    <div className="monthbar">
      <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => setCurrentMonth(shiftMonthKey(monthKey, -1))}>
        <IconChevron dir="left" />
      </button>
      <label className="month-label">
        <span>{monthLabel(monthKey)}</span>
        <input
          type="month"
          aria-label="Pick a month"
          value={monthKey}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker?.()
            } catch {
              // not supported; native focus behaviour applies
            }
          }}
          onChange={(e) => e.target.value && setCurrentMonth(e.target.value)}
        />
      </label>
      <button type="button" className="icon-btn" aria-label="Next month" onClick={() => setCurrentMonth(shiftMonthKey(monthKey, 1))}>
        <IconChevron />
      </button>
    </div>
  )
}
