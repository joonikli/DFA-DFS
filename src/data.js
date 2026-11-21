// Mock data for the prototype. Everything is in memory and resets on reload.
// Components mutate these objects and call emit() from store.js to re-render.
// Made-up data for the prototype. Everything lives in memory and resets on reload.
// Dates follow the prototype's fixed "today", Wednesday May 20, 2026 (src/mock/today.js).
import { events, initialVolunteerState } from './mock/events.js';
import { adminEvents } from './mock/adminEvents.js';
import { TODAY as MOCK_TODAY } from './mock/today.js';

export const ME = { first: 'Bridget', name: 'Bridget Moore' };

export const VOLS = {
  sarah:   { name: 'Sarah Nkemelu', role: 'Volunteer for Mobile Services', kind: 'Individual', loc: 'Washington, PA', email: 'sarah.nkemelu@gmail.com', phone: '412-555-0148', tags: ['heavy lifting', 'spanish'], notes: 'Prefers weekend events. Good with the check-in table. Has helped at the Washington location multiple times.', upcoming: ['e12', 'e20', 'e15'], hours: 46 },
  sophia:  { name: 'Sophia Chen', role: 'Career coach', kind: 'Individual', loc: 'Shadyside, Pittsburgh', email: 'sophia.chen@outlook.com', phone: '412-555-0193', tags: ['career coaching', 'mandarin'], notes: 'Former HR lead at UPMC. Great at mock interviews — pair her with first-time clients.', upcoming: ['e21', 'e19'], hours: 38 },
  marie:   { name: 'Marie James', role: 'Warehouse lead', kind: 'Individual', loc: 'Mt. Lebanon, PA', email: 'mariejames@gmail.com', phone: '412-555-0112', tags: ['heavy lifting', 'team lead'], notes: 'Runs the Warehouse Wednesday sorting stations. Has a truck for large pickups.', upcoming: ['e17', 'e20'], hours: 61 },
  andre:   { name: 'Andre Dupont', role: 'Mobile Services driver', kind: 'Individual', loc: 'Bloomfield, Pittsburgh', email: 'andre.dupont@gmail.com', phone: '412-555-0177', tags: ['driver', 'french'], notes: 'Licensed to drive the styling van. Available Tuesdays and Saturdays.', upcoming: ['e12', 'e15'], hours: 29 },
  priya:   { name: 'Priya Raman', role: 'Stylist', kind: 'Individual', loc: 'Squirrel Hill, Pittsburgh', email: 'priya.raman@gmail.com', phone: '412-555-0130', tags: ['styling', 'tamil'], notes: 'Trained stylist; leads fittings at the Homestead boutique.', upcoming: ['e15', 'e21'], hours: 33 },
  tasha:   { name: 'Tasha Greene', role: 'On-the-day leader', kind: 'Individual', loc: 'East Liberty, Pittsburgh', email: 'tasha.greene@yahoo.com', phone: '412-555-0164', tags: ['team lead', 'any language'], notes: 'Very reliable opener. Has keys to the Redmond Rd warehouse.', upcoming: ['e17', 'e15'], hours: 52 },
  elena:   { name: 'Elena Vargas', role: 'Intake & translation', kind: 'Individual', loc: 'Beechview, Pittsburgh', email: 'elena.vargas@gmail.com', phone: '412-555-0121', tags: ['spanish', 'intake'], notes: 'Translates intake forms for Spanish-speaking clients.', upcoming: ['e12'], hours: 24 },
  marcus:  { name: 'Marcus Bell', role: 'Corporate partner lead', kind: 'Group', loc: 'PNC Bank volunteer team', email: 'marcus.bell@pnc.com', phone: '412-555-0105', tags: ['group', 'corporate'], notes: 'Coordinates a 12-person PNC team for the Summer Suit Drive.', upcoming: ['e15'], hours: 18 },
  janice:  { name: 'Janice Yu', role: 'Volunteer for Mobile Services', kind: 'Individual', loc: 'Oakland, Pittsburgh', email: 'janice.yu@gmail.com', phone: '412-555-0186', tags: ['styling'], notes: 'Pitt grad student, flexible weekday evenings.', upcoming: ['e17', 'e12'], hours: 15 },
  rosaline:{ name: 'Rosaline Jo', role: 'Volunteer for Mobile Services', kind: 'Individual', loc: 'Lawrenceville, Pittsburgh', email: 'rosaline.jo@gmail.com', phone: '412-555-0158', tags: ['korean', 'intake'], notes: 'Great with nervous first-time clients.', upcoming: ['e12', 'e21'], hours: 21 },
  jimmy:   { name: 'Jimmy Wang', role: 'Program coordinator', kind: 'Staff', loc: 'Downtown Career Center', email: 'jimmy.wang@dfspgh.org', phone: '412-555-0100', tags: ['staff'], notes: 'Staff coordinator for Mobile Services.', upcoming: [], hours: 0 },
  maureen: { name: 'Maureen Lee', role: 'Volunteer for Mobile Services & Warehouse Wednesday', kind: 'Individual', loc: 'Pittsburgh, PA', email: 'maureen.lee@gmail.com', phone: '412-829-8069', tags: ['styling', 'any language'], notes: 'Signed up in March. Prefers evening and Saturday shifts.', upcoming: initialVolunteerState.registered, hours: 59 },
  dana:    { name: 'Dana Whitfield', role: 'Board liaison', kind: 'Individual', loc: 'Fox Chapel, PA', email: 'dana.whitfield@gmail.com', phone: '412-555-0142', tags: ['board'], notes: 'Board member who volunteers at the Summer Suit Drive every year.', upcoming: ['e15'], hours: 12 },
};

