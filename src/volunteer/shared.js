// Volunteer-portal constants and helpers (vanilla volunteer.js top of file)
import { GROUPS, VOLS } from '../data.js';

export const VOL = 'maureen';
export const vol = VOLS[VOL];
export const group = (id) => GROUPS.find((g) => g.id === id);

export const VOL_NAV = [
  ['dashboard', 'Dashboard', 'nav-house'],
  ['events', 'Events', 'nav-calendar'],
  ['surveys', 'Surveys', 'nav-file-pen'],
  ['messages', 'Messages', 'nav-messages'],
];

export const ANNOUNCEMENT = { group: 'g1', id: 'a2' };
export const announcement = () => {
  const g = group(ANNOUNCEMENT.group);
  return { g, a: g.anns.find((x) => x.id === ANNOUNCEMENT.id) };
};

export const RECOMMENDED = [
  { id: 'hs19', dist: '0.8 mi', why: 'You enjoyed Mobile Services' },
  { id: 'b22', dist: '1.4 mi', why: 'Matches your styling skills' },
];

export const SURVEY_EVENT = { event: 'Boutique Fittings', date: 'Tuesday, Dec 1' };

export const PAST_SURVEYS = [
  { event: 'Mobile Services Route', date: 'Saturday, Nov 21', rating: 5, comment: 'The new intake form made check-in so much faster.' },
  { event: 'Warehouse Wednesday', date: 'Wednesday, Nov 18', rating: 4, comment: 'More gloves at the sorting station would help.' },
  { event: 'MHCI Lunch & Learn', date: 'Saturday, Nov 7', rating: 5, comment: '' },
  { event: 'Fall Suit Drive', date: 'Saturday, Oct 24', rating: 4, comment: 'Long line at drop-off around noon.' },
  { event: 'Warehouse Wednesday', date: 'Wednesday, Oct 14', rating: 5, comment: '' },
];

export const shortTime = (t) => t.replace(/:00/g, '').replace(/\s?(AM|PM)/g, (m, p) => ` ${p.toLowerCase()}`).replace(/ (am|pm)–/, '–');
export const firstName = (n) => n.split(' ')[0];
