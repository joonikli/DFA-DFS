// Figma: Components › Event-calendar (node 1366:18162) + Calendar Tags (node 1354:15001)
// Month grid with dots: light purple = any event that day, dark purple = one you're registered for.
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS, sameDay } from '../../lib/dates.js'
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
 *        legend row under the month name; pass null or [] to hide it
 */
const DEFAULT_LEGEND = [
  { tone: 'event', label: 'All Events' },
  { tone: 'registered', label: 'Registered Events' },
]

export default function EventCalendar({ month, onMonthChange, dotFor, selected, onSelect, legend = DEFAULT_LEGEND }) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstWeekday = new Date(year, m, 1).getDay()
  const daysInMonth = new Date(year, m + 1, 0).getDate()

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, m, i + 1)),
  ]
  while (cells.length % 7) cells.push(null)

  return (
    <div className="event-calendar">
      <div className="event-calendar__head">
        <button type="button" className="event-calendar__nav" onClick={() => onMonthChange(new Date(year, m - 1, 1))} aria-label="Previous month">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <p className="text-subheading">
          {MONTHS[m]} {year}
        </p>
        <button type="button" className="event-calendar__nav" onClick={() => onMonthChange(new Date(year, m + 1, 1))} aria-label="Next month">
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>

      {legend?.length > 0 && (
        <div className="event-calendar__legend">
          {legend.map((l) => (
            <CalendarTags key={l.tone + l.label} tone={l.tone}>
              {l.label}
            </CalendarTags>
          ))}
        </div>
      )}

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
