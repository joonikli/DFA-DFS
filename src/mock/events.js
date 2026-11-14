// Mock volunteer events. Hand-authored (not random) so every demo is identical.
// Program names, copy and tags follow the Figma "Final Designs" section.

const REDMOND = '8374 Redmond Rd, Pittsburgh, PA'
const BOUTIQUE = '1100 Smallman St, Pittsburgh, PA'

// tone → tag color: blue | pink | lime | yellow
const programs = {
  mobileServices: {
    title: 'Mobile Services',
    location: 'Multiple pickup points',
    description: 'Organize suits and other professional attire, help with handing out and tracking clothes.',
    tags: [['no requirements', 'blue']],
  },
  resumeReview: {
    title: 'Resume Review',
    location: REDMOND,
    description:
      'Help with reviewing resumes for women looking to enter STEM fields, or assist in the background with basic setup/takedown.',
    tags: [['any language', 'pink'], ['english', 'pink'], ['spanish', 'pink']],
  },
  warehouseWednesday: {
    title: 'Warehouse Wednesday',
    location: REDMOND,
    description: 'Sort, tag and shelve donated workwear in the warehouse. Sign up for a minimum of 1/5 shifts.',
    tags: [['heavy lifting', 'pink']],
  },
  clothingDistribution: {
    title: 'Clothing Distribution',
    location: REDMOND,
    description: 'Organize suits and other professional attire, help with handing out and tracking clothes.',
    tags: [['no requirements', 'blue']],
  },
  mobileShop: {
    title: 'Mobile Shop',
    location: 'Miscellaneous driving points',
    description: 'Staff the mobile boutique as it visits partner sites around Allegheny County.',
    tags: [["driver's license", 'pink'], ['any language', 'pink']],
  },
  careerClosetPrep: {
    title: 'Career Closet Prep',
    location: 'Community clothing center',
    description: 'Sort donated workwear and assemble interview-ready outfits for women starting new careers.',
    tags: [['workwear', 'pink'], ['interview prep', 'pink'], ['no experience', 'pink']],
  },
  interviewPractice: {
    title: 'Interview Practice',
    location: 'Community career center',
    description: 'Help women build confidence through mock interviews, practice questions, and supportive feedback.',
    tags: [['interviews', 'pink'], ['mentoring', 'pink'], ['career', 'pink']],
  },
  resumeCoaching: {
    title: 'Resume Coaching',
    location: 'Community Career Center',
    description:
      'Coach women and underrepresented job seekers on highlighting their skills and tailoring resumes to job openings.',
    tags: [['resumes', 'blue'], ['coaching', 'blue'], ['writing skills', 'blue']],
  },
  jobApplicationClinic: {
    title: 'Job Application Clinic',
    location: 'Employment Resource Center',
    description:
      'Help women and underrepresented job seekers find openings, complete online applications, and draft cover letters.',
    tags: [['applications', 'pink'], ['digital skills', 'pink'], ['cover letters', 'pink']],
  },
  boutique: {
    title: 'Boutique',
    location: BOUTIQUE,
    description: 'Style clients one-on-one for interviews and their first weeks on the job.',
    tags: [['styling', 'pink'], ['no experience', 'pink']],
  },
  fillABag: {
    title: 'Fill-A-Bag',
    location: 'Dress for Success Pittsburgh, 1100 Smallman St',
    description: 'Help pack essential items for those in need and make a difference in the Pittsburgh community.',
    tags: [['no requirements', 'blue'], ['packing', 'pink']],
  },
  mhciLunch: {
    title: 'MHCI Lunch',
    location: 'Carnegie Mellon University, Newell-Simon Hall',
    description: 'Pack and serve lunch for clients attending the career workshop series.',
    tags: [['no requirements', 'blue']],
  },
}

