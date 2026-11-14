// Volunteer-portal constants and helpers (vanilla volunteer.js top of file)
import { GROUPS, VOLS } from '../data.js';
import { events, eventsById, initialSurveyResponses } from '../mock/events.js';

export const VOL = 'maureen';
export const vol = VOLS[VOL];
export const group = (id) => GROUPS.find((g) => g.id === id);

export const VOL_NAV = [
  ['dashboard', 'Dashboard', 'nav-house'],
  ['events', 'Events', 'nav-calendar'],
  ['surveys', 'Surveys', 'nav-file-pen'],
  ['messages', 'Messages', 'nav-messages'],
];

export const ANNOUNCEMENT = { group: 'g1', id: 'a2' };
export const announcement = () => {
  const g = group(ANNOUNCEMENT.group);
  return { g, a: g.anns.find((x) => x.id === ANNOUNCEMENT.id) };
};

// Recommended for Maureen: the events flagged `recommended` in src/mock/events.js
// (the same ones the volunteer Events page tags "Recommend").
const WHY = { e11: 'Matches your resume review experience', e14: 'Matches your styling skills', e23: 'You enjoyed Interview Practice' };
export const RECOMMENDED = events
  .filter((e) => e.recommended)
  .map((e) => ({ id: e.id, dist: e.distance.replace(/ from you$/, ''), why: WHY[e.id] || 'Based on your profile' }));

// 'Tuesday, May 12'
export const surveyDate = (e) => e.start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

// A survey answer in the main app's store ({ rating: { answer }, feedback: { answer } }) as a past-survey row
export const surveyRow = (e, answers) => ({ id: e.id, event: e.title, date: surveyDate(e), rating: answers.rating?.answer || 0, comment: answers.feedback?.answer || '' });

export const SURVEY_EVENT = { event: eventsById.e08.title, date: surveyDate(eventsById.e08) };

export const PAST_SURVEYS = Object.entries(initialSurveyResponses)
  .map(([id, answers]) => surveyRow(eventsById[id], answers))
  .reverse();

export const shortTime = (t) => t.replace(/:00/g, '').replace(/\s?(AM|PM)/g, (m, p) => ` ${p.toLowerCase()}`).replace(/ (am|pm)–/, '–');
export const firstName = (n) => n.split(' ')[0];
