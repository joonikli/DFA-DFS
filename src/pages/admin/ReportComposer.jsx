// Figma: Final › Report creation - Hi fi (section 2324:48900)
//   skeleton (2324:48901) → generated (2324:49281) → hover Rewrite/Remove (2324:49507) → "What should change?" (2324:49388) → Export (2324:49623)
import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUp, ChevronRight, Sparkles, TrendingUp } from 'lucide-react'
import { LineTrend } from '../../components/Charts/Charts.jsx'
import ExportMenu, { downloadText } from '../../features/reports/ExportMenu.jsx'
import {
  PERIODS,
  REPORT_KINDS,
  SUGGESTIONS,
  engagement,
  firstTimeAttendees,
  grantCommitments,
  grantMetrics,
  sentiment,
  surveyBars,
} from '../../features/reports/reportData.js'
import { aiSummary } from '../../mock/adminSurveys.js'
import { useDemo } from '../../store/DemoStore.jsx'
import './GenerateReports.css'
import '../../features/reports/ReportComposer.css'

const TITLES = {
  hours: 'Average hours over time',
  survey: 'Post-event survey',
  engagement: 'Engagement analysis',
  grants: 'Grant commitments',
  firstTime: 'First-time attendees by event',
  sentiment: 'Survey sentiment over time',
  grantMetrics: 'Grant-eligible impact metrics, YTD',
}

