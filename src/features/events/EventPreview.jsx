import { useId, useState } from 'react'
import Button from '../../components/Button/Button.jsx'
import './EventPreview.css'

function PreviewIcon({ name }) {
  return <img src={`/assets/events/preview-${name}.svg`} alt="" aria-hidden="true" />
}

// Final / Create Event / Pop up preview (2324:46946).
// Both event editors provide their current form values and keep ownership of saves.
export default function EventPreview({ title, type, description, organizer, date, time, location, tags, hasSurvey, onViewSurvey, onClose, onSaveDraft, onCreate, createLabel = 'Create event', error }) {
  const [expanded, setExpanded] = useState(false)
  const descriptionId = useId()
  return (
    <section className="event-preview" aria-label="Event preview">
      <div className="event-preview__layout">
        <div className="event-preview__main">
          <header className="event-preview__heading">
            <h1>{title || 'Untitled event'}</h1>
            {type && <p>{type}</p>}
          </header>
          <div className={`event-preview__description ${expanded ? 'is-expanded' : ''}`}>
            <p id={descriptionId}>{description || 'No description yet.'}</p>
            {description && <button type="button" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? 'Collapse description' : 'Expand description'} aria-expanded={expanded} aria-controls={descriptionId}>
              <PreviewIcon name="chevron" />
            </button>}
          </div>
          <div className="event-preview__stats">
            <div className="event-preview__stat"><span>Sign-up</span><p><b>0</b><span>volunteers</span></p></div>
            <div className="event-preview__stat"><span>Surveys missing</span><p><b>0/0</b><span>surveys</span></p></div>
            {hasSurvey && <Button data-survey-return color="secondary" onClick={onViewSurvey}>View survey</Button>}
          </div>
          <section className="event-preview__volunteers" aria-label="Event volunteers">
            <header><h2>Volunteers</h2><Button color="secondary" disabled>Message all volunteers<PreviewIcon name="message" /></Button></header>
            <div className="event-preview__empty">
              <span className="event-preview__empty-icon"><PreviewIcon name="handshake" /></span>
              <p>No volunteers have signed up yet</p>
            </div>
          </section>
        </div>
        <aside className="event-preview__details" aria-label="Event details">
          <header><h2>Event Details</h2><button type="button" onClick={onClose} aria-label="Back to the form"><PreviewIcon name="maximize" /></button></header>
          <dl>
            <div className="event-preview__organizer"><dt><PreviewIcon name="organizer" /><span className="event-preview__sr">Organizer</span></dt><dd>{organizer || 'Organizer to be added'}</dd></div>
            <div><dt><PreviewIcon name="calendar" /><span className="event-preview__sr">Date</span></dt><dd>{date || 'Date to be added'}</dd></div>
            <div><dt><PreviewIcon name="clock" /><span className="event-preview__sr">Time</span></dt><dd>{time || 'Time to be added'}</dd></div>
            <div><dt><PreviewIcon name="pin" /><span className="event-preview__sr">Location</span></dt><dd>{location || 'Location to be added'}</dd></div>
            {tags.length > 0 && <div className="event-preview__tag-row"><dt><PreviewIcon name="tags" /><span className="event-preview__sr">Tags</span></dt><dd className="event-preview__tags">{tags.map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}</dd></div>}
          </dl>
        </aside>
      </div>
      {error && <p className="event-preview__error" role="alert">{error}</p>}
      <footer className="event-preview__footer">
        <Button color="secondary" onClick={onSaveDraft}>Save draft</Button>
        <div><Button color="tertiary" onClick={onClose}>Close preview</Button><Button onClick={onCreate}>{createLabel}</Button></div>
      </footer>
    </section>
  )
}
