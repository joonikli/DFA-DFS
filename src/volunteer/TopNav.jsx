import { useState } from 'react';
import { Avatar as PersonAvatar, Icon } from '../components/Icon.jsx';
import { usePop } from '../components/ui.jsx';
import { navigate } from '../lib/router.js';
import { useStore } from '../lib/store.js';
import EventAsset from '../features/events/EventAsset.jsx';
import { VOL, vol } from './shared.js';

function VolunteerAvatar() {
  const [failedSource, setFailedSource] = useState(null);
  return <span className="ve-avatar" onErrorCapture={() => setFailedSource(vol.photo)}><PersonAvatar id={VOL} photo={failedSource === vol.photo ? '' : undefined} /></span>;
}

export default function VolunteerTopNav({ onAnnouncement, className = '' }) {
  useStore();
  const pop = usePop();
  const go = route => { pop.close(null, true); navigate(route); };
  return <div className={`top-nav ve-top-nav ${className}`}>
    <button className="tn-bell" aria-label="Notifications" onClick={event => pop.toggle(event.currentTarget, <div className="ve-notifications"><b>Volunteer announcements</b><button className="menu-item" onClick={() => { pop.close(null, true); onAnnouncement(); }}>Read the latest group announcement<Icon name="arrow-r" size={16} /></button></div>, { align: 'end' })}><EventAsset name="list-group101" /></button>
    <span className="tn-sep" />
    <button className="tn-me" aria-label="Account" onClick={event => pop.toggle(event.currentTarget, <div className="menu vop-account-menu" role="menu">
      <button className="me-head menu-item" role="menuitem" onClick={() => go('profile')}><VolunteerAvatar /><span><b>{vol.name}</b><small>Volunteer</small></span></button>
      <div className="menu-sep" />
      <button className="menu-item" role="menuitem" onClick={() => go('logged-out')}>Log out</button>
    </div>, { align: 'end' })}><VolunteerAvatar /></button>
  </div>;
}
