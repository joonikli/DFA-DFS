// Figma: Components › Sub nav (node 908:26429) — pill filter tabs
// Variants: Property 1 = Selected | Not selected
import './SubNav.css'

/** @param {{value: string, label: string, divider?: boolean}[]} items */
export default function SubNav({ items, value, onChange, label = 'Filter' }) {
  return (
    <div className="sub-nav" role="tablist" aria-label={label}>
      {items.map((it) => (
        <span key={it.value} className="sub-nav__wrap">
          {it.divider && <span className="sub-nav__divider" aria-hidden="true" />}
          <button
            type="button"
            role="tab"
            aria-selected={value === it.value}
            className={`sub-nav__item ${value === it.value ? 'sub-nav__item--selected text-body-2' : 'text-body'}`}
            onClick={() => onChange(it.value)}
          >
            {it.label}
          </button>
        </span>
      ))}
    </div>
  )
}
