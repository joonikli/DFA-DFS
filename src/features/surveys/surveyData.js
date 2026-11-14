// Screen-local fixtures from Admin / Survey Responses - Home (Figma 2324:46004).
// Card layout and tag colours mirror the design; each card is its own survey on a completed event
// from events/eventData.js (the first is the design's Fill-A-Bag Event), so links land somewhere real.
import { INITIAL_EVENTS, parseDate, timeLabel } from '../events/eventData.js';

export const shortDate = (date) => parseDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
// "3:00-4:00 PM" like the cards; keeps both meridiems when they differ ("11:00 AM-3:00 PM").
export const timeRange = (start, end) => { const a = timeLabel(start), b = timeLabel(end); return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}-${b}` : `${a}-${b}`; };

const card = ([id, eventId, questions, responses, tag]) => {
  const e = INITIAL_EVENTS.find((item) => item.id === eventId), d = parseDate(e.date);
  return { id, eventId, title: e.title, date: e.date, month: d.toLocaleDateString('en-US', { month: 'short' }), day: d.getDate(), time: timeRange(e.start, e.end), status: 'Open', questions, responses, organizer: e.organizer, location: e.address, tags: [tag, tag, tag] };
};

// Results page — Admin / Survey Responses - Survey specific (Figma 2324:45890).
// Figma shows placeholder "00%" bars and a "23 volunteers" tooltip; counts below are sized to the
// designed bar widths and donut slices so the visuals match, out of the 30 responses shown.
export const SURVEY_RESULTS = {
  date: 'Aug 12, 2025',
  time: '3-4 PM',
  description: 'Help pack essential items for those in need and make a difference in the Pittsburgh community today!',
  questions: [
    { id: 'q1', kind: 'choice', view: 'bar', title: 'How sufficient did you find our clothing selection?', options: [
      { label: 'Option 1', count: 4, color: 'var(--purple-dark)' },
      { label: 'Option 2', count: 8, color: 'var(--pink)' },
      { label: 'Option 3', count: 8, color: 'var(--pink-dark)' },
      { label: 'Option 4', count: 10, color: 'var(--green-dark)' },
    ] },
    { id: 'q2', kind: 'text', title: 'Did our stylists listen to your needs, preferences, and personal style?', responses: [
      'I told her I’m not comfortable in anything fitted around my arms, and she never made me feel awkward about it. We found a blazer that fit well and still looked polished.',
      'I was nervous and didn’t know what I wanted, but my stylist asked gentle questions and gave me options. She let me make the final choices, which made me feel in control.',
      'I’ve never had someone take the time to help me find clothes that matched my personality. She complimented my style and helped me add a scarf and jewelry that felt like me.',
      'She asked what kind of job I was interviewing for and pulled pieces that would work for that office. I left with an outfit I can wear more than once.',
      'I mentioned I walk to work, so she helped me find comfortable flats that still looked professional. Small thing, but it meant a lot.',
      'My stylist checked in before suggesting anything bold, and when I said no she moved on right away. I felt respected the whole time.',
    ] },
    { id: 'q3', kind: 'choice', view: 'pie', title: 'How did you hear about the Fill-A-Bag event?', options: [
      { label: 'Social media', count: 11, color: 'var(--purple-dark)' },
      { label: 'Word of mouth', count: 8, color: 'var(--blue)' },
      { label: 'Posters/ads', count: 3, color: 'var(--pink)' },
      { label: 'Website', count: 3, color: 'var(--pink-dark)' },
      { label: 'Other (specify)', count: 5, color: 'var(--lime)' },
    ] },
  ],
};

// [survey id, event id, questions, responses, tag colour]
export const SURVEY_SECTIONS = [
  { id: 'week', label: 'This week', surveys: [['week-1', 'fill-a-bag', 6, 30, 'purple'], ['week-2', 'interview-prep', 5, 18, 'blue'], ['week-3', 'pwg-mixer', 4, 42, 'pink']] },
  { id: 'month', label: 'Past month', surveys: [['month-1', 'completed-1', 6, 26, 'blue'], ['month-2', 'completed-2', 5, 12, 'yellow'], ['month-3', 'resume-night', 3, 21, 'purple'], ['month-4', 'back-to-work', 6, 11, 'purple'], ['month-5', 'mobile-homewood', 4, 15, 'pink'], ['month-6', 'donation-sort', 4, 33, 'purple']] },
].map((section) => ({ ...section, surveys: section.surveys.map(card) }));
const ALL_SURVEYS = SURVEY_SECTIONS.flatMap((section) => section.surveys);

// Results for the seeded surveys. Fill-A-Bag is the designed page; the others reuse its questions,
// scaled to their own response count and named for their own event.
export function resultsFor(survey, event) {
  if (survey.eventId === 'fill-a-bag') return SURVEY_RESULTS;
  const scale = (options) => {
    const base = options.reduce((sum, o) => sum + o.count, 0);
    const out = options.map((o) => ({ ...o, count: Math.round((o.count / base) * survey.responses) }));
    const diff = survey.responses - out.reduce((sum, o) => sum + o.count, 0), top = out.reduce((a, b) => (b.count > a.count ? b : a));
    top.count += diff;
    return out;
  };
  return {
    date: shortDate(survey.date), time: (event?.time || survey.time).toUpperCase(), description: event?.description || '',
    questions: SURVEY_RESULTS.questions.map((q) => q.kind === 'text' ? { ...q, responses: q.responses.slice(0, Math.min(q.responses.length, survey.responses)) }
      : { ...q, title: q.id === 'q3' ? `How did you hear about the ${survey.title}?` : q.title, options: scale(q.options) }),
  };
}

// Expanded panel copy from Admin / Survey Responses - Expanded summary (Figma 2324:46080).
// Each insight cites the survey(s) it came from (this week's, to match "Past week"); tags link to them.
const sources = (...ids) => ids.map((id) => { const s = ALL_SURVEYS.find((item) => item.id === id); return { id, label: `${s.title.replace(/ Event$/, '')} Survey` }; });
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
    { text: 'Enhance networking opportunities by inviting industry professionals to share insights.', sources: sources('week-3', 'week-2') },
    { text: 'Provide tailored workshops focusing on resume building and interview skills.', sources: sources('week-2') },
    { text: 'Implement mentorship programs pairing participants with experienced women in their fields.', sources: sources('week-3', 'week-1') },
  ],
  strengths: [
    { text: 'Continue fostering leadership skills through interactive training sessions.', sources: sources('week-2', 'week-3') },
    { text: 'Keep expanding on partnerships with local businesses for job placements.', sources: sources('week-3') },
    { text: 'Continue to launch a clothing drive to support women entering the workforce.', sources: sources('week-1') },
  ],
};

export const SORTS = ['Default', 'Most responses', 'Fewest responses'];
