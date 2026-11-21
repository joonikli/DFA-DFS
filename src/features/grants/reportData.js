// Grant "Generate reports" (Figma 2324:50057 empty, 2324:50103 impact report, 2324:50327 data source).
// Report copy is taken from the Figma frame. Sections with `sources` show the margin chart button;
// survey sources link to those surveys' results, grant sources to the Grants page. Each section's
// `modules` compile its evidence in the formats it lives in elsewhere (dashboard widgets, survey charts,
// written responses, AI summary insights, grant tracks).

export const DOC_CHOICES = [
  { id: 'plan', label: 'Strategic & sustainability plan' },
  { id: 'annual', label: 'Annual report' },
  { id: 'impact', label: 'Impact report' },
  { id: 'media', label: 'Media coverage' },
];

// Where a source-panel module's data lives: a dashboard widget, the survey AI summary, or the Grants page.
// Survey modules name their survey instead (`survey` + question id) and are labelled from it.
const DASH = (label) => ({ kind: 'dashboard', label: `Dashboard · ${label}`, href: '#dashboard' });
const AI = { kind: 'ai', label: 'Survey AI summary', href: '#surveys' };
const GRANTS_PAGE = { kind: 'grant', label: 'Accepted grants', href: '#grants' };

export const IMPACT_REPORT = {
  title: 'Dress for Success Pittsburgh: 2025–2026 Impact Report',
  subtitle: 'Fiscal year: July 1, 2025 – June 30, 2026.',
  sections: [
    { id: 'message', title: 'A Message from Our Executive Director', paragraphs: ['This year, more women walked through our doors than at any point in our history, and more of them walked out with jobs. Every suit we fit and every interview we rehearse is a vote of confidence in a woman’s ability to support herself and her family. Thank you to our donors, volunteers, referral partners, and funders for making that possible.'], signature: 'Dana Whitfield, Executive Director' },
    { id: 'mission', title: 'Our Mission', paragraphs: ['Dress for Success Pittsburgh empowers women to achieve economic independence by providing a network of support, professional attire, and the development tools to help women thrive in work and in life.'] },
    { id: 'glance', title: 'The Year at a Glance', sources: { surveys: ['s01', 's02'], links: [DASH('Volunteer hours'), DASH('Engagement analysis')], modules: [
      { type: 'stats', wide: true, title: 'Year-end totals', from: DASH('Volunteer hours · Engagement analysis'), items: [['Women served', '1,842', '', '+14% from last year'], ['Total volunteer hours', '12,540', '', '+13% from last year'], ['Avg hours per volunteer', '12.3', '', '+1.1 from last month'], ['Volunteer retention', '83%', '', '+4 pts from last month']] },
      { type: 'line', title: 'Volunteer hours over time', from: DASH('Average hours over time'), series: 'year' },
      { type: 'choice', survey: 's01', q: 'q1' },
    ] },
      table: { head: ['Measure', 'FY 2025-26', 'Change from prior year'], rows: [['Women served', '1,842', '+14%'], ['Women who secured employment within 6 months', '1,121 (61%)', '+11%'], ['Total events held', '103', '+5%'], ['Workshops hosted', '54', '+3%'], ['Total volunteer hours', '12,540', '+13%'], ['Company events', '22', '+10%']] } },
    { id: 'programs', title: 'Programs and Outcomes', sources: { surveys: ['s02', 's06'], links: [DASH('Event participation')], modules: [
      { type: 'participation', title: 'Volunteer hours by program', from: DASH('Event participation') },
      { type: 'stats', title: 'Workshop outcomes', survey: 's02', items: [['Felt more confident at interview', '94%', '', '+6% from last year'], ['Confidence after a workshop series', '4.5', '/5', '+0.3 from last year']] },
      { type: 'text', survey: 's01', q: 'q2', wide: true },
    ] }, programs: [
      { title: 'Professional Suiting', text: 'Each client receives a complete professional outfit for her interview, with a second outfit once she is hired. This year we opened a dedicated plus-size and petite fitting area and expanded our selection of shoes, accessories, and winter outerwear.', bullets: ['2,310 outfits distributed, including 468 second-outfit fittings for newly hired clients', '94% of surveyed clients said they felt more confident at their interview'] },
      { title: 'Career Center: Interview and Job-Readiness Workshops', text: 'Our workshops cover résumé writing, interview practice, digital skills, and workplace communication, in person and online.', bullets: ['96 workshops with 1,305 participants', '38 sessions were virtual-interview and digital-skills trainings, supported by 40 donated laptops', 'Participants reported an average confidence rating of 4.5 out of 5 after completing a workshop series'] },
      { title: 'Professional Women’s Group (PWG)', text: 'The PWG provides ongoing mentorship, peer support, and career-advancement guidance after a client is hired.', bullets: ['214 mentor-mentee matches (up from 175)', '82% of PWG participants remained employed 12 months after hire', 'Average hourly wage increase of $2.85 among participants who changed or advanced roles'] },
      { title: 'Financial Literacy Series', text: 'A new four-session curriculum covers budgeting, credit building, and saving.', bullets: ['312 women enrolled; 241 (77%) completed all four sessions', '63% of women opened a savings account or set a written savings goal'] },
    ] },
    { id: 'serve', title: 'Who We Serve', sources: { surveys: ['s03', 's04'], links: [DASH('Volunteer hours by location')], modules: [
      { type: 'donut', survey: 's03', q: 'q3' },
      { type: 'locations', title: 'Volunteer hours by county', from: DASH('Volunteer hours by location') },
      { type: 'insight', wide: true, label: 'Strength', from: AI, text: 'Keep expanding on partnerships with local businesses for job placements.', survey: 's03' },
    ] }, narrow: true,
      table: { head: ['Population', 'Proportion of clients'], rows: [['Household income below $30,000', '71%'], ['Single heads of household', '58%'], ['Re-entering the workforce after 2+ years', '44%'], ['Returning citizens (formerly incarcerated)', '17%'], ['Survivors of domestic violence', '21%'], ['Ages 25-44', '77%']] } },
    { id: 'story', title: 'Client Story', sources: { surveys: ['s01'], links: [AI], modules: [
      { type: 'text', survey: 's01', q: 'q2', wide: true },
      { type: 'stats', title: 'How clients talk about us', from: AI, items: [['Positive association in responses', '74%', '', '+2% from last week'], ['Average survey score', '7.45', '/10', '+2 from last week']] },
      { type: 'insight', label: 'Suggestion', from: AI, text: 'Implement mentorship programs pairing participants with experienced women in their fields.' },
    ] }, paragraphs: ['Marisol, a mother of two, had been out of the workforce for six years when a shelter caseworker referred her to us. She was fitted for her first interview outfit, completed our workshop series, and practiced mock interviews with a volunteer. Within five weeks she was hired as a medical billing specialist. Today she is a PWG mentor.'], quote: ['“I walked in feeling invisible. I walked out feeling ready.”', ' — Marisol, client and mentor of 2 years'] },
    { id: 'finance', title: 'Financial Summary', sources: { grants: true, modules: [
      { type: 'revenue', wide: true, title: 'Accepted grant revenue by funder', from: GRANTS_PAGE },
    ] },
      table: { head: ['Category', 'Amount', 'Share'], rows: [['Total revenue', '$1,486,000', ''], ['Foundation and corporate grants', '$612,000', '41%'], ['Individual donations', '$401,000', '27%'], ['Special events', '$214,000', '14%'], ['In-kind donations (clothing, goods)', '$186,000', '13%'], ['Other income', '$126,000', '5%'], ['Total expenses', '$1,392,000', ''], ['Programs', '$1,085,000', '78%'], ['Administration', '$181,000', '13%'], ['Fundraising', '$126,000', '9%']], totals: [0, 6] },
      after: 'Net operating surplus: $94,000, allocated to our operating reserve.' },
    { id: 'funders', title: 'Our Funders and Partners', paragraphs: ['We are grateful to the following organizations for their generous support:'], bullets: ['Allegheny Community Foundation', 'Keystone Workforce Partnership', 'BrightPath Technology Fund', 'Hartwell Family Foundation', 'Riverfront Corporate Giving Program'] },
    { id: 'goals', title: 'Looking Ahead: FY2026-27 Goals', sources: { links: [DASH('Recommendations'), AI], modules: [
      { type: 'line', title: 'Q4 volunteer hours', from: DASH('Average hours over time'), series: 'q4' },
      { type: 'insight', label: 'Recommendation', title: 'Expand Mobile Services into Q1', from: DASH('Recommendations'), text: 'Add two Allegheny County routes and a second styling suite; the December cohort has capacity for roughly 180 more hours.' },
      { type: 'insight', wide: true, label: 'Suggestion', from: AI, text: 'Provide tailored workshops focusing on resume building and interview skills.', survey: 's02' },
    ] }, numbered: ['Serve 2,100 women, a 14% increase', 'Raise the six-month employment rate to 65%', 'Launch a mobile styling unit serving three outlying counties', 'Expand the Financial Literacy Series to 450 participants', 'Build a $250,000 operating reserve for long-term sustainability'] },
    { id: 'involved', title: 'How to Get Involved', defs: [['Donate', 'gifts of any size fund outfits and workshops'], ['Volunteer', 'personal stylists, mentors, and workshop facilitators are always needed'], ['Donate professional clothing', 'gently used suits, blazers, and shoes'], ['Partner with us', 'refer clients or host a clothing drive']], footnote: 'Dress for Success Pittsburgh is a 501(c)(3) nonprofit organization. (Sample EIN: 00-0000)' },
  ],
};

// Markdown export of whatever sections are still in the report
export function toMarkdown(report, sections) {
  const out = [`# ${report.title}`, report.subtitle];
  sections.forEach((s) => {
    out.push(`## ${s.title}`);
    (s.paragraphs || []).forEach((p) => out.push(p));
    if (s.signature) out.push(`*${s.signature}*`);
    if (s.table) { out.push(`| ${s.table.head.join(' | ')} |`, `|${s.table.head.map(() => ' --- ').join('|')}|`, ...s.table.rows.map((r) => `| ${r.join(' | ')} |`)); }
    if (s.after) out.push(s.after);
    (s.programs || []).forEach((p) => out.push(`### ${p.title}`, p.text, ...p.bullets.map((b) => `- ${b}`)));
    if (s.quote) out.push(`> ${s.quote.join('')}`);
    (s.bullets || []).forEach((b) => out.push(`- ${b}`));
    (s.numbered || []).forEach((b, i) => out.push(`${i + 1}. ${b}`));
    (s.defs || []).forEach(([k, v]) => out.push(`- **${k}:** ${v}`));
    if (s.footnote) out.push(s.footnote);
  });
  return `${out.join('\n\n')}\n`;
}
