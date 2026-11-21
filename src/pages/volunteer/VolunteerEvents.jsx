// Figma: Final (page 781:12667) › Volunteer - Events (section 2324:48069)
//   V - Events - Upcoming (2324:48143) · Saved (2324:48221) · Registered (2324:48070) · Attended (2324:48323)
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Bookmark, Handshake, SearchX } from 'lucide-react'
import { PageHeader } from '../../layout/AppShell.jsx'
import TabNav from '../../components/TabNav/TabNav.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import Filter from '../../components/Filter/Filter.jsx'
import Toggle from '../../components/Toggle/Toggle.jsx'
import EventHeader from '../../components/EventHeader/EventHeader.jsx'
import EventCard, { EventCardEmpty } from '../../components/EventCard/EventCard.jsx'
import EventCta from '../../components/EventCta/EventCta.jsx'
import EventCalendar from '../../components/EventCalendar/EventCalendar.jsx'
import Snapshot from '../../components/Snapshot/Snapshot.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import { events } from '../../mock/events.js'
import { TODAY } from '../../mock/today.js'
import { MONTHS, daysBetween, formatShortDate, hoursBetween, sameDay } from '../../lib/dates.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { useEventFlows } from '../../features/events/EventFlows.jsx'
import { useDismiss } from '../../lib/useDismiss.js'
import EventFilterPopover, { NO_FILTERS, compareDistance, filterOptions, hasFilters, matchesFilters, sortLabel, timeFilterLabel } from './EventFilterPopover.jsx'
import './VolunteerEvents.css'

// Length of the shrink-and-fade when a card leaves the current tab (keep in sync with CSS)
const LEAVE_MS = 320

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'saved', label: 'Saved' },
  { value: 'registered', label: 'Registered' },
  { value: 'attended', label: 'Attended' },
]

// Tabs that can receive a moved event, and the tag a newly arrived card gets there
const MARKED_TABS = ['upcoming', 'saved', 'registered']
// (Upcoming arrivals are tagged with where they came from: "Removed from saved / registered")
const FLAGS = { saved: 'Newly saved', registered: 'Newly registered' }
// Event ids in each of those tabs (same rules as byTab below, without search/day filters)
function membersOf(volunteer) {
  const future = events.filter((e) => e.start >= TODAY)
  const ids = (keep) => future.filter(keep).map((e) => e.id)
  return {
    upcoming: ids((e) => !volunteer.saved.includes(e.id) && !volunteer.registered.includes(e.id)),
    saved: ids((e) => volunteer.saved.includes(e.id)),
    registered: ids((e) => volunteer.registered.includes(e.id)),
  }
}

// Empty-state copy per tab, per bucket ("This Week" / "This Month")
const EMPTY = {
  upcoming: { icon: Handshake, week: 'No events scheduled this week — check back soon', month: 'No more events scheduled this month' },
  saved: { icon: Bookmark, week: 'You haven’t saved any events this week yet', month: 'You haven’t saved any events this month yet' },
  registered: { icon: Handshake, week: 'You’re not registered for anything this week yet', month: 'You’re not registered for anything this month yet' },
  attended: { icon: BookOpen, week: 'You haven’t attended any event yet this week!', month: 'You haven’t attended any events this month yet' },
}

function matchesQuery(e, q) {
  if (!q) return true
  const hay = [e.title, e.location, e.description, ...e.tags.map((t) => t.label)].join(' ').toLowerCase()
  return hay.includes(q.toLowerCase())
}

/** Bucket events into This Week / This Month / Later (or Earlier for past tabs). */
function group(list, past) {
  const buckets = { week: [], month: [], rest: [] }
  for (const e of list) {
    const d = past ? daysBetween(e.start, TODAY) : daysBetween(TODAY, e.start)
    if (d <= 7) buckets.week.push(e)
    else if (d <= 31) buckets.month.push(e)
    else buckets.rest.push(e)
  }
  return [
    { key: 'week', label: 'This Week', items: buckets.week, alwaysShow: true },
    { key: 'month', label: 'This Month', items: buckets.month, alwaysShow: true },
    { key: 'rest', label: past ? 'Earlier' : 'Later', items: buckets.rest, alwaysShow: false },
  ]
}

/** Hours attended per week-of-month for the Snapshot chart. */
function activityFor(month, attendedIds) {
  const y = month.getFullYear()
  const m = month.getMonth()
  const last = new Date(y, m + 1, 0).getDate()
  const ranges = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, last],
  ]
  return ranges.map(([a, b]) => ({
    label: `${a}-${b}`,
    value: events
      .filter((e) => attendedIds.includes(e.id) && e.start.getFullYear() === y && e.start.getMonth() === m)
      .filter((e) => e.start.getDate() >= a && e.start.getDate() <= b)
      .reduce((sum, e) => sum + hoursBetween(e.start, e.end), 0),
  }))
}

