import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon.jsx';
import CalendarKey from '../components/CalendarKey/CalendarKey.jsx';
import SlidingTabs from '../components/SlidingTabs.jsx';
import { hideTip, useFitZoom, usePop, usePopClose } from '../components/ui.jsx';
import { TODAY } from '../data.js';
import { useStore } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import EventAsset from '../features/events/EventAsset.jsx';
import { Modal } from './Modal.jsx';
import { AnnouncementModal } from './Modals.jsx';
import EventActions from './EventActions.jsx';
import VolunteerEventDetail from './EventDetail.jsx';
import { registrationTime, useRegistration } from './Registration.jsx';
import { shortTime } from './shared.js';
import VolunteerTopNav from './TopNav.jsx';
import { useVolunteerEventActions } from './useEventActions.js';
import { ATTENDED_EVENTS, eventDate, eventDateLabel, shiftHours, volunteerEvents } from './eventData.js';
import './events.css';

const TABS = ['Upcoming', 'Saved', 'Registered', 'Attended'];
const monthName = date => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const isoDay = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export function EventDialog({ label, onClosed, children }) {
  const opener = useRef(document.activeElement);
  useEffect(() => () => { if (opener.current?.isConnected) opener.current.focus({ preventScroll: true }); }, []);
  return <Modal label={label} onClosed={onClosed}>{close => <div className="ve-dialog" onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll('button:not(:disabled), input, a[href]')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}>{children(close)}</div>}</Modal>;
}

function DateFilter({ selected, onApply }) {
  const close = usePopClose(), [date, setDate] = useState(selected);
  return <form className="ve-filter-form" onSubmit={event => { event.preventDefault(); onApply(date); close(true); }}><label>Filter by date<input aria-label="Filter by date" type="date" className="field" value={date} onChange={event => setDate(event.target.value)} /></label><div><button type="button" className="btn btn-outline" onClick={() => { onApply(''); close(true); }}>Clear</button><button className="btn btn-dark">Apply</button></div></form>;
}

function CardDate({ event }) {
  return <div className="ve-card-date"><span>{event.mon}</span><b>{event.day}</b><small>{shortTime(event.time)}</small></div>;
}

export function EventCard({ event, registered, saved, onSave, onRegister, onOpen, layout = 'list', flag }) {
  const actions = <EventActions {...{ event, registered, saved, onSave, onRegister }} />;
  return <article className="ve-event-card" data-event-id={event.id}>
    <button className="ve-card-open" aria-label={`Open ${event.title}, ${eventDateLabel(event.date)}`} onClick={click => onOpen(event, click.currentTarget)} />
    {layout === 'grid' ? <div className="ve-grid-heading"><CardDate event={event} />{actions}</div> : <CardDate event={event} />}
    <div className="ve-card-body"><header><div className="ve-card-title"><h2>{event.title}</h2>{flag && <span className="ve-new">{flag}</span>}{event.recommendation && <span className="ve-recommend" data-tip={event.recommendation.why}>Recommend</span>}</div>{layout !== 'grid' && actions}</header>
      <div className="ve-card-location"><span>{event.addr}</span>{event.recommendation && <><EventAsset name="list-dot" /><span>{event.recommendation.dist} from you</span></>}</div>
      <p>{event.desc}</p><div className="ve-card-tags">{event.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
    </div>
  </article>;
}

function EmptyEvents({ tab, filtered, onClear }) {
  const messages = { Upcoming: 'There are no upcoming events to explore yet', Saved: 'You haven’t saved any events yet', Registered: 'You’re not registered for any events yet', Attended: 'You don’t have any attended events recorded yet' };
  return <div className="ve-empty"><div className="ve-empty-icon"><EventAsset name="detail-handshake" /></div><p role="status">{filtered ? 'No events match your selected filters' : messages[tab]}</p>{filtered && <button className="btn btn-outline" onClick={onClear}>Clear filters</button>}</div>;
}

function Calendar({ month, onMonth, events, registered, selected, onSelect }) {
  const year = month.getFullYear(), index = month.getMonth(), days = new Date(year, index + 1, 0).getDate(), offset = new Date(year, index, 1).getDay();
  const dates = new Set(events.map(event => event.date)), mine = new Set(events.filter(event => registered.has(event.id)).map(event => event.date));
  // Same calendar design as the dashboard CalendarCard (.cal), framed as a rail card
  return <section className="cal ve-calendar" aria-label="Event calendar"><div className="cal-head"><button className="icon-btn plain" aria-label="Previous month" onClick={() => onMonth(-1)}><Icon name="chev-r" size={22} /></button><div className="calendar-title"><h2 aria-live="polite">{monthName(month)}</h2><CalendarKey><span><i className="dot needs" /> Registered Events</span><span><i className="dot" /> All Events</span></CalendarKey></div><button className="icon-btn plain" aria-label="Next month" onClick={() => onMonth(1)}><Icon name="chev-r" size={22} /></button></div>
    <div className="cal-grid cal-dow">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div>
    <div className="cal-grid">{Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: days }, (_, i) => {
      const day = i + 1, date = isoDay(year, index, day);
      return <button key={date} className={`cal-day ${date === TODAY ? 'today' : ''} ${date === selected ? 'sel' : ''} ${date < TODAY ? 'past' : ''}`} aria-label={eventDateLabel(date)} aria-pressed={date === selected} onClick={() => onSelect(date === selected ? '' : date)}>{day}{dates.has(date) && <i className={`dot ${mine.has(date) ? 'needs' : ''}`} />}</button>;
    })}</div>
  </section>;
}

