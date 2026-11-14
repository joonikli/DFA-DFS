// Figma: Final › Report creation (2324:48937) — "Generate report" popover on the admin dashboard.
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDismiss } from '../../lib/useDismiss.js'
import { PERIODS, REPORT_KINDS } from './reportData.js'
import './ReportComposer.css'

export default function GenerateReportButton() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState('q4')
  const [kind, setKind] = useState('funder')
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  return (
    <div className="gen-report" ref={ref}>
      <button type="button" className="gen-report__trigger text-body" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Generate report
      </button>
      {open && (
        <div className="gen-report__pop" role="dialog" aria-label="Generate report">
          <p className="gen-report__label text-label-1">Reporting period</p>
          <div className="gen-report__periods" role="radiogroup" aria-label="Reporting period">
            {Object.entries(PERIODS).map(([k, p]) => (
              <button key={k} type="button" role="radio" aria-checked={period === k} className={`text-body ${period === k ? 'is-on' : ''}`} onClick={() => setPeriod(k)}>
                {p.short}
              </button>
            ))}
          </div>
          <p className="gen-report__label text-label-1">Start from</p>
          <div className="gen-report__kinds" role="radiogroup" aria-label="Start from">
            {Object.entries(REPORT_KINDS).map(([k, r]) => (
              <button key={k} type="button" role="radio" aria-checked={kind === k} className={`gen-report__kind ${kind === k ? 'is-on' : ''}`} onClick={() => setKind(k)}>
                <span className="gen-report__box" aria-hidden="true" />
                <span>
                  <span className="text-body-2">{r.label}</span>
                  <span className="text-body gen-report__desc">{r.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="gen-report__go text-body" onClick={() => navigate(`/reports/new?kind=${kind}&period=${period}`)}>
            Open composer
          </button>
        </div>
      )}
    </div>
  )
}
