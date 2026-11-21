// Admin / Survey Responses - Home (Figma 2324:46004). Reuses the admin Events page frame,
// toolbar pieces and icons; survey-only parts live in surveys.css.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { reducedMotion } from '../../lib/store.js';
import { hideTip, useFitZoom, usePop, usePopClose, useToast } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { AccountMenu, Notifications } from '../dashboard/Popovers.jsx';
import { openConversation } from '../../lib/bridge.js';
import { navigate, useRoute } from '../../lib/router.js';
import SurveyDetail from './SurveyDetail.jsx';
import EventAsset from '../events/EventAsset.jsx';
import { AI_SUMMARY, SORTS, shortDate, timeRange } from './surveyData.js';
import { useSurveyState } from './surveyState.js';
import { EventDialog } from '../events/EventEditor.jsx';
import SurveyEditor, { newSurvey } from '../events/SurveyEditor.jsx';
import { useEventState } from '../events/eventState.js';
import { parseDate } from '../events/eventData.js';
import '../events/events.css';
import './surveys.css';

const SurveyAsset = ({ name, className = '' }) => <img className={`ae-asset ${className}`} src={`/assets/surveys/${name}`} alt="" aria-hidden="true" />;

function SortMenu({ value, onChange }) {
  const close = usePopClose();
  return <div className="menu" role="menu" aria-label="Sort surveys" style={{ width: 200 }}>
    {SORTS.map((sort) => <button key={sort} role="menuitemradio" aria-checked={value === sort} className={`menu-item ${value === sort ? 'on' : ''}`} onClick={() => { onChange(sort); close(); }}>{sort}</button>)}
  </div>;
}

