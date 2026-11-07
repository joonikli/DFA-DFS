// Figma: Components › AI summary (node 1133:19652): Default (collapsed) | Expanded - Survey
// Used on Survey responses (collapsed 2324:46004 → expanded 2324:46080).
import { useState } from 'react'
import { Bookmark, ChevronDown, Download, Info, Sparkles, Star, Shapes } from 'lucide-react'
import { LineTrend } from '../Charts/Charts.jsx'
import './AISummary.css'

function Insight({ icon: Icon, title, items, sources }) {
  return (
    <div className="ai-card">
      <p className="ai-card__title text-label-1">
        <Icon size={16} strokeWidth={1.75} aria-hidden="true" /> {title}
        <Info size={13} strokeWidth={1.75} className="ai-muted" aria-label="Generated from survey free-text answers" />
      </p>
      <ol className="ai-list">
        {items.map((it) => (
          <li key={it}>
            <p className="text-label-2">{it}</p>
            <span className="ai-sources">
              {sources.map((s) => (
                <span key={s} className="ai-source">
                  <Bookmark size={10} strokeWidth={2} aria-hidden="true" /> {s}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function AISummary({ summary, defaultOpen = false, onDownload }) {
  const [open, setOpen] = useState(defaultOpen)
  const s = summary
  return (
    <section className={`ai-summary ${open ? 'ai-summary--open' : ''}`} aria-label="AI summary">
      <div className="ai-summary__head">
        <p className="ai-summary__label text-label-2">
          <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
          <strong>AI summary</strong>
          <span className="ai-dot" aria-hidden="true" />
          <span className="ai-muted">{s.period}</span>
        </p>
        <div className="ai-summary__actions">
          <button type="button" className="ai-icon-btn ai-icon-btn--boxed" onClick={onDownload} aria-label="Download summary">
            <Download size={18} strokeWidth={1.75} />
          </button>
          <button type="button" className="ai-icon-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Collapse summary' : 'Expand summary'}>
            <ChevronDown size={20} strokeWidth={2} className={open ? 'ai-flip' : ''} />
          </button>
        </div>
      </div>
      <p className="ai-summary__text text-label-2">{s.text}</p>

      {open && (
        <div className="ai-summary__body">
          <div className="ai-grid ai-grid--top">
            <div className="ai-card ai-stats">
              <div>
                <p className="ai-card__title text-label-1">
                  Average survey score <Info size={13} strokeWidth={1.75} className="ai-muted" aria-hidden="true" />
                </p>
                <p className="ai-big">
                  {s.averageScore}
                  <span className="ai-muted"> /10</span>
                </p>
                <p className="ai-up text-label-2">{s.averageDelta}</p>
              </div>
              <hr />
              <div>
                <p className="text-label-2">Positive association in responses</p>
                <p className="ai-pair">
                  <span className="ai-big">{s.positive.value}%</span>
                  <span className="ai-up text-label-2">{s.positive.delta}</span>
                </p>
              </div>
              <div>
                <p className="text-label-2">Negative association in responses</p>
                <p className="ai-pair">
                  <span className="ai-big">{s.negative.value}%</span>
                  <span className="ai-down text-label-2">{s.negative.delta}</span>
                </p>
              </div>
            </div>
            <div className="ai-card">
              <p className="ai-card__title text-label-1">
                Survey response rate over time <Info size={13} strokeWidth={1.75} className="ai-muted" aria-hidden="true" />
              </p>
              <p className="ai-up text-label-2">↗ {s.responseRateDelta}</p>
              <LineTrend data={s.responseRate} xKey="month" yKey="value" unit="% responded" height={200} yDomain={[0, 100]} yTicks={[0, 25, 50, 75, 100]} />
            </div>
          </div>
          <div className="ai-grid">
            <Insight icon={Star} title="Suggestions" items={s.suggestions} sources={s.sources} />
            <Insight icon={Shapes} title="Strengths" items={s.strengths} sources={s.sources} />
          </div>
        </div>
      )}
    </section>
  )
}