// How each person can be reached. appDays = days since they last opened the volunteer app
// (null = never joined the app). Drives the composer's suggested channel and its reason line.
const APP_DAYS = { sarah: 0, sophia: 1, marie: 2, andre: 4, priya: 0, tasha: 1, elena: 0, marcus: null, janice: 23, rosaline: 0, jimmy: 0, maureen: 0, dana: null };
Object.entries(APP_DAYS).forEach(([id, d]) => { VOLS[id].appDays = d; });

/* ---------------------------------------------------------------------------
   Shifts = the prototype's events (src/mock/events.js, May–July 2026), keyed by the same
   ids (e12 …) so the volunteer Events page, both dashboards and Messages agree.
   This file adds the manager-side details: roles, capacity, who signed up.
--------------------------------------------------------------------------- */
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const clock = (d) => `${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`;
const ampm = (d) => (d.getHours() < 12 ? 'AM' : 'PM');
// 2–5 pm → '2:00–5:00 PM'; 10 am–1 pm → '10:00 AM–1:00 PM'
const timeRange = (a, b) => (ampm(a) === ampm(b) ? `${clock(a)}–${clock(b)} ${ampm(b)}` : `${clock(a)} ${ampm(a)}–${clock(b)} ${ampm(b)}`);
const monShort = (d) => d.toLocaleString('en-US', { month: 'short' });

const ROLES = {
  mobileServices: 'Driver, Stylist, Intake',
  warehouseWednesday: 'Greeter, Room Manager, Suit Sorter',
  boutique: 'Stylist, Greeter',
  clothingDistribution: 'Greeter, Steamer, Rack Runner',
  careerClosetPrep: 'Stylist, Greeter',
  mhciLunch: 'Server, Greeter',
  resumeReview: 'Coach, Note taker',
  resumeCoaching: 'Coach, Note taker',
  interviewPractice: 'Coach, Note taker',
  jobApplicationClinic: 'Coach, Greeter',
  mobileShop: 'Driver, Stylist',
  fillABag: 'Packer, Greeter',
};
// Named contacts (VOLS above) among each shift's sign-ups — the people Messages and the
// event roster show by name. The sign-up count itself comes from src/mock/adminEvents.js.
const NAMED = {
  e12: ['sarah', 'andre', 'elena', 'janice', 'rosaline'], // Mobile Services · May 26
  e15: ['sarah', 'andre', 'priya', 'tasha', 'marcus', 'dana'], // Summer Suit Drive · May 30
  e17: ['marie', 'tasha', 'janice'], // Warehouse Wednesday · Jun 3
  e19: ['sophia'], // Resume Coaching · Jun 9
  e20: ['sarah', 'marie'], // Warehouse Wednesday · Jun 10
  e21: ['sophia', 'priya', 'rosaline'], // Career Closet Prep · Jun 12
};
// Spots per shift; never below the sign-ups already in (rounded up to the next 10)
const CAPS = { e12: 50, e15: 24 };
const capFor = (id, filled, i) => Math.max(CAPS[id] ?? [10, 12, 8, 20, 16][i % 5], Math.ceil((filled + 1) / 10) * 10);
const filledById = Object.fromEntries(adminEvents.map((e) => [e.id, e.signups.length]));

