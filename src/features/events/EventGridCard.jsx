import EventAsset from './EventAsset.jsx';
import { dateLabel, parseDate } from './eventData.js';

// Survey Responses card hierarchy, adapted to existing admin event actions/data.
export default function EventGridCard({ event, saved, onSave, onEditDraft }) {
  const date = event.date ? parseDate(event.date) : null;
  const isDraft = Boolean(onEditDraft);
  return <article className="ae-event-card ae-grid-card">
    {isDraft ? <button className="ae-card-open" aria-label={`Continue editing ${event.title}`} onClick={onEditDraft} /> : <a className="ae-card-open" href={`#events?event=${event.id}`} aria-label={`Open ${event.title}, ${dateLabel(event.date)}`} />}
    <header className="ae-grid-heading"><div className="ae-grid-date"><span>{date ? date.toLocaleDateString('en-US', { month: 'short' }) : 'Date'}</span><b>{date ? date.getDate() : '—'}</b></div><div><div className="ae-grid-title"><h2>{event.title}</h2>{!isDraft && <button className={`ae-bookmark ${saved ? 'on' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${event.title}, ${dateLabel(event.date)}`} aria-pressed={saved} data-tip={saved ? 'Remove from saved' : 'Save event'} onClick={() => onSave(event)}><EventAsset name={saved ? 'list-bookmark-saved' : 'list-bookmark2'} /></button>}</div><p>{event.time}</p>{event.status !== 'Upcoming' && <span className={`ae-status ${event.status.toLowerCase()}`}>{event.status}</span>}</div></header>
    <p className="ae-grid-description">{event.description || (isDraft ? 'Continue editing to finish your event.' : 'No description has been added to this event.')}</p>
    {!isDraft && <div className="ae-grid-registration"><EventAsset name="grid-users" /><span>{event.registered} Registered</span></div>}
    <div className="ae-grid-details"><p className="ae-grid-organizer"><span>Organized by </span><b>{event.organizer || 'Organizer to be added'}</b></p><p className="ae-grid-location"><EventAsset name="grid-location" /><span>{event.address || 'Location to be added'}</span></p></div>
    <div className="ae-card-tags">{event.tags.map((color, index) => <span key={index} className={`ae-tag ${color}`}>anylanguage</span>)}</div>
  </article>;
}
