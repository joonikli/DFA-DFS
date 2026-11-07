// Admin Dashboard — intentionally NOT built yet (per request). Keeps the Figma greeting
// and the "Generate report" entry point so the Report creation flow is reachable.
// Build from: Final › Dashboard › Dashboard - Admin (2324:47024 / 2324:47435).
import GenerateReportButton from '../../features/reports/GenerateReportPopover.jsx'
import Placeholder from '../Placeholder.jsx'
import { PERSONAS } from '../../store/DemoStore.jsx'

export default function AdminDashboardPlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1328, marginLeft: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h1 className="text-heading-1" style={{ color: '#000' }}>
          Hi {PERSONAS.admin.name}, let’s see what’s going on...
        </h1>
        <GenerateReportButton />
      </div>
      <Placeholder
        title="Admin Dashboard"
        note="Skipped for now — to be added later. Figma has two variants of this screen. “Generate report” (top right) already works and opens the report composer."
        figmaNode="2324:47024"
      />
    </div>
  )
}
