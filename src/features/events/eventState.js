import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { useDemo } from '../../store/DemoStore.jsx';
import { useAdminEvents } from '../admin/useAdminEvents.js';
import { toScreenEvent, toStoreEvent } from './eventData.js';

// State for the admin Events screen and admin-view profiles, same API as before:
//   const [events, setEvents] = useEventState('events')   // the main app's admin events
//   const [saved, setSaved] = useEventState('saved')       // Set of saved event ids
//   const [drafts, setDrafts] = useEventState('drafts')    // screen-local
// Events and saved come from the main app's store (src/store/DemoStore.jsx), so the admin
// Surveys, both dashboards and the volunteer screens see the same events. Setting them sends
// the change back: cancel / undo cancel, create, edit, save / unsave.

// Fields the Events editor can change on an existing event
const EDITABLE = ['title', 'detailTitle', 'date', 'start', 'end', 'time', 'address', 'organizer', 'type', 'tagText', 'description', 'longDescription', 'survey', 'surveyDefinition'];

function useStoreEvents() {
  const all = useAdminEvents();
  const { admin, adminCancelEvent, adminCreateEvent, adminEditEvent } = useDemo();
  const edits = admin.eventEdits;
  const events = useMemo(() => all.map((e) => ({ ...toScreenEvent(e), ...edits?.[e.id] })), [all, edits]);
  const current = useRef(events);
  current.current = events;
  const setEvents = useCallback((next) => {
    const before = current.current;
    const after = typeof next === 'function' ? next(before) : next;
    const byId = new Map(before.map((e) => [e.id, e]));
    after.forEach((e) => {
      const prev = byId.get(e.id);
      if (!prev) {
        adminCreateEvent(toStoreEvent(e));
        adminEditEvent(e.id, Object.fromEntries(EDITABLE.filter((k) => e[k] !== undefined).map((k) => [k, e[k]])));
        return;
      }
      if (prev === e) return;
      if ((prev.status === 'Cancelled') !== (e.status === 'Cancelled')) adminCancelEvent(e.id);
      const patch = Object.fromEntries(EDITABLE.filter((k) => JSON.stringify(prev[k]) !== JSON.stringify(e[k])).map((k) => [k, e[k]]));
      if (Object.keys(patch).length) adminEditEvent(e.id, patch);
    });
  }, [adminCancelEvent, adminCreateEvent, adminEditEvent]);
  return [events, setEvents];
}

function useStoreSaved() {
  const { admin, adminToggleSaved } = useDemo();
  const saved = useMemo(() => new Set(admin.saved), [admin.saved]);
  const current = useRef(saved);
  current.current = saved;
  const setSaved = useCallback((next) => {
    const before = current.current;
    const after = typeof next === 'function' ? next(before) : next;
    [...new Set([...before, ...after])].forEach((id) => { if (before.has(id) !== after.has(id)) adminToggleSaved(id); });
  }, [adminToggleSaved]);
  return [saved, setSaved];
}

// Drafts stay on this screen (they survive navigating away, not a reload)
let drafts = [];
const subscribers = new Set();
const subscribe = (callback) => { subscribers.add(callback); return () => subscribers.delete(callback); };
function useLocalDrafts() {
  const value = useSyncExternalStore(subscribe, () => drafts);
  const setValue = useCallback((next) => {
    drafts = typeof next === 'function' ? next(drafts) : next;
    subscribers.forEach((callback) => callback());
  }, []);
  return [value, setValue];
}

const HOOKS = { events: useStoreEvents, saved: useStoreSaved, drafts: useLocalDrafts };

// `key` is fixed per call site, so the same hooks run on every render.
export function useEventState(key) {
  return HOOKS[key]();
}
