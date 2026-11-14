// Figma: Final › Admin - Event Creation › "Create new survey" (2324:46555)
// + Components › Create question (node 1988:28946: Multiple choice | Free form)
// Used from "Create event › Add survey" and from the Surveys page.
import { useState } from 'react'
import { ChevronDown, GripVertical, Paperclip, Plus, X } from 'lucide-react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import SurveyQuestion from '../../components/SurveyQuestion/SurveyQuestion.jsx'
import { FieldLabel, SelectField, TextField } from '../../components/Field/Field.jsx'
import './SurveyBuilder.css'

let uid = 0
const newId = (p) => `${p}-${Date.now().toString(36)}-${uid++}`
const blankQuestion = (type = 'choice') => ({
  id: newId('q'),
  type,
  prompt: '',
  options: type === 'choice' ? ['This is an example sentence'] : [],
})

/** Figma "Create question": one editable question card */
function QuestionEditor({ q, n, onChange, onRemove }) {
  const set = (patch) => onChange({ ...q, ...patch })
  return (
    <div className="qe">
      <div className="qe__head">
        <GripVertical size={16} strokeWidth={1.75} className="qe__grip" aria-hidden="true" />
        <span className="qe__num text-body-2">Q #{n}</span>
        <input
          className="qe__prompt text-body"
          placeholder="Type in question here"
          value={q.prompt}
          onChange={(e) => set({ prompt: e.target.value })}
          aria-label={`Question ${n}`}
        />
        <button type="button" className="qe__remove" onClick={onRemove} aria-label={`Remove question ${n}`}>
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {q.type === 'choice' ? (
        <div className="qe__options">
          {q.options.map((opt, i) => (
            <div key={i} className="qe__option">
              <span className="radio__dot" aria-hidden="true" />
              <input
                className="text-body"
                value={opt}
                onChange={(e) => set({ options: q.options.map((o, j) => (j === i ? e.target.value : o)) })}
                aria-label={`Option ${i + 1}`}
              />
              {q.options.length > 1 && (
                <button
                  type="button"
                  className="qe__remove"
                  onClick={() => set({ options: q.options.filter((_, j) => j !== i) })}
                  aria-label={`Remove option ${i + 1}`}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="qe__add-option text-body" onClick={() => set({ options: [...q.options, `Option ${q.options.length + 1}`] })}>
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Add an option
          </button>
        </div>
      ) : (
        <div className="qe__free text-body">Type response here</div>
      )}

      <div className="qe__type">
        <span className="qe__type-select text-label-2">
          <select
            value={q.type}
            onChange={(e) => set({ type: e.target.value, options: e.target.value === 'choice' ? q.options.length ? q.options : ['Option 1'] : [] })}
            aria-label={`Question ${n} type`}
          >
            <option value="choice">Multiple choice</option>
            <option value="text">Free form</option>
          </select>
          <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

/**
 * @param {{value: string, label: string}[]} eventOptions  events a survey can be assigned to
 * @param {string} [defaultEventId]
 * @param {(survey) => void} onCreate
 */
/**
 * @param {'event'|'standalone'} [variant]  'event' (inside Create event): Preview + Create survey.
 *        'standalone' (Surveys page, Figma 2324:46040): Save as draft + Publish.
 */
export default function SurveyBuilder({ onClose, onCreate, eventOptions, defaultEventId, defaultTitle = '', variant = 'event' }) {
  const [eventId, setEventId] = useState(defaultEventId ?? eventOptions[0]?.value ?? '')
  const [title, setTitle] = useState(defaultTitle)
  const [status, setStatus] = useState('closed')
  const [questions, setQuestions] = useState([blankQuestion('choice'), blankQuestion('text')])
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')

  const survey = { id: newId('s'), eventId, title: title.trim(), status, questions, createdAt: new Date().toISOString() }

  function create(statusOverride) {
    if (!eventId) return setError('Assign the survey to an event.')
    if (!title.trim()) return setError('Give your survey a name.')
    if (statusOverride !== 'draft' && questions.some((q) => !q.prompt.trim())) return setError('Every question needs a prompt.')
    onCreate(statusOverride ? { ...survey, status: statusOverride } : survey)
  }

  if (preview) {
    return (
      <Modal open onClose={() => setPreview(false)} width={737} title={title || 'Untitled survey'} subtitle="Preview — this is what volunteers will see.">
        <div className="sb-preview">
          {questions.map((q, i) => (
            <SurveyQuestion key={q.id} number={i + 1} question={{ ...q, prompt: q.prompt || 'Untitled question' }} value={undefined} onChange={() => {}} />
          ))}
        </div>
        <div className="modal__footer">
          <Button color="secondary" onClick={() => setPreview(false)}>
            Back to editing
          </Button>
          <Button onClick={() => create()}>Create survey</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={636}
      title={
        <span className="sb-title">
          <Paperclip size={26} strokeWidth={1.75} aria-hidden="true" />
          Create new survey
          <button
            type="button"
            className={`sb-status sb-status--${status}`}
            onClick={() => setStatus((s) => (s === 'open' ? 'closed' : 'open'))}
            title="Toggle whether volunteers can respond"
          >
            <span className="sb-status__dot" aria-hidden="true" />
            {status === 'open' ? 'Open' : 'Closed'}
            <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </span>
      }
    >
      <div className="sb">
        <div className="sb__field">
          <FieldLabel required htmlFor="sb-event">
            Assign event
          </FieldLabel>
          <SelectField id="sb-event" className="sb__event" value={eventId} onChange={(e) => setEventId(e.target.value)} options={eventOptions} />
        </div>
        <div className="sb__field">
          <FieldLabel required htmlFor="sb-name">
            Survey name
          </FieldLabel>
          <TextField id="sb-name" placeholder="Survey title here" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="sb__field">
          <p className="field-label text-body-2">Survey questions</p>
          <div className="sb__questions">
            {questions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                q={q}
                n={i + 1}
                onChange={(nq) => setQuestions((qs) => qs.map((x) => (x.id === q.id ? nq : x)))}
                onRemove={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
              />
            ))}
            <button type="button" className="sb__add text-body" onClick={() => setQuestions((qs) => [...qs, blankQuestion('choice')])}>
              <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
              Add a question
            </button>
          </div>
        </div>
        {error && <p className="flow-form__error text-label-2">{error}</p>}
      </div>
      <div className="modal__footer">
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        {variant === 'standalone' ? (
          <span style={{ display: 'flex', gap: 16 }}>
            <Button color="tertiary" onClick={() => create('draft')}>
              Save as draft
            </Button>
            <Button onClick={() => create('open')}>Publish</Button>
          </span>
        ) : (
          <span style={{ display: 'flex', gap: 16 }}>
            <Button color="tertiary" onClick={() => setPreview(true)}>
              Preview
            </Button>
            <Button onClick={() => create()}>Create survey</Button>
          </span>
        )}
      </div>
    </Modal>
  )
}
