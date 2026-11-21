// Figma: Sidebar (instance 56:199 in every screen) + Nav Item (Property 1 = Default | Selected)
import { Calendar, CircleDollarSign, FilePen, House, MessagesSquare, Settings } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import Logo from '../Logo/Logo.jsx'
import { useDemo } from '../../store/DemoStore.jsx'
import { CONVOS, GROUPS } from '../../data.js'
import { useStore } from '../../lib/store.js'
import './Sidebar.css'

const MAIN_NAV = [
  { to: '/', label: 'Dashboard', Icon: House, end: true },
  { to: '/events', label: 'Events', Icon: Calendar },
  { to: '/surveys', label: 'Surveys', Icon: FilePen },
  { to: '/grants', label: 'Grants', Icon: CircleDollarSign },
  { to: '/messages', label: 'Messages', Icon: MessagesSquare },
]

export function NavItem({ to, label, Icon, end, badge }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item text-body ${isActive ? 'nav-item--selected' : ''}`}>
      <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
      {label}
      {badge > 0 && <span className="nav-item__badge" aria-label={`${badge} unread`}>{badge}</span>}
    </NavLink>
  )
}

export default function Sidebar() {
  const { role, messages } = useDemo()
  const { pathname } = useLocation()
  useStore() // re-render when the admin inbox (Lan's Messages, src/data.js) changes
  // Volunteer: unread messages + announcements in their inbox.
  // Admin: unread in the manager inbox, hidden while Messages is open (as in the manager app).
  const unread =
    role === 'volunteer'
      ? messages ? [...messages.convos, ...messages.groups].reduce((n, x) => n + x.unread, 0) : 0
      : pathname === '/messages' ? 0 : [...CONVOS, ...GROUPS].reduce((n, x) => n + x.unread, 0)
  return (
    <nav className="sidebar" aria-label="Main">
      <div className="sidebar__logo">
        <Logo />
      </div>
      <div className="sidebar__items">
        {MAIN_NAV.map((item) => (
          <NavItem key={item.to} {...item} badge={item.to === '/messages' ? unread : 0} />
        ))}
      </div>
      <div className="sidebar__footer">
        <NavItem to="/settings" label="Settings" Icon={Settings} />
      </div>
    </nav>
  )
}
