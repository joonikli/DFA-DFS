// index.html router app: the event-survey-popup (Figma 2502:41346) for an event, wired to the demo
// store (saves the answers, shows the "Thanks!" toast). EventFlows renders this for the survey flow.
import SurveyPopup from './SurveyPopup.jsx';
import { surveyForEvent } from '../../mock/surveys.js';
import { useDemo } from '../../store/DemoStore.jsx';

const pad = (n) => String(n).padStart(2, '0');

export default function RouterSurveyPopup({ event, onClose }) {
  const { submitSurvey, showToast } = useDemo();
  return (
    <SurveyPopup
      survey={surveyForEvent(event)}
      date={`${pad(event.start.getMonth() + 1)}/${pad(event.start.getDate())}`}
      onClose={onClose}
      onSubmit={(answers) => {
        submitSurvey(event.id, answers);
        showToast({
          variant: 'success',
          parts: [['Thanks!', true], [' Your feedback for ', false], [event.title, true], [' was sent.', false]],
          time: 'Now',
          category: 'Event',
        });
      }}
    />
  );
}
