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

// Email subject: keep the thread's subject ("Re: …"); otherwise the message's first line. Never "(no subject)".
export const threadSubject = (c) => { const e = c && [...c.msgs].reverse().find((m) => m.type === 'email' && m.subject); return e ? `Re: ${e.subject.replace(/^Re: /, '')}` : ''; };
const firstLine = (t) => { const l = (t || '').split('\n')[0].trim(); return l.length > 60 ? `${l.slice(0, 57)}…` : l; };
export const hasDraft = (d) => !!(d && ((d.body || '').trim() || d.rcpts?.length || d.attach?.length));
// ----- channels: which route will actually reach people -----
// A volunteer who never joined the app can only get email; one who hasn't opened it in two weeks
// probably won't see an in-app message soon, so email is suggested (the manager can still switch).
const APP_STALE_DAYS = 14;
const joinNames = (ids) => (ids.length === 1 ? firstName(ids[0]) : ids.length === 2 ? `${firstName(ids[0])} and ${firstName(ids[1])}` : `${ids.length} people`);
const ago = (d) => (d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`);
const span = (d) => (d >= 14 ? `${Math.floor(d / 7)} weeks` : `${d} days`);
export function channelAdvice(ids, c = null) {
  if (!ids.length) return null;
  const noApp = ids.filter((w) => VOLS[w].appDays == null);
  const stale = ids.filter((w) => VOLS[w].appDays != null && VOLS[w].appDays >= APP_STALE_DAYS);
  const noEmail = ids.filter((w) => !VOLS[w].email);
  const one = ids.length === 1;
  const has = (list) => (list.length === 1 ? 'hasn’t' : 'haven’t');
  const allNoApp = noApp.length === ids.length;
  // In-app only stops working when nobody here has the app; in a mixed group the people without it get an email copy
  const inappOff = allNoApp ? `${joinNames(noApp)} ${has(noApp)} joined the app yet, so in-app messages won’t reach ${one ? 'them' : 'anyone here'}` : null;
  const emailOff = noEmail.length ? `No email address on file for ${joinNames(noEmail)}` : null;
  const emailCopies = !allNoApp ? noApp : [];
  const lastIn = c && [...c.msgs].reverse().find((m) => m.type !== 'divider' && m.from !== 'me');
  let ch = 'inapp', reason;
  if (allNoApp) { ch = 'email'; reason = `${joinNames(noApp)} ${has(noApp)} joined the app, so this goes by email`; }
  else if (lastIn?.type === 'email') { ch = 'email'; reason = `${one ? firstName(ids[0]) : 'They'} replied by email, so this goes by email`; }
  else if (one && stale.length) { ch = 'email'; reason = `${firstName(ids[0])} hasn’t opened the app in ${span(VOLS[ids[0]].appDays)}`; }
  else if (emailCopies.length) { const inApp = ids.filter((w) => !emailCopies.includes(w)); reason = `${joinNames(inApp)} ${inApp.length === 1 ? 'gets' : 'get'} this in the app. ${joinNames(emailCopies)} ${emailCopies.length === 1 ? 'gets' : 'get'} an email copy`; }
  else if (stale.length) reason = `${joinNames(stale)} ${has(stale)} opened the app in a while`;
  else reason = one ? `${firstName(ids[0])} was active in the app ${ago(VOLS[ids[0]].appDays)}` : 'Everyone here has used the app this week';
  if (ch === 'email' && emailOff) ch = 'inapp';
  return { ch, reason, inappOff, emailOff, emailCopies };
}
export const currentRecipients = () => (M.composing
  ? [...new Set(M.rcpts.flatMap((r) => (r.kind === 'group' ? group(r.id).members : [r.id])))]
  : convo(M.active)?.who || []);
// The composer's channel: what the manager picked for this draft, else the suggestion; never a route that can't work
export function syncChannel() {
  if (M.tab !== 'message') { M.channel = 'inapp'; return; }
  const adv = channelAdvice(currentRecipients(), !M.composing ? convo(M.active) : null);
  let ch = draft().channel || adv?.ch || 'inapp';
  if (ch === 'inapp' && adv?.inappOff) ch = 'email';
  if (ch === 'email' && adv?.emailOff) ch = 'inapp';
  M.channel = ch;
}

// ----- announcements: audience split, email rule, reply mode -----
export const EMAIL_RULES = {
  unseen: ['If unseen after 24h', 'People without the app get it by email now. Everyone else gets an email only if they haven’t seen it in 24 hours.'],
  now: ['Everyone now', 'Emails everyone right away, on top of the app. Keep this for important, time-sensitive news.'],
  off: ['Don’t email', 'Only people with the app get it.'],
};
export const REPLY_MODES = {
  thread: ['In the thread', 'Replies are visible to the whole group. People reading by email reply to you privately.'],
  private: ['Privately to me', 'Replies come to you as direct messages in Message.'],
};
export const annRule = (a) => a.emailRule || (a.emailed ? 'now' : 'unseen');
export function reachOfPeople(ids) {
  const r = { app: 0, email: 0, none: 0 };
  ids.forEach((w) => { const v = VOLS[w]; if (v.appDays != null) r.app += 1; else if (v.email && !v.emailBad) r.email += 1; else r.none += 1; });
  return r;
}
export const groupReach = (g) => g.reach || reachOfPeople(g.members);
// Who the announcement being written will reach: { app, email, none, total }
export function audience() {
  const r = { app: 0, email: 0, none: 0 };
  const add = (x) => { r.app += x.app; r.email += x.email; r.none += x.none; };
  if (!M.composing) { const g = group(M.activeGroup); if (g) add(groupReach(g)); }
  else {
    const inGroups = new Set(M.rcpts.filter((x) => x.kind === 'group').flatMap((x) => group(x.id).members));
    M.rcpts.filter((x) => x.kind === 'group').forEach((x) => add(groupReach(group(x.id))));
    add(reachOfPeople(M.rcpts.filter((x) => x.kind === 'vol' && !inGroups.has(x.id)).map((x) => x.id)));
  }
  return { ...r, total: r.app + r.email + r.none };
}
// What we actually know about who has an announcement. App users see it first; email opens are an estimate.
export function seenSplit(a, g) {
  const r = a.reach || groupReach(g);
  const rule = annRule(a);
  const seen = Math.min(a.seen ?? g.count, g.count);
  const emailed = rule === 'off' ? 0 : r.email;
  const appSeen = Math.min(seen, r.app);
  const opened = Math.min(emailed, seen - appSeen);
  return { rule, appSeen, appUnseen: r.app - appSeen, opened, notOpened: emailed - opened, notSent: rule === 'off' ? r.email : 0, none: r.none, total: appSeen + opened, of: g.count };
}
const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
export function splitDate(d) {
  if (!d || d === 'Just now') return { day: 'Today', time: d === 'Just now' ? nowTime() : '' };
  const i = d.lastIndexOf(', ');
  if (i < 0) return { day: d, time: '' };
  const day = d.slice(0, i);
  return { day: DAY_NAMES[day] || day, time: d.slice(i + 2) };
}
export const CH_LABEL = { all: 'Any', inapp: 'App', email: 'Email' };
export const unreadIn = (tab) => (tab === 'message' ? CONVOS : GROUPS).reduce((a, x) => a + x.unread, 0);

// Browser tab title "(N) …" — vanilla syncBadge()
const BASE_TITLE = typeof document !== 'undefined' ? document.title.replace(/^\(\d+\) /, '') : '';
export function syncTitle() {
  const n = unreadIn('message') + unreadIn('announcement');
  document.title = n ? `(${n}) ${BASE_TITLE}` : BASE_TITLE;
}
syncTitle();

// Re-render everything subscribed (list, conversation, sidebar badge, popovers)
export function rerender() { syncChannel(); syncTitle(); emit(); }
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
    ? { id: nextMsgId(), from: 'me', type: 'email', subject: subject || threadSubject(c) || firstLine(body), text: body, attach, time: 'Just now', status: 'sending' }
    : { id: nextMsgId(), from: 'me', text: body, attach, time: 'Just now', status: 'sending' };
  // In-app to a mixed group: people without the app get an email copy
  if (!email) { const copies = channelAdvice(c.who)?.emailCopies || []; if (copies.length) m.emailCopies = copies; }
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
    if (email) {
      UI.toast(c.who.length > 1 ? `Email sent to ${c.who.length} volunteers, each as their own copy` : `Email sent to ${convoName(c)}`, { ic: 'mail' });
      // Email is honest about what it knows: Sent, then Delivered once the mail server accepts it. Never "Seen".
      setTimeout(() => { if (m.status === 'sent') { m.status = 'delivered'; rerender(); } }, 1100);
    }
    if (c.who.length === 1 && !m.replied) { m.replied = true; fakeReply(c, m, email); }
  }, 900);
}

const onMessages = () => location.hash.startsWith('#messages');

function fakeReply(c, sent, email = false) {
  const replies = email
    ? ['Thanks Bridget, that works for us. See you there.', 'Got it, thank you! I’ll pass it on to the team.']
    : ['Sounds good — thank you!', 'Perfect, see you then 🙌', 'Got it, thanks Bridget!', 'Thank you! Added it to my calendar.'];
  const viewingNow = () => onMessages() && M.tab === 'message' && !M.composing && M.active === c.id;
  setTimeout(() => {
    if (!sent || email) return;
    (sent.reacts ||= {})['👍'] = [c.who[0]];
    if (viewingNow()) { sent.status = 'seen'; bump(sent.id, '👍'); rerender(); }
  }, 1400);
  setTimeout(() => {
    if (sent && !email) sent.status = 'seen';
    const text = replies[Math.floor(Math.random() * replies.length)];
    // An email reply threads back into the same conversation, labelled "Replied by email"
    const m = email
      ? { id: nextMsgId(), from: 'them', type: 'email', subject: `Re: ${sent.subject.replace(/^Re: /, '')}`, text, time: nowTime() }
      : { id: nextMsgId(), from: 'them', text, time: nowTime() };
    c.msgs.push(m); c.time = 'Just now'; c.channel = email ? 'email' : 'inapp';
    const name = VOLS[c.who[0]].name;
    if (viewingNow()) {
      const s = document.getElementById('stream');
      const nearBottom = !s || s.scrollHeight - s.scrollTop - s.clientHeight < 120;
      M.fresh.msg = m;
      if (nearBottom) M.scroll = 'smooth';
      else M.newPill = true;
    } else {
      c.unread += 1;
      UI.toast(`${name} replied${email ? ' by email' : ''}: “${m.text}”`, { ic: 'nav-messages', action: 'Open', onAction: () => openFromAnywhere(c.id) });
    }
    live(`New message from ${name}: ${m.text}`);
    rerender();
  }, email ? 3400 : 2600);
}

// vanilla render(): a full rebuild of the messaging screen
export function fullRender() {
  markCurrentRead();
  renderConv();
}

export function openFromAnywhere(id) {
  Object.assign(M, { tab: 'message', composing: false, active: id, thread: null });
  syncChannel();
  if (onMessages()) fullRender(); else { markCurrentRead(); M.convSeq += 1; navigate('messages'); }
}

// Dashboard "Message volunteers" / roster "Message all": compose to everyone on a shift
export function startShiftCompose(id) {
  const s = SHIFTS[id];
  if (!s) return;
  Object.assign(M, { tab: 'message', composing: true, thread: null, rcpts: s.vols.map((v) => ({ kind: 'vol', id: v })), attach: [{ type: 'shift', id }] });
  Object.assign(draft(), { channel: undefined, subject: '', body: `Hi all — thanks for signing up for ${s.title} on ${s.mon} ${s.day}. We still have ${s.cap - s.filled} open spots; if you know anyone who’d like to join, send them the link below!` });
  closePops(true);
  if (onMessages()) fullRender(); else { M.convSeq += 1; navigate('messages'); }
}

function sendAnn({ body, subject, attach, key }) {
  const d = draft();
  const emailRule = d.emailRule || 'unseen', replies = d.replies || 'thread';
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
  const reach = groupReach(g);
  const a = { id: `na${Date.now()}`, date: 'Just now', title: subject || 'Announcement', body, attach, reacts: {}, more: 0, mine: [], replies: [], seen: 0, emailRule, replyMode: replies, reach };
  g.anns.push(a); g.time = 'Just now';
  GROUPS.splice(GROUPS.indexOf(g), 1); GROUPS.unshift(g);
  M.fresh.ann = a.id;
  M.drafts[key] = { body: '', subject: '' };
  M.attach = []; M.composing = false; M.rcpts = [];
  M.activeGroup = g.id;
  renderConv();
  const ppl = (n) => `${n} ${n === 1 ? 'person' : 'people'}`;
  UI.toast(emailRule === 'now' ? `Posted to ${ppl(g.count)} and emailed to everyone`
    : emailRule === 'off' ? `Posted to ${ppl(g.count)} in the app${reach.email ? ` · ${ppl(reach.email)} without the app won’t get it` : ''}`
    : `Posted to ${ppl(g.count)}${reach.email ? ` · ${ppl(reach.email)} without the app ${reach.email === 1 ? 'gets' : 'get'} it by email` : ''}`, { ic: 'check' });
  annReply(g, a, replies);
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

// A volunteer answers a new announcement: in its thread, or privately as a direct message
// (an email-only volunteer's reply arrives by email). Private replies never land in the group.
function annReply(g, a, mode) {
  setTimeout(() => {
    if (mode === 'thread') {
      const who = g.members[1] || g.members[0];
      a.replies.push({ who, when: 'Just now', text: 'Thanks for sharing this!' });
      rerender();
      return;
    }
    const who = g.members.find((w) => VOLS[w].appDays == null) || g.members[0];
    const byEmail = VOLS[who].appDays == null;
    let c = CONVOS.find((x) => x.who.length === 1 && x.who[0] === who);
    if (!c) { c = { id: `n${Date.now()}`, who: [who], unread: 0, time: 'Just now', channel: 'inapp', msgs: [] }; CONVOS.unshift(c); }
    const text = 'Thanks for the heads-up. Is there anything we should bring?';
    const m = byEmail
      ? { id: nextMsgId(), from: 'them', type: 'email', subject: `Re: ${a.title}`, text, time: nowTime(), reAnn: a.title }
      : { id: nextMsgId(), from: 'them', text, time: nowTime(), reAnn: a.title };
    c.msgs.push(m); c.time = 'Just now'; c.channel = byEmail ? 'email' : 'inapp';
    CONVOS.splice(CONVOS.indexOf(c), 1); CONVOS.unshift(c);
    const viewing = onMessages() && M.tab === 'message' && !M.composing && M.active === c.id;
    if (viewing) { M.fresh.msg = m; M.scroll = 'smooth'; } else c.unread += 1;
    UI.toast(`${VOLS[who].name} replied privately${byEmail ? ' by email' : ''} to “${a.title}”`, { ic: 'nav-messages', action: 'Open', onAction: () => openFromAnywhere(c.id) });
    live(`${VOLS[who].name} replied privately to ${a.title}`);
    rerender();
  }, 5200);
}
