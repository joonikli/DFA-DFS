// Figma: Final › Grants — Generate optional documents (2324:50057), Generate impact report (2324:50103, 2324:50327)
// Full-screen document workspace (no app sidebar in the Figma frames).
import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowUp,
  Bookmark,
  ChartLine,
  ChevronDown,
  ChevronRight,
  Download,
  FilePlus2,
  Highlighter,
  Minus,
  Move,
  Paperclip,
  Pencil,
  Plus,
  Redo2,
  Search,
  Signature,
  TextCursor,
  Trash2,
  Undo2,
} from 'lucide-react'
import { ChoiceBars } from '../../components/Charts/Charts.jsx'
import ExportMenu, { downloadText } from '../../features/reports/ExportMenu.jsx'
import { useDismiss } from '../../lib/useDismiss.js'
import { REPORT_TYPES, impactReport } from '../../mock/grants.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { useGrants } from '../../features/grants/useGrants.js'
import './GenerateReports.css'

const DOC_IDS = { 'Strategic & sustainability plan': 'strategic', 'Annual report': 'annual', 'Impact report': 'impact', 'Media coverage': 'media' }

/** Variants of the generated report for the other document types (reuse the impact-report data). */
function reportFor(type) {
  if (type === 'Impact report') return impactReport
  const pick = {
    'Annual report': ['A Message from Our Executive Director', 'The Year at a Glance', 'Financial Summary', 'Our Funders and Partners'],
    'Strategic & sustainability plan': ['Our Mission', 'Who We Serve', 'Looking Ahead: FY2026-27 Goals', 'Financial Summary'],
    'Media coverage': ['Client Story', 'Programs and Outcomes', 'How to Get Involved'],
  }[type]
  return {
    ...impactReport,
    title: `Dress for Success Pittsburgh: 2025–2026 ${type}`,
    sections: impactReport.sections.filter((s) => pick.includes(s.h)),
  }
}

const md = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1')
const rich = (s) =>
  s.split(/(\*\*.+?\*\*)/).map((part, i) => (part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>))

function toMarkdown(r) {
  const out = [`# ${r.title}`, '', r.subtitle, '']
  for (const s of r.sections) {
    out.push(`## ${s.h}`, '')
    if (s.p) out.push(s.p, '')
    if (s.sign) out.push(`*${s.sign}*`, '')
    if (s.table) {
      out.push(`| ${s.table.head.join(' | ')} |`, `| ${s.table.head.map(() => '---').join(' | ')} |`)
      s.table.rows.forEach((r2) => out.push(`| ${r2.slice(0, s.table.head.length).join(' | ')} |`))
      out.push('')
    }
    s.sub?.forEach((x) => out.push(`### ${x.h}`, '', x.p, '', ...x.list.map((l) => `- ${l}`), ''))
    if (s.quote) out.push(`> ${s.quote.join('')}`, '')
    s.list?.forEach((l) => out.push(`- ${md(l)}`))
    s.ordered?.forEach((l, i) => out.push(`${i + 1}. ${l}`))
    if (s.after) out.push('', s.after)
    out.push('')
  }
  out.push(r.footer)
  return out.join('\n')
}

/** "This data comes from" popover anchored to a chart icon in the margin (Figma 2324:50327). */
function SourcePopover({ onClose, onRemove, onRewrite }) {
  const ref = useRef(null)
  useDismiss(ref, true, onClose)
  const [text, setText] = useState('')
  return (
    <div className="source-pop" ref={ref} role="dialog" aria-label="Data source">
      <div className="source-pop__head">
        <p className="text-subheading">This data comes from:</p>
        <span className="source-pop__tags">
          {['Fill-A-Bag Survey', 'Warehouse Wednesday Survey'].map((s) => (
            <span key={s} className="ai-source">
              <Bookmark size={10} strokeWidth={2} aria-hidden="true" /> {s}
            </span>
          ))}
        </span>
        <span className="source-pop__btns">
          <button type="button" onClick={onRewrite}>
            Rewrite
          </button>
          <button type="button" onClick={onRemove}>
            Remove
          </button>
        </span>
      </div>
      <p className="sq__prompt text-label-1">
        <span className="sq__num">Q #1</span> How sufficient did you find our clothing selection?
        <Pencil size={16} strokeWidth={1.75} className="sq__edit" aria-hidden="true" />
      </p>
      <ChoiceBars options={['Very sufficient', 'Somewhat sufficient', 'Not very sufficient', 'Not at all sufficient']} counts={[7, 9, 10, 4]} />
      <form
        className="report-prompt"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) onRewrite(text)
        }}
      >
        <input className="text-body" placeholder="What should change?" value={text} onChange={(e) => setText(e.target.value)} aria-label="What should change?" />
        <button type="submit" aria-label="Send" disabled={!text.trim()}>
          <ArrowUp size={16} strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}

