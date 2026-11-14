// "Upcoming events" calendar card: month grid with shift dots, day filter, event list,
// and the "+ add shift" popover form (vanilla calCardHTML / evItem / add-shift).
import { useEffect, useRef } from 'react';
import { Icon } from '../../components/Icon.jsx';
import { usePop, usePopClose, useToast, hideTip } from '../../components/ui.jsx';
import { SHIFTS, SHIFT_DATES, TODAY } from '../../data.js';
import { emit } from '../../lib/store.js';
import { D, bump } from './state.js';
import { useMsgShift } from './hooks.js';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function AddShiftForm({ def, onAdd }) {
  const close = usePopClose();
  const title = useRef(null), date = useRef(null), time = useRef(null), cap = useRef(null);
  useEffect(() => { const t = setTimeout(() => title.current?.select(), 30); return () => clearTimeout(t); }, []);
  const submit = (e) => {
    e.preventDefault();
    onAdd({ title: title.current.value.trim() || 'New shift', date: date.current.value || TODAY, time: time.current.value, cap: +cap.current.value || 10 });
    close(true);
  };
  return (
    <form className="link-pop" style={{ width: 300 }} onSubmit={submit}>
      <div className="menu-label" style={{ padding: 0 }}>New shift</div>
      <input className="field" id="nsTitle" ref={title} placeholder="Shift name" defaultValue="Boutique Fittings" autoComplete="off" />
      <input className="field" id="nsDate" ref={date} type="date" defaultValue={def} min={TODAY} />
      <select className="field" id="nsTime" ref={time} defaultValue="5:30–7:30 PM">
        <option>9:00 AM–12:00 PM</option><option>12:00–2:00 PM</option><option>5:30–7:30 PM</option><option>6:00–8:00 PM</option>
      </select>
      <input className="field" id="nsCap" ref={cap} type="number" min="1" max="50" defaultValue="10" aria-label="Spots" />
      <button className="btn btn-dark btn-sm">Add shift</button>
    </form>
  );
}

function EvItem({ id, flash }) {
  const msgShift = useMsgShift();
  const s = SHIFTS[id];
  const low = s.filled / s.cap < 0.6;
  return (
    <div className={`ev-item ${flash ? 'is-new-msg' : ''}`}>
      <div className="ev-date"><small>{s.mon}</small><b>{s.day}</b></div>
      <div className="ev-main"><div className="ev-title">{s.title}</div><div className="ev-time">{s.time}</div>
        <div className="ev-meta"><span><Icon name="clock" size={14} /> {s.mon} {s.day} · <span className={low ? 'low' : ''}>{s.filled} of {s.cap} spots filled</span></span><span><Icon name="pin" size={14} /> {s.addr}</span></div></div>
      <button className="btn btn-outline btn-sm ev-act" onClick={() => msgShift(id)}>Message volunteers</button>
    </div>
  );
}

