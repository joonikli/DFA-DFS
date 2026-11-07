// Volunteer event flows (Figma: Final › Volunteer - Post-event, 2324:49746, and Notification 2324:48402):
//   Register → event-registration-popup → success toast + notification
//   After an event → Post-event popup ("Thank you for volunteering today!") → event-survey-popup
// Any page can open these through useEventFlows().
import { createContext, useContext, useMemo, useState } from 'react'
import { Handshake } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import Notification from '../../components/Notification/Notification.jsx'
import SurveyQuestion from '../../components/SurveyQuestion/SurveyQuestion.jsx'
import { Checkbox, FieldLabel, SelectField, TextField, TimeField } from '../../components/Field/Field.jsx'
import { surveyForEvent } from '../../mock/surveys.js'
import { MONTHS } from '../../lib/dates.js'
import { PERSONAS, useDemo } from '../../store/DemoStore.jsx'
import './EventFlows.css'

const FlowContext = createContext(null)
export const useEventFlows = () => useContext(FlowContext)

const pad = (n) => String(n).padStart(2, '0')
const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
function longTime(d) {
  const h = d.getHours() % 12 || 12
  return `${h}:${pad(d.getMinutes())}`
}
const ampm = (d) => (d.getHours() < 12 ? 'am' : 'pm')

