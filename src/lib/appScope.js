// Screens built for the manager app (Lan, bev) and volunteer portal render inside the main
// app's frame, wrapped in <Embedded app="manager"> / <Embedded app="volunteer">.
// Their stylesheets apply only inside that wrapper, and the main app's stylesheets skip it,
// because both sides reuse class names (.btn, .modal, .top-nav …) with different styles.
// See CSS_SCOPES in vite.config.js.
import { createElement, useLayoutEffect } from 'react'

let active = null
const roots = {}

// Popovers, toasts, tooltips and modals of embedded screens attach here instead of
// document.body, so they get the same scoped styles as the screen that opened them.
export function portalRoot() {
  if (!active) return document.body
  let el = roots[active]
  if (!el?.isConnected) {
    el = roots[active] = document.createElement('div')
    el.className = `app-portal app-${active}`
    // The scoped `body` styles also land on this div; keep it out of the page layout.
    el.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;background:none'
    document.body.appendChild(el)
  }
  return el
}

export function Embedded({ app, children }) {
  active = app // set during render so the screen's providers portal into the right root
  useLayoutEffect(() => {
    active = app
    return () => {
      if (active === app) active = null
    }
  }, [app])
  return createElement('div', { className: `app-embed app-${app}` }, children)
}
