// Report composer (full page, no app shell): #report?tpl=board&period=q4[&from&to]
// Composer chat on the left, the document on the right. State lives in RP (reportData.js),
// keyed by the query string, so it persists when navigating away and back.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon.jsx';
import { LineChart } from '../../components/LineChart.jsx';
import { Segmented, useFitZoom, usePop, usePopClose, useToast } from '../../components/ui.jsx';
import { navigate } from '../../lib/router.js';
import { reducedMotion } from '../../lib/store.js';
import { SURVEY, VOLS } from '../../data.js';
import {
  RP, rpEmit, useRP, ensureReport, newSec, chatMsg, periodInfo, hoursSeries, reportMarkdown,
  TPL_EYEBROW, TPL_NAME, SUGGESTIONS, INTENTS, SENTIMENT, SENTIMENT_SUB, SURVEY_FOOT, SURVEY_AI, SURVEY_MAX,
  ENGAGE_ROWS, EVENTS_SUB, EVENTS_ROWS, IMPACT_SUB, IMPACT_GRID, IMPACT_NOTE, TOP_SUB, TOP_ROWS,
  RETENTION_SUB, RETENTION_ROWS, NOTE_DEFAULT,
} from './reportData.js';

/* ---------------- actions (event handlers / timers only) ---------------- */
const secEl = (id) => document.querySelector(`[data-sec="${id}"]`);

function flash(id) {
  const s = RP.sections.find((x) => x.id === id);
  const el = secEl(id);
  if (!s || !el) return;
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  s.flash = true; rpEmit();
  setTimeout(() => { s.flash = false; rpEmit(); }, 1200);
}

function ask(raw) {
  const text = raw.trim();
  if (!text || RP.loading) return;
  const typing = chatMsg({ role: 'typing' });
  RP.chat.push(chatMsg({ role: 'me', text }), typing);
  rpEmit();
  const intent = INTENTS.find((i) => i.re.test(text));
  setTimeout(() => {
    RP.chat = RP.chat.filter((m) => m !== typing);
    const live = RP.sections.filter((s) => !s.leaving);
    if (intent && live.some((s) => s.kind === intent.kind)) {
      const sec = live.find((s) => s.kind === intent.kind);
      RP.chat.push(chatMsg({ role: 'ai', text: `“${sec.title}” is already in the report — I’ve highlighted it.`, sec: sec.id }));
      rpEmit();
      flash(sec.id);
      return;
    }
    let sec, reply;
    if (intent) { sec = newSec(intent.kind); reply = intent.reply; }
    else {
      const title = text.replace(/[?.!]+$/, '');
      sec = newSec('note', { title: title.charAt(0).toUpperCase() + title.slice(1, 70), text: NOTE_DEFAULT });
      reply = 'I couldn’t match that to events, surveys, the roster or grants, so I added an editable section. Try asking about retention, top volunteers or first-time attendees.';
    }
    sec.born = performance.now(); sec.fresh = true;
    RP.sections.push(sec);
    RP.chat.push(chatMsg({ role: 'ai', text: reply, sec: sec.id }));
    rpEmit();
    setTimeout(() => flash(sec.id), 60);
  }, 1000);
}

function rewrite(s, req) {
  s.busy = true;
  RP.chat.push(chatMsg({ role: 'me', text: `${s.title}: ${req}` }));
  rpEmit();
  setTimeout(() => {
    const title = req.match(/(?:rename|retitle|title|call it)\s*(?:it\s*)?(?:to|as)?\s*["“]?(.+?)["”]?$/i);
    if (/bar/i.test(req) && ['hours', 'sentiment'].includes(s.kind)) s.type = 'bar';
    else if (/line/i.test(req) && ['hours', 'sentiment'].includes(s.kind)) s.type = 'line';
    else if (/short|concise|simpl|brief|trim/i.test(req)) s.compact = true;
    else if (/longer|detail|more|expand/i.test(req)) s.compact = false;
    else if (/full|wide/i.test(req)) s.size = 'full';
    else if (/half|narrow|smaller/i.test(req)) s.size = 'half';
    if (title) s.title = title[1].charAt(0).toUpperCase() + title[1].slice(1);
    s.edits.push(req);
    // Vanilla replaces the section element: its animations replay and the edit form closes
    s.busy = false; s.rev += 1; s.born = performance.now(); s.fresh = false; s.reveal = null;
    if (RP.editing === s.id) RP.editing = null;
    RP.chat.push(chatMsg({ role: 'ai', text: `Updated “${s.title}”.`, sec: s.id }));
    rpEmit();
  }, 900);
}

