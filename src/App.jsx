import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from './layout/AppShell.jsx'
import Placeholder from './pages/Placeholder.jsx'
import VolunteerEvents from './pages/volunteer/VolunteerEvents.jsx'
import SurveysHome from './pages/admin/SurveysHome.jsx'
import SurveyDetail from './pages/admin/SurveyDetail.jsx'
import VolunteerSurveys from './pages/volunteer/VolunteerSurveys.jsx'
import VolunteerMessages from './pages/volunteer/VolunteerMessages.jsx'
import Grants from './pages/admin/Grants.jsx'
import GenerateReports from './pages/admin/GenerateReports.jsx'
import { EventFlowsProvider } from './features/events/EventFlows.jsx'
import Profile from './pages/Profile.jsx'
import { connectHost, hostChanged } from './lib/router.js'
import { useDemo } from './store/DemoStore.jsx'

// Each route renders the admin or volunteer version of a screen based on the
// role chosen in the avatar menu (top right).
function ByRole({ admin, volunteer }) {
  const { role } = useDemo()
  return role === 'admin' ? admin : volunteer
}

/* ---------------------------------------------------------------------------
   Screens from the former manager app (Lan: dashboard, messages, report; bev: events,
   profiles) and volunteer portal (Lan: volunteer dashboard). They keep their own code and styles (src/embedded.jsx, src/lib/appScope.js)
   and navigate with route strings ('messages', 'report?tpl=board'), mapped to paths here.
--------------------------------------------------------------------------- */
const embedded = (name) => lazy(() => import('./embedded.jsx').then((m) => ({ default: m[name] })))
const ManagerDashboard = embedded('ManagerDashboard')
const ManagerMessages = embedded('ManagerMessages')
const ManagerEvents = embedded('ManagerEvents')
const ManagerReport = embedded('ManagerReport')
const ManagerProfile = embedded('ManagerProfile')
const VolunteerHome = embedded('VolunteerHome')

const ROUTE_PATHS = {
  dashboard: '/',
  events: '/events',
  messages: '/messages',
  report: '/reports/new',
  profile: '/people',
  surveys: '/surveys',
  grants: '/grants',
  settings: '/settings',
}
const routeToPath = (to) => {
  const [route, query] = to.split('?')
  const path = ROUTE_PATHS[route] ?? '/'
  return query ? `${path}?${query}` : path
}
const pathToRoute = (pathname, search) => {
  const route = Object.keys(ROUTE_PATHS).find((r) => ROUTE_PATHS[r] === pathname) ?? pathname.slice(1)
  return `#${route}${search}`
}

// Lets the embedded screens' router (src/lib/router.js) read and change the real location
function RouterHost() {
  const { pathname, search } = useLocation()
  const go = useNavigate()
  const state = useRef({})
  state.current.route = pathToRoute(pathname, search)
  state.current.go = go
  useLayoutEffect(() => {
    connectHost({ current: () => state.current.route, go: (to) => state.current.go(routeToPath(to)) })
    // Plain links in those screens (<a href="#events?event=e13">) set the hash: open the real path
    const onHash = () => {
      const to = location.hash.slice(1)
      if (to) state.current.go(routeToPath(to))
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  useLayoutEffect(hostChanged, [pathname, search])
  return null
}

function Lazy({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>
}
const WithParams = ({ as: Screen }) => <Lazy><Screen params={useSearchParams()[0]} /></Lazy>

// Admin event links (/events/e13) open bev's events screen, which takes ?event=
function EventLink() {
  const { id } = useParams()
  return <Navigate to={`/events?event=${encodeURIComponent(id)}`} replace />
}

// Old admin links to a volunteer (/volunteers/v01) open the admin profile. v01 is Maureen,
// who is 'maureen' among the named contacts in src/data.js.
function VolunteerLink() {
  const { id } = useParams()
  const person = id === 'v01' ? 'maureen' : id
  return <Navigate to={`/people?type=volunteer&id=${encodeURIComponent(person)}`} replace />
}

// The former standalone pages (/manager#messages, volunteer.html#events …) open the same
// screen here, in the matching role.
function FormerApp({ role }) {
  const { hash } = useLocation()
  const { setRole } = useDemo()
  const go = useNavigate()
  useEffect(() => {
    setRole(role)
    go(routeToPath(hash.slice(1) || 'dashboard'), { replace: true })
    // Runs once: this route only ever redirects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

export default function App() {
  return (
    <>
      <RouterHost />
      <Routes>
        {['manager', 'manager.html'].map((p) => <Route key={p} path={p} element={<FormerApp role="admin" />} />)}
        {['volunteer', 'volunteer.html'].map((p) => <Route key={p} path={p} element={<FormerApp role="volunteer" />} />)}
        <Route element={<AppShell />}>
          <Route index element={<ByRole admin={<Lazy><ManagerDashboard /></Lazy>} volunteer={<Lazy><VolunteerHome /></Lazy>} />} />
          <Route path="events" element={<ByRole admin={<Lazy><ManagerEvents /></Lazy>} volunteer={<VolunteerEvents />} />} />
          <Route path="events/:id" element={<ByRole admin={<EventLink />} volunteer={<Navigate to="/events" replace />} />} />
          <Route path="surveys" element={<ByRole admin={<SurveysHome />} volunteer={<VolunteerSurveys />} />} />
          <Route path="surveys/:id" element={<ByRole admin={<SurveyDetail />} volunteer={<Navigate to="/surveys" replace />} />} />
          <Route
            path="grants"
            element={
              <ByRole
                admin={<Grants />}
                volunteer={<Placeholder title="Grants" note="Grants are managed by Dress for Success staff. Switch to the admin view (avatar menu) to see them." />}
              />
            }
          />
          {/* Profiles: volunteer view = Profile.jsx (Maureen's own); admin view = bev's profiles at
              /people (Bridget's own with type=admin, any volunteer with type=volunteer&id=…) */}
          <Route path="profile" element={<ByRole admin={<Navigate to="/people?type=admin" replace />} volunteer={<Profile />} />} />
          <Route path="volunteers/:id" element={<ByRole admin={<VolunteerLink />} volunteer={<Navigate to="/profile" replace />} />} />
          <Route path="people" element={<ByRole admin={<WithParams as={ManagerProfile} />} volunteer={<Navigate to="/profile" replace />} />} />
          <Route path="messages" element={<ByRole admin={<Lazy><ManagerMessages /></Lazy>} volunteer={<VolunteerMessages />} />} />
          <Route path="settings" element={<Placeholder title="Settings" note="Not in the Figma designs yet." />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        {/* Full-screen document workspaces — no sidebar in the Figma frames */}
        <Route
          path="grants/reports"
          element={
            <EventFlowsProvider>
              <ByRole admin={<GenerateReports />} volunteer={<Navigate to="/" replace />} />
            </EventFlowsProvider>
          }
        />
        <Route path="reports/new" element={<ByRole admin={<WithParams as={ManagerReport} />} volunteer={<Navigate to="/" replace />} />} />
      </Routes>
    </>
  )
}
