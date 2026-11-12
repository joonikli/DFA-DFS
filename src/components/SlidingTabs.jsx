import { useLayoutEffect, useRef } from 'react';

// Shared layout-based indicator used by both admin and volunteer event tabs.
export default function SlidingTabs({ value, onChange, items, label, panelId, className, lineClassName }) {
  const ref = useRef(null);
  const positionIndicator = (instant = false) => {
    const tabs = ref.current, selected = tabs?.querySelector('[aria-selected="true"]'), line = tabs?.lastElementChild;
    if (!selected || !line) return;
    if (instant) line.style.transition = 'none';
    line.style.width = `${selected.offsetWidth}px`;
    line.style.transform = `translateX(${selected.offsetLeft}px)`;
    if (instant) { void line.offsetWidth; line.style.transition = ''; }
  };
  useLayoutEffect(() => {
    positionIndicator(true);
    const observer = new ResizeObserver(() => positionIndicator(true));
    observer.observe(ref.current);
    ref.current.querySelectorAll('[role="tab"]').forEach(button => observer.observe(button));
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => { positionIndicator(); }, [value]);
  return <div className={className} role="tablist" aria-label={label} ref={ref}>
    {items.map(item => <button key={item} role="tab" aria-selected={value === item} aria-controls={panelId} className={value === item ? 'on' : ''} onClick={() => onChange(item)}>{item}</button>)}
    <span className={lineClassName} aria-hidden="true" />
  </div>;
}
