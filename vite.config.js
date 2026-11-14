import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { relative } from 'node:path'

// One app (index.html, React Router). Some screens were built for the former manager app
// and volunteer portal; they render inside the main frame wrapped in
// <div class="app-embed app-manager"> / <div class="app-embed app-volunteer">
// (src/lib/appScope.js). Their popovers/toasts portal into body-level divs with the same class.
//
// The two codebases reuse class names (.btn, .modal, .sidebar, .top-nav …) with different
// styles, so each stylesheet is scoped to where it's used:
//   'a'          the main app — everywhere except inside the wrappers it isn't listed for
//   'manager'    inside .app-manager wrappers
//   'volunteer'  inside .app-volunteer wrappers
//   null         everywhere (shared)
// Scoping only uses :where(), so selector specificity — and the cascade inside each
// stylesheet — is unchanged. First matching path wins.
// When a screen is consolidated so one stylesheet serves everyone, move it to null.
const CSS_SCOPES = [
  ['src/tokens/', null],
  ['src/styles/', null],
  ['src/layout/embed.css', null],
  ['src/components/CalendarKey/', null],
  ['src/components/Button/', ['a', 'manager']],
  ['src/components/SearchBar/', ['a', 'manager']],
  ['src/components/SubNav/', ['a', 'manager']],
  ['src/components/TabNav/', ['a', 'manager']],
  ['src/components/Notification/', ['a', 'volunteer']],
  ['src/volunteer/', ['volunteer']],
  ['src/styles.css', ['manager', 'volunteer']],
  ['src/features/events/events.css', ['manager', 'volunteer']],
  ['src/features/profiles/', ['manager', 'volunteer']],
  ['src/features/dashboard/', ['manager', 'volunteer']],
  ['src/features/messages/', ['manager', 'volunteer']],
  ['src/features/report/', ['manager', 'volunteer']],
  ['src/', ['a']],
]
const WRAPPERS = ['manager', 'volunteer']

function scopeFor(file) {
  const rel = relative(import.meta.dirname, file).replaceAll('\\', '/')
  const hit = CSS_SCOPES.find(([prefix]) => rel.startsWith(prefix))
  return hit ? hit[1] : null
}

// Index where a trailing pseudo-element starts ('.x::before' → 2), or the selector length
function pseudoElementAt(sel) {
  let depth = 0
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i]
    if (c === '(') depth++
    else if (c === ')') depth--
    else if (depth === 0 && c === ':') {
      if (sel[i + 1] === ':') return i
      if (/^:(before|after|first-line|first-letter)(?![\w-])/.test(sel.slice(i))) return i
    }
  }
  return sel.length
}

// Inside an embedded screen, <div class="app-a"> marks an island of main-app components
// (e.g. the award banner on the volunteer dashboard): main-app styles apply there again
// and the embedded screen's styles don't.
const ISLAND = '.app-a, .app-a *'
const insertAt = (sel, add) => {
  const at = pseudoElementAt(sel)
  return `${sel.slice(0, at)}${add}${sel.slice(at)}`
}

function scopeSelector(sel, apps) {
  if (apps.includes('a')) {
    // Main-app styles: skip the wrappers this stylesheet isn't meant for (islands excepted)
    const skip = WRAPPERS.filter((w) => !apps.includes(w)).flatMap((w) => [`.app-${w}`, `.app-${w} *`])
    if (!skip.length) return sel
    return insertAt(sel, `:where(:not(${skip.join(', ')}), ${ISLAND})`)
  }
  // Embedded-app styles: only inside their wrapper, outside islands. Their page-level rules
  // (html, body, :root) land on the wrapper itself, with the same specificity as before.
  const list = apps.map((a) => `.app-${a}`).join(', ')
  const top = sel.match(/^(:root|html|body)(?![\w-])/)
  const scoped = !top
    ? `:where(${list}) ${sel}`
    : (top[1] === ':root' ? `:is(${list})` : `div:where(${list})`) + sel.slice(top[1].length)
  return insertAt(scoped, `:where(:not(${ISLAND}))`)
}

const scopeCss = {
  postcssPlugin: 'dfs-app-scope',
  Once(root) {
    const file = root.source?.input.file
    const apps = file && scopeFor(file)
    if (!apps) return
    root.walkRules((rule) => {
      if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return
      rule.selectors = rule.selectors.map((s) => scopeSelector(s.trim(), apps))
    })
  },
}

export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [scopeCss] } },
})
