// Grant documents › Generate reports (Figma 2324:50057, 2324:50103, 2324:50327).
// Full-screen like the dashboard's report composer, but a separate route (#grant-report) that is only
// reachable from a grant's View documents dialog. The dashboard composer (#report) is untouched.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon.jsx';
import { useToast } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { navigate } from '../../lib/router.js';
import EventAsset from '../events/EventAsset.jsx';
import { LineChart } from '../../components/LineChart.jsx';
import { HOURS, PARTICIPATION, LOCATIONS, GRANTS } from '../../data.js';
import { Bars, Donut } from '../surveys/SurveyDetail.jsx';
import { SURVEY_SECTIONS, resultsFor } from '../surveys/surveyData.js';
import { useGrantState } from './grantState.js';
import { DOC_CHOICES, IMPACT_REPORT, toMarkdown } from './reportData.js';
import '../events/events.css';
import '../surveys/surveys.css';
import './grantReport.css';

const RA = ({ name, className = '' }) => <img className={`ae-asset ${className}`} src={`/assets/grants/report-${name}.svg`} alt="" aria-hidden="true" />;
const PALETTE = ['var(--purple-dark)', 'var(--pink)', 'var(--pink-dark)', 'var(--green-dark)', 'var(--blue)', 'var(--lime)'];
const ZOOMS = [50, 75, 100, 125, 150, 200];
const ALL_SURVEYS = SURVEY_SECTIONS.flatMap((s) => s.surveys);

const surveyLabel = (s) => `${s.title.replace(/ Event$/, '')} Survey`;
const SourceIcon = ({ kind }) => kind === 'survey' ? <img className="ae-asset" src="/assets/surveys/ai-bookmark.svg" alt="" aria-hidden="true" />
  : <Icon name={kind === 'dashboard' ? 'layout' : kind === 'ai' ? 'sparkles' : 'nav-dollar'} size={12} />;

// One piece of evidence, drawn in the format it has where it came from: dashboard stat tiles, line
// chart and bar lists; survey bar/donut charts and written responses; AI summary insights; grant tracks.
function Module({ m, i, grants }) {
  const survey = m.survey && ALL_SURVEYS.find((s) => s.id === m.survey);
  const q = survey && m.q && resultsFor(survey).questions.find((x) => x.id === m.q);
  const from = m.from || (survey && { kind: 'survey', label: surveyLabel(survey), href: `#surveys?survey=${survey.id}` });
  const title = m.title || q?.title;
  let body;
  if (m.type === 'stats') body = <div className="grp-stats">{m.items.map(([label, value, unit, trend]) => <div className="grp-stat" key={label}>
    <span>{label}</span><b className="big">{value}{unit && <small>{unit}</small>}</b>{trend && <em className="trend"><Icon name="trend" size={13} />{trend}</em>}</div>)}</div>;
  else if (m.type === 'line') { const h = HOURS[m.series]; body = <><em className="trend grp-note"><Icon name="trend" size={13} />{h.note}</em><LineChart labels={h.labels.length > 6 ? h.labels.map((l) => l[0]) : h.labels} values={h.values} unit="hours" className="chart grp-line" /></>; }
  else if (m.type === 'choice') body = <Bars options={q.options} total={survey.responses} />;
  else if (m.type === 'donut') body = <Donut options={q.options} total={survey.responses} />;
  else if (m.type === 'text') body = <div className="sd-text" tabIndex={0} aria-label="Written responses"><ul>{q.responses.slice(0, 4).map((t) => <li key={t}>{t}</li>)}</ul></div>;
  else if (m.type === 'participation' || m.type === 'locations') {
    const rows = m.type === 'locations' ? LOCATIONS.map((l) => [l.name, l.hours]) : PARTICIPATION.map((p) => [p.event, p.hours]).sort((a, b) => b[1] - a[1]);
    const top = rows[0][1];
    body = <ul className="grp-hbars">{rows.map(([label, n], k) => <li key={label}><span>{label}</span><i><b style={{ width: `${(n / top) * 100}%`, animationDelay: `${k * 40}ms` }} /></i><em>{n}</em></li>)}</ul>;
  } else if (m.type === 'revenue') {
    const funded = grants.filter((g) => g.status === 'Accepted');
    const options = funded.map((g, k) => ({ label: g.title, count: g.amount, color: PALETTE[k % PALETTE.length] }));
    body = <Bars options={options} total={options.reduce((s, o) => s + o.count, 0)} />;
  } else if (m.type === 'commitments') body = <ul className="grp-commit">{GRANTS.map((g) => <li key={g.name}>
    <div><b>{g.name}</b><span>{Math.min(g.pct, 100)}%</span></div><p>{g.sub} · due {g.due}</p><div className="g-track"><div className={g.pct >= 100 ? 'done' : ''} style={{ width: `${Math.min(g.pct, 100)}%` }} /></div></li>)}</ul>;
  else if (m.type === 'insight') body = <>{m.title && <h4>{m.title}</h4>}<p>{m.text}</p></>;
  return <section className={`grp-mod ${m.wide ? 'wide' : ''} ${m.type === 'insight' ? 'grp-insight' : ''}`} style={{ '--i': i }} aria-label={title || m.label}>
    <header className="grp-mod-head">
      {m.type === 'insight' ? <h3 className="grp-mod-eyebrow"><Icon name="sparkles" size={14} />{m.label}</h3> : <h3>{title}</h3>}
      <a className="grp-mod-from" href={from.href}><SourceIcon kind={from.kind} />{from.label}</a>
    </header>
    {body}
  </section>;
}

