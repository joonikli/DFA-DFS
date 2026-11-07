// Shared UI primitives: origin-aware popovers, toasts, tooltips, segmented control,
// scale-to-fit. Motion follows MOTION.md (tokens live in styles.css).
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon.jsx';
import { reducedMotion } from '../lib/store.js';

/* ---------------------------------------------------------------------------
   Popovers — usePop().toggle(anchorEl, <Content/>, { align, side, cls, onClose })
   Scale in from the trigger (transform-origin = trigger), close on outside
   pointerdown (animated) or Escape (instant: keyboard actions don't animate).
--------------------------------------------------------------------------- */
const PopCtx = createContext(null);
export const usePop = () => useContext(PopCtx);
// Inside popover content: const close = usePopClose(); close() / close(true) for instant
const PopItemCtx = createContext(() => {});
export const usePopClose = () => useContext(PopItemCtx);

function PopLayer({ pops, onRequestClose }) {
  return createPortal(
    <div id="layer">
      {pops.map((p) => <PopBox key={p.key} p={p} onRequestClose={onRequestClose} />)}
    </div>,
    document.body,
  );
}

function PopBox({ p, onRequestClose }) {
  const ref = useRef(null);
  const [state, setState] = useState('closed');
  useLayoutEffect(() => {
    const place = () => {
      const el = ref.current; if (!el || !p.anchor.isConnected) return;
      const { align = 'start', offset = 8 } = p.opts;
      let side = p.opts.side || 'bottom';
      const r = p.anchor.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      let top = side === 'bottom' ? r.bottom + offset : r.top - h - offset;
      if (side === 'bottom' && top + h > innerHeight - 8 && r.top - h - offset > 8) { top = r.top - h - offset; side = 'top'; }
      if (side === 'top' && top < 8) { top = r.bottom + offset; side = 'bottom'; }
      let left = align === 'end' ? r.right - w : align === 'center' ? r.left + r.width / 2 - w / 2 : r.left;
      left = Math.max(8, Math.min(left, innerWidth - w - 8));
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      const ox = Math.min(Math.max(r.left + r.width / 2 - left, 12), w - 12);
      el.style.transformOrigin = `${ox}px ${side === 'bottom' ? 0 : h}px`;
    };
    place();
    p.anchor.setAttribute('aria-expanded', 'true');
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setState('open')));
    addEventListener('resize', place);
    document.addEventListener('scroll', place, true);
    const ro = new ResizeObserver(place); ro.observe(ref.current);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', place); document.removeEventListener('scroll', place, true); ro.disconnect(); p.anchor.setAttribute('aria-expanded', 'false'); };
  }, [p]);
  return (
    <div ref={ref} className={`pop ${p.opts.cls || ''}`} data-state={p.closing ? 'closed' : state} data-instant={p.instant ? '' : undefined}>
      <PopItemCtx.Provider value={(instant) => onRequestClose(p.key, instant)}>{p.content}</PopItemCtx.Provider>
    </div>
  );
}

