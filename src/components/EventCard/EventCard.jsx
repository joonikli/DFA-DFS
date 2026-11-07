// Figma: Components › Event card (node 1126:14497)
// Variants (Color =): pink-default | blue | green (tag colors — driven by data here),
// Hover (CSS :hover), Color7 / admin view (admin "15 Registered" CTA), empty (EventCardEmpty).
import { Users } from 'lucide-react'
import { MONTHS, formatTimeRange } from '../../lib/dates.js'
import Tags from '../Tags/Tags.jsx'
import RecommendedTag from '../RecommendedTag/RecommendedTag.jsx'
import LogisticsAtom from '../LogisticsAtom/LogisticsAtom.jsx'
import './EventCard.css'

/**
 * @param {object}   event       see src/mock/events.js
 * @param {ReactNode} cta        right-aligned actions (usually <EventCta/>)
 * @param {'list'|'grid'} layout list = Figma card, grid = compact card for the grid toggle
 * @param {number}   [registeredCount] renders the admin-view "N Registered" pill instead of `cta`
 */
export default function EventCard({ event, cta, layout = 'list', registeredCount, onOpen }) {
  const { start, end } = event
  return (
    <article
      className={`event-card event-card--${layout} ${onOpen ? 'event-card--clickable' : ''}`}
      onClick={onOpen}
    >
      <div className="event-card__time">
        <p className="event-card__month text-subheading">{MONTHS[start.getMonth()]}</p>
        <p className="event-card__day text-label-large">{start.getDate()}</p>
        <p className="event-card__hours text-label-2">{formatTimeRange(start, end)}</p>
      </div>

      <div className="event-card__divider" aria-hidden="true" />

      <div className="event-card__content">
        <div className="event-card__header">
          <div className="event-card__top">
            <div className="event-card__title">
              <h3 className="text-heading-2">{event.title}</h3>
              {event.recommended && <RecommendedTag icon={false} />}
            </div>
            {/* stopPropagation so CTA clicks don't also open the card */}
            <div className="event-card__actions" onClick={(e) => e.stopPropagation()}>
              {registeredCount != null ? (
                <span className="event-card__registered text-label-2">
                  <Users size={17} strokeWidth={1.5} aria-hidden="true" />
                  {registeredCount} Registered
                </span>
              ) : null}
              {cta}
            </div>
          </div>
          <LogisticsAtom items={[event.location, event.distance]} />
        </div>

        <div className="event-card__bottom">
          <p className="event-card__desc text-body">{event.description}</p>
          <div className="event-card__tags">
            {event.tags.map((t) => (
              <Tags key={t.label} color={t.tone}>
                {t.label}
              </Tags>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

/** Figma: Event card › Color=empty */
export function EventCardEmpty({ icon: Icon, children }) {
  return (
    <div className="event-card event-card--empty">
      <div className="event-card__empty-icon">
        <Icon size={32} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="event-card__empty-text text-body">{children}</p>
    </div>
  )
}
