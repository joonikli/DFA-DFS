// Dashboard KPI tile ("Total hours volunteered 60 hours +250% from last month").
// Figma: Dashboard Volunteer (2324:47984…48014) and Profiles.
import './StatTile.css'

/**
 * @param {string} label
 * @param {string|number} value
 * @param {string} [unit]
 * @param {string} [delta]     e.g. "+30% from last month"
 * @param {'up'|'down'} [trend]
 */
export default function StatTile({ label, value, unit, delta, trend = 'up', children, className = '' }) {
  return (
    <div className={`stat-tile ${className}`}>
      <p className="text-body stat-tile__label">{label}</p>
      {children ?? (
        <div className="stat-tile__body">
          <p className="stat-tile__value">
            <span className="text-heading-1">{value}</span>
            {unit && <span className="text-label-2 stat-tile__unit">{unit}</span>}
          </p>
          {delta && <p className={`text-body stat-tile__delta stat-tile__delta--${trend}`}>{delta}</p>}
        </div>
      )}
    </div>
  )
}
