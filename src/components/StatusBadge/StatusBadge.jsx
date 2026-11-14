// Figma: Components › Status (node 863:21419) — Property 1 = Red | Green
// e.g. "Survey missing ⚠" / "Survey complete ✓"
import { Check, TriangleAlert } from 'lucide-react'
import './StatusBadge.css'

const ICONS = { red: TriangleAlert, green: Check }

/** @param {'red'|'green'|'yellow'|'blue'|'gray'} color */
export default function StatusBadge({ color = 'green', icon = true, children }) {
  const Icon = icon ? ICONS[color] : null
  return (
    <span className={`status-badge status-badge--${color} text-label-2`}>
      {children}
      {Icon && <Icon size={15} strokeWidth={2} aria-hidden="true" />}
    </span>
  )
}