export function PopProvider({ children }) {
  const [pops, setPops] = useState([]);
  const popsRef = useRef(pops); popsRef.current = pops;
  const seq = useRef(0);

  const close = useCallback((key = null, instant = false) => {
    const targets = popsRef.current.filter((p) => key == null || p.key === key);
    targets.forEach((p) => p.opts.onClose?.());
    if (instant || reducedMotion()) { setPops((ps) => ps.filter((p) => !targets.includes(p))); return; }
    setPops((ps) => ps.map((p) => (targets.includes(p) ? { ...p, closing: true } : p)));
    setTimeout(() => setPops((ps) => ps.filter((p) => !targets.some((t) => t.key === p.key))), 170);
  }, []);
  const open = useCallback((anchor, content, opts = {}) => {
    const key = ++seq.current;
    setPops((ps) => [...ps, { key, anchor, content, opts }]);
    return key;
  }, []);
  const toggle = useCallback((anchor, content, opts = {}) => {
    const ex = popsRef.current.find((p) => p.anchor === anchor && !p.closing);
    if (ex) { close(ex.key); return null; }
    close(null);
    return open(anchor, content, opts);
  }, [open, close]);
  const isOpen = useCallback((anchor) => popsRef.current.some((p) => p.anchor === anchor && !p.closing), []);

  useEffect(() => {
    const down = (e) => {
      popsRef.current.forEach((p) => {
        if (p.closing) return;
        const box = document.querySelectorAll('#layer > .pop');
        const inside = [...box].some((b) => b.contains(e.target));
        if (!inside && !p.anchor.contains(e.target)) close(p.key);
      });
    };
    const key = (e) => {
      const live = popsRef.current.filter((p) => !p.closing);
      if (e.key === 'Escape' && live.length) { e.preventDefault(); close(live[live.length - 1].key, true); }
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [close]);

  const api = useMemo(() => ({ open, close, toggle, isOpen }), [open, close, toggle, isOpen]);
  return (
    <PopCtx.Provider value={api}>
      {children}
      <PopLayer pops={pops} onRequestClose={close} />
    </PopCtx.Provider>
  );
}

/* ---------------------------------------------------------------------------
   Toasts — useToast()(message, { action, onAction, ic, duration })
--------------------------------------------------------------------------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

function ToastItem({ t, onDone }) {
  const [state, setState] = useState('closed');
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setState('open')));
    const timer = setTimeout(() => leave(), t.duration ?? 3600);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const leave = () => { setState('leaving'); setTimeout(onDone, 220); };
  return (
    <div className="toast" data-state={state} role="status">
      {t.ic !== null && <Icon name={t.ic || 'check'} size={16} />}
      <span>{t.msg}</span>
      {t.action && <button onClick={() => { t.onAction?.(); leave(); }}>{t.action}</button>}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);
  const toast = useCallback((msg, opts = {}) => {
    const id = ++seq.current;
    setToasts((ts) => [...ts, { id, msg, ...opts }]);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {createPortal(
        <div id="toasts" aria-live="polite">
          {toasts.map((t) => <ToastItem key={t.id} t={t} onDone={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} />)}
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  );
}

/* ---------------------------------------------------------------------------
   Tooltips — any element with data-tip="…". First one waits 500ms; moving to a
   neighbour within 400ms shows it instantly with no animation.
--------------------------------------------------------------------------- */
let tipEl = null, tipTimer = null, lastTipClose = 0;
export function hideTip() {
  clearTimeout(tipTimer);
  if (tipEl) { lastTipClose = Date.now(); tipEl.remove(); tipEl = null; }
}
function showTip(t, instant) {
  if (!t.isConnected || t.getAttribute('aria-expanded') === 'true') return;
  tipEl = document.createElement('div');
  tipEl.className = 'tip';
  tipEl.textContent = t.dataset.tip;
  tipEl._for = t;
  tipEl.dataset.state = 'closed';
  if (instant) tipEl.dataset.instant = '';
  document.body.appendChild(tipEl);
  const r = t.getBoundingClientRect();
  const w = tipEl.offsetWidth;
  let top = r.top - tipEl.offsetHeight - 8;
  if (top < 8) top = r.bottom + 8;
  tipEl.style.left = `${Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8))}px`;
  tipEl.style.top = `${top}px`;
  if (instant) tipEl.dataset.state = 'open';
  else requestAnimationFrame(() => requestAnimationFrame(() => { if (tipEl) tipEl.dataset.state = 'open'; }));
}
export function useGlobalTooltips() {
  useEffect(() => {
    const canHover = matchMedia('(hover: hover) and (pointer: fine)');
    const over = (e) => {
      const t = e.target.closest?.('[data-tip]');
      if (!t || !canHover.matches || (tipEl && tipEl._for === t)) return;
      const instant = Date.now() - lastTipClose < 400 || !!tipEl;
      hideTip();
      tipTimer = setTimeout(() => showTip(t, instant), instant ? 0 : 500);
    };
    const out = (e) => { const t = e.target.closest?.('[data-tip]'); if (t && !t.contains(e.relatedTarget)) hideTip(); };
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    document.addEventListener('pointerdown', hideTip);
    return () => { document.removeEventListener('pointerover', over); document.removeEventListener('pointerout', out); document.removeEventListener('pointerdown', hideTip); };
  }, []);
}

/* ---------------------------------------------------------------------------
   Segmented control with a sliding thumb.
   <Segmented value onChange options={[{ v, label }]} className="purple" />
--------------------------------------------------------------------------- */
export function Segmented({ value, onChange, options, className = '', id, role = 'tablist' }) {
  const ref = useRef(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    const seg = ref.current; if (!seg) return;
    const on = seg.querySelector('button.on'), th = seg.querySelector('.seg-thumb');
    if (!on || !th) return;
    if (first.current) th.style.transition = 'none';
    th.style.width = `${on.offsetWidth}px`;
    th.style.transform = `translateX(${on.offsetLeft}px)`;
    if (first.current) { void th.offsetWidth; th.style.transition = ''; first.current = false; }
  });
  return (
    <div className={`seg ${className}`} ref={ref} id={id} role={role}>
      <span className="seg-thumb" />
      {options.map((o) => (
        <button key={o.v} type="button" role={role === 'tablist' ? 'tab' : 'radio'} {...(role === 'tablist' ? { 'aria-selected': value === o.v } : { 'aria-checked': value === o.v })} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Scale-to-fit: lay a page out at its Figma frame width and zoom it to fit.
   useFitZoom(ref, { designWidth, minWidth, fillHeight })
--------------------------------------------------------------------------- */
export function useFitZoom(ref, { designWidth, minWidth = 1000, measure = 'parent', fillHeight = false } = {}) {
  const [zoom, setZoom] = useState(1);
  useLayoutEffect(() => {
    const fit = () => {
      const el = ref.current; if (!el) return;
      const w = measure === 'window' ? innerWidth : el.parentElement.clientWidth;
      const z = w >= minWidth ? Math.min(1, w / designWidth) : 1;
      el.style.zoom = z === 1 ? '' : z;
      el.classList.toggle('fluid', w < minWidth);
      if (fillHeight) el.style.height = `${innerHeight / z}px`;
      setZoom(z);
    };
    fit();
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, [ref, designWidth, minWidth, measure, fillHeight]);
  return zoom;
}

export function LiveRegion() {
  return <div id="live" className="sr" aria-live="polite" />;
}