function Activity({ events, registered }) {
  const { records } = useRegistration();
  const [month, setMonth] = useState(() => eventDate(TODAY).getMonth());
  const [year, setYear] = useState(() => eventDate(TODAY).getFullYear());
  const nav = direction => { hideTip(); const next = new Date(year, month + direction, 1); setMonth(next.getMonth()); setYear(next.getFullYear()); };
  const ranges = [[1, 7], [8, 14], [15, 21], [22, new Date(year, month + 1, 0).getDate()]];
  const totals = ranges.map(([first, last]) => events.filter(event => { const date = eventDate(event.date); return registered.has(event.id) && date.getFullYear() === year && date.getMonth() === month && date.getDate() >= first && date.getDate() <= last; }).reduce((sum, event) => sum + shiftHours(registrationTime(records[event.id], event.time)), 0));
  const max = Math.max(6, ...totals), current = month === eventDate(TODAY).getMonth() && year === eventDate(TODAY).getFullYear();
  return <section className="ve-activity" aria-label="Scheduled volunteer activity"><div className="ve-month"><button aria-label="Previous activity month" onClick={() => nav(-1)}><EventAsset name="list-chevron-right" className="ve-left" /></button><h2>{current ? 'Your activity this month' : monthName(new Date(year, month, 1))}</h2><button aria-label="Next activity month" onClick={() => nav(1)}><EventAsset name="list-chevron-right1" /></button></div>
    <div className="ve-chart" role="img" aria-label={`${monthName(new Date(year, month, 1))}: ${totals.reduce((a, b) => a + b, 0)} scheduled volunteer hours`}><span className="ve-axis-title">Hours</span><div className="ve-y-axis">{[max, max * 2 / 3, max / 3, 0].map((value, i) => <span key={i}>{Math.round(value)}</span>)}</div><div className="ve-chart-main"><div className="ve-bars" key={`${year}-${month}`}>{totals.map((hours, i) => <div key={i} style={{ height: `${hours / max * 100}%`, animationDelay: `${i * 40}ms` }} data-tip={`${ranges[i][0]}-${ranges[i][1]}: ${hours} scheduled hours`} />)}</div><div className="ve-x-axis">{ranges.map(([first, last]) => <span key={first}>{first}-{last}</span>)}</div><span className="ve-day-label">Day</span></div></div>
    <p className="ve-chart-note">Scheduled hours from your registered events</p><button className="link ve-dashboard-link" onClick={() => navigate('dashboard')}>See dashboard <EventAsset name="list-arrow-right" /></button>
  </section>;
}

