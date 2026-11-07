// Hash router: #dashboard · #messages · #report?tpl=board&period=q4
import { useSyncExternalStore } from 'react';

const subscribe = (cb) => { addEventListener('hashchange', cb); return () => removeEventListener('hashchange', cb); };
const snapshot = () => location.hash;

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, snapshot);
  const [r, q] = (hash.slice(1) || 'dashboard').split('?');
  return { route: r, params: new URLSearchParams(q || ''), hash };
}

export function navigate(to) {
  if (location.hash === `#${to}`) dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = to;
}

// The volunteer portal is a second Vite page (volunteer.html); the manager app is index.html
export const VOLUNTEER_URL = 'volunteer.html';
export const MANAGER_URL = './';
