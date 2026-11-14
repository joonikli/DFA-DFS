// Popover contents for the messaging screen. Each reads live state (useStore) so it updates
// in place while open, like the vanilla code re-writing the popover's innerHTML.
import { useEffect, useLayoutEffect, useRef } from 'react';
import { SHIFTS, VOLS } from '../../data.js';
import { useStore } from '../../lib/store.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import {
  EMAIL_RULES, M, REPLY_MODES, UI, CH_LABEL, addAttach, addRcpt, annById, bump, closePops, deliver, draft, findMsg, group, rcptOptions,
  registerRcptContent, renderConv, rerender, seenSplit, startShiftCompose,
} from './state.js';

// ----- To: recipient dropdown -----
export function RcptList() {
  useStore();
  const ref = useRef(null);
  const secs = rcptOptions();
  const flat = secs.flatMap(([, it]) => it);
  M.rcptKb = Math.min(M.rcptKb, Math.max(flat.length - 1, 0));
  useLayoutEffect(() => {
    if (!M.kbScroll) return;
    M.kbScroll = false;
    ref.current?.querySelector('.ritem.kb')?.scrollIntoView({ block: 'nearest' });
  });
  const showEm = M.channel === 'email';
  let k = 0;
  return (
    <div ref={ref} className={`rlist ${M.channel === 'email' || M.tab === 'announcement' ? 'wide' : ''}`} role="listbox">
      {!flat.length ? <div className="menu-label" style={{ padding: '12px 16px' }}>No matches</div> : secs.map(([t, items]) => [
        <div className="menu-label" key={`l-${t}`}>{t}</div>,
        ...items.map((o) => (
          <button key={`${o.kind}-${o.id}`} className={`ritem ${k++ === M.rcptKb ? 'kb' : ''}`} onClick={() => addRcpt(o.kind, o.id)}>
            {o.kind === 'group' ? <span className="av sm"><Icon name="users" size={12} /></span> : <Avatar id={o.id} className="sm" />} {o.label}
            {(showEm || o.kind === 'group') && <span className="em">{o.sub}</span>}
          </button>
        )),
      ])}
    </div>
  );
}
registerRcptContent(RcptList);

// ----- "Sent via" filter (Any / App / Email). "Channel" stays reserved for announcement groups. -----
export function ChannelFilterMenu() {
  useStore();
  const pick = (v) => { M.channelFilter = v; closePops(); rerender(); };
  return (
    <div className="menu" role="menu" style={{ width: 170 }}>
      <div className="menu-label">Sent via</div>
      {Object.entries(CH_LABEL).map(([v, l]) => (
        <button key={v} className={`menu-item ${M.channelFilter === v ? 'on' : ''}`} onClick={() => pick(v)}>
          <Icon name={v === 'email' ? 'mail' : v === 'inapp' ? 'nav-messages' : 'layout'} size={14} /> {l}
        </button>
      ))}
    </div>
  );
}

// ----- shift roster (from a shift card's "View roster") -----
export function RosterPop({ id }) {
  const s = SHIFTS[id];
  return (
    <div className="roster">
      <div className="menu-label">{s.title} · {s.mon} {s.day}</div>
      {s.vols.map((w) => (
        <div className="roster-row" key={w}><Avatar id={w} className="sm" /> <span>{VOLS[w].name}</span><span className="muted">{VOLS[w].role}</span></div>
      ))}
      <div className="roster-foot">
        <span className={s.filled / s.cap < 0.6 ? 'low' : ''}>{s.cap - s.filled} open spots</span>
        <button className="btn btn-dark btn-xs" onClick={() => startShiftCompose(id)}>Message all</button>
      </div>
    </div>
  );
}

