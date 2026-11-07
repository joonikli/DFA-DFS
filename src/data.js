// Mock data for the prototype. Everything is in memory and resets on reload.
// Components mutate these objects and call emit() from store.js to re-render.
// Made-up data for the prototype. Everything lives in memory and resets on reload.

export const ME = { first: 'Bridget', name: 'Bridget Okafor' };

export const VOLS = {
  sarah:   { name: 'Sarah Nkemelu', role: 'Volunteer for Mobile Services', kind: 'Individual', loc: 'Washington, PA', email: 'sarah.nkemelu@gmail.com', phone: '412-555-0148', tags: ['heavy lifting', 'spanish'], notes: 'Prefers weekend events. Good with the check-in table. Has helped at the Washington location multiple times.', upcoming: ['ms12', 'ww16', 'hs19'], hours: 46 },
  sophia:  { name: 'Sophia Chen', role: 'Career coach', kind: 'Individual', loc: 'Shadyside, Pittsburgh', email: 'sophia.chen@outlook.com', phone: '412-555-0193', tags: ['career coaching', 'mandarin'], notes: 'Former HR lead at UPMC. Great at mock interviews — pair her with first-time clients.', upcoming: ['cc7', 'ml14'], hours: 38 },
  marie:   { name: 'Marie James', role: 'Warehouse lead', kind: 'Individual', loc: 'Mt. Lebanon, PA', email: 'mariejames@gmail.com', phone: '412-555-0112', tags: ['heavy lifting', 'team lead'], notes: 'Runs the Warehouse Wednesday sorting stations. Has a truck for large pickups.', upcoming: ['ww9', 'ww16'], hours: 61 },
  andre:   { name: 'Andre Dupont', role: 'Mobile Services driver', kind: 'Individual', loc: 'Bloomfield, Pittsburgh', email: 'andre.dupont@gmail.com', phone: '412-555-0177', tags: ['driver', 'french'], notes: 'Licensed to drive the styling van. Available Saturdays only.', upcoming: ['ms12', 'hs19'], hours: 29 },
  priya:   { name: 'Priya Raman', role: 'Stylist', kind: 'Individual', loc: 'Squirrel Hill, Pittsburgh', email: 'priya.raman@gmail.com', phone: '412-555-0130', tags: ['styling', 'tamil'], notes: 'Trained stylist; leads fittings at the Homestead boutique.', upcoming: ['hs19', 'cc7'], hours: 33 },
  tasha:   { name: 'Tasha Greene', role: 'On-the-day leader', kind: 'Individual', loc: 'East Liberty, Pittsburgh', email: 'tasha.greene@yahoo.com', phone: '412-555-0164', tags: ['team lead', 'any language'], notes: 'Very reliable opener. Has keys to the Redmond Rd warehouse.', upcoming: ['ww9', 'hs19'], hours: 52 },
  elena:   { name: 'Elena Vargas', role: 'Intake & translation', kind: 'Individual', loc: 'Beechview, Pittsburgh', email: 'elena.vargas@gmail.com', phone: '412-555-0121', tags: ['spanish', 'intake'], notes: 'Translates intake forms for Spanish-speaking clients.', upcoming: ['ms12'], hours: 24 },
  marcus:  { name: 'Marcus Bell', role: 'Corporate partner lead', kind: 'Group', loc: 'PNC Bank volunteer team', email: 'marcus.bell@pnc.com', phone: '412-555-0105', tags: ['group', 'corporate'], notes: 'Coordinates a 12-person PNC team for the Holiday Suit Drive.', upcoming: ['hs19'], hours: 18 },
  janice:  { name: 'Janice Yu', role: 'Volunteer for Mobile Services', kind: 'Individual', loc: 'Oakland, Pittsburgh', email: 'janice.yu@gmail.com', phone: '412-555-0186', tags: ['styling'], notes: 'Pitt grad student, flexible weekday evenings.', upcoming: ['ww9', 'ms12'], hours: 15 },
  rosaline:{ name: 'Rosaline Jo', role: 'Volunteer for Mobile Services', kind: 'Individual', loc: 'Lawrenceville, Pittsburgh', email: 'rosaline.jo@gmail.com', phone: '412-555-0158', tags: ['korean', 'intake'], notes: 'Great with nervous first-time clients.', upcoming: ['ms12', 'cc7'], hours: 21 },
  jimmy:   { name: 'Jimmy Wang', role: 'Program coordinator', kind: 'Staff', loc: 'Downtown Career Center', email: 'jimmy.wang@dfspgh.org', phone: '412-555-0100', tags: ['staff'], notes: 'Staff coordinator for Mobile Services.', upcoming: [], hours: 0 },
  maureen: { name: 'Maureen Kelly', role: 'Volunteer for Mobile Services & Warehouse Wednesday', kind: 'Individual', loc: 'Brookline, Pittsburgh', email: 'maureen.kelly@gmail.com', phone: '412-555-0171', tags: ['styling', 'any language'], notes: 'Signed up in March. Prefers evening and Saturday shifts.', upcoming: ['ms12', 'ww16', 'cc7'], hours: 60 },
  dana:    { name: 'Dana Whitfield', role: 'Board liaison', kind: 'Individual', loc: 'Fox Chapel, PA', email: 'dana.whitfield@gmail.com', phone: '412-555-0142', tags: ['board'], notes: 'Board member who volunteers at the Holiday Suit Drive every year.', upcoming: ['hs19'], hours: 12 },
};

