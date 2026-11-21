// Dashboard state + widget registry (port of vanilla app.js `D`, WIDGETS, PRESETS…).
// State lives at module level so the layout, open panels and calendar position survive
// navigating away and back while the page is open (like the vanilla `D` object).
import { useSyncExternalStore } from 'react';

export const EXEC = {
  month: 'May showed a 22% rise in volunteer hours over April, reaching 262 hours — the highest month on record. The spike was driven primarily by the spring suit drives and increased Mobile Services participation.',
  quarter: 'This quarter has logged 477 volunteer hours in its first seven weeks — already more than all of Q1 (434). Mobile Services and Warehouse Wednesday account for most of the growth, and first-time volunteers filled a third of May shifts.',
  year: '2026 so far: 911 logged hours across 120 volunteers — up 87% on the same months of 2025. May is the year’s high at 262 hours, driven by the spring suit drives and increased Mobile Services participation.',
};

// Every card is a widget on a 12-column grid. A view is an ordered list of [widget, span].
export const WIDGETS = {
  hours:         { label: 'Total volunteer hours', cat: 'Volunteers', desc: 'Hours this month, average per volunteer, retention', sizes: [4, 6, 8] },
  base:          { label: 'Volunteer base', cat: 'Volunteers', desc: 'Individual and group volunteers, with growth', sizes: [4, 6] },
  engage:        { label: 'Engagement analysis', cat: 'Volunteers', desc: 'Hours per volunteer and retention rate', sizes: [4, 6] },
  chart:         { label: 'Hours over time', cat: 'Volunteers', desc: 'Monthly hours trend with comparisons', sizes: [8, 12] },
  calendar:      { label: 'Upcoming events', cat: 'Events', desc: 'Calendar of shifts and how full each one is', sizes: [12] },
  participation: { label: 'Event participation', cat: 'Events', desc: 'Volunteers and hours by program', sizes: [8, 12] },
  survey:        { label: 'Post-event survey', cat: 'Events', desc: 'Responses and average rating by event', sizes: [4, 6, 8] },
  exec:          { label: 'Executive summary', cat: 'Insights', desc: 'Plain-language summary with action items', sizes: [8, 12] },
  insight:       { label: 'Key insight', cat: 'Insights', desc: 'The biggest pattern this period', sizes: [4, 6, 8] },
  rec:           { label: 'Recommendations', cat: 'Insights', desc: 'A suggested next step with an action plan', sizes: [4, 6, 8] },
  grants:        { label: 'Grant commitments', cat: 'Funding', desc: 'Progress against each funder’s target', sizes: [4, 6] },
  locations:     { label: 'Hours by location', cat: 'Funding', desc: 'Where volunteer hours were logged', sizes: [6, 12] },
};

export const PRESETS = {
  default: { name: 'Default', desc: 'Everything, in the standard order', layout: [['hours', 4], ['base', 4], ['survey', 4], ['exec', 12], ['insight', 4], ['engage', 4], ['rec', 4], ['chart', 12], ['participation', 8], ['grants', 4], ['calendar', 12], ['locations', 12]] },
  weekly:  { name: 'Weekly check-in', desc: 'Staffing, this week’s hours and feedback', layout: [['calendar', 12], ['hours', 4], ['engage', 4], ['survey', 4], ['participation', 8], ['rec', 4]] },
  board:   { name: 'Board prep', desc: 'Summary, trends and where hours happen', layout: [['exec', 12], ['hours', 4], ['base', 4], ['insight', 4], ['chart', 12], ['locations', 12]] },
  grants:  { name: 'Grant reporting', desc: 'Funder progress and the numbers behind it', layout: [['grants', 4], ['hours', 4], ['base', 4], ['participation', 8], ['engage', 4], ['locations', 12], ['chart', 12]] },
};
export const copyLayout = (l) => l.map(([id, span]) => [id, span]);

export const TPLS = [
  ['funder', 'Funder report', 'Match hours, outcomes, narrative'],
  ['board', 'Board update', 'Trend, engagement, recommendations'],
  ['internal', 'Internal review', 'Everything, unedited'],
  ['blank', 'Describe it yourself', 'Start from a blank document'],
];
export const PERIOD_LABEL = { month: 'This month', quarter: 'This quarter', year: 'This year' };
export const RANGE_LABEL = { year: 'This year', last: 'Last year', q1: 'Q1 2026' };

export const D = {
  views: Object.fromEntries(Object.entries(PRESETS).map(([k, v]) => [k, { ...v, layout: copyLayout(v.layout) }])),
  view: 'default', editing: false, snapshot: null,
  range: 'year', partOpen: false, grantsOpen: false, cal: { y: 2026, m: 4, sel: null, flash: null }, execPeriod: 'year', execOpen: false, planOpen: false,
  gen: { period: 'q1', tpl: 'funder', from: '2026-01-01', to: '2026-03-31' },
  gridGen: 0, // bumped when the whole grid is repainted (Reset / Undo reset) so cards remount like vanilla's innerHTML repaint
  chartAnim: true, // whether a newly mounted chart draws in (false during a repaint)
};
export const layout = () => D.views[D.view].layout;
export const hiddenIds = () => Object.keys(WIDGETS).filter((k) => !layout().some(([id]) => id === k));

let version = 0;
const subs = new Set();
export function bump() { version += 1; subs.forEach((fn) => fn()); }
export function useDash() {
  useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => version);
  return D;
}
