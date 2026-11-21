// Admin Events screen data. The events themselves are the main app's admin events
// (src/mock/adminEvents.js through useAdminEvents); this file converts them to the shape
// the Events cards, detail and editor use, and back for newly created events.
import { ME, SHIFTS, VOLS } from '../../data.js';
import { adminSurveys } from '../../mock/adminSurveys.js';
import { TODAY } from '../../mock/today.js';

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const EVENT_TODAY = isoDate(TODAY);
export const EVENT_DESCRIPTION = 'Join us for a hands-on volunteer event to sort, label, and organize our donated goods! Volunteers will help check items for quality, sort them into categories such as clothing, household goods, and non-perishables, and shelve everything so it’s ready for distribution. No experience is needed, just a willingness to pitch in. Gloves, labels, and refreshments will be provided. Whether you can stay for an hour or the entire shift, your help will make sure donations reach the people who need them most, quickly and efficiently.';

// Figma "Single Event" content for Donation Inventory Organizing (e13)
const inventorySurvey = {
  title: 'Donation Inventory Organizing Survey',
  questions: [
    { id: 'inventory-rating', title: 'How would you rate this event?', type: 'Multiple choice', options: ['Excellent', 'Good', 'Could be better'] },
    { id: 'inventory-instructions', title: 'How clear were the instructions?', type: 'Multiple choice', options: ['Very clear', 'Somewhat clear', 'Not clear'] },
    { id: 'inventory-feedback', title: 'What could we improve next time?', type: 'Free form', options: [''] },
  ],
};
const FIGMA = { e13: { longDescription: EVENT_DESCRIPTION, survey: inventorySurvey.title, surveyDefinition: inventorySurvey } };

// The main app's survey for each event, as the detail's "View survey" list
const SURVEYS = {};
adminSurveys.forEach((s) => {
  SURVEYS[s.eventId] ||= {
    title: s.title,
    questions: s.questions.map((q) => ({ id: q.id, title: q.prompt, type: q.type === 'choice' ? 'Multiple choice' : 'Free form', options: q.options || [''] })),
  };
});

// 6 pm → '6', 11:30 am → '11:30'; '2-5 pm', '11:30 am-4 pm'
const short = (d) => `${d.getHours() % 12 || 12}${d.getMinutes() ? `:${pad(d.getMinutes())}` : ''}`;
const ap = (d) => (d.getHours() < 12 ? 'am' : 'pm');
const compactTime = (a, b) => (ap(a) === ap(b) ? `${short(a)}-${short(b)} ${ap(b)}` : `${short(a)} ${ap(a)}-${short(b)} ${ap(b)}`);

const STATUS = { upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' };
const DEMO_PEOPLE = Object.keys(VOLS).filter((id) => id !== 'maureen' && id !== 'jimmy');

// Admin event (useAdminEvents) → Events screen event
export function toScreenEvent(e) {
  const registered = e.signups.length;
  // Roster: named contacts among the sign-ups (Maureen first when she signed up), else demo profiles
  const maureen = e.signups.includes('v01');
  const others = SHIFTS[e.id]?.vols?.length ? SHIFTS[e.id].vols : DEMO_PEOPLE;
  const volunteerIds = [...(maureen ? ['maureen'] : []), ...others].slice(0, registered);
  const done = e.status === 'completed';
  const maureenMissing = e.surveyMissing.includes('v01');
  const missing = done ? [...(maureenMissing ? ['maureen'] : []), ...volunteerIds.filter((id) => id !== 'maureen').slice(0, Math.max(0, e.surveyMissing.length - (maureenMissing ? 1 : 0)))] : undefined;
  const survey = SURVEYS[e.id];
  return {
    id: e.id,
    date: isoDate(e.start),
    start: hhmm(e.start),
    end: hhmm(e.end),
    time: compactTime(e.start, e.end),
    title: e.title,
    detailTitle: e.name && e.name !== e.title ? e.name : '',
    type: e.title,
    address: e.location,
    description: e.description,
    tags: e.tags.map((t) => t.tone),
    tagText: e.tags.map((t) => t.label).join(', '),
    organizer: e.organizer === 'me' ? ME.name : e.organizer,
    registered,
    group: e.organizer === 'me' ? 'mine' : 'month',
    status: STATUS[e.status] || 'Upcoming',
    volunteerIds,
    surveyMissingIds: missing,
    surveyCompletedIds: done ? volunteerIds.filter((id) => !missing.includes(id)) : undefined,
    survey: e.hasSurvey ? survey?.title || `${e.name || e.title} Survey` : undefined,
    surveyDefinition: survey,
    ...FIGMA[e.id],
  };
}

// New event from the Events editor → admin event for the main app's store
export function toStoreEvent(s) {
  const [y, m, d] = s.date.split('-').map(Number);
  const at = (t) => { const [h, min] = t.split(':').map(Number); return new Date(y, m - 1, d, h, min); };
  return {
    id: s.id,
    name: s.title,
    title: s.type || s.title,
    program: 'custom',
    location: s.address,
    distance: '',
    description: s.description,
    tags: (s.tagText || '').split(',').map((t) => t.trim()).filter(Boolean).map((label) => ({ label, tone: 'pink' })),
    start: at(s.start),
    end: at(s.end),
    recommended: false,
    organizer: 'me',
    organizers: [ME.name],
    signups: [],
    surveyMissing: [],
    status: 'upcoming',
    hasSurvey: Boolean(s.survey),
  };
}

export const parseDate = (date) => new Date(`${date}T12:00:00`);
export const dateLabel = (date) => parseDate(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
export const timeLabel = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
};
