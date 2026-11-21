// Screen-local fixtures for Admin / Grants (Figma 2324:49813 Grant Home, 2324:49849 View documents,
// 2324:50597 Grant recommended). The first nine rows are the design's table; the rest use the funders
// already shown on the dashboard so the table has a real second page.

export const STATUSES = {
  'In progress': 'blue',
  'Under review': 'yellow',
  'To submit': 'purple',
  Accepted: 'green',
  Rejected: 'pink',
};
// Filter chips → statuses ("Submitted" means the funder has it: Under review)
export const FILTERS = [
  ['All', null],
  ['In progress', ['In progress']],
  ['Submitted', ['Under review']],
  ['To submit', ['To submit']],
  ['Accepted', ['Accepted']],
  ['Rejected', ['Rejected']],
];
export const FILTER_GROUPS = [[0], [1, 2, 3], [4, 5]]; // dividers between chip groups, as designed

// Required (left column) and optional (right column) documents, from the View documents frame
export const REQUIRED_DOCS = [
  { id: 'irs', title: 'IRS determination letter & IRS Form 990', note: 'Proof of 501(c)(3) tax-exempt status', files: ['IRS_determination_letter.pdf', 'Form_990_2025.pdf'] },
  { id: 'form', title: 'Grant application form', note: 'Organization info, request amount, authorized signature', files: ['Application_form.pdf', 'Signature_page.pdf'] },
  { id: 'budget', title: 'Project/organizational budget & financial statements', note: 'Itemized costs and fiscal year budget', files: ['FY26_budget.xlsx', 'Audited_financials.pdf'] },
  { id: 'board', title: 'Board of directors list', note: 'Names and titles of board members', files: ['Board_roster_2026.pdf', 'Board_bios.pdf'] },
];
export const OPTIONAL_DOCS = [
  { id: 'plan', title: 'Strategic & sustainability plan', file: 'Strategic_plan_2026.pdf' },
  { id: 'annual', title: 'Annual report', file: 'Annual_report_2025.pdf' },
  { id: 'impact', title: 'Impact report', file: 'Impact_report_Q3.pdf' },
  { id: 'media', title: 'Media coverage & photos', file: 'Press_kit.zip' },
  { id: 'funders', title: 'Current and past funder history', file: 'Funder_history.xlsx' },
  { id: 'mou', title: 'Memorandum of understanding with partners', file: 'Partner_MOU.pdf' },
];

// Documents on file per grant: submitted/decided grants have every required doc; in-progress ones are partway.
const docsFor = (status, n) => {
  const done = status === 'In progress' ? n % 3 + 2 : status === 'To submit' ? 3 : 4;
  const files = {};
  REQUIRED_DOCS.forEach((d, i) => { files[d.id] = i < done ? d.files : []; });
  OPTIONAL_DOCS.forEach((d, i) => { files[d.id] = status === 'Accepted' && i < 2 ? [d.file] : []; });
  return files;
};

