// Direct / group conversation: header, message stream, composer, profile / people / thread side panel
import { useLayoutEffect, useState } from 'react';
import { ME, PAST_SHIFTS, SHIFTS, VOLS } from '../../data.js';
import { nowTime } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { profileRoute } from '../profiles/profileData.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import { hideTip } from '../../components/ui.jsx';
import { M, UI, addAttach, convoName, ensureIds, findMsg, newIndex, renderConv, rerender } from './state.js';
import { AttachInline, EventCard, MsgReacts, NewDiv, Status, ThreadPanel, toggleKeep } from './parts.jsx';
import { MsgReactPicker } from './pops.jsx';
import { Composer } from './Composer.jsx';

// After the pane (re)builds: scroll to the bottom, or to the "New" divider if there is one
export function useStreamInit() {
  useLayoutEffect(() => {
    const s = document.getElementById('stream');
    if (!s) return;
    s.scrollTop = s.scrollHeight;
    const d = s.querySelector('.new-div');
    if (d) s.scrollTop += d.getBoundingClientRect().top - s.getBoundingClientRect().top - 40;
  }, []);
}

function openMsgThread(id) {
  const [m] = findMsg(id);
  if (!m) return;
  M.msgThread = m.id;
  rerender();
  setTimeout(() => document.getElementById('tReply')?.focus(), 50);
}

function markUnreadFrom(id) {
  const [m, c] = findMsg(id);
  const n = c.msgs.slice(c.msgs.indexOf(m)).filter((x) => x.type !== 'divider' && x.from !== 'me').length;
  c.unread = n; M.newFrom = { id: c.id, n };
  hideTip(); renderConv();
  UI.toast(`Marked ${n} ${n === 1 ? 'message' : 'messages'} as unread`, { ic: 'dot' });
}

function MsgTools({ m }) {
  const react = (e) => toggleKeep(e, <MsgReactPicker id={m.id} />, { side: 'top', align: 'center', cls: 'pill-pop' }, m.id, `tool:${m.id}`);
  return (
    <div className="msg-tools" role="toolbar" aria-label="Message actions">
      <button className={`icon-btn plain ${M.keepBtn === `tool:${m.id}` ? 'on' : ''}`} onClick={react} data-tip="Add reaction" aria-label="Add reaction"><Icon name="smile" size={16} /></button>
      <button className="icon-btn plain" onClick={() => openMsgThread(m.id)} data-tip="Reply in thread" aria-label="Reply in thread"><Icon name="reply" size={16} /></button>
      {m.from !== 'me' && <button className="icon-btn plain" onClick={() => markUnreadFrom(m.id)} data-tip="Mark unread from here" aria-label="Mark unread from here"><Icon name="dot" size={16} /></button>}
    </div>
  );
}

function MsgExtras({ m }) {
  const reps = m.replies || [];
  const faces = [...new Set(reps.map((r) => r.who))].slice(0, 3);
  const last = reps[reps.length - 1];
  return (
    <>
      <MsgReacts m={m} />
      {reps.length > 0 && (
        <button className="thread-link" onClick={() => openMsgThread(m.id)}>
          <span className="faces">{faces.map((w) => <Avatar key={w} id={w} />)}</span>
          <b>{reps.length} {reps.length === 1 ? 'reply' : 'replies'}</b><span className="last">Last reply {last.when}</span>
          <span className="view">View thread <Icon name="chev-r" size={12} /></span>
        </button>
      )}
    </>
  );
}

