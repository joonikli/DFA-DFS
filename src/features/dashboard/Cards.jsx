// The dashboard's card bodies (one per widget id). Markup and class names mirror vanilla
// Dash.cardHTML so src/styles.css styles them unchanged.
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Icon } from '../../components/Icon.jsx';
import { LineChart } from '../../components/LineChart.jsx';
import { usePop, usePopClose } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { SURVEY, HOURS, PARTICIPATION, PARTICIPATION_MORE, GRANTS, GRANTS_MORE, LOCATIONS, TODAY } from '../../data.js';
import { reducedMotion } from '../../lib/store.js';
import { useMsgShift } from './hooks.js';
import { navigate } from '../../lib/router.js';
import { D, bump, EXEC, PERIOD_LABEL, RANGE_LABEL } from './state.js';
import { CalendarCard } from './Calendar.jsx';

// Small option menu used by the exec-summary period and the chart range buttons
function OptionMenu({ width, options, value, onPick }) {
  const close = usePopClose();
  return (
    <div className="menu" style={{ width }}>
      {Object.entries(options).map(([v, l]) => (
        <button key={v} className={`menu-item ${value === v ? 'on' : ''}`} onClick={() => { onPick(v); close(); }}>{l}</button>
      ))}
    </div>
  );
}

function HoursCard() {
  return (
    <div className="card" data-card="hours"><div className="eyebrow-n">Total volunteer hours</div>
      <div className="big">262<small>hours</small></div><div className="trend" style={{ marginTop: 12, fontSize: 15 }}>+22% from last month</div>
      <div className="hr" /><div className="split"><span>Avg 12.4 hrs / volunteer</span><span>83% retention</span></div>
    </div>
  );
}

function BaseCard() {
  return (
    <div className="card" data-card="base"><div className="eyebrow-n">Volunteer base</div>
      <div className="stat-row" style={{ paddingTop: 0 }}><div><div className="lbl">Individual Volunteers</div><div className="trend"><Icon name="trend" size={14} /> +8 this month</div></div><div className="big">92</div></div>
      <div className="stat-row" style={{ paddingBottom: 0 }}><div><div className="lbl">Group volunteers</div><div className="trend"><Icon name="trend" size={14} /> +3 this month</div></div><div className="big">28</div></div>
    </div>
  );
}

function SurveyCard() {
  const notBuilt = useNotBuilt();
  const maxS = Math.max(...SURVEY.map((s) => s.n));
  return (
    <div className="card" data-card="survey"><div className="eyebrow-n">Post-event survey</div>
      <div className="bars">
        {SURVEY.map((s, i) => <div key={i} className="bar grow" style={{ height: `${(s.n / maxS) * 100}%`, animationDelay: `${i * 40}ms` }} data-tip={`${s.event} — ${s.n} responses`} />)}
      </div>
      <div className="bar-foot"><span>4.6 / 5 avg rating</span><span>248 responses</span></div>
      <button className="link" onClick={() => notBuilt('Surveys')}>View survey data <Icon name="arrow-r" size={14} /></button>
    </div>
  );
}

function ExecCard() {
  const pop = usePop();
  const msgShift = useMsgShift();
  const textRef = useRef(null);
  const [shown, setShown] = useState(D.execPeriod);
  // blur hides the seam between old and new text (Emil tip #7)
  const crossfade = (v) => {
    const el = textRef.current;
    if (!el || reducedMotion()) { setShown(v); return; }
    el.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(2px)' }], { duration: 120, easing: 'ease-out' }).onfinish = () => {
      flushSync(() => setShown(v));
      el.animate([{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 200, easing: 'cubic-bezier(.23,1,.32,1)' });
    };
  };
  const openMenu = (e) => pop.toggle(e.currentTarget, (
    <OptionMenu width={170} options={PERIOD_LABEL} value={D.execPeriod} onPick={(v) => { D.execPeriod = v; bump(); crossfade(v); }} />
  ), { align: 'end' });
  return (
    <section className="exec" data-card="exec">
      <div className="top"><h2 className="h2" style={{ color: '#fff' }}>Executive summary</h2>
        <button className="btn-select on-dark" aria-haspopup="menu" onClick={openMenu}>{PERIOD_LABEL[D.execPeriod]} <Icon name="chev" size={16} /></button></div>
      <p id="execText" ref={textRef}>{EXEC[shown]}</p>
      <button className="link" aria-expanded={D.execOpen} aria-controls="execMore" onClick={() => { D.execOpen = !D.execOpen; bump(); }}>View recommended action items <Icon name="arrow-r" size={14} /></button>
      <div className={`expand ${D.execOpen ? 'open' : ''}`} id="execMore"><div><ul className="actions-list">
        <li><b>Recruit 6 more drivers</b>Mobile Services is capped by drivers, not demand — 3 routes were cut short in November.</li>
        <li><b>Re-engage 14 lapsed volunteers</b>They logged 2+ shifts in spring but none since September.</li>
        <li><b>Fill the Holiday Suit Drive</b>11 of 24 spots filled for Dec 19. <button className="link" style={{ color: '#fff', marginTop: 6 }} onClick={() => msgShift('hs19')}>Message volunteers <Icon name="arrow-r" size={12} /></button></li>
      </ul></div></div>
    </section>
  );
}

