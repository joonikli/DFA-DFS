import EventAsset from './EventAsset.jsx';
import './SurveyStatus.css';

export default function SurveyStatus({ status }) {
  const labels = { missing: 'Survey missing', complete: 'Survey complete', pending: 'Survey pending', unassigned: 'No survey assigned' };
  return <span className={`ae-survey-status ${status}`}>
    {labels[status]}
    {status === 'missing' && <EventAsset name="detail-survey-missing" />}
    {status === 'complete' && <EventAsset name="detail-survey-complete" />}
  </span>;
}