export const SHIFTS = {};
export const SHIFT_DATES = {}; // shift id -> ISO date, for calendar placement
events.forEach((e, i) => {
  const filled = filledById[e.id] ?? 0;
  SHIFTS[e.id] = {
    mon: monShort(e.start), day: e.start.getDate(), time: timeRange(e.start, e.end), addr: e.location, title: e.title, desc: e.description,
    roles: ROLES[e.program] || 'Greeter', tags: e.tags.map((t) => t.label), filled, cap: capFor(e.id, filled, i), vols: NAMED[e.id] || [],
  };
  SHIFT_DATES[e.id] = isoDate(e.start);
});
// Same fixed "today" as src/mock/today.js
export const TODAY = isoDate(MOCK_TODAY);

// Most recent past shifts (newest first)
export const PAST_SHIFTS = events
  .filter((e) => e.start < MOCK_TODAY)
  .reverse()
  .slice(0, 4)
  .map((e) => ({ mon: monShort(e.start), day: e.start.getDate(), title: e.title, time: timeRange(e.start, e.end) }));

// Direct conversations ("Message" tab)
export const CONVOS = [
  { id: 'c1', who: ['sarah'], unread: 0, time: '2 min ago', channel: 'inapp', msgs: [
    { from: 'them', text: 'Hi Bridget — any chance I can switch from the Wednesday sort to Tuesday’s Mobile Services shift?', time: 'Yesterday 4:12 PM' },
    { from: 'me', text: 'Of course! I’ll move you over — Andre is driving, so you’d be on intake with Elena.', time: '4:20 PM' },
    { type: 'divider', text: 'Today' },
    { from: 'them', text: 'Hi Bridget — is the Tuesday shift still starting at 2?', time: '11:02' },
    { from: 'me', text: 'Yes, 2pm sharp. I’ve attached the shift so you can add it to your calendar.', time: '11:04', reacts: { '🙏': ['sarah'] } },
    { from: 'me', type: 'shift', shift: 'e12', time: '11:05' },
  ]},
  { id: 'c2', who: ['sophia'], unread: 1, time: '18 min ago', channel: 'inapp', msgs: [
    { from: 'me', text: 'Thanks again for running the mock interviews last week — clients loved it.', time: 'Mon 3:40 PM' },
    { from: 'them', text: 'Thanks for bringing me in! Could I take two more slots at the June Career Closet?', time: '10:46' },
  ]},
  { id: 'c3', who: ['marie'], unread: 0, time: '1 hr ago', channel: 'inapp', msgs: [
    { from: 'them', text: 'Truck is free Wednesday if we need to pick up the Highmark donation.', time: '9:15', reacts: { '💞': ['me'] } },
    { from: 'me', text: 'Yes please! They have ~40 suits boxed at the front desk.', time: '9:31' },
    { from: 'them', text: 'Perfect, I’ll swing by at 5 and bring them to Redmond Rd.', time: '9:33' },
  ]},
  { id: 'c4', who: ['priya', 'tasha'], unread: 3, time: '3 hr ago', channel: 'inapp', name: 'Summer Suit Drive leads', about: 'Planning the drop-off line for the Summer Suit Drive: steamers, signs and sizing.', event: 'e15', created: 'May 14', msgs: [
    { from: 'priya', text: 'Do we have enough steamers for the 30th? Last year we had a line.', time: '8:02', replies: [
      { who: 'tasha', when: '8:20', text: 'Checked the supply closet — we have three. I’ll bring two more from home.' },
      { who: 'me', when: '8:31', text: 'Perfect. I’ll pick up the closet ones from Redmond Rd on Friday.' },
    ] },
    { from: 'tasha', text: 'I can bring two from home. Should we split the drop-off line into sizes?', time: '8:10', reacts: { '🙌': ['priya', 'me'], '👍': ['priya'] } },
    { from: 'priya', text: 'Love that. I’ll make signs.', time: '8:12' },
  ]},
  { id: 'c5', who: ['marcus'], unread: 0, time: 'Yesterday', channel: 'email', msgs: [
    { from: 'them', type: 'email', subject: 'PNC team — Summer Suit Drive', text: 'Hi Bridget,\n\nWe have 12 confirmed for the 30th. Is there parking for a sprinter van?\n\nThanks,\nMarcus', time: 'Yesterday 2:18 PM' },
    { from: 'me', type: 'email', subject: 'Re: PNC team — Summer Suit Drive', text: 'Hi Marcus — yes, there’s a loading zone at the Redmond Rd warehouse. I’ll send a parking map Friday.', time: 'Yesterday 3:02 PM' },
  ]},
  { id: 'c6', who: ['elena'], unread: 0, time: 'Mon', channel: 'inapp', msgs: [
    { from: 'them', text: 'I translated the new intake form into Spanish — sending it over now.', time: 'Mon 1:20 PM' },
    { from: 'me', text: 'You’re a star. I’ll print 50 for Tuesday.', time: 'Mon 1:45 PM' },
  ]},
  { id: 'c7', who: ['andre'], unread: 0, time: 'Sun', channel: 'inapp', msgs: [
    { from: 'them', text: 'Van needs gas before Tuesday — should I use the org card?', time: 'Sun 6:05 PM' },
    { from: 'me', text: 'Yes, keep the receipt in the glovebox envelope. Thanks Andre!', time: 'Sun 7:12 PM' },
  ]},
  { id: 'c8', who: ['janice'], unread: 1, time: 'May 13', channel: 'inapp', msgs: [
    { from: 'them', text: 'Thanks for bringing snacks to the warehouse shift, that was so nice.', time: 'May 13' },
  ]},
];

