// Figma: Components › Data table (node 1210:8959) + Page Nav (node 874:24633)
// Generic sortable table with "Rows per page" + page navigation footer.
import { useMemo, useState } from 'react'
import { ArrowDownUp, ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react'
import './DataTable.css'

/**
 * @param {{key: string, label: string, render?: (row) => ReactNode, sortValue?: (row) => any, width?: string}[]} columns
 * @param {object[]} rows
 * @param {(row) => void} [onRowClick]
 */
export default function DataTable({ columns, rows, onRowClick, rowKey = 'id', empty = 'No rows' }) {
  const [sort, setSort] = useState(null) // { key, dir }
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    const val = col.sortValue ?? ((r) => r[col.key])
    return [...rows].sort((a, b) => {
      const x = val(a)
      const y = val(b)
      const cmp = x == null ? 1 : y == null ? -1 : x < y ? -1 : x > y ? 1 : 0
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, sort, columns])

  const pages = Math.max(1, Math.ceil(sorted.length / perPage))
  const current = Math.min(page, pages)
  const shown = sorted.slice((current - 1) * perPage, current * perPage)
  const from = sorted.length ? (current - 1) * perPage + 1 : 0
  const to = Math.min(current * perPage, sorted.length)

  const toggleSort = (key) =>
    setSort((s) => (!s || s.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null))

  // page buttons like the Figma Page Nav: 1 2 … 4 (with gaps where pages are skipped)
  const nums = [...new Set([1, 2, current - 1, current, current + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b)
  const pageList = nums.flatMap((p, i) => (i > 0 && p - nums[i - 1] > 1 ? ['…', p] : [p]))

  return (
    <div className="data-table">
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width }} scope="col">
                  {c.sortable === false ? (
                    <span className="text-body-2">{c.label}</span>
                  ) : (
                    <button type="button" className="data-table__sort text-body-2" onClick={() => toggleSort(c.key)}>
                      {c.label}
                      {sort?.key === c.key ? (
                        sort.dir === 'asc' ? <ArrowUp size={16} strokeWidth={2} /> : <ArrowDown size={16} strokeWidth={2} />
                      ) : (
                        <ArrowDownUp size={16} strokeWidth={2} />
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r[rowKey]} className={onRowClick ? 'is-clickable' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                {columns.map((c) => (
                  <td key={c.key} className="text-body">
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={columns.length} className="data-table__empty text-body">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="data-table__foot text-body">
        <label className="data-table__per-page">
          Rows per page
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value))
              setPage(1)
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <span className="data-table__range">
          {from}-{to} of {sorted.length} rows
        </span>
        <nav className="page-nav" aria-label="Pagination">
          <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page">
            <ChevronLeft size={18} strokeWidth={1.75} />
          </button>
          {pageList.map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`}>…</span>
            ) : (
              <button key={p} type="button" className={p === current ? 'is-current' : ''} aria-current={p === current ? 'page' : undefined} onClick={() => setPage(p)}>
                {p}
              </button>
            ),
          )}
          <button type="button" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page">
            <ChevronRight size={18} strokeWidth={1.75} />
          </button>
        </nav>
      </div>
    </div>
  )
}
