// Figma: Components › Tab nav (node 1290:16808)
// Variants: Property 1 = First | Second | Third | Fourth (which tab is selected)
import './TabNav.css'

/**
 * @param {{value: string, label: string}[]} tabs
 * @param {{value: string, n: number}} [pulse]  briefly highlights a tab (e.g. where a card was just moved);
 *                                               bump `n` to replay it
 */
export default function TabNav({ tabs, value, onChange, label = 'Sections', pulse }) {
  return (
    <div className="tab-nav" role="tablist" aria-label={label}>
      {tabs.map((t) => {
        const pulsing = pulse?.value === t.value && t.value !== value
        return (
          <button
            // remounting on a new pulse restarts the CSS animation
            key={pulsing ? `${t.value}-${pulse.n}` : t.value}
            type="button"
            role="tab"
            aria-selected={value === t.value}
            className={`tab-nav__tab text-body-2 ${value === t.value ? 'tab-nav__tab--active' : ''} ${pulsing ? 'tab-nav__tab--pulse' : ''}`}
            onClick={() => onChange(t.value)}
          >
            <span className="tab-nav__label">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
