import { useEffect, useRef, useState } from 'react';
import SlidingTabs from '../../components/SlidingTabs.jsx';
import { Icon } from '../../components/Icon.jsx';
import { hideTip, useFitZoom, usePop, usePopClose, useToast } from '../../components/ui.jsx';
import { AccountMenu, Notifications } from '../dashboard/Popovers.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { navigate, useRoute } from '../../lib/router.js';
import { openConversation } from '../../lib/bridge.js';
import { M, draft, rerender } from '../messages/state.js';
import EventEditor, { EventAsset, EventDialog } from './EventEditor.jsx';
import EventDetail from './EventDetail.jsx';
import EventGridCard from './EventGridCard.jsx';
import { EVENT_TODAY, dateLabel, parseDate, timeLabel } from './eventData.js';
import { useEventState } from './eventState.js';
import './events.css';

const TABS = ['Upcoming', 'Drafts', 'Saved', 'Completed', 'Cancelled'];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function EventTabs({ value, onChange, items = TABS, label = 'Event status', panelId = 'admin-events-panel', className = '' }) {
  return <SlidingTabs value={value} onChange={onChange} items={items} label={label} panelId={panelId} className={`ae-tabs ${className}`} lineClassName="ae-tab-line" />;
}

function DateFilter({ date, onApply }) {
  const [value, setValue] = useState(date || '');
  const close = usePopClose();
  return <form className="ae-date-filter" onSubmit={(e) => { e.preventDefault(); onApply(value); close(); }}><label>Filter by date<input className="field" aria-label="Filter by date" type="date" value={value} onChange={(e) => setValue(e.target.value)} /></label><div><button type="button" className="btn btn-outline" onClick={() => { onApply(''); close(); }}>Clear</button><button className="btn btn-dark">Apply</button></div></form>;
}

