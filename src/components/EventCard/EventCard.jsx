// Figma: Components › Event card (node 1126:14497)
// Variants (Color =): pink-default | blue | green (tag colors — driven by data here),
// Hover (CSS :hover), Color7 / admin view (admin "15 Registered" CTA), empty (EventCardEmpty).
import { Clock, MapPin, Users } from 'lucide-react'
import { MONTHS, formatTimeRange } from '../../lib/dates.js'
import Tags from '../Tags/Tags.jsx'
import RecommendedTag from '../RecommendedTag/RecommendedTag.jsx'
import './EventCard.css'

/**
 * @param {object}   event       see src/mock/events.js
 * @param {ReactNode} cta        right-aligned actions (usually <EventCta/>)
 * @param {'list'|'grid'} layout list = Figma card, grid = card for the grid toggle (see GridCard)
 * @param {number}   [registeredCount] renders the admin-view "N Registered" pill instead of `cta`
 * @param {string}   [flag]      short tag beside the title, e.g. "Newly saved"
 */
export default function EventCard({ event, cta, layout = 'list', registeredCount, onOpen, flag }) {
  const { start, end } = event
  if (layout === 'grid') return <GridCard {...{ event, cta, registeredCount, onOpen, flag }} />
  return (
    <article
      className={`event-card event-card--${layout} ${onOpen ? 'event-card--clickable' : ''}`}
      onClick={onOpen}
    >
      {/* Direction D "Quiet column": quiet month / day / weekday; the time moves into the meta row */}
      <div className="event-card__time">
        <p className="event-card__month">{MONTHS[start.getMonth()].slice(0, 3)}</p>
        <p className="event-card__day">{start.getDate()}</p>
        <p className="event-card__weekday">{start.toLocaleDateString('en-US', { weekday: 'short' })}</p>
      </div>

      <div className="event-card__divider" aria-hidden="true" />

      <div className="event-card__content">
        <div className="event-card__header">
          <div className="event-card__top">
            <div className="event-card__title">
              <h3 className="text-heading-2">{event.title}</h3>
              {flag && <span className="event-card__flag text-label-2">{flag}</span>}
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
          <div className="event-card__meta text-body">
            <span className="event-card__meta-time">
              <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
              {formatTimeRange(start, end)}
            </span>
            <span className="event-card__meta-loc">
              <MapPin size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>{[event.location, event.distance].filter(Boolean).join(' · ')}</span>
            </span>
          </div>
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

/**
 * Grid view card. The final Event card component has no grid variant, so the
 * structure follows the only grid design in the file — Mid-fi › "V3 - Events -
 * Upcoming - Grid View" (753:7395): date → title → location · time → tags →
 * 2-line description → actions pinned to the bottom (primary left, save right).
 * Styling (type, tags, CTAs, border, shadow) comes from the final Event card.
 */
function GridCard({ event, cta, registeredCount, onOpen, flag }) {
  const { start, end } = event
  return (
    <article className={`event-card event-card--grid ${onOpen ? 'event-card--clickable' : ''}`} onClick={onOpen}>
      <div className="event-card__grid-head">
        <p className="event-card__grid-date text-body">
          {MONTHS[start.getMonth()]} {start.getDate()}
        </p>
        <h3 className="event-card__grid-title text-heading-2">{event.title}</h3>
        {(flag || event.recommended) && (
          <div className="event-card__grid-badges">
            {flag && <span className="event-card__flag text-label-2">{flag}</span>}
            {event.recommended && <RecommendedTag icon={false} />}
          </div>
        )}
      </div>

      {/* Mid-fi "logistics": pin + location, clock + time */}
      <div className="event-card__grid-logistics text-body">
        <span>
          <MapPin size={16} strokeWidth={1.75} aria-hidden="true" />
          {event.location}
        </span>
        <span>
          <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
          {formatTimeRange(start, end)}
        </span>
      </div>

      <div className="event-card__tags">
        {event.tags.map((t) => (
          <Tags key={t.label} color={t.tone}>
            {t.label}
          </Tags>
        ))}
      </div>

      <p className="event-card__desc text-body">{event.description}</p>

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
