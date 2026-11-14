// Figma: Final › Grants — Grant Home (2324:49813), documents popup (2324:49849), Grant recommended / Explore (2324:50597)
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Filter as FilterIcon } from 'lucide-react'
import TabNav from '../../components/TabNav/TabNav.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import Button from '../../components/Button/Button.jsx'
import Tags from '../../components/Tags/Tags.jsx'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import DataTable from '../../components/DataTable/DataTable.jsx'
import { SelectField } from '../../components/Field/Field.jsx'
import DocumentsModal from '../../features/grants/DocumentsModal.jsx'
import { money, shortDate, useGrants } from '../../features/grants/useGrants.js'
import { GRANT_STATUS, STATUS_FILTERS, opportunities } from '../../mock/grants.js'
import { PERSONAS, useDemo } from '../../store/DemoStore.jsx'
import '../../features/grants/Grants.css'

const TABS = [
  { value: 'yours', label: 'Your grants' },
  { value: 'explore', label: 'Explore' },
]

function AvatarStack({ names }) {
  return (
    <span className="avatar-stack" title={names.join(', ')}>
      {names.map((n, i) => (
        <Avatar key={n + i} name={n} size={30} tone={i % 2 ? 'purple' : 'gray'} />
      ))}
    </span>
  )
}

/** Figma: Components › Grant module (node 2189:36963) */
function GrantModule({ o, applied, onDetails, onApply }) {
  return (
    <article className="grant-module">
      <div className="grant-module__main">
        <h3 className="text-heading-2">{o.title}</h3>
        <p className="text-label-2 grant-module__funder">{o.funder}</p>
        <p className="text-label-2 grant-module__desc">{o.description}</p>
        <div className="grant-module__foot">
          <div className="grant-module__tags">
            {o.tags.map(([l, c]) => (
              <Tags key={l} color={c}>
                {l}
              </Tags>
            ))}
          </div>
          <div className="grant-module__btns">
            <Button color="secondary" size="sm" onClick={onDetails}>
              View details
            </Button>
            <Button size="sm" onClick={onApply} disabled={applied}>
              {applied ? 'Applied' : 'Apply'}
            </Button>
          </div>
        </div>
      </div>
      <div className="grant-module__side">
        <p className="grant-module__amount">{money(o.amount)}</p>
        <p className="text-label-2">
          Due on <strong>{shortDate(o.due)}</strong>
        </p>
        <p className="text-label-2">
          Duration <strong>{o.durationMonths} months</strong>
        </p>
      </div>
    </article>
  )
}

