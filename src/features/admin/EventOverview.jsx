// Shared body of Figma "Single Event - Admin" (2324:46296 empty, 2324:46374 with volunteers)
// and the "Create event" preview (2324:46851).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronDown, Clock, Handshake, MapPin, MessageSquare, Pencil, Tag } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import Avatar from '../../components/Avatar/Avatar.jsx'
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx'
import { volunteersById } from '../../mock/volunteers.js'
import { PERSONAS } from '../../store/DemoStore.jsx'
import './EventOverview.css'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const t12 = (d) => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}${d.getHours() < 12 ? 'am' : 'pm'}`

export function EditButton({ onClick, label = 'Edit' }) {
  return (
    <button type="button" className="edit-btn" onClick={onClick}>
      <Pencil size={14} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </button>
  )
}

function OverviewStat({ label, value, unit }) {
  return (
    <div className="ov-stat">
      <p className="text-body ov-muted">{label}</p>
      <p className="ov-stat__value">
        <span className="text-heading-2">{value}</span>
        <span className="ov-stat__unit">{unit}</span>
      </p>
    </div>
  )
}

/** Right column "Event Details" (Figma "Event Details" component, node 1103:3539 group). */
export function EventDetails({ event, action }) {
  const organizer = event.organizer === 'me' ? `${PERSONAS.admin.fullName}` : event.organizer
  return (
    <aside className="ev-details">
      <div className="ev-details__head">
        <h2 className="text-heading-2">Event Details</h2>
        {action}
      </div>
      <ul className="ev-details__list text-label-2">
        <li>
          <Avatar size={28} tone="purple" />
          <span className="ev-details__strong">
            {organizer} {event.organizer === 'me' && <span className="ov-muted">(Me)</span>}
          </span>
        </li>
        <li>
          <CalendarDays size={20} strokeWidth={1.5} aria-hidden="true" />
          {WEEKDAYS[event.start.getDay()]}, {MONTHS[event.start.getMonth()]} {event.start.getDate()}
        </li>
        <li>
          <Clock size={20} strokeWidth={1.5} aria-hidden="true" />
          {t12(event.start)} - {t12(event.end)}
        </li>
        <li>
          <MapPin size={20} strokeWidth={1.5} aria-hidden="true" />
          {event.location || <span className="ov-muted">No location yet</span>}
        </li>
        <li>
          <Tag size={20} strokeWidth={1.5} aria-hidden="true" />
          <span className="ev-details__tags">
            {event.tags.length ? event.tags.map((t) => (
              <Tags key={t.label} color="purple">
                {t.label}
              </Tags>
            )) : <span className="ov-muted">No tags</span>}
          </span>
        </li>
      </ul>
    </aside>
  )
}

/**
 * Left column: title, description, stats, volunteers.
 * @param {boolean} preview  hides interactive extras (Create event preview)
 */
export function EventMain({ event, onEdit, onViewSurvey, preview }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const done = event.status === 'completed'
  const missing = event.surveyMissing || []

  return (
    <div className="ev-main">
      <div className="ev-main__head">
        <div className="ev-main__titles">
          <h1 className="ev-main__title">{event.name || event.title || 'Untitled event'}</h1>
          {event.name && event.name !== event.title && <p className="text-subheading ev-main__program">{event.title}</p>}
        </div>
        {onEdit && <EditButton onClick={onEdit} />}
      </div>

      <div className="ev-main__desc">
        <p className={`ev-main__desc-text ${expanded ? 'ev-main__desc-text--open' : ''}`}>
          {event.description || <span className="ov-muted">No description yet.</span>}
        </p>
        {event.description?.length > 220 && (
          <button
            type="button"
            className={`ev-main__more ${expanded ? 'ev-main__more--open' : ''}`}
            aria-label={expanded ? 'Show less' : 'Show more'}
            aria-expanded={expanded}
            onClick={() => setExpanded((x) => !x)}
          >
            <ChevronDown size={20} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="ev-main__stats">
        <OverviewStat label="Sign-up" value={event.signups.length} unit="volunteers" />
        <OverviewStat label="Surveys missing" value={`${missing.length}/${done ? event.signups.length : 0}`} unit="surveys" />
        {event.hasSurvey && (
          <Button color="secondary" size="sm" className="ev-main__survey-btn" onClick={onViewSurvey}>
            View survey
          </Button>
        )}
      </div>

      <section className="ev-main__volunteers">
        <div className="ev-main__vol-head">
          <h2 className="text-heading-2">Volunteers</h2>
          <button type="button" className="ev-main__msg-all text-body" onClick={() => !preview && navigate('/messages')}>
            Message all volunteers
            <MessageSquare size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        {event.signups.length ? (
          <ul className="ev-vol-list">
            {event.signups.map((id) => {
              const v = volunteersById[id]
              return (
                <li key={id} className="ev-vol">
                  <button
                    type="button"
                    className="ev-vol__who"
                    onClick={() => !preview && navigate(`/volunteers/${id}`)}
                    title={`View ${v.name}'s profile`}
                  >
                    <Avatar name={v.name} />
                    <span className="text-label-1">{v.name}</span>
                    <span className="ev-vol__role">Volunteer</span>
                  </button>
                  {done &&
                    (missing.includes(id) ? (
                      <StatusBadge color="red">Survey missing</StatusBadge>
                    ) : (
                      <StatusBadge color="green">Survey complete</StatusBadge>
                    ))}
                  <button type="button" className="ev-vol__msg" aria-label={`Message ${v.name}`} onClick={() => !preview && navigate('/messages')}>
                    <MessageSquare size={20} strokeWidth={1.5} />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="ev-vol-empty">
            <span className="ev-vol-empty__icon">
              <Handshake size={30} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="text-label-2">No volunteers have signed up yet</p>
          </div>
        )}
      </section>
    </div>
  )
}
