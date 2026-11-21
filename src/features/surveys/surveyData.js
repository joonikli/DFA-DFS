// Survey responses data for Admin / Survey Responses - Home (Figma 2324:46004) and Survey specific
// (2324:45890). The surveys are the main app's shared set (src/mock/adminSurveys.js), each tied to a
// past event from src/mock/adminEvents.js, so "View event" lands on the same event the Events
// screen, dashboards and profiles show. This file only reshapes them for the cards and results.
import { adminSurveys, surveyBucket } from '../../mock/adminSurveys.js';
import { parseDate, timeLabel } from '../events/eventData.js';

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const shortDate = (date) => parseDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
// "3:00-4:00 PM" like the cards; keeps both meridiems when they differ ("11:00 AM-3:00 PM").
export const timeRange = (start, end) => { const a = timeLabel(start), b = timeLabel(end); return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}-${b}` : `${a}-${b}`; };

const card = (s) => {
  const date = isoDate(s.start);
  return {
    id: s.id, eventId: s.eventId, title: s.title, date,
    month: s.start.toLocaleDateString('en-US', { month: 'short' }), day: s.start.getDate(),
    time: timeRange(hhmm(s.start), hhmm(s.end)),
    status: s.status === 'closed' ? 'Closed' : 'Open',
    questions: s.questions.length, responses: s.responses,
    organizer: s.organizer, location: s.county, description: s.description,
    tags: s.tags, // [{ label, tone }] from the event
    source: s,
  };
};

export const SURVEY_SECTIONS = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'Past month' },
].map((section) => ({ ...section, surveys: adminSurveys.filter((s) => surveyBucket(s) === section.id).map(card) }));
const ALL_SURVEYS = SURVEY_SECTIONS.flatMap((section) => section.surveys);

// Results page. Choice questions alternate bar graph / pie chart like the Figma frame (Q1 bar, Q3 pie).
const PALETTE = ['var(--purple-dark)', 'var(--pink)', 'var(--pink-dark)', 'var(--green-dark)', 'var(--blue)', 'var(--lime)'];
export function resultsFor(survey) {
  let choices = 0;
  return {
    date: shortDate(survey.date), time: survey.time.toUpperCase(), description: survey.description || '',
    questions: survey.source.questions.map((q) => q.type === 'text'
      ? { id: q.id, kind: 'text', title: q.prompt, responses: q.answers || [] }
      : { id: q.id, kind: 'choice', view: choices++ % 2 ? 'pie' : 'bar', title: q.prompt, options: q.options.map((label, i) => ({ label, count: q.counts?.[i] ?? 0, color: PALETTE[i % PALETTE.length] })) }),
  };
}

// Expanded panel copy from Admin / Survey Responses - Expanded summary (Figma 2324:46080).
// Each insight cites the survey(s) it came from (this week's, to match "Past week"); tags link to them.
const week = SURVEY_SECTIONS[0].surveys;
const sources = (...indexes) => indexes.map((i) => week[i]).filter(Boolean).map((s) => ({ id: s.id, label: `${s.title.replace(/ Event$/, '')} Survey` }));
export const AI_SUMMARY = {
  period: 'Past week',
  text: 'In our recent survey, volunteers at Dress for Success reported a 95% satisfaction rate with the in-person mobile services. Many expressed appreciation for the opportunity to empower women in their career journeys. Additionally, 80% of respondents indicated they felt more connected to the community after participating in these events.',
  score: { value: '7.45', outOf: '/10', change: '+2 from last week' },
  associations: [
    { label: 'Positive association in responses', value: '74%', change: '+2% from last week', trend: 'up' },
    { label: 'Negative association in responses', value: '26%', change: '-4% from last week', trend: 'down' },
  ],
  responseRate: { change: '12% increase since last month', months: ['JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], ticks: [100, 75, 50, 25, 0],
    // % read off the Figma line (2324:46094 vector) so the drawn chart keeps the designed shape
    values: [58, 54, 70, 77, 68, 83] },
  suggestions: [
    { text: 'Enhance networking opportunities by inviting industry professionals to share insights.', sources: sources(2, 1) },
    { text: 'Provide tailored workshops focusing on resume building and interview skills.', sources: sources(1) },
    { text: 'Implement mentorship programs pairing participants with experienced women in their fields.', sources: sources(2, 0) },
  ],
  strengths: [
    { text: 'Continue fostering leadership skills through interactive training sessions.', sources: sources(1, 2) },
    { text: 'Keep expanding on partnerships with local businesses for job placements.', sources: sources(2) },
    { text: 'Continue to launch a clothing drive to support women entering the workforce.', sources: sources(0) },
  ],
};

export const SORTS = ['Default', 'Most responses', 'Fewest responses'];

export { ALL_SURVEYS };
