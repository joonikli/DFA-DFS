// Admin / Survey Responses - Survey specific (Figma 2324:45890).
import { useState } from 'react';
import { usePop, usePopClose } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { navigate } from '../../lib/router.js';
import EventAsset from '../events/EventAsset.jsx';
import { resultsFor } from './surveyData.js';
import { useEventState } from '../events/eventState.js';

const Asset = ({ name, className = '' }) => <img className={`ae-asset ${className}`} src={`/assets/surveys/${name}`} alt="" aria-hidden="true" />;
const pct = (count, total) => Math.round((count / total) * 100);

function ChoiceMenu({ label, options, value, onChange }) {
  const close = usePopClose();
  return <div className="menu" role="menu" aria-label={label} style={{ width: 200 }}>
    {options.map((o) => <button key={o} role="menuitemradio" aria-checked={value === o} className={`menu-item ${value === o ? 'on' : ''}`} onClick={() => { onChange(o); close(); }}>{o}</button>)}
  </div>;
}

function Dropdown({ prefix, label, options, value, onChange }) {
  const pop = usePop();
  return <button className="as-sort" aria-haspopup="menu" onClick={(e) => pop.toggle(e.currentTarget, <ChoiceMenu label={label} options={options} value={value} onChange={onChange} />, { align: 'end' })}>{prefix}: {value}<Asset name="sort-chevron.svg" /></button>;
}

function QuestionField({ n, title, onEdit }) {
  return <div className="sd-question"><h2><span>Q #{n}</span>{title}</h2><button className="sd-icon-plain" aria-label={`Edit question ${n}`} onClick={onEdit}><Asset name="detail-pencil.svg" /></button></div>;
}

function Bars({ options, total }) {
  const top = Math.max(...options.map((o) => o.count));
  const topCount = options.filter((o) => o.count === top).length;
  return <div className="sd-bars">{options.map((o) => <div className="sd-bar-row" key={o.label}>
    <div className="sd-bar-track"><span className="sd-bar-label">{o.label}</span><span className="sd-bar" style={{ width: `${pct(o.count, total)}%`, background: o.color }}>{pct(o.count, total)}%</span><span className="sr">{o.count} of {total} responses</span></div>
    {o.count === top && topCount === 1 && <span className="sd-popular"><Asset name="detail-sparkles.svg" />Most popular</span>}
  </div>)}</div>;
}

// Donut drawn from data with the Figma geometry: 380px, 64.755px ring, first slice starting at 214.8°.
const R = 190, r = 125.245, START = 214.8;
const point = (radius, deg) => { const a = (deg - 90) * Math.PI / 180; return [R + radius * Math.cos(a), R + radius * Math.sin(a)]; };
function slicePath(from, to) {
  const large = to - from > 180 ? 1 : 0, [x1, y1] = point(R, from), [x2, y2] = point(R, to), [x3, y3] = point(r, to), [x4, y4] = point(r, from);
  return `M${x1} ${y1}A${R} ${R} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${r} ${r} 0 ${large} 0 ${x4} ${y4}Z`;
}

function Donut({ options, total }) {
  const [hover, setHover] = useState(null);
  let at = START;
  const slices = options.map((o) => { const from = at; at += (o.count / total) * 360; return { ...o, from, to: at }; });
  const show = (s, e) => { const box = e.currentTarget.ownerSVGElement.getBoundingClientRect(); const [x, y] = point((R + r) / 2, (s.from + s.to) / 2); setHover({ ...s, x: x * box.width / 380, y: y * box.height / 380 }); };
  return <div className="sd-pie">
    <div className="sd-donut">
      <svg viewBox="0 0 380 380" width="380" height="380" role="img" aria-label={options.map((o) => `${o.label}: ${o.count}`).join(', ')}>
        {slices.map((s) => <path key={s.label} d={slicePath(s.from, s.to)} fill={s.color} tabIndex={0} aria-label={`${s.label}, ${s.count} volunteers`} className={hover?.label === s.label ? 'on' : ''} onMouseEnter={(e) => show(s, e)} onFocus={(e) => show(s, e)} onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)} />)}
      </svg>
      {hover && <div className="sd-tip" style={{ left: hover.x, top: hover.y }} aria-hidden="true"><b>{hover.label}</b><p><strong>{hover.count}</strong><span>volunteers</span></p></div>}
    </div>
    <ul className="sd-legend">{options.map((o) => <li key={o.label}><i style={{ background: o.color }} />{o.label}</li>)}</ul>
  </div>;
}

function ChoiceResults({ q, total, view, onView, toggle }) {
  return toggle ? <div className="sd-chart-card">
    <div className="sd-toggle" role="group" aria-label="Chart type">{['Pie chart', 'Bar chart'].map((v) => <button key={v} aria-pressed={view === v} className={view === v ? 'on' : ''} onClick={() => onView(v)}>{v}</button>)}</div>
    {view === 'Pie chart' ? <Donut options={q.options} total={total} /> : <Bars options={q.options} total={total} />}
  </div> : view === 'Pie chart' ? <div className="sd-chart-card plain"><Donut options={q.options} total={total} /></div> : <Bars options={q.options} total={total} />;
}

