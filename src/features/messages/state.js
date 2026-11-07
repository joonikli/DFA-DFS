// Messaging UI state + actions. A faithful port of the vanilla `M` object and `Msg` helpers:
// module-level state (survives route changes, like vanilla), shared mock data mutated in place,
// and every change re-renders subscribers through emit().
import { CONVOS, GROUPS, SHIFTS, VOLS } from '../../data.js';
import { emit, live, nowTime, reducedMotion } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { createElement } from 'react';

export const M = {
  tab: 'message', filter: 'all', channel: 'inapp', q: '',
  active: 'c1', activeGroup: 'g1', composing: false, channelFilter: 'all', rcptsOpen: false,
  sideTab: 'upcoming', sideClosed: false, thread: null, msgThread: null, newFrom: null, pinned: {}, drafts: {
    c1: { body: 'Text me if you need any more help, or if something comes up on the day! I’ll also text you if there are any updates, and there will be reminders sent out as well.', subject: 'Your upcoming shift — Mobile Services Route, Dec 12' },
  },
  fresh: { convo: null, msg: null, ann: null, reply: null },
  // React-port bookkeeping (what vanilla did by poking the DOM)
  convSeq: 0,        // bump → the conversation pane remounts (vanilla renderConv replaced its innerHTML)
  toQ: '',           // text typed in the To: field
  rcptKb: 0,         // keyboard-highlighted recipient option
  rcptPop: null,     // { key, anchor } of the open recipient dropdown
  kbScroll: false,   // scroll the highlighted recipient into view after the next render
  bump: null,        // { id, e, seq } reaction chip to pop/bump on the next render
  bumpSeq: 0,
  keep: null,        // message/announcement id whose hover toolbar stays visible while its popover is open
  keepBtn: null,     // `${act}:${id}` of the toolbar button shown as pressed while its popover is open
  leavingAnn: null,  // announcement id playing its exit animation
  newPill: false,    // "New message ↓" pill
  focus: null,       // element id to focus after the next render
  scroll: null,      // 'bottom' | 'smooth' — scroll the stream after the next render
  threadScroll: false,
};

// Hooks from the mounted Messages component (popovers + toasts live in providers above the router,
// so these stay valid for timers that fire after the user has left #messages)
export const UI = { pop: null, toast: () => {} };

export const convo = (id) => CONVOS.find((c) => c.id === id);
export const group = (id) => GROUPS.find((g) => g.id === id);
export const firstName = (id) => VOLS[id].name.split(' ')[0];
export const convoName = (c) => c.name || c.who.map((w) => (c.who.length > 1 ? firstName(w) : VOLS[w].name)).join(', ');
export const draftKey = () => (M.composing ? `new-${M.tab}` : M.tab === 'message' ? M.active : M.activeGroup);
export const draft = () => (M.drafts[draftKey()] ||= { body: '', subject: '' });
// Recipients and attachments live in the draft for the current conversation, so they survive switching away
Object.defineProperties(M, {
  rcpts: { get: () => (draft().rcpts ||= []), set: (v) => { draft().rcpts = v; } },
  attach: { get: () => (draft().attach ||= []), set: (v) => { draft().attach = v; } },
});

let msgSeq = 0;
export const nextMsgId = () => `m${++msgSeq}`;
export function ensureIds(c) { c.msgs.forEach((m) => { m.id ||= nextMsgId(); }); }
CONVOS.forEach(ensureIds);

export const hasDraft = (d) => !!(d && ((d.body || '').trim() || d.rcpts?.length || d.attach?.length));
export const lastMineChannel = (c) => ([...c.msgs].reverse().find((m) => m.from === 'me')?.type === 'email' ? 'email' : 'inapp');
const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
export function splitDate(d) {
  if (!d || d === 'Just now') return { day: 'Today', time: d === 'Just now' ? nowTime() : '' };
  const i = d.lastIndexOf(', ');
  if (i < 0) return { day: d, time: '' };
  const day = d.slice(0, i);
  return { day: DAY_NAMES[day] || day, time: d.slice(i + 2) };
}
export const CH_LABEL = { all: 'All channels', inapp: 'In-app', email: 'Email' };
export const unreadIn = (tab) => (tab === 'message' ? CONVOS : GROUPS).reduce((a, x) => a + x.unread, 0);