function InsightCard() {
  return (
    <div className="card insight" data-card="insight"><div className="eyebrow-n">Key insight</div><h3>Two programs take up two thirds of the hours</h3>
      <p>Mobile Services and MHCI Lunch are your highest engagement activities, accounting for 64% of total volunteer hours.</p>
    </div>
  );
}

function EngageCard() {
  return (
    <div className="card" data-card="engage"><div className="eyebrow-n">Engagement analysis</div>
      <div className="stat-row"><div><div className="lbl">Avg hours per volunteer</div><div className="trend"><Icon name="trend" size={14} /> +1.1 from last month</div></div><div className="big">12.3</div></div>
      <div className="stat-row" style={{ paddingBottom: 0 }}><div><div className="lbl">Volunteer retention rate</div><div className="trend"><Icon name="trend" size={14} /> +4 pts from last month</div></div><div className="big">83%</div></div>
    </div>
  );
}

function RecCard() {
  return (
    <div className="card insight rec" data-card="rec"><div className="eyebrow-n">Recommendations</div><h3>Expand Mobile Services into Q1</h3>
      <p>Add two Allegheny County routes and a second styling suite; the December cohort has capacity for roughly 180 more hours.</p>
      <button className="link" aria-expanded={D.planOpen} aria-controls="planMore" onClick={() => { D.planOpen = !D.planOpen; bump(); }}>View action plan <Icon name="arrow-r" size={14} /></button>
      <div className={`expand ${D.planOpen ? 'open' : ''}`} id="planMore"><div><ul className="actions-list dark" style={{ gridTemplateColumns: '1fr' }}>
        <li><b>Jan · Confirm two shelter partners</b>McKeesport and Braddock have asked for visits.</li>
        <li><b>Feb · Train 4 new drivers</b>Andre has offered to lead ride-alongs.</li>
        <li><b>Mar · Open second styling suite</b>Homestead back room, after the spring sort.</li>
      </ul></div></div>
    </div>
  );
}

function ChartCard() {
  const pop = usePop();
  // Draw in on first mount (except during a grid repaint) and every time the range changes
  const [anim, setAnim] = useState(() => D.chartAnim);
  const h = HOURS[D.range];
  const openMenu = (e) => pop.toggle(e.currentTarget, (
    <OptionMenu width={160} options={RANGE_LABEL} value={D.range} onPick={(v) => { D.range = v; setAnim(true); bump(); }} />
  ), { align: 'end' });
  return (
    <section className="card chart-card" data-card="chart">
      <div className="chart-head"><div><h2 className="h2">Average hours over time</h2><div className="trend" id="chartNote"><Icon name="trend" size={14} /> {h.note}</div></div>
        <button className="btn-select" aria-haspopup="menu" onClick={openMenu}>{RANGE_LABEL[D.range]} <Icon name="chev" size={16} /></button></div>
      <LineChart key={D.range} labels={h.labels} values={h.values} unit="hours" animate={anim} className="chart" id="hoursChart" />
    </section>
  );
}

