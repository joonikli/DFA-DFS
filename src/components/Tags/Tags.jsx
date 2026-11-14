// Figma: Components › Tags (node 863:21544)
// Variants: Property 1 = Green | Purple | Pink | Blue | Yellow | Gray, plus "tag with x" (removable)
import { X } from 'lucide-react'
import './Tags.css'

/**
 * @param {'green'|'purple'|'pink'|'blue'|'yellow'|'gray'} color
 * @param {Function} [onRemove]  renders the "tag with x" variant
 */
export default function Tags({ color = 'green', onRemove, children }) {
  return (
    <span className={`tag tag--${color} text-label-2`}>
      {children}
      {onRemove && (
        <button type="button" className="tag__remove" onClick={onRemove} aria-label={`Remove ${children}`}>
          <X size={15} strokeWidth={1.75} />
        </button>
      )}
    </span>
  )
}
