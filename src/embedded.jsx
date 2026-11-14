// Screens from the former manager app (manager.html) and volunteer portal (volunteer.html)
// that now render inside the main app's frame. Loaded lazily by App.jsx as one chunk so their CSS arrives in the same order as in
// the original app: each screen's own stylesheets first, then styles.css last.
import { LiveRegion, PopProvider, ToastProvider, useGlobalTooltips } from './components/ui.jsx'
import { Embedded } from './lib/appScope.js'
import Dashboard from './features/dashboard/Dashboard.jsx'
import Messages from './features/messages/Messages.jsx'
import Report from './features/report/Report.jsx'
import Events from './features/events/Events.jsx'
import Profiles from './features/profiles/Profiles.jsx'
import VolunteerDashboard from './volunteer/Dashboard.jsx'
import './styles.css'

function Tooltips() {
  useGlobalTooltips()
  return null
}

// The providers ManagerApp used to give every screen: popovers, toasts, tooltips, live region.
function Screen({ app, children }) {
  return (
    <Embedded app={app}>
      <ToastProvider>
        <PopProvider>
          <Tooltips />
          <div className="route-enter">{children}</div>
          <LiveRegion />
        </PopProvider>
      </ToastProvider>
    </Embedded>
  )
}

export const ManagerDashboard = () => <Screen app="manager"><Dashboard /></Screen>
export const ManagerMessages = () => <Screen app="manager"><Messages /></Screen>
export const ManagerEvents = () => <Screen app="manager"><Events /></Screen>
export const ManagerReport = ({ params }) => <Screen app="manager"><Report params={params} /></Screen>
export const VolunteerHome = () => <Screen app="volunteer"><VolunteerDashboard /></Screen>
export const ManagerProfile = ({ params }) => (
  <Screen app="manager"><Profiles key={`${params.get('type')}/${params.get('id')}`} params={params} /></Screen>
)
