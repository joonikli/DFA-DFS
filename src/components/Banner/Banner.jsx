// Figma: Components › Banner (node 2000:36567) — Type = Pink | Blue | Green
// Full-width promo banner with a dark pill CTA and a close button.
import { ArrowRight, X } from 'lucide-react'
import './Banner.css'

export default function Banner({ type = 'pink', title, cta, onCta, onClose }) {
  return (
    <section className={`banner banner--${type}`} aria-label={title}>
      <span className="banner__art" aria-hidden="true" />
      <h2 className="banner__title">{title}</h2>
      {cta && (
        <button type="button" className="banner__cta text-label-1" onClick={onCta}>
          {cta} <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      {onClose && (
        <button type="button" className="banner__close" onClick={onClose} aria-label="Dismiss">
          <X size={20} strokeWidth={2} />
        </button>
      )}
    </section>
  )
}
