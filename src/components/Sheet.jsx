import { useEffect } from 'react'

// Bottom sheet used for every add/edit form.
export default function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('sheet-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('sheet-open')
    }
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <button type="button" className="link-btn" onClick={onClose}>
            Cancel
          </button>
          <h2>{title}</h2>
          <span className="sheet-head-spacer" />
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