// "This data comes from" — every source the section draws on, then its evidence modules
function SourcePanel({ section, grants, onRemove, onClose, notBuilt }) {
  const ref = useRef(null);
  useEffect(() => {
    const away = (e) => { if (!ref.current?.contains(e.target) && !e.target.closest('.grp-chart-btn')) onClose(); };
    const esc = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    ref.current?.querySelector('a, button')?.focus();
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [onClose]);
  const { surveys = [], grants: fromGrants, links = [], modules = [] } = section.sources;
  const tags = [
    ...surveys.map((id) => ALL_SURVEYS.find((s) => s.id === id)).map((s) => ({ kind: 'survey', label: surveyLabel(s), href: `#surveys?survey=${s.id}` })),
    ...(fromGrants ? grants.filter((g) => g.status === 'Accepted').slice(0, 2).map((g) => ({ kind: 'grant', label: g.title, href: '#grants' })) : []),
    ...links,
  ];
  return <div className="grp-source" ref={ref} role="dialog" aria-label={`Data sources for ${section.title}`}>
    <div className="grp-source-head">
      <p>This data comes from:</p>
      <div className="grp-source-tags">{tags.map((t) => <a key={t.label} className="as-source" href={t.href}><SourceIcon kind={t.kind} />{t.label}</a>)}</div>
      <div className="grp-seg" role="group" aria-label="Section actions"><button onClick={() => notBuilt('Rewriting a section')}>Rewrite</button><button onClick={onRemove}>Remove</button></div>
    </div>
    <div className="grp-mods">{modules.map((m, i) => <Module key={i} m={m} i={i} grants={grants} />)}</div>
    <form className="grp-ask" onSubmit={(e) => { e.preventDefault(); notBuilt('Editing a section with AI'); }}>
      <input aria-label="What should change?" placeholder="What should change?" />
      <button aria-label="Send"><RA name="send" /></button>
    </form>
  </div>;
}

function Section({ s, i, open, onToggle, panel }) {
  return <section className="grp-sec" data-section={s.id} style={{ '--i': i }}>
    {s.sources && <button contentEditable={false} className={`grp-chart-btn ${open ? 'on' : ''}`} aria-label={`Show where “${s.title}” data comes from`} aria-expanded={open} data-tip="Data sources" onClick={onToggle}><RA name="chart-line" /></button>}
    <h2>{s.title}</h2>
    {(s.paragraphs || []).map((p, i) => <p key={i}>{p}</p>)}
    {s.signature && <p className="grp-sign">{s.signature}</p>}
    {s.table && <div className={`grp-table ${s.narrow ? 'narrow' : ''}`}><table>
      <thead><tr>{s.table.head.map((h) => <th key={h}><span>{h}</span></th>)}</tr></thead>
      <tbody>{s.table.rows.map((r, i) => <tr key={i} className={s.table.totals?.includes(i) ? 'total' : ''}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
    </table></div>}
    {s.after && <p>{s.after}</p>}
    {(s.programs || []).map((p) => <div className="grp-program" key={p.title}><h3>{p.title}</h3><p>{p.text}</p><ul>{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul></div>)}
    {s.quote && <p className="grp-quote"><span>{s.quote[0]}</span>{s.quote[1]}</p>}
    {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
    {s.numbered && <ol>{s.numbered.map((b) => <li key={b}>{b}</li>)}</ol>}
    {s.defs && <ul>{s.defs.map(([k, v]) => <li key={k}><b>{k}:</b> {v}</li>)}</ul>}
    {s.footnote && <p className="grp-footnote">{s.footnote}</p>}
    {open && <div contentEditable={false}>{panel}</div>}
  </section>;
}

export default function GrantReport({ params }) {
  const toast = useToast(), notBuilt = useNotBuilt();
  const [grants, setGrants] = useGrantState('grants');
  const grant = grants.find((g) => g.id === params.get('grant'));
  const [state, setState] = useState('empty'), [choice, setChoice] = useState(null); // empty | loading | ready
  const [sections, setSections] = useState(IMPACT_REPORT.sections), [history, setHistory] = useState({ back: [], forward: [] });
  const [source, setSource] = useState(null), [editing, setEditing] = useState(false), [zoom, setZoom] = useState(100);
  const [download, setDownload] = useState(false), [format, setFormat] = useState('PDF'), [prompt, setPrompt] = useState('');
  const [chat, setChat] = useState([]); // side chat, same bubbles as the dashboard composer: me | typing | ai (+ offer)
  const doc = useRef(null), dl = useRef(null), thread = useRef(null), msgKey = useRef(0);
  useLayoutEffect(() => { if (chat.length) thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: 'smooth' }); }, [chat]);
  const ready = state === 'ready';
  // When the report first appears, its modules fade up in sequence (same fadeUp as the survey AI summary).
  // The class is dropped afterwards so sections restored by Undo don't replay the stagger.
  const [reveal, setReveal] = useState(false);
  useLayoutEffect(() => {
    if (!ready) return undefined;
    setReveal(true); const t = setTimeout(() => setReveal(false), 1400);
    return () => clearTimeout(t);
  }, [ready]);
  useEffect(() => { document.getElementById('main')?.scrollTo?.(0, 0); }, []);
  useEffect(() => {
    if (!download) return undefined;
    const away = (e) => { if (!dl.current?.contains(e.target)) setDownload(false); };
    const esc = (e) => { if (e.key === 'Escape') setDownload(false); };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [download]);

  const back = () => navigate(grant ? `grants?docs=${grant.id}` : 'grants');
  // Each pick posts as the user's message, shows the typing dots, then the assistant answers.
  // After the impact report it offers the other documents so the user can keep exploring.
  const busy = chat.at(-1)?.role === 'typing';
  const say = (text, reply, delay = 1100) => {
    const typing = { role: 'typing', key: ++msgKey.current };
    setChat((c) => [...c, { role: 'me', text, key: ++msgKey.current }, typing]);
    setTimeout(() => setChat((c) => [...c.filter((m) => m !== typing), { role: 'ai', key: ++msgKey.current, ...reply }]), delay);
  };
  const pick = (c, typed) => {
    if (busy) return;
    const others = DOC_CHOICES.filter((d) => d.id !== 'impact');
    if (c.id !== 'impact') { say(typed || c.label, { text: `${c.label} isn’t part of this prototype yet. I can build your Impact report from this year’s surveys and grants.`, offer: [DOC_CHOICES[2]] }, 800); return; }
    setChoice(c.id); setSource(null);
    if (ready) { say(typed || c.label, { text: 'Your Impact report is already open on the right. Would you like to explore other options?', offer: others }, 800); return; }
    const surveys = new Set(IMPACT_REPORT.sections.flatMap((s) => s.sources?.surveys || [])).size;
    say(typed || c.label, { text: `Here’s your 2025–2026 Impact Report, drafted from ${surveys} volunteer and event surveys and your accepted grants. Select the chart icon beside a section to see where its numbers come from, or use Edit text to make changes.`, ask: 'Would you like to explore other options?', offer: others });
    setState('loading'); setTimeout(() => setState('ready'), 1100);
  };
  const commit = (next) => { setHistory((h) => ({ back: [...h.back, sections], forward: [] })); setSections(next); };
  const remove = (id) => {
    const prev = sections; commit(sections.filter((s) => s.id !== id)); setSource(null);
    toast('Section removed', { ic: 'check', action: 'Undo', onAction: () => setSections(prev) });
  };
  const undo = () => {
    if (editing) { document.execCommand('undo'); return; }
    if (!history.back.length) return;
    setHistory((h) => ({ back: h.back.slice(0, -1), forward: [sections, ...h.forward] })); setSections(history.back.at(-1));
  };
  const redo = () => {
    if (editing) { document.execCommand('redo'); return; }
    if (!history.forward.length) return;
    setHistory((h) => ({ back: [...h.back, sections], forward: h.forward.slice(1) })); setSections(history.forward[0]);
  };
  const highlight = () => {
    const sel = getSelection();
    if (!sel.rangeCount || sel.isCollapsed || !doc.current.contains(sel.anchorNode)) { toast('Select some text in the report to highlight it', { ic: 'info' }); return; }
    const range = sel.getRangeAt(0), mark = document.createElement('mark');
    mark.appendChild(range.extractContents()); range.insertNode(mark); sel.removeAllRanges();
  };
  const clear = () => {
    const prev = { sections, choice };
    setState('empty'); setChoice(null); setSource(null); setEditing(false);
    toast('Report deleted', { ic: 'check', action: 'Undo', onAction: () => { setSections(prev.sections); setChoice(prev.choice); setState('ready'); } });
  };
  const exportDoc = () => {
    setDownload(false);
    if (format === 'PDF') { setTimeout(() => window.print(), 50); return; }
    const url = URL.createObjectURL(new Blob([toMarkdown(IMPACT_REPORT, sections)], { type: 'text/markdown' }));
    Object.assign(document.createElement('a'), { href: url, download: 'impact-report-2025-26.md' }).click();
    URL.revokeObjectURL(url); toast('Markdown file downloaded', { ic: 'check' });
  };
  const addToDocs = () => {
    if (!grant) { toast('Open this from a grant’s documents to add the report to it', { ic: 'info' }); return; }
    const name = 'Impact_report_FY26.pdf';
    setGrants((all) => all.map((g) => g.id === grant.id ? { ...g, files: { ...g.files, impact: g.files.impact.includes(name) ? g.files.impact : [...g.files.impact, name] } } : g));
    toast(`Added to ${grant.title} documents`, { ic: 'check', action: 'View', onAction: back });
  };
  const mdSize = `${Math.max(1, Math.round(new Blob([toMarkdown(IMPACT_REPORT, sections)]).size / 1024))} KB`;

  return <div className="grp">
    <header className="grp-top">
      <nav className="sd-breadcrumb" aria-label="Breadcrumb"><button onClick={back}>Documents</button><EventAsset name="survey-page-chevron" /><span aria-current="page">Generate reports</span></nav>
      <div className="grp-top-actions">
        <button className="btn gr-outline grp-btn" disabled={!ready} onClick={addToDocs}>Add to documents<RA name="plus-purple" /></button>
        <div className="grp-dl" ref={dl}>
          <button className="btn btn-dark grp-btn" aria-haspopup="dialog" aria-expanded={download} onClick={() => setDownload((d) => !d)}>Download<RA name="download" /></button>
          {download && <div className="grp-dl-pop" role="dialog" aria-label="Download report">
            <p className="grp-dl-label">Format</p>
            <div className="grp-dl-formats" role="radiogroup" aria-label="Format">{['PDF', 'Markdown file'].map((f) => <button key={f} role="radio" aria-checked={format === f.split(' ')[0]} className={format === f.split(' ')[0] ? 'on' : ''} onClick={() => setFormat(f.split(' ')[0])}>{f}</button>)}</div>
            <p className="grp-dl-meta">{!ready ? 'Generate a document first' : format === 'PDF' ? `Letter • ${sections.length > 8 ? 4 : 3} pages` : `Markdown • ${mdSize}`}</p>
            <button className="btn btn-dark grp-dl-go" disabled={!ready} onClick={exportDoc}>Export {format === 'PDF' ? 'PDF' : 'Markdown'}</button>
          </div>}
        </div>
      </div>
    </header>
    <div className={`grp-tools-wrap ${ready ? 'open' : ''}`} inert={!ready || undefined}><div className="grp-tools-clip"><div className="grp-tools" role="toolbar" aria-label="Edit document">
      <div className="grp-tools-main">
        <button aria-label="Redo" data-tip="Redo" onClick={redo}><RA name="redo" /></button>
        <button aria-label="Undo" data-tip="Undo" onClick={undo}><RA name="undo" /></button>
        <button aria-label="Delete report" data-tip="Delete report" onClick={clear}><RA name="trash" /></button>
        <button aria-label="Move" data-tip="Move" onClick={() => notBuilt('Moving pages')}><RA name="move" /></button>
        <button aria-label="Add page" data-tip="Add page" onClick={() => notBuilt('Adding pages')}><RA name="file-plus" /></button>
        <i className="grp-tools-sep" aria-hidden="true" />
        <button className="grp-tool" onClick={() => notBuilt('Drawing')}><RA name="draw" />Draw</button>
        <button className="grp-tool" onMouseDown={(e) => e.preventDefault()} onClick={highlight}><RA name="highlight" />Highlight</button>
        <button className={`grp-tool ${editing ? 'on' : ''}`} aria-pressed={editing} onClick={() => setEditing((v) => !v)}><RA name="edit-text" />Edit text</button>
        <button className="grp-tool" onClick={() => notBuilt('Attachments')}><EventAsset name="survey-paperclip" />Attachment</button>
        <button className="grp-tool" onClick={() => notBuilt('Signatures')}><RA name="signature" />Insert signature<EventAsset name="detail-description-chevron" /></button>
      </div>
      <div className="grp-tools-zoom">
        <button aria-label="Search report" data-tip="Search" onClick={() => notBuilt('Search in report')}><RA name="search" /></button>
        <i className="grp-tools-sep" aria-hidden="true" />
        <button aria-label="Zoom out" disabled={zoom <= ZOOMS[0]} onClick={() => setZoom((z) => ZOOMS[Math.max(0, ZOOMS.indexOf(z) - 1)])}><RA name="zoom-out" /></button>
        <button aria-label="Zoom in" disabled={zoom >= ZOOMS.at(-1)} onClick={() => setZoom((z) => ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(z) + 1)])}><RA name="zoom-in" /></button>
        <span className="grp-zoom"><select aria-label="Zoom" value={zoom} onChange={(e) => setZoom(+e.target.value)}>{ZOOMS.map((z) => <option key={z} value={z}>{z}%</option>)}</select><EventAsset name="detail-description-chevron" /></span>
      </div>
    </div></div></div>
    <div className="grp-body">
      <aside className="grp-side" aria-label="Report assistant">
        <div className="grp-thread" ref={thread} aria-live="polite">
          <p className="grp-side-q">Which document would you want me to generate based on volunteer and event data?</p>
          <div className="grp-choices">{DOC_CHOICES.map((c) => <button key={c.id} aria-pressed={choice === c.id} className={choice === c.id ? 'on' : ''} disabled={busy} onClick={() => pick(c)}>{c.label}</button>)}</div>
          {chat.map((m, i) => m.role === 'me' ? <div key={m.key} className="chat-me">{m.text}</div>
            : m.role === 'typing' ? <div key={m.key} className="chat-ai" aria-label="Assistant is typing"><Icon name="sparkles" size={14} /><span className="typing"><i /><i /><i /></span></div>
            : <div key={m.key} className="chat-ai"><Icon name="sparkles" size={14} /><div>
              <p>{m.text}</p>{m.ask && <p>{m.ask}</p>}
              {m.offer && i === chat.length - 1 && <div className="grp-choices grp-offer">{m.offer.map((c) => <button key={c.id} disabled={busy} onClick={() => pick(c)}>{c.label}</button>)}</div>}
            </div></div>)}
        </div>
        <form className="grp-chat" onSubmit={(e) => { e.preventDefault(); const t = prompt.trim(); if (!t || busy) return; setPrompt(''); const c = DOC_CHOICES.find((d) => new RegExp(d.id === 'plan' ? 'strateg|sustainab' : d.id, 'i').test(t)); if (c) pick(c, t); else say(t, { text: 'Free-form requests aren’t part of this prototype yet. Pick one of these documents and I’ll draft it:', offer: DOC_CHOICES }, 800); }}>
          <input aria-label="Type what you want to see" placeholder="Type what you want to see here..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <button aria-label="Send" disabled={!prompt.trim()}><RA name="send-sm" /></button>
        </form>
      </aside>
      <main className="grp-canvas" id="main">
        {ready ? <article className={`grp-doc ${editing ? 'editing' : ''} ${reveal ? 'grp-reveal' : ''}`} ref={doc} style={{ zoom: zoom / 100 }} contentEditable={editing} suppressContentEditableWarning aria-label={IMPACT_REPORT.title}>
          <header className="grp-doc-head"><h1>{IMPACT_REPORT.title}</h1><p>{IMPACT_REPORT.subtitle}</p></header>
          {sections.map((s, i) => <Section key={s.id} s={s} i={i + 1} open={source === s.id} onToggle={() => setSource((o) => o === s.id ? null : s.id)}
            panel={<SourcePanel section={s} grants={grants} notBuilt={notBuilt} onRemove={() => remove(s.id)} onClose={() => setSource(null)} />} />)}
        </article>
          : <div className={`grp-doc grp-skeleton ${state === 'loading' ? 'loading' : ''}`} aria-busy={state === 'loading'} aria-label={state === 'loading' ? 'Generating impact report' : 'No document yet'}>
            <div className="grp-skel-head"><i /><i /></div>
            <div className="grp-skel-body">
              <div className="ae-empty grp-skel-block">{state === 'empty' && <div className="ae-empty-content grp-skel-hint">
                <div className="ae-empty-icon"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--purple-dark)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 6 7.586 14.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 0 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" /></svg></div>
                <p>Choose a report type to get started</p>
              </div>}</div>
              <div className="ae-empty grp-skel-block" />
            </div>
            {state === 'loading' && <p className="sr" role="status">Generating impact report…</p>}
          </div>}
      </main>
    </div>
  </div>;
}
