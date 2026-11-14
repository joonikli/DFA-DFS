// Messages screen (manager): Message + Announcements tabs, conversation list, conversation pane.
// Port of the vanilla `Msg` feature — UI state lives in ./state.js (vanilla `M`).
import { useEffect, useLayoutEffect } from 'react';
import { CONVOS, GROUPS } from '../../data.js';
import { useStore } from '../../lib/store.js';
import { takeIntent } from '../../lib/bridge.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import { Segmented, usePop, useToast } from '../../components/ui.jsx';
import {
  M, UI, convo, convoName, draft, firstName, group, hasDraft, lastPreview, syncChannel,
  markCurrentRead, rerender, scrollBehavior, startShiftCompose, unreadIn,
} from './state.js';
import { compose, openConvo, openGroup, setTab } from './actions.js';
import { ConvoView } from './ConvoView.jsx';
import { GroupView } from './GroupView.jsx';
import { ComposeView } from './ComposeView.jsx';

function applyIntent(i) {
  if (!i) return false;
  if (i.type === 'open' && convo(i.id)) {
    Object.assign(M, { tab: 'message', composing: false, active: i.id, thread: null, msgThread: null });
    syncChannel();
    M.convSeq += 1;
    return true;
  }
  if (i.type === 'shift') { startShiftCompose(i.id); return true; }
  return false;
}

function TabLabel({ tab }) {
  const n = unreadIn(tab);
  return <>{tab === 'message' ? 'Message' : 'Announcements'}{n ? <span className="tab-badge" aria-label={`${n} unread`}>{n}</span> : null}</>;
}

function ListItems() {
  const q = M.q.toLowerCase();
  let items;
  if (M.tab === 'message') {
    const chOk = (c) => M.filter !== 'email' || c.channel === 'email';
    items = CONVOS.filter((c) => (M.filter !== 'unread' || c.unread || (!M.composing && c.id === M.active)) && (M.filter !== 'direct' || c.who.length === 1) && chOk(c))
      .filter((c) => !q || convoName(c).toLowerCase().includes(q) || lastPreview(c).toLowerCase().includes(q))
      .map((c) => {
        const d = M.drafts[c.id];
        const showDraft = c.id !== M.active && (d?.body || '').trim();
        const lastIsEmail = c.channel === 'email';
        return (
          <li key={c.id}><button className={`convo ${!M.composing && c.id === M.active ? 'on' : ''} ${c.unread ? 'unread' : ''} ${M.fresh.convo === c.id ? 'is-new' : ''}`} onClick={() => openConvo(c.id)}>
            {c.who.length > 1 ? <span className="av-stack">{c.who.slice(0, 2).map((w) => <Avatar key={w} id={w} />)}</span> : <Avatar id={c.who[0]} className="list" />}
            <span className="convo-main"><span className="convo-top"><span className="convo-name">{convoName(c)}</span><span className="convo-time">{c.time}</span></span>
              <span className="convo-bot"><span className="convo-prev">{showDraft
                ? <><span className="draft-tag">Draft:</span> {d.body}</>
                : <>{lastIsEmail && <><span data-tip="Latest message went by email" style={{ display: 'inline-flex' }}><Icon name="mail" size={12} /></span> </>}{lastPreview(c)}</>}</span>
              {c.unread ? <span className="badge">{c.unread}</span> : null}</span></span>
          </button></li>
        );
      });
  } else {
    if (M.filter === 'direct') return <li className="empty-list">Announcements always go to a group.<br />Switch to <b>Message</b> for direct conversations.</li>;
    items = GROUPS.filter((g) => (M.filter !== 'unread' || g.unread || (!M.composing && g.id === M.activeGroup)))
      .filter((g) => !q || g.name.toLowerCase().includes(q))
      .map((g) => {
        const last = g.anns[g.anns.length - 1];
        return (
          <li key={g.id}><button className={`convo ${!M.composing && g.id === M.activeGroup ? 'on' : ''} ${g.unread ? 'unread' : ''} ${M.fresh.convo === g.id ? 'is-new' : ''}`} onClick={() => openGroup(g.id)}>
            <span className="av-stack">{g.members.slice(0, 2).map((w) => <Avatar key={w} id={w} />)}</span>
            <span className="convo-main"><span className="convo-top"><span className="convo-name">{g.name}</span><span className="convo-time">{g.time}</span></span>
              <span className="convo-bot"><span className="convo-prev">{last ? last.title : 'No announcements yet'}</span>{g.unread ? <span className="badge">{g.unread}</span> : null}</span></span>
          </button></li>
        );
      });
  }
  const nd = M.drafts[`new-${M.tab}`];
  if (M.composing || hasDraft(nd)) {
    const to = (nd?.rcpts || []).map((r) => (r.kind === 'group' ? group(r.id).name : firstName(r.id))).join(', ');
    items.unshift(
      <li key="draft-row"><button className={`convo draft-row ${M.composing ? 'on' : ''}`} onClick={compose}><span className="av list draft-av"><Icon name="pen" size={18} /></span>
        <span className="convo-main"><span className="convo-top"><span className="convo-name">{M.tab === 'announcement' ? 'New announcement' : 'New message'}</span><span className="convo-time">Draft</span></span>
          <span className="convo-bot"><span className="convo-prev">{to ? `To: ${to}` : 'No recipients yet'}{(nd?.body || '').trim() ? ` — ${nd.body}` : ''}</span></span></span></button></li>,
    );
  }
  return items.length ? items : <li className="empty-list">Nothing here{M.q ? ` for “${M.q}”` : ''}.</li>;
}