function remove(s, toast) {
  const i = RP.sections.indexOf(s);
  if (i < 0) return;
  s.leaving = true;
  if (RP.editing === s.id) RP.editing = null;
  rpEmit();
  setTimeout(() => { RP.sections = RP.sections.filter((x) => x !== s); rpEmit(); }, 150);
  toast(`Removed “${s.title}”`, {
    ic: 'trash',
    action: 'Undo',
    onAction: () => {
      RP.sections = RP.sections.filter((x) => x !== s);
      RP.sections.splice(Math.min(i, RP.sections.length), 0, s);
      Object.assign(s, { leaving: false, rev: s.rev + 1, born: 0, fresh: false, reveal: null, flash: false });
      rpEmit();
      setTimeout(() => flash(s.id), 0);
    },
  });
}

/* ---------------- composer ---------------- */
function ChatMsg({ m }) {
  if (m.role === 'me') return <div className="chat-me">{m.text}</div>;
  if (m.role === 'typing') return <div className="chat-ai"><Icon name="sparkles" size={14} /><span className="typing"><i /><i /><i /></span></div>;
  return (
    <div className="chat-ai">
      <Icon name="sparkles" size={14} />
      <div>{m.text}{m.sec && <> <a href={`#${m.sec}`} onClick={(e) => { e.preventDefault(); flash(m.sec); }}>Show me</a></>}</div>
    </div>
  );
}

function Composer({ p }) {
  const [val, setVal] = useState('');
  const chatRef = useRef(null);
  const first = useRef(true);
  const used = new Set(RP.sections.map((s) => s.kind));
  const lastKey = RP.chat.length ? RP.chat[RP.chat.length - 1].key : 0;
  // Scroll to the newest message on each push (not on mount — vanilla restores at the top)
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    const c = chatRef.current; if (c) c.scrollTop = c.scrollHeight;
  }, [lastKey]);

  const submit = (e) => { e.preventDefault(); ask(val); setVal(''); };
  return (
    <aside className="rp-composer">
      <div className="rp-c-head">{TPL_NAME[RP.tpl]} • {p.short}</div>
      <div className="rp-chat" id="rpChat" ref={chatRef}>
        <div className="rp-intro">I can edit and adjust the information here from events, surveys, the volunteer roster and grant commitments for {p.short}. Ask for anything, or start here —</div>
        {SUGGESTIONS.map(([t, k]) => (
          <button key={k} type="button" className={`sugg ${used.has(k) ? 'used' : ''}`} onClick={() => ask(t)}>{t}</button>
        ))}
        {RP.chat.map((m) => <ChatMsg key={m.key} m={m} />)}
      </div>
      <form className="rp-input" onSubmit={submit}>
        <input id="rpIn" placeholder="Type what you want to see here…" autoComplete="off" aria-label="Ask the composer" value={val} onChange={(e) => setVal(e.target.value)} />
        <button className={`send-circle ${val.trim() ? 'ready' : ''}`} id="rpSend" aria-label="Send"><Icon name="arrow-up" size={16} /></button>
      </form>
    </aside>
  );
}

/* ---------------- sections ---------------- */
function NoteText({ s }) {
  const ref = useRef(null);
  // Uncontrolled contenteditable: seed once per mount, write edits back to the section data
  useLayoutEffect(() => { if (ref.current) ref.current.textContent = s.text ?? ''; }, [s]);
  return <p className="note-text" contentEditable spellCheck suppressContentEditableWarning ref={ref} onInput={(e) => { s.text = e.currentTarget.textContent; }} />;
}

