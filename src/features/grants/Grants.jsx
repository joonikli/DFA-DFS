// Admin / Grants — Your grants table (Figma 2324:49813), View documents dialog (2324:49849) and
// Explore opportunities (2324:50597). Reuses the Events page frame, tabs, dialog shell and fonts.
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../components/Icon.jsx';
import { hideTip, useFitZoom, usePop, usePopClose, useToast } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { AccountMenu, Notifications } from '../dashboard/Popovers.jsx';
import { openConversation } from '../../lib/bridge.js';
import { navigate, useRoute } from '../../lib/router.js';
import { EventTabs } from '../events/Events.jsx';
import { EventDialog } from '../events/EventEditor.jsx';
import EventAsset from '../events/EventAsset.jsx';
import { FILTERS, FILTER_GROUPS, OPPORTUNITIES, OPTIONAL_DOCS, REQUIRED_DOCS, STATUSES, day, money } from './grantData.js';
import { useGrantState } from './grantState.js';
import { VOLS } from '../../data.js';
import '../events/events.css';
import '../surveys/surveys.css';
import './grantsPage.css';

const GA = ({ name, className = '' }) => <img className={`ae-asset ${className}`} src={`/assets/grants/${name}.svg`} alt="" aria-hidden="true" />;
const TABS = ['Your grants', 'Explore'];
const SORTS = { Default: null, 'Due date': { key: 'due', dir: 1 }, Amount: { key: 'amount', dir: -1 } };
// Truncated titles get the shared data-tip tooltip (shown above); full-length ones don't need one
const tipIfCut = (e) => { const el = e.currentTarget; if (el.scrollWidth > el.clientWidth) el.dataset.tip = el.textContent; else delete el.dataset.tip; };
const COLUMNS = [['title', 'Grant title'], ['contributors', 'Contributor'], ['applied', 'Date applied'], ['due', 'Due date'], ['status', 'Status'], ['amount', 'Amount']];
// Explore opportunities share the sort but have no contributors: they compare equal and keep their order
const sortValue = (g, key) => key === 'contributors' ? (g.contributors ? VOLS[g.contributors[0]]?.name || 'Bridget' : '') :key === 'applied' ? (g.applied || '9999') : g[key];

function SortMenu({ value, onChange }) {
  const close = usePopClose();
  return <div className="menu" role="menu" aria-label="Sort grants" style={{ width: 200 }}>
    {Object.keys(SORTS).map((label) => <button key={label} role="menuitemradio" aria-checked={value === label} className={`menu-item ${value === label ? 'on' : ''}`} onClick={() => { onChange(label); close(); }}>{label}</button>)}
  </div>;
}

function StatusTag({ status }) { return <span className={`gr-tag ${STATUSES[status]}`}>{status}</span>; }