// Browser tab title "(N) …" — vanilla syncBadge()
const BASE_TITLE = typeof document !== 'undefined' ? document.title : '';
export function syncTitle() {
  const n = unreadIn('message') + unreadIn('announcement');
  document.title = n ? `(${n}) ${BASE_TITLE}` : BASE_TITLE;
}
syncTitle();

// Re-render everything subscribed (list, conversation, sidebar badge, popovers)
export function rerender() { syncTitle(); emit(); }
// vanilla Msg.renderConv(): the conversation pane is rebuilt (scroll to bottom / New divider, side panel reset)
export function renderConv({ keepQ = false } = {}) {
  M.convSeq += 1;
  M.newPill = false;
  if (!keepQ) M.toQ = '';
  rerender();
}

// Opening a conversation clears its count but remembers where the unread run started,
// so the "New" divider stays until you leave (Slack behaviour)
export function markRead(o) {
  if (!o) return;
  if (o.unread) M.newFrom = { id: o.id, n: o.unread };
  else if (M.newFrom?.id !== o.id) M.newFrom = null;
  o.unread = 0;
  syncTitle();
}
export const markCurrentRead = () => { if (!M.composing) markRead(M.tab === 'message' ? convo(M.active) : group(M.activeGroup)); };

export function lastPreview(c) {
  const m = [...c.msgs].reverse().find((x) => x.type !== 'divider');
  if (!m) return '';
  const who = m.from === 'me' ? 'You: ' : c.who.length > 1 && VOLS[m.from] ? `${firstName(m.from)}: ` : '';
  if (m.type === 'shift') return `${who}Shared a shift · ${SHIFTS[m.shift].title}`;
  if (m.type === 'email') return `${who}${m.subject}`;
  return who + m.text;
}

export function newIndex(c) {
  if (M.newFrom?.id !== c.id) return -1;
  let n = M.newFrom.n;
  for (let i = c.msgs.length - 1; i >= 0; i--) { const m = c.msgs[i]; if (m.type === 'divider' || m.from === 'me') continue; if (--n === 0) return i; }
  return -1;
}

export const findMsg = (id) => { for (const c of CONVOS) { const m = c.msgs.find((x) => x.id === id); if (m) return [m, c]; } return []; };
export const annById = (id) => group(M.activeGroup).anns.find((a) => a.id === id);

export function addAttach(att) {
  if (!M.attach.some((x) => x.type === att.type && (x.id || x.url || x.text) === (att.id || att.url || att.text))) M.attach.push(att);
}

export const bump = (id, e) => { M.bump = e ? { id, e, seq: ++M.bumpSeq } : null; };
export const closePops = (instant = false) => UI.pop?.close(null, instant);

// ----- recipients dropdown -----
export function rcptOptions() {
  const q = M.toQ.trim().toLowerCase();
  const picked = (kind, id) => M.rcpts.some((r) => r.kind === kind && r.id === id);
  const match = (s) => !q || s.toLowerCase().includes(q);
  const vol = (id) => ({ kind: 'vol', id, label: VOLS[id].name, sub: VOLS[id].email });
  let sections;
  if (q) {
    const vols = Object.keys(VOLS).filter((id) => match(VOLS[id].name) || match(VOLS[id].email)).map(vol);
    const groups = M.tab === 'announcement' ? GROUPS.filter((g) => match(g.name)).map((g) => ({ kind: 'group', id: g.id, label: g.name, sub: `${g.count} members` })) : [];
    sections = [['Results', [...groups, ...vols]]];
  } else {
    sections = [
      ...(M.tab === 'announcement' ? [['Groups', GROUPS.slice(0, 4).map((g) => ({ kind: 'group', id: g.id, label: g.name, sub: `${g.count} members` }))]] : []),
      ['Recent', ['sarah', 'sophia', 'marie', 'andre'].map(vol)],
      ['On upcoming shifts', ['elena', 'janice', 'rosaline', 'priya', 'tasha'].map(vol)],
    ];
  }
  return sections.map(([t, items]) => [t, items.filter((o) => !picked(o.kind, o.id))]).filter(([, items]) => items.length);
}

// Opens the recipient dropdown under the To: input, or refreshes it if it's already open.
// The dropdown's content component is passed in to avoid a circular import.
let RcptContent = null;
export const registerRcptContent = (C) => { RcptContent = C; };
export function openRcpts() {
  const input = document.getElementById('toInput');
  if (!input || !UI.pop || !RcptContent) return;
  if (M.rcptPop && M.rcptPop.anchor === input) { rerender(); return; }
  closePops();
  const p = { anchor: input, key: null };
  M.rcptPop = p;
  p.key = UI.pop.open(input, createElement(RcptContent), { align: 'start', onClose: () => { if (M.rcptPop === p) M.rcptPop = null; } });
}

