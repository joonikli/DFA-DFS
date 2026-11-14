// Figma: Components › Snapshot (node 1835:25230) — "Your activity this month" mini bar chart.
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Snapshot.css'

const PLOT_HEIGHT = 108 // tallest bar in Figma (plot area is 116)

/**
 * @param {{label: string, value: number}[]} data
 * @param {string} yLabel / xLabel  axis captions ("HOURS" / "DAY")
 */
export default function Snapshot({ title, data, yLabel = 'Hours', xLabel = 'Day', onPrev, onNext, linkTo, linkLabel }) {
  const max = Math.max(...data.map((d) => d.value), 0)
  const top = Math.max(3, Math.ceil(max / 3) * 3) // y-axis top, divisible into 3 steps
  const ticks = [top, (top * 2) / 3, top / 3, 0]

  return (
    <div className="snapshot">
      <div className="snapshot__head">
        <button type="button" className="snapshot__nav" onClick={onPrev} aria-label="Previous month">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <p className="text-subheading">{title}</p>
        <button type="button" className="snapshot__nav" onClick={onNext} aria-label="Next month">
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>

      <div className="snapshot__chart" role="img" aria-label={`${title}: ${data.map((d) => `${d.label}: ${d.value} ${yLabel.toLowerCase()}`).join(', ')}`}>
        <div className="snapshot__y">
          <span className="snapshot__axis-label">{yLabel}</span>
          <div className="snapshot__ticks text-label-2">
            {ticks.map((t) => (
              <span key={t}>{Number.isInteger(t) ? t : t.toFixed(1)}</span>
            ))}
          </div>
        </div>
        <div className="snapshot__plot-wrap">
          <div className="snapshot__plot">
            {data.map((d) => (
              <div key={d.label} className="snapshot__bar-slot">
                <div
                  className="snapshot__bar"
                  style={{ height: `${(d.value / top) * PLOT_HEIGHT}px` }}
                  title={`${d.value} ${yLabel.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
          <div className="snapshot__x text-label-2">
            {data.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
          <span className="snapshot__axis-label snapshot__axis-label--x">{xLabel}</span>
        </div>
      </div>

      {linkTo && (
        <Link to={linkTo} className="snapshot__link text-label-2">
          {linkLabel}
          <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