function GrantTable({ grants, sort, onSort, onDocuments }) {
  const [filter, setFilter] = useState(0), [page, setPage] = useState(1), [perPage, setPerPage] = useState(10);
  const count = (i) => FILTERS[i][1] ? grants.filter((g) => FILTERS[i][1].includes(g.status)).length : grants.length;
  const rows = FILTERS[filter][1] ? grants.filter((g) => FILTERS[filter][1].includes(g.status)) : grants;
  const pages = Math.max(1, Math.ceil(rows.length / perPage)), current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * perPage, current * perPage);
  useEffect(() => { setPage(1); }, [filter, perPage, grants.length]);
  return <>
    <div className="gr-chips" role="group" aria-label="Filter by status">
      {FILTER_GROUPS.map((group, gi) => <span className="gr-chip-group" key={gi}>{group.map((i) => <button key={i} aria-pressed={filter === i} className={filter === i ? 'on' : ''} onClick={() => setFilter(i)}>{FILTERS[i][0]} ({count(i)})</button>)}</span>)}
    </div>
    <div className="gr-table" role="table" aria-label="Your grants" aria-rowcount={rows.length + 1}>
      <div className="gr-row gr-head" role="row">
        {COLUMNS.map(([key, label]) => <span role="columnheader" key={key} aria-sort={sort?.key === key ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}>
          <button className={sort?.key === key ? 'on' : ''} onClick={() => onSort(key)}>{label}<GA name="sort-col" className={sort?.key === key ? (sort.dir > 0 ? 'asc' : 'desc') : ''} /></button>
        </span>)}
        <span role="columnheader">Attachments</span>
      </div>
      {shown.map((g) => <div className="gr-row" role="row" key={g.id}>
        <span role="cell" className="gr-title" onPointerOver={tipIfCut}>{g.title}</span>
        <span role="cell" className="gr-avatars" aria-label={g.contributors.map((id) => VOLS[id]?.name || 'Bridget Okafor').join(', ')}>{g.contributors.map((id, i) => <span key={i} data-tip={VOLS[id]?.name || 'Bridget Okafor (you)'}><Avatar id={id} /></span>)}</span>
        <span role="cell" className={g.applied ? '' : 'gr-pending'}>{g.applied ? day(g.applied) : 'Pending'}</span>
        <span role="cell">{day(g.due)}</span>
        <span role="cell"><StatusTag status={g.status} /></span>
        <span role="cell">{money(g.amount)}</span>
        <span role="cell"><button className="gr-docs-link" onClick={() => onDocuments(g.id)}><GA name="file" />View documents</button></span>
      </div>)}
      {!shown.length && <div className="gr-empty" role="row"><span role="cell">No grants match your search</span></div>}
    </div>
    <div className="gr-pager">
      <div className="gr-pager-size"><label htmlFor="gr-per-page">Rows per page</label><span className="gr-select"><select id="gr-per-page" value={perPage} onChange={(e) => setPerPage(+e.target.value)}>{[5, 10, 20].map((n) => <option key={n}>{n}</option>)}</select><GA name="rows-chevron" /></span><span>{rows.length ? `${(current - 1) * perPage + 1}-${Math.min(current * perPage, rows.length)} of ${rows.length} rows` : '0 rows'}</span></div>
      <nav className="gr-pages" aria-label="Pagination">
        <button aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)}><GA name="page-prev" /></button>
        {Array.from({ length: pages }, (_, i) => <button key={i} aria-current={current === i + 1 ? 'page' : undefined} className={current === i + 1 ? 'on' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
        <button aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)}><GA name="page-next" /></button>
      </nav>
    </div>
  </>;
}

function Opportunity({ op, applied, onApply, onDetails }) {
  return <article className="gr-op" aria-label={op.title}>
    <div className="gr-op-main">
      <h2>{op.title}</h2><p className="gr-op-funder">{op.funder}</p>
      <p className="gr-op-text">{op.text}</p>
      <div className="gr-op-foot">
        <div className="gr-op-tags">{op.tags.map((t) => <span key={t} className={`gr-tag ${op.color}`}>{t}</span>)}</div>
        <div className="gr-op-actions"><button className="btn gr-outline" onClick={onDetails}>View details</button><button className="btn btn-dark" disabled={applied} onClick={onApply}>{applied ? 'Applied' : 'Apply'}</button></div>
      </div>
    </div>
    <div className="gr-op-side"><strong>{money(op.amount)}</strong><dl><div><dt>Due on</dt><dd>{day(op.due)}</dd></div><div><dt>Duration</dt><dd>{op.duration}</dd></div></dl></div>
  </article>;
}

function DocItem({ doc, files, required, onUpload }) {
  const input = useRef(null), done = files.length > 0;
  return <li className="gr-doc">
    <GA name={done ? 'doc-done' : 'doc-todo'} className="gr-doc-state" />
    <span className="sr">{done ? 'Uploaded' : 'Not uploaded'}</span>
    <div className="gr-doc-body">
      <p className="gr-doc-title">{doc.title}{required && <b aria-label="required"> *</b>}</p>
      {doc.note && <p className="gr-doc-note">{doc.note}</p>}
      <div className="gr-doc-files">{done ? files.map((f) => <span className="gr-file" key={f}><GA name="badge-check" /><span className="gr-file-chip"><GA name="sticky-note" />{f}</span></span>)
        : <span className="gr-file empty"><GA name="badge" /><span className="gr-file-chip"><GA name="sticky-note" />Document</span></span>}</div>
    </div>
    <input ref={input} type="file" multiple hidden onChange={(e) => { const names = [...e.target.files].map((f) => f.name); if (names.length) onUpload(names); e.target.value = ''; }} />
    <button className="btn gr-outline gr-upload" aria-label={`Upload ${doc.title}`} onClick={() => input.current.click()}>Upload<GA name="upload" /></button>
  </li>;
}

