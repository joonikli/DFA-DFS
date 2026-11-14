import { ME, PHOTOS, VOLS } from '../../data.js';
import { emit } from '../../lib/store.js';

export const PROFILE_YEAR = '2026';
export const PROFILE_AWARDS = [
  { id: 'top-15', name: 'Top 15%', kind: 'badge' },
  { id: 'top-50', name: 'Top 50%', kind: 'badge' },
  { id: 'top-25', name: 'Top 25%', kind: 'badge' },
  { id: 'impact-maker', name: 'Impact Maker', kind: 'title' },
  { id: 'career-champion', name: 'Career Champion', kind: 'title' },
  { id: 'success-advocate', name: 'Success Advocate', kind: 'title' },
];

// Supplement the existing mock identities with profile-only demo fields from
// Final / Profiles. No production account, permissions or server data is changed.
const admin = {
  jobTitle: 'Volunteer Manager', location: 'Pittsburgh, PA', joined: 'August 12, 2023',
  email: 'bridget.okafor@dfspgh.org', phone: '412-555-0101',
  bio: `Hi my name is ${ME.first}! I am the Volunteer Manager at Dress for Success Pittsburgh, where I help coordinate volunteer-supported events and make sure each opportunity runs smoothly. I work with volunteers to answer event questions, share updates, support scheduling changes, and verify service hours.`,
};
const volunteerDemo = {
  sarah: { joined: 'August 12, 2023', attended: 14, attendance: 92, awards: PROFILE_AWARDS.map((award) => award.id), attendedEvents: ['completed-1', 'completed-2'] },
};
const cachedPortraits = {
  [PHOTOS.me.photo]: '/assets/profiles/me-portrait.jpg',
  [PHOTOS.sarah.photo]: '/assets/profiles/sarah-portrait.jpg',
};

export function getProfile(type, id) {
  if (type === 'admin') return { ...admin, name: ME.name, photo: cachedPortraits[ME.photo] || ME.photo, id: 'me', type: 'admin', verified: true };
  const volunteer = VOLS[id];
  if (!volunteer) return null;
  const demo = volunteerDemo[id] || {};
  const first = volunteer.name.split(' ')[0];
  return {
    ...volunteer, ...demo, id, type: 'volunteer', location: volunteer.loc, photo: cachedPortraits[volunteer.photo] || volunteer.photo,
    bio: `Hi my name is ${first}! I’m a volunteer with Dress for Success Pittsburgh, where I help support community events and donation organization. I enjoy contributing to opportunities that help women feel prepared, confident, and supported in their career journeys.`,
    verified: Boolean(demo.joined), awards: demo.awards || [],
    joined: demo.joined || null, attendedEvents: demo.attendedEvents || [],
  };
}

export function saveAdminProfile(form) {
  Object.assign(admin, { jobTitle: form.jobTitle.trim(), location: form.location.trim(), email: form.email.trim(), phone: form.phone.trim(), bio: form.bio.trim() });
  Object.assign(ME, { name: form.name.trim(), first: form.name.trim().split(' ')[0], photo: form.photo });
  emit();
}

export function saveAdminNotes(id, notes) {
  if (!VOLS[id]) return;
  VOLS[id].notes = notes;
  emit();
}

export function profileRoute(id = 'sarah') {
  return `profile?${new URLSearchParams({ type: 'volunteer', id })}`;
}
