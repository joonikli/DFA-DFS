import './EditButton.css'

// Shared neutral edit action for admin and volunteer screens.
export default function EditButton({ label = 'Edit', iconOnly = false, className = '', ...props }) {
  return (
    <button type="button" className={`edit-button${iconOnly ? ' edit-button--icon' : ''} ${className}`} {...props}>
      <img src="/assets/events/detail-pen.svg" width="16" height="16" alt="" aria-hidden="true" />
      {!iconOnly && <span>{label}</span>}
    </button>
  )
}
