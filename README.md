# Dress for Success — Volunteer Manager prototype

A clickable React + Vite prototype of the Dress for Success volunteer tools, built from the
"Dress-for-Success-Redesign" Figma file. Everything runs on mock data in memory — reloading
the page resets it.

## Run it

```bash
npm install
npm run dev
```

One app at http://localhost:5173/ (React Router). Switch between the admin (Bridget) and
volunteer (Maureen) views from the avatar menu, top right.

| Path | Admin | Volunteer |
|---|---|---|
| `/` | Dashboard (Lan, `src/features/dashboard/`) | Dashboard (Lan, `src/volunteer/Dashboard.jsx`) |
| `/events` | Events (bev, `src/features/events/`; `?event=<id>` opens one) | Events (`src/pages/volunteer/`) |
| `/surveys`, `/grants` | `src/pages/admin/` | `src/pages/volunteer/` |
| `/messages` | Messages (Lan, `src/features/messages/`) | Messages (`src/pages/volunteer/`) |
| `/reports/new` | Report composer (Lan, `src/features/report/`) | — |
| `/people?type=volunteer&id=sarah`, `/people?type=admin` | Profiles (bev, `src/features/profiles/`): any volunteer, and Bridget’s own | — |
| `/profile` | → `/people?type=admin` | Maureen’s profile (`src/pages/Profile.jsx`) |

**One data set, fixed "today" of Wednesday May 20, 2026** (`src/mock/today.js`). Events live in
`src/mock/events.js`; `src/data.js` builds the manager screens' shifts from them (same ids, plus
roles, capacity and sign-ups), so the volunteer dashboard, Events, Surveys and Messages agree.
The volunteer dashboard reads and writes the main store (`src/store/DemoStore.jsx`) and opens the
main app's register / cancel / save popups. bev's admin events (`src/features/events/eventData.js`)
still use their own sample events.

Old `manager.html` / `volunteer.html` / `/manager` / `/volunteer` links (with `#…`) redirect to
the matching screen and role. `npm run build` outputs the app to `dist/` (the host must serve
`index.html` for unknown paths, as with any React Router app).

**Screens from the former manager app** keep their own code and styles. They render inside the
main frame through `src/embedded.jsx`, wrapped in `<div class="app-embed app-manager">`, and still
navigate with route strings (`navigate('messages')`, `src/lib/router.js`), which `src/App.jsx` maps
to paths. Both codebases reuse class names (`.btn`, `.modal`, `.top-nav` …) with different styles, so
each stylesheet is scoped to where it's used — see `CSS_SCOPES` in `vite.config.js`. New CSS under
`src/volunteer/` is volunteer-only; under `src/features/dashboard|messages|report|profiles/` it applies
to the embedded screens; everything else is the main app's.

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
