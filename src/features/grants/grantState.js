import { useCallback, useSyncExternalStore } from 'react';
import { INITIAL_GRANTS } from './grantData.js';

// Screen-local prototype state for Grants (same pattern as events/eventState.js):
// uploads and applications survive navigation, not a reload.
let state = { grants: INITIAL_GRANTS, applied: new Set() };
const subscribers = new Set();
const subscribe = (callback) => { subscribers.add(callback); return () => subscribers.delete(callback); };

export function useGrantState(key) {
  const value = useSyncExternalStore(subscribe, () => state[key]);
  const setValue = useCallback((next) => {
    state = { ...state, [key]: typeof next === 'function' ? next(state[key]) : next };
    subscribers.forEach((callback) => callback());
  }, [key]);
  return [value, setValue];
}
