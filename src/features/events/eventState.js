import { useCallback, useSyncExternalStore } from 'react';
import { INITIAL_EVENTS } from './eventData.js';

// Screen-local prototype state shared by Events and admin-view profiles.
// It survives navigating between screens, but resets on a page reload.
let state = { events: INITIAL_EVENTS, drafts: [], saved: new Set() };
const subscribers = new Set();
const subscribe = (callback) => { subscribers.add(callback); return () => subscribers.delete(callback); };

export function useEventState(key) {
  const value = useSyncExternalStore(subscribe, () => state[key]);
  const setValue = useCallback((next) => {
    state = { ...state, [key]: typeof next === 'function' ? next(state[key]) : next };
    subscribers.forEach((callback) => callback());
  }, [key]);
  return [value, setValue];
}
