// Small shared pieces of the messaging screen: shift card, inline attachments, delivery status,
// reaction rows, thread replies, "New" divider.
import { GROUPS, ME, SHIFTS, VOLS } from '../../data.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import { hideTip } from '../../components/ui.jsx';
import { M, UI, bump, deliver, findMsg, firstName, rerender, annById } from './state.js';
import { AnnReactPicker, FixEmailForm, MsgReactPicker, RosterPop } from './pops.jsx';

// Toggle a popover from a hover-toolbar button, keeping the toolbar visible (and the button
// pressed) until the popover closes — vanilla added .keep / .on and removed them in onClose.
export function toggleKeep(e, content, opts, keepId, btnKey) {
  const anchor = e.currentTarget;
  const wasOpen = UI.pop.isOpen(anchor);
  const key = UI.pop.toggle(anchor, content, {
    ...opts,
    onClose: () => { if (M.keepBtn === btnKey) { M.keep = null; M.keepBtn = null; rerender(); } },
  });
  if (!wasOpen && key != null) { M.keep = keepId; M.keepBtn = btnKey; rerender(); }
}

// Shift card (vanilla eventCard)
export function EventCard({ id, compact = false }) {
  const s = SHIFTS[id];
  if (!s) return null;
  const roster = (e) => UI.pop.toggle(e.currentTarget, <RosterPop id={id} />, { align: 'end' });
  return (
    <div className={`event-card ${compact ? 'compact' : ''}`}>
      <div className="ec-date"><span className="ec-mon">{s.mon}</span><span className="ec-day">{s.day}</span></div>
      <div className="ec-body">
        <div className="ec-meta">{s.time}, {s.addr}</div>
        <div className="ec-title">{s.title}</div>
        {!compact && (
          <>
            <div className="ec-row"><Icon name="pin" size={15} /><span>{s.desc}</span></div>
            <div className="ec-row"><Icon name="pin" size={15} /><span>{s.roles}</span></div>
          </>
        )}
        <div className="ec-row"><Icon name="tags" size={15} /><span className="tags">{s.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</span></div>
        {!compact && (
          <div className="ec-actions">
            <span className={`fill-pill ${s.filled / s.cap < 0.6 ? 'low' : ''}`}>{s.filled} of {s.cap} filled</span>
            <button className="btn btn-outline btn-xs" onClick={roster} aria-haspopup="dialog" aria-expanded="false">View roster</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AttachInline({ a }) {
  if (a.type === 'shift') return <div style={{ marginTop: 8, width: '100%', minWidth: 420 }}><EventCard id={a.id} /></div>;
  if (a.type === 'link') return <a className="attach" style={{ marginTop: 8 }} href={a.url} target="_blank" rel="noopener"><Icon name="link" size={12} /> {a.url.replace(/^https?:\/\//, '')}</a>;
  if (a.type === 'loc') return <span className="attach" style={{ marginTop: 8 }}><Icon name="pin" size={12} /> {a.text}</span>;
  return null;
}

export function Status({ m }) {
  if (m.status === 'sending') return <span className="sending"><span className="spin dark" />Sending…</span>;
  if (m.status === 'failed') {
    const fix = (e) => UI.pop.toggle(e.currentTarget, <FixEmailForm id={m.id} />, { side: 'top', align: 'end' });
    return (
      <span className="failed">
        <Icon name="alert" size={13} /> Not delivered · {m.fail} · <button onClick={() => deliver(...findMsg(m.id))}>Retry</button>
        {m.fixEmail && <> · <button onClick={fix}>Update email</button></>}
      </span>
    );
  }
  const st = m.from === 'me' && (m.status === 'seen' ? 'Seen' : m.status === 'delivered' ? 'Delivered' : m.status === 'sent' && m.type === 'email' ? 'Sent' : '');
  return <>{m.time}{st && <span className="st"> · {st}</span>}</>;
}

// DM reactions store who reacted: { '👍': ['sarah', 'me'] }
export function MsgReacts({ m }) {
  const entries = Object.entries(m.reacts || {}).filter(([, w]) => w.length);
  const bumped = M.bump?.id === m.id ? M.bump.e : null;
  const nm = (w) => (w === 'me' ? 'You' : firstName(w));
  const toggle = (e) => {
    const w = m.reacts[e];
    m.reacts[e] = w.includes('me') ? w.filter((x) => x !== 'me') : [...w, 'me'];
    if (!m.reacts[e].length) delete m.reacts[e];
    hideTip();
    bump(m.id, m.reacts[e]?.includes('me') ? e : null);
    rerender();
  };
  const add = (ev) => toggleKeep(ev, <MsgReactPicker id={m.id} />, { side: 'top', align: 'center', cls: 'pill-pop' }, m.id, `add:${m.id}`);
  return (
    <div className="reacts">
      {entries.length > 0 && (
        <>
          {entries.map(([e, w]) => (
            <button key={bumped === e ? `${e}-${M.bump.seq}` : e} className={`react ${w.includes('me') ? 'mine' : ''} ${bumped === e ? 'is-new' : ''}`} onClick={() => toggle(e)} aria-pressed={w.includes('me')} data-tip={w.map(nm).join(', ')}>
              {e} <span className={`n ${bumped === e ? 'bump' : ''}`}>{w.length}</span>
            </button>
          ))}
          <button className={`react add ${M.keepBtn === `add:${m.id}` ? 'on' : ''}`} onClick={add} data-tip="Add reaction" aria-label="Add reaction"><Icon name="smile" size={14} /><Icon name="plus" size={10} /></button>
        </>
      )}
    </div>
  );
}

// Announcement reactions are counts + which ones are mine
export function AnnReacts({ a }) {
  const bumped = M.bump?.id === a.id ? M.bump.e : null;
  const toggle = (e) => {
    const x = annById(a.id) || a;
    const mine = x.mine.includes(e);
    x.reacts[e] += mine ? -1 : 1;
    x.mine = mine ? x.mine.filter((y) => y !== e) : [...x.mine, e];
    bump(x.id, e); rerender();
  };
  const g = GROUPS.find((x) => x.anns.includes(a));
  const reactors = (g?.members || []).slice(0, 2).map((w) => VOLS[w].name);
  const add = (ev) => toggleKeep(ev, <AnnReactPicker id={a.id} />, { side: 'top', align: 'end', cls: 'pill-pop' }, a.id, `aadd:${a.id}`);
  return (
    <div className="reacts">
      {Object.entries(a.reacts).filter(([, n]) => n > 0).map(([e, n]) => (
        <button key={bumped === e ? `${e}-${M.bump.seq}` : e} className={`react ${a.mine.includes(e) ? 'mine' : ''} ${bumped === e ? 'is-new' : ''}`} onClick={() => toggle(e)} aria-pressed={a.mine.includes(e)}>
          {e} <span className={`n ${bumped === e ? 'bump' : ''}`}>{n}</span>
        </button>
      ))}
      {a.more ? <span className="react more" data-tip={`${reactors.join(', ') || 'Volunteers'} and ${a.more} others reacted`}>+{a.more}</span> : null}
      <button className={`react add ${M.keepBtn === `aadd:${a.id}` ? 'on' : ''}`} onClick={add} data-tip="Add reaction" aria-label="Add reaction"><Icon name="smile" size={14} /><Icon name="plus" size={10} /></button>
    </div>
  );
}

export function Reply({ r }) {
  const name = r.who === 'me' ? ME.name : VOLS[r.who].name;
  return (
    <div className={`t-msg ${M.fresh.reply === r ? 'is-new-msg' : ''}`}>
      <Avatar id={r.who} />
      <div className="t-main"><div className="t-meta"><b>{name}</b><time>{r.when.replace(/^.* at /, '')}</time></div><div className="t-text">{r.text}</div></div>
    </div>
  );
}

export function NewDiv({ n }) {
  return <div className="new-div" role="separator" aria-label={`${n} new ${n === 1 ? 'message' : 'messages'}`}><span>New</span></div>;
}

// Thread side panel shell (shared by DM threads and announcement threads)
export function ThreadPanel({ title, root, replies, onReply, onClose }) {
  const submit = (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('#tReply');
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    onReply(v);
  };
  return (
    <div className="side-card thread">
      <header className="thread-head"><div><b>Thread</b><span>{title}</span></div>
        <button className="icon-btn plain" style={{ width: 28, height: 28 }} onClick={onClose} aria-label="Close thread"><Icon name="x" size={14} /></button></header>
      <div className="thread-scroll">
        {root}
        <div className="t-replies-label">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</div>
        <div id="tReplies">{replies.map((r, i) => <Reply key={i} r={r} />)}</div>
      </div>
      <form className="t-input" onSubmit={submit}>
        <input id="tReply" placeholder="Reply…" autoComplete="off" aria-label="Reply in thread" />
        <button className="send-circle ready" aria-label="Send reply"><Icon name="arrow-up" size={15} /></button>
      </form>
    </div>
  );
}
