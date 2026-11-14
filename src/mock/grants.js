// Grants (Figma: Final › Grants, section 2324:49812).
const TITLES = [
  ['Professional Attire Access Fund', 3000],
  ['Empowered Interviews Initiative', 18500],
  ['Women’s Economic Mobility Grant', 10500],
  ['Confidence Closet Expansion Award', 22300],
  ['Pathways to Employment Mentorship Fund', 4000],
  ['Dress for the Job Emergency Relief Fund', 12000],
  ['Community Career Readiness Partnership', 21300],
  ['LorBright Futures Workforce Wardrobe Grant', 83400],
  ['Her Next Chapter Career Launch Fund', 32490],
  ['Hillman Foundation Workforce Grant', 50000],
  ['PNC Grow Up Great Community Grant', 25000],
  ['Allegheny County DHS Employment Supports', 40000],
  ['Highmark Healthy Workforce Award', 15000],
  ['Keystone Workforce Partnership Grant', 30000],
  ['Riverfront Corporate Giving Program', 8000],
  ['BrightPath Technology Fund', 12500],
  ['Hartwell Family Foundation Grant', 60000],
  ['Steel City Women in Business Fund', 7500],
  ['Three Rivers Opportunity Grant', 18000],
  ['Pittsburgh Foundation Responsive Grant', 45000],
]

// [status, count] — totals 40
const STATUS_PLAN = [
  ['in_progress', 12],
  ['under_review', 4],
  ['to_submit', 2],
  ['accepted', 10],
  ['rejected', 6],
  ['in_progress', 0],
  ['accepted', 6],
]

export const GRANT_STATUS = {
  in_progress: { label: 'In progress', color: 'blue' },
  under_review: { label: 'Under review', color: 'yellow' },
  to_submit: { label: 'To submit', color: 'purple' },
  accepted: { label: 'Accepted', color: 'green' },
  rejected: { label: 'Rejected', color: 'pink' },
}

