// Manager dashboard (port of vanilla app.js DASHBOARD section).
// 12-column widget grid laid out at the Figma width and zoomed to fit; "Edit dashboard" mode
// with drag-to-reorder (pointer events + FLIP), arrow-key moves, remove/Undo and an add picker.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Icon, Avatar } from '../../components/Icon.jsx';
import { usePop, useToast, useFitZoom, hideTip } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { ME } from '../../data.js';
import { live, reducedMotion } from '../../lib/store.js';
import { openConversation } from '../../lib/bridge.js';
import { D, WIDGETS, PRESETS, copyLayout, layout, hiddenIds, bump, useDash } from './state.js';
import { Card } from './Cards.jsx';
import { GenReport, Notifications, AccountMenu, WidgetPicker } from './Popovers.jsx';

const EASE_OUT = 'cubic-bezier(.23,1,.32,1)';
const EASE_IN_OUT = 'cubic-bezier(.77,0,.175,1)';

// One grid cell. The style attribute is written verbatim ("--span:4;--i:0") because the
// fluid-layout CSS matches on [style*="--span:4"], which React's style serialisation would break.
function Widget({ id, span, i, editing, onRemove }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current, tr = el.style.transform; // keep a live drag offset
    el.setAttribute('style', `--span:${span};--i:${i}`);
    if (tr) el.style.transform = tr;
  }, [span, i]);
  const w = WIDGETS[id];
  return (
    <div ref={ref} className="widget" data-w={id} data-w-grip="" tabIndex={editing ? 0 : -1} aria-label={`${w.label}${editing ? '. Use arrow keys to move.' : ''}`}>
      <button className="w-remove" aria-label={`Remove ${w.label}`} data-tip="Remove" onClick={() => onRemove(id, ref.current)}><Icon name="x" size={13} /></button>
      <Card id={id} />
    </div>
  );
}

