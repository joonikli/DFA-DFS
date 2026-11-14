import { useLayoutEffect, useRef } from 'react';

// Shared layout-based indicator used by both admin and volunteer event tabs.
// `marks` (optional): item → count of unseen additions. A count > 0 shows a dot on
// that tab (style `.tab-mark` per page); each increase remounts it to replay its pulse.
export default function SlidingTabs({ value, onChange, items, label, panelId, className, lineClassName, marks = {} }) {
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
    {items.map(item => {
      const mark = item !== value ? marks[item] || 0 : 0;
      return <button key={item} role="tab" aria-selected={value === item} aria-controls={panelId} className={value === item ? 'on' : ''} onClick={() => onChange(item)}>
        <span className="tab-label">{mark > 0 && <span key={mark} className="tab-mark" aria-hidden="true" />}{item}</span>{mark > 0 && <span className="sr">, new events added</span>}
      </button>;
    })}
    <span className={lineClassName} aria-hidden="true" />
  </div>;
}
