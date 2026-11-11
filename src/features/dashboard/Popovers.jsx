// Popover contents opened from the dashboard header / top nav.
import { useRef, useState } from 'react';
import { Icon, Avatar } from '../../components/Icon.jsx';
import { Segmented, usePopClose } from '../../components/ui.jsx';
import { ME } from '../../data.js';
import { navigate, VOLUNTEER_URL } from '../../lib/router.js';
import { D, TPLS, WIDGETS, hiddenIds } from './state.js';

const PERIODS = [{ v: 'month', label: 'This month' }, { v: 'q4', label: 'Q4 2026' }, { v: 'custom', label: 'Custom' }];

// Generate report: period (incl. custom range), template, Open composer
export function GenReport() {
  const [period, setPeriod] = useState(D.gen.period);
  const [tpl, setTpl] = useState(D.gen.tpl);
  // The custom range only slides in when picked after opening (vanilla adds .reveal then)
  const [revealCustom, setRevealCustom] = useState(false);
  const from = useRef(null), to = useRef(null);
  const pickPeriod = (v) => { D.gen.period = v; setPeriod(v); setRevealCustom(true); };
  const pickTpl = (v) => { D.gen.tpl = v; setTpl(v); };
  const open = () => {
    if (D.gen.period === 'custom') { D.gen.from = from.current?.value || D.gen.from; D.gen.to = to.current?.value || D.gen.to; }
    const q = new URLSearchParams({ tpl: D.gen.tpl, period: D.gen.period });
    if (D.gen.period === 'custom') { q.set('from', D.gen.from); q.set('to', D.gen.to); }
    navigate(`report?${q}`);
  };
  return (
    <div className="gen" role="dialog" aria-label="Generate report">
      <div className="eyebrow">Reporting period</div>
      <Segmented className="purple" id="perSeg" value={period} onChange={pickPeriod} options={PERIODS} />
      {period === 'custom' && (
        <div className={`custom-range ${revealCustom ? 'reveal' : ''}`}>
          <input type="date" className="field" id="genFrom" ref={from} defaultValue={D.gen.from} aria-label="From" />
          <input type="date" className="field" id="genTo" ref={to} defaultValue={D.gen.to} aria-label="To" />
        </div>
      )}
      <div className="eyebrow">Start from</div>
      <div className="tpl-list" role="radiogroup" aria-label="Template">
        {TPLS.map(([v, t, s]) => (
          <button key={v} className={`tpl ${tpl === v ? 'on' : ''}`} role="radio" aria-checked={tpl === v} onClick={() => pickTpl(v)}>
            <span className="box"><Icon name="check" size={10} sw={3} /></span><span><b>{t}</b><span>{s}</span></span>
          </button>
        ))}
      </div>
      <button className="btn btn-dark btn-block" onClick={open}>Open composer</button>
    </div>
  );
}

export const NOTIFS = [
  ['sophia', 'Sophia Chen replied', '“Could I take two more slots at the January Career Closet?”', '18 min ago'],
  ['hs19', 'Holiday Suit Drive is 46% filled', '13 spots open with 11 days to go', '1 hr ago'],
  ['grant', 'Hillman Foundation report due Dec 12', '164 of 200 women served so far', 'Yesterday'],
];
export function Notifications({ onReadAll, onOpen }) {
  const close = usePopClose();
  return (
    <div className="notif-pop" role="dialog" aria-label="Notifications">
      <div className="np-head"><b>Notifications</b><button className="link" style={{ fontSize: 12 }} onClick={() => { onReadAll(); close(); }}>Mark all read</button></div>
      {NOTIFS.map(([k, t, sub, when]) => (
        <button key={k} className="np-item" onClick={() => { close(true); onOpen(k); }}>
          <span className="np-ic">{k === 'sophia' ? <Avatar id="sophia" /> : <Icon name={k === 'grant' ? 'nav-dollar' : 'nav-calendar'} size={16} />}</span>
          <span className="np-txt"><b>{t}</b><small>{sub}</small><time>{when}</time></span>
        </button>
      ))}
    </div>
  );
}

export function AccountMenu({ onSettings }) {
  const close = usePopClose();
  return (
    <div className="menu" role="menu" style={{ width: 220 }}>
      <button className="me-head menu-item" type="button" role="menuitem" onClick={() => { close(true); navigate('profile?type=admin'); }}><Avatar id="me" /><span><b>{ME.name}</b><small>Volunteer manager</small></span></button>
      <div className="menu-sep" />
      <a className="menu-item" role="menuitem" href={VOLUNTEER_URL} style={{ textDecoration: 'none' }}><Icon name="external" size={14} /> Volunteer view</a>
      <button className="menu-item" role="menuitem" onClick={() => { close(); onSettings(); }}><Icon name="nav-settings" size={14} /> Settings</button>
    </div>
  );
}

// Edit mode: re-add removed cards, grouped by category
export function WidgetPicker({ onAdd }) {
  const close = usePopClose();
  const hidden = hiddenIds();
  const cats = [...new Set(Object.values(WIDGETS).map((w) => w.cat))];
  return (
    <div className="w-picker" role="dialog" aria-label="Add widget">
      <div className="menu-label">Removed cards</div>
      {hidden.length
        ? cats.map((c) => {
          const items = hidden.filter((k) => WIDGETS[k].cat === c);
          return items.length ? [
            <div className="wp-cat" key={c}>{c}</div>,
            ...items.map((k) => (
              <button key={k} className="wp-item" onClick={() => { close(true); onAdd(k); }}>
                <span className="wp-txt"><b>{WIDGETS[k].label}</b><small>{WIDGETS[k].desc}</small></span><span className="wp-add"><Icon name="plus" size={14} /></span>
              </button>
            )),
          ] : null;
        })
        : <div className="wp-empty"><Icon name="check" size={18} /><span>Every widget is already on this view.</span></div>}
    </div>
  );
}