export const SHIFTS = {
  ww9:  { mon: 'Dec', day: 9,  time: '6:00–8:00 PM', addr: '8374 Redmond Rd, Pittsburgh, PA', title: 'Warehouse Wednesday', desc: 'Sort and tag donated suits for the January career fair. Sign up for at least 1 of 5 shifts.', roles: 'Greeter, Room Manager, Suit Sorter', tags: ['any language', 'heavy lifting'], filled: 14, cap: 20, vols: ['marie', 'tasha', 'janice'] },
  ms12: { mon: 'Dec', day: 12, time: '9:00 AM–1:00 PM', addr: 'Downtown Career Center, 900 Penn Ave', title: 'Mobile Services Route', desc: 'Take the styling van to three partner shelters for on-site fittings.', roles: 'Driver, Stylist, Intake', tags: ['driver', 'spanish'], filled: 6, cap: 8, vols: ['sarah', 'andre', 'elena', 'janice', 'rosaline'] },
  ww16: { mon: 'Dec', day: 16, time: '6:00–8:00 PM', addr: '8374 Redmond Rd, Pittsburgh, PA', title: 'Warehouse Wednesday', desc: 'Final sort before the holiday break — accessories and shoes.', roles: 'Greeter, Room Manager, Suit Sorter', tags: ['any language'], filled: 9, cap: 20, vols: ['sarah', 'marie'] },
  hs19: { mon: 'Dec', day: 19, time: '10:00 AM–3:00 PM', addr: 'Homestead Boutique, 125 E 8th Ave', title: 'Holiday Suit Drive', desc: 'Collect, steam and rack holiday donations; staff the drop-off line.', roles: 'Greeter, Steamer, Rack Runner', tags: ['any language', 'group friendly'], filled: 11, cap: 24, vols: ['sarah', 'andre', 'priya', 'tasha', 'marcus', 'dana'] },
  cc7:  { mon: 'Jan', day: 7,  time: '5:30–7:30 PM', addr: 'Homestead Boutique, 125 E 8th Ave', title: 'Career Closet Styling', desc: 'One-on-one styling appointments for women starting new jobs.', roles: 'Stylist, Greeter', tags: ['styling'], filled: 3, cap: 10, vols: ['sophia', 'priya', 'rosaline'] },
  b10:  { mon: 'Dec', day: 10, time: '5:30–7:30 PM', addr: 'Homestead Boutique, 125 E 8th Ave', title: 'Boutique Fittings', desc: 'Evening fittings for clients starting new jobs in January.', roles: 'Stylist, Greeter', tags: ['styling'], filled: 7, cap: 8, vols: ['priya', 'janice'] },
  bs15: { mon: 'Dec', day: 15, time: '6:00–7:30 PM', addr: 'Downtown Career Center, 900 Penn Ave', title: 'Board Services Orientation', desc: 'Orientation for new board-service volunteers.', roles: 'Host, Note taker', tags: ['board'], filled: 4, cap: 6, vols: ['dana'] },
  b22:  { mon: 'Dec', day: 22, time: '10:00 AM–1:00 PM', addr: 'Homestead Boutique, 125 E 8th Ave', title: 'Boutique Restock', desc: 'Restock racks with holiday drive donations.', roles: 'Rack Runner, Steamer', tags: ['any language'], filled: 2, cap: 10, vols: ['tasha'] },
  ml14: { mon: 'Jan', day: 14, time: '12:00–1:30 PM', addr: 'Downtown Career Center, 900 Penn Ave', title: 'MHCI Lunch & Learn', desc: 'Lead a resume table at the monthly lunch session.', roles: 'Coach, Note taker', tags: ['career coaching'], filled: 5, cap: 6, vols: ['sophia'] },
};

