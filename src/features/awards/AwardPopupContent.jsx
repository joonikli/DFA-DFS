import { useEffect, useId, useRef } from 'react'
import Button from '../../components/Button/Button.jsx'
import './AwardPopup.css'

// Final / Award popup / Post-event popup (2324:46147).
export default function AwardPopupContent({ name, onClose, onViewAwards }) {
  const headingId = useId()
  const panel = useRef(null)
  useEffect(() => {
    const opener = document.activeElement
    const frame = requestAnimationFrame(() => panel.current?.querySelector('button')?.focus({ preventScroll: true }))
    return () => { cancelAnimationFrame(frame); if (opener?.isConnected) opener.focus({ preventScroll: true }) }
  }, [])
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return
    const buttons = panel.current.querySelectorAll('button')
    const first = buttons[0], last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  return (
    <section className="award-popup" aria-labelledby={headingId} ref={panel} onKeyDown={trapFocus}>
      <header><button type="button" className="award-popup__close" aria-label="Close award popup" onClick={onClose}><img src="/assets/awards/popup-close.svg" alt="" aria-hidden="true" /></button></header>
      <div className="award-popup__art"><img src="/assets/awards/popup-badge.svg" alt="Volunteer award trophy" /></div>
      <h2 id={headingId}>You’re a Super Volunteer!</h2>
      <div className="award-popup__copy">
        <p>Hi {name}! We wanted to give you a token of appreciation for being in the top 15% of our volunteers this month.</p>
        <p>This is based on your volunteer hours, recognition, and dedicated work!</p>
      </div>
      <footer><Button color="tertiary" onClick={onClose}>Close</Button><Button onClick={onViewAwards}>See your awards</Button></footer>
    </section>
  )
}
