// Figma: Final › Notification › Example/context (2324:48413) — dropdown from the bell.
// Rows are <Notification/>s; filters use <SubNav/>.
import { useState } from 'react'
import { Settings } from 'lucide-react'
import Notification from '../Notification/Notification.jsx'
import SubNav from '../SubNav/SubNav.jsx'
import { useDemo } from '../../store/DemoStore.jsx'
import './NotificationsPanel.css'

export default function NotificationsPanel() {
  const { notifications, role, markRead } = useDemo()
  const [filter, setFilter] = useState('all')
  const list = notifications[role]
  const unread = list.filter((n) => n.unread).length

  const shown = list.filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? n.unread : n.category.toLowerCase() === filter,
  )

  return (
    <div className="notifications-panel" role="dialog" aria-label="Notifications">
      <div className="notifications-panel__head">
        <h2 className="text-heading-2">Notifications</h2>
        <div className="notifications-panel__actions">
          <button type="button" className="notifications-panel__mark text-body-2" onClick={() => markRead()} disabled={!unread}>
            Mark all as read
          </button>
          <button type="button" className="notifications-panel__icon" aria-label="Notification settings">
            <Settings size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="notifications-panel__filters">
        <SubNav
          label="Notification filter"
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: 'All' },
            { value: 'event', label: 'Event' },
            { value: 'messages', label: 'Messages' },
            { value: 'unread', label: `Unread (${unread})`, divider: true },
          ]}
        />
      </div>

      <ul className="notifications-panel__list">
        {shown.map((n) => (
          <li key={n.id}>
            <Notification {...n} as="div" onClick={() => n.unread && markRead(n.id)} />
          </li>
        ))}
        {!shown.length && <li className="notifications-panel__empty text-body">You’re all caught up.</li>}
      </ul>
    </div>
  )
}