function TextResults({ responses, sort }) {
  const list = sort === 'Oldest first' ? [...responses].reverse() : responses;
  return <div className="sd-text" tabIndex={0} aria-label="Written responses"><ul>{list.map((t) => <li key={t}>{t}</li>)}</ul></div>;
}

function Question({ q, n, total, notBuilt }) {
  const [view, setView] = useState(q.view === 'pie' ? 'Pie chart' : 'Bar graph');
  const [sort, setSort] = useState('Default');
  const edit = () => notBuilt('Editing survey questions');
  const none = total === 0 || (q.kind === 'text' && !q.responses.length);
  if (none) return <section className="sd-block" aria-label={`Question ${n}`}>
    <div className="sd-block-head"><QuestionField n={n} title={q.title} onEdit={edit} /></div>
    <p className="sd-empty">No responses yet. Results will appear here as volunteers answer.</p>
  </section>;
  if (q.kind === 'text') return <section className="sd-block" aria-label={`Question ${n}`}>
    <div className="sd-block-head"><QuestionField n={n} title={q.title} onEdit={edit} /><Dropdown prefix="Sort by" label="Sort responses" options={['Default', 'Oldest first']} value={sort} onChange={setSort} /></div>
    <TextResults responses={q.responses} sort={sort} />
  </section>;
  const pie = q.view === 'pie';
  return <section className={`sd-block ${pie ? 'sd-block-pie' : ''}`} aria-label={`Question ${n}`}>
    <div className="sd-block-head"><QuestionField n={n} title={q.title} onEdit={edit} />{!pie && <Dropdown prefix="View" label="Chart type" options={['Bar graph', 'Pie chart']} value={view} onChange={setView} />}</div>
    <ChoiceResults q={q} total={total} view={view} onView={setView} toggle={pie} />
  </section>;
}

const PALETTE = ['var(--purple-dark)', 'var(--pink)', 'var(--pink-dark)', 'var(--green-dark)', 'var(--blue)', 'var(--lime)'];
// Surveys published from Create survey carry their own definition and have no responses yet.
const fromDefinition = (survey) => ({
  date: survey.event.date, time: survey.event.time, description: survey.event.description,
  questions: survey.definition.questions.map((q) => q.type === 'Free form' ? { id: q.id, kind: 'text', title: q.title, responses: [] } : { id: q.id, kind: 'choice', view: 'bar', title: q.title, options: q.options.map((label, i) => ({ label, count: 0, color: PALETTE[i % PALETTE.length] })) }),
});

export default function SurveyDetail({ survey, onCreate }) {
  const notBuilt = useNotBuilt();
  const [events] = useEventState('events');
  const data = survey.definition ? fromDefinition(survey) : resultsFor(survey, events.find((e) => e.id === survey.eventId));
  const closed = survey.status === 'Closed';
  return <div className="sd">
    <div className="sd-top">
      <nav className="sd-breadcrumb" aria-label="Breadcrumb"><button onClick={() => navigate('surveys')}>Survey responses</button><EventAsset name="survey-page-chevron" /><span aria-current="page">{survey.surveyName || `${survey.title} survey`}</span></nav>
      <div className="sd-actions">
        <div className="sd-actions-main">
          <button className="btn sd-view-event" onClick={() => navigate(`events?event=${survey.eventId}`)}>View event<Asset name="detail-arrow-up-right.svg" /></button>
          <button className="btn btn-dark ae-create as-create" onClick={onCreate}>Create survey<EventAsset name="list-plus" /></button>
        </div>
        <div className="sd-actions-icons">
          <button className="as-icon-select" aria-label="Edit survey" data-tip="Edit survey" onClick={() => notBuilt('Editing surveys')}><Asset name="detail-edit.svg" /></button>
          <button className="as-icon-select" aria-label="Filter responses" data-tip="Filter responses" onClick={() => notBuilt('Filtering responses')}><Asset name="detail-filter.svg" /></button>
        </div>
      </div>
    </div>
    <header className="sd-info">
      <div className="sd-info-main">
        <div className="sd-title"><h1>{survey.title}</h1><span className={`sd-status ${closed ? 'closed' : 'open'}`}><Asset name={closed ? 'detail-status-closed.svg' : 'card-status-dot.svg'} />{survey.status}</span></div>
        <p className="sd-manager">Managed by <b>{survey.organizer}</b></p>
        <p className="sd-description">{data.description}</p>
        <div className="sd-tags">{survey.tags.map((color, i) => <span key={i} className={`ae-tag ${color}`}>anylanguage</span>)}</div>
      </div>
      <div className="sd-info-meta">
        <p className="sd-responses"><Asset name="detail-users.svg" />{survey.responses} responses</p>
        <span className="sd-divider" aria-hidden="true" />
        <div className="sd-when"><p><Asset name="detail-calendar.svg" />{data.date}<i aria-hidden="true" />{data.time}</p><p><Asset name="detail-location.svg" />{survey.location}</p></div>
      </div>
    </header>
    <div className="sd-questions">{data.questions.map((q, i) => <Question key={q.id} q={q} n={i + 1} total={survey.responses} notBuilt={notBuilt} />)}</div>
  </div>;
}
