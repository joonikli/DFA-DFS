// Announcements: channel-post layout, pinned banner, seen-by, ⋯ menu, thread panel
import { useState } from 'react';
import { ME } from '../../data.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import { M, UI, annRule, groupReach, renderConv, rerender, seenSplit, splitDate } from './state.js';
import { AnnReacts, AttachInline, NewDiv, ThreadPanel, toggleKeep } from './parts.jsx';
import { AnnMoreMenu, AnnReactPicker, SeenPop } from './pops.jsx';
import { Composer } from './Composer.jsx';
import { useStreamInit } from './ConvoView.jsx';

function openThread(id) {
  M.thread = id;
  rerender();
  setTimeout(() => document.getElementById('tReply')?.focus(), 50);
}

function Post({ a, g }) {
  const { time } = splitDate(a.date);
  const faces = [...new Set(a.replies.map((r) => r.who))].slice(0, 3);
  const last = a.replies[a.replies.length - 1];
  const pinned = M.pinned[g.id] === a.id;
  const sp = seenSplit(a, g);
  const rule = annRule(a);
  const emailOnly = (a.reach || groupReach(g)).email;
  const leaving = M.leavingAnn?.ann === a;
  const keep = M.keep === a.id ? 'keep' : '';
  const on = (k) => (M.keepBtn === `${k}:${a.id}` ? 'on' : '');
  return (
    <article className={`post ${pinned ? 'pinned' : ''} ${M.fresh.ann === a.id ? 'is-new-msg' : ''} ${leaving ? 'leaving' : ''}`} data-ann={a.id}>
      <Avatar id="me" className="post-av" />
      <div className="post-main">
        <header className="post-head"><b>{ME.name}</b><time>{time}</time>
          {pinned && <span className="post-chip pin"><Icon name="pinned" size={12} /> Pinned</span>}
          {rule === 'now' && <span className="post-chip" data-tip={`Emailed to all ${g.count}, as well as posted in the app`}><Icon name="mail" size={12} /> Emailed to everyone</span>}
          {rule === 'unseen' && <span className="post-chip" data-tip={`${emailOnly} people without the app got it by email. Anyone else who hasn’t seen it after 24 hours gets an email too.`}><Icon name="mail" size={12} /> Email if unseen · 24h</span>}
          {rule === 'off' && emailOnly > 0 && <span className="post-chip" data-tip={`Not emailed, so ${emailOnly} people without the app didn’t get it`}><Icon name="nav-messages" size={12} /> App only</span>}
          {a.replyMode === 'private' && <span className="post-chip" data-tip="Replies come to you as direct messages in Message"><Icon name="lock" size={12} /> Private replies</span>}
        </header>
        <div className="post-card">
          <h3 className="ann-title">{a.title}</h3><div className="ann-body">{a.body}</div>
          {(a.attach || []).map((x, i) => <AttachInline key={i} a={x} />)}
        </div>
        <AnnReacts a={a} />
        <div className="post-foot">
          {a.replies.length > 0 && (
            <button className="thread-link" onClick={() => openThread(a.id)}>
              <span className="faces">{faces.map((w) => <Avatar key={w} id={w} />)}</span>
              <b>{a.replies.length} {a.replies.length === 1 ? 'reply' : 'replies'}</b><span className="last">Last reply {last.when.replace(' at ', ', ')}</span>
              <span className="view">View thread <Icon name="chev-r" size={12} /></span>
            </button>
          )}
          <button className="seen-btn" onClick={(e) => UI.pop.toggle(e.currentTarget, <SeenPop id={a.id} />, { align: 'end' })} aria-haspopup="dialog" aria-expanded="false">
            <Icon name="eye" size={13} /> Seen by {sp.total} of {g.count}{a.nudged ? ' · nudged' : ''}
          </button>
        </div>
      </div>
      <div className={`post-tools ${keep}`} role="toolbar" aria-label="Announcement actions">
        <button className={`icon-btn plain ${on('areact')}`} onClick={(e) => toggleKeep(e, <AnnReactPicker id={a.id} />, { side: 'top', align: 'end', cls: 'pill-pop' }, a.id, `areact:${a.id}`)} data-tip="Add reaction" aria-label="Add reaction"><Icon name="smile" size={16} /></button>
        <button className="icon-btn plain" onClick={() => openThread(a.id)} data-tip="Reply in thread" aria-label="Reply in thread"><Icon name="reply" size={16} /></button>
        <button className={`icon-btn plain ${on('amore')}`} onClick={(e) => toggleKeep(e, <AnnMoreMenu id={a.id} />, { side: 'bottom', align: 'end' }, a.id, `amore:${a.id}`)} data-tip="More" aria-label="More"><Icon name="more" size={16} /></button>
      </div>
    </article>
  );
}

