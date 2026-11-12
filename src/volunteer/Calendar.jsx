// Calendar + "Upcoming events" card (month nav, day filter, legend, Add to calendar, Can't make it)
import { Fragment } from 'react';
import { Icon } from '../components/Icon.jsx';
import { usePopClose } from '../components/ui.jsx';
import { SHIFTS, SHIFT_DATES, TODAY } from '../data.js';
import { registrationTime, useRegistration } from './Registration.jsx';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthKey = (iso) => new Date(`${iso}T12:00`).toLocaleString('en-US', { month: 'long', year: 'numeric' });

export function myShifts(registered) {
  return [...registered].filter((id) => SHIFT_DATES[id] >= TODAY).sort((a, b) => SHIFT_DATES[a].localeCompare(SHIFT_DATES[b]));
}

// "Can't make it" confirm popover content
export function CancelConfirm({ id, onConfirm }) {
  const close = usePopClose();
  const s = SHIFTS[id];
  return (
    <div className="vp-confirm">
      <h4>Cancel {s.title}?</h4>
      <p>Your spot on {s.mon} {s.day} opens up for someone else, and Bridget gets a heads-up.</p>
      <div className="vp-confirm-acts">
        <button className="btn btn-outline btn-sm" data-act="close-pop" onClick={() => close()}>Keep my spot</button>
        <button className="btn btn-dark btn-sm" data-act="confirm-cancel" data-id={id} onClick={() => { close(true); onConfirm(id); }}>Cancel shift</button>
      </div>
    </div>
  );
}

function EvItem({ id, flash, onAddCal, onCancel }) {
  const s = SHIFTS[id];
  const { records } = useRegistration();
  return (
    <div className={`ev-item ${flash ? 'is-new-msg' : ''}`} data-ev={id}>
      <div className="ev-date"><small>{s.mon}</small><b>{s.day}</b></div>
      <div className="ev-main">
        <div className="ev-title">{s.title}</div>
        <div className="ev-time">{registrationTime(records[id], s.time)}</div>
        <div className="ev-meta">
          <span><Icon name="check" size={14} /> You’re registered · {s.roles.split(',')[0]}</span>
          <span><Icon name="pin" size={14} /> {s.addr}</span>
        </div>
      </div>
      <div className="ev-acts">
        <button className="btn btn-outline btn-sm ev-act" data-act="add-cal" data-id={id} onClick={() => onAddCal(id)}>
          <Icon name="cal-plus" size={14} /> Add to calendar
        </button>
        <button className="btn btn-sm ev-act vp-cancel" data-act="cancel-shift" data-id={id} onClick={(e) => onCancel(e.currentTarget, id)}>Can’t make it</button>
      </div>
    </div>
  );
}

export function CalendarCard({ cal, registered, recommended, flash, onNav, onDay, onClear, onFind, onAddCal, onCancel }) {
  const { y, m, sel } = cal;
  const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
  const iso = (d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const all = myShifts(registered);
  const mine = new Set(all.map((id) => SHIFT_DATES[id]));
  const recs = new Set(recommended.filter((r) => !registered.has(r.id)).map((r) => SHIFT_DATES[r.id]));

  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(<span key={`b${i}`} />);
  for (let d = 1; d <= days; d++) {
    const k = iso(d);
    const tip = mine.has(k) ? 'You’re signed up' : recs.has(k) ? 'Recommended for you' : '';
    cells.push(
      <button
        key={k}
        className={`cal-day ${k === TODAY ? 'today' : ''} ${k === sel ? 'sel' : ''} ${k < TODAY ? 'past' : ''}`}
        data-act="cal-day"
        data-d={k}
        data-tip={tip || undefined}
        onClick={() => onDay(k)}
      >
        {d}{mine.has(k) ? <i className="dot needs" /> : recs.has(k) ? <i className="dot" /> : null}
      </button>,
    );
  }

  const shown = sel ? all.filter((id) => SHIFT_DATES[id] === sel) : all;
  const groups = {};
  shown.forEach((id) => { (groups[monthKey(SHIFT_DATES[id])] ||= []).push(id); });
  const selLabel = sel && new Date(`${sel}T12:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <div className="cal">
        <div className="cal-head">
          <button className="icon-btn plain" data-act="cal-nav" data-v="-1" aria-label="Previous month" onClick={() => onNav(-1)}><Icon name="chev-r" size={22} /></button>
          <span>{first.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button className="icon-btn plain" data-act="cal-nav" data-v="1" aria-label="Next month" onClick={() => onNav(1)}><Icon name="chev-r" size={22} /></button>
        </div>
        <div className="cal-grid cal-dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
        <div className="cal-grid">{cells}</div>
        <div className="cal-legend"><span><i className="dot needs" /> Signed up</span><span><i className="dot" /> Recommended</span></div>
      </div>
      <div className="ev">
        <div className="ev-head">
          <div>
            <h2 className="h2">Upcoming events</h2>
            <div className="card-sub" style={{ fontWeight: 500, fontSize: 14 }}>{all.length} {all.length === 1 ? 'shift' : 'shifts'} you’re signed up for</div>
          </div>
          <div className="ev-btns">
            {sel && <span className="attach">{selLabel}<button data-act="cal-clear" aria-label="Clear date" onClick={onClear}><Icon name="x" size={11} /></button></span>}
            <button className="btn btn-outline btn-xs" style={{ borderColor: '#d6d6d6' }} data-act="cal-clear" onClick={onClear}>See all</button>
            <button className="icon-btn dark" style={{ width: 36, height: 36 }} data-act="find-events" data-tip="Find more events" aria-label="Find more events" onClick={onFind}><Icon name="plus" size={16} /></button>
          </div>
        </div>
        <div className="ev-list">
          {shown.length ? Object.entries(groups).map(([k, ids]) => (
            <Fragment key={k}>
              <div className="ev-month">{k}</div>
              {ids.map((id) => <EvItem key={id} id={id} flash={flash === id} onAddCal={onAddCal} onCancel={onCancel} />)}
            </Fragment>
          )) : (
            <div className="ev-empty">
              {sel ? `Nothing on ${selLabel}.` : 'You haven’t signed up for anything yet.'}<br />
              <button className="link" data-act="find-events" onClick={onFind}>Find events <Icon name="arrow-r" size={12} /></button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
