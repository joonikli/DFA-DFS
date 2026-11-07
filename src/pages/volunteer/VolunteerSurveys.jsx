// Volunteer › Surveys. Not designed in Figma — composed from existing pieces
// (SmallEventCard, PillButton) so the sidebar link isn't a dead end.
import { PageHeader } from '../../layout/AppShell.jsx'
import SmallEventCard from '../../components/SmallEventCard/SmallEventCard.jsx'
import PillButton from '../../components/PillButton/PillButton.jsx'
import StatusBadge from '../../components/StatusBadge/StatusBadge.jsx'
import Banner from '../../components/Banner/Banner.jsx'
import { eventsById } from '../../mock/events.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { useEventFlows } from '../../features/events/EventFlows.jsx'

export default function VolunteerSurveys() {
  const { volunteer } = useDemo()
  const { openSurvey, openSurveyResponse } = useEventFlows()
  const attended = volunteer.attended.map((id) => eventsById[id]).sort((a, b) => b.start - a.start)
  const pending = attended.filter((e) => !volunteer.surveyResponses[e.id])
  const done = attended.filter((e) => volunteer.surveyResponses[e.id])

  const section = (title, list, action) => (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 className="text-subheading" style={{ color: 'var(--neutral-darker-gray)', fontWeight: 400 }}>
        {title} <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-black)' }}>{list.length}</span>
      </h2>
      {list.length ? (
        list.map((e) => <SmallEventCard key={e.id} event={e} actions={action(e)} />)
      ) : (
        <p className="text-body" style={{ color: 'var(--neutral-darker-gray)' }}>
          Nothing here right now.
        </p>
      )}
    </section>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 900 }}>
      <PageHeader title="Your surveys" subtitle="Share feedback on events you attended" />
      {pending.length > 0 && (
        <Banner type="pink" title="Thanks for volunteering with us! Before you go…" cta="Take our survey" onCta={() => openSurvey(pending[0])} />
      )}
      {section('To do', pending, (e) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge color="red">Survey missing</StatusBadge>
          <PillButton variant="inverse" onClick={() => openSurvey(e)}>
            Take survey
          </PillButton>
        </span>
      ))}
      {section('Submitted', done, (e) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge color="green">Survey complete</StatusBadge>
          <PillButton onClick={() => openSurveyResponse(e)}>View survey</PillButton>
        </span>
      ))}
    </div>
  )
}
