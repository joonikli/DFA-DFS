// Figma: Components › Logistics_atom (node 1126:12772) — gray text items separated by a dot
// e.g. "8374 Redmond Rd, Pittsburgh, PA · 0.5 mi from you"
export default function LogisticsAtom({ items }) {
  return (
    <p className="text-body" style={{ color: 'var(--neutral-darker-gray)', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      {items.filter(Boolean).map((item, i, list) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {item}
          {/* separator trails the item so a wrapped line never starts with "·" */}
          {i < list.length - 1 && (
            <span aria-hidden="true" style={{ width: 16, textAlign: 'center' }}>
              ·
            </span>
          )}
        </span>
      ))}
    </p>
  )
}
