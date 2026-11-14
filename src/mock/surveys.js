// Post-event surveys a volunteer fills out (Figma: Final › Volunteer - Post-event).
// Question types: rating | text | choice | checklist  (see components/SurveyQuestion)

const quickSurvey = (title, subtitle) => ({
  title,
  subtitle,
  numbered: false,
  questions: [
    { id: 'rating', type: 'rating', prompt: 'What would you rate this event?', required: true },
    { id: 'feedback', type: 'text', prompt: 'Any issues or feedback?' },
  ],
})

// Keyed by event program (src/mock/events.js). Programs without an entry use quickSurvey.
const byProgram = {
  fillABag: {
    title: 'Fill-A-Bag Event Survey',
    subtitle: 'Help pack essential items for those in need and make a difference in the Pittsburgh community.',
    numbered: true,
    questions: [
      {
        id: 'q1',
        type: 'choice',
        prompt: 'How sufficient did you find our clothing selection?',
        options: ['Very sufficient', 'Somewhat sufficient', 'Not very sufficient', 'Not at all sufficient'],
        required: true,
      },
      { id: 'q2', type: 'text', prompt: 'Did our stylists listen to your needs, preferences, and personal style?' },
      {
        id: 'q3',
        type: 'choice',
        prompt: 'How did you hear about the Fill-A-Bag event?',
        options: ['Social media', 'Word of mouth', 'Posters/ads', 'Website', 'Other (specify)'],
        other: 'Tell us where you heard about it',
      },
    ],
  },
  warehouseWednesday: quickSurvey('Warehouse Wednesday Survey', 'Packing lunches for career preparators.'),
}

export function surveyForEvent(event) {
  return byProgram[event.program] ?? quickSurvey(`${event.title} Survey`, event.description)
}
