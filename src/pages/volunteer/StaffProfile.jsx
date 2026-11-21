// Volunteer-facing profile of a staff member (event manager), opened from "Managed by" on an
// event page. Figma: Final › Profiles › Volunteer - Admin Profile (2324:48567). Type sizes and
// spacing follow the volunteer Profile page (Profile.css) rather than the frame's larger scale.
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Handshake, Mail, MessageSquare, Phone } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Button from '../../components/Button/Button.jsx'
import TabNav from '../../components/TabNav/TabNav.jsx'
import EventHeader from '../../components/EventHeader/EventHeader.jsx'
import EventCard, { EventCardEmpty } from '../../components/EventCard/EventCard.jsx'
import EventCta from '../../components/EventCta/EventCta.jsx'
import { adminEvents } from '../../mock/adminEvents.js'
import { staff, staffIdFor } from '../../mock/staff.js'
import { TODAY } from '../../mock/today.js'
import { daysBetween } from '../../lib/dates.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { useEventFlows } from '../../features/events/EventFlows.jsx'
import '../Profile.css'
import './StaffProfile.css'

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'previous', label: 'Previous' },
]

/** This Week / This Month / Later (Earlier for past events), same rules as the Events page. Empty buckets are dropped. */
function group(list, past) {
  const buckets = { week: [], month: [], rest: [] }
  for (const e of list) {
    const d = past ? daysBetween(e.start, TODAY) : daysBetween(TODAY, e.start)
    if (d <= 7) buckets.week.push(e)
    else if (d <= 31) buckets.month.push(e)
    else buckets.rest.push(e)
  }
  return [
    { key: 'week', label: 'This Week', items: buckets.week },
    { key: 'month', label: 'This Month', items: buckets.month },
    { key: 'rest', label: past ? 'Earlier' : 'Later', items: buckets.rest },
  ].filter((b) => b.items.length)
}

export default function StaffProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { volunteer } = useDemo()
  const { openRegistration, openCancelRegistration, toggleSave } = useEventFlows()
  const person = staff[id]
  if (!person) return <Navigate to="/events" replace />

  const tab = params.get('tab') === 'previous' ? 'previous' : 'upcoming'
  const past = tab === 'previous'
  const managed = adminEvents
    .filter((e) => staffIdFor(e.organizer) === id && (past ? e.start < TODAY : e.start >= TODAY))
    .sort((a, b) => (past ? b.start - a.start : a.start - b.start))
  const buckets = group(managed, past)

  const cardFor = (e) => {
    const attended = volunteer.attended.includes(e.id)
    const status = attended ? 'attended' : volunteer.registered.includes(e.id) ? 'registered' : 'open'
    // Past events the volunteer didn't attend have nothing to act on
    const cta =
      past && !attended ? null : (
        <EventCta
          status={status}
          saved={volunteer.saved.includes(e.id)}
          onToggleSaved={() => toggleSave(e)}
          onRegister={() => openRegistration(e)}
          onUnregister={() => openCancelRegistration(e)}
        />
      )
    return <EventCard key={e.id} event={e} onOpen={() => navigate(`/events/${e.id}`)} cta={cta} />
  }

  return (
    <div className="profile staff-profile">
      <div className="profile__cover staff-profile__cover" aria-hidden="true" />

      <div className="profile__grid">
        <div className="profile__main">
          <div className="profile__avatar">
            {person.photo ? <img src={person.photo} alt="" /> : <Avatar name={person.name} size={200} tone="purple" />}
          </div>

          <div className="profile__identity staff-profile__identity">
            <div>
              <h1 className="profile__name">
                {person.name}
                <img className="staff-profile__verified" src="/assets/profiles/verified-admin.svg" width="27" height="24" alt="Verified staff" />
              </h1>
              <p className="text-label-2 profile__sub">
                {person.title} <span aria-hidden="true">|</span> {person.city}
              </p>
            </div>
            <Button color="secondary" size="sm" className="profile__edit staff-profile__message" onClick={() => navigate('/messages')} aria-label={`Message ${person.first}`}>
              Message
              <MessageSquare size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
          <p className="text-label-2 profile__bio">{person.bio}</p>

          <h2 className="text-heading-2 profile__events-title">{person.first}’s Events</h2>
          <TabNav label="Events sections" tabs={TABS} value={tab} onChange={(t) => setParams(t === 'upcoming' ? {} : { tab: t }, { replace: true })} />
          <div className="profile__list staff-profile__list">
            {buckets.length ? (
              buckets.map((b) => (
                <EventHeader key={b.key} label={b.label} count={b.items.length}>
                  {b.items.map(cardFor)}
                </EventHeader>
              ))
            ) : (
              <EventHeader label={past ? 'Earlier' : 'This Week'} count={0}>
                <EventCardEmpty icon={Handshake}>{past ? 'No past events' : 'No upcoming events'}</EventCardEmpty>
              </EventHeader>
            )}
          </div>
        </div>

        <aside className="profile__side">
          <p className="profile__joined text-label-2">
            <span>Joined</span> {person.joined}
          </p>
          <section className="profile__contact">
            <h2 className="text-heading-2">Contact</h2>
            <ul className="text-label-2">
              <li>
                <Mail size={20} strokeWidth={1.5} aria-hidden="true" />
                <a href={`mailto:${person.email}`}>{person.email}</a>
              </li>
              <li>
                <Phone size={20} strokeWidth={1.5} aria-hidden="true" />
                <a href={`tel:${person.phone.replace(/-/g, '')}`}>{person.phone}</a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
