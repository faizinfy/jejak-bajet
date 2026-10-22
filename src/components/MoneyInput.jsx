import { useState } from 'react'
import { parseAmount } from '../lib/format.js'

// Text input with a decimal keypad on iPhone. Keeps the raw text while typing
// and reports the parsed number upward.
export default function MoneyInput({ value, onChange, currency = 'RM', autoFocus, id, placeholder = '0' }) {
  const [text, setText] = useState(value ? String(value) : '')

  return (
    <div className="money-input">
      <span className="money-prefix">{currency}</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={text}
        onChange={(e) => {
          const t = e.target.value.replace(/[^0-9.]/g, '')
          setText(t)
          onChange(parseAmount(t))
        }}
      />
    </div>
  )
}
