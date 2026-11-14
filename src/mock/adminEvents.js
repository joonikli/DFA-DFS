// Admin-side view of events: organizer, sign-ups and post-event survey status.
// Builds on src/mock/events.js so volunteer and admin screens share one calendar.
import { events } from './events.js'
import { volunteers } from './volunteers.js'
import { TODAY } from './today.js'

// Admin-facing event names (Figma "Single Event": "Donation Inventory Organizing" under "Warehouse Wednesday").
const NAMES = {
  e13: 'Donation Inventory Organizing',
  e17: 'Spring Intake Sorting',
  e15: 'Summer Suit Drive Distribution',
  e19: 'Resume Rx: Healthcare Careers',
  e22: 'Online Applications 101',
}

const MY_EVENTS = ['e13', 'e15', 'e24', 'e09'] // organized by the admin persona (Bridget)
const ORGANIZERS = ['Kyla Brooks', 'Anna Claire', 'Mariko Takahashi']

const signupCount = (i) => [15, 45, 3, 0, 22, 9, 31, 12, 67, 18][i % 10]

export const adminEvents = events.map((e, i) => {
  const count = e.id === 'e13' ? 0 : e.id === 'e09' ? 67 : signupCount(i)
  const start = (i * 7) % volunteers.length
  const signups = Array.from({ length: count }, (_, k) => volunteers[(start + k * 3) % volunteers.length].id)
  const past = e.start < TODAY
  // Past events: most volunteers submitted the survey, a few haven't.
  const surveyMissing = past ? signups.filter((_, k) => k % 13 === 0 || k < Math.min(5, Math.floor(count / 10))) : []
  return {
    ...e,
    name: NAMES[e.id] ?? e.title,
    organizer: MY_EVENTS.includes(e.id) ? 'me' : ORGANIZERS[i % ORGANIZERS.length],
    signups,
    surveyMissing,
    status: past ? 'completed' : 'upcoming',
    hasSurvey: true,
  }
})

export const adminEventsById = Object.fromEntries(adminEvents.map((e) => [e.id, e]))

export const initialAdminState = {
  saved: ['e13', 'e16', 'e21'],
  cancelled: ['e18'],
  createdEvents: [], // events made with "Create event"
  eventEdits: {}, // eventId → fields changed with "Edit" on the admin Events screen
}

// Right-rail "To do" list (Figma: Events - admin, 2324:46460)
export const todos = [
  { id: 't1', kind: 'Survey', tone: 'green', text: 'Check missing volunteer survey', to: '/events/e09' },
  { id: 't2', kind: 'Grant', tone: 'purple', text: 'Confirm grant report disbursement', to: '/grants' },
  { id: 't3', kind: 'Event', tone: 'blue', text: 'Add a survey to Summer Suit Drive', to: '/events/e15' },
  { id: 't4', kind: 'Grant', tone: 'purple', text: 'Draft PNC Foundation impact report', to: '/grants' },
]

export const EVENT_TYPES = [
  'Warehouse Wednesday',
  'Mobile Services',
  'Boutique',
  'Resume Review',
  'Interview Practice',
  'Career Closet Prep',
  'Clothing Distribution',
  'Fill-A-Bag',
  'MHCI Lunch',
]

export const TAG_OPTIONS = [
  ['Clothes', 'purple'],
  ['Organizing', 'purple'],
  ['spanish', 'pink'],
  ['any language', 'pink'],
  ['no requirements', 'blue'],
  ['heavy lifting', 'pink'],
  ['own transportation', 'purple'],
  ['no experience', 'pink'],
]
