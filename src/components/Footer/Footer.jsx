// App-wide footer (copyright line). Not in the Figma components yet — styled with the
// existing tokens (Label 2, dark gray, gray rule) to sit under every admin/volunteer screen.
import './Footer.css'

export default function Footer() {
  return (
    <footer className="app-footer">
      <p className="text-label-2">© {new Date().getFullYear()} Dress for Success. All rights reserved.</p>
    </footer>
  )
}
