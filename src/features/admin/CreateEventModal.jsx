// Figma: Final › Admin - Event Creation (section 2324:46554)
//   Create event (2324:46685) → Add survey → Create new survey (2324:46555)
//   Preview (2324:46851) → Create event
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, CalendarSync, ChevronDown, Clock, MapPin, Maximize2, Tag } from 'lucide-react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import { FieldLabel, SelectField, TextField, TimeField } from '../../components/Field/Field.jsx'
import SurveyBuilder from '../surveys/SurveyBuilder.jsx'
import { EventDetails, EventMain } from './EventOverview.jsx'
import { EVENT_TYPES, TAG_OPTIONS } from '../../mock/adminEvents.js'
import { PERSONAS, useDemo } from '../../store/DemoStore.jsx'
import { useDismiss } from '../../lib/useDismiss.js'
import { TODAY } from '../../mock/today.js'
import './CreateEventModal.css'

const STAFF = ['Kyla Brooks', 'Anna Claire', 'Mariko Takahashi']
const pad = (n) => String(n).padStart(2, '0')
const dateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const at = (date, time) => {
  const [y, m, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  return new Date(y, m - 1, d, h, mi)
}

function TagPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  const has = (label) => value.some((t) => t.label === label)
  return (
    <div className="tag-picker" ref={ref}>
      <button type="button" className="field tag-picker__trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="tag-picker__chips">
          {value.length ? value.map((t) => <Tags key={t.label} color="purple">{t.label}</Tags>) : <span className="ce-placeholder text-body">Add tags</span>}
        </span>
        <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div className="tag-picker__menu" role="listbox" aria-multiselectable="true">
          {TAG_OPTIONS.map(([label, tone]) => (
            <button
              key={label}
              type="button"
              role="option"
              aria-selected={has(label)}
              className={`tag-picker__opt text-body ${has(label) ? 'tag-picker__opt--on' : ''}`}
              onClick={() => onChange(has(label) ? value.filter((t) => t.label !== label) : [...value, { label, tone }])}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * @param {object} [draft]  re-open a saved draft
 */
export default function CreateEventModal({ onClose, draft }) {
  const navigate = useNavigate()
  const { adminCreateEvent, adminSaveDraft, adminCreateSurvey, showToast } = useDemo()
  const [form, setForm] = useState(() => ({
    title: draft?.name ?? '',
    organizers: draft?.organizers ?? [PERSONAS.admin.fullName],
    date: dateInput(draft?.start ?? new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 8)),
    from: draft ? `${pad(draft.start.getHours())}:${pad(draft.start.getMinutes())}` : '13:00',
    to: draft ? `${pad(draft.end.getHours())}:${pad(draft.end.getMinutes())}` : '15:00',
    location: draft?.location ?? '',
    type: draft?.title ?? EVENT_TYPES[0],
    tags: draft?.tags ?? [
      { label: 'Clothes', tone: 'purple' },
      { label: 'Organizing', tone: 'purple' },
    ],
    description: draft?.description ?? '',
  }))
  const [id] = useState(() => draft?.id ?? `c${Date.now().toString(36)}`)
  const [survey, setSurvey] = useState(null)
  const [step, setStep] = useState('form') // form | survey | preview
  const [addingOrganizer, setAddingOrganizer] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const event = {
    id,
    name: form.title.trim() || 'Untitled event',
    title: form.type,
    program: 'custom',
    location: form.location.trim(),
    distance: '',
    description: form.description.trim(),
    tags: form.tags,
    start: at(form.date, form.from),
    end: at(form.date, form.to),
    recommended: false,
    organizer: form.organizers[0] === PERSONAS.admin.fullName ? 'me' : form.organizers[0],
    organizers: form.organizers,
    signups: [],
    surveyMissing: [],
    status: 'upcoming',
    hasSurvey: !!survey,
  }

  function validate() {
    if (!form.title.trim()) return 'Add an event title.'
    if (!form.location.trim()) return 'Add a location.'
    if (form.from >= form.to) return 'The end time must be after the start time.'
    return ''
  }

  function create() {
    const err = validate()
    if (err) {
      setError(err)
      setStep('form')
      return
    }
    adminCreateEvent(event)
    if (survey) adminCreateSurvey({ ...survey, eventId: id })
    showToast({ variant: 'success', parts: [['Event created!', true]], preview: `${event.name} is now live for volunteers.`, time: 'Now', category: 'Event' })
    onClose()
    navigate(`/events/${id}`)
  }

  function saveDraft() {
    adminSaveDraft(event)
    showToast({ variant: 'default', parts: [['Draft saved', true]], preview: `${event.name} — finish it anytime from My Events.`, time: 'Now', category: 'Event' })
    onClose()
  }

  if (step === 'survey') {
    return (
      <SurveyBuilder
        onClose={() => setStep('form')}
        eventOptions={[{ value: id, label: form.title || 'This event' }]}
        defaultEventId={id}
        defaultTitle={form.title ? `${form.title} Survey` : ''}
        onCreate={(s) => {
          setSurvey(s)
          setStep('form')
        }}
      />
    )
  }

  if (step === 'preview') {
    return (
      <Modal open onClose={() => setStep('form')} width={1012} padding="30px 32px 26px">
        <div className="ce-preview">
          <EventMain event={event} preview onViewSurvey={() => setStep('survey')} />
          <EventDetails
            event={event}
            action={
              <button type="button" className="ce-icon-btn" onClick={() => setStep('form')} aria-label="Back to the form">
                <Maximize2 size={20} strokeWidth={1.75} />
              </button>
            }
          />
        </div>
        <div className="modal__footer">
          <Button color="secondary" onClick={saveDraft}>
            Save draft
          </Button>
          <span style={{ display: 'flex', gap: 16 }}>
            <Button color="tertiary" onClick={() => setStep('form')}>
              Close preview
            </Button>
            <Button onClick={create}>Create event</Button>
          </span>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open onClose={onClose} width={660} padding="20px 21px 18px" title="Create event">
      <div className="ce">
        <div className="ce__field">
          <FieldLabel htmlFor="ce-title">Title</FieldLabel>
          <TextField id="ce-title" placeholder="Event title" value={form.title} onChange={set('title')} autoFocus />
        </div>

        <div className="ce__row ce__row--3">
          <div className="ce__field">
            <FieldLabel>Organizer</FieldLabel>
            <div className="field ce-organizers">
              {form.organizers.map((o, i) => (
                <Tags
                  key={o}
                  color="purple"
                  onRemove={i > 0 ? () => setForm((f) => ({ ...f, organizers: f.organizers.filter((x) => x !== o) })) : undefined}
                >
                  {o}
                </Tags>
              ))}
            </div>
            {addingOrganizer ? (
              <SelectField
                autoFocus
                aria-label="Choose an organizer"
                value=""
                onChange={(e) => {
                  if (e.target.value) setForm((f) => ({ ...f, organizers: [...new Set([...f.organizers, e.target.value])] }))
                  setAddingOrganizer(false)
                }}
                options={[{ value: '', label: 'Choose a teammate…' }, ...STAFF.filter((s) => !form.organizers.includes(s))]}
              />
            ) : (
              <Button color="secondary" size="sm" icon="plus" className="ce-small-btn" onClick={() => setAddingOrganizer(true)}>
                Add another organizer
              </Button>
            )}
          </div>
          <div className="ce__field">
            <FieldLabel htmlFor="ce-date">
              <CalendarDays size={20} strokeWidth={1.5} aria-hidden="true" /> Date
            </FieldLabel>
            <TextField id="ce-date" type="date" value={form.date} onChange={set('date')} />
          </div>
          <div className="ce__field">
            <FieldLabel>
              <Clock size={20} strokeWidth={1.5} aria-hidden="true" /> Time
            </FieldLabel>
            <div className="ce-times">
              <TimeField value={form.from} onChange={set('from')} aria-label="Start time" />
              <span className="ce-times__dash" aria-hidden="true" />
              <TimeField value={form.to} onChange={set('to')} aria-label="End time" />
            </div>
          </div>
        </div>

        <div className="ce__row">
          <div className="ce__field">
            <FieldLabel htmlFor="ce-location">
              <MapPin size={20} strokeWidth={1.5} aria-hidden="true" /> Location
            </FieldLabel>
            <TextField id="ce-location" placeholder="Add location" value={form.location} onChange={set('location')} />
          </div>
          <div className="ce__field">
            <FieldLabel htmlFor="ce-type">
              <CalendarSync size={20} strokeWidth={1.5} aria-hidden="true" /> Event type
            </FieldLabel>
            <SelectField id="ce-type" value={form.type} onChange={set('type')} options={EVENT_TYPES} />
          </div>
        </div>

        <div className="ce__row">
          <div className="ce__field">
            <FieldLabel>
              <Tag size={20} strokeWidth={1.5} aria-hidden="true" /> Tags
            </FieldLabel>
            <TagPicker value={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
          </div>
        </div>

        <div className="ce__field">
          <FieldLabel htmlFor="ce-desc">Description</FieldLabel>
          <TextField id="ce-desc" multiline className="ce-desc" placeholder="Write event description" value={form.description} onChange={set('description')} />
        </div>

        <div>
          {survey ? (
            <span className="ce-survey-chip text-body">
              <Tags color="green" onRemove={() => setSurvey(null)}>
                Survey: {survey.title}
              </Tags>
            </span>
          ) : (
            <Button color="secondary" size="sm" icon="plus" className="ce-small-btn" onClick={() => setStep('survey')}>
              Add survey
            </Button>
          )}
        </div>
        {error && <p className="flow-form__error text-label-2">{error}</p>}
      </div>

      <div className="modal__footer ce__footer">
        <Button color="secondary" size="sm" onClick={saveDraft}>
          Save draft
        </Button>
        <span style={{ display: 'flex', gap: 16 }}>
          <Button
            color="tertiary"
            size="sm"
            onClick={() => {
              setError('')
              setStep('preview')
            }}
          >
            Preview
          </Button>
          <Button size="sm" onClick={create}>
            Create event
          </Button>
        </span>
      </div>
    </Modal>
  )
}
