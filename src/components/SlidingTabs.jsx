import { useLayoutEffect, useRef } from 'react';
import './TabNav/TabNav.css';

// Admin Events is the reference for every underlined tab row.
// `marks` (optional): item → count of unseen additions. A count > 0 shows a dot on
// that tab; each increase remounts it to replay the system's new-event pulse.
export default function SlidingTabs({ value, onChange, items, label, panelId, className = '', lineClassName = '', marks = {}, badges = {} }) {
  const ref = useRef(null);
  const geometry = useRef(null);
  const positionIndicator = (instant = false) => {
    const tabs = ref.current, selected = tabs?.querySelector('[aria-selected="true"]'), line = tabs?.lastElementChild;
    if (!selected || !line) return;
    const next = { width: selected.offsetWidth, left: selected.offsetLeft };
    // ResizeObserver also runs after a tab change. Leave an in-flight slide intact
    // when the layout effect has already set the same destination.
    if (geometry.current?.width === next.width && geometry.current?.left === next.left) return;
    if (instant) line.style.transition = 'none';
    line.style.width = `${next.width}px`;
    line.style.transform = `translateX(${next.left}px)`;
    geometry.current = next;
    if (instant) { void line.offsetWidth; line.style.transition = ''; }
  };
  useLayoutEffect(() => {
    positionIndicator(true);
    const observer = new ResizeObserver(() => positionIndicator(true));
    observer.observe(ref.current);
    ref.current.querySelectorAll('[role="tab"]').forEach(button => observer.observe(button));
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => { positionIndicator(); });
  return <div className={`tab-nav ${className}`} role="tablist" aria-label={label} ref={ref}>
    {items.map(item => {
      const key = typeof item === 'string' ? item : item.value;
      const title = typeof item === 'string' ? item : item.label;
      const active = key === value;
      const mark = !active ? marks[key] || 0 : 0;
      return <button key={key} type="button" role="tab" aria-selected={active} aria-controls={panelId} className={`tab-nav__tab${active ? ' tab-nav__tab--active on' : ''}`} onClick={() => onChange(key)}>
        <span className="tab-nav__label">{mark > 0 && <span key={mark} className="tab-nav__dot" aria-hidden="true" />}{title}{badges[key]}</span>{mark > 0 && <span className="tab-nav__sr">, new events added</span>}
      </button>;
    })}
    <span className={`tab-nav__indicator ${lineClassName}`} aria-hidden="true" />
  </div>;
}
