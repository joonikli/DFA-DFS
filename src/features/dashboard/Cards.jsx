// The dashboard's card bodies (one per widget id). Markup and class names mirror vanilla
// Dash.cardHTML so src/styles.css styles them unchanged.
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Icon } from '../../components/Icon.jsx';
import { LineChart } from '../../components/LineChart.jsx';
import { usePop, usePopClose } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { SURVEY, HOURS, PARTICIPATION, PARTICIPATION_MORE, LOCATIONS, TODAY } from '../../data.js';
import { grants as grantsData, impactReport } from '../../mock/grants.js';
import Button from '../../components/Button/Button.jsx';
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

// Grants card: leads with the program's wins (the same numbers the Impact report uses, so the
// dashboard and the grant documents never disagree), then hands off to the Grants workspace in the
// main app (/grants, opened in the admin view).
const IMPACT = Object.fromEntries(impactReport.sections.find((x) => x.table).table.rows.map(([k, v, d]) => [k, { v, d }]));
const ACCEPTED = grantsData.filter((g) => g.status === 'accepted');
const AWARDED = ACCEPTED.reduce((n, g) => n + g.amount, 0);
const TO_SUBMIT = grantsData.filter((g) => g.status === 'to_submit').sort((a, b) => a.due - b.due);
const fmtMoney = (n) => `$${n.toLocaleString('en-US')}`;
const fmtDue = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const goGrants = (path = '/grants', q = '') => { window.location.href = `${path}?as=admin${q}`; };

function GrantsCard() {
  const hours = IMPACT['Total volunteer hours'];
  const stats = [
    ['Women served', IMPACT['Women served']],
    ['Found jobs', { v: IMPACT['Women who secured employment within 6 months'].v.match(/\((\d+%)\)/)?.[1] || '61%', d: IMPACT['Women who secured employment within 6 months'].d }],
    ['Events held', IMPACT['Total events held']],
  ];
  const next = TO_SUBMIT[0];
  const openFromCard = (e) => { if (!e.target.closest('a, button')) goGrants(); };
  return (
    <section className="card grants-card impact-card" data-card="grants" onClick={openFromCard}>
      <div className="impact-in">
        <div className="impact-head">
          <h2 className="h2">Your impact</h2>
          <button className="impact-open text-label-1" onClick={() => goGrants()}>View grants <Icon name="arrow-r" size={14} /></button>
        </div>
        <p className="impact-sub text-label-2">FY 2025–26 · ready for grant applications</p>
        <div className="impact-hero">
          <span className="text-heading-1">{hours.v}</span>
          <span className="text-label-2 impact-unit">volunteer hours</span>
          <span className="text-label-2 impact-up"><Icon name="trend" size={14} /> {hours.d} from last year</span>
        </div>
        <ul className="impact-stats">
          {stats.map(([label, x]) => (
            <li key={label}>
              <span className="text-heading-2">{x.v}</span>
              <span className="text-label-2 impact-label">{label}</span>
              <span className="text-label-2 impact-up">{x.d}</span>
            </li>
          ))}
        </ul>
        <p className="impact-awarded"><span className="text-heading-2">{fmtMoney(AWARDED)}</span><span className="text-label-2">awarded across {ACCEPTED.length} grants this year</span></p>
      </div>
      <footer className="impact-foot">
        {next && (
          <button className="impact-todo text-label-2" onClick={() => goGrants('/grants', '&status=to_submit')}>
            <span><b className="text-label-1">{TO_SUBMIT.length} to submit</b> · due {fmtDue(next.due)}</span> <Icon name="arrow-r" size={14} />
          </button>
        )}
        <Button color="secondary" size="sm" onClick={() => goGrants('/grants/reports', '&type=Impact%20report')}>Impact report</Button>
      </footer>
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
