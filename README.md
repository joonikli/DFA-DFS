# Dress for Success — Volunteer Manager prototype

A clickable React + Vite prototype of the Dress for Success volunteer tools, built from the
"Dress-for-Success-Redesign" Figma file. Everything runs on mock data in memory — reloading
the page resets it.

## Run it

```bash
npm install
npm run dev
```

- Component-library prototype (React Router, admin/volunteer role switch): http://localhost:5173/
- Manager app (Bridget): http://localhost:5173/manager.html — Dashboard, Messages, Report composer
- Volunteer portal (Maureen): http://localhost:5173/volunteer.html

`npm run build` outputs all three pages to `dist/`.

## What's inside

| Area | Where | Highlights |
|---|---|---|
| Dashboard | `src/features/dashboard/` | Widget grid matching Figma proportions (scales to fit), edit mode (drag to move, × to remove, Add cards, Reset/Done), calendar with add-shift, notifications, Generate report |
| Messaging | `src/features/messages/` | DMs, group chats and announcements; drafts, reactions, threads, unread indicators, delivery states, email, compose with recipient picker |
| Report composer | `src/features/report/` | AI-style composer that adds/rewrites sections, skeleton load, export to PDF or Markdown |
| Volunteer portal | `src/volunteer/` | Announcement banner, calendar + upcoming shifts, recommended events, stats, star-rating survey |
| Shared | `src/components/`, `src/lib/` | Lucide icons, avatars, origin-aware popovers, toasts, tooltips, segmented control, line chart, app shell, hash router |

- `src/data.js` — mock volunteers, shifts, conversations, announcements and metrics.
  Components mutate these objects and call `emit()` (`src/lib/store.js`) to re-render.
- `src/styles.css` — design tokens from the Figma variables, all component styles, and the motion system.
- `docs/MOTION.md` — motion spec (durations, easing, per-component rules, based on Emil Kowalski's guidance).
- `docs/messaging-audit.html` — messaging edge-case audit and the fixes it led to.
- `docs/PHOTO_CREDITS.md` — Unsplash photographer credits for the profile photos.

Icons are the official Lucide set (lucide-static 0.460.0, ISC). Profile photos are from Unsplash
(see credits); names are fictional placeholders, not the people pictured.
