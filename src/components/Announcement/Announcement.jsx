// Figma: Components › Announcement variants (node 2045:27624) — lightest-purple message card
// with author, title, body and a "View message" secondary button.
import { X } from 'lucide-react'
import './Announcement.css'

export default function Announcement({ author, avatar, time, title, body, actionLabel = 'View message', onAction, onDismiss }) {
  return (
    <section className="announcement" aria-label={title}>
      <div className="announcement__head">
        <div className="announcement__author">
          <img src={avatar} width="33" height="33" alt="" />
          <div>
            <p className="text-label-1">{author}</p>
            <p className="text-label-2 announcement__time">{time}</p>
          </div>
        </div>
        {onDismiss && (
          <button type="button" className="announcement__close" onClick={onDismiss} aria-label="Dismiss announcement">
            <X size={24} strokeWidth={1.75} />
          </button>
        )}
      </div>
      <h2 className="text-heading-2">{title}</h2>
      <p className="text-body announcement__body">{body}</p>
      {onAction && (
        <button type="button" className="announcement__action text-label-1" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  )
}
