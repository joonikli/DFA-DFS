// Figma: Components › Toggle (node 874:21645)
// Variants: Property 1 = Row | Grid  (which view is active)
import { Grip, LayoutList } from 'lucide-react'
import './Toggle.css'

const OPTIONS = [
  { value: 'grid', label: 'Grid view', Icon: Grip },
  { value: 'list', label: 'List view', Icon: LayoutList },
]

export default function Toggle({ value, onChange }) {
  return (
    <div className="toggle" role="radiogroup" aria-label="View">
      {OPTIONS.map(({ value: v, label, Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          aria-label={label}
          title={label}
          className={`toggle__option ${value === v ? 'toggle__option--active' : ''}`}
          onClick={() => onChange(v)}
        >
          <Icon size={20} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}
