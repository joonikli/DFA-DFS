// Figma: Components › Event-calendar (node 1366:18162) + Calendar Tags (node 1354:15001).
// Both variants and the legacy .cal calendars (styles.css) follow this one spec.
// Month grid with dots: light purple = any event that day, green = one you're registered for.
import { useRef } from 'react'
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
 * Needs `today` to mark today (the only day with a different number color).
 */
export default function EventCalendar({ month, onMonthChange, dotFor, selected, onSelect, legend = DEFAULT_LEGEND, variant = 'default', today }) {
  // Day → last dot tone seen, and whether that tone arrived by a change (register / unregister)
  // rather than on first render. Changed dots replay the TabNav "new" pulse; the flag sticks
  // until the tone changes again so unrelated re-renders don't cut the animation short.
  const seenDots = useRef(new Map())
  const dotChanged = (date, dot) => {
    const k = date.getTime()
    const prev = seenDots.current.get(k)
    if (!prev || prev.tone !== dot) seenDots.current.set(k, { tone: dot, pop: Boolean(prev) && Boolean(dot) })
    return seenDots.current.get(k).pop
  }

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
    const key = legend?.length ? [...legend].sort((a, b) => (a.tone === 'registered' ? -1 : 0) - (b.tone === 'registered' ? -1 : 0)) : []
    return (
      <div className="event-calendar event-calendar--dashboard">
        <div className="ecd-head">
          <button type="button" className="ecd-nav" onClick={() => onMonthChange(new Date(year, m - 1, 1))} aria-label="Previous month">
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <span className="calendar-title">
            <span className="text-subheading" aria-live="polite">
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
            <ChevronRight size={24} strokeWidth={2} />
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
            const pop = dotChanged(date, dot)
            const isSelected = selected && sameDay(date, selected)
            const isToday = today && sameDay(date, today)
            return (
              <button
                key={date.getDate()}
                type="button"
                className={`ecd-day text-title-3${isToday ? ' today' : ''}${isSelected ? ' sel' : ''}`}
                aria-pressed={Boolean(isSelected)}
                aria-label={`${MONTHS[m]} ${date.getDate()}${dot === 'registered' ? ', you’re signed up' : dot ? ', has events' : ''}`}
                onClick={() => onSelect(date)}
              >
                {date.getDate()}
                {/* keyed by tone so a change remounts the dot and restarts its pulse */}
                {dot && <i key={dot} className={`ecd-dot ecd-dot--${dot}${pop ? ' ecd-dot--pop' : ''}`} aria-hidden="true" />}
                {/* hover tooltip, same look and wording as the home calendar (styles.css .tip) */}
                {dot === 'registered' && <span className="ecd-tip" aria-hidden="true">You’re signed up</span>}
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
          <ChevronLeft size={24} strokeWidth={2} />
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
          <ChevronRight size={24} strokeWidth={2} />
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