export function CalendarCard() {
  const pop = usePop();
  const toast = useToast();
  const { y, m, sel, flash } = D.cal;
  // The "just added" highlight shows once, like vanilla clearing D.cal.flash after renderCal()
  useEffect(() => { if (D.cal.flash) D.cal.flash = null; });

  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const iso = (d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const byDate = {};
  Object.entries(SHIFT_DATES).forEach(([id, d]) => (byDate[d] ||= []).push(id));
  const monthLong = first.toLocaleString('en-US', { month: 'long' });

  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(<span key={`b${i}`} />);
  for (let d = 1; d <= days; d++) {
    const key = iso(d);
    const ev = byDate[key] || [];
    const needs = ev.some((id) => SHIFTS[id].filled / SHIFTS[id].cap < 0.6);
    const tip = ev.length ? `${ev.map((id) => SHIFTS[id].title).join(', ')}${needs ? ' · needs volunteers' : ''}` : undefined;
    cells.push(
      <button key={key} className={`cal-day ${key === TODAY ? 'today' : ''} ${key === sel ? 'sel' : ''} ${key < TODAY ? 'past' : ''}`}
        data-tip={tip} aria-label={`${monthLong} ${d}${ev.length ? `, ${ev.length} shift${ev.length > 1 ? 's' : ''}` : ''}`}
        aria-pressed={key === sel}
        onClick={() => { D.cal.sel = D.cal.sel === key ? null : key; hideTip(); bump(); }}>
        {d}{ev.length > 0 && <i className={`dot ${needs ? 'needs' : ''}`} />}
      </button>,
    );
  }
  const all = Object.keys(SHIFT_DATES).filter((id) => SHIFT_DATES[id] >= TODAY).sort((a, b) => SHIFT_DATES[a].localeCompare(SHIFT_DATES[b]));
  const shown = sel ? all.filter((id) => SHIFT_DATES[id] === sel) : all;
  const programs = new Set(all.map((id) => SHIFTS[id].title.split(' ')[0])).size;
  const groups = {};
  shown.forEach((id) => { const k = new Date(`${SHIFT_DATES[id]}T12:00`).toLocaleString('en-US', { month: 'long', year: 'numeric' }); (groups[k] ||= []).push(id); });
  const selLabel = sel && new Date(`${sel}T12:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const nav = (dir) => { const d = new Date(D.cal.y, D.cal.m + dir, 1); D.cal.y = d.getFullYear(); D.cal.m = d.getMonth(); bump(); };
  const clear = () => { D.cal.sel = null; bump(); };
  const addShift = ({ title, date, time, cap }) => {
    const dt = new Date(`${date}T12:00`);
    const id = `n${Date.now()}`;
    SHIFTS[id] = { mon: dt.toLocaleString('en-US', { month: 'short' }), day: dt.getDate(), time, addr: 'Homestead Boutique, 125 E 8th Ave', title, desc: 'New shift.', roles: 'Volunteer', tags: ['any language'], filled: 0, cap, vols: [] };
    SHIFT_DATES[id] = date;
    Object.assign(D.cal, { y: dt.getFullYear(), m: dt.getMonth(), sel: date, flash: id });
    bump(); emit();
    toast(`Added ${title} on ${SHIFTS[id].mon} ${SHIFTS[id].day}`);
  };
  const openAdd = (e) => pop.toggle(e.currentTarget, <AddShiftForm def={D.cal.sel || '2026-12-23'} onAdd={addShift} />, { align: 'end' });

  return (
    <section className="card cal-card" data-card="calendar" id="calCard">
      <div className="cal">
        <div className="cal-head"><button className="icon-btn plain" aria-label="Previous month" onClick={() => nav(-1)}><Icon name="chev-r" size={22} /></button>
          <span aria-live="polite">{first.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button className="icon-btn plain" aria-label="Next month" onClick={() => nav(1)}><Icon name="chev-r" size={22} /></button></div>
        <div className="cal-grid cal-dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
        <div className="cal-grid">{cells}</div>
        <div className="cal-legend"><span><i className="dot needs" /> Needs volunteers</span><span><i className="dot" /> Staffed</span></div>
      </div>
      <div className="ev">
        <div className="ev-head"><div><h2 className="h2">Upcoming events</h2><div className="card-sub" style={{ fontWeight: 500, fontSize: 14 }}>{all.length} scheduled shifts across {programs} programs</div></div>
          <div className="ev-btns">
            {sel && <span className="attach" key={sel}>{selLabel}<button aria-label="Clear date" onClick={clear}><Icon name="x" size={11} /></button></span>}
            <button className="btn btn-outline btn-xs" style={{ borderColor: '#d6d6d6' }} onClick={clear}>See all</button>
            <button className="icon-btn dark" style={{ width: 36, height: 36 }} data-tip="Add a shift" aria-label="Add a shift" aria-haspopup="dialog" onClick={openAdd}><Icon name="plus" size={16} /></button>
          </div></div>
        <div className="ev-list">
          {shown.length
            ? Object.entries(groups).map(([k, ids]) => [<div className="ev-month" key={k}>{k}</div>, ...ids.map((id) => <EvItem key={id} id={id} flash={flash === id} />)])
            : <div className="ev-empty">No shifts on {selLabel}.<br /><button className="link" onClick={openAdd}>Add one <Icon name="arrow-r" size={12} /></button></div>}
        </div>
      </div>
    </section>
  );
}
