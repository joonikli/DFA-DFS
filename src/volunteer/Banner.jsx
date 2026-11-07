// Latest-announcement banner (megaphone badge, pill, 2-line clamp, Read message, dismiss)
import { useRef } from 'react';
import { Avatar, Icon } from '../components/Icon.jsx';
import { ME } from '../data.js';
import { reducedMotion } from '../lib/store.js';
import { announcement, firstName } from './shared.js';

export function Banner({ onRead, onDismiss, onGone }) {
  const ref = useRef(null);
  const { g, a } = announcement();
  const dismiss = () => {
    const b = ref.current;
    onDismiss();
    if (!b || reducedMotion()) { onGone(); return; }
    b.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.98)' }],
      { duration: 150, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' },
    ).onfinish = () => onGone();
  };
  return (
    <section className="vp-banner" id="vpBanner" aria-label="Latest announcement" ref={ref}>
      <span className="vp-banner-icon" aria-hidden="true"><Icon name="megaphone" size={20} /></span>
      <div className="vp-banner-main">
        <div className="vp-banner-meta"><span className="vp-pill">New announcement</span><span>{g.name}</span></div>
        <h2>{a.title}</h2>
        <p>{a.body.split('\n\n')[0]}</p>
        <div className="vp-banner-foot">
          <span className="vp-banner-by"><Avatar id="me" /><b>{firstName(ME.name)}</b><span>· {a.date}</span></span>
          <button className="vp-read" data-act="view-ann" onClick={onRead}>Read message <Icon name="arrow-r" size={14} /></button>
        </div>
      </div>
      <button className="vp-banner-x" data-act="dismiss-banner" aria-label="Dismiss announcement" data-tip="Dismiss" onClick={dismiss}>
        <Icon name="x" size={16} />
      </button>
    </section>
  );
}
