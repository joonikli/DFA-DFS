// App shell: Figma sidebar (logo, nav, view switch, settings) + main scroll area.
import { Icon } from './Icon.jsx';
import { useToast } from './ui.jsx';
import { CONVOS, GROUPS } from '../data.js';
import { useStore } from '../lib/store.js';
import { navigate } from '../lib/router.js';

export const MANAGER_NAV = [
  ['dashboard', 'Dashboard', 'nav-house'],
  ['events', 'Events', 'nav-calendar'],
  ['surveys', 'Surveys', 'nav-file-pen'],
  ['grants', 'Grants', 'nav-dollar'],
  ['messages', 'Messages', 'nav-messages'],
];

export function useNotBuilt() {
  const toast = useToast();
  return (label) => toast(`${label} isn’t part of this prototype — try Dashboard or Messages.`, { ic: 'info' });
}

export function Shell({ route, nav = MANAGER_NAV, routes = ['dashboard', 'events', 'messages'], switchTo, children, onNav, showBadges = true }) {
  useStore();
  const notBuilt = useNotBuilt();
  const unread = CONVOS.reduce((a, c) => a + c.unread, 0) + GROUPS.reduce((a, g) => a + g.unread, 0);
  const go = (r, label) => {
    if (onNav) return onNav(r, label);
    if (routes.includes(r)) navigate(r); else notBuilt(label);
  };
  const item = (r, label, ic) => (
    <button key={r} className={`nav-item ${route === r ? 'on' : ''}`} aria-label={label} onClick={() => go(r, label)}>
      <Icon name={ic} size={24} />
      <span>{label}</span>
      {showBadges && r === 'messages' && unread > 0 && route !== 'messages' && <span className="badge nav-badge">{unread}</span>}
    </button>
  );
  return (
    <div className="shell">
      <aside className="sidebar">
        <img className="logo" src="/assets/logo.png" alt="Dress for Success" />
        <nav className="nav">{nav.map(([r, label, ic]) => item(r, label, ic))}</nav>
        <div className="nav-spacer" />
        {switchTo && <a className="view-switch" href={switchTo.href}><Icon name="external" size={16} /><span>{switchTo.label}</span></a>}
        {item('settings', 'Settings', 'nav-settings')}
      </aside>
      <main className="main" id="main">{children}</main>
    </div>
  );
}