export default function Dashboard() {
  useDash();
  const dashRef = useRef(null);
  const gridRef = useRef(null);
  const headActs = useRef(null);
  const pendingFocus = useRef(null);
  const dragCleanup = useRef(null);
  const pop = usePop();
  const toast = useToast();
  const notBuilt = useNotBuilt();
  const [unread, setUnread] = useState(true);
  useFitZoom(dashRef, { designWidth: 1488, minWidth: 1000 });

  // .editing is toggled imperatively so React never rewrites the class list useFitZoom owns (.fluid)
  useLayoutEffect(() => { dashRef.current.classList.toggle('editing', D.editing); });
  // Keep keyboard focus in the header when its buttons swap between modes
  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    headActs.current?.querySelector(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });
  // On leaving the dashboard: stop any drag, close its popovers (vanilla render() does closePop + hideTip)
  const popRef = useRef(pop);
  useLayoutEffect(() => { popRef.current = pop; });
  useEffect(() => () => { dragCleanup.current?.(); popRef.current.close(null, true); hideTip(); }, []);

  const zoom = () => parseFloat(dashRef.current?.style.zoom) || 1;
  const commit = (next) => { D.views[D.view].layout = next; flushSync(bump); };

  // FLIP: animate widgets from where they were to where they are now (they're already on screen, so ease-in-out)
  const flip = (mutate, except) => {
    const grid = gridRef.current;
    const before = new Map([...grid.children].map((el) => [el, el.getBoundingClientRect()]));
    mutate();
    if (reducedMotion()) return;
    const z = zoom();
    [...grid.children].forEach((el) => {
      if (el === except) return;
      const a = before.get(el); if (!a) return;
      const b = el.getBoundingClientRect();
      const dx = (a.left - b.left) / z, dy = (a.top - b.top) / z;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 260, easing: EASE_IN_OUT });
    });
  };
  // Layout with widget `id` moved to sit before widget `beforeId` (null = end)
  const moved = (id, beforeId) => {
    const cur = layout();
    const entry = cur.find(([w]) => w === id);
    const next = cur.filter(([w]) => w !== id);
    const at = beforeId ? next.findIndex(([w]) => w === beforeId) : next.length;
    next.splice(at < 0 ? next.length : at, 0, entry);
    return next;
  };
  const announcePos = (id) => {
    const pos = layout().findIndex(([w]) => w === id) + 1;
    live(`${WIDGETS[id].label} moved to position ${pos} of ${layout().length}`);
  };
  // Whole-grid repaint with a blur crossfade (Reset / Undo reset); cards remount like vanilla's innerHTML
  const repaint = (next) => {
    const grid = gridRef.current;
    const paint = () => { D.views[D.view].layout = next; D.gridGen += 1; D.chartAnim = false; flushSync(bump); D.chartAnim = true; };
    if (!grid || reducedMotion()) { paint(); return; }
    grid.animate([{ opacity: 1 }, { opacity: 0, filter: 'blur(2px)' }], { duration: 120, easing: 'ease-out' }).onfinish = () => {
      paint();
      if (grid.isConnected) grid.animate([{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 220, easing: EASE_OUT });
    };
  };

  // ---------- Edit mode ----------
  const customize = () => {
    pop.close(null, true);
    D.snapshot = copyLayout(layout());
    D.editing = true;
    pendingFocus.current = '[data-done]';
    bump();
    live('Customize mode. Drag cards to rearrange, or use the arrow keys on a card’s handle.');
  };
  const done = () => {
    const changed = JSON.stringify(D.snapshot) !== JSON.stringify(layout());
    D.editing = false; D.snapshot = null;
    pendingFocus.current = '[data-customize]';
    bump();
    if (changed) toast('Dashboard updated', { ic: 'check' });
  };
  const reset = () => {
    const snap = copyLayout(D.snapshot || layout());
    repaint(copyLayout(PRESETS[D.view]?.layout || PRESETS.default.layout));
    toast('Layout reset', { ic: 'reset', action: 'Undo', onAction: () => repaint(copyLayout(snap)) });
  };
  const addWidget = (id, span, at) => {
    if (!gridRef.current || layout().some(([w]) => w === id)) return;
    const cur = layout();
    const idx = Math.min(at ?? cur.length, cur.length);
    flip(() => commit([...cur.slice(0, idx), [id, span], ...cur.slice(idx)]));
    const node = gridRef.current.querySelector(`.widget[data-w="${id}"]`);
    if (!node) return;
    if (!reducedMotion()) node.animate([{ opacity: 0, transform: 'translateY(8px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 250, easing: EASE_OUT });
    node.classList.add('w-flash'); setTimeout(() => node.classList.remove('w-flash'), 1200);
    node.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  };
  const removeWidget = (id, el) => {
    const i = layout().findIndex(([w]) => w === id);
    if (i < 0) return;
    const entry = layout()[i];
    hideTip();
    const remove = () => { if (gridRef.current) flip(() => commit(layout().filter(([w]) => w !== id)), el); };
    if (reducedMotion()) remove();
    else el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 150, easing: EASE_OUT }).onfinish = remove;
    toast(`Removed “${WIDGETS[id].label}”`, { ic: 'eye-off', action: 'Undo', onAction: () => addWidget(entry[0], entry[1], i) });
  };
  const openPicker = (e) => pop.toggle(e.currentTarget, (
    <WidgetPicker onAdd={(id) => {
      addWidget(id, PRESETS.default.layout.find(([w]) => w === id)?.[1] || WIDGETS[id].sizes[0]);
      toast(`Added “${WIDGETS[id].label}”`, { ic: 'plus' });
    }} />
  ), { align: 'start' });

  // ---------- Drag to reorder (pointer) ----------
  const onPointerDown = (e) => {
    if (!D.editing || e.button !== 0) return;
    const el = e.target.closest('.widget');
    if (!el || e.target.closest('.w-remove')) return;
    e.preventDefault();
    const grid = gridRef.current;
    const z = zoom();
    const r0 = el.getBoundingClientRect();
    const grab = { x: e.clientX - r0.left, y: e.clientY - r0.top };
    let started = false, tx = 0, ty = 0;
    const sx = e.clientX, sy = e.clientY;
    const place = (cx, cy) => {
      const r = el.getBoundingClientRect();
      const nl = r.left - tx * z, nt = r.top - ty * z; // natural position without the drag offset
      tx = (cx - grab.x - nl) / z; ty = (cy - grab.y - nt) / z;
      el.style.transform = `translate(${tx}px, ${ty}px) scale(1.02)`;
    };
    const move = (ev) => {
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
        started = true; el.classList.add('dragging'); grid.classList.add('is-dragging'); hideTip();
      }
      place(ev.clientX, ev.clientY);
      // find the widget under the pointer and move ours before/after it
      const target = [...grid.children].find((w) => {
        if (w === el) return false;
        const b = w.getBoundingClientRect();
        return ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom;
      });
      if (!target) return;
      const b = target.getBoundingClientRect();
      const after = (ev.clientY - b.top) / b.height > 0.5 || ((ev.clientX - b.left) / b.width > 0.5 && b.height < 260);
      const ref = after ? target.nextElementSibling : target;
      if (ref === el || el.nextElementSibling === ref) return;
      flip(() => commit(moved(el.dataset.w, ref?.dataset.w ?? null)), el);
      place(ev.clientX, ev.clientY);
    };
    const detach = () => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      dragCleanup.current = null;
    };
    const up = () => {
      detach();
      if (!started) return;
      grid.classList.remove('is-dragging');
      const from = el.style.transform;
      // rewrite the style attribute verbatim (CSSOM edits reserialise it as "--span: 4", which the fluid CSS can't match)
      const id = el.dataset.w, idx = layout().findIndex(([w]) => w === id);
      el.setAttribute('style', `--span:${layout()[idx][1]};--i:${idx}`);
      el.classList.remove('dragging');
      if (!reducedMotion()) el.animate([{ transform: from }, { transform: 'none' }], { duration: 200, easing: EASE_OUT });
      announcePos(el.dataset.w);
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    dragCleanup.current = detach;
  };
  // Arrow keys on a focused card move it one slot
  const onKeyDown = (e) => {
    const g = e.target.closest('[data-w-grip]');
    if (!g || !D.editing || e.target !== g) return;
    const dir = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key]; if (!dir) return;
    e.preventDefault();
    const sib = dir < 0 ? g.previousElementSibling : g.nextElementSibling;
    if (!sib) return;
    const beforeEl = dir < 0 ? sib : sib.nextElementSibling;
    // Keyboard moves are instant (no FLIP): they repeat fast and should never feel laggy
    commit(moved(g.dataset.w, beforeEl?.dataset.w ?? null));
    g.focus();
    announcePos(g.dataset.w);
  };

  // ---------- Top nav + header popovers ----------
  const openNotifs = (e) => pop.toggle(e.currentTarget, (
    <Notifications
      onReadAll={() => setUnread(false)}
      onOpen={(k) => {
        setUnread(false);
        if (k === 'sophia') openConversation('c2');
        else dashRef.current?.querySelector(`[data-card="${k === 'e15' ? 'calendar' : 'grants'}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    />
  ), { align: 'end' });
  const openMe = (e) => pop.toggle(e.currentTarget, <AccountMenu onSettings={() => notBuilt('Settings')} />, { align: 'end' });
  const openGen = (e) => pop.toggle(e.currentTarget, <GenReport />, { align: 'end' });

  const hidden = hiddenIds().length;
  return (
    <div className="dash" ref={dashRef}>
      <div className="top-nav">
        <button className="tn-bell" aria-label={unread ? 'Notifications, 3 new' : 'Notifications'} aria-haspopup="dialog" onClick={openNotifs}>
          <Icon name="bell" size={22} />{unread && <i className="tn-dot" aria-hidden="true" />}
        </button>
        <span className="tn-sep" aria-hidden="true" />
        <button className="tn-me" aria-label="Account" aria-haspopup="menu" onClick={openMe}><Avatar id="me" /></button>
      </div>
      <header className="dash-head" id="dashHead">
        <h1 className="h1">Hi {ME.first}, let’s see what’s going on…</h1>
        {D.editing ? (
          <div className="acts edit-acts" ref={headActs}>
            <span className="edit-hint">Drag to move · × to remove</span>
            {hidden > 0 && <button className="btn btn-outline" aria-haspopup="dialog" onClick={openPicker}><Icon name="plus" size={15} /> Add cards <span className="add-count">{hidden}</span></button>}
            <button className="btn btn-ghost" onClick={reset}><Icon name="reset" size={15} /> Reset</button>
            <button className="btn btn-dark" data-done="" onClick={done}>Done</button>
          </div>
        ) : (
          <div className="acts" ref={headActs}>
            <button className="btn btn-outline" data-customize="" onClick={customize}>Customize</button>
            <button className="btn btn-dark" aria-haspopup="dialog" onClick={openGen}>Generate report</button>
          </div>
        )}
      </header>
      <div className="wgrid" id="wgrid" ref={gridRef} onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
        {layout().map(([id, span], i) => (
          <Widget key={`${id}-${D.gridGen}`} id={id} span={span} i={i} editing={D.editing} onRemove={removeWidget} />
        ))}
      </div>
    </div>
  );
}
