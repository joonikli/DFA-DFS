// Figma: Components › Filter (node 1548:10576) — pill with list-filter icon + label.
// In the prototype it toggles sort direction (soonest ↔ latest first); the
// direction is exposed via title/aria only so the pill matches Figma exactly.
import listFilter from '../../assets/list-filter.svg'
import './Filter.css'

export default function Filter({ label = 'Date', direction, onClick }) {
  const hint = direction === 'desc' ? 'Sorted latest first' : 'Sorted soonest first'
  return (
    <button type="button" className="filter" onClick={onClick} title={hint} aria-label={`${label}: ${hint}`}>
      <span className="filter__icon">
        <img src={listFilter} width="24" height="24" alt="" />
      </span>
      <span className="text-body-2">{label}</span>
    </button>
  )
}
