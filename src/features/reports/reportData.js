// Data for the report composer (Figma: Final › Report creation - Hi fi, section 2324:48900).
export const PERIODS = {
  month: { short: 'This month', label: 'May 2026', range: 'May 1 – May 31', hours: [{ x: 'WK 1', y: 46 }, { x: 'WK 2', y: 61 }, { x: 'WK 3', y: 38 }, { x: 'WK 4', y: 72 }] },
  q4: { short: 'Q4 2026', label: 'Q4 2026', range: 'Oct 1 – Dec 31', hours: [{ x: 'OCT', y: 30 }, { x: 'NOV', y: 220 }, { x: 'DEC', y: 182 }] },
  custom: { short: 'Custom', label: 'Jan – Jun 2026', range: 'Jan 1 – Jun 30', hours: [{ x: 'JAN', y: 36 }, { x: 'FEB', y: 98 }, { x: 'MAR', y: 246 }, { x: 'APR', y: 132 }, { x: 'MAY', y: 178 }, { x: 'JUNE', y: 176 }] },
}

export const REPORT_KINDS = {
  funder: { label: 'Funder report', desc: 'Match hours, outcomes, narrative', eyebrow: 'Dress for Success funder report', blocks: ['hours', 'grants', 'survey'] },
  board: { label: 'Board update', desc: 'Trend, engagement, recommendations', eyebrow: 'Dress for Success board update', blocks: ['hours', 'survey', 'engagement'] },
  internal: { label: 'Internal review', desc: 'Everything, unedited', eyebrow: 'Dress for Success internal review', blocks: ['hours', 'survey', 'engagement', 'grants', 'firstTime'] },
  blank: { label: 'Describe it yourself', desc: 'Start from a blank document', eyebrow: 'Dress for Success report', blocks: [] },
}

export const SUGGESTIONS = [
  { id: 'firstTime', prompt: 'Which events drove the most first-time attendees?' },
  { id: 'sentiment', prompt: 'How did survey sentiment shift after March?' },
  { id: 'grantMetrics', prompt: 'Grant-eligible impact metrics, YTD and more' },
]

export const surveyBars = [42, 64, 40, 54, 92] // post-event survey mini chart (relative heights)

export const engagement = [
  { label: 'Avg hours per volunteer', value: '12.3', delta: '+250% from last month' },
  { label: 'Avg events per volunteer', value: '3.1', delta: '+18% from last month' },
  { label: 'Volunteer retention rate', value: '83%', delta: '+6% from last month' },
]

export const firstTimeAttendees = [
  ['Boutique', 48],
  ['Mobile Services', 37],
  ['Warehouse Wednesday', 29],
  ['Fill-A-Bag', 22],
  ['Interview Practice', 14],
]

export const sentiment = [
  { x: 'JAN', y: 61 },
  { x: 'FEB', y: 63 },
  { x: 'MAR', y: 58 },
  { x: 'APR', y: 70 },
  { x: 'MAY', y: 74 },
  { x: 'JUNE', y: 79 },
]

export const grantCommitments = [
  { funder: 'Hillman Foundation', due: 'Sep 12', progress: 82, detail: '164 of 200 women' },
  { funder: 'PNC Foundation', due: 'Sep 30', progress: 82, detail: '986 of 1,200 hrs' },
  { funder: 'Allegheny County DHS', due: 'Oct 18', progress: 64, detail: '64% of 60% target' },
  { funder: 'Highmark Foundation', due: 'Nov 6', progress: 71, detail: '212 of 300 hrs' },
]

export const grantMetrics = [
  ['Women served', '1,842', '+14%'],
  ['Employed within 6 months', '1,121 (61%)', '+11%'],
  ['Volunteer hours', '12,540', '+13%'],
  ['Outfits distributed', '2,310', '+9%'],
]
