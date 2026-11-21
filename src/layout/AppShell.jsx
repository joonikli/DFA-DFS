import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar.jsx'
import TopNav from '../components/TopNav/TopNav.jsx'
import { EventFlowsProvider } from '../features/events/EventFlows.jsx'
import './AppShell.css'
import './embed.css'

export default function AppShell() {
  return (
    <EventFlowsProvider>
      <div className="app-shell">
        <Sidebar />
        {/* id="main": the scroll container embedded screens scroll to the top on navigation */}
        <div className="app-shell__main" id="main">
          <TopNav />
          <main className="app-shell__content">
            <Outlet />
          </main>
        </div>
      </div>
    </EventFlowsProvider>
  )
}

/** Page title + subtitle used at the top of every screen. */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <h1 className="text-heading-2">{title}</h1>
        {subtitle && <p className="text-body page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  )
}
