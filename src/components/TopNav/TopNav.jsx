// Figma: Components › Top Nav (node 874:24495) — bell (Icon Select) · divider · avatar.
// The bell opens the notifications panel (Final › Notification › Example/context).
// Prototype-only addition: the avatar opens a menu to switch roles and reset demo data.
import { useCallback, useRef, useState } from 'react'
import { Bell, Check, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import avatar from '../../assets/avatar-volunteer.png'
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel.jsx'
import { PERSONAS, useDemo } from '../../store/DemoStore.jsx'
import { useDismiss } from '../../lib/useDismiss.js'
import './TopNav.css'

function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  return { open, setOpen, ref, close }
}

function BellButton() {
  const { notifications, role } = useDemo()
  const { open, setOpen, ref } = usePopover()
  const unread = notifications[role].filter((n) => n.unread).length
  return (
    <div className="top-nav__popover" ref={ref}>
      <button
        type="button"
        className="top-nav__bell"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={20} strokeWidth={2} />
        {unread > 0 && <span className="top-nav__badge" aria-hidden="true" />}
      </button>
      {open && <NotificationsPanel />}
    </div>
  )
}

function AvatarMenu() {
  const navigate = useNavigate()
  const { role, setRole, reset } = useDemo()
  const { open, setOpen, ref, close } = usePopover()

  return (
    <div className="top-nav__popover" ref={ref}>
      <button
        type="button"
        className="avatar-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
      >
        <img src={avatar} width="36" height="36" alt="" />
      </button>

      {open && (
        <div className="avatar-menu__panel" role="menu">
          <button
            type="button"
            role="menuitem"
            className="avatar-menu__item text-body"
            onClick={() => {
              close()
              navigate('/profile')
            }}
          >
            <span>View profile</span>
          </button>
          <hr />
          <p className="avatar-menu__caption text-label-2">View prototype as</p>
          {Object.entries(PERSONAS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              role="menuitemradio"
              aria-checked={role === key}
              className="avatar-menu__item text-body"
              onClick={() => {
                setRole(key)
                close()
              }}
            >
              <span>
                {p.name} <span className="avatar-menu__muted">· {p.roleLabel}</span>
              </span>
              {role === key && <Check size={16} strokeWidth={2} aria-hidden="true" />}
            </button>
          ))}
          <hr />
          <button
            type="button"
            role="menuitem"
            className="avatar-menu__item text-body"
            onClick={() => {
              reset()
              close()
            }}
          >
            <span>Reset demo data</span>
            <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function TopNav() {
  return (
    <header className="top-nav">
      <BellButton />
      <span className="top-nav__divider" aria-hidden="true" />
      <AvatarMenu />
    </header>
  )
}
