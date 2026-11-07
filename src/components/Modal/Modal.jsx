// Popup shell shared by every Figma popup (event-registration-popup, Post-event popup,
// event-survey-popup, Create a report …): white card, gray border, 16px radius.
// Closes on Escape or backdrop click.
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './Modal.css'

/**
 * @param {number} width       card width in px (Figma frame width)
 * @param {string} [title]     Heading 2 title; omit for popups whose header is custom
 * @param {ReactNode} [subtitle]
 */
export default function Modal({ open, onClose, title, subtitle, width = 750, padding = '24px 28px 32px', children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        style={{ width, padding }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          {title ? <h2 className="text-heading-2">{title}</h2> : <span />}
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <X size={24} strokeWidth={1.75} />
          </button>
        </div>
        {subtitle && <div className="modal__subtitle text-body">{subtitle}</div>}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
