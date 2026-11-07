// Figma: Components › Survey Card (node 874:24838)
import { useCallback, useRef, useState } from 'react'
import { CircleHelp, Ellipsis, MapPin, Users } from 'lucide-react'
import { MONTHS } from '../../lib/dates.js'
import { useDismiss } from '../../lib/useDismiss.js'
import Tags from '../Tags/Tags.jsx'
import StatusPill from '../StatusPill/StatusPill.jsx'
import './SurveyCard.css'

const t12 = (d) => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`
const ampm = (d) => (d.getHours() < 12 ? 'AM' : 'PM')

/** @param {{label: string, onClick: Function}[]} [menu] items for the "…" menu */
export default function SurveyCard({ survey, layout = 'grid', onViewEvent, onViewResults, menu = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  const s = survey

  return (
    <article className={`survey-card survey-card--${layout}`}>
      {menu.length > 0 && (
        <div className="survey-card__menu" ref={ref}>
          <button type="button" aria-label="More actions" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Ellipsis size={20} strokeWidth={2} />
          </button>
          {open && (
            <div className="survey-card__menu-panel" role="menu">
              {menu.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  role="menuitem"
                  className="text-body"
                  onClick={() => {
                    close()
                    m.onClick()
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="survey-card__head">
        <div className="survey-card__date">
          <span className="text-label-2">{MONTHS[s.start.getMonth()].slice(0, 3)}</span>
          <span className="survey-card__day">{s.start.getDate()}</span>
        </div>
        <div className="survey-card__title">
          <div className="survey-card__title-row">
            <h3>{s.title}</h3>
            <StatusPill status={s.status} />
          </div>
          <p className="text-label-2">
            {t12(s.start)}-{t12(s.end)} {ampm(s.end)}
          </p>
        </div>
      </div>

      <p className="survey-card__meta text-label-2">
        <span>
          <CircleHelp size={16} strokeWidth={1.75} aria-hidden="true" /> {s.questions.length} questions
        </span>
        <span>
          <Users size={16} strokeWidth={1.75} aria-hidden="true" /> {s.responses} responses
        </span>
      </p>

      <div className="survey-card__foot">
        <p className="survey-card__meta text-label-2">
          <span>
            Organized by <strong>{s.organizer}</strong>
          </span>
          <span>
            <MapPin size={16} strokeWidth={1.75} aria-hidden="true" /> {s.county}
          </span>
        </p>
        <div className="survey-card__tags">
          {s.tags.slice(0, 3).map((t) => (
            <Tags key={t.label} color={t.tone}>
              {t.label}
            </Tags>
          ))}
        </div>
        <div className="survey-card__actions">
          <button type="button" className="survey-card__btn survey-card__btn--outline text-label-2" onClick={onViewEvent}>
            View event
          </button>
          <button type="button" className="survey-card__btn survey-card__btn--solid text-label-2" onClick={onViewResults}>
            View results
          </button>
        </div>
      </div>
    </article>
  )
}