function MsgRow({ m, c, prev }) {
  if (m.type === 'divider') return <div className="day-div">{m.text}</div>;
  const me = m.from === 'me';
  // Same sender back-to-back: drop the repeated avatar/name and tighten the gap (chat-app convention)
  const cont = prev && prev.type !== 'divider' && prev.from === m.from && prev.type !== 'shift' && m.type !== 'shift' ? 'cont' : '';
  const sender = me ? null : m.from === 'them' ? c.who[0] : m.from;
  const fresh = M.fresh.msg === m ? 'is-new-msg' : '';
  const keep = M.keep === m.id ? 'keep' : '';
  const atts = (m.attach || []).map((a, i) => <AttachInline key={i} a={a} />);
  if (m.type === 'shift') {
    return <div className={`msg-col ${fresh}`} data-msg={m.id} style={{ alignItems: 'flex-end' }}><EventCard id={m.shift} /><div className="msg-time"><Status m={m} /></div></div>;
  }
  // Email is a route, not a different kind of message: same bubble, a subject line, and a label
  // saying how it travelled. Replies by email land back in this thread.
  const email = m.type === 'email';
  const repliedBefore = !me && c.msgs.slice(0, c.msgs.indexOf(m)).some((x) => x.from === 'me');
  const via = email && (me
    ? <span className="via" data-tip={c.who.length > 1 ? `Each of the ${c.who.length} people got their own copy` : `Sent to ${VOLS[c.who[0]].email}`}><Icon name="mail" size={11} /> Sent by email</span>
    : <span className="via" data-tip={`From ${VOLS[sender].email}`}><Icon name="mail" size={11} /> {repliedBefore ? 'Replied by email' : 'Emailed you'}</span>);
  return (
    <div className={`msg ${me ? 'me' : ''} ${cont} ${fresh} ${keep}`} data-msg={m.id}>
      {!me && <Avatar id={sender} />}
      <div className="msg-col"><MsgTools m={m} />
        {!me && !cont && c.who.length > 1 && <div className="msg-name">{VOLS[sender].name}</div>}
        {m.reAnn && <div className="msg-re"><Icon name="megaphone" size={12} /> Private reply to your announcement · {m.reAnn}</div>}
        {email
          ? <div className="bubble email">{m.subject && <span className="subj">{m.subject}</span>}{m.text}</div>
          : m.text ? <div className="bubble">{m.text}</div> : null}{atts}
        <div className="msg-time">{via}<Status m={m} /></div><MsgExtras m={m} />
      </div>
    </div>
  );
}

function MsgThread({ c, m }) {
  const who = m.from === 'me' ? 'me' : m.from === 'them' ? c.who[0] : m.from;
  const push = (r) => {
    (m.replies ||= []).push(r);
    M.fresh.reply = r;
    if (M.msgThread === m.id) M.threadScroll = true;
    rerender();
  };
  const reply = (v) => {
    push({ who: 'me', when: nowTime(), text: v });
    // Someone else in the conversation answers in the thread
    const other = m.from === 'me' ? c.who[0] : m.from === 'them' ? c.who[0] : m.from;
    setTimeout(() => push({ who: other, when: nowTime(), text: ['Sounds good, thanks!', 'Will do 👍', 'Got it — thank you!'][m.replies.length % 3] }), 2200);
  };
  const close = () => { M.msgThread = null; rerender(); };
  return (
    <ThreadPanel
      title={convoName(c)} replies={m.replies || []} onReply={reply} onClose={close}
      root={(
        <div className="t-msg"><Avatar id={who} />
          <div className="t-main"><div className="t-meta"><b>{who === 'me' ? ME.name : VOLS[who].name}</b><time>{m.time}</time></div>
            {m.type === 'email' && <div className="t-title">{m.subject}</div>}<div className="t-text">{m.text}</div>
            <MsgReacts m={m} />
          </div>
        </div>
      )}
    />
  );
}

function Profile({ id }) {
  const v = VOLS[id];
  const shareShift = (s) => { addAttach({ type: 'shift', id: s }); M.focus = 'body'; rerender(); };
  const setTab = (t) => { M.sideTab = t; rerender(); };
  return (
    <div className="side-card">
      <div className="prof-top"><Avatar id={id} className="xl" /><div className="prof-name">{v.name}</div><div className="prof-sub">{v.kind} | {v.loc}</div>
        <button className="btn btn-purple-outline btn-sm" style={{ width: '100%', marginTop: 6 }} onClick={() => navigate(profileRoute(id))}>View profile</button></div>
      <div className="prof-sec"><h4>Contact</h4>
        <div className="prof-line"><Icon name="mail" size={14} /> {v.email}</div>
        <div className="prof-line"><Icon name="phone" size={14} /> {v.phone}</div>
        <div className="prof-line"><Icon name="tags" size={14} /> {v.tags.map((t) => <span className="tag blue" key={t}>{t}</span>)}</div></div>
      <div className="prof-sec"><h4>Notes</h4><div style={{ fontSize: 13 }}>{v.notes}</div></div>
      <div className="tabs">
        <button className={M.sideTab === 'upcoming' ? 'on' : ''} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button className={M.sideTab === 'attended' ? 'on' : ''} onClick={() => setTab('attended')}>Attended</button>
        <span className="tab-line" style={{ transform: `translateX(${M.sideTab === 'upcoming' ? 0 : 100}%)` }} />
      </div>
      <div className="mini-shifts">
        {M.sideTab === 'upcoming'
          ? (v.upcoming.length ? v.upcoming.map((s) => (
            <button className="mini-shift" key={s} onClick={() => shareShift(s)} data-tip="Share this shift in chat">
              <span className="d"><small>{SHIFTS[s].mon}</small><b>{SHIFTS[s].day}</b></span><div><div className="t">{SHIFTS[s].title}</div><div className="s">{SHIFTS[s].time}</div></div>
            </button>
          )) : <div className="muted" style={{ padding: 8, fontSize: 13 }}>No upcoming shifts</div>)
          : PAST_SHIFTS.map((s, i) => (
            <div className="mini-shift" key={i}><span className="d"><small>{s.mon}</small><b>{s.day}</b></span><div><div className="t">{s.title}</div><div className="s">{s.time}</div></div></div>
          ))}
      </div>
    </div>
  );
}