const PART_ALL = [...PARTICIPATION, ...PARTICIPATION_MORE];
function PartInner({ hot, tip }) {
  const open = D.partOpen;
  const rows = open ? PART_ALL : PARTICIPATION;
  const restV = PARTICIPATION_MORE.reduce((a, r) => a + r.vols, 0);
  const restH = PARTICIPATION_MORE.reduce((a, r) => a + r.hours, 0);
  const max = 100;
  const moreRef = useRef(null);
  const toggle = () => { D.partOpen = !D.partOpen; D.partRefocus = true; bump(); };
  // The rows repaint on toggle (keyed remount); keep keyboard focus on the toggle row
  useEffect(() => { if (D.partRefocus) { D.partRefocus = false; moreRef.current?.focus(); } }, []);
  const row = (r, i, more) => (
    <div key={more ? 'more' : i} className={`p-row ${more ? 'more' : ''} ${!more && hot === i ? 'hot' : ''}`}
      {...(more
        ? { ref: moreRef, role: 'button', tabIndex: 0, onClick: toggle, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } } }
        : { 'data-i': i })}>
      <span className="p-lbl">{r.event}</span>
      <span className="p-track"><span className="p-bar" style={{ width: `${Math.min(r.vols / max, 1) * 100}%`, animationDelay: `${i * 35}ms` }} /></span>
      <span className="p-hrs">{r.hours}{more ? '+' : ''}</span>
    </div>
  );
  const t = PART_ALL[tip.i];
  return (
    <>
      <div className="p-head"><span className="p-lbl">Events</span><span className="p-mid">Volunteers</span><span className="p-hrs">Hours</span></div>
      <div className="p-rows">
        {rows.map((r, i) => row(r, i))}
        {row({ event: open ? 'Show less' : `+ ${PARTICIPATION_MORE.length} more`, vols: open ? 0 : restV, hours: open ? '' : Math.floor(restH / 100) * 100 }, rows.length, true)}
      </div>
      <div className="p-axis"><span /><span className="p-ticks">{[0, 25, 50, 75, 100].map((x) => <i key={x}>{x}</i>)}</span><span /></div>
      <div className={`p-tip ${tip.on ? 'on' : ''}`} id="pTip" style={{ translate: `${tip.left}px ${tip.top}px` }}>
        {t && <><div className="m">{t.event}</div><b>{t.vols}</b> volunteers<div className="trend" style={{ fontSize: 12, display: 'flex' }}>{t.hours} hours · {(t.hours / t.vols).toFixed(1)} per volunteer</div></>}
      </div>
    </>
  );
}

function ParticipationCard() {
  const [hot, setHot] = useState(null);
  const [tip, setTip] = useState({ on: false, i: 0, left: 0, top: 0 });
  const over = (e) => {
    const part = e.currentTarget; // #part
    const row = e.target.closest('.p-row[data-i]');
    if (!row) { setHot(null); setTip((t) => ({ ...t, on: false })); return; }
    const i = +row.dataset.i;
    const bar = row.querySelector('.p-bar').getBoundingClientRect();
    const box = part.getBoundingClientRect();
    const k = part.offsetWidth / box.width; // undo dashboard zoom
    setHot(i);
    setTip({ on: true, i, left: (bar.right - box.left) * k + 12, top: (bar.top - box.top + bar.height / 2) * k });
  };
  const leave = () => { setHot(null); setTip((t) => ({ ...t, on: false })); };
  return (
    <section className="card part-card" data-card="participation">
      <h2 className="h2">Event participation by volunteers &amp; hours</h2>
      <div className="card-sub">MHCI Lunch delivered 7.6 hours per volunteer.</div>
      {/* keyed so "+ more" repaints the rows (and replays the bar growth) like vanilla innerHTML */}
      <div className="part" id="part" onPointerOver={over} onPointerLeave={leave}><PartInner key={String(D.partOpen)} hot={hot} tip={tip} /></div>
    </section>
  );
}

