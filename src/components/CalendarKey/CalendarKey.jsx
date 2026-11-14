// Info button next to a calendar's month name. Tapping/clicking it opens a small
// popover with the dot-color key (children = the key rows, each a dot + label).
// Used by every calendar (legacy .cal markup and EventCalendar) so the key reads the same everywhere.
import { useEffect, useId, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import './CalendarKey.css'

export default function CalendarKey({ children, label = 'What do the calendar dots mean?' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus() }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span className="calendar-key" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`calendar-key__btn${open ? ' is-open' : ''}`}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Info size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <span id={panelId} role="note" className="calendar-key__panel" data-state={open ? 'open' : 'closed'} hidden={!open}>
        {children}
      </span>
    </span>
  )
}
