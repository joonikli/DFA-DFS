// Figma: Components › event header (node 1959:21380)
//   = Event subcategories (node 1354:13796) row + a stack of Event cards.
import './EventHeader.css'

export function EventSubcategories({ label, count }) {
  return (
    // data-flip lets list pages animate the sublabel sliding when cards above it leave
    <div className="event-subcategories text-body" data-flip={`label-${label}`}>
      <span>{label}</span>
      <span>
        {count} {count === 1 ? 'Event' : 'Events'}
      </span>
    </div>
  )
}

export default function EventHeader({ label, count, layout = 'list', children }) {
  return (
    <section className="event-header" aria-label={label}>
      <EventSubcategories label={label} count={count} />
      <div className={`event-header__cards event-header__cards--${layout}`}>{children}</div>
    </section>
  )
}
