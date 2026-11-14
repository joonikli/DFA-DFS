// "• Open" / "• Closed" pill used on survey cards and the survey header (Figma: Survey Card, Survey specific).
import './StatusPill.css'

const LABELS = { open: 'Open', closed: 'Closed', draft: 'Draft' }

export default function StatusPill({ status = 'open', children, ...rest }) {
  return (
    <span className={`status-pill status-pill--${status} text-label-2`} {...rest}>
      <span className="status-pill__dot" aria-hidden="true" />
      {children ?? LABELS[status]}
    </span>
  )
}
