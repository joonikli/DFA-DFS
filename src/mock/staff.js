// Staff who manage events, as volunteers see them (the volunteer-facing staff profile, /staff/:id).
// Names, roles and photos come from the messaging seed (src/mock/messages.js); Bridget's details are
// the admin persona's (src/store/DemoStore.jsx). Contact details and bios for the others are mock.
import { PEOPLE } from './messages.js'
import bridgetPhoto from '../assets/people/sarah-doe.png' // Bridget's photo on the admin profile (profileData.js)

const detail = {
  bridget: {
    email: 'bridget.moore@dressforsuccess.org',
    phone: '412-555-0142',
    joined: 'March 3, 2021',
    photo: bridgetPhoto,
    bio: 'Hi! I’m the Volunteer Manager at Dress for Success Pittsburgh, where I help coordinate volunteer-supported events and make sure each opportunity runs smoothly. I work with volunteers to answer event questions, share updates, support scheduling changes, and verify service hours.',
  },
  mariko: {
    email: 'mariko.takahashi@dressforsuccess.org',
    phone: '412-555-0167',
    joined: 'June 14, 2022',
    bio: 'I lead Warehouse Wednesdays, where we sort, tag and shelve every donation that comes through our doors. No experience needed — I’ll show you around the racks and get you set up at a station.',
  },
  anna: {
    email: 'anna.claire@dressforsuccess.org',
    phone: '412-555-0123',
    joined: 'January 9, 2023',
    bio: 'I coordinate our career programs, from resume coaching to interview practice. I match volunteers with the sessions that fit their skills and make sure every client leaves feeling prepared.',
  },
  kyla: {
    email: 'kyla.brooks@dressforsuccess.org',
    phone: '412-555-0188',
    joined: 'September 22, 2022',
    bio: 'I run Fill-A-Bag and our community drives. Whether you’re packing bags or staffing a pickup point, I’ll make sure you know where to be and what to bring.',
  },
}

export const staff = Object.fromEntries(
  Object.entries(detail).map(([id, d]) => [
    id,
    { id, name: PEOPLE[id].name, first: PEOPLE[id].first, title: PEOPLE[id].role, city: 'Pittsburgh, PA', photo: PEOPLE[id].photo, ...d },
  ]),
)

/** Event organizer (src/mock/adminEvents.js: 'me' = Bridget, or a full name) → staff id */
export function staffIdFor(organizer) {
  if (organizer === 'me') return 'bridget'
  return Object.keys(staff).find((id) => staff[id].name === organizer)
}