export default function GenerateReports() {
  const [params] = useSearchParams()
  const grantId = params.get('grant')
  const grant = useGrants().find((g) => g.id === grantId)
  const { grantUpload, showToast } = useDemo()
  const [type, setType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [editing, setEditing] = useState(false)
  const [removed, setRemoved] = useState([])
  const [source, setSource] = useState(null) // section heading with open popover
  const [showDownload, setShowDownload] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [notes, setNotes] = useState([])
  const closeSource = useCallback(() => setSource(null), [])
  const closeDownload = useCallback(() => setShowDownload(false), [])

  const report = useMemo(() => (type ? reportFor(type) : null), [type])

  function choose(t) {
    setType(t)
    setRemoved([])
    setNotes([])
    setLoading(true)
    setTimeout(() => setLoading(false), 1100)
  }

  const soon = (what) => showToast({ variant: 'default', parts: [[what, true]], preview: 'Not wired up in this prototype.', time: 'Now', category: 'Event' })

  function exportFile(format) {
    setShowDownload(false)
    if (!report) return
    if (format === 'md') {
      downloadText(toMarkdown(report), `${type.replace(/\W+/g, '-').toLowerCase()}.md`)
    } else {
      window.print()
    }
  }

  return (
    <div className="reports">
      <header className="reports__top">
        <nav className="reports__crumbs text-subheading" aria-label="Breadcrumb">
          <Link to="/grants">Documents</Link>
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>Generate reports</span>
        </nav>
        <div className="reports__top-actions">
          <button
            type="button"
            className="reports__add text-body"
            disabled={!report || loading}
            onClick={() => {
              const file = `${type.replace(/\W+/g, '_')}_2026.pdf`
              if (grant) grantUpload(grant.id, DOC_IDS[type], file)
              showToast({
                variant: 'success',
                parts: [['Added to documents', true]],
                preview: grant ? `${file} is now attached to ${grant.title}.` : `${file} saved to your documents.`,
                time: 'Now',
                category: 'Event',
              })
            }}
          >
            Add to documents <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <div className="reports__download-wrap">
            <button type="button" className="reports__download text-body" disabled={!report || loading} onClick={() => setShowDownload((x) => !x)} aria-expanded={showDownload}>
              Download <Download size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
            {showDownload && <ExportMenu onClose={closeDownload} onExport={exportFile} />}
          </div>
        </div>
      </header>

      {report && !loading && (
        <div className="reports__toolbar text-body-2" role="toolbar" aria-label="Document tools">
          <span className="reports__tools">
            <button type="button" aria-label="Redo" onClick={() => soon('Redo')}>
              <Redo2 size={20} strokeWidth={1.75} />
            </button>
            <button type="button" aria-label="Undo" onClick={() => soon('Undo')}>
              <Undo2 size={20} strokeWidth={1.75} />
            </button>
            <button type="button" aria-label="Delete page" onClick={() => soon('Delete page')}>
              <Trash2 size={20} strokeWidth={1.75} />
            </button>
            <button type="button" aria-label="Move" onClick={() => soon('Move')}>
              <Move size={20} strokeWidth={1.75} />
            </button>
            <button type="button" aria-label="Add page" onClick={() => soon('Add page')}>
              <FilePlus2 size={20} strokeWidth={1.75} />
            </button>
            <span className="reports__sep" aria-hidden="true" />
            <button type="button" onClick={() => soon('Draw')}>
              <Pencil size={20} strokeWidth={1.75} /> Draw
            </button>
            <button type="button" onClick={() => soon('Highlight')}>
              <Highlighter size={20} strokeWidth={1.75} /> Highlight
            </button>
            <button type="button" className={editing ? 'is-on' : ''} aria-pressed={editing} onClick={() => setEditing((x) => !x)}>
              <TextCursor size={20} strokeWidth={1.75} /> Edit text
            </button>
            <button type="button" onClick={() => soon('Attachment')}>
              <Paperclip size={20} strokeWidth={1.75} /> Attachment
            </button>
            <button type="button" onClick={() => soon('Insert signature')}>
              <Signature size={20} strokeWidth={1.75} /> Insert signature <ChevronDown size={18} strokeWidth={1.75} />
            </button>
          </span>
          <span className="reports__tools">
            <button type="button" aria-label="Search document" onClick={() => soon('Search')}>
              <Search size={20} strokeWidth={1.75} />
            </button>
            <span className="reports__sep" aria-hidden="true" />
            <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(50, z - 10))}>
              <Minus size={20} strokeWidth={1.75} />
            </button>
            <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(200, z + 10))}>
              <Plus size={20} strokeWidth={1.75} />
            </button>
            <select className="reports__zoom" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom">
              {[50, 75, 90, 100, 110, 125, 150, 200].includes(zoom) ? null : <option value={zoom}>{zoom}%</option>}
              {[50, 75, 90, 100, 110, 125, 150, 200].map((z) => (
                <option key={z} value={z}>
                  {z}%
                </option>
              ))}
            </select>
          </span>
        </div>
      )}

      <div className="reports__body">
        <aside className="reports__panel">
          <p className="text-label-1">Which document would you want me to generate based on volunteer and event data?</p>
          {grant && <p className="text-label-2 report-muted">For: {grant.title}</p>}
          <div className="reports__options">
            {REPORT_TYPES.map((t) => (
              <button key={t} type="button" className={`reports__option text-label-2 ${type === t ? 'is-on' : ''}`} onClick={() => choose(t)}>
                {t}
              </button>
            ))}
          </div>
          {notes.length > 0 && (
            <ul className="reports__notes text-label-2">
              {notes.map((n, i) => (
                <li key={i}>
                  <span className="report-muted">You:</span> {n}
                  <br />
                  <span className="report-muted">Updated the draft ✓</span>
                </li>
              ))}
            </ul>
          )}
          <form
            className="report-prompt reports__chat"
            onSubmit={(e) => {
              e.preventDefault()
              if (!prompt.trim()) return
              if (!type) choose('Impact report')
              setNotes((n) => [...n, prompt.trim()])
              setPrompt('')
            }}
          >
            <input className="text-label-2" placeholder="Type what you want to see here..." value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Ask for changes" />
            <button type="submit" aria-label="Send" disabled={!prompt.trim()}>
              <ArrowUp size={16} strokeWidth={2} />
            </button>
          </form>
        </aside>

        <main className="reports__canvas">
          <div className="reports__page" style={{ zoom: zoom / 100 }} contentEditable={editing} suppressContentEditableWarning>
            {!report || loading ? (
              <div className={`reports__skeleton ${loading ? 'is-loading' : ''}`} aria-busy={loading} aria-label={loading ? `Generating ${type}` : 'Choose a document to generate'}>
                <span style={{ width: '33%' }} />
                <span style={{ width: '62%' }} />
                <hr />
                <div className="reports__skel-block" />
                <div className="reports__skel-block" />
                {!loading && <p className="reports__hint text-body">Pick a document on the left and I’ll draft it from your volunteer and event data.</p>}
              </div>
            ) : (
              <article className="report">
                <h1>{report.title}</h1>
                <p className="report__sub">{report.subtitle}</p>
                <hr />
                {report.sections
                  .filter((s) => !removed.includes(s.h))
                  .map((s) => (
                    <section key={s.h} className="report__section">
                      {s.source && (
                        <span className="report__source-wrap" contentEditable={false}>
                          <button type="button" className="report__source" aria-label={`Where does “${s.h}” data come from?`} onClick={() => setSource(s.h)}>
                            <ChartLine size={16} strokeWidth={1.75} />
                          </button>
                          {source === s.h && (
                            <SourcePopover
                              onClose={closeSource}
                              onRemove={() => {
                                setRemoved((r) => [...r, s.h])
                                setSource(null)
                              }}
                              onRewrite={(t) => {
                                setSource(null)
                                showToast({ variant: 'success', parts: [['Section rewritten', true]], preview: typeof t === 'string' ? `“${t}” applied to ${s.h}.` : `${s.h} was regenerated.`, time: 'Now', category: 'Event' })
                              }}
                            />
                          )}
                        </span>
                      )}
                      <h2>{s.h}</h2>
                      {s.p && <p>{s.p}</p>}
                      {s.sign && <p className="report__sign">{s.sign}</p>}
                      {s.table && (
                        <div className="report__table">
                          <table>
                            <thead>
                              <tr>
                                {s.table.head.map((h) => (
                                  <th key={h}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {s.table.rows.map((r) => (
                                <tr key={r[0]}>
                                  {s.table.head.map((_, i) => (
                                    <td key={i} className={i === 0 || r[3] ? 'is-strong' : ''}>
                                      {r[i]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {s.sub?.map((x) => (
                        <div key={x.h} className="report__sub-section">
                          <h3>{x.h}</h3>
                          <p>{x.p}</p>
                          <ul>
                            {x.list.map((l) => (
                              <li key={l}>{l}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {s.quote && (
                        <p>
                          <span className="report__quote">{s.quote[0]}</span>
                          {s.quote[1]}
                        </p>
                      )}
                      {s.list && (
                        <ul>
                          {s.list.map((l) => (
                            <li key={l}>{rich(l)}</li>
                          ))}
                        </ul>
                      )}
                      {s.ordered && (
                        <ol>
                          {s.ordered.map((l) => (
                            <li key={l}>{l}</li>
                          ))}
                        </ol>
                      )}
                      {s.after && <p>{s.after}</p>}
                    </section>
                  ))}
                {notes.length > 0 && (
                  <section className="report__section">
                    <h2>Additional notes</h2>
                    <ul>
                      {notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </section>
                )}
                <p className="report__footer">{report.footer}</p>
              </article>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
