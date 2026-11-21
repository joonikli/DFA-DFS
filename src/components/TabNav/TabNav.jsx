// Figma: Components › Tab nav (node 1290:16808)
// Variants: Property 1 = First | Second | Third | Fourth (which tab is selected)
import SlidingTabs from '../SlidingTabs.jsx'

/**
 * @param {{value: string, label: string}[]} tabs
 * @param {Record<string, number>} [marks]  tab value → count of unseen additions. A count > 0 shows a
 *                                          dot on that tab; each increase replays the dot's pulse
 */
export default function TabNav({ tabs, value, onChange, label = 'Sections', ...props }) {
  return <SlidingTabs items={tabs} value={value} onChange={onChange} label={label} {...props} />
}