export default function VolunteerEvents() {
  const { volunteer } = useDemo()
  const { openRegistration, openCancelRegistration, openSurvey, toggleSave } = useEventFlows()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'upcoming'

  const [query, setQuery] = useState('')
  // Time / location / tag filters from the Filter popover (the date is selectedDay, shared with the calendar)
  const [filters, setFilters] = useState(NO_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef(null)
  const closeFilter = useCallback(() => setFilterOpen(false), [])
  useDismiss(filterRef, filterOpen, closeFilter)
  const [view, setView] = useState(params.get('view') === 'grid' ? 'grid' : 'list')
  const [selectedDay, setSelectedDay] = useState(null)
  const [calMonth, setCalMonth] = useState(TODAY)
  const [snapMonth, setSnapMonth] = useState(TODAY)

  const statusOf = (e) =>
    volunteer.attended.includes(e.id) ? 'attended' : volunteer.registered.includes(e.id) ? 'registered' : 'open'

  // Events in view before search / filters: the picked day (any tab), or the current tab.
  // Also the source of the popover's location / tag chips.
  const pool = useMemo(() => {
    if (selectedDay) return events.filter((e) => sameDay(e.start, selectedDay))
    const isFuture = (e) => e.start >= TODAY
    const byTab = {
      // Saving or registering moves an event out of Upcoming into its own tab.
      upcoming: (e) => isFuture(e) && !volunteer.saved.includes(e.id) && !volunteer.registered.includes(e.id),
      saved: (e) => isFuture(e) && volunteer.saved.includes(e.id),
      registered: (e) => isFuture(e) && volunteer.registered.includes(e.id),
      attended: (e) => volunteer.attended.includes(e.id),
    }
    return events.filter(byTab[tab])
  }, [tab, selectedDay, volunteer])

  const groups = useMemo(() => {
    const list = pool.filter((e) => matchesQuery(e, query) && matchesFilters(e, filters))
      .sort((a, b) => compareDistance(a, b, filters.sort) || a.start - b.start)
    // A day picked on the calendar (or in the filter) shows every event that day, regardless of tab.
    if (selectedDay) return [{ key: 'day', label: formatShortDate(selectedDay), items: list, alwaysShow: true }]
    return group(list, tab === 'attended')
  }, [pool, tab, query, filters, selectedDay])

  const filtersOn = hasFilters(filters)
  // The distance sort never hides events: it lights the Filter pill but isn't a "filter" for the empty state
  const refined = filtersOn || Boolean(filters.sort)
  const clearFilters = () => {
    setSelectedDay(null)
    setFilters(NO_FILTERS)
  }
  const total = groups.reduce((n, g) => n + g.items.length, 0)
  const empty = EMPTY[tab]

  /* ---- Move animation ----
     When saving / registering / unregistering makes a card drop out of the
     current list, keep it rendered for LEAVE_MS so it can shrink + fade away
     ("leaving"), pulse the tab it moved to, then let the remaining cards slide
     into place (FLIP, below). Changing tab/search/filters/day just swaps lists. */
  const ctx = `${tab}|${query}|${JSON.stringify(filters)}|${selectedDay?.getTime() ?? ''}`
  const current = groups.flatMap((g) => g.items.map((e, index) => ({ event: e, id: e.id, group: g.key, index })))
  const idsKey = current.map((c) => c.id).join(',')
  const [track, setTrack] = useState({ ctx, idsKey, items: current, leaving: [] })
  if (track.ctx !== ctx || track.idsKey !== idsKey) {
    const now = new Set(current.map((c) => c.id))
    let leaving = []
    if (track.ctx === ctx) {
      const gone = track.items.filter((p) => !now.has(p.id))
      leaving = [...track.leaving.filter((l) => !now.has(l.id)), ...gone]
    }
    setTrack({ ctx, idsKey, items: current, leaving })
  }

  /* ---- "New" markers ----
     Whenever an event newly lands in another tab's list — saved, registered,
     or moved back to Upcoming by unsaving / cancelling — that tab gets a dot
     (it pulses again for each further arrival). Opening the tab clears the dot
     and tags those cards (FLAGS / "Removed from …") until the user switches tabs. An event that
     leaves the tab again before it's seen drops out of both. */
  const members = useMemo(() => membersOf(volunteer), [volunteer])
  const [unseen, setUnseen] = useState({ upcoming: [], saved: [], registered: [] })
  const [fresh, setFresh] = useState({ tab, ids: [] })
  const unseenRef = useRef(unseen)
  unseenRef.current = unseen
  const prevMembers = useRef(members)
  // Event id → the list it was just removed from ('saved' | 'registered'), for its Upcoming tag
  const removedFrom = useRef({})
  useEffect(() => {
    const prev = prevMembers.current
    prevMembers.current = members
    for (const id of members.upcoming) {
      if (!prev.upcoming.includes(id)) removedFrom.current[id] = prev.registered.includes(id) ? 'registered' : 'saved'
    }
    setUnseen((u) => {
      const next = {}
      for (const key of MARKED_TABS) {
        const added = key === tab ? [] : members[key].filter((id) => !prev[key].includes(id) && !u[key].includes(id))
        next[key] = [...u[key], ...added].filter((id) => members[key].includes(id))
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members])
  useEffect(() => {
    setFresh({ tab, ids: unseenRef.current[tab] || [] })
    setUnseen((u) => (u[tab]?.length ? { ...u, [tab]: [] } : u))
  }, [tab])
  const flagFor = (e) => {
    if (fresh.tab !== tab || !fresh.ids.includes(e.id) || !members[tab]?.includes(e.id)) return undefined
    return tab === 'upcoming' ? `Removed from ${removedFrom.current[e.id] || 'saved'}` : FLAGS[tab]
  }

  // Drop each leaving card once its animation has played.
  const scheduled = useRef(new Set())
  useEffect(() => {
    for (const l of track.leaving) {
      if (scheduled.current.has(l.id)) continue
      scheduled.current.add(l.id)
      setTimeout(() => {
        scheduled.current.delete(l.id)
        setTrack((t) => ({ ...t, leaving: t.leaving.filter((x) => x.id !== l.id) }))
      }, LEAVE_MS)
    }
  }, [track.leaving])

  // Merge leaving cards back into their old slot so they animate in place.
  const shownGroups = groups.map((g) => {
    const shown = g.items.map((e) => ({ e, leaving: false }))
    for (const l of track.leaving.filter((x) => x.group === g.key)) {
      shown.splice(Math.min(l.index, shown.length), 0, { e: l.event, leaving: true })
    }
    return { ...g, shown }
  })

  // FLIP: after every render, slide anything whose position changed from where
  // it was last render. offsetLeft/Top ignore transforms and scrolling, so
  // in-flight animations don't skew the measurement.
  const listRef = useRef(null)
  const positions = useRef({ ctx: null, map: new Map() })
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prev = positions.current.ctx === ctx ? positions.current.map : null
    const next = new Map()
    list.querySelectorAll('[data-flip]').forEach((el) => {
      const key = el.dataset.flip
      const pos = { x: el.offsetLeft, y: el.offsetTop }
      next.set(key, pos)
      if (!prev || reduce) return
      const old = prev.get(key)
      if (!old) {
        el.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], {
          duration: 220,
          easing: 'ease-out',
        })
      } else if (old.x !== pos.x || old.y !== pos.y) {
        el.animate(
          [{ transform: `translate(${old.x - pos.x}px, ${old.y - pos.y}px)` }, { transform: 'translate(0, 0)' }],
          { duration: 320, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        )
      }
    })
    positions.current = { ctx, map: next }
  })

  const dotFor = (date) => {
    const onDay = events.filter((e) => sameDay(e.start, date))
    if (!onDay.length) return null
    return onDay.some((e) => statusOf(e) !== 'open') ? 'registered' : 'event'
  }

  const renderCard = ({ e, leaving }) => {
    const status = statusOf(e)
    // Attended events without feedback open their post-event survey when clicked;
    // every other card opens the event's own page (VolunteerEventDetail).
    const needsSurvey = status === 'attended' && !volunteer.surveyResponses[e.id]
    const openEvent = () => navigate(`/events/${e.id}${selectedDay ? '' : `?from=${tab}`}`)
    return (
      <div
        key={e.id}
        data-flip={e.id}
        className={`volunteer-events__item ${leaving ? 'volunteer-events__item--leaving' : ''}`}
        aria-hidden={leaving || undefined}
        inert={leaving || undefined}
      >
      <EventCard
        event={e}
        layout={view}
        flag={leaving ? undefined : flagFor(e)}
        onOpen={leaving ? undefined : needsSurvey ? () => openSurvey(e) : openEvent}
        cta={
          <EventCta
            status={status}
            saved={volunteer.saved.includes(e.id)}
            onToggleSaved={() => toggleSave(e)}
            onRegister={() => openRegistration(e)}
            onUnregister={() => openCancelRegistration(e)}
          />
        }
      />
      </div>
    )
  }

  return (
    <div className="volunteer-events">
      <PageHeader title="Your events" subtitle="Explore and register to volunteer at events" />

      <TabNav
        label="Event lists"
        tabs={TABS}
        value={tab}
        marks={{ upcoming: unseen.upcoming.length, saved: unseen.saved.length, registered: unseen.registered.length }}
        onChange={(v) => {
          clearFilters()
          setFilterOpen(false)
          setParams(v === 'upcoming' ? {} : { tab: v })
        }}
      />

      <div className="volunteer-events__body">
        <div className="volunteer-events__main">
          <div className="volunteer-events__toolbar">
            <SearchBar value={query} onChange={setQuery} label="Search events" />
            <div className="volunteer-events__filter" ref={filterRef}>
              <Filter
                active={Boolean(selectedDay) || refined}
                aria-label="Filter events by date, time, location and tags, or sort by distance"
                aria-haspopup="dialog"
                aria-expanded={filterOpen}
                onClick={() => setFilterOpen((o) => !o)}
              />
              {filterOpen && (
                <EventFilterPopover
                  day={selectedDay}
                  filters={filters}
                  options={filterOptions(pool)}
                  onApply={(day, next) => {
                    setSelectedDay(day)
                    if (day) setCalMonth(day)
                    setFilters(next)
                    setFilterOpen(false)
                  }}
                />
              )}
            </div>
            <Toggle value={view} onChange={setView} />
          </div>

          {(selectedDay || refined) && (
            <div className="volunteer-events__active-filter text-body">
              {selectedDay ? 'Showing all events on' : filtersOn ? 'Filtered by' : 'Sorted by'}
              {selectedDay && (
                <Tags color="purple" onRemove={() => setSelectedDay(null)}>
                  {formatShortDate(selectedDay)}
                </Tags>
              )}
              {(filters.from || filters.to) && (
                <Tags color="purple" onRemove={() => setFilters((f) => ({ ...f, from: '', to: '' }))}>
                  {timeFilterLabel(filters)}
                </Tags>
              )}
              {filters.places.map((p) => (
                <Tags key={p} color="purple" onRemove={() => setFilters((f) => ({ ...f, places: f.places.filter((x) => x !== p) }))}>
                  {p}
                </Tags>
              ))}
              {filters.tags.map((t) => (
                <Tags key={t} color="purple" onRemove={() => setFilters((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))}>
                  {t}
                </Tags>
              ))}
              {filters.sort && (
                <Tags color="purple" onRemove={() => setFilters((f) => ({ ...f, sort: '' }))}>
                  {sortLabel(filters.sort)}
                </Tags>
              )}
            </div>
          )}

          {/* Only this list (sublabels + cards) scrolls; everything else stays put */}
          <div className="volunteer-events__list" ref={listRef}>
          {(query || filtersOn) && total === 0 && !track.leaving.length ? (
            <EventCardEmpty icon={SearchX}>
              {filtersOn ? 'No events match your filters' : <>No events match “{query}”</>}
              {filtersOn && (
                <button type="button" className="volunteer-events__clear text-body-2" onClick={() => { setQuery(''); setFilters(NO_FILTERS) }}>
                  Clear filters
                </button>
              )}
            </EventCardEmpty>
          ) : (
            shownGroups
              .filter((g) => g.alwaysShow || g.shown.length)
              .map((g) => (
                <EventHeader key={g.key} label={g.label} count={g.items.length} layout={view}>
                  {g.shown.length ? (
                    g.shown.map(renderCard)
                  ) : (
                    <div className="volunteer-events__item volunteer-events__item--full" data-flip={`empty-${g.key}`}>
                      <EventCardEmpty icon={selectedDay ? Handshake : empty.icon}>
                        {selectedDay ? 'No events on this day' : empty[g.key]}
                      </EventCardEmpty>
                    </div>
                  )}
                </EventHeader>
              ))
          )}
          </div>
        </div>

        <aside className="volunteer-events__aside">
          <EventCalendar
            month={calMonth}
            onMonthChange={setCalMonth}
            dotFor={dotFor}
            variant="dashboard"
            today={TODAY}
            selected={selectedDay}
            onSelect={(d) => setSelectedDay((cur) => (cur && sameDay(cur, d)) || sameDay(d, TODAY) ? null : d)}
          />
          <Snapshot
            title={
              snapMonth.getMonth() === TODAY.getMonth() && snapMonth.getFullYear() === TODAY.getFullYear()
                ? 'Your activity this month'
                : `Your activity in ${MONTHS[snapMonth.getMonth()]}`
            }
            data={activityFor(snapMonth, volunteer.attended)}
            onPrev={() => setSnapMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            onNext={() => setSnapMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            linkTo="/"
            linkLabel="See dashboard"
          />
        </aside>
      </div>
    </div>
  )
}
