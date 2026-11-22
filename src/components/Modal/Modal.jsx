// Popup shell shared by every Figma popup (event-registration-popup, Post-event popup,
// event-survey-popup, Create a report …): white card, gray border, 16px radius.
// Closes on Escape or backdrop click.
import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './Modal.css'

/**
 * @param {number} width       card width in px (Figma frame width)
 * @param {string} [title]     Heading 2 title; omit for popups whose header is custom
 * @param {ReactNode} [subtitle]
 */
export default function Modal({ open, onClose, title, subtitle, width = 750, padding = '24px 28px 32px', children, footer, showClose = true, transitionName, onEscape, label }) {
  const panel = useRef(null)
  useLayoutEffect(() => {
    if (!open) return
    const opener = document.activeElement
    const dialog = panel.current
    const controls = () => [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')].filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
    const isTop = () => [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].at(-1) === dialog
    const keepFocus = (e) => {
      if (isTop() && !dialog.contains(e.target)) (controls()[0] || dialog).focus({ preventScroll: true })
    }
    const trapTab = (e) => {
      if (e.key !== 'Tab' || !isTop()) return
      const items = controls(), first = items[0], last = items.at(-1)
      if (!first) { e.preventDefault(); dialog.focus(); }
      else if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (!dialog.contains(document.activeElement)) (controls()[0] || dialog).focus({ preventScroll: true })
    document.addEventListener('focusin', keepFocus)
    dialog.addEventListener('keydown', trapTab)
    return () => {
      document.removeEventListener('focusin', keepFocus)
      dialog.removeEventListener('keydown', trapTab)
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && !e.defaultPrevented && (onEscape || onClose)()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, onEscape])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label || (typeof title === 'string' ? title : undefined)}
        style={{ width, padding, viewTransitionName: transitionName }}
        data-survey-step={transitionName ? '' : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title || showClose) && <div className="modal__header">
          {title ? <h2 className="text-heading-2">{title}</h2> : <span />}
          {showClose && <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <X size={24} strokeWidth={1.75} />
          </button>}
        </div>}
        {subtitle && <div className="modal__subtitle text-body">{subtitle}</div>}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
