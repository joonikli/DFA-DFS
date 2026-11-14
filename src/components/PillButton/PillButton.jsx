// Small 12px pill button used on the dashboards ("See all", "View survey", "Submit").
// Figma uses a library "Button" instance (Simple Design System, node 157:5119) for these.
import './PillButton.css'

/** @param {'outline'|'inverse'} variant */
export default function PillButton({ variant = 'outline', block = false, className = '', children, ...rest }) {
  return (
    <button type="button" className={`pill-btn pill-btn--${variant} ${block ? 'pill-btn--block' : ''} ${className}`} {...rest}>
      {children}
    </button>
  )
}
