// Group conversation details: the side panel for group chats, built on the same structure as the
// 1:1 profile panel (header block + button, labelled sections, tabs with small cards).
// What a coordinator needs about a group: what it's for and which event it's about, who's in it and
// how each person is reached (app or email), the shifts they share, what's been shared, and quiet
// group actions (mute, archive). Patterns from Teams chat details, WhatsApp group info, Remind
// reachability and BAND event groups.
import { CONVOS, ME, SHIFTS, SHIFT_DATES, VOLS } from '../../data.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import { hideTip } from '../../components/ui.jsx';
import { M, UI, closePops, convo, convoName, firstName, renderConv, rerender } from './state.js';
import { openConvo } from './actions.js';

const reachable = (w) => (VOLS[w].appDays != null ? 'app' : 'email');

function AddPeoplePop({ c }) {
  const onEvent = c.event ? (SHIFTS[c.event]?.vols || []).filter((w) => !c.who.includes(w)) : [];
  const others = ['sarah', 'sophia', 'marie', 'elena', 'janice', 'rosaline', 'andre', 'marcus'].filter((w) => VOLS[w] && !c.who.includes(w) && !onEvent.includes(w));
  const add = (w) => {
    c.who.push(w);
    c.msgs.push({ type: 'divider', text: `You added ${VOLS[w].name}` });
    closePops();
    renderConv();
    UI.toast(`Added ${VOLS[w].name}. They’ll see messages from now on${reachable(w) === 'email' ? ', by email' : ''}.`, { ic: 'check' });
  };
  const row = (w) => (
    <button key={w} className="menu-item grp-add-row" onClick={() => add(w)}>
      <Avatar id={w} className="sm" /><span><b>{VOLS[w].name}</b><small>{VOLS[w].role}</small></span>
      {reachable(w) === 'email' && <span className="grp-ch" data-tip="Hasn’t joined the app"><Icon name="mail" size={14} /> Email</span>}
    </button>
  );
  return (
    <div className="menu grp-add" role="menu" aria-label="Add people">
      {onEvent.length > 0 && <><div className="menu-label">Signed up for {SHIFTS[c.event].title}</div>{onEvent.map(row)}</>}
      <div className="menu-label">Other volunteers</div>
      {others.slice(0, 5).map(row)}
    </div>
  );
}

function messagePerson(w) {
  hideTip();
  const dm = CONVOS.find((x) => !x.name && x.who.length === 1 && x.who[0] === w);
  if (dm) { openConvo(dm.id); return; }
  Object.assign(M, { composing: true, msgThread: null, rcptsOpen: false });
  M.rcpts = [{ kind: 'vol', id: w }];
  renderConv();
}

