// Figma: Components › choice (node 1366:19036) — the gray rounded input box
// Variants: Default | hover | select | dropdown | empty. Also: time1 (node 1558:11622), Radio Button (1133:18770).
import { useEffect, useId, useMemo, useRef, useState } from 'react'
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

const pad2 = (n) => String(n).padStart(2, '0')
/** "14:00" → "02:00 PM" (Figma "time1" format) */
function formatTime(value) {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  return `${pad2(h % 12 || 12)}:${pad2(m)} ${h < 12 ? 'AM' : 'PM'}`
}
// min / max ("HH:MM", inclusive) limit the list; omitted = the whole day
function timeOptions(step, current, min = '00:00', max = '23:59') {
  const list = []
  for (let mins = 0; mins < 24 * 60; mins += step) {
    const t = `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`
    if (t >= min && t <= max) list.push(t)
  }
  if (current && current >= min && current <= max && !list.includes(current)) list.push(current)
  return list.sort()
}
/** Typed time → "HH:MM" within min / max, or null. Accepts "6pm", "6:30 pm", "630p", "18:30", "1830".
    A bare hour ("6") reads as PM when only the PM time fits min / max. */
function parseTime(text, min = '00:00', max = '23:59') {
  const match = text.trim().toLowerCase().replace(/\./g, '').match(/^(\d{1,2})(?::?(\d{2}))?\s*([ap])?m?$/)
  if (!match) return null
  let h = Number(match[1])
  const mins = Number(match[2] ?? 0)
  if (mins > 59) return null
  if (match[3]) {
    if (h < 1 || h > 12) return null
    h = (h % 12) + (match[3] === 'p' ? 12 : 0)
  } else if (h > 23) return null
  const fmt = (hours) => `${pad2(hours)}:${pad2(mins)}`
  const fits = (t) => t >= min && t <= max
  let t = fmt(h)
  if (!match[3] && h >= 1 && h < 12 && !fits(t) && fits(fmt(h + 12))) t = fmt(h + 12)
  return fits(t) ? t : null
}

/**
 * Figma "time1": clock icon + time. Pass showIcon={false} to hide the clock.
 * No Figma frame for the open state, so the list reuses the app's menu panel
 * (tag picker / avatar menu) instead of the browser's native time popup.
 * Value is "HH:MM"; onChange receives an input-like event ({ target: { value } }).
 * Optional min / max ("HH:MM", inclusive) limit which times the list offers.
 * `editable` turns the trigger into a text box: type a time ("6pm", "18:30") or pick one from
 * the list. A typed time is applied on Enter / leaving the field; one that can't be read or is
 * outside min / max reverts to the last valid time. Clearing the text clears the value.
 */
export function TimeField({ showIcon = true, value = '', onChange, step = 15, min, max, editable = false, name, required, className = '', ...rest }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const ref = useRef(null)
  const listRef = useRef(null)
  const triggerRef = useRef(null)
  const listId = useId()
  const options = useMemo(() => timeOptions(step, value, min, max), [step, value, min, max])
  // Editable mode: text in the box while typing; shows the formatted value otherwise
  const [draft, setDraft] = useState(formatTime(value))
  const typing = useRef(false)
  useEffect(() => {
    if (!typing.current) setDraft(formatTime(value))
  }, [value])
  const emit = (next) => onChange?.({ target: { value: next, name, type: 'time' } })
  function commit(text) {
    typing.current = false
    if (!text.trim()) {
      if (value) emit('')
      setDraft('')
      return
    }
    const t = parseTime(text, min, max)
    if (t && t !== value) emit(t)
    setDraft(formatTime(t || value))
  }
  // Outside-click dismiss. Capture phase because Modal stops mousedown from
  // bubbling, which would hide it from a document-level bubble listener.
  // (Escape is handled in onKeyDown so it doesn't also close the modal.)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [open])

  function show(index) {
    const selected = options.indexOf(value)
    setActive(index ?? (selected >= 0 ? selected : 0))
    setOpen(true)
  }
  function pick(next) {
    typing.current = false
    emit(next)
    setDraft(formatTime(next))
    setOpen(false)
    triggerRef.current?.focus()
  }

  // Center the selected time when the list opens; afterwards keep the active
  // option in view. Scrolls only the list (scrollIntoView would move the modal too).
  const centered = useRef(false)
  useEffect(() => {
    if (!open) {
      centered.current = false
      return
    }
    const list = listRef.current
    const item = list?.children[active]
    if (!item) return
    if (!centered.current) {
      list.scrollTop = item.offsetTop - (list.clientHeight - item.offsetHeight) / 2
      centered.current = true
    } else if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop
    } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight
    }
  }, [open, active])

  // Editable: arrows move through the list (and fill the box), Enter applies the text.
  // Space / Home / End stay with the text box.
  function onEditKeyDown(e) {
    const last = options.length - 1
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return show()
      const next = e.key === 'ArrowDown' ? Math.min(active + 1, last) : Math.max(active - 1, 0)
      setActive(next)
      typing.current = true
      setDraft(formatTime(options[next]))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commit(draft)
      setOpen(false)
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }
  function onType(e) {
    const text = e.target.value
    typing.current = true
    setDraft(text)
    // Highlight the closest listed time to what's been typed so far
    const t = parseTime(text, min, max)
    const index = t ? options.findIndex((o) => o >= t) : -1
    if (index >= 0) setActive(index)
    if (!open) setOpen(true)
  }

  function onKeyDown(e) {
    if (editable) return onEditKeyDown(e)
    const last = options.length - 1
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        show()
      }
      return
    }
    const moves = { ArrowDown: Math.min(active + 1, last), ArrowUp: Math.max(active - 1, 0), Home: 0, End: last, PageDown: Math.min(active + 4, last), PageUp: Math.max(active - 4, 0) }
    if (e.key in moves) {
      e.preventDefault()
      setActive(moves[e.key])
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (active >= 0) pick(options[active])
    } else if (e.key === 'Escape') {
      // Close only the list, not a surrounding modal
      e.stopPropagation()
      setOpen(false)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <span className={`time-field ${className}`} ref={ref} onKeyDown={onKeyDown}>
      {editable ? (
        <span className="field field--time field--time-edit text-body" onMouseDown={(e) => e.target === e.currentTarget && e.preventDefault()} onClick={() => triggerRef.current?.focus()}>
          {showIcon && <Clock size={16} strokeWidth={2} aria-hidden="true" />}
          <input
            ref={triggerRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            className="field--time__input"
            placeholder="--:-- --"
            value={draft}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-required={required || undefined}
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            onChange={onType}
            onClick={() => !open && show()}
            onBlur={(e) => {
              if (ref.current?.contains(e.relatedTarget)) return
              setOpen(false)
              commit(draft)
            }}
            {...rest}
          />
        </span>
      ) : (
      <button
        type="button"
        ref={triggerRef}
        className="field field--time text-body"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-required={required || undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        {...rest}
      >
        {showIcon && <Clock size={16} strokeWidth={2} aria-hidden="true" />}
        <span className="field--time__value">{formatTime(value) || '--:-- --'}</span>
      </button>
      )}
      {open && (
        <ul className="time-field__menu" role="listbox" id={listId} ref={listRef} aria-label={rest['aria-label']}>
          {options.map((t, i) => (
            <li
              key={t}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={t === value}
              className={`time-field__opt ${t === value ? 'time-field__opt--on' : ''} ${i === active ? 'time-field__opt--active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(t)}
            >
              {formatTime(t)}
            </li>
          ))}
        </ul>
      )}
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
