// Figma: Final (page 781:12667) › Volunteer - Single Event (section 2530:10615)
//   Upcoming detail (2530:11017) · Saved detail (2532:41322) · Attended detail (2532:41578)
//   · Images popup (2532:41244)
// The frames differ only in the breadcrumb tab, the Event-cta state and (Attended) the
// post-event survey card, so one page renders all of them from the volunteer's live
// saved / registered / attended state.
import { useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Bookmark, Camera, ChevronLeft, ChevronRight, Link as LinkIcon, MessageCircle, UsersRound, X } from 'lucide-react'
import EventCta from '../../components/EventCta/EventCta.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import Button from '../../components/Button/Button.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import { eventsById } from '../../mock/events.js'
import { adminEventsById } from '../../mock/adminEvents.js'
import { TODAY } from '../../mock/today.js'
import { MONTHS } from '../../lib/dates.js'
import { staff, staffIdFor } from '../../mock/staff.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { useEventFlows } from '../../features/events/EventFlows.jsx'
import './VolunteerEventDetail.css'

const TAB_LABELS = { upcoming: 'Upcoming', saved: 'Saved', registered: 'Registered', attended: 'Attended' }

// "Past Event Images": real DFS Pittsburgh volunteer photos, cropped from the slideshow on
// pittsburgh.dressforsuccess.org/get-involved/volunteer/. Same set for every event (the data
// has no per-event photos).
const PAST_PHOTOS = Object.values(import.meta.glob('../../assets/events/past/*.jpg', { eager: true, import: 'default' }))

// Banner photos: one free Unsplash stock photo per event, matched to its program
// (src/assets/events/banners/<event id>.jpg).
const BANNERS = Object.fromEntries(
  Object.entries(import.meta.glob('../../assets/events/banners/*.jpg', { eager: true, import: 'default' })).map(([path, url]) => [
    path.match(/([^/]+)\.jpg$/)[1],
    url,
  ]),
)

// Mock "saved" / "shared" counts other volunteers produced (not in the data set): stable per event
const BASE_SAVED = [15, 8, 22, 4, 11, 17]
const BASE_SHARED = [3, 1, 5, 0, 2, 4]