export function GroupDetails({ c }) {
  const tab = M.groupTab || 'shifts';

  // Shifts at least one member is signed up for, soonest first
  const shiftIds = [...new Set(c.who.flatMap((w) => VOLS[w].upcoming || []))].filter((s) => SHIFTS[s])
    .sort((a, b) => (SHIFT_DATES[a] || '').localeCompare(SHIFT_DATES[b] || ''));
  const going = (s) => c.who.filter((w) => VOLS[w].upcoming?.includes(s));
  // Shifts and links that were shared in the conversation
  const shared = c.msgs.flatMap((m) => [
    ...(m.type === 'shift' ? [{ kind: 'shift', id: m.shift }] : []),
    ...(m.attach || []).filter((a) => a.type === 'shift' || a.type === 'link').map((a) => ({ kind: a.type, id: a.id, url: a.url })),
  ]);

  const setTab = (t) => { M.groupTab = t; rerender(); };
  const addPeople = (e) => UI.pop.toggle(e.currentTarget, <AddPeoplePop c={c} />, { align: 'end' });
  const toggleMute = () => {
    c.muted = !c.muted; hideTip(); rerender();
    UI.toast(c.muted ? `Muted ${convoName(c)}. New messages won’t notify you.` : `Unmuted ${convoName(c)}`, { ic: c.muted ? 'bell-off' : 'bell' });
  };
  const archive = () => {
    const i = CONVOS.indexOf(c);
    CONVOS.splice(i, 1);
    const next = CONVOS[Math.min(i, CONVOS.length - 1)];
    if (next) M.active = next.id;
    renderConv();
    UI.toast(`Archived ${convoName(c)}`, { ic: 'archive', action: 'Undo', onAction: () => { CONVOS.splice(i, 0, c); M.active = c.id; renderConv(); } });
  };
  const shiftCard = (s, sub) => (
    <div className="mini-shift" key={s}>
      <span className="d"><small>{SHIFTS[s].mon}</small><b>{SHIFTS[s].day}</b></span>
      <div><div className="t">{SHIFTS[s].title}</div><div className="s">{sub}</div></div>
    </div>
  );

  return (
    <div className="side-card grp-card">
      <div className="prof-top">
        <span className="grp-avs" aria-hidden="true">{c.who.slice(0, 3).map((w) => <Avatar key={w} id={w} />)}</span>
        <div className="prof-name">{convoName(c)}</div>
        <div className="prof-sub">Group · {c.who.length + 1} people</div>
        <button className="btn btn-purple-outline btn-sm" onClick={addPeople} aria-haspopup="menu" aria-expanded="false">Add people</button>
      </div>

      {c.about && (
        <div className="prof-sec">
          <h4>About</h4>
          <div className="prof-notes">{c.about}</div>
          
        </div>
      )}

      <div className="prof-sec">
        <h4>People <span className="grp-count">{c.who.length + 1}</span></h4>
        <ul className="grp-people">
          {c.who.map((w) => (
            <li key={w} className="grp-person">
              <Avatar id={w} />
              <span className="grp-person__txt"><b>{VOLS[w].name}</b><small>{VOLS[w].role}</small></span>
              {reachable(w) === 'email'
                ? <span className="grp-ch" data-tip={`${firstName(w)} hasn’t joined the app, so gets this conversation by email`}><Icon name="mail" size={14} /> Email</span>
                : null}
              <button className="icon-btn plain grp-dm" onClick={() => messagePerson(w)} data-tip={`Message ${firstName(w)} privately`} aria-label={`Message ${VOLS[w].name} privately`}><Icon name="nav-messages" size={16} /></button>
            </li>
          ))}
          <li className="grp-person">
            <Avatar id="me" />
            <span className="grp-person__txt"><b>{ME.name} (you)</b><small>Organizer{c.created ? ` · started ${c.created}` : ''}</small></span>
          </li>
        </ul>
      </div>

      <div className="tabs">
        <button className={tab === 'shifts' ? 'on' : ''} onClick={() => setTab('shifts')}>Shifts</button>
        <button className={tab === 'shared' ? 'on' : ''} onClick={() => setTab('shared')}>Shared</button>
        <span className="tab-line" style={{ transform: `translateX(${tab === 'shifts' ? 0 : 100}%)` }} />
      </div>
      <div className="mini-shifts">
        {tab === 'shifts'
          ? (shiftIds.length
            ? shiftIds.map((s) => { const g = going(s); return shiftCard(s, g.length === c.who.length ? (c.who.length === 2 ? 'Both going' : 'Everyone going') : `${g.map(firstName).join(', ')} going`); })
            : <p className="grp-empty">No one here is signed up for an upcoming shift.</p>)
          : (shared.length
            ? shared.map((x, i) => (x.kind === 'shift'
              ? shiftCard(x.id, SHIFTS[x.id].time)
              : <a key={i} className="mini-shift grp-link" href={x.url} target="_blank" rel="noopener"><Icon name="link" size={16} /><div><div className="t">{x.url.replace(/^https?:\/\//, '')}</div></div></a>))
            : <p className="grp-empty">Shifts and links shared in this conversation show up here.</p>)}
      </div>

      <div className="grp-actions">
        <button onClick={toggleMute}><Icon name={c.muted ? 'bell' : 'bell-off'} size={16} /> {c.muted ? 'Unmute notifications' : 'Mute notifications'}</button>
        <button onClick={archive}><Icon name="archive" size={16} /> Archive conversation</button>
      </div>
    </div>
  );
}

export const isGroup = (id) => (convo(id)?.who.length || 0) > 1;
