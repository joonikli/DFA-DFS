// Figma: Components › Event-cta (node 1366:16905)
// Variants (Register =): Upcoming | Saved | Registered | Registered save | attend save | attend no save
// Here the variant is derived from two props: `status` and `saved`.
import Button from '../Button/Button.jsx'
import Saved from '../Saved/Saved.jsx'
import './EventCta.css'

/**
 * @param {'open'|'registered'|'attended'} status
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
        <Button size="sm" icon="minus" onClick={onUnregister} title="Cancel registration">
          Registered
        </Button>
      )}
      {status === 'attended' && (
        <Button size="sm" disabled style={{ cursor: 'default' }}>
          Attended
        </Button>
      )}
    </div>
  )
}
