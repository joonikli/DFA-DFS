// Figma: Sidebar (instance 56:199 in every screen) + Nav Item (Property 1 = Default | Selected)
import { Calendar, CircleDollarSign, FilePen, House, MessagesSquare, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Logo from '../Logo/Logo.jsx'
import './Sidebar.css'

const MAIN_NAV = [
  { to: '/', label: 'Dashboard', Icon: House, end: true },
  { to: '/events', label: 'Events', Icon: Calendar },
  { to: '/surveys', label: 'Surveys', Icon: FilePen },
  { to: '/grants', label: 'Grants', Icon: CircleDollarSign },
  { to: '/messages', label: 'Messages', Icon: MessagesSquare },
]

export function NavItem({ to, label, Icon, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item text-body ${isActive ? 'nav-item--selected' : ''}`}>
      <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main">
      <div className="sidebar__logo">
        <Logo />
      </div>
      <div className="sidebar__items">
        {MAIN_NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
      <div className="sidebar__footer">
        <NavItem to="/settings" label="Settings" Icon={Settings} />
      </div>
    </nav>
  )
}