function AnnThread({ g, a, onClose }) {
  const reply = (v) => {
    const r = { who: 'me', when: 'Just now', text: v };
    a.replies.push(r);
    M.fresh.reply = r;
    M.threadScroll = true;
    rerender();
  };
  return (
    <ThreadPanel
      title={g.name} replies={a.replies} onReply={reply} onClose={onClose}
      root={(
        <div className="t-msg"><Avatar id="me" />
          <div className="t-main"><div className="t-meta"><b>{ME.name}</b><time>{splitDate(a.date).time}</time></div>
            <div className="t-title">{a.title}</div><div className="t-text">{a.body}</div>
            <AnnReacts a={a} />
          </div>
        </div>
      )}
    />
  );
}

const EXIT_STYLE = { transition: 'opacity var(--dur-exit) var(--ease-out), transform var(--dur-exit) var(--ease-out)', opacity: 0, transform: 'translateX(12px)' };

export function GroupView({ g }) {
  const [closing, setClosing] = useState(null); // thread id fading out
  useStreamInit();
  if (!g) return <div className="stream-empty" style={{ margin: 'auto' }}>Select a group</div>;
  const pinnedAnn = M.pinned[g.id] && g.anns.find((a) => a.id === M.pinned[g.id]);
  const list = g.anns.slice();
  if (M.leavingAnn?.gid === g.id) list.splice(M.leavingAnn.i, 0, M.leavingAnn.ann);
  const ni = M.newFrom?.id === g.id ? list.length - M.newFrom.n : -1;
  const threadId = M.thread || closing;
  const threadAnn = threadId && list.find((x) => x.id === threadId);
  const closeThread = () => {
    const id = M.thread;
    M.thread = null;
    setClosing(id);
    rerender();
    setTimeout(() => setClosing((c) => (c === id ? null : c)), 150);
  };
  return (
    <>
      <header className="conv-head">
        <span className="av-stack lg">{g.members.slice(0, 2).map((w) => <Avatar key={w} id={w} />)}</span>
        <div><div className="h3">{g.name}</div><div className="sub">{g.count} members</div></div>
      </header>
      {pinnedAnn && (
        <div className="pin-banner"><Icon name="pinned" size={14} /><span>Pinned · <b>{pinnedAnn.title}</b></span><span style={{ flex: 1 }} />
          <button className="link" style={{ fontSize: 12 }} onClick={() => { M.pinned[M.activeGroup] = null; renderConv(); }}>Unpin</button></div>
      )}
      <div className="conv-body">
        <div className="stream-col">
          <div className="stream posts" id="stream">
            {list.length ? list.map((a, i) => [
              i === ni ? <NewDiv key="new-div" n={M.newFrom.n} /> : null,
              (i === 0 || splitDate(list[i - 1].date).day !== splitDate(a.date).day) ? <div className="day-div" key={`d-${a.id}`}>{splitDate(a.date).day}</div> : null,
              <Post key={a.id} a={a} g={g} />,
            ]) : <div className="stream-empty">No announcements yet. Write the first one below.</div>}
          </div>
          <div className="composer-wrap"><Composer /></div>
        </div>
        {threadAnn && (
          <aside className="side force side-in" id="side" style={M.thread ? undefined : EXIT_STYLE}>
            <AnnThread g={g} a={threadAnn} onClose={closeThread} />
          </aside>
        )}
      </div>
    </>
  );
}
