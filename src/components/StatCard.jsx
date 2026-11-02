export default function StatCard({ label, value, delta }) {
  const negative = delta.startsWith('-')
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-delta ${negative ? 'down' : 'up'}`}>{delta}</div>
    </div>
  )
}
