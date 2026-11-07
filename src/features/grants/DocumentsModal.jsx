// Figma: Final › Grants › Grant Home (documents popup, 2324:49849)
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, CircleCheck, FileText, Sparkles, Upload } from 'lucide-react'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import { GRANT_STATUS, OPTIONAL_DOCS, REQUIRED_DOCS } from '../../mock/grants.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { money, shortDate } from './useGrants.js'
import './Grants.css'

function DocRow({ doc, files, required, onUpload }) {
  const input = useRef(null)
  const done = files?.length > 0
  return (
    <li className="doc-row">
      <span className={`doc-row__check ${done ? 'is-done' : ''}`} aria-label={done ? 'Uploaded' : 'Not uploaded'}>
        {done && <CircleCheck size={20} strokeWidth={2} />}
      </span>
      <div className="doc-row__body">
        <p className="text-label-1">
          {doc.name}
          {required && <span className="field-label__req">*</span>}
        </p>
        {doc.hint && <p className="text-label-2 doc-row__hint">{doc.hint}</p>}
        <div className="doc-row__files">
          {done ? (
            files.map((f, i) => (
              <span key={`${f}-${i}`} className="doc-file">
                <CircleCheck size={16} strokeWidth={2} className="doc-file__ok" aria-hidden="true" />
                <span className="doc-file__name">
                  <FileText size={12} strokeWidth={2} aria-hidden="true" /> {f}
                </span>
              </span>
            ))
          ) : (
            <span className="doc-file doc-file--empty">
              <span className="doc-file__ring" aria-hidden="true" />
              <span className="doc-file__name">
                <FileText size={12} strokeWidth={2} aria-hidden="true" /> Document
              </span>
            </span>
          )}
        </div>
      </div>
      <button type="button" className="doc-row__upload text-label-2" onClick={() => input.current?.click()}>
        Upload <Upload size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <input
        ref={input}
        type="file"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onUpload(f.name)
          e.target.value = ''
        }}
      />
    </li>
  )
}

export default function DocumentsModal({ grant, onClose }) {
  const navigate = useNavigate()
  const { grantUpload, showToast } = useDemo()
  const st = GRANT_STATUS[grant.status]
  const upload = (docId) => (name) => {
    grantUpload(grant.id, docId, name)
    showToast({ variant: 'success', parts: [['Uploaded', true]], preview: `${name} added to ${grant.title}`, time: 'Now', category: 'Event' })
  }
  const ready = Object.values(grant.uploaded).flat().length

  return (
    <Modal open onClose={onClose} width={1040} padding="32px 32px 28px">
      <div className="docs">
        <div className="docs__head">
          <div>
            <Tags color={st.color}>{st.label}</Tags>
            <h2 className="docs__title">
              {grant.title} <span className="docs__dot" aria-hidden="true" /> {money(grant.amount)}
            </h2>
            <p className="text-label-2 docs__meta">
              Duration <strong>{grant.durationMonths} months</strong>
              <span>
                Due date <strong>{shortDate(grant.due)}</strong>
              </span>
            </p>
          </div>
          <div className="docs__head-actions">
            <Button color="tertiary" size="sm" onClick={() => showToast({ variant: 'default', parts: [[`${ready} documents ready`, true]], preview: 'Opening the document bundle (mock)', time: 'Now', category: 'Event' })}>
              View all ready documents
            </Button>
            <Button size="sm" onClick={() => showToast({ variant: 'default', parts: [['Application portal', true]], preview: 'This would open the funder’s portal in a new tab.', time: 'Now', category: 'Event' })}>
              View application portal <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="docs__section-head">
          <h3 className="text-heading-2">Documents</h3>
          <button type="button" className="docs__generate text-body" onClick={() => navigate(`/grants/reports?grant=${grant.id}`)}>
            <Sparkles size={16} strokeWidth={1.75} aria-hidden="true" /> Generate reports
          </button>
        </div>
        <p className="text-label-1">
          Fields marked <span className="field-label__req">*</span> are required
        </p>

        <div className="docs__cols">
          <ul className="docs__list">
            {REQUIRED_DOCS.map((d) => (
              <DocRow key={d.id} doc={d} required files={grant.uploaded[d.id]} onUpload={upload(d.id)} />
            ))}
          </ul>
          <ul className="docs__list">
            {OPTIONAL_DOCS.map((d) => (
              <DocRow key={d.id} doc={d} files={grant.uploaded[d.id]} onUpload={upload(d.id)} />
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