function DocumentsDialog({ grantId, onSwitch, onClosed }) {
  const toast = useToast(), notBuilt = useNotBuilt();
  const [grants, setGrants] = useGrantState('grants');
  const [readyOnly, setReadyOnly] = useState(false), [menu, setMenu] = useState(false);
  const g = grants.find((x) => x.id === grantId);
  const upload = (docId, names) => {
    setGrants((all) => all.map((x) => x.id === grantId ? { ...x, files: { ...x.files, [docId]: [...x.files[docId], ...names] } } : x));
    toast(`${names.length === 1 ? names[0] : `${names.length} files`} uploaded`, { ic: 'check' });
  };
  const keep = (doc) => !readyOnly || g.files[doc.id].length > 0;
  const list = (docs, required) => docs.filter(keep).map((doc) => <DocItem key={doc.id} doc={doc} required={required} files={g.files[doc.id]} onUpload={(names) => upload(doc.id, names)} />);
  return <EventDialog label={`${g.title} documents`} className="gr-docs-dialog" onClosed={onClosed}>{(close) => <div className="gr-docs">
    <button className="icon-btn plain gr-docs-close" aria-label="Close documents" onClick={() => close()}><EventAsset name="form-x" /></button>
    <header className="gr-docs-head">
      <div>
        <StatusTag status={g.status} />
        <div className="gr-docs-title" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setMenu(false); }} onKeyDown={(e) => { if (e.key === 'Escape' && menu) { e.preventDefault(); e.stopPropagation(); setMenu(false); } }}>
          <h2>{g.title}</h2><GA name="title-dot" /><span className="gr-docs-amount">{money(g.amount)}</span>
          <button className="gr-docs-switch" aria-haspopup="listbox" aria-expanded={menu} aria-label="Switch grant" onClick={() => setMenu((m) => !m)}><EventAsset name="detail-description-chevron" /></button>
          {menu && <div className="sv-menu gr-docs-menu" role="listbox" aria-label="Grants">{grants.map((x) => <button key={x.id} role="option" aria-selected={x.id === grantId} className={x.id === grantId ? 'on' : ''} onClick={() => { setMenu(false); setReadyOnly(false); onSwitch(x.id); }}>{x.title}</button>)}</div>}
        </div>
        <p className="gr-docs-meta"><span>Duration <b>{g.duration}</b></span><span>Due date <b>{day(g.due, 'long')}</b></span></p>
      </div>
      <div className="gr-docs-actions">
        <button className="btn gr-soft" aria-pressed={readyOnly} onClick={() => setReadyOnly((r) => !r)}>{readyOnly ? 'Show all documents' : 'View all ready documents'}</button>
        <button className="btn btn-dark" onClick={() => notBuilt('The funder’s application portal')}>View application portal<GA name="arrow-up-right" /></button>
      </div>
    </header>
    <section className="gr-docs-section" aria-label="Documents">
      <div className="gr-docs-section-head"><h3>Documents</h3><button className="btn gr-outline" onClick={() => { close(true); navigate(`grant-report?grant=${grantId}`); }}><GA name="sparkles" />Generate reports</button></div>
      <p className="gr-docs-required">Fields marked <b>*</b> are required</p>
      <div className="gr-docs-cols">
        <ul aria-label="Required documents">{list(REQUIRED_DOCS, true)}</ul>
        <ul aria-label="Optional documents">{list(OPTIONAL_DOCS.map((d) => ({ ...d, note: '' })), false)}</ul>
      </div>
      {readyOnly && !Object.values(g.files).some((f) => f.length) && <p className="gr-docs-none">No documents are ready yet.</p>}
    </section>
  </div>}</EventDialog>;
}

