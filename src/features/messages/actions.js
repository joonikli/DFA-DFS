// List-column actions (vanilla ACTS['msg-tab'], ['open-convo'], ['open-group'], compose, filters)
import { M, convo, draft, group, lastMineChannel, markRead, renderConv } from './state.js';

export function setTab(v) {
  if (M.tab === v) return;
  M.tab = v; M.composing = false; M.thread = null; M.msgThread = null;
  M.channel = draft().channel || (M.tab === 'message' ? lastMineChannel(convo(M.active)) : 'inapp');
  if (M.tab === 'announcement' && M.filter === 'direct') M.filter = 'all';
  markRead(M.tab === 'message' ? convo(M.active) : group(M.activeGroup));
  renderConv();
}

export function openConvo(id) {
  const c = convo(id);
  M.active = c.id; M.composing = false; M.sideTab = 'upcoming'; M.msgThread = null;
  M.channel = draft().channel || lastMineChannel(c);
  markRead(c);
  renderConv();
}

export function openGroup(id) {
  M.activeGroup = id; M.composing = false; M.thread = null;
  M.channel = draft().channel || 'inapp';
  markRead(group(M.activeGroup));
  renderConv();
}

export function compose() {
  if (M.composing) return;
  M.composing = true; M.thread = null; M.msgThread = null; M.rcptsOpen = false;
  M.channel = draft().channel || M.channel;
  renderConv();
}
