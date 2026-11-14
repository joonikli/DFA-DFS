// Post-shift thank-you banner (Figma 1218:15194): pink gradient, diagonal stripes,
// "Take our survey" jumps to the survey card. Leaving (dismiss, or the survey gets submitted):
// fade + slight scale (150ms ease-out), then the gap closes (200ms ease-in-out) so the page
// below glides up instead of jumping.
import { useEffect, useRef } from 'react';
import { Icon } from '../components/Icon.jsx';
import { reducedMotion } from '../lib/store.js';

const STRIPES = [455.565, 168.565, 114.565, 29.565].map((right, i) => ({ right, top: [47, -148, -29, 53][i] }));

export function Banner({ leave = false, onSurvey, onDismiss, onGone }) {
  const ref = useRef(null);
  const gone = useRef(false);
  const exit = () => {
    const b = ref.current;
    if (gone.current) return; gone.current = true;
    if (!b || reducedMotion()) { onGone(); return; }
    const fade = b.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.98)' }],
      { duration: 150, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' },
    );
    fade.onfinish = () => {
      const h = b.offsetHeight, mb = getComputedStyle(b).marginBottom;
      b.animate(
        [{ height: `${h}px`, marginBottom: mb }, { height: '0px', marginBottom: '0px' }],
        { duration: 200, easing: 'cubic-bezier(.77,0,.175,1)', fill: 'forwards' },
      ).onfinish = () => onGone();
    };
  };
  const dismiss = () => { onDismiss(); exit(); };
  useEffect(() => { if (leave) exit(); }, [leave]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="vp-thanks" id="vpBanner" aria-label="Thanks for volunteering" ref={ref}>
      <div className="vp-thanks-art" aria-hidden="true">
        <img className="vp-thanks-dot" src="/assets/banner/ellipse.svg" alt="" width="190" height="190" />
        {STRIPES.map((s) => <span key={s.right} className="vp-thanks-stripe" style={{ right: s.right, top: s.top }}><i /></span>)}
      </div>
      <div className="vp-thanks-main">
        <h2>Thanks for volunteering with us today! Before you leave…</h2>
        <button className="vp-thanks-cta" onClick={onSurvey}>Take our survey <Icon name="plus" size={16} /></button>
      </div>
      <button className="vp-thanks-x" aria-label="Dismiss" data-tip="Dismiss" onClick={dismiss}><Icon name="x" size={24} /></button>
    </section>
  );
}
