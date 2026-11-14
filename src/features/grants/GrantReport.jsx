// Grant documents › Generate reports (Figma 2324:50057, 2324:50103, 2324:50327).
// Full-screen like the dashboard's report composer, but a separate route (#grant-report) that is only
// reachable from a grant's View documents dialog. The dashboard composer (#report) is untouched.
import { useEffect, useRef, useState } from 'react';
import { useToast } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { navigate } from '../../lib/router.js';
import EventAsset from '../events/EventAsset.jsx';
import { Bars } from '../surveys/SurveyDetail.jsx';
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

// "This data comes from" — survey sources show that survey's first chart; the financial table shows grant revenue
function SourcePanel({ section, grants, onRemove, onClose, notBuilt }) {
  const ref = useRef(null);
  useEffect(() => {
    const away = (e) => { if (!ref.current?.contains(e.target) && !e.target.closest('.grp-chart-btn')) onClose(); };
    const esc = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    ref.current?.querySelector('a, button')?.focus();
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [onClose]);
  let tags, question, options, total;
  if (section.sources.grants) {
    const funded = grants.filter((g) => g.status === 'Accepted');
    tags = funded.slice(0, 2).map((g) => ({ label: g.title, href: '#grants' }));
    question = 'Accepted grant revenue by funder';
    options = funded.map((g, i) => ({ label: g.title, count: g.amount, color: PALETTE[i % PALETTE.length] }));
    total = options.reduce((s, o) => s + o.count, 0);
  } else {
    const surveys = section.sources.surveys.map((id) => ALL_SURVEYS.find((s) => s.id === id));
    tags = surveys.map((s) => ({ label: `${s.title.replace(/ Event$/, '')} Survey`, href: `#surveys?survey=${s.id}` }));
    const q = resultsFor(surveys[0]).questions.find((x) => x.kind === 'choice');
    question = q.title; options = q.options; total = surveys[0].responses;
  }
  return <div className="grp-source" ref={ref} role="dialog" aria-label={`Data sources for ${section.title}`}>
    <div className="grp-source-head">
      <p>This data comes from:</p>
      <div className="grp-source-tags">{tags.map((t) => <a key={t.label} className="as-source" href={t.href}><img className="ae-asset" src="/assets/surveys/ai-bookmark.svg" alt="" aria-hidden="true" />{t.label}</a>)}</div>
      <div className="grp-seg" role="group" aria-label="Section actions"><button onClick={() => notBuilt('Rewriting a section')}>Rewrite</button><button onClick={onRemove}>Remove</button></div>
    </div>
    <div className="sd-question"><h2><span>{section.sources.grants ? 'Grants' : 'Q #1'}</span>{question}</h2></div>
    <Bars options={options} total={total} />
    <form className="grp-ask" onSubmit={(e) => { e.preventDefault(); notBuilt('Editing a section with AI'); }}>
      <input aria-label="What should change?" placeholder="What should change?" />
      <button aria-label="Send"><RA name="send" /></button>
    </form>
  </div>;
}

function Section({ s, open, onToggle, panel }) {
  return <section className="grp-sec" data-section={s.id}>
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
  const doc = useRef(null), dl = useRef(null);
  const ready = state === 'ready';
  useEffect(() => { document.getElementById('main')?.scrollTo?.(0, 0); }, []);
  useEffect(() => {
    if (!download) return undefined;
    const away = (e) => { if (!dl.current?.contains(e.target)) setDownload(false); };
    const esc = (e) => { if (e.key === 'Escape') setDownload(false); };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [download]);

  const back = () => navigate(grant ? `grants?docs=${grant.id}` : 'grants');
  const pick = (c) => {
    if (c.id !== 'impact') { toast(`${c.label} isn’t part of this prototype yet — try Impact report.`, { ic: 'info' }); return; }
    setChoice(c.id); setSource(null);
    if (ready) return;
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
    {ready && <div className="grp-tools" role="toolbar" aria-label="Edit document">
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
    </div>}
    <div className="grp-body">
      <aside className="grp-side" aria-label="Report assistant">
        <div>
          <p className="grp-side-q">Which document would you want me to generate based on volunteer and event data?</p>
          <div className="grp-choices">{DOC_CHOICES.map((c) => <button key={c.id} aria-pressed={choice === c.id} className={choice === c.id ? 'on' : ''} onClick={() => pick(c)}>{c.label}</button>)}</div>
        </div>
        <form className="grp-chat" onSubmit={(e) => { e.preventDefault(); const t = prompt.trim(); if (!t) return; setPrompt(''); if (/impact/i.test(t)) pick(DOC_CHOICES[2]); else toast('Free-form prompts aren’t part of this prototype — pick a document above.', { ic: 'info' }); }}>
          <input aria-label="Type what you want to see" placeholder="Type what you want to see here..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <button aria-label="Send" disabled={!prompt.trim()}><RA name="send-sm" /></button>
        </form>
      </aside>
      <main className="grp-canvas" id="main">
        {ready ? <article className={`grp-doc ${editing ? 'editing' : ''}`} ref={doc} style={{ zoom: zoom / 100 }} contentEditable={editing} suppressContentEditableWarning aria-label={IMPACT_REPORT.title}>
          <header className="grp-doc-head"><h1>{IMPACT_REPORT.title}</h1><p>{IMPACT_REPORT.subtitle}</p></header>
          {sections.map((s) => <Section key={s.id} s={s} open={source === s.id} onToggle={() => setSource((o) => o === s.id ? null : s.id)}
            panel={<SourcePanel section={s} grants={grants} notBuilt={notBuilt} onRemove={() => remove(s.id)} onClose={() => setSource(null)} />} />)}
        </article>
          : <div className={`grp-doc grp-skeleton ${state === 'loading' ? 'loading' : ''}`} aria-busy={state === 'loading'} aria-label={state === 'loading' ? 'Generating impact report' : 'No document yet'}>
            <div className="grp-skel-head"><i /><i /></div>
            <div className="grp-skel-body"><i /><i /></div>
            {state === 'loading' && <p className="sr" role="status">Generating impact report…</p>}
          </div>}
      </main>
    </div>
  </div>;
}