export const PAST_SHIFTS = [
  { mon: 'Nov', day: 21, title: 'Mobile Services Route', time: '9:00 AM–1:00 PM' },
  { mon: 'Nov', day: 18, title: 'Warehouse Wednesday', time: '6:00–8:00 PM' },
  { mon: 'Nov', day: 7,  title: 'MHCI Lunch & Learn', time: '12:00–1:30 PM' },
  { mon: 'Oct', day: 24, title: 'Fall Suit Drive', time: '10:00 AM–3:00 PM' },
];

// Direct conversations ("Message" tab)
export const CONVOS = [
  { id: 'c1', who: ['sarah'], unread: 0, time: '2 min ago', channel: 'inapp', msgs: [
    { from: 'them', text: 'Hi Bridget — any chance I can switch from the Wednesday sort to Saturday’s Mobile route?', time: 'Yesterday 4:12 PM' },
    { from: 'me', text: 'Of course! I’ll move you over — Andre is driving, so you’d be on intake with Elena.', time: '4:20 PM' },
    { type: 'divider', text: 'Today' },
    { from: 'them', text: 'Hi Bridget — is the Saturday shift still starting at 9?', time: '11:02' },
    { from: 'me', text: 'Yes, 9am sharp. I’ve attached the shift so you can add it to your calendar.', time: '11:04', reacts: { '🙏': ['sarah'] } },
    { from: 'me', type: 'shift', shift: 'ms12', time: '11:05' },
  ]},
  { id: 'c2', who: ['sophia'], unread: 1, time: '18 min ago', channel: 'inapp', msgs: [
    { from: 'me', text: 'Thanks again for running the mock interviews last week — clients loved it.', time: 'Mon 3:40 PM' },
    { from: 'them', text: 'Thanks for bringing me in! Could I take two more slots at the January Career Closet?', time: '10:46' },
  ]},
  { id: 'c3', who: ['marie'], unread: 0, time: '1 hr ago', channel: 'inapp', msgs: [
    { from: 'them', text: 'Truck is free Wednesday if we need to pick up the Highmark donation.', time: '9:15', reacts: { '💞': ['me'] } },
    { from: 'me', text: 'Yes please! They have ~40 suits boxed at the front desk.', time: '9:31' },
    { from: 'them', text: 'Perfect, I’ll swing by at 5 and bring them to Redmond Rd.', time: '9:33' },
  ]},
  { id: 'c4', who: ['priya', 'tasha'], unread: 3, time: '3 hr ago', channel: 'inapp', name: 'Holiday Suit Drive leads', msgs: [
    { from: 'priya', text: 'Do we have enough steamers for the 19th? Last year we had a line.', time: '8:02', replies: [
      { who: 'tasha', when: '8:20', text: 'Checked the supply closet — we have three. I’ll bring two more from home.' },
      { who: 'me', when: '8:31', text: 'Perfect. I’ll pick up the closet ones from Redmond Rd on Friday.' },
    ] },
    { from: 'tasha', text: 'I can bring two from home. Should we split the drop-off line into sizes?', time: '8:10', reacts: { '🙌': ['priya', 'me'], '👍': ['priya'] } },
    { from: 'priya', text: 'Love that. I’ll make signs.', time: '8:12' },
  ]},
  { id: 'c5', who: ['marcus'], unread: 0, time: 'Yesterday', channel: 'email', msgs: [
    { from: 'them', type: 'email', subject: 'PNC team — Holiday Suit Drive', text: 'Hi Bridget,\n\nWe have 12 confirmed for the 19th. Is there parking for a sprinter van?\n\nThanks,\nMarcus', time: 'Yesterday 2:18 PM' },
    { from: 'me', type: 'email', subject: 'Re: PNC team — Holiday Suit Drive', text: 'Hi Marcus — yes, there’s a loading zone on E 8th Ave. I’ll send a parking map Friday.', time: 'Yesterday 3:02 PM' },
  ]},
  { id: 'c6', who: ['elena'], unread: 0, time: 'Mon', channel: 'inapp', msgs: [
    { from: 'them', text: 'I translated the new intake form into Spanish — sending it over now.', time: 'Mon 1:20 PM' },
    { from: 'me', text: 'You’re a star. I’ll print 50 for Saturday.', time: 'Mon 1:45 PM' },
  ]},
  { id: 'c7', who: ['andre'], unread: 0, time: 'Sun', channel: 'inapp', msgs: [
    { from: 'them', text: 'Van needs gas before Saturday — should I use the org card?', time: 'Sun 6:05 PM' },
    { from: 'me', text: 'Yes, keep the receipt in the glovebox envelope. Thanks Andre!', time: 'Sun 7:12 PM' },
  ]},
  { id: 'c8', who: ['janice'], unread: 1, time: 'Dec 2', channel: 'inapp', msgs: [
    { from: 'them', text: 'Thanks for bringing snacks to the warehouse shift, that was so nice.', time: 'Dec 2' },
  ]},
];

