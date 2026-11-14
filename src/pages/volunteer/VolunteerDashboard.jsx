// Figma: Final › Dashboard › Dashboard Volunteer (2324:47841)
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Announcement from '../../components/Announcement/Announcement.jsx'
import EventCalendar from '../../components/EventCalendar/EventCalendar.jsx'
import SmallEventCard from '../../components/SmallEventCard/SmallEventCard.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import EventCta from '../../components/EventCta/EventCta.jsx'
import StatTile from '../../components/StatTile/StatTile.jsx'
import PillButton from '../../components/PillButton/PillButton.jsx'
import SurveyQuestion from '../../components/SurveyQuestion/SurveyQuestion.jsx'
import Banner from '../../components/Banner/Banner.jsx'
import AwardPopup from '../../features/awards/AwardPopup.jsx'
import mariko from '../../assets/people/mariko-takahashi.png'
import { events, eventsById, volunteerHistory } from '../../mock/events.js'
import { TODAY } from '../../mock/today.js'
import { MONTHS, hoursBetween, sameDay } from '../../lib/dates.js'
import { PERSONAS, useDemo } from '../../store/DemoStore.jsx'
import { useEventFlows } from '../../features/events/EventFlows.jsx'
import './VolunteerDashboard.css'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const longDate = (d) => `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
const pct = (now, before) => (before ? Math.round(((now - before) / before) * 100) : 0)
const signed = (n) => `${n >= 0 ? '+' : ''}${n}%`
const TONES = ['green', 'pink', 'blue', 'yellow']
/** "14:30" → "2:30" */
const to12h = (t) => {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}`
}

const ANNOUNCEMENT = {
  id: 'ann-1',
  author: 'Mariko Takahashi',
  time: 'Saturday, 10:30 AM',
  title: 'Warehouse Wednesday announcement',
  body: 'For everyone who is attending the Warehouse Wednesday event next week, please remember to bring your ID or some form of identification so we can check you in at the entrance! This is a safety precaution to make sure that everyone will have a comfortable experience. Thank you for your cooperation and sorry for any inconvenience.',
}

/** Quick 2-question survey card ("How was Boutique?") */
function QuickSurvey({ event }) {
  const { submitSurvey, showToast } = useDemo()
  const [answers, setAnswers] = useState({})
  const questions = [
    { id: 'rating', type: 'rating', prompt: 'What would you rate this event?' },
    { id: 'feedback', type: 'text', prompt: 'Any issues or feedback?' },
  ]
  return (
    <form
      className="vdash-card vdash-survey"
      onSubmit={(e) => {
        e.preventDefault()
        submitSurvey(event.id, answers)
        showToast({
          variant: 'success',
          parts: [['Thanks!', true], [' Your feedback for ', false], [event.title, true], [' was sent.', false]],
          time: 'Now',
          category: 'Event',
        })
      }}
    >
      <div className="vdash-card__head">
        <p className="text-body vdash-muted">Survey</p>
        <h2 className="text-heading-2">How was {event.title}?</h2>
        <p className="text-body vdash-muted">{longDate(event.start)}</p>
      </div>
      {questions.map((q) => (
        <SurveyQuestion key={q.id} question={q} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
      ))}
      <PillButton variant="inverse" block type="submit" disabled={!answers.rating?.answer}>
        Submit
      </PillButton>
    </form>
  )
}

