import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layout/AppShell.jsx'
import Placeholder from './pages/Placeholder.jsx'
import VolunteerEvents from './pages/volunteer/VolunteerEvents.jsx'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard.jsx'
import AdminEvents from './pages/admin/AdminEvents.jsx'
import AdminEventDetail from './pages/admin/AdminEventDetail.jsx'
import SurveysHome from './pages/admin/SurveysHome.jsx'
import SurveyDetail from './pages/admin/SurveyDetail.jsx'
import VolunteerSurveys from './pages/volunteer/VolunteerSurveys.jsx'
import Grants from './pages/admin/Grants.jsx'
import GenerateReports from './pages/admin/GenerateReports.jsx'
import { EventFlowsProvider } from './features/events/EventFlows.jsx'
import ReportComposer from './pages/admin/ReportComposer.jsx'
import Profile from './pages/Profile.jsx'
import AdminDashboardPlaceholder from './pages/admin/AdminDashboardPlaceholder.jsx'
import { useDemo } from './store/DemoStore.jsx'

// Each route renders the admin or volunteer version of a screen based on the
// role chosen in the avatar menu (top right).
function ByRole({ admin, volunteer }) {
  const { role } = useDemo()
  return role === 'admin' ? admin : volunteer
}


export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ByRole admin={<AdminDashboardPlaceholder />} volunteer={<VolunteerDashboard />} />} />
        <Route path="events" element={<ByRole admin={<AdminEvents />} volunteer={<VolunteerEvents />} />} />
        <Route path="events/:id" element={<ByRole admin={<AdminEventDetail />} volunteer={<Navigate to="/events" replace />} />} />
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
        <Route path="profile" element={<Profile />} />
        <Route path="volunteers/:id" element={<ByRole admin={<Profile />} volunteer={<Navigate to="/profile" replace />} />} />
        <Route path="messages" element={<Placeholder title="Messages" note="Not in the Figma designs yet." />} />
        <Route path="settings" element={<Placeholder title="Settings" note="Not in the Figma designs yet." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      {/* Full-screen document workspace — no sidebar in the Figma frames */}
      <Route
        path="grants/reports"
        element={
          <EventFlowsProvider>
            <ByRole admin={<GenerateReports />} volunteer={<Navigate to="/" replace />} />
          </EventFlowsProvider>
        }
      />
      <Route
        path="reports/new"
        element={
          <EventFlowsProvider>
            <ByRole admin={<ReportComposer />} volunteer={<Navigate to="/" replace />} />
          </EventFlowsProvider>
        }
      />
    </Routes>
  )
}
