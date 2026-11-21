import { useCallback, useSyncExternalStore } from 'react';
import { SURVEY_SECTIONS } from './surveyData.js';

// Screen-local prototype state for Survey responses (same pattern as events/eventState.js).
// Published surveys and the unsent "Create survey" draft survive navigation, not a reload.
let state = { sections: SURVEY_SECTIONS, draft: null };
const subscribers = new Set();
const subscribe = (callback) => { subscribers.add(callback); return () => subscribers.delete(callback); };

export function useSurveyState(key) {
  const value = useSyncExternalStore(subscribe, () => state[key]);
  const setValue = useCallback((next) => {
    state = { ...state, [key]: typeof next === 'function' ? next(state[key]) : next };
    subscribers.forEach((callback) => callback());
  }, [key]);
  return [value, setValue];
}
