// Figma: Final › Survey › Survey Responses - Home (2324:46004) / Expanded summary (2324:46080)
//        + Create survey (2324:46040)
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import Toggle from '../../components/Toggle/Toggle.jsx'
import Button from '../../components/Button/Button.jsx'
import { SelectField } from '../../components/Field/Field.jsx'
import SurveyCard from '../../components/SurveyCard/SurveyCard.jsx'
import AISummary from '../../components/AISummary/AISummary.jsx'
import { EventCardEmpty } from '../../components/EventCard/EventCard.jsx'
import SurveyBuilder from '../../features/surveys/SurveyBuilder.jsx'
import { useAdminSurveys } from '../../features/surveys/useAdminSurveys.js'
import { useAdminEvents } from '../../features/admin/useAdminEvents.js'
import { aiSummary, surveyBucket } from '../../mock/adminSurveys.js'
import { useDemo } from '../../store/DemoStore.jsx'
import './Surveys.css'

const SORTS = [
  { value: 'default', label: 'Sort by: Default' },
  { value: 'responses', label: 'Sort by: Most responses' },
  { value: 'newest', label: 'Sort by: Newest' },
  { value: 'open', label: 'Sort by: Open first' },
]

export default function SurveysHome() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { adminCreateSurvey, adminSetSurveyStatus, showToast } = useDemo()
  const surveys = useAdminSurveys()
  const events = useAdminEvents()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('default')
  const [view, setView] = useState('grid')
  const [creating, setCreating] = useState(null) // null | { eventId? }

  // /surveys?event=e09 (from an event's "View survey") → that event's survey, or start one.
  const eventParam = params.get('event')
  const createParam = params.get('create')
  useEffect(() => {
    if (createParam) {
      setCreating({})
      setParams({}, { replace: true })
    }
  }, [createParam, setParams])
  useEffect(() => {
    if (!eventParam) return
    const match = surveys.find((s) => s.eventId === eventParam)
    if (match) navigate(`/surveys/${match.id}`, { replace: true })
    else {
      setCreating({ eventId: eventParam })
      setParams({}, { replace: true })
    }
  }, [eventParam, surveys, navigate, setParams])

  const list = useMemo(() => {
    const q = query.toLowerCase()
    const filtered = surveys.filter((s) => !q || [s.title, s.organizer, s.county, ...s.tags.map((t) => t.label)].join(' ').toLowerCase().includes(q))
    const sorters = {
      default: () => 0,
      responses: (a, b) => b.responses - a.responses,
      newest: (a, b) => b.start - a.start,
      open: (a, b) => (a.status === 'open' ? -1 : 1) - (b.status === 'open' ? -1 : 1),
    }
    return [...filtered].sort(sorters[sort])
  }, [surveys, query, sort])

  const groups = [
    { key: 'week', label: 'This week', items: list.filter((s) => surveyBucket(s) === 'week') },
    { key: 'month', label: 'Past month', items: list.filter((s) => surveyBucket(s) === 'month') },
  ]

  const eventOptions = events
    .filter((e) => e.status !== 'cancelled')
    .sort((a, b) => b.start - a.start)
    .map((e) => ({ value: e.id, label: `${e.name} · ${e.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` }))

  return (
    <div className="surveys">
      <h1 className="text-subheading surveys__title">Survey responses</h1>

      <div className="surveys__toolbar">
        <SearchBar value={query} onChange={setQuery} label="Search surveys" />
        <SelectField className="surveys__sort" value={sort} onChange={(e) => setSort(e.target.value)} options={SORTS} aria-label="Sort surveys" />
        <Button size="sm" icon="plus" onClick={() => setCreating({})}>
          Create survey
        </Button>
        <Toggle value={view} onChange={setView} />
      </div>

      <AISummary
        summary={aiSummary}
        onDownload={() =>
          showToast({ variant: 'success', parts: [['Summary downloaded', true]], preview: 'AI-summary-past-week.pdf (mock)', time: 'Now', category: 'Event' })
        }
      />

      {query && !list.length ? (
        <EventCardEmpty icon={SearchX}>No surveys match “{query}”</EventCardEmpty>
      ) : (
        groups.map(
          (g) =>
            g.items.length > 0 && (
              <section key={g.key} className="surveys__group">
                <h2 className="surveys__group-title text-subheading">
                  {g.label} <span>{g.items.length}</span>
                </h2>
                <div className={`surveys__grid surveys__grid--${view}`}>
                  {g.items.map((s) => (
                    <SurveyCard
                      key={s.id}
                      survey={s}
                      layout={view}
                      onViewEvent={() => navigate(`/events/${s.eventId}`)}
                      onViewResults={() => navigate(`/surveys/${s.id}`)}
                      menu={[
                        {
                          label: s.status === 'open' ? 'Close survey' : 'Open survey',
                          onClick: () => adminSetSurveyStatus(s.id, s.status === 'open' ? 'closed' : 'open'),
                        },
                        { label: 'Copy share link', onClick: () => showToast({ variant: 'success', parts: [['Link copied', true]], preview: `dfs.org/s/${s.id}`, time: 'Now', category: 'Event' }) },
                      ]}
                    />
                  ))}
                </div>
              </section>
            ),
        )
      )}

      {creating && (
        <SurveyBuilder
          variant="standalone"
          eventOptions={eventOptions}
          defaultEventId={creating.eventId}
          onClose={() => setCreating(null)}
          onCreate={(s) => {
            adminCreateSurvey(s)
            setCreating(null)
            showToast({
              variant: 'success',
              parts: [[s.status === 'draft' ? 'Draft saved' : 'Survey published!', true]],
              preview: s.title,
              time: 'Now',
              category: 'Event',
            })
            if (s.status !== 'draft') navigate(`/surveys/${s.id}`)
          }}
        />
      )}
    </div>
  )
}
