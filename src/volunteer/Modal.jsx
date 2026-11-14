// Volunteer-portal modal (vanilla openModal/closeModal): scrim + dialog panel, animated
// open/close via data-state, scrim click closes (animated), Escape closes (instant),
// first control is focused on open.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { reducedMotion } from '../lib/store.js';
import { portalRoot } from '../lib/appScope.js';

const FOCUS_SEL = 'input, textarea, button:not([data-act="close-modal"])';

export function Modal({ label, onClosed, children }) {
  const [state, setState] = useState('closed');
  const panel = useRef(null);
  const closing = useRef(false);
  const timer = useRef(null);

  const close = useCallback((instant = false) => {
    if (closing.current) return;
    closing.current = true;
    if (instant || reducedMotion()) { onClosed(); return; }
    setState('closed');
    timer.current = setTimeout(onClosed, 160);
  }, [onClosed]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setState('open')));
    const focus = setTimeout(() => {
      const p = panel.current; if (!p) return;
      (p.querySelector(FOCUS_SEL) || p.querySelector('button'))?.focus();
    }, 60);
    return () => { cancelAnimationFrame(raf); clearTimeout(focus); clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    const key = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      // An open popover takes Escape first (PopProvider handles it)
      if (document.querySelector('#layer > .pop:not([data-state="closed"])')) return;
      close(true);
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [close]);

  return createPortal(
    <div className="modal" data-state={state}>
      <div className="modal-scrim" data-act="close-modal" onClick={() => close()} />
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={label} ref={panel}>
        {typeof children === 'function' ? children(close) : children}
      </div>
    </div>,
    portalRoot(),
  );
}