function ConvInner() {
  if (M.composing) return <ComposeView />;
  if (M.tab === 'message') return <ConvoView c={convo(M.active)} />;
  return <GroupView g={group(M.activeGroup)} />;
}

export default function Messages() {
  useStore();
  syncChannel();
  UI.pop = usePop();
  UI.toast = useToast();

  // Mount (vanilla render()/view()): take a pending cross-feature intent, then mark the open conversation read
  useLayoutEffect(() => {
    applyIntent(takeIntent());
    markCurrentRead();
    rerender();
    const onHash = () => {
      if (!location.hash.startsWith('#messages')) return;
      if (applyIntent(takeIntent())) { markCurrentRead(); rerender(); }
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  // After every render: pending focus / scroll requests, then clear one-shot "fresh" animation flags
  useLayoutEffect(() => {
    if (M.focus) { document.getElementById(M.focus)?.focus(); M.focus = null; }
    if (M.scroll) {
      const s = document.getElementById('stream');
      if (s) s.scrollTo({ top: s.scrollHeight, behavior: M.scroll === 'smooth' ? scrollBehavior() : 'auto' });
      M.scroll = null;
    }
    if (M.threadScroll) { const sc = document.querySelector('.thread-scroll'); if (sc) sc.scrollTop = sc.scrollHeight; M.threadScroll = false; }
    M.fresh.convo = null; M.fresh.msg = null; M.fresh.ann = null; M.fresh.reply = null; M.bump = null;
  });

  // Leaving #messages: the To: input is gone, so forget the dropdown handle
  useEffect(() => () => { M.rcptPop = null; }, []);

  // One row of chips; "Email" = conversations whose latest message went by email
  const filters = M.tab === 'message' ? ['all', 'unread', 'direct', 'email'] : ['all', 'unread'];
  const FILTER_TIP = { email: 'Conversations whose latest message went by email' };
  return (
    <div className="msgs">
      <section className="list-col">
        <div className="list-head">
          <div className="row"><h1 className="h1">Messages</h1><button className="btn btn-dark btn-sm" onClick={compose}>Compose <Icon name="pen" size={14} /></button></div>
          <Segmented id="tabSeg" value={M.tab} onChange={setTab} options={[{ v: 'message', label: <TabLabel tab="message" /> }, { v: 'announcement', label: <TabLabel tab="announcement" /> }]} />
          <label className="search"><Icon name="search" size={16} /><input id="q" placeholder="Search" value={M.q} autoComplete="off" onChange={(e) => { M.q = e.target.value; rerender(); }} /></label>
          <div className="filters">
            <div className="chips">{filters.map((f) => <button key={f} className={`chip ${M.filter === f ? 'on' : ''}`} data-tip={FILTER_TIP[f]} onClick={() => { M.filter = f; rerender(); }}>{f[0].toUpperCase() + f.slice(1)}</button>)}</div>
          </div>
        </div>
        <ul className="convos" id="convList"><ListItems /></ul>
      </section>
      <section className="conv" id="conv"><ConvInner key={M.convSeq} /></section>
    </div>
  );
}
