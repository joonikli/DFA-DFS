// Figma: Components › Filter (node 1548:10576) — pill with list-filter icon + label.
// On the volunteer Events page it opens the filter popover (date, time, location, tags);
// `active` outlines the pill while any of those filters is applied.
import { forwardRef } from 'react'
import listFilter from '../../assets/list-filter.svg'
import './Filter.css'

// No `label` = icon-only pill (pass an aria-label)
const Filter = forwardRef(function Filter({ label, active = false, className = '', ...rest }, ref) {
  return (
    <button type="button" ref={ref} className={`filter ${label ? '' : 'filter--icon'} ${active ? 'filter--active' : ''} ${className}`} {...rest}>
      <span className="filter__icon">
        <img src={listFilter} width="24" height="24" alt="" />
      </span>
      {label && <span className="text-body-2">{label}</span>}
    </button>
  )
})

export default Filter
