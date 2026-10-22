import { useState } from 'react'
import { IconShare } from './Icons.jsx'

const KEY = 'jejak-bajet:install-hint-dismissed'

export function isIOS() {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function wasDismissed() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// Shown in iPhone Safari only, until installed or dismissed.
export default function InstallHint() {
  const [hidden, setHidden] = useState(() => !isIOS() || isStandalone() || wasDismissed())
  if (hidden) return null

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // ignore
    }
    setHidden(true)
  }

  return (
    <section className="card install-hint">
      <div>
        <strong>Install on your iPhone</strong>
        <p className="small">
          Tap <IconShare className="inline-icon" /> <b>Share</b> in Safari, then <b>Add to Home Screen</b>.
        </p>
      </div>
      <button type="button" className="link-btn" onClick={dismiss}>
        Dismiss
      </button>
    </section>
  )
}
