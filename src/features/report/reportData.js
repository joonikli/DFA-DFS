// Report composer: static config, the module-level report state (RP) and pure helpers.
// RP lives outside React so the report survives navigating away and back with the same
// query string (vanilla keys its state by q.toString()), and so pending timers that
// resolve after unmount still land in the state.
import { useSyncExternalStore } from 'react';
import { HOURS, SURVEY, VOLS } from '../../data.js';

export const SECTION_META = {
  hours: { size: 'full', title: 'Average hours over time' },
  survey: { size: 'half', title: 'Post-event survey' },
  engage: { size: 'half', title: 'Engagement analysis' },
  events: { size: 'full', title: 'First-time attendees by event' },
  sentiment: { size: 'full', title: 'Survey sentiment since March' },
  impact: { size: 'full', title: 'Grant-eligible impact metrics, YTD' },
  top: { size: 'half', title: 'Top volunteers by hours' },
  retention: { size: 'half', title: 'Retention by cohort' },
  note: { size: 'full', title: 'Note' },
};
export const TEMPLATES = { funder: ['hours', 'impact', 'survey', 'engage'], board: ['hours', 'survey', 'engage'], internal: ['hours', 'survey', 'engage', 'events', 'top', 'retention'], blank: [] };
export const TPL_EYEBROW = { funder: 'Dress for Success Pittsburgh · Funder report', board: 'Dress for Success board update', internal: 'Internal review · Not for distribution', blank: 'Dress for Success · Custom report' };
// Template display names (vanilla TPLS, defined in the dashboard section)
export const TPL_NAME = { funder: 'Funder report', board: 'Board update', internal: 'Internal review', blank: 'Describe it yourself' };
export const SUGGESTIONS = [
  ['Which events drove the most first-time attendees?', 'events'],
  ['How did survey sentiment shift this year?', 'sentiment'],
  ['Grant-eligible impact metrics, YTD', 'impact'],
];
export const INTENTS = [
  { re: /first[- ]?time|attend|which event|events?\b/i, kind: 'events', reply: 'Mobile Services drove the most first-time attendees (34), followed by the Spring Suit Drive (27). I added a breakdown by event.' },
  { re: /sentiment|feel|satisf|march/i, kind: 'sentiment', reply: 'Positive sentiment climbed steadily this year — from 71% in January to 91% in May. Added it as a trend chart.' },
  { re: /grant|impact|funder|metric|ytd|outcome/i, kind: 'impact', reply: 'Here are the grant-eligible metrics year to date. In-kind value uses $34.79/hr — change it if your funder uses a different rate.' },
  { re: /top|most hours|leaderboard|who (volunteered|gave)|best/i, kind: 'top', reply: 'Added the five volunteers with the most hours this period.' },
  { re: /retention|retain|churn|return|cohort/i, kind: 'retention', reply: 'Retention is strongest in the spring cohort (88%). Corporate groups return least often — worth a follow-up.' },
  { re: /survey|rating|response/i, kind: 'survey', reply: 'Added the post-event survey results with a summary.' },
  { re: /engag|average|per volunteer/i, kind: 'engage', reply: 'Added the engagement breakdown.' },
  { re: /hour|trend|over time|growth/i, kind: 'hours', reply: 'Added volunteer hours over the period.' },
];

// Section content data (shared by the renderer and the Markdown export)
export const SENTIMENT = { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [71, 76, 81, 86, 91] };
export const SENTIMENT_SUB = 'Positive responses rose 20 points after the March intake redesign';
export const SURVEY_FOOT = ['4.6 / 5 avg rating', '248 responses'];
export const SURVEY_AI = 'Volunteers reported a 95% satisfaction rate with the in-person Mobile Services shifts. The most common request was clearer parking directions.';
export const ENGAGE_ROWS = [
  ['Avg hours per volunteer', '+1.1 vs last quarter', '12.3'],
  ['New volunteers', '+12 vs last quarter', '31'],
  ['Volunteer retention rate', '+4 pts vs last quarter', '83%'], // hidden when compact
];
export const EVENTS_SUB = '101 first-time volunteers this period — 34% of all attendees';
export const EVENTS_ROWS = [['Mobile Services Route', 34], ['Spring Suit Drive', 27], ['Warehouse Wednesday', 19], ['MHCI Lunch & Learn', 12], ['Career Closet Styling', 9]];
export const IMPACT_SUB = 'Year to date, Jan 1 – May 20, 2026';
export const IMPACT_GRID = [['1,941', 'Volunteer hours'], ['$67.5k', 'In-kind value at $34.79/hr'], ['1,183', 'Women served'], ['3,420', 'Suits distributed']];
export const IMPACT_NOTE = 'Mobile Services reached 412 clients at partner shelters, meeting the 400-client target in the 2026 Allegheny Foundation grant.';
export const TOP_SUB = 'Five volunteers logged 230 hours between them';
export const TOP_ROWS = ['marie', 'tasha', 'sarah', 'sophia', 'priya'];
export const RETENTION_SUB = 'Share still volunteering after 90 days';
export const RETENTION_ROWS = [['Spring cohort', 88], ['Summer cohort', 81], ['Fall cohort', 79], ['Corporate groups', 64]];
export const NOTE_DEFAULT = 'I don’t have structured data for this yet, so I’ve added a section you can write into. Click this text to edit it.';

