// List-column actions (vanilla ACTS['msg-tab'], ['open-convo'], ['open-group'], compose, filters)
import { M, convo, group, markRead, renderConv, syncChannel } from './state.js';

export function setTab(v) {
  if (M.tab === v) return;
  M.tab = v; M.composing = false; M.thread = null; M.msgThread = null;
  syncChannel();
  if (M.tab === 'announcement' && (M.filter === 'direct' || M.filter === 'email')) M.filter = 'all';
  markRead(M.tab === 'message' ? convo(M.active) : group(M.activeGroup));
  renderConv();
}

export function openConvo(id) {
  const c = convo(id);
  M.active = c.id; M.composing = false; M.sideTab = 'upcoming'; M.msgThread = null;
  syncChannel();
  markRead(c);
  renderConv();
}

export function openGroup(id) {
  M.activeGroup = id; M.composing = false; M.thread = null;
  syncChannel();
  markRead(group(M.activeGroup));
  renderConv();
}

export function compose() {
  if (M.composing) return;
  M.composing = true; M.thread = null; M.msgThread = null; M.rcptsOpen = false;
  syncChannel();
  renderConv();
}