/* ---------- event-registration-popup (Figma 2324:49791) ---------- */
function RegistrationPopup({ event, onClose }) {
  const { register, showToast } = useDemo()
  const p = PERSONAS.volunteer
  const [form, setForm] = useState({
    contact: 'phone',
    from: toTimeInput(event.start),
    to: toTimeInput(event.end),
    notes: '',
    notify: false,
  })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const range = `${longTime(event.start)} - ${longTime(event.end)} ${ampm(event.end)}`

  function submit(e) {
    e.preventDefault()
    if (!form.from || !form.to || form.from >= form.to) {
      setError('Choose a start time that is before your end time.')
      return
    }
    register(event.id, form)
    showToast({
      variant: 'success',
      parts: [['Registered!', true]],
      preview: `${event.title} is now in your Registered events.`,
      time: 'Now',
      category: 'Event',
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={750}
      title={`${event.title} Registration`}
      subtitle={
        <>
          Registering for event on{' '}
          <strong>
            {MONTHS[event.start.getMonth()]} {event.start.getDate()}, {range}
          </strong>{' '}
          at <strong>{event.location}.</strong>
        </>
      }
    >
      <form className="flow-form" onSubmit={submit} noValidate>
        <div className="flow-form__row">
          <div className="flow-form__field">
            <FieldLabel htmlFor="reg-name">Name</FieldLabel>
            <TextField id="reg-name" value={p.fullName} readOnly />
          </div>
          <div className="flow-form__field">
            <FieldLabel htmlFor="reg-contact">Preferred Contact</FieldLabel>
            <SelectField
              id="reg-contact"
              value={form.contact}
              onChange={set('contact')}
              options={[
                { value: 'phone', label: `Phone (${p.phone})` },
                { value: 'email', label: `Email (${p.email})` },
                { value: 'text', label: `Text (${p.phone})` },
              ]}
            />
          </div>
        </div>

        <div className="flow-form__field">
          <FieldLabel required>
            What time will you be available out of <b>{range}</b>? You can change this at any time.
          </FieldLabel>
          <div className="flow-form__times">
            <TimeField value={form.from} onChange={set('from')} aria-label="Available from" required />
            <span className="flow-form__dash" aria-hidden="true" />
            <TimeField value={form.to} onChange={set('to')} aria-label="Available until" required />
          </div>
          {error && <p className="flow-form__error text-label-2">{error}</p>}
        </div>

        <div className="flow-form__field">
          <FieldLabel htmlFor="reg-notes">Any notes?</FieldLabel>
          <TextField id="reg-notes" value={form.notes} onChange={set('notes')} />
        </div>

        <div className="flow-form__field">
          <p className="field-label text-body">Notify me of future events like this.</p>
          <div style={{ padding: '4px 10px' }}>
            <Checkbox label="Yes" checked={form.notify} onChange={set('notify')} />
          </div>
        </div>

        <div className="modal__footer">
          <Button color="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Register</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- event-survey-popup (2324:49770) & Fill-A-Bag (2324:49792) ---------- */
function SurveyPopup({ event, onClose }) {
  const { submitSurvey, showToast } = useDemo()
  const survey = surveyForEvent(event)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const date = `${pad(event.start.getMonth() + 1)}/${pad(event.start.getDate())}`

  function submit(e) {
    e.preventDefault()
    const missing = survey.questions.find((q) => q.required && !answers[q.id]?.answer)
    if (missing) {
      setError(`Please answer: “${missing.prompt}”`)
      return
    }
    submitSurvey(event.id, answers)
    showToast({
      variant: 'success',
      parts: [['Thanks!', true], [' Your feedback for ', false], [event.title, true], [' was sent.', false]],
      time: 'Now',
      category: 'Event',
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={survey.numbered ? 737 : 465}
      title={survey.title}
      subtitle={
        <div className="flow-survey__meta">
          <p>{survey.subtitle}</p>
          <div className="flow-survey__tags">
            <Tags color="purple">survey</Tags>
            <Tags color="purple">{date}</Tags>
            <Tags color="purple">
              {survey.questions.length} question{survey.questions.length > 1 ? 's' : ''}
            </Tags>
          </div>
        </div>
      }
    >
      <form className="flow-form flow-form--survey" onSubmit={submit} noValidate>
        {survey.questions.map((q, i) => (
          <SurveyQuestion
            key={q.id}
            question={q}
            number={survey.numbered ? i + 1 : undefined}
            value={answers[q.id]}
            onChange={(v) => {
              setError('')
              setAnswers((a) => ({ ...a, [q.id]: v }))
            }}
          />
        ))}
        {error && <p className="flow-form__error text-label-2">{error}</p>}
        <div className="modal__footer">
          <Button color={survey.numbered ? 'secondary' : 'tertiary'} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Send</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- Post-event popup (2324:49747) ---------- */
function PostEventPopup({ event, onClose, onTakeSurvey }) {
  const navigate = useNavigate()
  return (
    <Modal open onClose={onClose} width={400} padding="18px 24px">
      <div className="flow-thanks">
        <div className="flow-thanks__icon">
          <Handshake size={38} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <p className="text-subheading">Thank you for volunteering!</p>
        <p className="text-body flow-thanks__body">
          Hi {PERSONAS.volunteer.name}! We appreciated your help at the {event.title} event.
        </p>
      </div>
      <div className="modal__footer">
        <Button
          color="tertiary"
          onClick={() => {
            onClose()
            navigate('/events')
          }}
        >
          See all events
        </Button>
        <Button onClick={onTakeSurvey}>Take survey</Button>
      </div>
    </Modal>
  )
}

/* ---------- Read-only view of a submitted survey ("View survey" on the dashboard) ---------- */
function SurveyResponsePopup({ event, onClose }) {
  const { volunteer } = useDemo()
  const survey = surveyForEvent(event)
  const answers = volunteer.surveyResponses[event.id] || {}
  const show = (q) => {
    const a = answers[q.id]
    if (!a || a.answer == null || a.answer === '') return <span className="flow-response__empty">No answer</span>
    if (q.type === 'rating') return `${'★'.repeat(a.answer)}${'☆'.repeat(5 - a.answer)}  (${a.answer}/5)`
    if (Array.isArray(a.answer)) return a.answer.join(', ')
    return a.other ? `${a.answer} — ${a.other}` : a.answer
  }
  return (
    <Modal
      open
      onClose={onClose}
      width={560}
      title={survey.title}
      subtitle={`Your responses · ${MONTHS[event.start.getMonth()]} ${event.start.getDate()}`}
    >
      <dl className="flow-response">
        {survey.questions.map((q) => (
          <div key={q.id}>
            <dt className="text-body-2">{q.prompt}</dt>
            <dd className="text-body">{show(q)}</dd>
          </div>
        ))}
      </dl>
      <div className="modal__footer" style={{ justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}

/* ---------- Toasts ---------- */
function Toaster() {
  const { toasts, dismissToast } = useDemo()
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <Notification key={t.id} {...t} as="button" onClick={() => dismissToast(t.id)} />
      ))}
    </div>
  )
}

export function EventFlowsProvider({ children }) {
  const [flow, setFlow] = useState(null) // { kind: 'register'|'survey'|'thanks', event }
  const close = () => setFlow(null)

  const api = useMemo(
    () => ({
      openRegistration: (event) => setFlow({ kind: 'register', event }),
      openSurvey: (event) => setFlow({ kind: 'survey', event }),
      openPostEvent: (event) => setFlow({ kind: 'thanks', event }),
      openSurveyResponse: (event) => setFlow({ kind: 'response', event }),
    }),
    [],
  )

  return (
    <FlowContext.Provider value={api}>
      {children}
      {flow?.kind === 'register' && <RegistrationPopup event={flow.event} onClose={close} />}
      {flow?.kind === 'survey' && <SurveyPopup event={flow.event} onClose={close} />}
      {flow?.kind === 'response' && <SurveyResponsePopup event={flow.event} onClose={close} />}
      {flow?.kind === 'thanks' && (
        <PostEventPopup event={flow.event} onClose={close} onTakeSurvey={() => setFlow({ kind: 'survey', event: flow.event })} />
      )}
      <Toaster />
    </FlowContext.Provider>
  )
}
