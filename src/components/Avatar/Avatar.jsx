// Round avatar: photo if given, otherwise initials on the gray circle the Figma frames use.
import { User } from 'lucide-react'
import { initials } from '../../mock/volunteers.js'

export default function Avatar({ name, src, size = 34, tone = 'gray' }) {
  const bg = tone === 'purple' ? 'var(--primary-light-purple)' : 'var(--neutral-dark-gray)'
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: src ? undefined : bg,
    color: tone === 'purple' ? 'var(--primary-darkest-purple)' : 'var(--neutral-white)',
    fontSize: Math.round(size * 0.38),
    fontWeight: 600,
  }
  if (src) return <img src={src} alt="" width={size} height={size} style={{ ...style, objectFit: 'cover' }} />
  return (
    <span style={style} aria-hidden="true">
      {name ? initials(name) : <User size={size * 0.55} strokeWidth={1.75} />}
    </span>
  )
}
