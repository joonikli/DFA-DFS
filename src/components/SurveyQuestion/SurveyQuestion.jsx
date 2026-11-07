// Figma: Components › Survey-question (node 1366:21498)
// Variants: Checklist | Rate | Any (free text) | Times — plus Rating star (node 1366:21537)
// and Answer question (node 2263:29739: MCQ | FRQ | Mix) for numbered, boxed questions.
import starFilled from '../../assets/rating-star-filled.svg'
import starEmpty from '../../assets/rating-star-empty.svg'
import { Checkbox, Radio, TextField } from '../Field/Field.jsx'
import './SurveyQuestion.css'

export function RatingStars({ value = 0, onChange, max = 5, size = 66 }) {
  return (
    <div className="rating-stars" role="radiogroup" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="rating-stars__star"
          onClick={() => onChange(n)}
        >
          <img src={n <= value ? starFilled : starEmpty} width={size} height={size} alt="" />
        </button>
      ))}
    </div>
  )
}

/**
 * One question. `question` shape (see src/mock/surveys.js):
 *   { id, type: 'rating'|'text'|'choice'|'checklist', prompt, required?, options?, other?, placeholder? }
 * @param {number} [number]  shows "Q #n" and draws the boxed "Answer question" style
 */
export default function SurveyQuestion({ question: q, value, onChange, number }) {
  const set = (patch) => onChange({ ...(value || {}), ...patch })
  const answer = value?.answer

  const body = (
    <>
      {q.type === 'rating' && <RatingStars value={answer} onChange={(n) => set({ answer: n })} />}
      {q.type === 'text' && (
        <TextField
          multiline={!!number}
          placeholder={q.placeholder ?? (number ? 'Type response here' : '')}
          value={answer ?? ''}
          onChange={(e) => set({ answer: e.target.value })}
          aria-label={q.prompt}
        />
      )}
      {q.type === 'choice' && (
        <div className="survey-q__options">
          {q.options.map((opt) => (
            <Radio key={opt} name={q.id} label={opt} checked={answer === opt} onChange={() => set({ answer: opt })} />
          ))}
          {q.other && answer === q.options[q.options.length - 1] && (
            <TextField
              placeholder={q.other}
              value={value?.other ?? ''}
              onChange={(e) => set({ other: e.target.value })}
              aria-label={q.other}
              autoFocus
            />
          )}
          {q.other && answer !== q.options[q.options.length - 1] && (
            <TextField placeholder={q.other} disabled aria-label={q.other} />
          )}
        </div>
      )}
      {q.type === 'checklist' && (
        <div className="survey-q__options">
          {q.options.map((opt) => {
            const list = answer || []
            return (
              <Checkbox
                key={opt}
                label={opt}
                checked={list.includes(opt)}
                onChange={() => set({ answer: list.includes(opt) ? list.filter((x) => x !== opt) : [...list, opt] })}
              />
            )
          })}
        </div>
      )}
    </>
  )

  const prompt = (
    <p className="survey-q__prompt text-body">
      {number != null && <span className="survey-q__num text-body-2">Q #{number}</span>}
      <span className={number != null ? 'text-body-2' : ''}>
        {q.prompt}
        {q.required && <span className="survey-q__req">*</span>}
      </span>
    </p>
  )

  const Tag = number != null ? 'fieldset' : 'div'
  return (
    <Tag className={`survey-q ${number != null ? 'survey-q--boxed' : ''}`}>
      {prompt}
      {body}
    </Tag>
  )
}