export default function Grants() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'explore' ? 'explore' : 'yours'
  const { grantCreate, showToast, admin } = useDemo()
  const all = useGrants()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('default')
  const [openGrant, setOpenGrant] = useState(null)
  const [details, setDetails] = useState(null)

  const counts = useMemo(() => {
    const c = { all: all.length }
    for (const g of all) c[g.status] = (c[g.status] ?? 0) + 1
    return c
  }, [all])

  const rows = useMemo(() => {
    const q = query.toLowerCase()
    let list = all.filter((g) => (status === 'all' || g.status === status) && (!q || g.title.toLowerCase().includes(q)))
    if (sort === 'due') list = [...list].sort((a, b) => a.due - b.due)
    if (sort === 'amount') list = [...list].sort((a, b) => b.amount - a.amount)
    return list
  }, [all, query, status, sort])

  const explore = opportunities.filter((o) => !query || `${o.title} ${o.funder}`.toLowerCase().includes(query.toLowerCase()))
  const appliedIds = new Set(admin.createdGrants.map((g) => g.fromOpportunity))

  function startApplication(o) {
    const g = {
      id: `g-new-${Date.now().toString(36)}`,
      title: o?.title ?? 'New grant application',
      amount: o?.amount ?? 10000,
      status: 'to_submit',
      applied: null,
      due: o?.due ?? new Date(2026, 11, 31),
      durationMonths: o?.durationMonths ?? 12,
      contributors: [PERSONAS.admin.fullName],
      uploaded: {},
      fromOpportunity: o?.id,
    }
    grantCreate(g)
    showToast({ variant: 'success', parts: [['Application started', true]], preview: `${g.title} was added to Your grants as “To submit”.`, time: 'Now', category: 'Event' })
    setParams({})
    setOpenGrant(g)
  }

  const columns = [
    { key: 'title', label: 'Grant title', width: '22%', render: (g) => <span className="grants__title text-body-2">{g.title}</span> },
    { key: 'contributors', label: 'Contributor', sortable: false, render: (g) => <AvatarStack names={g.contributors} /> },
    { key: 'applied', label: 'Date applied', sortValue: (g) => g.applied?.getTime() ?? 0, render: (g) => (g.applied ? shortDate(g.applied) : 'Pending') },
    { key: 'due', label: 'Due date', sortValue: (g) => g.due.getTime(), render: (g) => shortDate(g.due) },
    {
      key: 'status',
      label: 'Status',
      sortValue: (g) => GRANT_STATUS[g.status].label,
      render: (g) => (
        <span className={`grant-status grant-status--${GRANT_STATUS[g.status].color} text-label-2`}>{GRANT_STATUS[g.status].label}</span>
      ),
    },
    { key: 'amount', label: 'Amount', render: (g) => money(g.amount) },
    {
      key: 'attachments',
      label: 'Attachments',
      sortable: false,
      render: (g) => (
        <button
          type="button"
          className="grants__docs-link text-body"
          onClick={(e) => {
            e.stopPropagation()
            setOpenGrant(g)
          }}
        >
          <FileText size={20} strokeWidth={1.5} aria-hidden="true" /> View documents
        </button>
      ),
    },
  ]

  const liveGrant = openGrant && all.find((g) => g.id === openGrant.id)

  return (
    <div className="grants">
      <h1 className="text-heading-2 grants__heading">Manage grants</h1>
      <TabNav label="Grant views" tabs={TABS} value={tab} onChange={(v) => setParams(v === 'yours' ? {} : { tab: v })} />

      <div className="grants__toolbar">
        <div className="grants__search">
          <SearchBar value={query} onChange={setQuery} label={tab === 'yours' ? 'Search your grants' : 'Search opportunities'} />
          <FilterIcon size={18} strokeWidth={1.5} className="grants__search-filter" aria-hidden="true" />
        </div>
        <SelectField
          className="surveys__sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort grants"
          options={[
            { value: 'default', label: 'Sort by: Default' },
            { value: 'due', label: 'Sort by: Due date' },
            { value: 'amount', label: 'Sort by: Amount' },
          ]}
        />
        <Button size="sm" icon="plus" onClick={() => startApplication(null)}>
          Create application
        </Button>
      </div>

      {tab === 'yours' ? (
        <>
          <div className="grants__chips" role="tablist" aria-label="Filter by status">
            {STATUS_FILTERS.map((f, i) => (
              <span key={f.value} className="grants__chip-wrap">
                {(i === 1 || i === 4) && <span className="grants__chip-sep" aria-hidden="true" />}
                <button
                  type="button"
                  role="tab"
                  aria-selected={status === f.value}
                  className={`grants__chip text-body ${status === f.value ? 'is-on' : ''}`}
                  onClick={() => setStatus(f.value)}
                >
                  {f.label} ({counts[f.value] ?? 0})
                </button>
              </span>
            ))}
          </div>
          <DataTable columns={columns} rows={rows} onRowClick={setOpenGrant} empty="No grants match these filters" />
        </>
      ) : (
        <div className="grants__explore">
          {explore.map((o) => (
            <GrantModule key={o.id} o={o} applied={appliedIds.has(o.id)} onDetails={() => setDetails(o)} onApply={() => startApplication(o)} />
          ))}
        </div>
      )}

      {liveGrant && <DocumentsModal grant={liveGrant} onClose={() => setOpenGrant(null)} />}
      {details && (
        <Modal open onClose={() => setDetails(null)} width={640} title={details.title} subtitle={details.funder}>
          <div className="grant-details">
            <p className="text-body">{details.description}</p>
            <dl>
              <div>
                <dt className="text-label-2">Award</dt>
                <dd className="text-heading-2">{money(details.amount)}</dd>
              </div>
              <div>
                <dt className="text-label-2">Due</dt>
                <dd className="text-body-2">{shortDate(details.due)}</dd>
              </div>
              <div>
                <dt className="text-label-2">Duration</dt>
                <dd className="text-body-2">{details.durationMonths} months</dd>
              </div>
            </dl>
            <div className="grant-module__tags">
              {details.tags.map(([l, c]) => (
                <Tags key={l} color={c}>
                  {l}
                </Tags>
              ))}
            </div>
          </div>
          <div className="modal__footer">
            <Button color="secondary" onClick={() => setDetails(null)}>
              Close
            </Button>
            <Button
              disabled={appliedIds.has(details.id)}
              onClick={() => {
                const o = details
                setDetails(null)
                startApplication(o)
              }}
            >
              Apply
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