export const R = (a, b, c, d) => ({ '😄': a, '💞': b, '👍': c, '😎': d });

// Announcement groups ("Announcements" tab)
export const GROUPS = [
  { id: 'g1', name: 'Mobile Services volunteers', members: ['sarah', 'andre', 'elena', 'janice', 'rosaline'], count: 23, unread: 2, time: '2 min ago', anns: [
    { id: 'a1', seen: 21, date: 'Mon, 8:10 AM', title: 'Warehouse Wednesday: January sign-ups', body: 'Hi all — January Warehouse Wednesday shifts are open. We sort and tag donated suits from 6:00 to 8:00 PM at Redmond Rd. Grab a spot while there’s room.', reacts: R(12, 9, 21, 4), more: 41, mine: [], replies: [
      { who: 'rosaline', when: 'Mon at 9:02 AM', text: 'Signed up for the 7th!' },
      { who: 'janice', when: 'Mon at 11:40 AM', text: 'Can I bring a friend who hasn’t registered yet?' },
    ]},
    { id: 'a2', seen: 19, date: 'Friday, 6:20 PM', title: 'Dec 12 Mobile Services: arrival & parking', body: 'Hi all — thanks for signing up for Saturday’s Mobile Services route. We start at 9:00 sharp at the Downtown Career Center; use the side entrance on Sixth Avenue.\n\nStreet parking on Sixth is free on weekends. Wear comfortable shoes — coffee and everything else is on us.', reacts: R(12, 12, 12, 12), more: 59, mine: ['👍'], replies: [
      { who: 'rosaline', when: 'Fri at 6:32 PM', text: 'Cool! Got it!' },
      { who: 'janice', when: 'Fri at 6:41 PM', text: 'Sorry, I might be a bit late to the event, but let me know if you need help afterwards!' },
    ]},
    { id: 'a3', seen: 14, date: 'Today, 10:30 AM', title: 'Saturday shift reminder', body: 'Saturday’s Mobile Services route starts at 9am at the Downtown Career Center. Park on Sixth and come in the side entrance — I’ll be there from 8:30 if you need anything.', reacts: R(5, 3, 14, 2), more: 8, mine: [], replies: [] },
  ]},
  { id: 'g2', name: 'Warehouse Wednesday 2026 crew', members: ['marie', 'tasha', 'janice'], count: 31, unread: 1, time: '1 hr ago', anns: [
    { id: 'b1', date: 'Tue, 4:00 PM', title: 'New sorting stations', body: 'We’ve moved shoes and accessories to the back room so suits have more space up front. Marie will walk everyone through it at 6.', reacts: R(4, 6, 18, 1), more: 6, mine: [], replies: [{ who: 'marie', when: 'Tue at 4:12 PM', text: 'Bring gloves if you have them!' }] },
  ]},
  { id: 'g3', name: 'Career coaching group for Q1', members: ['sophia', 'priya'], count: 9, unread: 0, time: 'Yesterday', anns: [
    { id: 'c1a', date: 'Yesterday, 9:00 AM', title: 'Q1 coaching calendar is live', body: 'Lunch & Learns are the second Thursday of each month. Please pick at least one slot by Dec 20.', reacts: R(2, 1, 7, 0), more: 0, mine: [], replies: [] },
  ]},
  { id: 'g4', name: 'Morning volunteers', members: ['elena', 'rosaline'], count: 17, unread: 0, time: 'Mon', anns: [
    { id: 'd1', date: 'Mon, 7:30 AM', title: 'Early doors on Saturdays', body: 'Doors open at 8:15 starting this week so we can set up before clients arrive.', reacts: R(3, 0, 9, 1), more: 2, mine: [], replies: [] },
  ]},
  { id: 'g5', name: 'Executives', members: ['dana', 'jimmy'], count: 6, unread: 0, time: 'Dec 1', anns: [
    { id: 'e1', date: 'Dec 1, 5:00 PM', title: 'Q4 board packet', body: 'I’ll share the Q4 volunteer report before the January board meeting.', reacts: R(0, 0, 4, 0), more: 0, mine: [], replies: [] },
  ]},
  { id: 'g6', name: 'On-the-day leaders · Dec 19', members: ['tasha', 'priya', 'marcus'], count: 5, unread: 0, time: 'Nov 30', anns: [
    { id: 'f1', date: 'Nov 30, 12:15 PM', title: 'Leader huddle at 9:30', body: 'Quick 15-minute huddle before doors open. We’ll go over the drop-off line and steaming stations.', reacts: R(1, 2, 4, 0), more: 0, mine: [], replies: [] },
  ]},
];

