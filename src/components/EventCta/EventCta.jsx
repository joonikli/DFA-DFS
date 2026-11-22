// Figma: Components › Event-cta (node 1366:16905)
// Variants (Register =): Upcoming | Saved | Registered | Registered save | attend save | attend no save
// Here the variant is derived from two props: `status` and `saved`.
import Button from '../Button/Button.jsx'
import Saved from '../Saved/Saved.jsx'
import './EventCta.css'

/**
 * @param {'open'|'registered'|'attended'|'cancelled'} status
 * @param {boolean} saved
 */
export default function EventCta({ status = 'open', saved = false, onToggleSaved, onRegister, onUnregister }) {
  return (
    <div className="event-cta" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Saved selected={saved} onClick={onToggleSaved} />
      {status === 'open' && (
        <Button size="sm" icon="plus" onClick={onRegister}>
          Register
        </Button>
      )}
      {status === 'registered' && (
        <Button size="sm" icon="minus" className="event-cta__registered" onClick={onUnregister} title="Cancel registration">
          Registered
        </Button>
      )}
      {(status === 'attended' || status === 'cancelled') && (
        <Button size="sm" className="event-cta__attended" disabled>
          {status === 'cancelled' ? 'Cancelled' : 'Attended'}
        </Button>
      )}
    </div>
  )
}
