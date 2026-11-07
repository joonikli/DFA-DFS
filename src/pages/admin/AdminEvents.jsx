// Figma: Final › Admin - Events › Events - admin (2324:46460)
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bookmark, CalendarX, Handshake, SearchX } from 'lucide-react'
import { PageHeader } from '../../layout/AppShell.jsx'
import TabNav from '../../components/TabNav/TabNav.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import Filter from '../../components/Filter/Filter.jsx'
import Toggle from '../../components/Toggle/Toggle.jsx'
import Button from '../../components/Button/Button.jsx'
import EventHeader from '../../components/EventHeader/EventHeader.jsx'
import EventCard, { EventCardEmpty } from '../../components/EventCard/EventCard.jsx'
import EventCalendar from '../../components/EventCalendar/EventCalendar.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import { AdminEventCta, TodoItem } from '../../features/admin/AdminBits.jsx'
import CreateEventModal from '../../features/admin/CreateEventModal.jsx'
import { useAdminEvents } from '../../features/admin/useAdminEvents.js'
import { todos } from '../../mock/adminEvents.js'
import { TODAY } from '../../mock/today.js'
import { daysBetween, formatShortDate, sameDay } from '../../lib/dates.js'
import { useDemo } from '../../store/DemoStore.jsx'
import './AdminEvents.css'

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'saved', label: 'Saved' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const EMPTY = {
  upcoming: [Handshake, 'No upcoming events here yet'],
  saved: [Bookmark, 'You haven’t saved any events yet'],
  completed: [Handshake, 'No completed events in this range'],
  cancelled: [CalendarX, 'No cancelled events'],
}

const matches = (e, q) =>
  !q || [e.name, e.title, e.location, e.description, ...e.tags.map((t) => t.label)].join(' ').toLowerCase().includes(q.toLowerCase())

export default function AdminEvents() {
  const navigate = useNavigate()
  const { admin, adminToggleSaved } = useDemo()
  const all = useAdminEvents()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'upcoming'
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [view, setView] = useState('list')
  const [calMonth, setCalMonth] = useState(TODAY)
  const [day, setDay] = useState(null)
  const [creating, setCreating] = useState(null) // null | {} | draft

  const groups = useMemo(() => {
    const byTab = {
      upcoming: (e) => e.status === 'upcoming',
      saved: (e) => e.saved && e.status !== 'cancelled',
      completed: (e) => e.status === 'completed',
      cancelled: (e) => e.status === 'cancelled',
    }
    const list = all
      .filter((e) => (day ? sameDay(e.start, day) : byTab[tab](e)) && matches(e, query))
      .sort((a, b) => (sortDir === 'asc' ? a.start - b.start : b.start - a.start))

    if (day) return [{ key: 'day', label: formatShortDate(day), items: list, always: true }]
    if (tab !== 'upcoming') return [{ key: 'all', label: TABS.find((t) => t.value === tab).label, items: list, always: true }]

    const mine = list.filter((e) => e.organizer === 'me')
    const rest = list.filter((e) => e.organizer !== 'me')
    const month = rest.filter((e) => daysBetween(TODAY, e.start) <= 31)
    const later = rest.filter((e) => daysBetween(TODAY, e.start) > 31)
    return [
      { key: 'mine', label: 'My Events', items: mine, always: true },
      { key: 'month', label: 'This Month', items: month, always: true },
      { key: 'later', label: 'Later', items: later, always: false },
    ]
  }, [all, tab, query, sortDir, day])

  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className="admin-events">
      <PageHeader title="Events" subtitle="Create and manage Dress for Success’s events and to-do tasks" />

      <TabNav
        label="Event lists"
        tabs={TABS}
        value={tab}
        onChange={(v) => {
          setDay(null)
          setParams(v === 'upcoming' ? {} : { tab: v })
        }}
      />

      <div className="admin-events__body">
        <div className="admin-events__main">
          <div className="admin-events__toolbar">
            <SearchBar value={query} onChange={setQuery} label="Search events" />
            <Filter label="Date" direction={sortDir} onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} />
            <Toggle value={view} onChange={setView} />
            <Button size="sm" icon="plus" className="admin-events__create" onClick={() => setCreating({})}>
              Create event
            </Button>
          </div>

          {admin.drafts.length > 0 && !day && tab === 'upcoming' && (
            <div className="admin-events__drafts text-body">
              Drafts:
              {admin.drafts.map((d) => (
                <button key={d.id} type="button" className="admin-events__draft" onClick={() => setCreating(d)}>
                  <Tags color="yellow">{d.name}</Tags>
                </button>
              ))}
            </div>
          )}

          {day && (
            <div className="admin-events__filter text-body">
              Showing all events on
              <Tags color="purple" onRemove={() => setDay(null)}>
                {formatShortDate(day)}
              </Tags>
            </div>
          )}

          {query && total === 0 ? (
            <EventCardEmpty icon={SearchX}>No events match “{query}”</EventCardEmpty>
          ) : (
            groups
              .filter((g) => g.always || g.items.length)
              .map((g) => (
                <EventHeader key={g.key} label={g.label} count={g.items.length} layout={view}>
                  {g.items.length ? (
                    g.items.map((e) => (
                      <EventCard
                        key={e.id}
                        event={{ ...e, title: e.name }}
                        layout={view}
                        onOpen={() => navigate(`/events/${e.id}`)}
                        cta={<AdminEventCta count={e.signups.length} saved={e.saved} onToggleSaved={() => adminToggleSaved(e.id)} />}
                      />
                    ))
                  ) : (
                    <EventCardEmpty icon={EMPTY[tab][0]}>{EMPTY[tab][1]}</EventCardEmpty>
                  )}
                </EventHeader>
              ))
          )}
        </div>

        <aside className="admin-events__aside">
          <EventCalendar
            month={calMonth}
            onMonthChange={setCalMonth}
            selected={day ?? TODAY}
            legend={[
              { tone: 'event', label: 'Your events' },
              { tone: 'registered', label: 'Saved events' },
            ]}
            dotFor={(d) => {
              const onDay = all.filter((e) => sameDay(e.start, d) && e.status !== 'cancelled')
              if (!onDay.length) return null
              return onDay.some((e) => e.saved) ? 'registered' : 'event'
            }}
            onSelect={(d) => setDay((cur) => ((cur && sameDay(cur, d)) || sameDay(d, TODAY) ? null : d))}
          />

          <section className="admin-todo">
            <h2 className="text-subheading">To do</h2>
            <div className="admin-todo__list">
              {todos.slice(0, 2).map((t) => (
                <TodoItem key={t.id} {...t} />
              ))}
            </div>
            <button type="button" className="admin-todo__all text-label-2" onClick={() => navigate('/surveys')}>
              View all
            </button>
          </section>
        </aside>
      </div>

      {creating && <CreateEventModal draft={creating.id ? creating : undefined} onClose={() => setCreating(null)} />}
    </div>
  )
}
