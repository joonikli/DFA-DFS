// Filter popover for the volunteer Events page (opened from the Filter pill):
// date, a From / To time window, location + tag chips, and a nearest / furthest distance sort.
// Matching: an event fits the time window when it starts at/after From and ends at/before To;
// chips are OR within a group, AND across groups. The date is the same day the calendar selects.
import { useEffect, useRef, useState } from 'react'
import { ArrowDownUp } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import { TextField, TimeField } from '../../components/Field/Field.jsx'
import { formatHour, formatTimeRange } from '../../lib/dates.js'

export const NO_FILTERS = { from: '', to: '', places: [], tags: [], sort: '' }
// Distance sort options (single choice; none = the default date order)
export const SORTS = [
  { value: 'nearest', label: 'Nearest first' },
  { value: 'furthest', label: 'Furthest first' },
]
// Time pickers offer 9 am – 9 pm only
const EARLIEST = '09:00'
const LATEST = '21:00'

// '8374 Redmond Rd, Pittsburgh, PA' → '8374 Redmond Rd'
export const placeName = (location) => location.split(',')[0].trim()
const samePlace = (a, b) => a.toLowerCase() === b.toLowerCase()
const minutesOf = (d) => d.getHours() * 60 + d.getMinutes()
const inputMinutes = (value) => {
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}
const clock = (value) => {
  const [h, m] = value.split(':').map(Number)
  return new Date(2000, 0, 1, h, m)
}
const pad = (n) => String(n).padStart(2, '0')
const toIso = (d) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '')
const fromIso = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const toggleItem = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value])

export const hasFilters = (f) => Boolean(f.from || f.to || f.places.length || f.tags.length)

const FIRST_TAG = 'no requirements'
const NEXT_SORT ={ '': 'nearest', nearest: 'furthest', furthest: '' }
export const sortLabel = (sort) => SORTS.find((s) => s.value === sort)?.label ?? ''

// '0.5 mi from you' → 0.5; events without a distance sort last either way
const miles = (e) => {
  const n = parseFloat(e.distance)
  return Number.isFinite(n) ? n : null
}
/** Compare two events by distance for the chosen sort; 0 (tie / no sort) falls back to date order. */
export function compareDistance(a, b, sort) {
  if (!sort) return 0
  const x = miles(a)
  const y = miles(b)
  if (x === y) return 0
  if (x === null) return 1
  if (y === null) return -1
  return sort === 'nearest' ? x - y : y - x
}

export function matchesFilters(e, f) {
  if (f.from && minutesOf(e.start) < inputMinutes(f.from)) return false
  if (f.to && minutesOf(e.end) > inputMinutes(f.to)) return false
  if (f.places.length && !f.places.some((p) => samePlace(p, placeName(e.location)))) return false
  if (f.tags.length && !e.tags.some((t) => f.tags.includes(t.label))) return false
  return true
}

/** Chip options from a list of events. Place names differing only in case collapse into one chip. */
export function filterOptions(list) {
  const places = []
  for (const e of list) {
    const name = placeName(e.location)
    if (!places.some((p) => samePlace(p, name))) places.push(name)
  }
  const tags = [...new Set(list.flatMap((e) => e.tags.map((t) => t.label)))]
  // Tags are alphabetical, except "no requirements" always leads
  const tagRank = (t) => (t.toLowerCase() === FIRST_TAG ? 0 : 1)
  return {
    places: places.sort((a, b) => a.localeCompare(b)),
    tags: tags.sort((a, b) => tagRank(a) - tagRank(b) || a.localeCompare(b)),
  }
}

/** "6-8 pm" · "From 6 pm" · "Until 8 pm" */
export function timeFilterLabel({ from, to }) {
  if (from && to) return formatTimeRange(clock(from), clock(to))
  return from ? `From ${formatHour(clock(from), true)}` : `Until ${formatHour(clock(to), true)}`
}

// `leading`: an extra control shown before the option chips (e.g. Location's distance sort)
function ChipGroup({ legend, options, value, onChange, leading = null }) {
  if (!options.length && !leading) return null
  return (
    <fieldset className="event-filter__group">
      <legend className="text-body-2">{legend}</legend>
      <div className="event-filter__chips">
        {leading}
        {options.map((option) => {
          const on = value.includes(option)
          return (
            <button
              type="button"
              key={option}
              className={`event-filter__chip text-label-2 ${on ? 'event-filter__chip--on' : ''}`}
              aria-pressed={on}
              onClick={() => onChange(toggleItem(value, option))}
            >
              {option}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function EventFilterPopover({ day, filters, options, onApply }) {
  const [date, setDate] = useState(toIso(day))
  const [from, setFrom] = useState(filters.from)
  const [to, setTo] = useState(filters.to)
  const [places, setPlaces] = useState(filters.places)
  const [tags, setTags] = useState(filters.tags)
  const [sort, setSort] = useState(filters.sort)
  const invalid = Boolean(from && to && from >= to)
  const first = useRef(null)
  useEffect(() => first.current?.focus(), [])

  const submit = (e) => {
    e.preventDefault()
    if (invalid) return
    onApply(date ? fromIso(date) : null, { from, to, places, tags, sort })
  }

  return (
    <div className="event-filter" role="dialog" aria-label="Filter events">
      <form onSubmit={submit}>
        <fieldset className="event-filter__group">
          <legend className="text-body-2">Date &amp; time</legend>
          <div className="event-filter__when">
            <label className="event-filter__field text-label-2">
              Date
              <TextField ref={first} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <div className="event-filter__field text-label-2">
              <span aria-hidden="true">From</span>
              <TimeField editable value={from} onChange={(e) => setFrom(e.target.value)} min={EARLIEST} max={LATEST} aria-label="From" aria-invalid={invalid} />
            </div>
            <div className="event-filter__field text-label-2">
              <span aria-hidden="true">To</span>
              <TimeField editable value={to} onChange={(e) => setTo(e.target.value)} min={EARLIEST} max={LATEST} aria-label="To" aria-invalid={invalid} />
            </div>
          </div>
          {invalid && (
            <p className="event-filter__error text-label-2" role="alert">
              End time must be after start time
            </p>
          )}
        </fieldset>
        <ChipGroup
          legend="Location"
          options={options.places}
          value={places}
          onChange={setPlaces}
          leading={
            /* Distance sort: one chip, each click steps off → Nearest first → Furthest first → off */
            <button
              type="button"
              className={`event-filter__chip event-filter__chip--sort text-label-2 ${sort ? 'event-filter__chip--on' : ''}`}
              aria-pressed={Boolean(sort)}
              aria-label={`Sort by distance: ${sort ? sortLabel(sort) : 'off'}. Click to switch.`}
              onClick={() => setSort(NEXT_SORT[sort])}
            >
              <ArrowDownUp size={14} aria-hidden="true" />
              {sortLabel(sort || 'nearest')}
            </button>
          }
        />
        <ChipGroup legend="Tags" options={options.tags} value={tags} onChange={setTags} />
        <div className="event-filter__actions">
          <Button color="secondary" size="sm" onClick={() => onApply(null, NO_FILTERS)}>
            Clear
          </Button>
          <Button size="sm" type="submit" disabled={invalid}>
            Apply
          </Button>
        </div>
      </form>
    </div>
  )
}
