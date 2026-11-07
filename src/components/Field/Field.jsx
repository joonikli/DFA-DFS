// Figma: Components › choice (node 1366:19036) — the gray rounded input box
// Variants: Default | hover | select | dropdown | empty. Also: time1 (node 1558:11622), Radio Button (1133:18770).
import { ChevronDown, Clock } from 'lucide-react'
import './Field.css'

/** Label above a control (Figma: "Name", "Preferred Contact" …) */
export function FieldLabel({ children, required, htmlFor }) {
  return (
    <label className="field-label text-body" htmlFor={htmlFor}>
      {children}
      {required && <span className="field-label__req">*</span>}
    </label>
  )
}

export function TextField({ multiline, className = '', ...rest }) {
  const Tag = multiline ? 'textarea' : 'input'
  return <Tag className={`field field--text text-body ${multiline ? 'field--multiline' : ''} ${className}`} {...rest} />
}

export function SelectField({ options, className = '', ...rest }) {
  return (
    <span className={`field field--select ${className}`}>
      <select className="text-body" {...rest}>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
      <ChevronDown size={24} strokeWidth={1.5} aria-hidden="true" />
    </span>
  )
}

/** Figma "time1": clock icon + time */
export function TimeField(props) {
  return (
    <span className="field field--time">
      <Clock size={16} strokeWidth={2} aria-hidden="true" />
      <input type="time" className="text-body" {...props} />
    </span>
  )
}

export function Checkbox({ label, ...rest }) {
  return (
    <label className="check text-body">
      <input type="checkbox" {...rest} />
      <span className="check__box" aria-hidden="true" />
      {label}
    </label>
  )
}

/** Figma "Radio Button" (Empty | Selected) with its label */
export function Radio({ label, ...rest }) {
  return (
    <label className="radio text-body">
      <input type="radio" {...rest} />
      <span className="radio__dot" aria-hidden="true" />
      {label}
    </label>
  )
}