// ----- announcement "Seen by N of M": split by channel, only claiming what we can measure -----
export function SeenPop({ id }) {
  useStore();
  const g = group(M.activeGroup);
  const a = g?.anns.find((x) => x.id === id);
  if (!a) return null;
  const sp = seenSplit(a, g);
  const left = sp.appUnseen + sp.notOpened;
  const rows = [
    ['Seen in app', sp.appSeen, 'app'],
    ['In app, not seen yet', sp.appUnseen, 'app-soft'],
    ...(sp.rule === 'off'
      ? [['Email only · not emailed', sp.notSent, 'warn']]
      : [['Emailed · opened', sp.opened, 'good'], ['Emailed · not opened', sp.notOpened, 'warn']]),
    ['Couldn’t reach', sp.none, 'bad'],
  ];
  const nudge = () => {
    a.nudged = true; closePops();
    rerender();
    UI.toast(`Reminder sent to the ${left} people who haven’t seen it: in the app, or by email if that’s how they got it`, { ic: 'check' });
  };
  return (
    <div className="roster seen-split">
      <div className="menu-label">{sp.appSeen} seen in app{sp.opened ? ` · ${sp.opened} opened email` : ''} · {sp.of} people</div>
      {rows.map(([label, n, tone]) => (
        <div className="ss-row" key={label}>
          <span>{label}</span>
          <span className="ss-track"><span className={tone} style={{ width: `${sp.of ? (n / sp.of) * 100 : 0}%` }} /></span>
          <span className="ss-n">{n}</span>
        </div>
      ))}
      {sp.rule !== 'off' && <div className="ss-note">Email opens are an estimate: many mail apps block the signal.</div>}
      <div className="roster-foot">
        <span>{sp.rule === 'unseen' ? 'Emails anyone in the app who hasn’t seen it after 24h' : sp.rule === 'now' ? 'Emailed to everyone' : 'Not emailed'}</span>
        {left > 0 && <button className="btn btn-dark btn-xs" onClick={nudge} disabled={!!a.nudged}>{a.nudged ? 'Nudged' : `Nudge ${left}`}</button>}
      </div>
    </div>
  );
}

// ----- announcement composer: email rule + reply mode -----
function OptionMenu({ options, value, onPick, label }) {
  useStore();
  return (
    <div className="menu opt-menu" role="menu" aria-label={label}>
      <div className="menu-label">{label}</div>
      {Object.entries(options).map(([v, [title, help]]) => (
        <button key={v} role="menuitemradio" aria-checked={value === v} className={`menu-item ${value === v ? 'on' : ''}`} onClick={() => onPick(v)}>
          <span className="opt-check">{value === v && <Icon name="check" size={14} />}</span>
          <span><b>{title}</b><small>{help}</small></span>
        </button>
      ))}
    </div>
  );
}
export function EmailRuleMenu() {
  const pick = (v) => { draft().emailRule = v; closePops(); rerender(); };
  return <OptionMenu label="Email" options={EMAIL_RULES} value={draft().emailRule || 'unseen'} onPick={pick} />;
}
export function RepliesMenu() {
  const pick = (v) => { draft().replies = v; closePops(); rerender(); };
  return <OptionMenu label="Replies" options={REPLY_MODES} value={draft().replies || 'thread'} onPick={pick} />;
}

// ----- bounced email: fix the address and resend -----
export function FixEmailForm({ id }) {
  const [m, c] = findMsg(id);
  const v = VOLS[m.fixEmail];
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => { const i = ref.current; if (!i) return; i.focus(); i.setSelectionRange(i.value.indexOf('@') + 1, i.value.length); }, 30);
    return () => clearTimeout(t);
  }, []);
  const submit = (e) => {
    e.preventDefault();
    const val = ref.current.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(val)) { ref.current.focus(); return; }
    v.email = val; v.emailBad = false;
    closePops(true);
    UI.toast(`Updated ${v.name}’s email`, { ic: 'check' });
    deliver(m, c);
  };
  return (
    <form className="link-pop" onSubmit={submit}>
      <label className="menu-label" style={{ padding: 0 }} htmlFor="fixIn">Email for {v.name}</label>
      <input ref={ref} id="fixIn" type="text" inputMode="email" spellCheck="false" defaultValue={v.email} autoComplete="off" />
      <button className="btn btn-dark btn-sm">Save and resend</button>
    </form>
  );
}