export function addRcpt(kind, id) {
  M.rcpts.push({ kind, id });
  M.toQ = '';
  M.rcptKb = 0;
  rerender();
  document.getElementById('toInput')?.focus();
  openRcpts();
}

// ----- sending -----
export function send() {
  const d = draft();
  const email = M.channel === 'email';
  const ann = M.tab === 'announcement';
  const body = (d.body || '').trim();
  const subject = email || ann ? (d.subject || '').trim() : '';
  const typed = M.composing ? M.toQ.trim() : '';
  if (typed) {
    const flat = rcptOptions().flatMap(([, it]) => it);
    if (flat.length === 1) { M.rcpts.push({ kind: flat[0].kind, id: flat[0].id }); M.toQ = ''; }
    else {
      UI.toast(flat.length ? `${flat.length} people match “${typed}”. Pick one from the list.` : `No one matches “${typed}”.`, { ic: 'alert' });
      document.getElementById('toInput')?.focus(); openRcpts(); return;
    }
  }
  if (M.composing && !M.rcpts.length) { UI.toast('Add at least one recipient first.', { ic: 'alert' }); document.getElementById('toInput')?.focus(); return; }
  if (!body && !M.attach.length) { document.getElementById('body')?.focus(); return; }
  closePops(true);
  const attach = M.attach.slice();
  const key = draftKey();
  if (ann) return sendAnn({ body, subject, attach, key });

  let c;
  const ids = M.composing ? M.rcpts.flatMap((r) => (r.kind === 'group' ? group(r.id).members : [r.id])) : null;
  if (M.composing) {
    const uniq = [...new Set(ids)];
    c = CONVOS.find((x) => x.who.length === uniq.length && uniq.every((w) => x.who.includes(w)));
    if (!c) { c = { id: `n${Date.now()}`, who: uniq, unread: 0, time: 'Just now', channel: M.channel, msgs: [] }; CONVOS.unshift(c); M.fresh.convo = c.id; }
  } else c = convo(M.active);
  const m = email
    ? { id: nextMsgId(), from: 'me', type: 'email', subject: subject || '(no subject)', text: body, attach, time: 'Just now', status: 'sending' }
    : { id: nextMsgId(), from: 'me', text: body, attach, time: 'Just now', status: 'sending' };
  c.msgs.push(m);
  c.time = 'Just now';
  c.channel = M.channel;
  CONVOS.splice(CONVOS.indexOf(c), 1); CONVOS.unshift(c);
  M.fresh.msg = m;
  M.drafts[key] = { body: '', subject: '' };
  M.attach = [];
  M.composing = false; M.rcpts = [];
  M.active = c.id;
  M.focus = 'body';
  renderConv();
  deliver(m, c);
}

export function deliver(m, c) {
  m.status = 'sending'; rerender();
  setTimeout(() => {
    const email = m.type === 'email';
    const bad = email ? c.who.find((w) => VOLS[w].emailBad) : null;
    if (!navigator.onLine) Object.assign(m, { status: 'failed', fail: 'you’re offline', fixEmail: null });
    else if (bad) Object.assign(m, { status: 'failed', fail: `${VOLS[bad].email} bounced`, fixEmail: bad });
    else Object.assign(m, { status: email ? 'sent' : 'delivered', time: nowTime(), fail: null, fixEmail: null });
    rerender();
    if (m.status === 'failed') { UI.toast(`Message not delivered: ${m.fail}`, { ic: 'alert' }); live(`Message not delivered: ${m.fail}`); return; }
    if (email) UI.toast(c.who.length > 1 ? `Email sent to ${c.who.length} volunteers, each as their own copy` : `Email sent to ${convoName(c)}`, { ic: 'mail' });
    else if (c.who.length === 1 && !m.replied) { m.replied = true; fakeReply(c, m); }
  }, 900);
}

const onMessages = () => location.hash.startsWith('#messages');