function Calendar({ month, onMonth, selected, onSelect, events, saved }) {
  const year = month.getFullYear(), index = month.getMonth();
  const days = new Date(year, index + 1, 0).getDate(), offset = new Date(year, index, 1).getDay();
  const label = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dates = new Set(events.filter((e) => e.status === 'Upcoming').map((e) => e.date));
  const savedDates = new Set(events.filter((e) => saved.has(e.id)).map((e) => e.date));
  return <section className="ae-calendar" aria-label="Event calendar"><div className="ae-calendar-head"><button className="icon-btn plain" aria-label="Previous month" onClick={() => onMonth(-1)}><EventAsset name="list-chevron-right" className="ae-chevron-left" /></button><h2 aria-live="polite">{label}</h2><button className="icon-btn plain" aria-label="Next month" onClick={() => onMonth(1)}><EventAsset name="list-chevron-right1" /></button></div>
    <div className="ae-calendar-legend"><span><i />Your events</span><span><i />Saved events</span></div>
    <div className="ae-calendar-weekdays">{WEEKDAYS.map((d) => <span key={d}>{d}</span>)}</div>
    <div className="ae-calendar-days" style={{ '--weeks': Math.ceil((days + offset) / 7) }}>{Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: days }, (_, i) => {
      const day = i + 1, date = `${year}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return <button key={date} className={`ae-day ${date === EVENT_TODAY ? 'today' : ''} ${selected === date ? 'selected' : ''}`} aria-label={dateLabel(date)} aria-pressed={selected === date} onClick={() => onSelect(date === selected ? '' : date)}>{day}{(dates.has(date) || savedDates.has(date)) && <i className={savedDates.has(date) ? 'saved' : ''} />}</button>;
    })}</div>
  </section>;
}

export function EventCard({ event, saved, onSave, onEditDraft, showRegistrationCount = true, layout = 'list' }) {
  if (layout === 'grid') return <EventGridCard event={event} saved={saved} onSave={onSave} onEditDraft={onEditDraft} />;
  const isDraft = Boolean(onEditDraft);
  const date = event.date ? parseDate(event.date) : null;
  return <article className={`ae-event-card ${event.id === 'reference-1' ? 'ae-card-tall' : ''}`}>
    {isDraft ? <button className="ae-card-open" aria-label={`Continue editing ${event.title}`} onClick={onEditDraft} /> : <a className="ae-card-open" href={`#events?event=${event.id}`} aria-label={`Open ${event.title}, ${dateLabel(event.date)}`} />}
    <div className="ae-card-date"><span>{date ? date.toLocaleDateString('en-US', { month: 'long' }) : 'Date'}</span><b>{date ? date.getDate() : '—'}</b><small>{event.time}</small></div>
    <div className="ae-card-body"><div className="ae-card-title"><h2>{event.title}</h2><div className="ae-card-actions">{event.status !== 'Upcoming' && <span className={`ae-status ${event.status.toLowerCase()}`}>{event.status}</span>}{isDraft ? <Icon name="pen" size={16} /> : <>{showRegistrationCount && <span className="ae-registered"><EventAsset name="list-frame" />{event.registered} Registered</span>}<button className={`ae-bookmark ${saved ? 'on' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${event.title}, ${dateLabel(event.date)}`} aria-pressed={saved} data-tip={saved ? 'Remove from saved' : 'Save event'} onClick={() => onSave(event)}><EventAsset name={saved ? 'list-bookmark-saved' : 'list-bookmark2'} /></button></>}</div></div>
      <div className="ae-card-location"><span>{event.address || 'Location to be added'}</span>{event.address && <><EventAsset name="list-dot" /><span>0.5 mi from you</span></>}</div><p>{event.description || (isDraft ? 'Continue editing to finish your event.' : '')}</p><div className="ae-card-tags">{event.tags.map((color, i) => <span key={i} className={`ae-tag ${color}`}>anylanguage</span>)}</div>
    </div>
  </article>;
}

function Tasks({ onOpen, tasks }) {
  return <section className="ae-tasks"><h2>To do</h2>{tasks.filter((t) => !t.done).map((task) => <button key={task.id} className="ae-task" onClick={() => onOpen(task)}><span className={`ae-task-type type-${task.id}`}>{task.type}</span><span>{task.title}</span><EventAsset name="list-arrow-right" /></button>)}<button className="link ae-view-all" onClick={() => onOpen({ id: 'all', title: 'To do' })}>View all <Icon name="arrow-r" size={14} /></button></section>;
}

function EmptyEvents({ tab, filtered, onClear }) {
  const messages = {
    Upcoming: 'You don’t have any upcoming events yet',
    Drafts: 'You haven’t saved any event drafts yet',
    Saved: 'You haven’t saved any events yet',
    Completed: 'You don’t have any completed events yet',
    Cancelled: 'You don’t have any cancelled events yet',
  };
  return <section className="ae-group" aria-label={`${tab} empty state`}>
    <header><h2>{tab === 'Upcoming' ? 'My Events' : tab === 'Drafts' ? 'Draft Events' : `${tab} Events`}</h2><span>0 Events</span></header>
    <div className="ae-empty"><div className="ae-empty-content">
      <div className="ae-empty-icon"><EventAsset name="detail-handshake" /></div>
      <p role="status">{filtered ? 'No events match your selected filters' : messages[tab]}</p>
      {filtered && <button className="btn btn-outline" onClick={onClear}>Clear filters</button>}
    </div></div>
  </section>;
}

export default function Events() {
  const pop = usePop(), toast = useToast(), notBuilt = useNotBuilt();
  const { params } = useRoute();
  const page = useRef(null), list = useRef(null);
  useFitZoom(page, { designWidth: 1488, minWidth: 1000 });
  const [events, setEvents] = useEventState('events'), [saved, setSaved] = useEventState('saved');
  const [tab, setTab] = useState('Upcoming'), [query, setQuery] = useState(''), [selected, setSelected] = useState('');
  const [month, setMonth] = useState(parseDate('2026-05-01')), [view, setView] = useState('list');
  const [editor, setEditor] = useState(null), [drafts, setDrafts] = useEventState('drafts'), [task, setTask] = useState(null), [unread, setUnread] = useState(true);
  const [tasks, setTasks] = useState([{ id: 'survey', type: 'Survey', title: 'Check missing volunteer survey', done: false }, { id: 'grant', type: 'Grant', title: 'Confirm grant report disbursement', done: false }]);
  const active = events.find((e) => e.id === params.get('event'));
  const popRef = useRef(pop); popRef.current = pop;
  useEffect(() => () => { popRef.current.close(null, true); hideTip(); }, []);
  useEffect(() => { document.getElementById('main')?.scrollTo(0, 0); }, [active?.id]);
  const draftEvents = drafts.map((item) => ({ ...item.form, id: item.id, title: item.form.title.trim() || 'Untitled event', time: item.form.start && item.form.end ? `${timeLabel(item.form.start)}-${timeLabel(item.form.end)}`.toLowerCase() : 'Time to be added', status: 'Draft', tags: [] }));
  const tabEvents = tab === 'Drafts' ? draftEvents : events.filter((e) => tab === 'Saved' ? saved.has(e.id) : e.status === tab);
  const visible = tabEvents.filter((e) => (!selected || selected === e.date) && `${e.title} ${e.address} ${e.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const groupItems = tab === 'Upcoming' ? [['My Events', visible.filter((e) => e.group === 'mine')], ['This Month', visible.filter((e) => e.group !== 'mine')]] : [[tab === 'Drafts' ? 'Draft Events' : `${tab} Events`, visible]];
  const editDraft = (id) => {
    const item = drafts.find((entry) => entry.id === id);
    setEditor({ draftId: item.id, form: item.form, event: events.find((e) => e.id === item.sourceEventId) });
  };
  const saveToggle = (event) => {
    hideTip(); const next = new Set(saved), wasSaved = next.has(event.id);
    if (wasSaved) next.delete(event.id); else next.add(event.id);
    setSaved(next); toast(wasSaved ? 'Event removed from saved' : 'Event saved', { ic: 'bookmark' });
  };
  const selectDate = (date) => { hideTip(); setSelected(date); };
  const changeTab = (next) => { pop.close(null, true); setTab(next); setSelected(''); hideTip(); };
  const saveEvent = (form, draftOnly) => {
    if (draftOnly) {
      const item = { id: editor?.draftId || `draft-${crypto.randomUUID()}`, form: { ...form }, sourceEventId: editor?.event?.id };
      setDrafts((current) => [...current.filter((entry) => entry.id !== item.id), item]);
      toast('Draft saved', { ic: 'check', action: 'View drafts', onAction: () => { navigate('events'); setSelected(''); setQuery(''); setTab('Drafts'); } });
      return;
    }
    const existing = editor?.event;
    const event = { ...existing, id: existing?.id || `event-${Date.now()}`, title: form.title.trim(), detailTitle: '', date: form.date, start: form.start, end: form.end, time: `${timeLabel(form.start)}-${timeLabel(form.end)}`.toLowerCase(), address: form.address.trim(), organizer: form.organizer, type: form.type || form.title, tagText: form.tags, tags: existing?.tags || [], description: form.description, longDescription: form.description, survey: form.survey, registered: existing?.registered || 0, status: existing?.status || 'Upcoming', group: existing?.group || 'mine' };
    event.surveyDefinition = form.surveyDefinition;
    setEvents((current) => existing ? current.map((e) => e.id === existing.id ? event : e) : [...current, event]);
    if (editor?.draftId) setDrafts((current) => current.filter((item) => item.id !== editor.draftId));
    setSelected(''); setTab(event.status); setMonth(parseDate(`${event.date.slice(0, 7)}-01`));
    toast(existing ? 'Event updated' : 'Event created', { ic: 'check' });
  };
  const cancelEvent = (event) => {
    setEvents((current) => current.map((e) => e.id === event.id ? { ...e, status: 'Cancelled' } : e));
    toast('Event cancelled', { ic: 'check', action: 'Undo', onAction: () => setEvents((current) => current.map((e) => e.id === event.id ? event : e)) });
  };
  const message = (ids, event) => {
    Object.assign(M, { tab: 'message', composing: true, thread: null, msgThread: null, rcptsOpen: false, toQ: '', rcptKb: 0, rcpts: ids.map((id) => ({ kind: 'vol', id })), attach: [], channel: 'inapp' });
    Object.assign(draft(), { channel: 'inapp', subject: event.title, body: '' });
    rerender(); navigate('messages');
  };
  const notifications = (e) => pop.toggle(e.currentTarget, <Notifications onReadAll={() => setUnread(false)} onOpen={(key) => { setUnread(false); if (key === 'sophia') openConversation('c2'); else if (key === 'grant') setTask(tasks[1]); else list.current?.scrollIntoView({ block: 'start' }); }} />, { align: 'end' });

  return <div className="ae-page" ref={page}>
    <div className="top-nav ae-top-nav"><button className="tn-bell" aria-label="Notifications" onClick={notifications}><EventAsset name="list-group101" />{unread && <i className="tn-dot" />}</button><span className="tn-sep" /><button className="tn-me" aria-label="Account" onClick={(e) => pop.toggle(e.currentTarget, <AccountMenu onSettings={() => notBuilt('Settings')} />, { align: 'end' })}><img className="ae-avatar" src="/assets/events/list-ellipse47.png" alt="" /></button></div>
    {active ? <EventDetail key={active.id} event={active} onBack={() => navigate('events')} onEdit={(event, options) => setEditor({ event, ...options })} onCancel={cancelEvent} onMessage={message} /> : <div className="ae-workspace">
      <header className="ae-heading"><h1>Events</h1><p>Create and manage Dress for Success’s events and to-do tasks</p></header>
      <EventTabs value={tab} onChange={changeTab} />
      <div className="ae-layout"><section className="ae-list" id="admin-events-panel" role="tabpanel" aria-label={`${tab} events`} ref={list}>
        <div className="ae-toolbar"><label className="search ae-search"><EventAsset name="list-vector" /><input aria-label="Search events" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} /></label><button className={`ae-filter ${selected ? 'on' : ''}`} aria-haspopup="dialog" aria-label="Filter events by date" onClick={(e) => pop.toggle(e.currentTarget, <DateFilter date={selected} onApply={selectDate} />, { align: 'end' })}><EventAsset name="list-list-filter" />Date</button><div className="ae-views" role="group" aria-label="Event layout"><button aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}><EventAsset name="list-grip" /></button><button aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><EventAsset name="list-layout-list" /></button></div><button className="btn btn-dark ae-create" onClick={() => setEditor({})}>Create event<EventAsset name="list-plus" /></button></div>
        {selected && <button className="ae-active-filter" onClick={() => selectDate('')}>{dateLabel(selected)}<Icon name="x" size={14} /><span className="sr">Clear date filter</span></button>}
        <div className="ae-groups">{groupItems.filter(([, items]) => items.length).map(([label, items]) => <section className="ae-group" key={label}><header><h2>{label}</h2><span>{items.length} {items.length === 1 ? 'Event' : 'Events'}</span></header><div className={`ae-cards ${view}`}>{items.map((event) => <EventCard key={event.id} event={event} saved={saved.has(event.id)} onSave={saveToggle} layout={view} onEditDraft={tab === 'Drafts' ? () => editDraft(event.id) : undefined} />)}</div></section>)}{!visible.length && <EmptyEvents tab={tab} filtered={Boolean(selected || query.trim())} onClear={() => { setSelected(''); setQuery(''); }} />}</div>
      </section><aside className="ae-rail"><Calendar month={month} onMonth={(direction) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + direction, 1))} selected={selected} onSelect={selectDate} events={events} saved={saved} /><Tasks tasks={tasks} onOpen={setTask} /></aside></div>
    </div>}
    {editor && <EventEditor event={editor.event} draft={editor.form} defaultDate={selected || EVENT_TODAY} onSave={saveEvent} onClosed={() => setEditor(null)} startSurvey={editor.startSurvey} />}
    {task && <EventDialog label={task.title} onClosed={() => setTask(null)}>{(close) => <div className="ae-task-dialog"><header className="ae-dialog-head"><h2>{task.title}</h2><button className="icon-btn plain" aria-label="Close task" onClick={() => close()}><Icon name="x" /></button></header>{task.id === 'all' ? tasks.map((item) => <button className="ae-task-list-item" key={item.id} onClick={() => setTask(item)}>{item.title}<span>{item.done ? 'Complete' : 'To do'}</span></button>) : <><p>{task.type === 'Survey' ? 'Review event survey responses and follow up with volunteers whose surveys are missing.' : 'Review the grant report disbursement confirmation before completing this task.'}</p><p className="muted">{task.type === 'Survey' ? `${events.filter((e) => e.status === 'Completed').length} completed events available for review.` : 'Grant report disbursement confirmation'}</p><button className="btn btn-dark" onClick={() => { setTasks((current) => current.map((t) => t.id === task.id ? { ...t, done: true } : t)); toast('Task marked complete'); close(true); }}>Mark complete</button></>}</div>}</EventDialog>}
  </div>;
}
