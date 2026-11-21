// Route strings: 'dashboard' · 'messages' · 'report?tpl=board&period=q1' · 'events?event=…'
// These screens now render inside the main React Router app (src/App.jsx), which connects
// a host that maps route strings to real paths ('report?tpl=board' → '/reports/new?tpl=board')
// and back. Without a host (e.g. a screen rendered on its own) the URL hash is used.
import { useSyncExternalStore } from 'react';

let host = null;
const listeners = new Set();

// host = { current(): '#route?query', go(routeString) }
export function connectHost(h) { host = h; }
// The host calls this whenever its location changes.
export function hostChanged() { listeners.forEach((cb) => cb()); }

const subscribe = (cb) => {
  listeners.add(cb);
  addEventListener('hashchange', cb);
  return () => { listeners.delete(cb); removeEventListener('hashchange', cb); };
};
const snapshot = () => (host ? host.current() : location.hash);

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, snapshot);
  const [r, q] = (hash.slice(1) || 'dashboard').split('?');
  return { route: r, params: new URLSearchParams(q || ''), hash };
}

// Name of the screen that is showing now ('messages', 'events' …)
export function currentRoute() {
  return (snapshot().slice(1) || 'dashboard').split('?')[0];
}

export function navigate(to) {
  // Re-navigating to the current route still notifies listeners (e.g. Messages takes a pending intent)
  if (snapshot() === `#${to}`) { dispatchEvent(new HashChangeEvent('hashchange')); return; }
  if (host) host.go(to);
  else location.hash = to;
}

// Former standalone pages; both now redirect into the main app with the matching role.
export const VOLUNTEER_URL = '/volunteer';
export const MANAGER_URL = '/manager';
