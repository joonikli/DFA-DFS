// Figma: Components › Tab nav (node 1290:16808)
// Variants: Property 1 = First | Second | Third | Fourth (which tab is selected)
import './TabNav.css'

/**
 * @param {{value: string, label: string}[]} tabs
 * @param {Record<string, number>} [marks]  tab value → count of unseen additions. A count > 0 shows a
 *                                          dot on that tab; each increase replays the dot's pulse
 */
export default function TabNav({ tabs, value, onChange, label = 'Sections', marks = {} }) {
  return (
    <div className="tab-nav" role="tablist" aria-label={label}>
      {tabs.map((t) => {
        const mark = t.value !== value ? marks[t.value] || 0 : 0
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={value === t.value}
            className={`tab-nav__tab text-body-2 ${value === t.value ? 'tab-nav__tab--active' : ''}`}
            onClick={() => onChange(t.value)}
          >
            <span className="tab-nav__label">
              {/* remounting on a new count restarts the pulse */}
              {mark > 0 && <span key={mark} className="tab-nav__dot" aria-hidden="true" />}
              {t.label}
            </span>
            {mark > 0 && <span className="tab-nav__sr">, new events added</span>}
          </button>
        )
      })}
    </div>
  )
}
