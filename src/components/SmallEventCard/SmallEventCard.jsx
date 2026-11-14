// Figma: Components › Small events cards (node 2044:26625) + Logistics_molecule (node 1126:13200)
// Compact event row used in the dashboards' "Upcoming events" lists.
import { Clock, MapPin } from 'lucide-react'
import { MONTHS } from '../../lib/dates.js'
import './SmallEventCard.css'

const pad = (n) => String(n).padStart(2, '0')
const clock = (d) => `${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`
const ampm = (d) => (d.getHours() < 12 ? 'am' : 'pm')

/** "May 28, 6:00 - 8:00 pm" */
export function logisticsTime(start, end) {
  return `${MONTHS[start.getMonth()].slice(0, 3)} ${start.getDate()}, ${clock(start)} - ${clock(end)} ${ampm(end)}`
}

/** Figma: Logistics_molecule — icon + text lines at 70% opacity */
export function LogisticsMolecule({ items }) {
  return (
    <div className="logistics-molecule text-label-2">
      {items.map(({ icon: Icon, text }) => (
        <span key={text} className="logistics-molecule__row">
          <Icon size={14} strokeWidth={2} aria-hidden="true" />
          {text}
        </span>
      ))}
    </div>
  )
}

/**
 * @param {string} [subtitle]  bold line under the title (Figma shows the volunteer's shift, e.g. "8:45 - 9:45")
 */
export default function SmallEventCard({ event, subtitle, onClick, actions }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} className="small-event-card" onClick={onClick}>
      <div className="small-event-card__date">
        <span className="text-label-1">{MONTHS[event.start.getMonth()].slice(0, 3)}</span>
        <span className="small-event-card__day">{event.start.getDate()}</span>
      </div>
      <div className="small-event-card__body">
        <p className="small-event-card__title">{event.title}</p>
        {subtitle && <p className="small-event-card__subtitle">{subtitle}</p>}
        <LogisticsMolecule
          items={[
            { icon: Clock, text: logisticsTime(event.start, event.end) },
            { icon: MapPin, text: event.location },
          ]}
        />
      </div>
      {actions && <div className="small-event-card__actions">{actions}</div>}
    </Tag>
  )
}