// [title, contributors (volunteer ids from data.js), applied (null = pending), due, status, amount, duration]
const ROWS = [
  ['Professional Attire Access Fund', ['sarah', 'marcus'], null, '2027-06-02', 'In progress', 3000, '8 months'],
  ['Empowered Interviews Initiative', ['sophia', 'elena'], null, '2027-08-17', 'In progress', 18500, '12 months'],
  ['Women’s Economic Mobility Grant', ['marie', 'maureen'], '2026-09-09', '2028-03-08', 'Under review', 10500, '18 months'],
  ['Confidence Closet Expansion Award', ['andre', 'janice'], null, '2027-04-13', 'In progress', 22300, '12 months'],
  ['Pathways to Employment Mentorship Grant', ['priya', 'tasha'], '2026-05-12', '2026-11-11', 'Rejected', 4000, '6 months'],
  ['Dress for the Job Emergency Relief Fund', ['jimmy', 'rosaline'], '2026-03-02', '2026-09-01', 'To submit', 12000, '6 months'],
  ['Community Career Readiness Partnership', ['elena', 'marie'], '2026-07-21', '2027-07-20', 'Accepted', 21300, '12 months'],
  ['Bright Futures Workforce Wardrobe Grant', ['jimmy', 'maureen'], '2026-10-20', '2027-10-19', 'Accepted', 83400, '12 months'],
  ['Her Next Chapter Career Launch Award', ['dana', 'sophia'], '2026-04-06', '2027-04-05', 'Under review', 32490, '12 months'],
  ['Hillman Women’s Services Grant', ['sarah', 'marie'], '2026-01-15', '2026-12-12', 'Accepted', 50000, '12 months'],
  ['PNC Workforce Match Grant', ['elena', 'andre'], '2026-02-03', '2026-12-30', 'Accepted', 35000, '10 months'],
  ['Allegheny County DHS Placement Contract', ['janice', 'tasha'], null, '2027-01-18', 'To submit', 60000, '12 months'],
  ['Heinz Endowments Suiting Program Grant', ['marcus', 'dana'], '2026-06-09', '2027-03-01', 'Under review', 45000, '9 months'],
  ['McCune Shelter Partners Grant', ['priya', 'jimmy'], null, '2027-03-15', 'In progress', 28000, '12 months'],
  ['Richard King Mellon Career Coaching Fund', ['rosaline', 'sophia'], '2026-04-20', '2027-02-20', 'Rejected', 20000, '10 months'],
];
export const INITIAL_GRANTS = ROWS.map(([title, contributors, applied, due, status, amount, duration], i) => ({ id: `grant-${i + 1}`, title, contributors, applied, due, status, amount, duration, files: docsFor(status, i) }));

// Explore — recommended opportunities (Figma 2324:50597), tag colour per card as designed
export const OPPORTUNITIES = [
  { id: 'op-1', title: 'Women’s Workforce Readiness Grant', funder: 'Allegheny Community Foundation', text: 'Funds professional clothing, interview coaching, and job-readiness workshops for women re-entering the workforce. Priority goes to programs serving low-income and returning-citizen clients.', tags: ['Workforce Development', 'Women’s Empowerment', 'Community Services'], color: 'green', amount: 25000, due: '2026-12-15', duration: '12 months' },
  { id: 'op-2', title: 'Suited for Success Capital Fund', funder: 'Midwest Retail Giving Alliance', text: 'Supports expansion of a boutique-style suiting space and inventory purchases, including plus-size and petite ranges. Matching in-kind donations are encouraged but not required.', tags: ['Capital Funding', 'Retail Partnership', 'Economic Mobility'], color: 'purple', amount: 15000, due: '2026-11-30', duration: '6 months' },
  { id: 'op-3', title: 'Career Pathways for Women Initiative', funder: 'Hartwell Family Foundation', text: 'Multi-year support for mentorship, financial literacy, and career-advancement programming for women in underserved neighborhoods. Applicants must report outcomes on job placement and wage growth.', tags: ['Mentorship', 'Financial Literacy', 'Multi-Year Grant'], color: 'pink', amount: 120000, due: '2027-01-31', duration: '24 months' },
  { id: 'op-4', title: 'Digital Skills & Interview Confidence Grant', funder: 'BrightPath Technology Fund', text: 'Pays for laptops, résumé software, and virtual interview training to help clients compete in remote and hybrid job markets. Programs pairing digital training with professional styling are preferred.', tags: ['Digital Literacy', 'Technology Access', 'Job Training'], color: 'blue', amount: 40000, due: '2027-02-14', duration: '9 months' },
  { id: 'op-5', title: 'Women Leading Change Community Impact Award', funder: 'National Women’s Philanthropy Network', text: 'Supports network-wide programs that expand affiliate capacity, volunteer training, and client outreach. Strong applications show measurable gains in the number of women served.', tags: ['Capital Funding', 'Women’s Empowerment', 'Community Services'], color: 'yellow', amount: 75000, due: '2027-03-20', duration: '18 months' },
];

export const money = (n) => `$${n.toLocaleString('en-US')}`;
export const day = (iso, month = 'short') => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' });
