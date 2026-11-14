// Figma: Components › Recommended Tag (node 1126:15504)
// Variants: Property 1 = Default (purple) | Secondary (gray)
import { Bookmark } from 'lucide-react'
import './RecommendedTag.css'

// The Event card instance hides the icon, so it's optional.
export default function RecommendedTag({ variant = 'default', icon = true }) {
  return (
    <span className={`recommended-tag recommended-tag--${variant} text-label-2`}>
      {icon && <Bookmark size={12} strokeWidth={2} aria-hidden="true" />}
      Recommend
    </span>
  )
}