function Members({ ids }) {
  return (
    <div className="side-card" style={{ padding: 16 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>{ids.length} people</h4>
      {ids.map((w) => (
        <div key={w} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}><Avatar id={w} />
          <div><div style={{ fontSize: 14 }}>{VOLS[w].name}</div><div className="muted" style={{ fontSize: 12 }}>{VOLS[w].role}</div></div></div>
      ))}
    </div>
  );
}

export function ConvoView({ c }) {
  const [overlayOpen, setOverlayOpen] = useState(false); // ≤1280px drawer
  useStreamInit();
  if (!c) return <div className="stream-empty" style={{ margin: 'auto' }}>Select a conversation</div>;
  ensureIds(c);
  const solo = c.who.length === 1;
  const v = VOLS[c.who[0]];
  const ni = newIndex(c);
  const thread = M.msgThread && c.msgs.find((x) => x.id === M.msgThread);
  if (thread && overlayOpen) setOverlayOpen(false); // opening a thread replaces the drawer
  const what = solo ? 'profile' : 'people';
  const tip = `${M.sideClosed ? 'Show' : 'Hide'} ${what}`;
  // Wide screens: the profile column collapses in place and the conversation widens to fill it.
  // Narrow screens (≤1280): the profile is an overlay drawer instead.
  const toggleProfile = () => {
    if (matchMedia('(max-width: 1280px)').matches) setOverlayOpen((o) => !o);
    else { M.sideClosed = !M.sideClosed; rerender(); }
    hideTip();
  };
  const jumpBottom = () => { M.newPill = false; M.scroll = 'smooth'; rerender(); };
  return (
    <>
      <header className="conv-head">
        {solo ? <Avatar id={c.who[0]} className="lg" /> : <span className="av-stack lg">{c.who.slice(0, 2).map((w) => <Avatar key={w} id={w} />)}</span>}
        <div><div className="h3">{convoName(c)}</div><div className="sub">{solo ? v.role : `${c.who.map((w) => VOLS[w].name).join(', ')} · Group message`}</div></div>
        <button className={`icon-btn prof-toggle ${overlayOpen && !thread ? 'on' : ''}`} onClick={toggleProfile} data-tip={tip} aria-label={tip} aria-expanded={!M.sideClosed}>
          <Icon name={M.sideClosed ? 'panel-open' : 'panel-close'} size={18} />
        </button>
      </header>
      <div className="conv-body">
        <div className="stream-col">
          <div className="stream" id="stream">
            {c.msgs.map((m, i) => (i === ni
              ? [<NewDiv key="new-div" n={M.newFrom.n} />, <MsgRow key={m.id} m={m} c={c} prev={null} />]
              : <MsgRow key={m.id} m={m} c={c} prev={c.msgs[i - 1]} />))}
          </div>
          <div className="composer-wrap"><Composer /></div>
          {M.newPill && <button className="new-pill" id="newPill" onClick={jumpBottom}>New message <Icon name="arrow-down" size={13} /></button>}
        </div>
        {thread
          ? <aside className="side force side-in" id="side" key={`t-${thread.id}`}><MsgThread c={c} m={thread} /></aside>
          : <aside className={`side${M.sideClosed ? ' closed' : ''}${overlayOpen ? ' open' : ''}`} id="side" key="prof">{solo ? <Profile id={c.who[0]} /> : <Members ids={c.who} />}</aside>}
      </div>
    </>
  );
}
