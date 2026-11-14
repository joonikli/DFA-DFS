// Figma: Final › Profiles (section 2324:48566)
//   Volunteer - Admin Profile (2324:48567)  → /profile as admin (own profile)
//   Admin - Volunteer Profile (2324:48611)  → /volunteers/:id (Upcoming / Attended)
//   Admin - Volunteer Profile (2324:48717)  → /volunteers/:id?tab=awards
// /profile as volunteer reuses the volunteer layout for Maureen's own profile.
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BadgeCheck, ChevronDown, Handshake, Mail, Pencil, Phone, Star, Tag } from 'lucide-react'
import TabNav from '../components/TabNav/TabNav.jsx'
import Tags from '../components/Tags/Tags.jsx'
import Modal from '../components/Modal/Modal.jsx'
import Button from '../components/Button/Button.jsx'
import Avatar from '../components/Avatar/Avatar.jsx'
import StatTile from '../components/StatTile/StatTile.jsx'
import EventHeader from '../components/EventHeader/EventHeader.jsx'
import EventCard, { EventCardEmpty } from '../components/EventCard/EventCard.jsx'
import EventCta from '../components/EventCta/EventCta.jsx'
import { FieldLabel, TextField } from '../components/Field/Field.jsx'
import { AdminEventCta } from '../features/admin/AdminBits.jsx'
import { useAdminEvents } from '../features/admin/useAdminEvents.js'
import { useEventFlows } from '../features/events/EventFlows.jsx'
import { events, eventsById, volunteerHistory } from '../mock/events.js'
import { volunteersById } from '../mock/volunteers.js'
import { TODAY } from '../mock/today.js'
import { hoursBetween } from '../lib/dates.js'
import { PERSONAS, useDemo } from '../store/DemoStore.jsx'
import sarahPhoto from '../assets/people/sarah-doe.png'
import johnPhoto from '../assets/people/john-doe.png'
import top5 from '../assets/awards/top-5.png'
import top15 from '../assets/awards/top-15.png'
import top25 from '../assets/awards/top-25.png'
import top50 from '../assets/awards/top-50.png'
import impactMaker from '../assets/awards/title-impact-maker.png'
import careerChampion from '../assets/awards/title-career-champion.png'
import successAdvocate from '../assets/awards/title-success-advocate.png'
import './Profile.css'

const BADGES = [
  { src: top15, label: 'Top 15%' },
  { src: top50, label: 'Top 50%' },
  { src: top25, label: 'Top 25%' },
  { src: top5, label: 'Top 5%' },
]
const TITLES = [
  { src: impactMaker, label: 'Impact Maker' },
  { src: careerChampion, label: 'Career Champion' },
  { src: successAdvocate, label: 'Success Advocate' },
]
const VOLUNTEER_TAGS = [
  { label: 'heavylifting', tone: 'blue' },
  { label: 'spanish', tone: 'blue' },
  { label: 'organized', tone: 'blue' },
]