const gInitials = (name) => name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
const GRANTS_ALL = [...GRANTS, ...GRANTS_MORE];
// Days from TODAY to a "Mon D" due date (December is 2026, everything else 2027)
const daysUntil = (due) => {
  const [mon, day] = due.split(' ');
  const y = mon === 'Dec' ? 2026 : 2027;
  const d = new Date(`${mon} ${day}, ${y} 12:00`), t = new Date(`${TODAY}T12:00`);
  return Math.round((d - t) / 86400000);
};
function GrantsCard() {
  const [hot, setHot] = useState(null);
  const [tip, setTip] = useState({ on: false, i: null, top: 0 });
  const list = D.grantsOpen ? GRANTS_ALL : GRANTS;
  const draft = () => { Object.assign(D.gen, { tpl: 'funder', period: 'q4' }); navigate('report?tpl=funder&period=q4'); };
  const over = (e) => {
    const card = e.currentTarget;
    const row = e.target.closest('.grant[data-g]');
    if (!row) { setHot(null); setTip((t) => ({ ...t, on: false })); return; }
    const i = +row.dataset.g;
    if (i === hot) return;
    const box = card.getBoundingClientRect(), r = row.getBoundingClientRect();
    const k = card.offsetWidth / box.width; // undo dashboard zoom
    setHot(i);
    setTip({ on: true, i, top: (r.top - box.top + r.height / 2) * k });
  };
  const leave = () => { setHot(null); setTip((t) => ({ ...t, on: false })); };
  const g = tip.i != null ? GRANTS_ALL[tip.i] : null;
  const days = g ? daysUntil(g.due) : 0;
  return (
    <section className="card grants-card" data-card="grants" onPointerOver={over} onPointerLeave={leave}>
      <div className="grants-in">
        <h2 className="h2">Grant commitments</h2>
        <div className="card-sub">1,292 of 1,350 match hours delivered.</div>
        <div className="grant-list" id="grantList">
          {list.map((gr, i) => {
            const extra = i >= GRANTS.length;
            return (
              <div key={i} className={`grant ${extra ? 'reveal' : ''} ${hot === i ? 'hot' : ''}`} data-g={i} style={extra ? { animationDelay: `${(i - GRANTS.length) * 30}ms` } : undefined}>
                <span className="g-logo">{gInitials(gr.name)}</span>
                <div className="g-main"><div className="g-top"><b>{gr.name}</b><span>{gr.due}</span></div><div className="g-sub">{gr.sub}</div>
                  <div className="g-track"><div className={gr.pct >= 100 ? 'done' : ''} style={{ width: `${Math.min(gr.pct, 100)}%` }} /></div></div>
              </div>
            );
          })}
          <button className="g-more" onClick={() => { D.grantsOpen = !D.grantsOpen; bump(); }}>{D.grantsOpen ? 'Show less' : `+${GRANTS_MORE.length} more`}</button>
        </div>
      </div>
      <div className={`g-tip ${tip.on ? "on" : ""}`} id="gTip" aria-hidden="true" style={{ translate: `0 ${tip.top}px` }}>
        {g && <>
          <div className="m">{g.name}</div><b>{Math.min(g.pct, 100)}%</b> of commitment
          <div className="g-tip-row">
            <span className={`g-status ${g.pct >= 100 ? 'met' : g.pct < 60 ? 'behind' : g.pct < 80 ? 'push' : ''}`}>{g.pct >= 100 ? 'Target met' : g.pct >= 80 ? 'On track' : g.pct >= 60 ? 'Needs a push' : 'Behind'}</span>
            <span>Report due in {days} {days === 1 ? 'day' : 'days'}</span>
          </div>
        </>}
      </div>
      <footer className="grants-foot"><span><Icon name="nav-calendar" size={16} /> Next report due December 12</span><button className="link" onClick={draft}>Draft report <Icon name="arrow-r" size={14} /></button></footer>
    </section>
  );
}

function LocationsCard() {
  return (
    <section className="card loc-card" data-card="locations">
      <h2 className="h2">Total volunteer hours by location</h2>
      <div className="card-sub">Washington logged the most hours.</div>
      <div className="locs">
        {LOCATIONS.map((l) => (
          <div className="loc" key={l.name}><div className="loc-name">{l.name}</div><div className="loc-val"><span className="big">{l.hours}</span><small>hours</small></div><div className="loc-bar"><div style={{ width: `${(l.hours / LOCATIONS[0].hours) * 100}%` }} /></div></div>
        ))}
      </div>
    </section>
  );
}

const CARDS = {
  hours: HoursCard, base: BaseCard, survey: SurveyCard, exec: ExecCard, insight: InsightCard, engage: EngageCard,
  rec: RecCard, chart: ChartCard, participation: ParticipationCard, grants: GrantsCard, calendar: CalendarCard, locations: LocationsCard,
};
export function Card({ id }) {
  const C = CARDS[id];
  return C ? <C /> : null;
}
