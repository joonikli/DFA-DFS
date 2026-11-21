// volunteer.html portal: the event-survey design (Figma 2502:41346) for the dashboard's survey —
// PortalSurveyPopup behind "Take our survey", PortalSurveyCard in place of the old inline card.
// Both ask the survey's own questions (rating + feedback) and complete it through the dashboard's
// existing handlers (onRate / onComment / onSubmit), so the portal's survey logic stays as written.
import { useEffect, useState } from 'react';
import SurveyPopup, { SurveyInline } from './SurveyPopup.jsx';
import { SurveyCard } from '../../volunteer/Surveys.jsx';
import { surveyForEvent } from '../../mock/surveys.js';
import { SHIFTS } from '../../data.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// "Tuesday, Dec 1" → "12/01"
const tagDate = (label) => {
  const m = /([A-Z][a-z]{2}) (\d{1,2})/.exec(label || '');
  return m ? `${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}/${m[2].padStart(2, '0')}` : undefined;
};
const descFor = (title) => Object.values(SHIFTS).find((s) => s.title === title)?.desc;
const defFor = (survey) => surveyForEvent({ title: survey.event, description: descFor(survey.event) });
const answersFor = (survey) => ({ rating: { answer: survey.rating || undefined }, feedback: { answer: survey.comment } });

/** Inline survey card (same size and id as the old one); after submitting it shows the portal's thank-you card. */
export function PortalSurveyCard({ survey, onRate, onComment, onSubmit }) {
  if (survey.done) return <SurveyCard survey={survey} />;
  return (
    <section className="card vp-survey-card" id="vpSurvey">
      <SurveyInline
        survey={defFor(survey)}
        date={tagDate(survey.date)}
        answers={answersFor(survey)}
        onChange={(id, v) => (id === 'rating' ? onRate(v.answer) : onComment(v.answer ?? ''))}
        onSubmit={onSubmit}
      />
    </section>
  );
}

/**
 * @param survey   the card's state: { event, date, rating, comment, done }
 * @param onRate / onComment / onSubmit  the same handlers the survey card uses
 */
export default function PortalSurveyPopup({ open, survey, onRate, onComment, onSubmit, onClose }) {
  const [pending, setPending] = useState(null);
  // Submit only after the card shows the popup's answers, so the card's submit reads them
  useEffect(() => {
    if (pending && survey.rating === pending.rating && survey.comment === pending.comment) { setPending(null); onSubmit(); }
  }, [pending, survey.rating, survey.comment, onSubmit]);
  if (!open) return null;
  return (
    <SurveyPopup
      survey={defFor(survey)}
      date={tagDate(survey.date)}
      initial={answersFor(survey)}
      onClose={onClose}
      onSubmit={(a) => {
        const rating = a.rating?.answer, comment = a.feedback?.answer ?? '';
        onRate(rating); onComment(comment); setPending({ rating, comment });
      }}
    />
  );
}
