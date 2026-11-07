import { ICONS } from '../lib/icons.js';
import { ME, VOLS } from '../data.js';
import { initials } from '../lib/store.js';

// Lucide icon by key (see src/lib/icons.js for the key → Lucide name map)
export function Icon({ name, size = 16, sw = 2, className = '', style }) {
  return (
    <svg
      className={`ic ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
      dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }}
    />
  );
}

// Person avatar: Unsplash photo when the person has one, initials otherwise.
// id is a key of VOLS, or 'me' for the signed-in manager (Bridget).
export function Avatar({ id, className = '' }) {
  const p = id === 'me' ? ME : VOLS[id];
  if (!p) return <span className={`av ${className}`} aria-hidden="true" />;
  return (
    <span className={`av ${className}`} aria-hidden="true">
      {p.photo ? <img src={p.photo} alt="" loading="lazy" /> : initials(p.name)}
    </span>
  );
}
