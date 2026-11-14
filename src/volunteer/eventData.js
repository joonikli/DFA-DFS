import { PAST_SHIFTS, SHIFTS, SHIFT_DATES } from '../data.js';
import { PAST_SURVEYS, RECOMMENDED } from './shared.js';

export const eventDate = iso => new Date(`${iso}T12:00:00`);
export const eventDateLabel = iso => eventDate(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
export function volunteerEvents() {
  return Object.entries(SHIFTS).map(([id, shift]) => ({ ...shift, id, date: SHIFT_DATES[id], recommendation: RECOMMENDED.find(item => item.id === id), past: false }));
}
export const ATTENDED_EVENTS = PAST_SHIFTS.map((shift, index) => {
  const match = Object.values(SHIFTS).find(item => item.title === shift.title);
  const month = { Oct: '10', Nov: '11' }[shift.mon];
  return { ...shift, id: `attended-${index}`, date: `2026-${month}-${String(shift.day).padStart(2, '0')}`, addr: match?.addr || 'Location not recorded', desc: 'Details for this past event are not included in the prototype.', tags: match?.tags || [], past: true, survey: PAST_SURVEYS.find(item => item.event === shift.title && item.date.endsWith(`${shift.mon} ${shift.day}`)) };
});
// '6:00–8:00 PM' → [1080, 1200]: start / end as minutes after midnight
export function shiftRange(time) {
  const [start, end] = time.split(/[–-]/).map(value => value.trim());
  const minutes = value => { const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i); if (!match) return 0; return ((+match[1] % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + +match[2]; };
  return [minutes(/AM|PM/i.test(start) ? start : `${start} ${end.match(/AM|PM/i)?.[0] || ''}`), minutes(end)];
}
export function shiftHours(time) {
  const [start, end] = shiftRange(time);
  return Math.max(0, (end - start) / 60);
}
