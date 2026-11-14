// Figma: Components › Event-calendar (node 1366:18162) + Calendar Tags (node 1354:15001)
// Month grid with dots: light purple = any event that day, dark purple = one you're registered for.
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS, sameDay } from '../../lib/dates.js'
import CalendarKey from '../CalendarKey/CalendarKey.jsx'
import './EventCalendar.css'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export function CalendarTags({ tone, children }) {
  return (
    <span className="calendar-tags text-label-2">
      <span className={`calendar-dot calendar-dot--${tone}`} aria-hidden="true" />
      {children}
    </span>
  )
}

/**
 * @param {Date} month           any date inside the month to show
 * @param {(d: Date) => ('registered'|'event'|null)} dotFor
 * @param {Date} selected        highlighted day (black circle)
 * @param {{tone: 'event'|'registered', label: string}[] | null} [legend]
 *        dot key, shown in an info popover next to the month name; pass null or [] to hide it
 */
const DEFAULT_LEGEND = [
  { tone: 'event', label: 'All Events' },
  { tone: 'registered', label: 'Registered Events' },
]

/**
 * variant="dashboard" matches the "Upcoming events" calendar on the volunteer.html /
 * manager.html dashboards (CalendarCard): today in purple bold, black circle only for
 * the picked day, dots under the number, dot key behind the info icon (darker dot first).
 * Needs `today` to mark today and grey out earlier days.
 */
export default function EventCalendar({ month, onMonthChange, dotFor, selected, onSelect, legend = DEFAULT_LEGEND, variant = 'default', today }) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstWeekday = new Date(year, m, 1).getDay()
  const daysInMonth = new Date(year, m + 1, 0).getDate()

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, m, i + 1)),
  ]
  while (cells.length % 7) cells.push(null)

  if (variant === 'dashboard') {
    const todayStart = today && new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const key = legend?.length ? [...legend].sort((a, b) => (a.tone === 'registered' ? -1 : 0) - (b.tone === 'registered' ? -1 : 0)) : []
    return (
      <div className="event-calendar event-calendar--dashboard">
        <div className="ecd-head">
          <button type="button" className="ecd-nav" onClick={() => onMonthChange(new Date(year, m - 1, 1))} aria-label="Previous month">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <span className="calendar-title">
            <span aria-live="polite">
              {MONTHS[m]} {year}
            </span>
            {key.length > 0 && (
              <CalendarKey>
                {key.map((l) => (
                  <span key={l.tone + l.label}>
                    <i className={`ecd-dot ecd-dot--${l.tone}`} aria-hidden="true" /> {l.label}
                  </span>
                ))}
              </CalendarKey>
            )}
          </span>
          <button type="button" className="ecd-nav" onClick={() => onMonthChange(new Date(year, m + 1, 1))} aria-label="Next month">
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        </div>
        <div className="ecd-grid ecd-dow">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="ecd-grid">
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />
            const dot = dotFor(date)
            const isSelected = selected && sameDay(date, selected)
            const isToday = today && sameDay(date, today)
            const isPast = todayStart && date < todayStart
            return (
              <button
                key={date.getDate()}
                type="button"
                className={`ecd-day${isToday ? ' today' : ''}${isSelected ? ' sel' : ''}${isPast ? ' past' : ''}`}
                aria-pressed={Boolean(isSelected)}
                aria-label={`${MONTHS[m]} ${date.getDate()}${dot ? ', has events' : ''}`}
                onClick={() => onSelect(date)}
              >
                {date.getDate()}
                {dot && <i className={`ecd-dot ecd-dot--${dot}`} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="event-calendar">
      <div className="event-calendar__head">
        <button type="button" className="event-calendar__nav" onClick={() => onMonthChange(new Date(year, m - 1, 1))} aria-label="Previous month">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <span className="calendar-title">
          <p className="text-subheading">
            {MONTHS[m]} {year}
          </p>
          {legend?.length > 0 && (
            <CalendarKey>
              {legend.map((l) => (
                <span key={l.tone + l.label}>
                  <span className={`calendar-dot calendar-dot--${l.tone}`} aria-hidden="true" /> {l.label}
                </span>
              ))}
            </CalendarKey>
          )}
        </span>
        <button type="button" className="event-calendar__nav" onClick={() => onMonthChange(new Date(year, m + 1, 1))} aria-label="Next month">
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>

      <div className="event-calendar__grid" role="grid" aria-label={`${MONTHS[m]} ${year}`}>
        {WEEKDAYS.map((d) => (
          <span key={d} className="event-calendar__weekday" role="columnheader">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />
          const dot = dotFor(date)
          const isSelected = selected && sameDay(date, selected)
          return (
            <button
              key={date.getDate()}
              type="button"
              role="gridcell"
              className={`event-calendar__day text-title-3 ${isSelected ? 'event-calendar__day--selected' : ''}`}
              aria-selected={isSelected}
              aria-label={`${MONTHS[m]} ${date.getDate()}${dot ? ', has events' : ''}`}
              onClick={() => onSelect(date)}
            >
              <span className={`calendar-dot ${dot ? `calendar-dot--${dot}` : 'calendar-dot--none'}`} aria-hidden="true" />
              <span className="event-calendar__num">{date.getDate()}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
