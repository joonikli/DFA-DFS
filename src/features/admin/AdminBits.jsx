// Small admin-only pieces shared by the admin Events screens.
import { ArrowRight, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Saved from '../../components/Saved/Saved.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import './AdminBits.css'

/** Figma: Event card › Color=Color7 — "👥 15 Registered" + outlined bookmark */
export function AdminEventCta({ count, saved, onToggleSaved }) {
  return (
    <div className="admin-cta">
      <span className="admin-cta__count text-label-2">
        <Users size={17} strokeWidth={1.5} aria-hidden="true" />
        {count} Registered
      </span>
      <span className="admin-cta__save">
        <Saved selected={saved} onClick={onToggleSaved} />
      </span>
    </div>
  )
}

/** "To do" row: [Survey] Check missing volunteer survey → */
export function TodoItem({ kind, tone, text, to }) {
  return (
    <Link to={to} className="todo-item text-body">
      <Tags color={tone}>{kind}</Tags>
      <span className="todo-item__text">{text}</span>
      <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  )
}
