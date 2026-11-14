// Figma: Components › Button (node 813:13520)
// Variants: Color = Primary | Secondary | Tertiary, Icon = Yes | None, State = Default | Pressed
import { Minus, Plus } from 'lucide-react'
import './Button.css'

const ICONS = { plus: Plus, minus: Minus }

/**
 * @param {'primary'|'secondary'|'tertiary'} color
 * @param {'plus'|'minus'|null} icon   trailing icon ("Icon=Yes" in Figma)
 * @param {'md'|'sm'} size             md = 16px label (library), sm = 14px label (inside Event-cta)
 */
export default function Button({ color = 'primary', icon = null, size = 'md', className = '', children, ...rest }) {
  const Icon = icon ? ICONS[icon] : null
  return (
    <button
      type="button"
      className={`btn btn--${color} btn--${size} ${size === 'sm' ? 'text-label-1' : 'text-body'} ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {Icon && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
    </button>
  )
}
