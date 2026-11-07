// Figma: Components › Saved (node 954:4077)
// Variants: Property 1 = Not selected | Selected (bookmark) · Star | Starred
import { Bookmark, Star } from 'lucide-react'
import bookmarkFilled from '../../assets/bookmark-filled.svg'
import './Saved.css'

/**
 * Round 34px toggle used to save/bookmark an item.
 * @param {'bookmark'|'star'} icon
 */
export default function Saved({ selected = false, icon = 'bookmark', onClick, label = 'Save' }) {
  return (
    <button
      type="button"
      className={`saved ${selected ? 'saved--selected' : ''}`}
      aria-pressed={selected}
      aria-label={selected ? `Un${label.toLowerCase()}` : label}
      title={selected ? `Un${label.toLowerCase()}` : label}
      onClick={onClick}
    >
      {icon === 'star' ? (
        <Star size={18} strokeWidth={1.75} fill={selected ? 'currentColor' : 'none'} />
      ) : selected ? (
        <img src={bookmarkFilled} width="18" height="26" alt="" />
      ) : (
        <Bookmark size={16} strokeWidth={1.5} />
      )}
    </button>
  )
}
