// A tiny shared store. The mock data in src/data.js is plain mutable objects (like a local
// database); components read it during render, mutate it in event handlers, then call emit()
// so every subscribed component re-renders. Everything resets on page reload.
import { useSyncExternalStore } from 'react';

let version = 0;
const subs = new Set();

export function emit() {
  version += 1;
  subs.forEach((fn) => fn());
}

export function useStore() {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => version,
  );
}

// Small helpers shared across features
export const esc = (s) => String(s ?? '');
export const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const nowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Screen-reader announcements (rendered once by <LiveRegion/>)
export function live(text) {
  const l = document.getElementById('live');
  if (!l) return;
  l.textContent = '';
  setTimeout(() => { l.textContent = text; }, 60);
}