export const R = (a, b, c, d) => ({ '😄': a, '💞': b, '👍': c, '😎': d });

// Announcement groups ("Announcements" tab)
export const GROUPS = [
  { id: 'g1', name: 'Mobile Services volunteers', members: ['sarah', 'andre', 'elena', 'janice', 'rosaline'], count: 23, reach: { app: 18, email: 4, none: 1 }, unread: 2, time: '2 min ago', anns: [
    { id: 'a1', seen: 21, date: 'Mon, 8:10 AM', title: 'Warehouse Wednesday: June sign-ups', body: 'Hi all — June Warehouse Wednesday shifts are open. We sort and tag donated workwear from 2:00 to 5:00 PM at Redmond Rd. Grab a spot while there’s room.', reacts: R(12, 9, 21, 4), more: 41, mine: [], replies: [
      { who: 'rosaline', when: 'Mon at 9:02 AM', text: 'Signed up for the 3rd!' },
      { who: 'janice', when: 'Mon at 11:40 AM', text: 'Can I bring a friend who hasn’t registered yet?' },
    ]},
    { id: 'a2', seen: 19, date: 'Friday, 6:20 PM', title: 'May 26 Mobile Services: arrival & parking', body: 'Hi all — thanks for signing up for Tuesday’s Mobile Services shift. We start at 2:00 sharp at the Downtown Career Center; use the side entrance on Sixth Avenue.\n\nThe lot on Penn Ave is free for volunteers. Wear comfortable shoes — coffee and everything else is on us.', reacts: R(12, 12, 12, 12), more: 59, mine: ['👍'], replies: [
      { who: 'rosaline', when: 'Fri at 6:32 PM', text: 'Cool! Got it!' },
      { who: 'janice', when: 'Fri at 6:41 PM', text: 'Sorry, I might be a bit late to the event, but let me know if you need help afterwards!' },
    ]},
    { id: 'a3', seen: 14, date: 'Today, 10:30 AM', title: 'Tuesday shift reminder', body: 'Tuesday’s Mobile Services shift starts at 2pm at the Downtown Career Center. Park on Penn and come in the side entrance — I’ll be there from 1:30 if you need anything.', reacts: R(5, 3, 14, 2), more: 8, mine: [], replies: [] },
  ]},
  { id: 'g2', name: 'Warehouse Wednesday 2026 crew', members: ['marie', 'tasha', 'janice'], count: 31, reach: { app: 26, email: 4, none: 1 }, unread: 1, time: '1 hr ago', anns: [
    { id: 'b1', date: 'Tue, 4:00 PM', title: 'New sorting stations', body: 'We’ve moved shoes and accessories to the back room so suits have more space up front. Marie will walk everyone through it at 2.', reacts: R(4, 6, 18, 1), more: 6, mine: [], replies: [{ who: 'marie', when: 'Tue at 4:12 PM', text: 'Bring gloves if you have them!' }] },
  ]},
  { id: 'g3', name: 'Career coaching group for Q3', members: ['sophia', 'priya'], count: 9, reach: { app: 8, email: 1, none: 0 }, unread: 0, time: 'Yesterday', anns: [
    { id: 'c1a', date: 'Yesterday, 9:00 AM', title: 'Q3 coaching calendar is live', body: 'Lunch & Learns are the second Thursday of each month. Please pick at least one slot by Jun 20.', reacts: R(2, 1, 7, 0), more: 0, mine: [], replies: [] },
  ]},
  { id: 'g4', name: 'Morning volunteers', members: ['elena', 'rosaline'], count: 17, reach: { app: 13, email: 3, none: 1 }, unread: 0, time: 'Mon', anns: [
    { id: 'd1', date: 'Mon, 7:30 AM', title: 'Early doors on Saturdays', body: 'Doors open at 8:15 starting this week so we can set up before clients arrive.', reacts: R(3, 0, 9, 1), more: 2, mine: [], replies: [] },
  ]},
  { id: 'g5', name: 'Executives', members: ['dana', 'jimmy'], count: 6, reach: { app: 3, email: 3, none: 0 }, unread: 0, time: 'May 1', anns: [
    { id: 'e1', date: 'May 1, 5:00 PM', title: 'Q1 board packet', body: 'I’ll share the Q1 volunteer report before the June board meeting.', reacts: R(0, 0, 4, 0), more: 0, mine: [], replies: [] },
  ]},
  { id: 'g6', name: 'On-the-day leaders · May 30', members: ['tasha', 'priya', 'marcus'], count: 5, reach: { app: 3, email: 2, none: 0 }, unread: 0, time: 'May 18', anns: [
    { id: 'f1', date: 'May 18, 12:15 PM', title: 'Leader huddle at 11:00', body: 'Quick 15-minute huddle before doors open. We’ll go over the drop-off line and steaming stations.', reacts: R(1, 2, 4, 0), more: 0, mine: [], replies: [] },
  ]},
];

