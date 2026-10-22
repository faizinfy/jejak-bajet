import { useCallback, useEffect, useRef, useState } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Modal used for every add/edit form. Slides down from the top on open and
// back up on close. `children` can be a function that receives `close`, so a
// form can play the closing animation after saving.
export default function Sheet({ title, onClose, children }) {
  const [closing, setClosing] = useState(false)
  const closed = useRef(false)
  const finish = useCallback(() => {
    if (closed.current) return
    closed.current = true
    onClose()
  }, [onClose])

  const close = useCallback(() => {
    if (reducedMotion()) finish()
    else setClosing(true)
  }, [finish])

  // Fallback in case animationend never fires (e.g. the app was backgrounded)
  useEffect(() => {
    if (!closing) return
    const t = setTimeout(finish, 400)
    return () => clearTimeout(t)
  }, [closing, finish])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('sheet-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('sheet-open')
    }
  }, [close])

  return (
    <div className={`sheet-backdrop ${closing ? 'closing' : ''}`} onClick={close}>
      <div
        className={`sheet ${closing ? 'closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={(e) => closing && e.target === e.currentTarget && finish()}
      >
        <div className="sheet-head">
          <button type="button" className="link-btn" onClick={close}>
            Cancel
          </button>
          <h2>{title}</h2>
          <span className="sheet-head-spacer" />
        </div>
        <div className="sheet-body">{typeof children === 'function' ? children(close) : children}</div>
      </div>
    </div>
  )
}
