// Volunteer-facing profile of a staff member (event manager), opened from "Managed by" on an
// event page. No Figma frame exists for it: the layout reuses the volunteer Profile page
// (Figma: Final › Profiles, 2324:48566) minus the volunteer-only parts (stats, awards, editing).
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Handshake, Mail, MessageCircle, Phone } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Button from '../../components/Button/Button.jsx'
import EventHeader from '../../components/EventHeader/EventHeader.jsx'
import EventCard, { EventCardEmpty } from '../../components/EventCard/EventCard.jsx'
import EventCta from '../../components/EventCta/EventCta.jsx'
import { adminEvents } from '../../mock/adminEvents.js'
import { staff, staffIdFor } from '../../mock/staff.js'
import { TODAY } from '../../mock/today.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { useEventFlows } from '../../features/events/EventFlows.jsx'
import '../Profile.css'
import './StaffProfile.css'

export default function StaffProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { volunteer } = useDemo()
  const { openRegistration, openCancelRegistration, toggleSave } = useEventFlows()
  const person = staff[id]
  if (!person) return <Navigate to="/events" replace />

  const managed = adminEvents.filter((e) => staffIdFor(e.organizer) === id && e.start >= TODAY).sort((a, b) => a.start - b.start)

  return (
    <div className="profile staff-profile">
      <div className="profile__cover" aria-hidden="true" />

      <div className="profile__grid">
        <div className="profile__main">
          <div className="profile__avatar">
            {person.photo ? <img src={person.photo} alt="" /> : <Avatar name={person.name} size={200} tone="purple" />}
          </div>

          <div className="profile__identity">
            <div>
              <h1 className="profile__name">{person.name}</h1>
              <p className="text-label-2 profile__sub">
                {person.title} <span aria-hidden="true">|</span> {person.city}
              </p>
            </div>
            <Button color="secondary" size="sm" className="profile__edit staff-profile__message" onClick={() => navigate('/messages')}>
              Message {person.first}
              <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
          <p className="text-label-2 profile__bio">{person.bio}</p>

          <h2 className="text-heading-2 profile__events-title">Events {person.first} manages</h2>
          <div className="profile__list staff-profile__list">
            <EventHeader label="Coming up" count={managed.length}>
              {managed.length ? (
                managed.map((e) => {
                  const status = volunteer.attended.includes(e.id) ? 'attended' : volunteer.registered.includes(e.id) ? 'registered' : 'open'
                  return (
                    <EventCard
                      key={e.id}
                      event={e}
                      onOpen={() => navigate(`/events/${e.id}`)}
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
                  )
                })
              ) : (
                <EventCardEmpty icon={Handshake}>No upcoming events</EventCardEmpty>
              )}
            </EventHeader>
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