/** A report block with the hover "Rewrite | Remove" controls and the "What should change?" box. */
function Block({ id, wide, tinted, children, onRemove, onRewrite, heading, subtitle }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  return (
    <section className={`rc-block ${wide ? 'rc-block--wide' : ''} ${tinted ? 'rc-block--tinted' : ''} ${editing ? 'is-editing' : ''}`} aria-label={TITLES[id]}>
      <div className="rc-block__controls">
        <button type="button" onClick={() => setEditing((x) => !x)}>
          Rewrite
        </button>
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
      {heading && (
        <header className="rc-block__head">
          {heading}
          {subtitle && (
            <p className="rc-up text-label-2">
              <TrendingUp size={14} strokeWidth={2} aria-hidden="true" /> {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
      {editing && (
        <form
          className="report-prompt rc-block__prompt"
          onSubmit={(e) => {
            e.preventDefault()
            onRewrite(text)
            setText('')
            setEditing(false)
          }}
        >
          <input className="text-label-2" autoFocus placeholder="What should change?" value={text} onChange={(e) => setText(e.target.value)} aria-label="What should change?" />
          <button type="submit" aria-label="Send" disabled={!text.trim()}>
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </form>
      )}
    </section>
  )
}

export default function ReportComposer() {
  const [params] = useSearchParams()
  const kind = REPORT_KINDS[params.get('kind')] ? params.get('kind') : 'board'
  const period = PERIODS[params.get('period')] ? params.get('period') : 'q4'
  const K = REPORT_KINDS[kind]
  const P = PERIODS[period]
  const { showToast } = useDemo()
  const [loading, setLoading] = useState(true)
  const [blocks, setBlocks] = useState(K.blocks)
  const [prompt, setPrompt] = useState('')
  const [asked, setAsked] = useState([])
  const [showExport, setShowExport] = useState(false)
  const closeExport = useCallback(() => setShowExport(false), [])
  const title = `${P.label} Volunteer Report`

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const remove = (id) => setBlocks((b) => b.filter((x) => x !== id))
  const rewrite = (id) => (text) =>
    showToast({ variant: 'success', parts: [['Block rewritten', true]], preview: text ? `“${text}” applied to ${TITLES[id]}.` : `${TITLES[id]} regenerated.`, time: 'Now', category: 'Event' })

  function ask(q) {
    const match = SUGGESTIONS.find((s) => s.prompt === q)
    setAsked((a) => [...a, q])
    const id = match?.id ?? 'sentiment'
    setBlocks((b) => (b.includes(id) ? b : [...b, id]))
  }

  function exportFile(format) {
    setShowExport(false)
    if (format === 'md') {
      const lines = [`# ${title}`, `${K.eyebrow} · ${P.range}`, '']
      for (const b of blocks) lines.push(`## ${TITLES[b]}`, '')
      lines.push(`_${aiSummary.text}_`)
      downloadText(lines.join('\n'), `${title.replace(/\W+/g, '-').toLowerCase()}.md`)
    } else window.print()
  }

  const render = (id) => {
    const common = { id, onRemove: () => remove(id), onRewrite: rewrite(id) }
    switch (id) {
      case 'hours':
        return (
          <Block {...common} wide tinted heading={<h2 className="text-heading-2">{TITLES.hours}</h2>} subtitle="Twelve straight months of logged hours, ending on the year’s high">
            <LineTrend data={P.hours} xKey="x" yKey="y" unit="hours" height={210} yDomain={[0, 300]} yTicks={[0, 100, 200, 300]} />
          </Block>
        )
      case 'sentiment':
        return (
          <Block {...common} wide tinted heading={<h2 className="text-heading-2">{TITLES.sentiment}</h2>} subtitle="Positive responses up 21 points since March">
            <LineTrend data={sentiment} xKey="x" yKey="y" unit="% positive" height={200} yDomain={[0, 100]} yTicks={[0, 25, 50, 75, 100]} />
          </Block>
        )
      case 'survey':
        return (
          <Block {...common}>
            <p className="text-body rc-muted">{TITLES.survey}</p>
            <div className="rc-bars" role="img" aria-label="Survey ratings over the last five events, trending up">
              {surveyBars.map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} title={`Event ${i + 1}`} />
              ))}
            </div>
            <p className="rc-split text-label-2 rc-muted">
              <span>4.6 / 5 avg rating</span>
              <span>248 responses</span>
            </p>
            <div className="rc-ai">
              <p className="text-label-2 rc-ai__label">
                <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" /> AI summary
              </p>
              <p className="text-label-2 rc-muted">In our recent survey, volunteers at Dress for Success reported a 95% satisfaction rate with the in-person mobile services.</p>
            </div>
          </Block>
        )
      case 'engagement':
        return (
          <Block {...common}>
            <p className="text-body rc-muted">{TITLES.engagement}</p>
            <ul className="rc-stats">
              {engagement.map((s) => (
                <li key={s.label}>
                  <span>
                    <span className="text-body">{s.label}</span>
                    <span className="rc-up text-label-2">
                      <TrendingUp size={14} strokeWidth={2} aria-hidden="true" /> {s.delta}
                    </span>
                  </span>
                  <strong>{s.value}</strong>
                </li>
              ))}
            </ul>
          </Block>
        )
      case 'grants':
        return (
          <Block {...common} wide heading={<h2 className="text-heading-2">{TITLES.grants}</h2>}>
            <p className="text-label-2 rc-muted">1,292 of 1,350 match hours delivered.</p>
            <ul className="rc-grants">
              {grantCommitments.map((g) => (
                <li key={g.funder}>
                  <span className="text-label-1">{g.funder}</span>
                  <span className="text-label-2 rc-muted">{g.detail}</span>
                  <span className="rc-progress" role="progressbar" aria-valuenow={g.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${g.funder} progress`}>
                    <span style={{ width: `${g.progress}%` }} />
                  </span>
                  <span className="text-label-2">{g.due}</span>
                </li>
              ))}
            </ul>
          </Block>
        )
      case 'firstTime': {
        const max = Math.max(...firstTimeAttendees.map((x) => x[1]))
        return (
          <Block {...common} wide heading={<h2 className="text-heading-2">{TITLES.firstTime}</h2>}>
            <ul className="rc-hbars">
              {firstTimeAttendees.map(([name, n]) => (
                <li key={name}>
                  <span className="text-label-2">{name}</span>
                  <span className="rc-hbars__track">
                    <span style={{ width: `${(n / max) * 100}%` }} />
                  </span>
                  <span className="text-label-1">{n}</span>
                </li>
              ))}
            </ul>
          </Block>
        )
      }
      case 'grantMetrics':
        return (
          <Block {...common} wide heading={<h2 className="text-heading-2">{TITLES.grantMetrics}</h2>}>
            <div className="report__table">
              <table>
                <thead>
                  <tr>
                    <th>Measure</th>
                    <th>YTD</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {grantMetrics.map((r) => (
                    <tr key={r[0]}>
                      <td className="is-strong">{r[0]}</td>
                      <td>{r[1]}</td>
                      <td>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>
        )
      default:
        return null
    }
  }

  return (
    <div className="reports">
      <header className="reports__top">
        <nav className="reports__crumbs text-subheading" aria-label="Breadcrumb">
          <Link to="/">Dashboard</Link>
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>{title}</span>
        </nav>
        <div className="reports__download-wrap">
          <button type="button" className="reports__download text-body" disabled={loading} onClick={() => setShowExport((x) => !x)} aria-expanded={showExport}>
            Export
          </button>
          {showExport && <ExportMenu onClose={closeExport} onExport={exportFile} />}
        </div>
      </header>

      <div className="reports__body">
        <aside className="reports__panel rc-panel">
          <div className="rc-panel__context">
            <p className="text-label-2 rc-eyebrow">Composer</p>
            <p className="text-label-1 rc-muted">
              {K.label} • {P.label}
            </p>
          </div>
          <p className="text-label-1">
            I can edit and adjust the information here from events, surveys, the volunteer roster and grant commitments for {P.label}. Ask for anything, or start here —
          </p>
          <div className="reports__options">
            {SUGGESTIONS.map((s) => (
              <button key={s.id} type="button" className={`reports__option text-label-2 ${blocks.includes(s.id) ? 'is-on' : ''}`} onClick={() => ask(s.prompt)}>
                {s.prompt}
              </button>
            ))}
          </div>
          {asked.length > 0 && (
            <ul className="reports__notes text-label-2">
              {asked.map((q, i) => (
                <li key={i}>
                  <span className="rc-muted">You:</span> {q}
                  <br />
                  <span className="rc-muted">Added a section to the report ✓</span>
                </li>
              ))}
            </ul>
          )}
          <form
            className="report-prompt reports__chat"
            onSubmit={(e) => {
              e.preventDefault()
              if (prompt.trim()) ask(prompt.trim())
              setPrompt('')
            }}
          >
            <input className="text-label-2" placeholder="Type what you want to see here..." value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Ask the composer" />
            <button type="submit" aria-label="Send" disabled={!prompt.trim()}>
              <ArrowUp size={16} strokeWidth={2} />
            </button>
          </form>
        </aside>

        <main className="reports__canvas">
          <article className="rc-doc">
            <header className="rc-doc__head">
              <p className="text-label-2 rc-eyebrow">{K.eyebrow}</p>
              <h1>{title}</h1>
              <p className="text-label-2 rc-muted">{P.range} ·</p>
            </header>
            {loading ? (
              <div className="rc-grid" aria-busy="true" aria-label="Generating report">
                <div className="rc-skel rc-block--wide" style={{ height: 284 }} />
                <div className="rc-skel" style={{ height: 258 }} />
                <div className="rc-skel" style={{ height: 258 }} />
              </div>
            ) : blocks.length ? (
              <div className="rc-grid">
                {blocks.map((id) => (
                  <Fragment key={id}>{render(id)}</Fragment>
                ))}
              </div>
            ) : (
              <p className="rc-empty text-body">
                This document is empty. Pick a starting point on the left or describe what you want to see.
              </p>
            )}
          </article>
        </main>
      </div>
    </div>
  )
}
