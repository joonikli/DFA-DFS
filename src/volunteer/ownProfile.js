import { getProfile } from '../features/profiles/profileData.js';
import { emit } from '../lib/store.js';
import { VOL, vol } from './shared.js';

let biography;
export function ownVolunteerProfile() {
  // These summary totals already appear on the volunteer dashboard. The four
  // detailed past shifts are a subset, not a replacement for the summary total.
  const person = getProfile('volunteer', VOL);
  return { ...person, bio: biography ?? person.bio, attended: 14, attendance: 92 };
}

export function saveOwnVolunteerProfile(form) {
  Object.assign(vol, { name: form.name.trim(), loc: form.location.trim(), email: form.email.trim(), phone: form.phone.trim(), photo: form.photo });
  biography = form.bio.trim();
  emit();
}
