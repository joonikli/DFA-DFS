import EventAsset from '../features/events/EventAsset.jsx';
import { eventDateLabel } from './eventData.js';

export function EventRegistrationButton({ event, registered, onRegister, explicitCancel = false }) {
  const full = !event.past && event.filled >= event.cap && !registered;
  if (event.past) return <span className="ve-attended">Attended</span>;
  return <button className={`btn ${registered && explicitCancel ? 'btn-outline' : 'btn-dark'} ve-register`} disabled={full}
    aria-label={`${registered ? 'Cancel registration for' : 'Register for'} ${event.title}, ${eventDateLabel(event.date)}`}
    onClick={click => onRegister(click.currentTarget, event.id)}>
    {full ? 'Full' : registered ? (explicitCancel ? 'Cancel registration' : 'Registered') : 'Register'}
    {!full && !(registered && explicitCancel) && <EventAsset name={registered ? 'volunteer-minus' : 'list-plus'} />}
  </button>;
}

export default function EventActions({ event, registered, saved, onSave, onRegister, saveOnly = false }) {
  return <div className="ve-actions">
    <button className={`ve-bookmark ${saved ? 'on' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${event.title}, ${eventDateLabel(event.date)}`}
      aria-pressed={saved} data-tip={saved ? 'Remove from saved' : 'Save for later'} onClick={() => onSave(event.id)}>
      <EventAsset name={saved ? 'list-bookmark-saved' : 'list-bookmark2'} />
    </button>
    {!saveOnly && <EventRegistrationButton {...{ event, registered, onRegister }} />}
  </div>;
}