function Awards({ count = 3 }) {
  return (
    <div className="awards">
      <p className="text-label-1">Badges</p>
      <ul className="awards__badges">
        {BADGES.slice(0, count).map((b) => (
          <li key={b.label}>
            <img src={b.src} width="80" height="80" alt="" />
            <span className="text-label-2">{b.label}</span>
          </li>
        ))}
      </ul>
      <p className="text-label-1">Titles</p>
      <ul className="awards__titles">
        {TITLES.map((t) => (
          <li key={t.label}>
            <img src={t.src} width="270" height="82" alt="" />
            <span className="text-label-2">{t.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EditProfileModal({ person, onClose }) {
  const { editProfile, showToast } = useDemo()
  const [form, setForm] = useState({ title: person.title, city: person.city, phone: person.phone, bio: person.bio })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <Modal open onClose={onClose} width={600} title="Edit profile">
      <div className="profile-form">
        <div className="profile-form__row">
          <div>
            <FieldLabel htmlFor="pf-title">Role / title</FieldLabel>
            <TextField id="pf-title" value={form.title} onChange={set('title')} />
          </div>
          <div>
            <FieldLabel htmlFor="pf-city">Location</FieldLabel>
            <TextField id="pf-city" value={form.city} onChange={set('city')} />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="pf-phone">Phone</FieldLabel>
          <TextField id="pf-phone" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <FieldLabel htmlFor="pf-bio">About</FieldLabel>
          <TextField id="pf-bio" multiline value={form.bio} onChange={set('bio')} />
        </div>
      </div>
      <div className="modal__footer">
        <Button color="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            editProfile(form)
            showToast({ variant: 'success', parts: [['Profile updated', true]], time: 'Now', category: 'Event' })
            onClose()
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  )
}

export default function Profile() {
  const { id } = useParams() // present on /volunteers/:id (admin viewing a volunteer)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const demo = useDemo()
  const { role, volunteer, admin, profiles, adminToggleSaved, setNote } = demo
  const { openRegistration, openCancelRegistration, toggleSave } = useEventFlows()
  const adminEvents = useAdminEvents()
  const [editing, setEditing] = useState(false)
  const [editingNote, setEditingNote] = useState(false)

  // ---- who are we looking at? ----
  const mode = id ? 'admin-view' : role === 'admin' ? 'admin-self' : 'volunteer-self'
  const v = id ? volunteersById[id] : null

  const person = useMemo(() => {
    if (mode === 'admin-view') {
      if (!v) return null
      return {
        fullName: v.name,
        first: v.first,
        title: v.type,
        city: v.city,
        email: v.email,
        phone: v.phone,
        joined: v.joined.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        bio: `Hi my name is ${v.first}! I’m a volunteer with Dress for Success Pittsburgh, where I help support community events and donation organization. I enjoy contributing to opportunities that help women feel prepared, confident, and supported in their career journeys.`,
        photo: id === 'v02' ? johnPhoto : null,
      }
    }
    const base = PERSONAS[role]
    return { ...base, ...profiles?.[role], first: base.name, photo: role === 'admin' ? sarahPhoto : null }
  }, [mode, v, id, role, profiles])

  const isVolunteerLayout = mode !== 'admin-self'
  const tabs = isVolunteerLayout
    ? [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'attended', label: 'Attended' },
        { value: 'awards', label: 'Awards' },
      ]
    : [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'previous', label: 'Previous' },
      ]
  const tab = tabs.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'upcoming'

  // ---- events + stats for this person ----
  const { upcoming, past, stats } = useMemo(() => {
    if (mode === 'volunteer-self') {
      const up = events.filter((e) => e.start >= TODAY && volunteer.registered.includes(e.id))
      const att = volunteer.attended.map((x) => eventsById[x]).sort((a, b) => b.start - a.start)
      const total = att.length + volunteerHistory.eventsBefore
      return {
        upcoming: up,
        past: att,
        stats: {
          hours: Math.round(att.reduce((s, e) => s + hoursBetween(e.start, e.end), 0) + volunteerHistory.hoursBefore),
          events: total,
          rate: Math.round((total / (total + volunteerHistory.missedEvents)) * 100),
        },
      }
    }
    if (mode === 'admin-view') {
      const mine = adminEvents.filter((e) => e.signups.includes(id) && e.status !== 'cancelled')
      return {
        upcoming: mine.filter((e) => e.start >= TODAY),
        past: mine.filter((e) => e.start < TODAY).sort((a, b) => b.start - a.start),
        stats: v ? { hours: v.hours, events: v.eventsAttended, rate: v.attendanceRate } : null,
      }
    }
    const mine = adminEvents.filter((e) => e.organizer === 'me')
    return { upcoming: mine.filter((e) => e.start >= TODAY), past: mine.filter((e) => e.start < TODAY), stats: null }
  }, [mode, volunteer, adminEvents, id, v])

  if (!person) {
    return (
      <p className="text-body">
        Volunteer not found. <Link to="/events">Back to events</Link>
      </p>
    )
  }

  const cardFor = (e) => {
    if (mode === 'volunteer-self') {
      const status = volunteer.attended.includes(e.id) ? 'attended' : volunteer.registered.includes(e.id) ? 'registered' : 'open'
      return (
        <EventCard
          key={e.id}
          event={e}
          cta={<EventCta status={status} saved={volunteer.saved.includes(e.id)} onToggleSaved={() => toggleSave(e)} onRegister={() => openRegistration(e)} onUnregister={() => openCancelRegistration(e)} />}
        />
      )
    }
    return (
      <EventCard
        key={e.id}
        event={{ ...e, title: e.name ?? e.title }}
        onOpen={() => navigate(`/events/${e.id}`)}
        cta={<AdminEventCta count={e.signups.length} saved={admin.saved.includes(e.id)} onToggleSaved={() => adminToggleSaved(e.id)} />}
      />
    )
  }

  const list = tab === 'upcoming' ? upcoming : past
  const note = id ? admin.notes[id] ?? 'Prefers weekend events. Good with check-in table. Has helped at Washington location multiple times.' : ''

  return (
    <div className="profile">
      <div className="profile__cover" aria-hidden="true" />

      <div className="profile__grid">
        <div className="profile__main">
          <div className="profile__avatar">
            {person.photo ? <img src={person.photo} alt="" /> : <Avatar name={person.fullName} size={200} tone="purple" />}
            {mode !== 'admin-view' && (
              <button type="button" className="profile__avatar-edit" aria-label="Change photo" onClick={() => setEditing(true)}>
                <Pencil size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="profile__identity">
            <div>
              <h1 className="profile__name">
                {person.fullName}
                <BadgeCheck size={20} strokeWidth={1.75} aria-label="Verified" />
                {isVolunteerLayout && <Star size={20} strokeWidth={1.5} fill="#fae977" color="#bb7a34" aria-label="Top volunteer" />}
              </h1>
              <p className="text-label-2 profile__sub">
                {person.title} <span aria-hidden="true">|</span> {person.city}
              </p>
            </div>
            {mode !== 'admin-view' && (
              <Button color="secondary" size="sm" className="profile__edit" onClick={() => setEditing(true)}>
                Edit profile
              </Button>
            )}
          </div>
          <p className="text-label-2 profile__bio">{person.bio}</p>

          {stats && (
            <>
              <button type="button" className="profile__year text-label-2">
                2026 <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
              </button>
              <div className="profile__stats">
                <StatTile label="Total volunteer hours" value={stats.hours} unit="hours" />
                <StatTile label="Total events attended" value={stats.events} unit="events" />
                <StatTile label="Attendance rate" value={stats.rate} unit="%" />
              </div>
            </>
          )}

          <h2 className="text-heading-2 profile__events-title">{person.first}’s Events</h2>
          <TabNav label="Profile sections" tabs={tabs} value={tab} onChange={(t) => setParams(t === 'upcoming' ? {} : { tab: t })} />

          {tab === 'awards' ? (
            <Awards />
          ) : (
            <div className="profile__list">
              <EventHeader label={tab === 'upcoming' ? 'Coming up' : 'Earlier'} count={list.length}>
                {list.length ? list.map(cardFor) : <EventCardEmpty icon={Handshake}>{tab === 'upcoming' ? 'No upcoming events yet' : 'No past events yet'}</EventCardEmpty>}
              </EventHeader>
            </div>
          )}
        </div>

        <aside className="profile__side">
          <p className="profile__joined text-label-2">
            <span>Joined</span> {person.joined}
          </p>
          <section className="profile__contact">
            <h2 className="text-heading-2">Contact</h2>
            <ul className="text-label-2">
              <li>
                <Mail size={20} strokeWidth={1.5} aria-hidden="true" /> {person.email}
              </li>
              <li>
                <Phone size={20} strokeWidth={1.5} aria-hidden="true" /> {person.phone}
              </li>
              {mode === 'admin-view' && (
                <li>
                  <Tag size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span className="profile__tags">
                    {VOLUNTEER_TAGS.map((t) => (
                      <Tags key={t.label} color={t.tone}>
                        {t.label}
                      </Tags>
                    ))}
                  </span>
                </li>
              )}
            </ul>
          </section>

          {mode === 'admin-view' && (
            <section className="profile__notes">
              <div className="profile__notes-head">
                <h2 className="text-heading-2">Admin Notes</h2>
                <button type="button" aria-label={editingNote ? 'Done editing notes' : 'Edit notes'} onClick={() => setEditingNote((x) => !x)}>
                  <Pencil size={20} strokeWidth={1.5} />
                </button>
              </div>
              {editingNote ? (
                <textarea
                  className="profile__notes-box text-label-2"
                  autoFocus
                  value={note}
                  onChange={(e) => setNote(id, e.target.value)}
                  onBlur={() => setEditingNote(false)}
                  aria-label="Admin notes"
                />
              ) : (
                <p className="profile__notes-box text-label-2" onDoubleClick={() => setEditingNote(true)}>
                  {note || 'No notes yet.'}
                </p>
              )}
            </section>
          )}
        </aside>
      </div>

      {editing && <EditProfileModal person={person} onClose={() => setEditing(false)} />}
    </div>
  )
}