// ----- composer: attach a shift -----
export function ShiftPicker() {
  const pick = (id) => { addAttach({ type: 'shift', id }); closePops(); M.focus = 'body'; rerender(); };
  return (
    <div className="shift-pick">
      <div className="menu-label">Attach an upcoming shift</div>
      {Object.entries(SHIFTS).map(([id, s]) => (
        <button key={id} className="shift-opt" onClick={() => pick(id)}>
          <span className="d"><small>{s.mon}</small><b>{s.day}</b></span>
          <span><div className="t">{s.title}</div><div className="s">{s.time} · {s.filled}/{s.cap} filled</div></span>
        </button>
      ))}
    </div>
  );
}

// ----- composer: add a link -----
export function LinkForm() {
  const ref = useRef(null);
  useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 30); return () => clearTimeout(t); }, []);
  const submit = (e) => {
    e.preventDefault();
    let url = ref.current.value.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) url = `https://${url}`;
    addAttach({ type: 'link', url }); closePops(); M.focus = 'body'; rerender();
  };
  return (
    <form className="link-pop" onSubmit={submit}>
      <label className="menu-label" style={{ padding: 0 }} htmlFor="linkIn">Add a link</label>
      <input ref={ref} id="linkIn" placeholder="https://" autoComplete="off" />
      <button className="btn btn-dark btn-sm">Add link</button>
    </form>
  );
}

// ----- quick-react pickers -----
const ANN_EMOJI = ['💞', '😄', '😎', '😢', '👍', '🎉', '🙏'];
const MSG_EMOJI = ['👍', '💞', '😄', '🙌', '🙏', '🎉', '😢'];

export function AnnReactPicker({ id }) {
  const pick = (e) => {
    const a = annById(id);
    if (!a.mine.includes(e)) { a.reacts[e] = (a.reacts[e] || 0) + 1; a.mine.push(e); }
    closePops();
    bump(a.id, e); rerender();
  };
  return <div className="quick-react">{ANN_EMOJI.map((e) => <button key={e} onClick={() => pick(e)} aria-label={`React ${e}`}>{e}</button>)}</div>;
}

export function MsgReactPicker({ id }) {
  const pick = (e) => {
    const [m] = findMsg(id);
    const w = ((m.reacts ||= {})[e] ||= []);
    if (!w.includes('me')) w.push('me');
    closePops();
    bump(m.id, e); rerender();
  };
  return <div className="quick-react">{MSG_EMOJI.map((e) => <button key={e} onClick={() => pick(e)} aria-label={`React ${e}`}>{e}</button>)}</div>;
}

// ----- announcement ⋯ menu -----
export function AnnMoreMenu({ id }) {
  const pinned = M.pinned[M.activeGroup] === id;
  const pin = () => {
    const g = M.activeGroup;
    M.pinned[g] = M.pinned[g] === id ? null : id;
    closePops(true); renderConv();
    UI.toast(M.pinned[g] ? 'Pinned to the top of this group' : 'Unpinned', { ic: 'pinned' });
  };
  const copy = () => {
    const a = annById(id);
    navigator.clipboard?.writeText(`${a.title}\n\n${a.body}`).catch(() => {});
    closePops(); UI.toast('Copied to clipboard', { ic: 'copy' });
  };
  const remove = () => {
    const g = group(M.activeGroup);
    const i = g.anns.findIndex((a) => a.id === id);
    const [rm] = g.anns.splice(i, 1);
    closePops(true);
    if (M.thread === rm.id) M.thread = null;
    // The removed post stays in place for its exit animation, then the stream rebuilds
    M.leavingAnn = { gid: g.id, ann: rm, i };
    rerender();
    setTimeout(() => { if (M.leavingAnn?.ann === rm) M.leavingAnn = null; renderConv(); }, 150);
    UI.toast('Announcement removed', { ic: 'trash', action: 'Undo', onAction: () => { if (M.leavingAnn?.ann === rm) M.leavingAnn = null; g.anns.splice(i, 0, rm); M.fresh.ann = rm.id; renderConv(); } });
  };
  return (
    <div className="menu" style={{ width: 160 }}>
      <button className="menu-item" onClick={pin}><Icon name="pinned" size={14} /> {pinned ? 'Unpin' : 'Pin'}</button>
      <button className="menu-item" onClick={copy}><Icon name="copy" size={14} /> Copy text</button>
      <button className="menu-item danger" onClick={remove}><Icon name="trash" size={14} /> Remove</button>
    </div>
  );
}

