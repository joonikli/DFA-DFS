// Admin "Survey responses" data (Figma: Final › Survey, section 2324:45889).
// Every survey is tied to a past event from src/mock/adminEvents.js.
import { adminEvents } from './adminEvents.js'
import { TODAY } from './today.js'
import { daysBetween } from '../lib/dates.js'

const CHOICE_QS = [
  {
    prompt: 'How sufficient did you find our clothing selection?',
    options: ['Very sufficient', 'Somewhat sufficient', 'Not very sufficient', 'Not at all sufficient'],
  },
  {
    prompt: 'How did you hear about this event?',
    options: ['Social media', 'Word of mouth', 'Posters/ads', 'Website', 'Other (specify)'],
  },
  {
    prompt: 'How likely are you to volunteer with us again?',
    options: ['Very likely', 'Likely', 'Unsure', 'Unlikely'],
  },
  {
    prompt: 'How well organized was the event?',
    options: ['Extremely well', 'Well', 'Somewhat', 'Not well'],
  },
]

const TEXT_QS = [
  'Did our stylists listen to your needs, preferences, and personal style?',
  'What was the most rewarding part of your shift?',
  'Is there anything we should change for next time?',
]

const TEXT_ANSWERS = [
  'I told her I’m not comfortable in anything fitted around my arms, and she never made me feel awkward about it. We found a blazer that fit well and still looked polished.',
  'I was nervous and didn’t know what I wanted, but my stylist asked gentle questions and gave me options. She let me make the final choices, which made me feel in control.',
  'I’ve never had someone take the time to help me find clothes that matched my personality. She complimented my style and helped me add a scarf and jewelry that felt like me.',
  'Check-in took a while — a second table at the door would help.',
  'Seeing a client light up when she tried on her interview suit. That’s why I keep coming back.',
  'More size-inclusive options in the 14–20 range would make a big difference.',
  'The volunteer lead was fantastic at keeping everyone on task without rushing anyone.',
  'Clear signage for the sorting stations would save time on busy days.',
  'Loved the team. Snacks for longer shifts would be a nice touch!',
]

const ORGANIZERS = ['Kelly Trow', 'Anna Claire', 'Kyla Brooks']
const COUNTIES = ['Allegheny County', 'Washington County', 'Westmoreland County']

/** deterministic pseudo-random integer in [0, n) */
const rnd = (seed, n) => Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % n | 0

// 6 questions: choice, text, choice, choice, text, choice
function buildQuestions(seed, responses) {
  const qs = []
  for (let i = 0; i < 6; i++) {
    if (i === 1 || i === 4) {
      const prompt = TEXT_QS[(seed + i) % TEXT_QS.length]
      const answers = Array.from({ length: Math.min(responses, 6) }, (_, k) => TEXT_ANSWERS[(seed + k * 2 + i) % TEXT_ANSWERS.length])
      qs.push({ id: `q${i + 1}`, type: 'text', prompt, answers })
    } else {
      const base = CHOICE_QS[(seed + i) % CHOICE_QS.length]
      // split `responses` across options with a skew toward the first options
      const weights = base.options.map((_, k) => 1 + rnd(seed * 7 + i * 13 + k, 6) + (k === 0 ? 3 : 0))
      const total = weights.reduce((a, b) => a + b, 0)
      let left = responses
      const counts = weights.map((w, k) => {
        const c = k === weights.length - 1 ? left : Math.round((w / total) * responses)
        left -= c
        return Math.max(0, c)
      })
      qs.push({ id: `q${i + 1}`, type: 'choice', prompt: base.prompt, options: base.options, counts })
    }
  }
  return qs
}

// Fill-A-Bag (e05) mirrors the Figma "Survey specific" frame exactly.
const fillABagQuestions = [
  {
    id: 'q1',
    type: 'choice',
    prompt: 'How sufficient did you find our clothing selection?',
    options: ['Very sufficient', 'Somewhat sufficient', 'Not very sufficient', 'Not at all sufficient'],
    counts: [7, 9, 10, 4],
  },
  { id: 'q2', type: 'text', prompt: 'Did our stylists listen to your needs, preferences, and personal style?', answers: TEXT_ANSWERS.slice(0, 6) },
  {
    id: 'q3',
    type: 'choice',
    prompt: 'How did you hear about the Fill-A-Bag event?',
    options: ['Social media', 'Word of mouth', 'Posters/ads', 'Website', 'Other (specify)'],
    counts: [23, 14, 5, 6, 7],
  },
]

const past = adminEvents.filter((e) => e.start < TODAY)

// 3 surveys this week + 24 over the past month, recycling past events.
export const adminSurveys = Array.from({ length: 27 }, (_, i) => {
  const fab = i === 0 // first card = the Fill-A-Bag survey from the Figma frame
  const e = fab ? past.find((p) => p.id === 'e05') : past[(i * 3) % past.length]
  const responses = fab ? 30 : 12 + rnd(i + 3, 40)
  // spread dates: first 3 within the last week, rest over the previous month
  const date = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - (i < 3 ? 1 + i * 2 : 8 + (i - 3)), e.start.getHours(), e.start.getMinutes())
  const end = new Date(date.getTime() + (e.end - e.start))
  return {
    id: `s${String(i + 1).padStart(2, '0')}`,
    eventId: e.id,
    title: fab ? 'Fill-A-Bag Event' : `${e.name}`,
    description: fab ? 'Help pack essential items for those in need and make a difference in the Pittsburgh community today!' : e.description,
    status: i % 5 === 1 ? 'closed' : 'open',
    organizer: ORGANIZERS[i % ORGANIZERS.length],
    county: COUNTIES[i % COUNTIES.length],
    tags: e.tags,
    start: date,
    end,
    responses,
    questions: fab ? fillABagQuestions : buildQuestions(i + 1, responses),
  }
})

export const adminSurveysById = Object.fromEntries(adminSurveys.map((s) => [s.id, s]))

export const surveyBucket = (s) => (daysBetween(s.start, TODAY) <= 7 ? 'week' : 'month')

// "AI summary" card (expanded summary frame 2324:46080)
export const aiSummary = {
  period: 'Past week',
  text: 'In our recent survey, volunteers at Dress for Success reported a 95% satisfaction rate with the in-person mobile services. Many expressed appreciation for the opportunity to empower women in their career journeys. Additionally, 80% of respondents indicated they felt more connected to the community after participating in these events.',
  averageScore: 7.45,
  averageDelta: '+2 from last week',
  positive: { value: 74, delta: '+2% from last week' },
  negative: { value: 26, delta: '-4% from last week' },
  responseRate: [
    { month: 'JULY', value: 58 },
    { month: 'AUG', value: 54 },
    { month: 'SEP', value: 70 },
    { month: 'OCT', value: 76 },
    { month: 'NOV', value: 68 },
    { month: 'DEC', value: 84 },
  ],
  responseRateDelta: '12% increase since last month',
  suggestions: [
    'Enhance networking opportunities by inviting industry professionals to share insights.',
    'Provide tailored workshops focusing on resume building and interview skills.',
    'Implement mentorship programs pairing participants with experienced women in their fields.',
  ],
  strengths: [
    'Continue fostering leadership skills through interactive training sessions.',
    'Keep expanding on partnerships with local businesses for job placements.',
    'Continue to launch a clothing drive to support women entering the workforce.',
  ],
  sources: ['Fill-A-Bag Survey', 'Warehouse Wednesday Survey'],
}
