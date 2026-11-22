import { useLayoutEffect, useRef, useState } from 'react';
import { Avatar, Icon } from '../../components/Icon.jsx';
import { VOLS } from '../../data.js';
import { EventAsset, EventDialog } from './EventEditor.jsx';
import { dateLabel, timeLabel } from './eventData.js';
import { profileRoute } from '../profiles/profileData.js';
import SurveyStatus from './SurveyStatus.jsx';
import EditButton from '../../components/EditButton/EditButton.jsx';

export default function EventDetail({ event, onBack, onEdit, onCancel, onMessage }) {
  const [expanded, setExpanded] = useState(false);
  const [descriptionOverflows, setDescriptionOverflows] = useState(false);
  const descriptionRef = useRef(null);
  const [survey, setSurvey] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState(false);
  const title = event.detailTitle || event.title;
  const subtitle = event.type || event.title;
  const description = event.longDescription ?? (event.description || 'No description has been added to this event.');
  useLayoutEffect(() => { setExpanded(false); }, [description]);
  useLayoutEffect(() => {
    const element = descriptionRef.current;
    if (!element || expanded) return;
    let active = true;
    const measure = () => { if (active) setDescriptionOverflows(element.scrollHeight > element.clientHeight + 1); };
    measure();
    document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { active = false; observer.disconnect(); };
  }, [description, expanded]);
  const hasSurvey = Boolean(event.surveyDefinition || event.survey);
  const roster = (event.volunteerIds || Object.keys(VOLS).slice(0, event.registered)).filter((id) => VOLS[id]);
  const partialRoster = roster.length < event.registered;
  const missing = event.surveyMissingIds?.length || 0;
  // Surveys go out after the event: before then (or if it was cancelled) nothing can be missing
  const notYet = event.status === 'Upcoming' || event.status === 'Cancelled';
  const tags = (event.tagText || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  const surveyStatus = (id) => !hasSurvey ? 'unassigned' : event.surveyMissingIds?.includes(id) ? 'missing' : event.surveyCompletedIds?.includes(id) ? 'complete' : 'pending';
  const messageAll = () => partialRoster ? setConfirmMessage(true) : onMessage(roster, event);
  const clock = (time) => timeLabel(time).replace(' ', '').toLowerCase();
  return <div className={`ae-detail ${roster.length ? 'ae-detail-populated' : ''}`}>
    <nav className="ae-breadcrumb" aria-label="Breadcrumb"><button onClick={onBack}>Events</button><EventAsset name="survey-page-chevron" /><span aria-current="page">{title}</span></nav>
    <div className="ae-detail-layout"><div className="ae-detail-content">
      <header className="ae-detail-heading"><div><h1>{title}</h1>{subtitle !== title && <p>{subtitle}</p>}</div><EditButton onClick={() => onEdit(event)} /></header>
      <div className={`ae-detail-description ${expanded ? 'expanded' : ''}`}>
        <p ref={descriptionRef} id="admin-event-description">{description}</p>
        {(descriptionOverflows || expanded) && <button className="ae-description-toggle" aria-label={expanded ? 'Collapse description' : 'Expand description'} aria-expanded={expanded} aria-controls="admin-event-description" onClick={() => setExpanded((value) => !value)}><EventAsset name="detail-description-chevron" /></button>}
      </div>
      <div className="ae-stat-row">
        <div className="ae-stat"><span>Sign-up</span><p><b>{event.registered}</b><span>{roster.length ? 'Volunteers' : 'volunteers'}</span></p></div>
        <div className="ae-stat"><span>Surveys missing</span><p><b>{notYet ? '–' : hasSurvey || !event.registered ? `${missing}/${event.registered}` : '–'}</b><span>{notYet ? (event.status === 'Cancelled' ? 'event cancelled' : 'after the event') : roster.length ? 'Surveys' : 'surveys'}</span></p></div>
        <button className="btn btn-purple-outline" onClick={() => setSurvey(true)}>View survey</button>
      </div>
      <div className="ae-roster-heading"><h2>Volunteers</h2><button className="btn btn-purple-outline" disabled={!roster.length} onClick={messageAll}>Message all volunteers<EventAsset name="detail-message-square" /></button></div>
      <section className={`ae-roster ${roster.length ? 'ae-roster-populated' : ''}`} aria-label="Volunteer roster">
        {roster.length ? <>
          {roster.map((id) => <div className="ae-roster-row" key={id}>
            <a className="ae-roster-profile" href={`#${profileRoute(id)}`} aria-label={`View ${VOLS[id].name} profile`}><Avatar id={id} /></a>
            <div className="ae-roster-person"><a href={`#${profileRoute(id)}`}><b>{VOLS[id].name}</b></a><span>Volunteer</span></div>
            <div className="ae-roster-actions"><SurveyStatus status={surveyStatus(id)} /><button className="ae-roster-message" aria-label={`Message ${VOLS[id].name}`} onClick={() => onMessage([id], event)}><EventAsset name="detail-roster-message" /></button></div>
          </div>)}
          {partialRoster && <p className="ae-roster-note">Showing {roster.length} demo profiles of {event.registered} sign-ups.</p>}
        </> : <div className="ae-roster-empty"><div className="ae-empty-icon"><EventAsset name="detail-handshake" /></div><p>No volunteers have signed up yet</p></div>}
      </section>
    </div><aside className="ae-detail-aside" aria-label="Event details"><header><h2>Event Details</h2><EditButton onClick={() => onEdit(event)} /></header>
      <dl className="ae-detail-facts">
        <div className="ae-detail-organizer"><dt><EventAsset name="detail-frame634" /><span className="sr">Organizer</span></dt><dd>{event.organizer}{event.group === 'mine' ? ' (Me)' : ''}</dd></div>
        <div><dt><EventAsset name="detail-frame" /><span className="sr">Date</span></dt><dd>{dateLabel(event.date)}</dd></div>
        <div><dt><EventAsset name="detail-frame1" /><span className="sr">Time</span></dt><dd>{clock(event.start)} - {clock(event.end)}</dd></div>
        <div><dt><EventAsset name="detail-frame2" /><span className="sr">Location</span></dt><dd>{event.address}</dd></div>
        {tags.length > 0 && <div><dt><EventAsset name="detail-tags" /><span className="sr">Tags</span></dt><dd className="ae-detail-tags">{tags.map((tag, index) => <span key={index}>{tag}</span>)}</dd></div>}
      </dl>
      {event.status === 'Upcoming' && <button className="ae-cancel-action link" onClick={() => setConfirmCancel(true)}>Cancel event</button>}
      {event.status !== 'Upcoming' && <span className={`ae-status ${event.status.toLowerCase()}`}>{event.status}</span>}
    </aside></div>
    {survey && <EventDialog label="Event survey" onClosed={() => setSurvey(false)}>{(close) => <div className="ae-task-dialog">
      <header className="ae-dialog-head"><h2>{event.survey || 'Event survey'}</h2><button className="icon-btn plain" aria-label="Close survey" onClick={() => close()}><Icon name="x" /></button></header>
      {hasSurvey ? <>
        <p>{title}{event.surveyMissingIds && <> · {missing} of {event.registered} surveys missing</>}</p>
        {event.surveyDefinition ? <ol>{event.surveyDefinition.questions.map((question) => <li key={question.id}>{question.title}{question.type === 'Multiple choice' && <ul>{question.options.map((option, index) => <li key={index}>{option}</li>)}</ul>}</li>)}</ol> : <p>The question content for this survey is not available in the prototype.</p>}
        <button className="btn btn-dark" onClick={() => close()}>Done</button>
      </> : <><p>No survey has been added to this event yet.</p><button className="btn btn-purple-outline" onClick={() => { close(true); onEdit(event, { startSurvey: true }); }}>Add survey<Icon name="plus" size={16} /></button></>}
    </div>}</EventDialog>}
    {confirmMessage && <EventDialog label="Message event volunteers" onClosed={() => setConfirmMessage(false)}>{(close) => <div className="ae-task-dialog">
      <header className="ae-dialog-head"><h2>Message event volunteers</h2><button className="icon-btn plain" aria-label="Close message confirmation" onClick={() => close()}><Icon name="x" /></button></header>
      <p>This event has {event.registered} sign-ups. The prototype includes {roster.length} demo profiles, so the message draft will include those {roster.length} volunteers. No message will be sent automatically.</p>
      <div className="ae-confirm-actions"><button className="btn btn-outline" onClick={() => close()}>Cancel</button><button className="btn btn-dark" onClick={() => { close(true); onMessage(roster, event); }}>Continue with {roster.length} volunteers</button></div>
    </div>}</EventDialog>}
    {confirmCancel && <EventDialog label="Cancel event" onClosed={() => setConfirmCancel(false)}>{(close) => <div className="ae-task-dialog"><h2>Cancel {event.title}?</h2><p>This will move the event to the Cancelled tab. {event.registered} volunteer sign-ups are associated with this event.</p><div className="ae-confirm-actions"><button className="btn btn-outline" onClick={() => close()}>Keep event</button><button className="btn btn-dark" onClick={() => { onCancel(event); close(true); }}>Cancel event</button></div></div>}</EventDialog>}
  </div>;
}
