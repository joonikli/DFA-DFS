import { useEffect, useRef, useState } from 'react';
import { hideTip, useFitZoom, usePop, useToast } from '../components/ui.jsx';
import { navigate } from '../lib/router.js';
import { useStore } from '../lib/store.js';
import { EventTabs } from '../features/events/Events.jsx';
import EventAsset from '../features/events/EventAsset.jsx';
import { Awards, Portrait, ProfileAsset, Statistics } from '../features/profiles/Profiles.jsx';
import ProfileEditor from '../features/profiles/ProfileEditor.jsx';
import { PROFILE_YEAR } from '../features/profiles/profileData.js';
import { EventCard, EventDialog } from './Events.jsx';
import { AnnouncementModal } from './Modals.jsx';
import VolunteerTopNav from './TopNav.jsx';
import { ATTENDED_EVENTS, volunteerEvents } from './eventData.js';
import { ownVolunteerProfile, saveOwnVolunteerProfile } from './ownProfile.js';
import { useVolunteerEventActions } from './useEventActions.js';
import './profile.css';

export default function VolunteerProfile({ registered, setRegistered, saved, setSaved }) {
  useStore();
  const person = ownVolunteerProfile();
  const page = useRef(null), pop = usePop(), toast = useToast();
  const popRef = useRef(pop); popRef.current = pop;
  useFitZoom(page, { designWidth: 1488, minWidth: 1000 });
  const [tab, setTab] = useState('Upcoming'), [year, setYear] = useState(PROFILE_YEAR);
  const [editor, setEditor] = useState(null), [announcement, setAnnouncement] = useState(false);
  const { onSave, onRegister } = useVolunteerEventActions({ registered, setRegistered, saved, setSaved });
  useEffect(() => () => { popRef.current.close(null, true); hideTip(); }, []);
  const changeTab = value => { pop.close(null, true); hideTip(); setTab(value); };
  const related = tab === 'Attended' ? [...ATTENDED_EVENTS].sort((a, b) => b.date.localeCompare(a.date)) : volunteerEvents().filter(event => registered.has(event.id)).sort((a, b) => a.date.localeCompare(b.date));
  return <div className="ve-page ae-page ap-page ap-volunteer vop-page" data-awards-active={tab === 'Awards' || undefined} ref={page}>
    <VolunteerTopNav onAnnouncement={() => setAnnouncement(true)} />
    <div className="ap-cover" aria-hidden="true" />
    <div className="ap-masthead"><Portrait key={person.photo || person.id} person={person} /><button className="ap-photo-edit" aria-label="Edit profile photo" onClick={() => setEditor({ photoOnly: true })}><ProfileAsset name="photo-pen" /></button><div className="ap-joined"><span>Joined</span><span>{person.joined || 'Not recorded'}</span></div></div>
    <div className="ap-content"><div className="ap-columns"><div className="ap-primary">
      <section className="ap-intro"><div className="ap-identity-row"><div><div className="ap-name"><h1>{person.name}</h1></div><p className="ap-subtitle">{person.kind} | {person.location}</p></div><button className="btn btn-outline ae-edit ap-edit-profile" aria-label="Edit profile" onClick={() => setEditor({})}><EventAsset name="detail-pen" />Edit</button></div><p className="ap-bio">{person.bio}</p></section>
      <Statistics person={person} year={year} onYear={setYear} />
      <section className="ap-events" aria-label="Your profile activity"><h2>Your Events</h2>
        <EventTabs items={['Upcoming', 'Attended', 'Awards']} value={tab} onChange={changeTab} label="Profile activity" panelId="volunteer-profile-activity-panel" className="ap-tabs" />
        {tab !== 'Awards' && <div className="ap-events-panel" id="volunteer-profile-activity-panel" role="tabpanel" aria-label={`${tab} profile events`}>
          {related.length ? <><header><span>{tab === 'Upcoming' ? 'Upcoming events' : 'Attended events'}</span><span>{related.length} {related.length === 1 ? 'Event' : 'Events'}</span></header><div className="ve-cards list">{related.map(event => <EventCard key={event.id} {...{ event, onSave, onRegister }} registered={registered.has(event.id)} saved={saved.has(event.id)} onOpen={item => { pop.close(null, true); hideTip(); navigate(`events?id=${encodeURIComponent(item.id)}`); }} />)}</div>{tab === 'Attended' && <p className="vop-history-note">These are the detailed past events included in this prototype, not your full attendance history.</p>}</> : <div className="ae-empty ap-empty"><div className="ae-empty-content"><div className="ae-empty-icon"><EventAsset name="detail-handshake" /></div><p>{tab === 'Upcoming' ? 'You’re not registered for any upcoming events yet.' : 'You don’t have any attended events recorded yet.'}</p></div></div>}
        </div>}
      </section>
    </div><aside className="ap-aside" aria-label="Your contact information"><section className="ap-contact"><h2>Contact</h2><dl>
      <div><dt><ProfileAsset name="mail" /><span className="sr">Email</span></dt><dd><a href={`mailto:${person.email}`}>{person.email}</a></dd></div>
      <div><dt><ProfileAsset name="phone" /><span className="sr">Phone</span></dt><dd><a href={`tel:${person.phone.replace(/[^+\d]/g, '')}`}>{person.phone}</a></dd></div>
      {person.tags.length > 0 && <div><dt><EventAsset name="detail-tags" /><span className="sr">Tags</span></dt><dd className="ap-contact-tags">{person.tags.map(tag => <span key={tag}>{tag}</span>)}</dd></div>}
    </dl></section></aside></div>
    {tab === 'Awards' && <div id="volunteer-profile-activity-panel" role="tabpanel" aria-label="Your awards"><Awards person={person} emptyMessage="No awards are recorded for your profile in this prototype." /></div>}
    </div>
    {editor && <ProfileEditor person={person} variant="volunteer" photoOnly={editor.photoOnly} onClosed={() => setEditor(null)} onSave={form => { saveOwnVolunteerProfile(form); toast('Profile updated', { ic: 'check' }); }} />}
    {announcement && <EventDialog label="Volunteer announcement" onClosed={() => setAnnouncement(false)}>{close => <AnnouncementModal close={close} />}</EventDialog>}
  </div>;
}
