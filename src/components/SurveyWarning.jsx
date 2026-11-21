import { TriangleAlert } from 'lucide-react'
import './SurveyWarning.css'

export default function SurveyWarning({ label }) {
  return (
    <span className={`survey-warning${label ? ' survey-warning--label' : ''}`} role={label ? undefined : 'img'} aria-label={label ? undefined : 'Survey missing'} title={label || 'Survey missing'}>
      <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  )
}