// Dashboard data
export const HOURS = {
  year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], values: [88, 132, 214, 215, 262], note: 'Hours have grown every month of 2026, with May the year’s high' },
  last: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: [71, 88, 120, 97, 110, 84, 101, 156, 92, 77, 143, 188], note: '2025 total: 1,327 hours — Jan–May 2026 is up 87% on the same months' },
  q1:   { labels: ['Jan', 'Feb', 'Mar'], values: [88, 132, 214], note: 'Hours more than doubled from January to March' },
};

export const SURVEY = [
  { event: 'Spring Suit Drive', n: 34 },
  { event: 'Mobile Services · Apr 29', n: 58 },
  { event: 'Fill-A-Bag · May 2', n: 33 },
  { event: 'Interview Practice · May 5', n: 41 },
  { event: 'Warehouse Wednesday · May 13', n: 82 },
];


// Event participation (volunteers, hours) — dashboard bar chart
export const PARTICIPATION = [
  { event: 'Boutique', vols: 74, hours: 486 },
  { event: 'Mobile Services', vols: 38, hours: 212 },
  { event: 'Warehouse Wednesday', vols: 12, hours: 38 },
  { event: 'Board Services', vols: 21, hours: 110 },
  { event: 'Black and Gold Gala', vols: 46, hours: 94 },
  { event: 'MHCI Lunch', vols: 18, hours: 137 },
];
export const PARTICIPATION_MORE = [
  { event: 'Spring Suit Drive', vols: 31, hours: 214 },
  { event: 'Career Closet Styling', vols: 14, hours: 96 },
  { event: 'Winter Coat Drive', vols: 22, hours: 158 },
  { event: 'Resume Lab', vols: 6, hours: 41 },
  { event: 'Shelter Outreach', vols: 13, hours: 102 },
];