export default function VolunteerEvents({ registered, setRegistered, saved, setSaved, eventId = null }) {
  useStore();
  const page = useRef(null), pop = usePop();
  const { onSave, onRegister } = useVolunteerEventActions({ registered, setRegistered, saved, setSaved });
  useFitZoom(page, { designWidth: 1488, minWidth: 1000 });
  const [tab, setTab] = useState('Upcoming'), [query, setQuery] = useState(''), [selected, setSelected] = useState(''), [layout, setLayout] = useState('list');
  const [month, setMonth] = useState(() => new Date(eventDate(TODAY).getFullYear(), eventDate(TODAY).getMonth(), 1));
  const [modal, setModal] = useState(null);
  const popRef = useRef(pop); popRef.current = pop;
  const previousId = useRef(null), listScroll = useRef(0), opener = useRef(null);
  useEffect(() => () => { popRef.current.close(null, true); hideTip(); }, []);
  useEffect(() => {
    const main = document.getElementById('main');
    popRef.current.close(null, true); hideTip(); setModal(null);
    const returning = eventId === null && previousId.current !== null;
    previousId.current = eventId;
    const frame = requestAnimationFrame(() => {
      if (eventId !== null) { main?.scrollTo(0, 0); page.current?.querySelector('.ve-detail h1')?.focus({ preventScroll: true }); }
      else if (returning) {
        main?.scrollTo(0, listScroll.current);
        const target = opener.current?.isConnected && opener.current.getClientRects().length ? opener.current : page.current?.querySelector('[role="tab"][aria-selected="true"]');
        target?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [eventId]);
  const events = volunteerEvents(), all = [...events, ...ATTENDED_EVENTS];
  /* "New" markers: saving / registering puts a dot on the Saved / Registered tab (it
     pulses again for each further addition). Opening that tab clears the dot and tags
     those cards "Newly saved" / "Newly registered" until the user switches tabs.
     Unsaving / cancelling drops the event from both. */
  const [unseen, setUnseen] = useState({ Saved: [], Registered: [] }), [fresh, setFresh] = useState({ tab: 'Upcoming', ids: [] });
  const prevLists = useRef({ Saved: saved, Registered: registered });
  useEffect(() => {
    const prev = prevLists.current, now = { Saved: saved, Registered: registered };
    prevLists.current = now;
    setUnseen(current => {
      const next = {};
      for (const key of ['Saved', 'Registered']) {
        const added = key === tab ? [] : [...now[key]].filter(id => !prev[key].has(id) && !current[key].includes(id));
        next[key] = [...current[key], ...added].filter(id => now[key].has(id));
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, registered]);
  const flagFor = event => {
    if (fresh.tab !== tab || !fresh.ids.includes(event.id)) return undefined;
    if (tab === 'Saved') return saved.has(event.id) ? 'Newly saved' : undefined;
    return tab === 'Registered' && registered.has(event.id) ? 'Newly registered' : undefined;
  };
  const changeTab = value => {
    pop.close(null, true); hideTip();
    if (value !== tab) { setFresh({ tab: value, ids: unseen[value] || [] }); setUnseen(current => (current[value]?.length ? { ...current, [value]: [] } : current)); }
    setTab(value); setSelected('');
  };
  const pool = tab === 'Saved' ? all.filter(event => saved.has(event.id)) : tab === 'Registered' ? events.filter(event => registered.has(event.id)) : tab === 'Attended' ? ATTENDED_EVENTS : events.filter(event => event.date >= TODAY);
  const filtered = Boolean(query.trim() || selected);
  const visible = pool.filter(event => (!selected || selected === event.date) && `${event.title} ${event.addr} ${event.desc} ${event.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => Number(Boolean(b.recommendation)) - Number(Boolean(a.recommendation)) || a.date.localeCompare(b.date));
  const today = eventDate(TODAY), endWeek = new Date(today); endWeek.setDate(today.getDate() + 6 - today.getDay());
  const groups = tab === 'Attended' ? [...new Set(visible.map(event => event.date.slice(0, 7)))].reverse().map(key => [monthName(eventDate(`${key}-01`)), visible.filter(event => event.date.startsWith(key)).reverse()]) : [
    ['This Week', visible.filter(event => !event.past && event.date >= TODAY && eventDate(event.date) <= endWeek)],
    ['This Month', visible.filter(event => !event.past && event.date.slice(0, 7) === TODAY.slice(0, 7) && eventDate(event.date) > endWeek)],
    ['Later', visible.filter(event => !event.past && event.date.slice(0, 7) !== TODAY.slice(0, 7))],
    ['Past Events', visible.filter(event => event.past)],
  ];
  const activeEvent = eventId !== null ? all.find(event => event.id === eventId) : null;
  const openEvent = (event, anchor) => { opener.current = anchor; listScroll.current = document.getElementById('main')?.scrollTop || 0; pop.close(null, true); hideTip(); navigate(`events?id=${encodeURIComponent(event.id)}`); };
  const selectDate = date => { setSelected(date); if (date) { const parsed = eventDate(date); setMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1)); } };
  return <div className="ve-page ae-page" ref={page}>
    <VolunteerTopNav onAnnouncement={() => setModal({ kind: 'announcement' })} />
    <div hidden={eventId !== null}><div className="ve-workspace"><header className="ve-heading"><h1>Your events</h1><p>Explore and register to volunteer at events</p></header>
      <SlidingTabs value={tab} onChange={changeTab} items={TABS} label="Volunteer event status" panelId="volunteer-events-panel" className="ve-tabs" lineClassName="ve-tab-line" marks={{ Saved: unseen.Saved.length, Registered: unseen.Registered.length }} />
      <div className="ve-layout"><section className="ve-list" id="volunteer-events-panel" role="tabpanel" aria-label={`${tab} volunteer events`}>
        <div className="ve-toolbar"><label className="ve-search"><EventAsset name="list-vector" /><input aria-label="Search events" placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} /></label><button className={`ve-filter ${selected ? 'on' : ''}`} aria-label="Filter events by date" aria-haspopup="dialog" onClick={event => pop.toggle(event.currentTarget, <DateFilter selected={selected} onApply={selectDate} />, { align: 'end' })}><EventAsset name="list-list-filter" />Date</button><div className="ve-views" role="group" aria-label="Event layout"><button aria-label="Grid view" aria-pressed={layout === 'grid'} className={layout === 'grid' ? 'on' : ''} onClick={() => setLayout('grid')}><EventAsset name="list-grip" /></button><button aria-label="List view" aria-pressed={layout === 'list'} className={layout === 'list' ? 'on' : ''} onClick={() => setLayout('list')}><EventAsset name="list-layout-list" /></button></div></div>
        {selected && <button className="ve-active-filter" onClick={() => setSelected('')}>{eventDateLabel(selected)} <Icon name="x" size={14} /><span className="sr">Clear date filter</span></button>}
        <div className="ve-groups">{groups.filter(([, items]) => items.length).map(([name, items]) => <section key={name} className="ve-group"><header><h2>{name}</h2><span>{items.length} {items.length === 1 ? 'Event' : 'Events'}</span></header><div className={`ve-cards ${layout}`}>{items.map(event => <EventCard key={event.id} {...{ event, onSave, onRegister, layout }} registered={registered.has(event.id)} saved={saved.has(event.id)} flag={flagFor(event)} onOpen={openEvent} />)}</div></section>)}{!visible.length && <section className="ve-group"><header><h2>{tab} Events</h2><span>0 Events</span></header><EmptyEvents tab={tab} filtered={filtered} onClear={() => { setQuery(''); setSelected(''); }} /></section>}</div>
      </section><aside className="ve-rail"><Calendar month={month} onMonth={direction => setMonth(current => new Date(current.getFullYear(), current.getMonth() + direction, 1))} events={events} registered={registered} selected={selected} onSelect={selectDate} /><Activity events={events} registered={registered} /></aside></div>
    </div></div>
    {eventId !== null && <VolunteerEventDetail key={eventId} event={activeEvent} registered={registered.has(eventId)} saved={saved.has(eventId)} {...{ onSave, onRegister }} onBack={() => navigate('events')} />}
    {modal?.kind === 'announcement' && <EventDialog label="Volunteer announcement" onClosed={() => setModal(null)}>{close => <AnnouncementModal close={close} />}</EventDialog>}
  </div>;
}