// Order of the filter chips (Figma: All (34) | In progress (12) | Submitted (4) | To submit (2) | Accepted (10) | Rejected (6))
export const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'under_review', label: 'Submitted' },
  { value: 'to_submit', label: 'To submit' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

const CONTRIBUTORS = ['Bridget Moore', 'Kyla Brooks', 'Anna Claire', 'Mariko Takahashi', 'Fatima Jiang', 'Keiko Patel', 'Zara Ali', 'Sam Lee', 'Chloe Diaz']

const statuses = STATUS_PLAN.flatMap(([s, n]) => Array.from({ length: n }, () => s))

const d = (y, m, day) => new Date(y, m - 1, day)

export const REQUIRED_DOCS = [
  { id: 'irs', name: 'IRS determination letter & IRS Form 990', hint: 'Proof of 501(c)(3) tax-exempt status' },
  { id: 'application', name: 'Grant application form', hint: 'Organization info, request amount, authorized signature' },
  { id: 'budget', name: 'Project/organizational budget & financial statements', hint: 'Itemized costs and fiscal year budget' },
  { id: 'board', name: 'Board of directors list', hint: 'Names and titles of board members' },
]

export const OPTIONAL_DOCS = [
  { id: 'strategic', name: 'Strategic & sustainability plan', generate: 'Strategic & sustainability plan' },
  { id: 'annual', name: 'Annual report', generate: 'Annual report' },
  { id: 'impact', name: 'Impact report', generate: 'Impact report' },
  { id: 'media', name: 'Media coverage & photos', generate: 'Media coverage' },
  { id: 'funders', name: 'Current and past funder history' },
  { id: 'mou', name: 'Memorandum of understanding with partners' },
]

export const grants = Array.from({ length: 40 }, (_, i) => {
  const [title, amount] = TITLES[i % TITLES.length]
  const status = statuses[i]
  const applied = status === 'in_progress' || status === 'to_submit' ? null : d(2026, 1 + (i % 10), 2 + ((i * 7) % 26))
  const due = d(2026 + (i % 3 === 0 ? 0 : 1), 1 + ((i * 5) % 12), 1 + ((i * 11) % 27))
  // required docs are complete for anything already submitted
  const submitted = applied != null
  const uploaded = {}
  REQUIRED_DOCS.forEach((doc, k) => {
    // g01 matches the Figma popup: every required doc has two files attached
    if (i === 0 || submitted || k < i % 4) uploaded[doc.id] = doc.id === 'irs' ? ['IRS_letter.pdf', 'Form_990.pdf'] : [`${doc.id}_2026.pdf`, `${doc.id}_signed.pdf`]
  })
  return {
    id: `g${String(i + 1).padStart(2, '0')}`,
    title: i < TITLES.length ? title : `${title} (${2025 - Math.floor(i / TITLES.length) + 1} cycle)`,
    amount: i < TITLES.length ? amount : Math.round((amount * (0.6 + ((i * 13) % 9) / 10)) / 10) * 10,
    status,
    applied,
    due,
    durationMonths: [8, 12, 6, 24, 9, 18][i % 6],
    contributors: [CONTRIBUTORS[i % CONTRIBUTORS.length], CONTRIBUTORS[(i * 3 + 1) % CONTRIBUTORS.length]],
    uploaded,
  }
})

// Figma "Grant recommended" (Explore tab) — 2324:50597
export const opportunities = [
  {
    id: 'o1',
    title: 'Women’s Workforce Readiness Grant',
    funder: 'Allegheny Community Foundation',
    description:
      'Funds professional clothing, interview coaching, and job-readiness workshops for women re-entering the workforce. Priority goes to programs serving low-income and returning-citizen clients.',
    tags: [['Workforce Development', 'green'], ['Women’s Empowerment', 'green'], ['Community Services', 'green']],
    amount: 25000,
    due: d(2026, 12, 15),
    durationMonths: 12,
  },
  {
    id: 'o2',
    title: 'Suited for Success Capital Fund',
    funder: 'Midwest Retail Giving Alliance',
    description:
      'Supports expansion of a boutique-style suiting space and inventory purchases, including plus-size and petite ranges. Matching in-kind donations are encouraged but not required.',
    tags: [['Capital Funding', 'purple'], ['Retail Partnership', 'purple'], ['Economic Mobility', 'purple']],
    amount: 15000,
    due: d(2026, 11, 30),
    durationMonths: 6,
  },
  {
    id: 'o3',
    title: 'Career Pathways for Women Initiative',
    funder: 'Hartwell Family Foundation',
    description:
      'Multi-year support for mentorship, financial literacy, and career-advancement programming for women in underserved neighborhoods. Applicants must report outcomes on job placement and wage growth.',
    tags: [['Mentorship', 'pink'], ['Financial Literacy', 'pink'], ['Multi-Year Grant', 'pink']],
    amount: 120000,
    due: d(2027, 1, 31),
    durationMonths: 24,
  },
  {
    id: 'o4',
    title: 'Digital Skills & Interview Confidence Grant',
    funder: 'BrightPath Technology Fund',
    description:
      'Pays for laptops, résumé software, and virtual interview training to help clients compete in remote and hybrid job markets. Programs pairing digital training with professional styling are preferred.',
    tags: [['Digital Literacy', 'blue'], ['Technology Access', 'blue'], ['Job Training', 'blue']],
    amount: 40000,
    due: d(2027, 2, 14),
    durationMonths: 9,
  },
  {
    id: 'o5',
    title: 'Women Leading Change Community Impact Award',
    funder: 'National Women’s Philanthropy Network',
    description:
      'Supports network-wide programs that expand affiliate capacity, volunteer training, and client outreach. Strong applications show measurable gains in the number of women served.',
    tags: [['Capital Funding', 'yellow'], ['Women’s Empowerment', 'yellow'], ['Community Services', 'yellow']],
    amount: 75000,
    due: d(2027, 3, 20),
    durationMonths: 18,
  },
]

// Generated "Impact report" content (Figma: Generate impact report, 2324:50103)
export const impactReport = {
  title: 'Dress for Success Pittsburgh: 2025–2026 Impact Report',
  subtitle: 'Fiscal year: July 1, 2025 – June 30, 2026.',
  sections: [
    {
      h: 'A Message from Our Executive Director',
      p: 'This year, more women walked through our doors than at any point in our history, and more of them walked out with jobs. Every suit we fit and every interview we rehearse is a vote of confidence in a woman’s ability to support herself and her family. Thank you to our donors, volunteers, referral partners, and funders for making that possible.',
      sign: 'Dana Whitfield, Executive Director',
    },
    {
      h: 'Our Mission',
      p: 'Dress for Success Pittsburgh empowers women to achieve economic independence by providing a network of support, professional attire, and the development tools to help women thrive in work and in life.',
    },
    {
      h: 'The Year at a Glance',
      source: true,
      table: {
        head: ['Measure', 'FY 2025-26', 'Change from prior year'],
        rows: [
          ['Women served', '1,842', '+14%'],
          ['Women who secured employment within 6 months', '1,121 (61%)', '+11%'],
          ['Total events held', '103', '+5%'],
          ['Workshops hosted', '54', '+3%'],
          ['Total volunteer hours', '12,540', '+13%'],
          ['Company events', '22', '+10%'],
        ],
      },
    },
    {
      h: 'Programs and Outcomes',
      sub: [
        {
          h: 'Professional Suiting',
          p: 'Each client receives a complete professional outfit for her interview, with a second outfit once she is hired. This year we opened a dedicated plus-size and petite fitting area and expanded our selection of shoes, accessories, and winter outerwear.',
          list: ['2,310 outfits distributed, including 468 second-outfit fittings for newly hired clients', '94% of surveyed clients said they felt more confident at their interview'],
        },
        {
          h: 'Career Center: Interview and Job-Readiness Workshops',
          p: 'Our workshops cover résumé writing, interview practice, digital skills, and workplace communication, in person and online.',
          list: [
            '96 workshops with 1,305 participants',
            '38 sessions were virtual-interview and digital-skills trainings, supported by 40 donated laptops',
            'Participants reported an average confidence rating of 4.5 out of 5 after completing a workshop series',
          ],
        },
        {
          h: 'Professional Women’s Group (PWG)',
          p: 'The PWG provides ongoing mentorship, peer support, and career-advancement guidance after a client is hired.',
          list: [
            '214 mentor-mentee matches (up from 175)',
            '82% of PWG participants remained employed 12 months after hire',
            'Average hourly wage increase of $2.85 among participants who changed or advanced roles',
          ],
        },
        {
          h: 'Financial Literacy Series',
          p: 'A new four-session curriculum covers budgeting, credit building, and saving.',
          list: ['312 women enrolled; 241 (77%) completed all four sessions', '63% of women opened a savings account or set a written savings goal'],
        },
      ],
    },
    {
      h: 'Who We Serve',
      source: true,
      table: {
        head: ['Population', 'Proportion of clients'],
        rows: [
          ['Household income below $30,000', '71%'],
          ['Single heads of household', '58%'],
          ['Re-entering the workforce after 2+ years', '44%'],
          ['Returning citizens (formerly incarcerated)', '17%'],
          ['Survivors of domestic violence', '21%'],
          ['Ages 25-44', '77%'],
        ],
      },
    },
    {
      h: 'Client Story',
      p: 'Marisol, a mother of two, had been out of the workforce for six years when a shelter caseworker referred her to us. She was fitted for her first interview outfit, completed our workshop series, and practiced mock interviews with a volunteer. Within five weeks she was hired as a medical billing specialist. Today she is a PWG mentor.',
      quote: ['“I walked in feeling invisible. I walked out feeling ready.”', ' — Marisol, client and mentor of 2 years'],
    },
    {
      h: 'Financial Summary',
      source: true,
      table: {
        head: ['Category', 'Amount', 'Share'],
        rows: [
          ['Total revenue', '$1,486,000', '', true],
          ['Foundation and corporate grants', '$612,000', '41%'],
          ['Individual donations', '$401,000', '27%'],
          ['Special events', '$214,000', '14%'],
          ['In-kind donations (clothing, goods)', '$186,000', '13%'],
          ['Other income', '$126,000', '5%'],
          ['Total expenses', '$1,392,000', '', true],
          ['Programs', '$1,392,000', '78%'],
          ['Administration', '$181,000', '13%'],
          ['Fundraising', '$126,000', '9%'],
        ],
      },
      after: 'Net operating surplus: $94,000, allocated to our operating reserve.',
    },
    {
      h: 'Our Funders and Partners',
      p: 'We are grateful to the following organizations for their generous support:',
      list: ['Allegheny Community Foundation', 'Keystone Workforce Partnership', 'BrightPath Technology Fund', 'Hartwell Family Foundation', 'Riverfront Corporate Giving Program'],
    },
    {
      h: 'Looking Ahead: FY2026-27 Goals',
      ordered: [
        'Serve 2,100 women, a 14% increase',
        'Raise the six-month employment rate to 65%',
        'Launch a mobile styling unit serving three outlying counties',
        'Expand the Financial Literacy Series to 450 participants',
        'Build a $250,000 operating reserve for long-term sustainability',
      ],
    },
    {
      h: 'How to Get Involved',
      list: [
        '**Donate:** gifts of any size fund outfits and workshops',
        '**Volunteer:** personal stylists, mentors, and workshop facilitators are always needed',
        '**Donate professional clothing:** gently used suits, blazers, and shoes',
        '**Partner with us:** refer clients or host a clothing drive',
      ],
    },
  ],
  footer: 'Dress for Success Pittsburgh is a 501(c)(3) nonprofit organization. (Sample EIN: 00-0000)',
}

export const REPORT_TYPES = ['Strategic & sustainability plan', 'Annual report', 'Impact report', 'Media coverage']
