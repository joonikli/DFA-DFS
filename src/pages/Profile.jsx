// Figma: Final › Profiles (section 2324:48566)
// Volunteer view: Maureen's own profile at /profile (Upcoming / Attended / Awards).
// The admin view of profiles (Bridget's own, and any volunteer) is bev's screen at /people
// (src/features/profiles/, see src/App.jsx).
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BadgeCheck, ChevronDown, Handshake, Mail, Pencil, Phone, Star } from 'lucide-react'
import TabNav from '../components/TabNav/TabNav.jsx'
import Modal from '../components/Modal/Modal.jsx'
import Button from '../components/Button/Button.jsx'
import Avatar from '../components/Avatar/Avatar.jsx'
import StatTile from '../components/StatTile/StatTile.jsx'
import EventHeader from '../components/EventHeader/EventHeader.jsx'
import EventCard, { EventCardEmpty } from '../components/EventCard/EventCard.jsx'
import EventCta from '../components/EventCta/EventCta.jsx'
import { FieldLabel, TextField } from '../components/Field/Field.jsx'
import { useEventFlows } from '../features/events/EventFlows.jsx'
import { events, eventsById, volunteerHistory } from '../mock/events.js'
import { TODAY } from '../mock/today.js'
import { hoursBetween } from '../lib/dates.js'
import { PERSONAS, useDemo } from '../store/DemoStore.jsx'
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
const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'attended', label: 'Attended' },
  { value: 'awards', label: 'Awards' },
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
  const [params, setParams] = useSearchParams()
  const { volunteer, profiles } = useDemo()
  const { openRegistration, openCancelRegistration, toggleSave } = useEventFlows()
  const [editing, setEditing] = useState(false)

  const base = PERSONAS.volunteer
  const person = { ...base, ...profiles?.volunteer, first: base.name, photo: null }
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'upcoming'

  // ---- events + stats ----
  const { upcoming, past, stats } = useMemo(() => {
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
  }, [volunteer])

  const cardFor = (e) => {
    const status = volunteer.attended.includes(e.id) ? 'attended' : volunteer.registered.includes(e.id) ? 'registered' : 'open'
    return (
      <EventCard
        key={e.id}
        event={e}
        cta={<EventCta status={status} saved={volunteer.saved.includes(e.id)} onToggleSaved={() => toggleSave(e)} onRegister={() => openRegistration(e)} onUnregister={() => openCancelRegistration(e)} />}
      />
    )
  }

  const list = tab === 'upcoming' ? upcoming : past

  return (
    <div className="profile">
      <div className="profile__cover" aria-hidden="true" />

      <div className="profile__grid">
        <div className="profile__main">
          <div className="profile__avatar">
            {person.photo ? <img src={person.photo} alt="" /> : <Avatar name={person.fullName} size={200} tone="purple" />}
            <button type="button" className="profile__avatar-edit" aria-label="Change photo" onClick={() => setEditing(true)}>
              <Pencil size={14} strokeWidth={2} />
            </button>
          </div>

          <div className="profile__identity">
            <div>
              <h1 className="profile__name">
                {person.fullName}
                <BadgeCheck size={20} strokeWidth={1.75} aria-label="Verified" />
                <Star size={20} strokeWidth={1.5} fill="#fae977" color="#bb7a34" aria-label="Top volunteer" />
              </h1>
              <p className="text-label-2 profile__sub">
                {person.title} <span aria-hidden="true">|</span> {person.city}
              </p>
            </div>
            <Button color="secondary" size="sm" className="profile__edit" onClick={() => setEditing(true)}>
              Edit profile
            </Button>
          </div>
          <p className="text-label-2 profile__bio">{person.bio}</p>

          <button type="button" className="profile__year text-label-2">
            2026 <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
          </button>
          <div className="profile__stats">
            <StatTile label="Total volunteer hours" value={stats.hours} unit="hours" />
            <StatTile label="Total events attended" value={stats.events} unit="events" />
            <StatTile label="Attendance rate" value={stats.rate} unit="%" />
          </div>

          <h2 className="text-heading-2 profile__events-title">{person.first}’s Events</h2>
          <TabNav label="Profile sections" tabs={TABS} value={tab} onChange={(t) => setParams(t === 'upcoming' ? {} : { tab: t })} />

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
            </ul>
          </section>
        </aside>
      </div>

      {editing && <EditProfileModal person={person} onClose={() => setEditing(false)} />}
    </div>
  )
}
