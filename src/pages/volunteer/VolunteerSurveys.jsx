// Volunteer › Surveys. Not designed in Figma — composed from existing pieces
// (SmallEventCard, PillButton, EventCalendar) so the sidebar link isn't a dead end.
// Same frame as the volunteer Events page: survey lists on the left, a right column with the
// calendar and the volunteer's upcoming events so they see what's next from here too.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '../../layout/AppShell.jsx'
import SmallEventCard from '../../components/SmallEventCard/SmallEventCard.jsx'
import PillButton from '../../components/PillButton/PillButton.jsx'
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx'
import Banner from '../../components/Banner/Banner.jsx'
import EventCalendar from '../../components/EventCalendar/EventCalendar.jsx'
import { events, eventsById } from '../../mock/events.js'
import { TODAY } from '../../mock/today.js'
import { sameDay } from '../../lib/dates.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { useEventFlows } from '../../features/events/EventFlows.jsx'
import './VolunteerSurveys.css'

const UPCOMING_SHOWN = 3

export default function VolunteerSurveys() {
  const { volunteer } = useDemo()
  const { openSurvey, openSurveyResponse } = useEventFlows()
  const navigate = useNavigate()
  const [calMonth, setCalMonth] = useState(TODAY)
  const attended = volunteer.attended.map((id) => eventsById[id]).sort((a, b) => b.start - a.start)
  const pending = attended.filter((e) => !volunteer.surveyResponses[e.id])
  const done = attended.filter((e) => volunteer.surveyResponses[e.id])
  const upcoming = volunteer.registered.map((id) => eventsById[id]).filter((e) => e && e.start >= TODAY).sort((a, b) => a.start - b.start)

  // Attended events open on their own page (the Attended tab's view of it)
  const viewEvent = (e) => navigate(`/events/${e.id}?from=attended`)

  // Calendar: same dots, tips and day clicks as the volunteer Events page
  const signedUp = (e) => volunteer.registered.includes(e.id) || volunteer.attended.includes(e.id)
  const dotFor = (date) => {
    const onDay = events.filter((e) => sameDay(e.start, date))
    if (!onDay.length) return null
    return onDay.some(signedUp) ? 'registered' : 'event'
  }
  const tipFor = (date) => (dotFor(date) === 'event' ? events.filter((e) => sameDay(e.start, date)).map((e) => e.title).join(', ') : null)
  const selectDay = (d) => {
    const onDay = events.filter((e) => sameDay(e.start, d))
    if (onDay.length === 1) navigate(`/events/${onDay[0].id}`)
    else if (onDay.length) navigate('/events')
  }

  const section = (title, list, action) => (
    <section className="volunteer-surveys__section">
      <h2 className="text-subheading volunteer-surveys__label">
        {title} <span>{list.length}</span>
      </h2>
      {list.length ? (
        list.map((e) => <SmallEventCard key={e.id} event={e} actions={action(e)} />)
      ) : (
        <p className="text-body volunteer-surveys__empty">Nothing here right now.</p>
      )}
    </section>
  )

  return (
    <div className="volunteer-surveys">
      <PageHeader title="Your surveys" subtitle="Share feedback on events you attended" />
      <div className="volunteer-surveys__body">
        <div className="volunteer-surveys__main">
          {pending.length > 0 && (
            <Banner type="pink" title="Thanks for volunteering with us! Before you go…" cta="Take our survey" onCta={() => openSurvey(pending[0])} />
          )}
          {section('To do', pending, (e) => (
            <span className="volunteer-surveys__actions">
              <StatusBadge color="red">Survey missing</StatusBadge>
              <PillButton onClick={() => viewEvent(e)}>View event</PillButton>
              <PillButton variant="inverse" onClick={() => openSurvey(e)}>
                Take survey
              </PillButton>
            </span>
          ))}
          {section('Submitted', done, (e) => (
            <span className="volunteer-surveys__actions">
              <StatusBadge color="green">Survey complete</StatusBadge>
              <PillButton onClick={() => viewEvent(e)}>View event</PillButton>
              <PillButton onClick={() => openSurveyResponse(e)}>View survey</PillButton>
            </span>
          ))}
        </div>

        <aside className="volunteer-surveys__aside" aria-label="Your calendar and upcoming events">
          <EventCalendar
            month={calMonth}
            onMonthChange={setCalMonth}
            dotFor={dotFor}
            variant="dashboard"
            today={TODAY}
            tipFor={tipFor}
            onSelect={selectDay}
          />
          <section className="volunteer-surveys__upcoming" aria-labelledby="vs-upcoming-title">
            <p className="text-subheading" id="vs-upcoming-title">Upcoming events</p>
            {upcoming.length ? (
              upcoming.slice(0, UPCOMING_SHOWN).map((e) => <SmallEventCard key={e.id} event={e} onClick={() => navigate(`/events/${e.id}?from=registered`)} />)
            ) : (
              <p className="text-body volunteer-surveys__empty">You’re not registered for any upcoming events yet.</p>
            )}
            <Link to={upcoming.length ? '/events?tab=registered' : '/events'} className="volunteer-surveys__link text-label-2">
              {upcoming.length ? 'See all your events' : 'Find events'} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