/** "3:00pm" */
const clock = (d) => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}${d.getHours() < 12 ? 'am' : 'pm'}`
const weekday = (d) => d.toLocaleDateString('en-US', { weekday: 'long' })

/** Tabs of Your events this event is listed under (same rules as VolunteerEvents' byTab) */
function tabsOf(event, volunteer) {
  if (volunteer.attended.includes(event.id)) return ['attended']
  if (event.start < TODAY) return []
  const tabs = []
  if (volunteer.registered.includes(event.id)) tabs.push('registered')
  if (volunteer.saved.includes(event.id)) tabs.push('saved')
  if (!tabs.length) tabs.push('upcoming')
  return tabs
}

export default function VolunteerEventDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { volunteer } = useDemo()
  const { openRegistration, openCancelRegistration, toggleSave, openSurvey } = useEventFlows()
  const [expanded, setExpanded] = useState(false)
  const [photosOpen, setPhotosOpen] = useState(false)
  const [surveyDismissedFor, setSurveyDismissedFor] = useState(null)

  const event = eventsById[id]
  const admin = adminEventsById[id]
  if (!event) return <Navigate to="/events" replace />

  const saved = volunteer.saved.includes(event.id)
  const registered = volunteer.registered.includes(event.id)
  const status = volunteer.attended.includes(event.id) ? 'attended' : registered ? 'registered' : 'open'

  // Breadcrumb tab: the list the card was opened from (?from=), while the event is still in it;
  // otherwise the list it belongs to now (e.g. after registering from Upcoming).
  const tabs = tabsOf(event, volunteer)
  const from = params.get('from')
  const tab = tabs.includes(from) ? from : tabs[0]

  // Admin-facing name ("Donation Inventory Organizing") with the program as the subtitle
  const name = admin?.name || event.title
  const subtitle = name !== event.title ? event.title : null

  // Counts include the volunteer's own registration / save
  const index = Number(event.id.slice(1)) || 0
  const signedUp = admin?.signups.includes('v01')
  const registeredCount = (admin?.signups.length ?? 0) + (registered && !signedUp ? 1 : 0) - (!registered && signedUp ? 1 : 0)
  const savedCount = BASE_SAVED[index % BASE_SAVED.length] + (saved ? 1 : 0)
  const sharedCount = BASE_SHARED[index % BASE_SHARED.length]
  const manager = admin && staff[staffIdFor(admin.organizer)]

  // Attended frame (2532:41578): "Post-event popup" card above Key Contacts until the survey is sent
  const showSurveyCard = status === 'attended' && !volunteer.surveyResponses[event.id] && surveyDismissedFor !== event.id

  const { start, end } = event

  return (
    <div className="ved">
      <nav className="ved__crumbs text-subheading" aria-label="Breadcrumb">
        <Link to="/events">Your Events</Link>
        {tab && (
          <>
            <ChevronRight size={24} strokeWidth={2} aria-hidden="true" />
            <Link to={tab === 'upcoming' ? '/events' : `/events?tab=${tab}`}>{TAB_LABELS[tab]}</Link>
          </>
        )}
        <ChevronRight size={24} strokeWidth={2} aria-hidden="true" />
        <span aria-current="page">{name}</span>
      </nav>

      <div className="ved__layout">
        <div className="ved__main">
          <div className="ved__intro">
            <div className="ved__banner" aria-hidden="true">
              {BANNERS[event.id] && <img src={BANNERS[event.id]} alt="" />}
            </div>
            <div className="ved__heading-block">
              <div className="ved__heading">
                <div className="ved__titles">
                  <h1 className="text-heading-1">{name}</h1>
                  {subtitle && <p className="ved__subtitle text-subheading">{subtitle}</p>}
                </div>
                <EventCta
                  status={status}
                  saved={saved}
                  onToggleSaved={() => toggleSave(event)}
                  onRegister={() => openRegistration(event)}
                  onUnregister={() => openCancelRegistration(event)}
                />
              </div>
              <Description text={event.longDescription || event.description} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
            </div>
          </div>

          <div className="ved__cards">
            <section className="ved__card" aria-labelledby="ved-details">
              <h2 id="ved-details" className="text-heading-2">Event Details</h2>
              <ul className="ved__facts text-body">
                <li>
                  <img src="/assets/events/detail-frame.svg" width="24" height="24" alt="Date" />
                  <span>
                    {weekday(start)}, {MONTHS[start.getMonth()]} {start.getDate()}
                    {event.weekly && ` (every ${weekday(start)})`}
                  </span>
                </li>
                <li>
                  <img src="/assets/events/detail-frame1.svg" width="24" height="24" alt="Time" />
                  <span>
                    {clock(start)} - {clock(end)}
                  </span>
                </li>
                <li>
                  <img src="/assets/events/detail-frame2.svg" width="24" height="24" alt="Location" />
                  <span className="ved__address">{event.location}</span>
                </li>
                {event.tags.length > 0 && (
                  <li className="ved__tags-row">
                    <img src="/assets/events/detail-tags.svg" width="24" height="24" alt="Tags" />
                    <span className="ved__tags">
                      {event.tags.map((t) => (
                        <Tags key={t.label} color="purple">
                          {t.label}
                        </Tags>
                      ))}
                    </span>
                  </li>
                )}
              </ul>
            </section>

            <section className="ved__card" aria-labelledby="ved-other">
              <h2 id="ved-other" className="text-heading-2">Other Information</h2>
              <ul className="ved__facts text-body">
                <li>
                  <UsersRound size={24} strokeWidth={2} aria-hidden="true" />
                  <span>{registeredCount} registered</span>
                </li>
                <li>
                  <Bookmark size={24} strokeWidth={2} aria-hidden="true" />
                  <span>{savedCount} saved</span>
                </li>
                <li>
                  <LinkIcon size={24} strokeWidth={2} aria-hidden="true" />
                  <span>{sharedCount} shared</span>
                </li>
                <li>
                  <Camera size={24} strokeWidth={2} aria-hidden="true" />
                  <button type="button" className="ved__link" onClick={() => setPhotosOpen(true)}>
                    Past event photos!
                    <ArrowUpRight size={24} strokeWidth={2} aria-hidden="true" />
                  </button>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <aside className="ved__aside">
          {showSurveyCard && (
            <section className="ved__survey" aria-labelledby="ved-survey">
              <div className="ved__survey-head">
                <h2 id="ved-survey" className="text-subheading">
                  Thank you for volunteering!
                </h2>
                <button type="button" className="ved__survey-close" aria-label="Dismiss" onClick={() => setSurveyDismissedFor(event.id)}>
                  <X size={24} strokeWidth={1.75} />
                </button>
              </div>
              <p className="ved__survey-text text-body">
                We would appreciate if you could take this survey to help us improve events for you and others :)
              </p>
              <div className="ved__survey-actions">
                <Button onClick={() => openSurvey(event)}>Take survey</Button>
              </div>
            </section>
          )}

          <section className="ved__contacts" aria-labelledby="ved-contacts">
            <h2 id="ved-contacts" className="text-heading-2">Key Contacts</h2>
            {manager && (
              <div className="ved__contact text-body">
                <img src="/assets/events/detail-frame634.svg" width="36.4469" height="36.4469" alt="" />
                <span>
                  Managed by <Link to={`/staff/${manager.id}`} className="ved__person">{manager.name}</Link>
                </span>
              </div>
            )}
            <Link to="/messages" className="ved__contact ved__contact--chat text-body">
              <span className="ved__chat-icon" aria-hidden="true">
                <MessageCircle size={20} strokeWidth={2} />
              </span>
              Contacts, Questions, Chat
              <ArrowUpRight className="ved__arrow" size={24} strokeWidth={2} aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>

      <PastPhotos open={photosOpen} onClose={() => setPhotosOpen(false)} photos={PAST_PHOTOS} />
    </div>
  )
}

/** Description clamped to 3 lines; "See more" appears only when the text is cut off. */
function Description({ text, expanded, onToggle }) {
  const ref = useRef(null)
  const [overflows, setOverflows] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text, expanded])

  return (
    <div className="ved__desc">
      <p ref={ref} id="ved-description" className={`ved__desc-text text-body ${expanded ? 'ved__desc-text--open' : ''}`}>
        {text}
      </p>
      {(overflows || expanded) && (
        <button type="button" className="ved__more text-body" aria-expanded={expanded} aria-controls="ved-description" onClick={onToggle}>
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  )
}

/** Figma: Images (2532:41244) — current photo on top, tilted, with the next one underneath. */
function PastPhotos({ open, onClose, photos }) {
  const [index, setIndex] = useState(0)
  const count = photos.length
  const close = () => {
    onClose()
    setIndex(0)
  }
  return (
    <Modal
      open={open}
      onClose={close}
      width={563}
      padding="18px 24px"
      title={<span className="ved-photos__title text-subheading">Past Event Images</span>}
    >
      <div className="ved-photos__stack">
        <img className="ved-photos__under" src={photos[(index + 1) % count]} alt="" />
        <img className="ved-photos__top" src={photos[index]} alt={`Past event photo ${index + 1} of ${count}`} />
      </div>
      <div className="ved-photos__nav">
        <Button color="secondary" aria-label="Previous photo" disabled={count < 2} onClick={() => setIndex((i) => (i - 1 + count) % count)}>
          <ChevronLeft size={16} strokeWidth={2} />
        </Button>
        <span className="btn btn--tertiary ved-photos__count text-body" aria-live="polite">
          {index + 1}/{count}
        </span>
        <Button color="secondary" aria-label="Next photo" disabled={count < 2} onClick={() => setIndex((i) => (i + 1) % count)}>
          <ChevronRight size={16} strokeWidth={2} />
        </Button>
      </div>
    </Modal>
  )
}