export default function Grants() {
  const pop = usePop(), notBuilt = useNotBuilt(), toast = useToast();
  const page = useRef(null);
  useFitZoom(page, { designWidth: 1488, minWidth: 1000, fit: false });
  const [grants, setGrants] = useGrantState('grants'), [applied, setApplied] = useGrantState('applied');
  const [tab, setTab] = useState('Your grants'), [query, setQuery] = useState(''), [sort, setSort] = useState(null), [docs, setDocs] = useState(null), [unread, setUnread] = useState(true);
  const popRef = useRef(pop); popRef.current = pop;
  useEffect(() => () => { popRef.current.close(null, true); hideTip(); }, []);
  // #grants?docs=<id> reopens a grant's documents (e.g. the report page's "Documents" breadcrumb)
  const { params } = useRoute(), docsParam = params.get('docs');
  useEffect(() => { if (docsParam && grants.some((g) => g.id === docsParam)) setDocs(docsParam); }, [docsParam]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = query.trim().toLowerCase();
  const sortBy = (list) => sort ? [...list].sort((a, b) => { const x = sortValue(a, sort.key), y = sortValue(b, sort.key); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; }) : list;
  const myGrants = sortBy(grants.filter((g) => `${g.title} ${g.status} ${g.contributors.map((id) => VOLS[id]?.name).join(' ')}`.toLowerCase().includes(q)));
  const ops = sortBy(OPPORTUNITIES.filter((o) => `${o.title} ${o.funder} ${o.text} ${o.tags.join(' ')}`.toLowerCase().includes(q)));
  const sortLabel = Object.entries(SORTS).find(([, s]) => s && sort && s.key === sort.key && s.dir === sort.dir)?.[0] || (sort ? COLUMNS.find(([k]) => k === sort.key)[1] : 'Default');
  const headerSort = (key) => setSort((s) => s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 });
  const apply = (op) => {
    setGrants((all) => [{ id: `grant-${op.id}`, title: op.title, contributors: ['me'], applied: null, due: op.due, status: 'In progress', amount: op.amount, duration: op.duration, files: Object.fromEntries([...REQUIRED_DOCS, ...OPTIONAL_DOCS].map((d) => [d.id, []])) }, ...all]);
    setApplied((s) => new Set(s).add(op.id));
    toast(`${op.title} added to Your grants`, { ic: 'check', action: 'View', onAction: () => setTab('Your grants') });
  };
  const notifications = (e) => pop.toggle(e.currentTarget, <Notifications onReadAll={() => setUnread(false)} onOpen={(key) => { setUnread(false); if (key === 'sophia') openConversation('c2'); }} />, { align: 'end' });

  return <div className="ae-page gr-page" ref={page}>
    <div className="top-nav ae-top-nav"><button className="tn-bell" aria-label="Notifications" onClick={notifications}><EventAsset name="list-group101" />{unread && <i className="tn-dot" />}</button><span className="tn-sep" /><button className="tn-me" aria-label="Account" onClick={(e) => pop.toggle(e.currentTarget, <AccountMenu onSettings={() => notBuilt('Settings')} />, { align: 'end' })}><img className="ae-avatar" src="/assets/events/list-ellipse47.png" alt="" /></button></div>
    <div className="gr-workspace">
      <header className="ae-heading gr-heading"><h1>Manage grants</h1></header>
      <EventTabs value={tab} onChange={(t) => { setTab(t); hideTip(); }} items={TABS} label="Grants" panelId="grants-panel" className="gr-tabs" />
      <div className="gr-toolbar">
        <label className="search ae-search as-search gr-search"><EventAsset name="list-vector" /><input aria-label={tab === 'Explore' ? 'Search grant opportunities' : 'Search your grants'} placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} /><button type="button" className="gr-funnel" aria-label="Filters" data-tip="Filters" onClick={() => notBuilt('Advanced filters')}><GA name="funnel" /></button></label>
        <div className="gr-toolbar-actions">
          <button className="as-sort" aria-haspopup="menu" onClick={(e) => pop.toggle(e.currentTarget, <SortMenu value={sortLabel} onChange={(label) => setSort(SORTS[label])} />, { align: 'end' })}>Sort by: {sortLabel}<img className="ae-asset" src="/assets/surveys/sort-chevron.svg" alt="" aria-hidden="true" /></button>
          <button className="btn btn-dark ae-create as-create" onClick={() => notBuilt('Create application')}>Create application<EventAsset name="list-plus" /></button>
        </div>
      </div>
      <section id="grants-panel" role="tabpanel" aria-label={tab} className="gr-panel" key={tab}>
        {tab === 'Your grants' ? <GrantTable grants={myGrants} sort={sort} onSort={headerSort} onDocuments={setDocs} />
          : <div className="gr-ops">{ops.map((op) => <Opportunity key={op.id} op={op} applied={applied.has(op.id)} onApply={() => apply(op)} onDetails={() => notBuilt('Grant details')} />)}{!ops.length && <p className="gr-empty">No opportunities match your search</p>}</div>}
      </section>
    </div>
    {docs && <DocumentsDialog grantId={docs} onSwitch={setDocs} onClosed={() => { setDocs(null); if (docsParam) navigate('grants'); }} />}
  </div>;
}
