// Figma: Components › Notification (node 2084:28493)
// Variants: Property 1 = Default (thumbnail) | Success (green check) | Alert (yellow triangle)
// Used both as a toast (Final › Notification › "Upon registering event/Confirmation")
// and as a row in the notifications panel.
import { ArrowRight, Check, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Notification.css'

/** Renders [['You', true], [' registered for ', false], …] as bold/regular runs. */
export function RichText({ parts }) {
  return parts.map(([text, bold], i) => (bold ? <strong key={i}>{text}</strong> : <span key={i}>{text}</span>))
}

/**
 * @param {'default'|'success'|'alert'} variant
 * @param {string} [image]      thumbnail for the default variant
 * @param {Array}  parts        title as rich-text runs
 * @param {string} [preview]    one-line gray body text
 * @param {string} time         "2h ago" / "Now"
 * @param {string} category     "Event" / "Messages"
 * @param {{label: string, detail: string, to: string}} [link]  purple chip under the text
 * @param {boolean} [unread]
 */
export default function Notification({ variant = 'default', image, parts, preview, time, category, link, unread, onClick, as = 'div' }) {
  const Tag = as
  return (
    <Tag className={`notification notification--${variant} ${unread ? 'notification--unread' : ''}`} onClick={onClick}>
      <div className="notification__media">
        {variant === 'success' && <Check size={36} strokeWidth={2.5} aria-hidden="true" />}
        {variant === 'alert' && <TriangleAlert size={36} strokeWidth={1.75} aria-hidden="true" />}
        {variant === 'default' && image && <img src={image} alt="" />}
      </div>
      <div className="notification__text">
        <div className="notification__title text-body">
          <p>
            <RichText parts={parts} />
          </p>
          {unread && <span className="notification__dot" aria-label="Unread" />}
        </div>
        {preview && <p className="notification__preview text-body">{preview}</p>}
        <p className="notification__meta text-label-2">
          {time}
          <span className="notification__sep" aria-hidden="true" />
          {category}
        </p>
        {link && (
          <Link to={link.to} className="notification__link text-body" onClick={(e) => e.stopPropagation()}>
            {link.label}
            <span className="notification__link-dot" aria-hidden="true" />
            {link.detail}
            <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        )}
      </div>
    </Tag>
  )
}
