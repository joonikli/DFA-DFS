import { Construction } from 'lucide-react'
import { PageHeader } from '../layout/AppShell.jsx'

const FIGMA_FILE = 'https://www.figma.com/design/jIXKjfx96sNdtcKZgMBeI6/Dress-for-Success-Redesign'

/**
 * Stand-in for screens that aren't built yet.
 * @param {string} [figmaNode] e.g. "1957:26455" — links to the frame to build from
 */
export default function Placeholder({ title, note, figmaNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1380 }}>
      <PageHeader title={title} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '64px 24px',
          border: '2px dashed var(--neutral-gray)',
          borderRadius: 'var(--radius-card)',
          textAlign: 'center',
          color: 'var(--neutral-darker-gray)',
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: 10,
            borderRadius: 12,
            background: 'var(--yellow-light-yellow)',
            color: 'var(--yellow-dark-yellow)',
          }}
        >
          <Construction size={32} strokeWidth={1.75} />
        </div>
        <p className="text-subheading" style={{ color: 'var(--neutral-black)' }}>
          Placeholder — {title}
        </p>
        {note && <p className="text-body" style={{ maxWidth: 460 }}>{note}</p>}
        {figmaNode && (
          <a
            className="text-label-2"
            style={{ color: 'var(--primary-darkest-purple)' }}
            href={`${FIGMA_FILE}?node-id=${figmaNode.replace(':', '-')}`}
            target="_blank"
            rel="noreferrer"
          >
            Open the Figma frame ({figmaNode}) ↗
          </a>
        )}
      </div>
    </div>
  )
}