// Dashboard data
export const HOURS = {
  year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: [96, 132, 205, 148, 171, 122, 168, 231, 104, 88, 214, 262], note: 'Twelve straight months of logged hours, ending on the year’s high' },
  last: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: [71, 88, 120, 97, 110, 84, 101, 156, 92, 77, 143, 188], note: '2025 total: 1,327 hours — 2026 is up 46%' },
  q4:   { labels: ['Oct', 'Nov', 'Dec'], values: [88, 214, 262], note: 'Hours tripled from October to December' },
};

export const SURVEY = [
  { event: 'Fall Suit Drive', n: 34 },
  { event: 'Mobile Services · Nov 7', n: 58 },
  { event: 'Warehouse Wednesday · Nov 18', n: 33 },
  { event: 'MHCI Lunch & Learn', n: 41 },
  { event: 'Mobile Services · Nov 21', n: 82 },
];

// Dates for calendar placement (shift id -> ISO date)
export const SHIFT_DATES = { ww9: '2026-12-09', b10: '2026-12-10', ms12: '2026-12-12', bs15: '2026-12-15', ww16: '2026-12-16', hs19: '2026-12-19', b22: '2026-12-22', cc7: '2027-01-07', ml14: '2027-01-14' };
export const TODAY = '2026-12-08';

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
  { event: 'Holiday Suit Drive', vols: 31, hours: 214 },
  { event: 'Career Closet Styling', vols: 14, hours: 96 },
  { event: 'Fall Suit Drive', vols: 22, hours: 158 },
  { event: 'Resume Lab', vols: 6, hours: 41 },
  { event: 'Shelter Outreach', vols: 13, hours: 102 },
];

// Grant commitments
export const GRANTS = [
  { name: 'Hillman Foundation', due: 'Dec 12', sub: '164 of 200 women served', pct: 82 },
  { name: 'PNC Foundation', due: 'Dec 30', sub: '986 of 1,200 match hours', pct: 82 },
  { name: 'Allegheny County DHS', due: 'Jan 18', sub: '64% placement rate · 60% target', pct: 100 },
  { name: 'Highmark Foundation', due: 'Feb 6', sub: '212 of 300 hours', pct: 71 },
];
export const GRANTS_MORE = [
  { name: 'Richard King Mellon Fdn.', due: 'Feb 20', sub: '38 of 60 career coaching sessions', pct: 63 },
  { name: 'The Heinz Endowments', due: 'Mar 1', sub: '3,420 of 4,000 suits distributed', pct: 86 },
  { name: 'McCune Foundation', due: 'Mar 15', sub: '12 of 20 new shelter partners', pct: 60 },
  { name: 'The Pittsburgh Foundation', due: 'Apr 2', sub: '90 of 150 Mobile Services visits', pct: 60 },
  { name: 'Eden Hall Foundation', due: 'Apr 30', sub: '41 of 50 board volunteers trained', pct: 82 },
  { name: 'FedEx Cares', due: 'May 12', sub: '18 of 40 corporate volunteer days', pct: 45 },
  { name: 'Dollar Bank Foundation', due: 'Jun 1', sub: '96 of 100 financial literacy hours', pct: 96 },
  { name: 'Giant Eagle Foundation', due: 'Jun 30', sub: '230 of 500 interview kits', pct: 46 },
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
