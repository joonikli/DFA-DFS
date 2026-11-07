// "Format: PDF | Markdown file — Export" popover (Figma: Generate optional documents 2324:50057, Report creation 2324:49623)
import { useRef, useState } from 'react'
import { useDismiss } from '../../lib/useDismiss.js'

export default function ExportMenu({ onClose, onExport }) {
  const ref = useRef(null)
  useDismiss(ref, true, onClose)
  const [format, setFormat] = useState('pdf')
  return (
    <div className="download-pop" ref={ref} role="dialog" aria-label="Export">
      <p className="text-label-2 report-muted">Format</p>
      <div className="download-pop__seg" role="radiogroup">
        {[
          ['pdf', 'PDF'],
          ['md', 'Markdown file'],
        ].map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={format === v} className={format === v ? 'is-on' : ''} onClick={() => setFormat(v)}>
            {l}
          </button>
        ))}
      </div>
      <p className="text-label-2 report-muted">Letter • {format === 'pdf' ? '4 MB • 2 pages' : '12 KB • plain text'}</p>
      <button type="button" className="download-pop__go" onClick={() => onExport(format)}>
        Export {format === 'pdf' ? 'PDF' : 'Markdown'}
      </button>
    </div>
  )
}

/** Save `text` as a file in the browser. */
export function downloadText(text, filename, type = 'text/markdown') {
  const blob = new Blob([text], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
