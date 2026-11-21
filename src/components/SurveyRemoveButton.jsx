import { X } from 'lucide-react'
import './SurveyRemoveButton.css'

export default function SurveyRemoveButton({ onRemove }) {
  return <button type="button" className="survey-attachment__remove" aria-label="Remove survey" title="Remove survey" onClick={onRemove}><X size={16} strokeWidth={1.75} aria-hidden="true" /></button>
}
