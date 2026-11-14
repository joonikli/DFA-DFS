import { Icon } from '../components/Icon.jsx';
import { useToast } from '../components/ui.jsx';
import EventAsset from '../features/events/EventAsset.jsx';
import { getProfile } from '../features/profiles/profileData.js';
import EventActions from './EventActions.jsx';
import { downloadEventCalendar } from './calendarExport.js';
import { eventDateLabel } from './eventData.js';
import { registrationTime, useRegistration } from './Registration.jsx';
import '../features/events/events.css';
import './eventDetail.css';

export default function VolunteerEventDetail({ event, registered, saved, onSave, onRegister, onBack }) {
  const toast = useToast();
  const { records, openRegistration } = useRegistration();
  if (!event) return <section className="ae-detail ve-detail ve-event-not-found">
    <nav className="ae-breadcrumb" aria-label="Breadcrumb"><button onClick={onBack}>Events</button></nav>
    <h1 tabIndex={-1}>Event not found</h1><p>This event is not available in the prototype.</p>
    <button className="btn btn-outline" onClick={onBack}>Back to events</button>
  </section>;
  const manager = getProfile('admin');
  const calendar = () => {
    try {
      downloadEventCalendar({ ...event, time: registrationTime(records[event.id], event.time) });
      toast('Calendar file downloaded. Open it to add this event to your calendar.', { ic: 'cal-plus' });
    } catch {
      toast('The event time is unavailable, so a calendar file could not be created.', { ic: 'info' });
    }
  };
  return <article className="ae-detail ve-detail" data-event-id={event.id}>
    <nav className="ae-breadcrumb" aria-label="Breadcrumb"><button onClick={onBack}>Events</button><EventAsset name="survey-page-chevron" /><span aria-current="page">{event.title}</span></nav>
    <div className="ae-detail-layout"><div className="ae-detail-content">
      <header className="ae-detail-heading"><div><h1 tabIndex={-1}>{event.title}</h1><p>{event.past ? 'Past volunteer event' : 'Volunteer opportunity'}</p></div><EventActions {...{ event, registered, saved, onSave, onRegister }} saveOnly={event.past} /></header>
      <p className="ve-event-description">{event.desc}</p>
      {!event.past && registered && <div className="ve-description-actions"><button className="btn btn-outline" onClick={e => openRegistration(event.id, e.currentTarget)}>Edit registration</button><button className="btn btn-outline" onClick={calendar}><Icon name="cal-plus" size={16} />Add to calendar</button></div>}

    </div><aside className="ae-detail-aside" aria-label="Event details">
      <header><h2>Event Details</h2></header>
      <dl className="ae-detail-facts">
        <div><dt><EventAsset name="detail-frame" /><span className="sr">Date</span></dt><dd>{eventDateLabel(event.date)}</dd></div>
        <div><dt><EventAsset name="detail-frame1" /><span className="sr">Time</span></dt><dd>{event.time}<small>Pittsburgh time (ET)</small></dd></div>
        <div><dt><EventAsset name="detail-frame2" /><span className="sr">Location</span></dt><dd>{event.addr}{event.addr !== 'Location not recorded' && <a className="link ve-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.addr}, Pittsburgh, PA`)}`} target="_blank" rel="noreferrer">Open map<Icon name="external" size={14} /><span className="sr"> (opens in a new tab)</span></a>}</dd></div>
        {event.tags.length > 0 && <div><dt><EventAsset name="detail-tags" /><span className="sr">Event tags</span></dt><dd className="ae-detail-tags">{event.tags.map(tag => <span key={tag}>{tag}</span>)}</dd></div>}
      </dl>
      <section className="ve-event-contact" aria-label="Volunteer coordinator"><h2>Questions?</h2><p>Contact {manager.name}, your volunteer manager.</p><a className="link" href={`mailto:${manager.email}?subject=${encodeURIComponent(`Question about ${event.title} — ${eventDateLabel(event.date)}`)}`}>Email volunteer manager<Icon name="mail" size={16} /></a></section>
    </aside></div>
  </article>;
}