// Grant commitments
export const GRANTS = [
  { name: 'Hillman Foundation', due: 'May 29', sub: '164 of 200 women served', pct: 82 },
  { name: 'PNC Foundation', due: 'Jun 12', sub: '986 of 1,200 match hours', pct: 82 },
  { name: 'Allegheny County DHS', due: 'Jun 30', sub: '64% placement rate · 60% target', pct: 100 },
  { name: 'Highmark Foundation', due: 'Jul 15', sub: '212 of 300 hours', pct: 71 },
];
export const GRANTS_MORE = [
  { name: 'Richard King Mellon Fdn.', due: 'Jul 31', sub: '38 of 60 career coaching sessions', pct: 63 },
  { name: 'The Heinz Endowments', due: 'Aug 14', sub: '3,420 of 4,000 suits distributed', pct: 86 },
  { name: 'McCune Foundation', due: 'Aug 31', sub: '12 of 20 new shelter partners', pct: 60 },
  { name: 'The Pittsburgh Foundation', due: 'Sep 15', sub: '90 of 150 Mobile Services visits', pct: 60 },
  { name: 'Eden Hall Foundation', due: 'Sep 30', sub: '41 of 50 board volunteers trained', pct: 82 },
  { name: 'FedEx Cares', due: 'Oct 15', sub: '18 of 40 corporate volunteer days', pct: 45 },
  { name: 'Dollar Bank Foundation', due: 'Nov 2', sub: '96 of 100 financial literacy hours', pct: 96 },
  { name: 'Giant Eagle Foundation', due: 'Nov 30', sub: '230 of 500 interview kits', pct: 46 },
];

export const LOCATIONS = [
  { name: 'Washington', hours: 742 },
  { name: 'Allegheny', hours: 276 },
  { name: 'Westmoreland', hours: 188 },
];

