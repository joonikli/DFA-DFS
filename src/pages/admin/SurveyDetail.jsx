// Figma: Final › Survey › Survey Responses - Survey specific (2324:45890)
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, ChevronRight, Filter as FilterIcon, MapPin, Pencil, Users } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import StatusPill from '../../components/StatusPill/StatusPill.jsx'
import { SelectField } from '../../components/Field/Field.jsx'
import { ChoiceBars, DonutChart } from '../../components/Charts/Charts.jsx'
import { useAdminSurveys } from '../../features/surveys/useAdminSurveys.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { MONTHS } from '../../lib/dates.js'
import './Surveys.css'

const hour = (d) => `${d.getHours() % 12 || 12}${d.getMinutes() ? `:${String(d.getMinutes()).padStart(2, '0')}` : ''}`

function QuestionHeader({ n, prompt, children }) {
  return (
    <div className="sq__head">
      <p className="sq__prompt text-label-1">
        <span className="sq__num">Q #{n}</span> {prompt}
        <Pencil size={16} strokeWidth={1.75} className="sq__edit" aria-hidden="true" />
      </p>
      {children}
    </div>
  )
}

export default function SurveyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { adminSetSurveyStatus } = useDemo()
  const survey = useAdminSurveys().find((s) => s.id === id)
  const [views, setViews] = useState({}) // questionId → 'bar' | 'pie'
  const [sorts, setSorts] = useState({}) // text questionId → sort

  if (!survey) {
    return (
      <p className="text-body">
        Survey not found. <Link to="/surveys">Back to survey responses</Link>
      </p>
    )
  }

  const s = survey
  const sortAnswers = (q) => {
    const mode = sorts[q.id] ?? 'default'
    if (mode === 'short') return [...q.answers].sort((a, b) => a.length - b.length)
    if (mode === 'long') return [...q.answers].sort((a, b) => b.length - a.length)
    return q.answers
  }

  return (
    <div className="survey-detail">
      <div className="survey-detail__top">
        <nav className="survey-detail__crumbs text-subheading" aria-label="Breadcrumb">
          <Link to="/surveys">Survey responses</Link>
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>{s.title} survey</span>
        </nav>
        <div className="survey-detail__actions">
          <button type="button" className="survey-detail__chip text-body" onClick={() => navigate(`/events/${s.eventId}`)}>
            View event <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <Button size="sm" icon="plus" onClick={() => navigate('/surveys?create=1')}>
            Create survey
          </Button>
          <button type="button" className="survey-detail__icon" aria-label="Edit survey">
            <Pencil size={18} strokeWidth={1.75} />
          </button>
          <button type="button" className="survey-detail__icon" aria-label="Filter responses">
            <FilterIcon size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <header className="survey-detail__header">
        <div className="survey-detail__intro">
          <div className="survey-detail__title-row">
            <h1 className="text-heading-1">{s.title}</h1>
            <button
              type="button"
              className="survey-detail__status"
              title="Click to toggle whether volunteers can respond"
              onClick={() => adminSetSurveyStatus(s.id, s.status === 'open' ? 'closed' : 'open')}
            >
              <StatusPill status={s.status} />
            </button>
          </div>
          <p className="text-label-2">
            Managed by <strong>{s.organizer}</strong>
          </p>
          <p className="text-label-2 survey-detail__desc">{s.description}</p>
          <div className="survey-detail__tags">
            {s.tags.map((t) => (
              <Tags key={t.label} color="purple">
                {t.label}
              </Tags>
            ))}
          </div>
        </div>
        <div className="survey-detail__facts text-label-2">
          <p className="survey-detail__responses">
            <Users size={20} strokeWidth={1.75} aria-hidden="true" /> <strong>{s.responses} responses</strong>
          </p>
          <div className="survey-detail__when">
            <p>
              <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" />
              {MONTHS[s.start.getMonth()].slice(0, 3)} {s.start.getDate()}, {s.start.getFullYear()}
              <span className="ai-dot" aria-hidden="true" />
              {hour(s.start)}-{hour(s.end)} {s.end.getHours() < 12 ? 'AM' : 'PM'}
            </p>
            <p>
              <MapPin size={16} strokeWidth={1.75} aria-hidden="true" /> {s.county}
            </p>
          </div>
        </div>
      </header>

      {s.responses === 0 && (
        <p className="survey-detail__empty text-body">No responses yet — results will appear here as volunteers submit the survey.</p>
      )}

      <div className="survey-detail__questions">
        {s.questions.map((q, i) => {
          if (q.type === 'text') {
            return (
              <section key={q.id} className="sq">
                <QuestionHeader n={i + 1} prompt={q.prompt}>
                  <SelectField
                    className="sq__select"
                    value={sorts[q.id] ?? 'default'}
                    onChange={(e) => setSorts((x) => ({ ...x, [q.id]: e.target.value }))}
                    options={[
                      { value: 'default', label: 'Sort by: Default' },
                      { value: 'short', label: 'Sort by: Shortest' },
                      { value: 'long', label: 'Sort by: Longest' },
                    ]}
                    aria-label="Sort responses"
                  />
                </QuestionHeader>
                <ul className="sq__answers">
                  {sortAnswers(q).map((a, k) => (
                    <li key={k} className="text-label-2">
                      {a}
                    </li>
                  ))}
                  {!q.answers.length && <li className="text-label-2 sq__none">No answers yet.</li>}
                </ul>
              </section>
            )
          }
          const view = views[q.id] ?? (i === s.questions.length - 1 || q.options.length > 4 ? 'pie' : 'bar')
          return (
            <section key={q.id} className="sq">
              <QuestionHeader n={i + 1} prompt={q.prompt}>
                {view === 'bar' && (
                  <SelectField
                    className="sq__select"
                    value={view}
                    onChange={(e) => setViews((x) => ({ ...x, [q.id]: e.target.value }))}
                    options={[
                      { value: 'bar', label: 'View: Bar graph' },
                      { value: 'pie', label: 'View: Pie chart' },
                    ]}
                    aria-label="Chart type"
                  />
                )}
              </QuestionHeader>
              {view === 'bar' ? <ChoiceBars options={q.options} counts={q.counts} /> : <DonutChart options={q.options} counts={q.counts} />}
            </section>
          )
        })}
      </div>
    </div>
  )
}