function SecBody({ s, animate }) {
  const edits = s.edits.length > 0 && (
    <div className="muted" style={{ fontSize: 12, marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
      <Icon name="sparkles" size={12} /> Edited: “{s.edits[s.edits.length - 1]}”
    </div>
  );
  const head = (sub, trend = true) => (
    <>
      <h3>{s.title}</h3>
      {s.compact || !sub ? null : trend
        ? <div className="trend"><Icon name="trend" size={14} /> {sub}</div>
        : <div className="lbl-sm">{sub}</div>}
    </>
  );
  switch (s.kind) {
    case 'hours': {
      const h = hoursSeries();
      return <>{head(h.note)}<LineChart className="chart" labels={h.labels} values={h.values} unit="hours" type={s.type} animate={animate} />{edits}</>;
    }
    case 'sentiment':
      return <>{head(SENTIMENT_SUB)}<LineChart className="chart" labels={SENTIMENT.labels} values={SENTIMENT.values} max={100} unit="% positive" type={s.type} animate={animate} />{edits}</>;
    case 'survey':
      return (
        <>
          <div className="lbl-sm" style={{ fontSize: 14 }}>{s.title}</div>
          <div className="bars">
            {SURVEY.map((x, i) => <div key={i} className="bar grow" style={{ height: `${(x.n / SURVEY_MAX) * 100}%`, animationDelay: `${i * 40}ms` }} data-tip={`${x.event} — ${x.n} responses`} />)}
          </div>
          <div className="bar-foot">{SURVEY_FOOT.map((t) => <span key={t}>{t}</span>)}</div>
          {!s.compact && <div className="ai-sum"><div className="h"><Icon name="sparkles" size={14} /> AI summary</div><p>{SURVEY_AI}</p></div>}
          {edits}
        </>
      );
    case 'engage':
      return (
        <>
          <div className="lbl-sm" style={{ fontSize: 14 }}>{s.title}</div>
          {(s.compact ? ENGAGE_ROWS.slice(0, 2) : ENGAGE_ROWS).map(([l, t, b]) => (
            <div className="stat-row" key={l}><div><div className="lbl">{l}</div><div className="trend"><Icon name="trend" size={13} /> {t}</div></div><div className="big">{b}</div></div>
          ))}
          {edits}
        </>
      );
    case 'events':
      return (
        <>
          {head(EVENTS_SUB, false)}
          <div className="hbars">{EVENTS_ROWS.map(([l, n], i) => <div className="hbar" key={l}><span>{l}</span><div className="track"><div style={{ width: `${(n / 34) * 100}%`, animationDelay: `${i * 40}ms` }} /></div><b>{n}</b></div>)}</div>
          {edits}
        </>
      );
    case 'impact':
      return (
        <>
          {head(IMPACT_SUB, false)}
          <div className="stat-grid">{IMPACT_GRID.map(([b, l]) => <div key={l}><span className="big">{b}</span><span>{l}</span></div>)}</div>
          {!s.compact && <p className="note-text muted" style={{ fontSize: 13 }}>{IMPACT_NOTE}</p>}
          {edits}
        </>
      );
    case 'top':
      return (
        <>
          {head(TOP_SUB, false)}
          <table className="vol-table">
            <thead><tr><th>Volunteer</th><th>Program</th><th>Hours</th></tr></thead>
            <tbody>{TOP_ROWS.map((r) => <tr key={r}><td>{VOLS[r].name}</td><td className="muted">{VOLS[r].role}</td><td>{VOLS[r].hours}</td></tr>)}</tbody>
          </table>
          {edits}
        </>
      );
    case 'retention':
      return (
        <>
          {head(RETENTION_SUB, false)}
          <div className="hbars">{RETENTION_ROWS.map(([l, n], i) => <div className="hbar" key={l} style={{ gridTemplateColumns: '120px 1fr 38px' }}><span>{l}</span><div className="track"><div style={{ width: `${n}%`, animationDelay: `${i * 40}ms` }} /></div><b>{n}%</b></div>)}</div>
          {edits}
        </>
      );
    case 'note':
      return <><h3>{s.title}</h3><NoteText s={s} />{edits}</>;
    default: return null;
  }
}

function Section({ s, animate, toast }) {
  const editing = RP.editing === s.id;
  const inputRef = useRef(null);
  const revealIdx = animate ? s.reveal : null;
  const cls = ['sec', s.size, s.fresh && animate && 'is-new', revealIdx != null && 'reveal', editing && 'editing', s.busy && 'busy', s.leaving && 'leaving', s.flash && 'flash'].filter(Boolean).join(' ');
  const toggleEdit = () => {
    RP.editing = editing ? null : s.id;
    rpEmit();
    if (!editing) setTimeout(() => inputRef.current?.focus(), 60);
  };
  const submit = (e) => {
    e.preventDefault();
    const req = inputRef.current.value.trim();
    if (!req) return;
    rewrite(s, req);
  };
  return (
    <section className={cls} data-sec={s.id} style={revealIdx ? { animationDelay: `${revealIdx * 50}ms` } : undefined}>
      <div className="sec-tools">
        <button type="button" onClick={toggleEdit}>Rewrite</button>
        <button type="button" onClick={() => remove(s, toast)}>Remove</button>
      </div>
      <div className="sec-body"><SecBody s={s} animate={animate} /></div>
      <div className="sec-edit">
        <div>
          <form onSubmit={submit}>
            <input ref={inputRef} placeholder="What should change? e.g. “make it a bar chart”" aria-label="What should change?" autoComplete="off"
              onKeyDown={(e) => { if (e.key === 'Escape' && RP.editing === s.id) { RP.editing = null; rpEmit(); } }} />
            <button className="send-circle" aria-label="Apply"><Icon name="arrow-up" size={16} /></button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Sections({ mountedAt }) {
  const toast = useToast();
  if (RP.loading) {
    return <><div className="skel" style={{ gridColumn: '1/-1', height: 300 }} /><div className="skel" style={{ height: 280 }} /><div className="skel" style={{ height: 280 }} /></>;
  }
  if (!RP.sections.length) {
    return <div className="doc-empty"><Icon name="sparkles" size={20} /><p style={{ margin: '10px 0 0' }}>This report is empty. Describe what you want in the composer — e.g. “retention by cohort” or “top volunteers”.</p></div>;
  }
  // Sections created/rewritten/revealed while this page instance is mounted animate in; a
  // report restored on navigating back renders still (vanilla re-renders without reveal/is-new).
  return RP.sections.map((s) => <Section key={`${s.id}:${s.rev}`} s={s} animate={s.born >= mountedAt} toast={toast} />);
}

/* ---------------- export popover ---------------- */
function ExportPop() {
  useRP();
  const close = usePopClose();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const pdf = RP.exportFmt === 'pdf';
  const pages = Math.max(1, Math.ceil(RP.sections.length / 3));
  const doExport = () => {
    if (!pdf) {
      const name = `${periodInfo().file}-Volunteer-Report.md`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([reportMarkdown()], { type: 'text/markdown' }));
      a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      close(); toast(`Downloaded ${name}`, { ic: 'download' });
      return;
    }
    setBusy(true);
    setTimeout(() => { close(true); window.print(); }, 900);
  };
  return (
    <div className="export" role="dialog" aria-label="Export report">
      <div className="lbl">Format</div>
      <Segmented className="purple" id="fmtSeg" value={RP.exportFmt} onChange={(v) => { RP.exportFmt = v; rpEmit(); }}
        options={[{ v: 'pdf', label: 'PDF' }, { v: 'md', label: 'Markdown file' }]} />
      <div className="meta" id="fmtMeta">
        {pdf
          ? `Letter • ${(0.8 + RP.sections.length * 0.4).toFixed(1)} MB • ${pages} ${pages === 1 ? 'page' : 'pages'}`
          : `Plain text • ${Math.max(1, Math.round(reportMarkdown().length / 1024))} KB • opens in Notion, Docs or GitHub`}
      </div>
      <button type="button" className="btn btn-dark btn-block" disabled={busy} onClick={doExport}>
        {busy ? <><span className="spin" /> Preparing…</> : pdf ? 'Export PDF' : 'Export Markdown'}
      </button>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function Report({ params }) {
  ensureReport(params); // idempotent per query string (cache-style lazy init, safe to repeat)
  useRP();
  const ref = useRef(null);
  const pop = usePop();
  const [mountedAt] = useState(() => performance.now());
  useFitZoom(ref, { designWidth: 1728, minWidth: 0, measure: 'window', fillHeight: true });

  // Skeleton for ~1.1s, then the staggered reveal. Cleanup clears the timer, so StrictMode's
  // mount → unmount → mount fires it exactly once.
  const key = RP.key;
  const loading = RP.loading;
  useEffect(() => {
    if (!loading) return undefined;
    const t = setTimeout(() => {
      RP.loading = false;
      const now = performance.now();
      RP.sections.forEach((s, i) => { s.born = now; s.reveal = i; });
      rpEmit();
    }, 1100);
    return () => clearTimeout(t);
  }, [key, loading]);
  // An open Rewrite form doesn't survive leaving the page (vanilla re-renders from scratch)
  useEffect(() => () => { RP.editing = null; }, []);

  const p = periodInfo();
  return (
    <div className="report" ref={ref}>
      <header className="rp-top">
        <nav className="crumbs" aria-label="Breadcrumb">
          <a href="#dashboard" onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}>Dashboard</a>
          <Icon name="chev-r" size={24} />
          <span aria-current="page">{p.title} Volunteer Report</span>
        </nav>
        <button type="button" className="btn btn-dark rp-btn" aria-haspopup="dialog" onClick={(e) => pop.toggle(e.currentTarget, <ExportPop />, { align: 'end' })}>Export</button>
      </header>
      <div className="rp-body">
        <Composer p={p} />
        <main className="rp-canvas" id="rpCanvas">
          <article className="doc" id="doc">
            <header className="doc-head">
              <div className="eyebrow">{TPL_EYEBROW[RP.tpl]}</div>
              <h1 className="h1">{p.title} Volunteer Report</h1>
              <div className="doc-range">{p.range} · Built from 14 events, 248 survey responses and 120 volunteer records</div>
            </header>
            <div className="doc-sections" id="docSections"><Sections mountedAt={mountedAt} /></div>
          </article>
        </main>
      </div>
    </div>
  );
}