// [id, program, 'YYYY-MM-DD', startHour, endHour, extras]
// Hours use 24h decimals (17.5 = 5:30 pm).
const schedule = [
  // ---- past ----
  ['e01', 'boutique', '2026-04-08', 10, 13],
  ['e02', 'warehouseWednesday', '2026-04-15', 14, 17],
  ['e03', 'resumeCoaching', '2026-04-22', 9, 13],
  ['e04', 'mobileServices', '2026-04-29', 14, 17],
  ['e05', 'fillABag', '2026-05-02', 10, 14],
  ['e06', 'interviewPractice', '2026-05-05', 17.5, 19.5],
  ['e07', 'careerClosetPrep', '2026-05-08', 10, 13],
  ['e08', 'resumeCoaching', '2026-05-12', 9, 13],
  ['e09', 'warehouseWednesday', '2026-05-13', 14, 17],
  ['e10', 'jobApplicationClinic', '2026-05-16', 10, 14],
  // ---- upcoming ----
  ['e11', 'resumeReview', '2026-05-22', 18, 20, { recommended: true }],
  ['e12', 'mobileServices', '2026-05-26', 14, 17],
  ['e13', 'warehouseWednesday', '2026-05-27', 14, 17],
  ['e14', 'boutique', '2026-05-28', 10, 13, { recommended: true }],
  ['e15', 'clothingDistribution', '2026-05-30', 11.5, 16],
  ['e16', 'mobileShop', '2026-06-02', 18, 20],
  ['e17', 'warehouseWednesday', '2026-06-03', 14, 17],
  ['e18', 'mhciLunch', '2026-06-05', 11, 13],
  ['e19', 'resumeCoaching', '2026-06-09', 9, 13],
  ['e20', 'warehouseWednesday', '2026-06-10', 14, 17],
  ['e21', 'careerClosetPrep', '2026-06-12', 10, 13],
  ['e22', 'jobApplicationClinic', '2026-06-16', 10, 14],
  ['e23', 'interviewPractice', '2026-06-18', 18, 20, { recommended: true }],
  ['e24', 'boutique', '2026-06-20', 10, 13],
  ['e25', 'warehouseWednesday', '2026-06-24', 14, 17],
  ['e26', 'mobileShop', '2026-06-27', 9, 12],
  ['e27', 'warehouseWednesday', '2026-07-01', 14, 17],
  ['e28', 'resumeReview', '2026-07-07', 18, 20],
  ['e29', 'clothingDistribution', '2026-07-11', 11.5, 16],
  ['e30', 'mobileServices', '2026-07-14', 14, 17],
]

const distances = ['0.5 mi', '1.2 mi', '0.8 mi', '2.4 mi', '3.1 mi']

function at(dateStr, hour) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const h = Math.floor(hour)
  return new Date(y, m - 1, d, h, Math.round((hour - h) * 60))
}

export const events = schedule.map(([id, key, date, start, end, extras = {}], i) => {
  const p = programs[key]
  return {
    id,
    program: key,
    title: p.title,
    location: p.location,
    distance: `${distances[i % distances.length]} from you`,
    description: p.description,
    tags: p.tags.map(([label, tone]) => ({ label, tone })),
    start: at(date, start),
    end: at(date, end),
    recommended: false,
    ...extras,
  }
})

export const eventsById = Object.fromEntries(events.map((e) => [e.id, e]))

// Maureen's (the volunteer persona's) starting state.
export const initialVolunteerState = {
  saved: ['e12', 'e21', 'e23'],
  registered: ['e12', 'e14', 'e20', 'e24'],
  attended: ['e01', 'e02', 'e03', 'e05', 'e06', 'e07', 'e08'],
}

// Activity from before the events listed above (last season), so lifetime
// stats on the dashboard/profile look like a returning volunteer's.
export const volunteerHistory = {
  hoursBefore: 36,
  eventsBefore: 7,
  missedEvents: 1,
  attendanceRateLastMonth: 88,
}

// Surveys Maureen already submitted (eventId → answers).
export const initialSurveyResponses = {
  e01: { rating: { answer: 5 }, feedback: { answer: 'Loved styling clients — the new racks made it much easier.' } },
  e02: { rating: { answer: 4 }, feedback: { answer: 'More box cutters would help the sorting station.' } },
  e03: { rating: { answer: 5 }, feedback: { answer: '' } },
  e06: { rating: { answer: 4 }, feedback: { answer: 'Great turnout. A printed question list would help new volunteers.' } },
}