/* ---------------- state ---------------- */
let secSeq = 0;
let chatSeq = 0;
export const newSec = (kind, extra = {}) => ({
  id: `s${++secSeq}`, kind, title: SECTION_META[kind].title, size: SECTION_META[kind].size, type: 'line', compact: false, edits: [],
  // view-only flags (vanilla keeps these as DOM classes on the section element)
  rev: 0, born: 0, fresh: false, reveal: null, busy: false, leaving: false, flash: false,
  ...extra,
});
export const chatMsg = (m) => ({ key: ++chatSeq, ...m });

export const RP = { key: null, tpl: 'board', period: 'q1', from: null, to: null, sections: [], chat: [], loading: false, exportFmt: 'pdf', editing: null };

let version = 0;
const subs = new Set();
export function rpEmit() { version += 1; subs.forEach((fn) => fn()); }
export function useRP() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => version);
}

// Idempotent per query string: same params → keep the existing report (vanilla Report.init)
export function ensureReport(q) {
  const key = q.toString();
  if (RP.key === key) return;
  RP.key = key;
  RP.tpl = TEMPLATES[q.get('tpl')] ? q.get('tpl') : 'board';
  RP.period = ['month', 'q1', 'custom'].includes(q.get('period')) ? q.get('period') : 'q1';
  RP.from = q.get('from') || '2026-01-01'; RP.to = q.get('to') || '2026-03-31';
  RP.sections = TEMPLATES[RP.tpl].map((k) => newSec(k));
  RP.chat = [];
  RP.loading = true;
  RP.editing = null;
}

/* ---------------- helpers ---------------- */
const fmtDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export function periodInfo() {
  if (RP.period === 'month') return { title: 'May 2026', range: 'May 1 – May 31, 2026', short: 'May 2026', file: 'May-2026' };
  if (RP.period === 'custom') {
    const t = `${fmtDate(RP.from)} – ${fmtDate(RP.to)}`;
    return { title: `${fmtDate(RP.from)}–${fmtDate(RP.to)}`, range: `${t}, 2026`, short: t, file: 'Custom' };
  }
  return { title: 'Q1 2026', range: 'Jan 1 – Mar 31, 2026', short: 'Q1 2026', file: 'Q1-2026' };
}
export function hoursSeries() {
  if (RP.period === 'month') return { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'], values: [48, 61, 72, 58, 23], note: 'Week 3 (Summer Suit Drive prep) was the busiest of the month' };
  if (RP.period === 'custom') return { labels: HOURS.year.labels, values: HOURS.year.values, note: 'Hours climbed through the spring, hitting a record in May' };
  return { labels: HOURS.q1.labels, values: HOURS.q1.values, note: 'Hours more than doubled from January to March' };
}

// The report as Markdown, built from section data. Mirrors what vanilla reportMarkdown()
// scraped from the DOM: header, then per section title, subtitle and readable values.
export function reportMarkdown() {
  const p = periodInfo();
  const out = [`# ${p.title} Volunteer Report`, '', `_${TPL_EYEBROW[RP.tpl]} · ${p.range}_`, ''];
  RP.sections.forEach((s) => {
    out.push(`## ${s.title}`, '');
    const sub = !s.compact && {
      hours: hoursSeries().note, sentiment: SENTIMENT_SUB, events: EVENTS_SUB, impact: IMPACT_SUB, top: TOP_SUB, retention: RETENTION_SUB,
    }[s.kind];
    if (sub) out.push(sub, '');
    if (s.kind === 'hours') { const h = hoursSeries(); h.labels.forEach((l, i) => out.push(`- ${l}: ${h.values[i]} hours`)); out.push(''); }
    if (s.kind === 'engage') (s.compact ? ENGAGE_ROWS.slice(0, 2) : ENGAGE_ROWS).forEach(([l, t, b]) => out.push(`- ${l}: **${b}** (${t})`));
    if (s.kind === 'events') EVENTS_ROWS.forEach(([l, n]) => out.push(`- ${l}: ${n}`));
    if (s.kind === 'retention') RETENTION_ROWS.forEach(([l, n]) => out.push(`- ${l}: ${n}%`));
    if (s.kind === 'impact') IMPACT_GRID.forEach(([b, l]) => out.push(`- ${l}: **${b}**`));
    if (s.kind === 'top') TOP_ROWS.forEach((r) => out.push(`- ${[VOLS[r].name, VOLS[r].role, VOLS[r].hours].join(' · ')} hrs`));
    if (s.kind === 'survey') {
      if (!s.compact) out.push(`> ${SURVEY_AI}`);
      out.push(SURVEY_FOOT.join(' · '));
    }
    if (s.kind === 'impact' && !s.compact) out.push(IMPACT_NOTE);
    if (s.kind === 'note') out.push(String(s.text ?? '').replace(/\s+/g, ' ').trim());
    out.push('');
  });
  return out.join('\n');
}

export const SURVEY_MAX = Math.max(...SURVEY.map((x) => x.n));