// Response-rate line drawn from data with the dashboard LineChart's dot size and motion:
// 4.5px-radius dots, line draws in over 700ms, the shaded area fades in 150ms later.
// Points sit over the month columns; y follows the 0–100 gridlines (200px plot).
function RateLine({ values }) {
  const wrap = useRef(null), line = useRef(null);
  const [w, setW] = useState(0), [animate] = useState(() => !reducedMotion());
  useLayoutEffect(() => {
    const el = wrap.current, measure = () => setW(el.clientWidth);
    measure(); const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => { if (line.current) line.current.style.setProperty('--len', line.current.getTotalLength()); }, [w]);
  const H = 200, n = values.length;
  const pts = values.map((v, i) => [((i + 0.5) / n) * w, (1 - v / 100) * H]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  const top = Math.min(...pts.map((p) => p[1])), low = Math.max(...pts.map((p) => p[1]));
  return <div className="as-rate-plot" ref={wrap} aria-hidden="true">{w > 0 && <svg width={w} height={H}>
    <defs><linearGradient id="as-rate-fill" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={top} y2={low + 40}><stop offset="0" stopColor="#edefff" /><stop offset="1" stopColor="#edefff" stopOpacity="0" /></linearGradient></defs>
    <path className={`as-rate-area ${animate ? 'draw' : ''}`} d={`${d}L${pts[n - 1][0]},${H}L${pts[0][0]},${H}Z`} fill="url(#as-rate-fill)" />
    <path ref={line} className={`as-rate-line ${animate ? 'draw' : ''}`} d={d} />
    {pts.map(([x, y], i) => <circle key={i} className="as-rate-dot" cx={x} cy={y} r="4.5" />)}
  </svg>}</div>;
}

const Info = ({ tip }) => <span className="as-info" tabIndex={0} role="img" aria-label={tip} data-tip={tip}><SurveyAsset name="ai-info.svg" /></span>;

function Insights({ title, icon, tip, items, className }) {
  return <section className={`as-panel as-insights ${className}`} aria-label={title}>
    <h3><span className="as-insights-title">{icon}{title}</span><Info tip={tip} /></h3>
    <ol>{items.map((item) => <li key={item.text}><p>{item.text}</p><div className="as-sources">{item.sources.map((source) => <a key={source.id} className="as-source" href={`#surveys?survey=${source.id}`}><SurveyAsset name="ai-bookmark.svg" />{source.label}</a>)}</div></li>)}</ol>
  </section>;
}

function SummaryDetails() {
  const { score, associations, responseRate, suggestions, strengths } = AI_SUMMARY;
  return <div className="as-summary-details" id="as-summary-details">
    <div className="as-summary-row as-row-stats">
      <section className="as-panel as-score" aria-label="Survey scores">
        <div className="as-stat"><h3><b>Average survey score</b><Info tip="Average rating across all survey responses this week" /></h3>
          <div className="as-stat-body"><p className="as-stat-value"><strong>{score.value}</strong><span>{score.outOf}</span></p><p className="as-change up">{score.change}</p></div></div>
        <hr />
        {associations.map((a) => <div className="as-stat" key={a.label}><h3>{a.label}<Info tip={`Share of written responses with a ${a.trend === 'up' ? 'positive' : 'negative'} tone`} /></h3>
          <p className="as-stat-value inline"><strong>{a.value}</strong><span className={`as-change ${a.trend}`}>{a.change}</span></p></div>)}
      </section>
      <section className="as-panel as-rate" aria-label="Survey response rate over time">
        <h3><b>Survey response rate over time</b><Info tip="Percent of registered volunteers who responded to a survey, by month" /></h3>
        <p className="as-change up as-trend"><SurveyAsset name="ai-trending-up.svg" />{responseRate.change}</p>
        <div className="as-chart"><div className="as-chart-ticks">{responseRate.ticks.map((t) => <span key={t}>{t}</span>)}</div><div className="as-chart-lines">{responseRate.ticks.map((t) => <i key={t} />)}</div><RateLine values={responseRate.values} /></div>
        <div className="as-chart-months">{responseRate.months.map((m) => <span key={m}>{m}</span>)}</div>
      </section>
    </div>
    <div className="as-summary-row as-row-insights">
      <Insights className="as-suggestions" title="Suggestions" icon={<SurveyAsset name="ai-square-star.svg" />} tip="Ideas drawn from what volunteers asked for in their responses" items={suggestions} />
      <Insights className="as-strengths" title="Strengths" icon={<SurveyAsset name="ai-weight.svg" />} tip="What volunteers said is working well" items={strengths} />
    </div>
  </div>;
}

function AiSummary() {
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();
  const download = () => {
    const s = AI_SUMMARY, list = (items) => items.map((item, i) => `${i + 1}. ${item.text} (${item.sources.map((source) => source.label).join(', ')})`).join('\n');
    const body = [`AI summary · ${s.period}`, s.text, `Average survey score: ${s.score.value}${s.score.outOf} (${s.score.change})`, ...s.associations.map((a) => `${a.label}: ${a.value} (${a.change})`), `Survey response rate: ${s.responseRate.change}`, `Suggestions\n${list(s.suggestions)}`, `Strengths\n${list(s.strengths)}`].join('\n\n');
    const url = URL.createObjectURL(new Blob([`${body}\n`], { type: 'text/plain' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'survey-ai-summary.txt' });
    a.click(); URL.revokeObjectURL(url);
    toast('AI summary downloaded', { ic: 'check' });
  };
  return <section className={`as-summary ${expanded ? 'expanded' : ''}`} aria-label="AI summary">
    <div className="as-summary-head">
      <div className="as-summary-label"><SurveyAsset name="ai-sparkles.svg" /><b>AI summary</b><SurveyAsset name="ai-dot.svg" /><span>{AI_SUMMARY.period}</span></div>
      <div className="as-summary-actions">
        <button className="as-icon-select" aria-label="Download AI summary" data-tip="Download summary" onClick={download}><SurveyAsset name="ai-download.svg" /></button>
        <button className="as-summary-toggle" aria-label={expanded ? 'Show less of the AI summary' : 'Show full AI summary'} aria-expanded={expanded} aria-controls="as-summary-details" onClick={() => { hideTip(); setExpanded((o) => !o); }}><EventAsset name="detail-description-chevron" /></button>
      </div>
    </div>
    <p className="as-summary-text">{AI_SUMMARY.text}</p>
    {expanded && <SummaryDetails />}
  </section>;
}

function SurveyCard({ survey, onNotBuilt }) {
  const name = `${survey.title}, ${survey.month} ${survey.day}`;
  return <article className="as-card" aria-label={name}>
    <button className="as-card-more" aria-label={`More actions for ${name}`} onClick={() => onNotBuilt('Survey actions')}><SurveyAsset name="card-ellipsis.svg" /></button>
    <div className="as-card-body">
      <header className="as-card-head">
        <div className="as-card-date"><span>{survey.month}</span><b>{survey.day}</b></div>
        <div className="as-card-title"><h3>{survey.title}</h3><p>{survey.time}</p></div>
        <span className={`as-status ${survey.status === 'Closed' ? 'closed' : ''}`}><SurveyAsset name={survey.status === 'Closed' ? 'detail-status-closed.svg' : 'card-status-dot.svg'} />{survey.status}</span>
      </header>
      <div className="as-card-meta"><span><SurveyAsset name="card-question.svg" />{survey.questions} questions</span><span><EventAsset name="grid-users" />{survey.responses} responses</span></div>
      <hr />
      <div className="as-card-details"><p><span>Organized by </span><b>{survey.organizer}</b></p><p className="as-card-location"><EventAsset name="grid-location" /><span>{survey.location}</span></p></div>
      <div className="as-card-tags">{survey.tags.map((t, i) => <span key={i} className={`ae-tag ${t.tone}`}>{t.label}</span>)}</div>
    </div>
    <div className="as-card-buttons">
      <button className="btn as-view-event" onClick={() => navigate(`events?event=${survey.eventId}`)}>View event</button>
      <button className="btn btn-dark as-view-results" onClick={() => navigate(`surveys?survey=${survey.id}`)}>View results</button>
    </div>
  </article>;
}


// Create survey (Figma 2324:46040): the shared SurveyEditor in library mode, inside the events dialog shell.
function CreateSurveyDialog({ eventId, onClosed }) {
  const toast = useToast();
  const [events] = useEventState('events'), [draft, setDraft] = useSurveyState('draft'), [, setSections] = useSurveyState('sections');
  const [value, setValue] = useState(() => draft ? { ...draft, eventId: draft.eventId || eventId || '' } : { ...newSurvey(), status: 'Open', eventId: eventId || '' });
  const choices = events.filter((e) => e.status !== 'Cancelled' && e.date).sort((a, b) => b.date.localeCompare(a.date)).map((e) => ({ ...e, dateText: shortDate(e.date) }));
  return <EventDialog label="Create survey" className="ae-survey-dialog" onClosed={onClosed}>{(close) => <SurveyEditor variant="library" value={value} onChange={setValue} events={choices} onCancel={() => close()}
    onDraft={(next) => { setDraft(next); toast('Survey saved as draft. It’ll be here next time you create a survey', { ic: 'check' }); close(); }}
    onCreate={(survey) => {
      const event = events.find((e) => e.id === survey.eventId), date = parseDate(event.date);
      const card = { id: `survey-${Date.now()}`, title: event.title, surveyName: survey.title, month: date.toLocaleDateString('en-US', { month: 'short' }), day: date.getDate(), time: event.start && event.end ? timeRange(event.start, event.end) : event.time, status: survey.status, questions: survey.questions.length, responses: 0, organizer: event.organizer || 'Kelly Trow', location: event.address || 'Location to be added', eventId: event.id, tags: (event.tags || []).map((tone, i) => ({ tone, label: (event.tagText || '').split(',')[i]?.trim() || event.type })), definition: survey, event: { date: shortDate(event.date), time: (event.time || '').toUpperCase(), description: event.description || '' } };
      setSections((sections) => sections.map((section) => section.id === 'week' ? { ...section, surveys: [card, ...section.surveys] } : section));
      setDraft(null); close();
      toast('Survey published', { ic: 'check', action: 'View', onAction: () => navigate(`surveys?survey=${card.id}`) });
    }} />}</EventDialog>;
}

export default function Surveys() {
  const pop = usePop(), notBuilt = useNotBuilt();
  const [allSections] = useSurveyState('sections');
  const [creating, setCreating] = useState(null);
  const page = useRef(null);
  const { params } = useRoute();
  const active = allSections.flatMap((s) => s.surveys).find((s) => s.id === params.get('survey'));
  useFitZoom(page, { designWidth: 1488, minWidth: 1000, fit: false });
  const [query, setQuery] = useState(''), [sort, setSort] = useState('Default'), [unread, setUnread] = useState(true);
  const popRef = useRef(pop); popRef.current = pop;
  useEffect(() => () => { popRef.current.close(null, true); hideTip(); }, []);
  useEffect(() => { popRef.current.close(null, true); hideTip(); document.getElementById('main')?.scrollTo(0, 0); }, [active?.id]);
  const q = query.trim().toLowerCase();
  const sections = allSections.map((section) => {
    const surveys = section.surveys.filter((s) => `${s.title} ${s.organizer} ${s.location}`.toLowerCase().includes(q));
    if (sort !== 'Default') surveys.sort((a, b) => sort === 'Most responses' ? b.responses - a.responses : a.responses - b.responses);
    return { ...section, surveys };
  });
  const empty = sections.every((s) => !s.surveys.length);
  const notifications = (e) => pop.toggle(e.currentTarget, <Notifications onReadAll={() => setUnread(false)} onOpen={(key) => { setUnread(false); if (key === 'sophia') openConversation('c2'); }} />, { align: 'end' });

  return <div className="ae-page as-page" ref={page}>
    <div className="top-nav ae-top-nav"><button className="tn-bell" aria-label="Notifications" onClick={notifications}><EventAsset name="list-group101" />{unread && <i className="tn-dot" />}</button><span className="tn-sep" /><button className="tn-me" aria-label="Account" onClick={(e) => pop.toggle(e.currentTarget, <AccountMenu onSettings={() => notBuilt('Settings')} />, { align: 'end' })}><img className="ae-avatar" src="/assets/events/list-ellipse47.png" alt="" /></button></div>
    {active ? <SurveyDetail key={active.id} survey={active} onCreate={() => setCreating({ eventId: active.eventId })} /> : <div className="as-workspace">
      <header className="ae-heading as-heading"><h1>Survey responses</h1><p>View survey responses from past events</p></header>
      <div className="as-toolbar">
        <label className="search ae-search as-search"><EventAsset name="list-vector" /><input aria-label="Search surveys" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <div className="as-toolbar-actions">
          <button className="as-sort" aria-haspopup="menu" onClick={(e) => pop.toggle(e.currentTarget, <SortMenu value={sort} onChange={setSort} />, { align: 'end' })}>Sort by: {sort}<SurveyAsset name="sort-chevron.svg" /></button>
          <button className="btn btn-dark ae-create as-create" onClick={() => setCreating({})}>Create survey<EventAsset name="list-plus" /></button>
          <div className="ae-views as-views" role="group" aria-label="Survey layout"><button aria-label="Grid view" aria-pressed="true" className="on"><EventAsset name="list-grip" /></button><button aria-label="List view" aria-pressed="false" onClick={() => notBuilt('List view')}><EventAsset name="list-layout-list" /></button></div>
        </div>
      </div>
      <AiSummary />
      <div className="as-sections">
        {sections.filter((s) => s.surveys.length).map((section) => <section className="as-section" key={section.id} aria-labelledby={`as-${section.id}`}>
          <header><h2 id={`as-${section.id}`}>{section.label}</h2><span aria-label={`${section.surveys.length} surveys`}>{section.surveys.length}</span></header>
          <div className="as-grid">{section.surveys.map((survey) => <SurveyCard key={survey.id} survey={survey} onNotBuilt={notBuilt} />)}</div>
        </section>)}
        {empty && <div className="ae-empty"><div className="ae-empty-content"><div className="ae-empty-icon"><EventAsset name="detail-handshake" /></div><p role="status">No surveys match your search</p><button className="btn btn-outline" onClick={() => setQuery('')}>Clear search</button></div></div>}
      </div>
    </div>}
    {creating && <CreateSurveyDialog eventId={creating.eventId} onClosed={() => setCreating(null)} />}
  </div>;
}
