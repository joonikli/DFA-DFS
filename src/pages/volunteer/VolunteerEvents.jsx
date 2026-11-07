// Figma: Final (page 781:12667) › Volunteer - Events (section 2324:48069)
//   V - Events - Upcoming (2324:48143) · Saved (2324:48221) · Registered (2324:48070) · Attended (2324:48323)
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import './VolunteerEvents.css'

// Length of the shrink-and-fade when a card leaves the current tab (keep in sync with CSS)
const LEAVE_MS = 320

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'saved', label: 'Saved' },
  { value: 'registered', label: 'Registered' },
  { value: 'attended', label: 'Attended' },
]

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
  const { volunteer, toggleSaved, unregister, showToast } = useDemo()
  const { openRegistration, openSurvey } = useEventFlows()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'upcoming'

  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [view, setView] = useState(params.get('view') === 'grid' ? 'grid' : 'list')
  const [selectedDay, setSelectedDay] = useState(null)
  const [calMonth, setCalMonth] = useState(TODAY)
  const [snapMonth, setSnapMonth] = useState(TODAY)

  const statusOf = (e) =>
    volunteer.attended.includes(e.id) ? 'attended' : volunteer.registered.includes(e.id) ? 'registered' : 'open'

  const groups = useMemo(() => {
    const isFuture = (e) => e.start >= TODAY
    const byTab = {
      // Saving or registering moves an event out of Upcoming into its own tab.
      upcoming: (e) => isFuture(e) && !volunteer.saved.includes(e.id) && !volunteer.registered.includes(e.id),
      saved: (e) => isFuture(e) && volunteer.saved.includes(e.id),
      registered: (e) => isFuture(e) && volunteer.registered.includes(e.id),
      attended: (e) => volunteer.attended.includes(e.id),
    }
    const sorted = (list) => [...list].sort((a, b) => (sortDir === 'asc' ? a.start - b.start : b.start - a.start))

    // A day picked on the calendar shows every event that day, regardless of tab.
    if (selectedDay) {
      const items = sorted(events.filter((e) => sameDay(e.start, selectedDay) && matchesQuery(e, query)))
      return [{ key: 'day', label: formatShortDate(selectedDay), items, alwaysShow: true }]
    }

    const list = sorted(events.filter((e) => byTab[tab](e) && matchesQuery(e, query)))
    const g = group(list, tab === 'attended')
    return sortDir === 'asc' ? g : [...g].reverse()
  }, [tab, query, sortDir, selectedDay, volunteer])

  const total = groups.reduce((n, g) => n + g.items.length, 0)
  const empty = EMPTY[tab]

  /* ---- Move animation ----
     When saving / registering / unregistering makes a card drop out of the
     current list, keep it rendered for LEAVE_MS so it can shrink + fade away
     ("leaving"), pulse the tab it moved to, then let the remaining cards slide
     into place (FLIP, below). Changing tab/search/sort/day just swaps lists. */
  const ctx = `${tab}|${query}|${sortDir}|${selectedDay?.getTime() ?? ''}`
  const current = groups.flatMap((g) => g.items.map((e, index) => ({ event: e, id: e.id, group: g.key, index })))
  const idsKey = current.map((c) => c.id).join(',')
  const [track, setTrack] = useState({ ctx, idsKey, items: current, leaving: [], pulse: null })
  if (track.ctx !== ctx || track.idsKey !== idsKey) {
    const now = new Set(current.map((c) => c.id))
    let leaving = []
    let pulse = track.pulse
    if (track.ctx === ctx) {
      const gone = track.items.filter((p) => !now.has(p.id))
      leaving = [...track.leaving.filter((l) => !now.has(l.id)), ...gone]
      // Where did it go? Registered beats Saved; otherwise back to Upcoming.
      const dest = (id) =>
        volunteer.registered.includes(id) ? 'registered' : volunteer.saved.includes(id) ? 'saved' : 'upcoming'
      const target = gone.map((g) => dest(g.id)).find((t) => t !== tab)
      if (target) pulse = { value: target, n: (track.pulse?.n ?? 0) + 1 }
    }
    setTrack({ ctx, idsKey, items: current, leaving, pulse })
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
    // Attended events without feedback open their post-event survey when clicked.
    const needsSurvey = status === 'attended' && !volunteer.surveyResponses[e.id]
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
        onOpen={needsSurvey ? () => openSurvey(e) : undefined}
        cta={
          <EventCta
            status={status}
            saved={volunteer.saved.includes(e.id)}
            onToggleSaved={() => {
              const wasSaved = volunteer.saved.includes(e.id)
              toggleSaved(e.id)
              showToast(
                wasSaved
                  ? { variant: 'alert', parts: [['Removed from saved', true]], preview: e.title, time: 'Now', category: 'Event' }
                  : { variant: 'success', parts: [['Saved!', true]], preview: `${e.title} is now in your Saved events.`, time: 'Now', category: 'Event' },
              )
            }}
            onRegister={() => openRegistration(e)}
            onUnregister={() => {
              unregister(e.id)
              showToast({
                variant: 'alert',
                parts: [['Registration cancelled', true], [' for ', false], [e.title, true]],
                time: 'Now',
                category: 'Event',
              })
            }}
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
        pulse={track.pulse}
        onChange={(v) => {
          setSelectedDay(null)
          setParams(v === 'upcoming' ? {} : { tab: v })
        }}
      />

      <div className="volunteer-events__body">
        <div className="volunteer-events__main">
          <div className="volunteer-events__toolbar">
            <SearchBar value={query} onChange={setQuery} label="Search events" />
            <Filter label="Date" direction={sortDir} onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} />
            <Toggle value={view} onChange={setView} />
          </div>

          {selectedDay && (
            <div className="volunteer-events__active-filter text-body">
              Showing all events on
              <Tags color="purple" onRemove={() => setSelectedDay(null)}>
                {formatShortDate(selectedDay)}
              </Tags>
            </div>
          )}

          {/* Only this list (sublabels + cards) scrolls; everything else stays put */}
          <div className="volunteer-events__list" ref={listRef}>
          {query && total === 0 && !track.leaving.length ? (
            <EventCardEmpty icon={SearchX}>No events match “{query}”</EventCardEmpty>
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
            selected={selectedDay ?? TODAY}
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
