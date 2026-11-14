// Screen-local fixtures from Final / Admin - Events. Shared dashboard and volunteer data stay independent.
export const EVENT_TODAY = '2026-05-20';
const address = '8374 Redmond Rd, Pittsburgh, PA';
const description = 'Pack lunches to raise funds for women on long-term job searches. Sign up for minimum 1/5 shifts.';
export const EVENT_DESCRIPTION = 'Join us for a hands-on volunteer event to sort, label, and organize our donated goods! Volunteers will help check items for quality, sort them into categories such as clothing, household goods, and non-perishables, and shelve everything so it’s ready for distribution. No experience is needed, just a willingness to pitch in. Gloves, labels, and refreshments will be provided. Whether you can stay for an hour or the entire shift, your help will make sure donations reach the people who need them most, quickly and efficiently.';

// Explicit demo survey responses for the populated single-event state.
const inventorySurvey = {
  title: 'Donation Inventory Organizing Survey',
  questions: [
    { id: 'inventory-rating', title: 'How would you rate this event?', type: 'Multiple choice', options: ['Excellent', 'Good', 'Could be better'] },
    { id: 'inventory-instructions', title: 'How clear were the instructions?', type: 'Multiple choice', options: ['Very clear', 'Somewhat clear', 'Not clear'] },
    { id: 'inventory-feedback', title: 'What could we improve next time?', type: 'Free form', options: [''] },
  ],
};

export const INITIAL_EVENTS = [
  { id: 'reference-1', date: '2026-05-28', title: 'Warehouse Wednesday', detailTitle: 'Donation Inventory Organizing', start: '18:00', end: '20:00', time: '6-8 pm', registered: 15, group: 'mine', tags: ['pink', 'pink', 'pink'], longDescription: EVENT_DESCRIPTION, tagText: 'organized, spanish, own transportation', survey: inventorySurvey.title, surveyDefinition: inventorySurvey, surveyMissingIds: ['sarah', 'sophia', 'marie', 'andre', 'priya'], surveyCompletedIds: ['tasha', 'elena', 'marcus', 'janice', 'rosaline', 'jimmy', 'maureen', 'dana'] },
  { id: 'reference-2', date: '2026-05-30', title: 'Warehouse Wednesday', start: '11:30', end: '15:30', time: '11:30-3:30 pm', registered: 45, group: 'mine', tags: ['pink', 'pink'] },
  { id: 'reference-3', date: '2026-06-02', title: 'Mobile Shop', start: '11:30', end: '16:00', time: '11:30 am-4 pm', registered: 3, group: 'month', tags: [] },
  { id: 'reference-4', date: '2026-06-04', title: 'Clothing Distribution', start: '18:00', end: '20:00', time: '6-8 pm', registered: 0, group: 'month', tags: ['pink', 'pink', 'pink'] },
  // Existing prototype history, presented with the same admin card component.
  { id: 'completed-1', date: '2026-04-18', title: 'Spring Suit Drive', start: '10:00', end: '15:00', time: '10 am-3 pm', registered: 28, status: 'Completed', tags: [] },
  { id: 'completed-2', date: '2026-04-11', title: 'Career Closet Styling', start: '11:00', end: '16:00', time: '11 am-4 pm', registered: 14, status: 'Completed', tags: [] },
  { id: 'cancelled-1', date: '2026-05-09', title: 'Board Services Orientation', start: '18:00', end: '19:30', time: '6-7:30 pm', registered: 4, status: 'Cancelled', tags: [] },
].map((event) => ({ address, description, organizer: 'John Doe', type: event.title, status: 'Upcoming', ...event }));

export const parseDate = (date) => new Date(`${date}T12:00:00`);
export const dateLabel = (date) => parseDate(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
export const timeLabel = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
};