// Profile photos from Unsplash (hotlinked per Unsplash API guidelines; photographer credited in the UI)
export const PHOTOS = {
 "me": {
  "photo": "https://images.unsplash.com/photo-1710778044102-56a3a6b69a1b?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8MXx8YmxhY2slMjB3b21hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8Mnx8fDE3OTM1NzgxNzZ8MA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Abenezer Shewaga",
  "creditUrl": "https://unsplash.com/@abenezer_shewaga?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "sarah": {
  "photo": "https://images.unsplash.com/photo-1559563526-cff7656d1ae6?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8N3x8YWZyaWNhbiUyMHdvbWFuJTIwaGVhZHNob3QlMjBzbWlsaW5nfGVufDF8Mnx8fDE3OTM1NzgyNDh8MA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Terricks Noah",
  "creditUrl": "https://unsplash.com/@major001?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "sophia": {
  "photo": "https://images.unsplash.com/photo-1744599951577-a25a20ded3c4?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8M3x8Y2hpbmVzZSUyMHdvbWFuJTIwaGVhZHNob3QlMjBzbWlsaW5nfGVufDF8Mnx8fDE3OTM1NzgyMDB8MA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Phong Duong",
  "creditUrl": "https://unsplash.com/@phongduong?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "marie": {
  "photo": "https://images.unsplash.com/photo-1612041714878-997e3fe9cd13?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8MXx8d29tYW4lMjBwb3J0cmFpdCUyMHNtaWxpbmclMjBjdXJseSUyMGhhaXJ8ZW58MXwyfHx8MTc5MzU3ODE3N3ww&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Alexander Krivitskiy",
  "creditUrl": "https://unsplash.com/@krivitskiy?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "andre": {
  "photo": "https://images.unsplash.com/photo-1562124638-724e13052daf?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8MXx8bWFuJTIwcG9ydHJhaXQlMjBiZWFyZCUyMHNtaWxpbmd8ZW58MXwyfHx8MTc5MzU3ODE3OHww&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Christian Buehner",
  "creditUrl": "https://unsplash.com/@christianbuehner?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "priya": {
  "photo": "https://images.unsplash.com/photo-1789500381106-ba13068a6520?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8M3x8aW5kaWFuJTIwd29tYW4lMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MXwxfHx8MTc5MzU3ODI2N3ww&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Parimal Jain",
  "creditUrl": "https://unsplash.com/@parimaljain?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "tasha": {
  "photo": "https://images.unsplash.com/photo-1563076767-5cda445a4f9f?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8MXx8YmxhY2slMjB3b21hbiUyMHBvcnRyYWl0JTIwYnJhaWRzJTIwc21pbGluZ3xlbnwxfDJ8fHwxNzkzNTc4MTc5fDA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Alexandre Lecocq",
  "creditUrl": "https://unsplash.com/@mr_alexandre?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "elena": {
  "photo": "https://images.unsplash.com/photo-1783953777286-6b0f98ff647c?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8NXx8aGlzcGFuaWMlMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfDJ8fHwxNzkzNTc4MTk4fDA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Vidak",
  "creditUrl": "https://unsplash.com/@vidak?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "marcus": {
  "photo": "https://images.unsplash.com/photo-1612214070475-1e73f478188c?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8MXx8YmxhY2slMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfDJ8fHwxNzkzNTc4MTgwfDA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Kingsley Osei-Abrah",
  "creditUrl": "https://unsplash.com/@kingsleyoseiabrah?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "janice": {
  "photo": "https://images.unsplash.com/photo-1657830582172-b1eb2880f497?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8M3x8YXNpYW4lMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfDF8fHwxNzkzNTc4MjY4fDA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Condor Wei",
  "creditUrl": "https://unsplash.com/@cwcanchn?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "rosaline": {
  "photo": "https://images.unsplash.com/photo-1542305983-c4100e4b8cd2?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8MXx8a29yZWFuJTIwd29tYW4lMjBoZWFkc2hvdCUyMHNtaWxpbmd8ZW58MXwyfHx8MTc5MzU3ODE5OXww&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Kaung Minn Kent",
  "creditUrl": "https://unsplash.com/@kentology?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "jimmy": {
  "photo": "https://images.unsplash.com/photo-1720501828093-c792c10e3f0b?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8MXx8YXNpYW4lMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfDJ8fHwxNzkzNTc4MTgxfDA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Russell Barrientos",
  "creditUrl": "https://unsplash.com/@janruzel?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "maureen": {
  "photo": "https://images.unsplash.com/photo-1770058428154-9eee8a6a1fbb?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8NHx8bWlkZGxlJTIwYWdlZCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8MXx8fDE3OTM1ODAyMTZ8MA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Beatriz Cattel",
  "creditUrl": "https://unsplash.com/@bicattel?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 },
 "dana": {
  "photo": "https://images.unsplash.com/photo-1665062173657-3912ae7991e0?ixid=M3wxMTIwNTY2fDB8MXxzZWFyY2h8MXx8b2xkZXIlMjB3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfDF8fHwxNzkzNTc4MjY4fDA&ixlib=rb-4.1.0&w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  "credit": "Daniel Lara",
  "creditUrl": "https://unsplash.com/@overfly?utm_source=dfs_volunteer_prototype&utm_medium=referral"
 }
};
Object.entries(PHOTOS).forEach(([id, p]) => Object.assign(id === 'me' ? ME : VOLS[id], p));