export default function VolunteerDashboard() {
  const navigate = useNavigate()
  const { volunteer, dismissAnnouncement, markPostEventSeen } = useDemo()
  const { openRegistration, openPostEvent, openSurveyResponse, toggleSave } = useEventFlows()
  const [calMonth, setCalMonth] = useState(TODAY)
  const [showAward, setShowAward] = useState(false)

  const attended = useMemo(
    () => volunteer.attended.map((id) => eventsById[id]).sort((a, b) => b.start - a.start),
    [volunteer.attended],
  )
  const upcoming = useMemo(
    () =>
      events
        .filter((e) => e.start >= TODAY && volunteer.registered.includes(e.id))
        .sort((a, b) => a.start - b.start),
    [volunteer.registered],
  )
  const recommended = events
    .filter((e) => e.start >= TODAY && e.recommended && !volunteer.registered.includes(e.id))
    .slice(0, 2)
  const pendingSurvey = attended.find((e) => !volunteer.surveyResponses[e.id])
  const pastSurveys = attended.filter((e) => volunteer.surveyResponses[e.id])

  // "Thank you for volunteering" popup once for the most recent attended event.
  const latest = attended[0]
  const shouldThank = latest && volunteer.postEventSeenFor !== latest.id && !volunteer.surveyResponses[latest.id]
  useEffect(() => {
    if (!shouldThank) return
    const t = setTimeout(() => {
      markPostEventSeen(latest.id) // only once, even across refreshes
      openPostEvent(latest)
    }, 600)
    return () => clearTimeout(t)
  }, [shouldThank, latest, markPostEventSeen, openPostEvent])

  // ---- stats ----
  const inMonth = (e, offset) => {
    const m = new Date(TODAY.getFullYear(), TODAY.getMonth() + offset, 1)
    return e.start.getMonth() === m.getMonth() && e.start.getFullYear() === m.getFullYear()
  }
  const hours = (list) => list.reduce((s, e) => s + hoursBetween(e.start, e.end), 0)
  const thisMonth = attended.filter((e) => inMonth(e, 0))
  const lastMonth = attended.filter((e) => inMonth(e, -1))
  const totalHours = Math.round(hours(attended) + volunteerHistory.hoursBefore)
  const totalEvents = attended.length + volunteerHistory.eventsBefore
  const rate = Math.round((totalEvents / (totalEvents + volunteerHistory.missedEvents)) * 100)
  const programs = [...new Set(attended.map((e) => e.title))].slice(0, 3)

  const programsCount = new Set(upcoming.map((e) => e.program)).size

  return (
    <div className="vdash">
      <h1 className="text-heading-1 vdash__greeting">Hi {PERSONAS.volunteer.name}, let’s see what’s going on...</h1>

      {!volunteer.dismissedAnnouncements.includes('award-banner') && (
        <Banner
          type="blue"
          title="Congratulations! You’re our top 15% of volunteers for hours this year!"
          cta="View award"
          onCta={() => setShowAward(true)}
          onClose={() => dismissAnnouncement('award-banner')}
        />
      )}
      {showAward && <AwardPopup onClose={() => setShowAward(false)} />}

      {!volunteer.dismissedAnnouncements.includes(ANNOUNCEMENT.id) && (
        <Announcement
          {...ANNOUNCEMENT}
          avatar={mariko}
          onAction={() => navigate(`/messages?ann=${ANNOUNCEMENT.id}`)}
          onDismiss={() => dismissAnnouncement(ANNOUNCEMENT.id)}
        />
      )}

      <section className="vdash-card vdash-schedule">
        <div className="vdash-schedule__calendar">
          <EventCalendar
            month={calMonth}
            onMonthChange={setCalMonth}
            selected={TODAY}
            legend={null}
            dotFor={(d) => {
              const onDay = events.filter((e) => sameDay(e.start, d))
              if (!onDay.length) return null
              return onDay.some((e) => volunteer.registered.includes(e.id) || volunteer.attended.includes(e.id)) ? 'registered' : 'event'
            }}
            onSelect={() => navigate('/events')}
          />
        </div>
        <div className="vdash-schedule__list">
          <div className="vdash-schedule__head">
            <div>
              <h2 className="text-heading-2">Upcoming events</h2>
              <p className="text-label-2 vdash-muted">
                {upcoming.length} scheduled shift{upcoming.length === 1 ? '' : 's'} across {programsCount} program
                {programsCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="vdash-schedule__actions">
              <PillButton onClick={() => navigate('/events?tab=registered')}>See all</PillButton>
              <button type="button" className="vdash-plus" aria-label="Find events to register for" onClick={() => navigate('/events')}>
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className="vdash-schedule__scroll">
            {upcoming.length ? (
              upcoming.map((e, i) => {
                const showMonth = i === 0 || upcoming[i - 1].start.getMonth() !== e.start.getMonth()
                const reg = volunteer.registrations[e.id]
                return (
                  <div key={e.id} className="vdash-schedule__item">
                    {showMonth && (
                      <p className="text-label-1">
                        {MONTHS[e.start.getMonth()]} {e.start.getFullYear()}
                      </p>
                    )}
                    <SmallEventCard
                      event={e}
                      subtitle={reg ? `Your shift: ${to12h(reg.from)} - ${to12h(reg.to)}` : undefined}
                      onClick={() => navigate('/events?tab=registered')}
                    />
                  </div>
                )
              })
            ) : (
              <p className="text-body vdash-muted">You’re not registered for any upcoming events.</p>
            )}
          </div>
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="vdash-card vdash-recommended">
          <div className="vdash-card__head">
            <p className="text-body vdash-muted">Recommended events</p>
            <h2 className="text-heading-2">These are some events that you might be interested in based on your profile...</h2>
          </div>
          <div className="vdash-recommended__list">
            {recommended.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                cta={
                  <EventCta
                    status="open"
                    saved={volunteer.saved.includes(e.id)}
                    onToggleSaved={() => toggleSave(e)}
                    onRegister={() => openRegistration(e)}
                  />
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className="vdash-stats" aria-label="Your stats">
        <StatTile
          label="Total hours volunteered"
          value={totalHours}
          unit="hours"
          delta={`${signed(pct(hours(thisMonth), hours(lastMonth)))} from last month`}
        />
        <StatTile
          label="Total events attended"
          value={totalEvents}
          unit="events"
          delta={`${signed(pct(thisMonth.length, lastMonth.length))} from last month`}
        />
        <StatTile
          label="Attendance rate"
          value={rate}
          unit="%"
          delta={`${signed(rate - volunteerHistory.attendanceRateLastMonth)} from last month`}
        />
        <StatTile label="Activities">
          <ul className="vdash-activities">
            {programs.map((p, i) => (
              <li key={p} className="text-subheading">
                <span className={`vdash-swatch vdash-swatch--${TONES[i % TONES.length]}`} aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </StatTile>
      </section>

      <section className="vdash-surveys">
        {pendingSurvey ? (
          <QuickSurvey key={pendingSurvey.id} event={pendingSurvey} />
        ) : (
          <div className="vdash-card vdash-survey">
            <p className="text-body vdash-muted">Survey</p>
            <h2 className="text-heading-2">You’re all caught up!</h2>
            <p className="text-body vdash-muted">Thanks for sharing feedback on every event you attended.</p>
          </div>
        )}
        <div className="vdash-card vdash-past">
          <p className="text-body vdash-muted">My past surveys</p>
          <ul className="vdash-past__list">
            {pastSurveys.map((e) => (
              <li key={e.id}>
                <div>
                  <p className="text-body-2">{e.title}</p>
                  <p className="text-body vdash-muted">{longDate(e.start)}</p>
                </div>
                <PillButton onClick={() => openSurveyResponse(e)}>View survey</PillButton>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