function fakeReply(c, sent) {
  const replies = ['Sounds good — thank you!', 'Perfect, see you then 🙌', 'Got it, thanks Bridget!', 'Thank you! Added it to my calendar.'];
  const viewingNow = () => onMessages() && M.tab === 'message' && !M.composing && M.active === c.id;
  setTimeout(() => {
    if (!sent) return;
    (sent.reacts ||= {})['👍'] = [c.who[0]];
    if (viewingNow()) { sent.status = 'seen'; bump(sent.id, '👍'); rerender(); }
  }, 1400);
  setTimeout(() => {
    if (sent) sent.status = 'seen';
    const m = { id: nextMsgId(), from: 'them', text: replies[Math.floor(Math.random() * replies.length)], time: nowTime() };
    c.msgs.push(m); c.time = 'Just now';
    const name = VOLS[c.who[0]].name;
    if (viewingNow()) {
      const s = document.getElementById('stream');
      const nearBottom = !s || s.scrollHeight - s.scrollTop - s.clientHeight < 120;
      M.fresh.msg = m;
      if (nearBottom) M.scroll = 'smooth';
      else M.newPill = true;
    } else {
      c.unread += 1;
      UI.toast(`${name} replied: “${m.text}”`, { ic: 'nav-messages', action: 'Open', onAction: () => openFromAnywhere(c.id) });
    }
    live(`New message from ${name}: ${m.text}`);
    rerender();
  }, 2600);
}

// vanilla render(): a full rebuild of the messaging screen
export function fullRender() {
  markCurrentRead();
  renderConv();
}

export function openFromAnywhere(id) {
  Object.assign(M, { tab: 'message', composing: false, active: id, thread: null });
  M.channel = draft().channel || lastMineChannel(convo(id));
  if (onMessages()) fullRender(); else { markCurrentRead(); M.convSeq += 1; navigate('messages'); }
}

// Dashboard "Message volunteers" / roster "Message all": compose to everyone on a shift
export function startShiftCompose(id) {
  const s = SHIFTS[id];
  if (!s) return;
  Object.assign(M, { tab: 'message', composing: true, channel: 'inapp', thread: null, rcpts: s.vols.map((v) => ({ kind: 'vol', id: v })), attach: [{ type: 'shift', id }] });
  Object.assign(draft(), { channel: 'inapp', subject: '', body: `Hi all — thanks for signing up for ${s.title} on ${s.mon} ${s.day}. We still have ${s.cap - s.filled} open spots; if you know anyone who’d like to join, send them the link below!` });
  closePops(true);
  if (onMessages()) fullRender(); else { M.convSeq += 1; navigate('messages'); }
}

function sendAnn({ body, subject, attach, key }) {
  let g;
  if (M.composing) {
    const grp = M.rcpts.find((r) => r.kind === 'group');
    if (grp && M.rcpts.length === 1) g = group(grp.id);
    else {
      const members = [...new Set(M.rcpts.flatMap((r) => (r.kind === 'group' ? group(r.id).members : [r.id])))];
      g = { id: `ng${Date.now()}`, name: members.slice(0, 3).map(firstName).join(', ') + (members.length > 3 ? ` +${members.length - 3}` : ''), members, count: members.length, unread: 0, time: 'Just now', anns: [] };
      GROUPS.unshift(g); M.fresh.convo = g.id;
    }
  } else g = group(M.activeGroup);
  const a = { id: `na${Date.now()}`, date: 'Just now', title: subject || 'Announcement', body, attach, reacts: {}, more: 0, mine: [], replies: [], seen: 0, emailed: M.channel === 'email' };
  g.anns.push(a); g.time = 'Just now';
  GROUPS.splice(GROUPS.indexOf(g), 1); GROUPS.unshift(g);
  M.fresh.ann = a.id;
  M.drafts[key] = { body: '', subject: '' };
  M.attach = []; M.composing = false; M.rcpts = [];
  M.activeGroup = g.id;
  renderConv();
  UI.toast(`Announcement sent to ${g.count} ${g.count === 1 ? 'person' : 'people'}${a.emailed ? ' in-app and by email' : ''}`, { ic: 'check' });
  [700, 1500, 2400, 3300, 4600].forEach((t, i) => setTimeout(() => {
    a.seen = Math.min(g.count, Math.ceil((g.count * (i + 1)) / 7));
    rerender();
  }, t));
  // Reactions trickle in
  [[1400, '👍'], [2300, '💞'], [3400, '👍'], [4200, '😄']].forEach(([t, e]) => setTimeout(() => {
    a.reacts[e] = (a.reacts[e] || 0) + 1;
    bump(a.id, e);
    rerender();
  }, t));
}

export const scrollBehavior = () => (reducedMotion() ? 'auto' : 'smooth');
