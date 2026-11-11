import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../components/Icon.jsx';
import { hideTip, useFitZoom, usePop, useToast } from '../../components/ui.jsx';
import { useNotBuilt } from '../../components/Shell.jsx';
import { initials, useStore } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { openConversation } from '../../lib/bridge.js';
import { VOLS } from '../../data.js';
import { AccountMenu, Notifications } from '../dashboard/Popovers.jsx';
import { EventCard, EventTabs } from '../events/Events.jsx';
import EventAsset from '../events/EventAsset.jsx';
import { useEventState } from '../events/eventState.js';
import { getProfile, PROFILE_AWARDS, PROFILE_YEAR, saveAdminNotes, saveAdminProfile } from './profileData.js';
import ProfileEditor from './ProfileEditor.jsx';
import './profiles.css';

function ProfileAsset({ name, ...props }) {
  return <img className="ap-asset" src={`/assets/profiles/${name}.svg`} alt="" aria-hidden="true" {...props} />;
}

function Portrait({ person }) {
  const [failed, setFailed] = useState(false);
  return <div className="ap-portrait" aria-label={`${person.name} profile photo`}>
    <span>{initials(person.name)}</span>{person.photo && !failed && <img src={person.photo} alt="" onError={() => setFailed(true)} />}
  </div>;
}

function TopNav() {
  const pop = usePop(), notBuilt = useNotBuilt();
  const [unread, setUnread] = useState(true);
  return <div className="top-nav ap-top-nav">
    <button className="tn-bell" aria-label="Notifications" onClick={(event) => pop.toggle(event.currentTarget, <Notifications onReadAll={() => setUnread(false)} onOpen={(key) => { setUnread(false); if (key === 'sophia') openConversation('c2'); else if (key === 'grant') notBuilt('Grants'); else navigate('events'); }} />, { align: 'end' })}><EventAsset name="list-group101" />{unread && <i className="tn-dot" />}</button>
    <span className="tn-sep" /><button className="tn-me" aria-label="Account" onClick={(event) => pop.toggle(event.currentTarget, <AccountMenu onSettings={() => notBuilt('Settings')} />, { align: 'end' })}><Avatar id="me" photo={getProfile('admin').photo} /></button>
  </div>;
}

function Notes({ person }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false), [draft, setDraft] = useState(person.notes || '');
  const edit = useRef(null);
  const finish = () => { setEditing(false); requestAnimationFrame(() => edit.current?.focus()); };
  return <section className="ap-notes" aria-label="Admin notes">
    <header><h2>Admin Notes</h2><button ref={edit} className="ap-notes-edit" aria-label="Edit admin notes" aria-expanded={editing} onClick={() => { setDraft(person.notes || ''); setEditing(true); }}><ProfileAsset name="notes-pen" /></button></header>
    {editing ? <form className="ap-notes-box editing" onSubmit={(event) => { event.preventDefault(); saveAdminNotes(person.id, draft); finish(); toast('Admin notes saved', { ic: 'check' }); }}>
      <label className="sr" htmlFor="admin-profile-notes">Admin-only notes</label><textarea id="admin-profile-notes" autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); finish(); } }} />
      <div><button type="button" className="btn btn-purple-outline" onClick={finish}>Cancel</button><button type="submit" className="btn btn-dark">Save notes</button></div>
    </form> : <div className="ap-notes-box"><p>{person.notes || 'No admin notes have been added yet.'}</p></div>}
  </section>;
}

function Statistics({ person, year, onYear }) {
  const pop = usePop();
  const current = year === PROFILE_YEAR;
  const values = [current ? person.hours : null, current ? person.attended : null, current ? person.attendance : null];
  return <section className="ap-activity" aria-label="Volunteer activity statistics">
    <label className="ap-year"><span className="sr">Activity year</span><select aria-label="Activity year" value={year} onChange={(event) => onYear(event.target.value)}>{['2026', '2025', '2024'].map((item) => <option key={item}>{item}</option>)}</select><ProfileAsset name="year-chevron" /></label>
    <div className="ap-stat-grid">{['Total volunteer hours', 'Total events attended', 'Attendance rate'].map((label, index) => <div className="ap-stat" key={label}>
      {index === 2 && <button className="ap-stat-info" aria-label="About attendance rate" onClick={(event) => pop.toggle(event.currentTarget, <div className="ap-info-pop" role="dialog" aria-label="Attendance rate information">Share of registered events the volunteer attended in the selected year. Historic rates are not available for every demo profile.</div>, { align: 'end' })}><ProfileAsset name="attendance-info" /></button>}
      <span>{label}</span><p><b>{values[index] ?? '—'}</b><span>{['hours', 'events', '%'][index]}</span></p>
    </div>)}</div>
    {!current && <p className="ap-missing-history" role="status">Activity data for {year} is not included in this prototype.</p>}
  </section>;
}

function Awards({ person }) {
  const awards = PROFILE_AWARDS.filter((award) => person.awards.includes(award.id));
  if (!awards.length) return <div className="ae-empty ap-empty"><div className="ae-empty-content"><div className="ae-empty-icon"><EventAsset name="detail-handshake" /></div><p>No awards are recorded for this volunteer in the prototype.</p></div></div>;
  return <section className="ap-awards" aria-label="Volunteer awards">
    {['badge', 'title'].map((kind) => <section key={kind} aria-label={kind === 'badge' ? 'Badges' : 'Titles'}><h3>{kind === 'badge' ? 'Badges' : 'Titles'}</h3><div className={`ap-award-grid ${kind === 'badge' ? 'ap-award-badges' : 'ap-award-titles'}`}>
      {awards.filter((award) => award.kind === kind).map((award) => <figure key={award.id}><div className={kind === 'badge' ? 'ap-badge-art' : 'ap-title-art'}><img src={`/assets/profiles/${award.id}.png`} alt={`${award.name} award artwork`} /></div><figcaption>{award.name}</figcaption></figure>)}
    </div></section>)}
  </section>;
}

export default function Profiles({ params }) {
  useStore();
  const type = params.get('type') === 'admin' ? 'admin' : 'volunteer';
  const person = getProfile(type, params.get('id') || 'sarah');
  const admin = type === 'admin';
  const toast = useToast(), pop = usePop();
  const page = useRef(null), popRef = useRef(pop); popRef.current = pop;
  useFitZoom(page, { designWidth: 1488, minWidth: 1000 });
  const [tab, setTab] = useState('Upcoming'), [year, setYear] = useState(PROFILE_YEAR), [editor, setEditor] = useState(null);
  const [events] = useEventState('events'), [saved, setSaved] = useEventState('saved');
  useEffect(() => { document.getElementById('main')?.scrollTo(0, 0); return () => { popRef.current.close(null, true); hideTip(); }; }, []);
  const changeTab = (value) => { pop.close(null, true); hideTip(); setTab(value); };
  const saveToggle = (event) => {
    const wasSaved = saved.has(event.id);
    setSaved((current) => { const next = new Set(current); if (next.has(event.id)) next.delete(event.id); else next.add(event.id); return next; });
    hideTip(); toast(wasSaved ? 'Event removed from saved' : 'Event saved', { ic: 'bookmark' });
  };
  const related = !person ? [] : events.filter((event) => {
    if (admin) return tab === 'Upcoming' ? event.status === 'Upcoming' && event.group === 'mine' : event.status === 'Completed';
    if (tab === 'Attended') return person.attendedEvents.includes(event.id);
    return event.status === 'Upcoming' && (event.volunteerIds || Object.keys(VOLS).slice(0, event.registered)).includes(person.id);
  });
  const first = person?.name.split(' ')[0];

  return <div className={`ae-page ap-page ${admin ? 'ap-own-admin' : 'ap-volunteer'}`} data-awards-active={tab === 'Awards' || undefined} ref={page}>
    <TopNav />
    {!person ? <div className="ap-not-found"><h1>Profile not found</h1><p>This volunteer is not available in the prototype.</p><button className="btn btn-purple-outline" onClick={() => navigate('events')}>Back to Events</button></div> : <>
      <div className="ap-cover" aria-hidden="true" />
      <div className="ap-masthead"><Portrait key={person.photo || person.id} person={person} />{admin && <button className="ap-photo-edit" aria-label="Edit profile photo" onClick={() => setEditor({ photoOnly: true })}><ProfileAsset name="photo-pen" /></button>}<div className="ap-joined"><span>Joined</span><span>{person.joined || 'Not recorded'}</span></div></div>
      <div className="ap-content"><div className="ap-columns"><div className="ap-primary">
        <section className="ap-intro"><div className="ap-identity-row"><div><div className="ap-name"><h1>{person.name}</h1>{person.verified && <ProfileAsset name={admin ? 'verified-admin' : 'verified-volunteer'} />}</div><p className="ap-subtitle">{admin ? person.jobTitle : person.kind} | {person.location}</p></div>{admin && <button className="btn btn-outline ae-edit ap-edit-profile" aria-label="Edit profile" onClick={() => setEditor({})}><EventAsset name="detail-pen" />Edit</button>}</div><p className="ap-bio">{person.bio}</p></section>
        {!admin && <Statistics person={person} year={year} onYear={setYear} />}
        <section className="ap-events" aria-label={`${first}’s events`}><h2>{first}’s Events</h2>
          <EventTabs items={admin ? ['Upcoming', 'Previous'] : ['Upcoming', 'Attended', 'Awards']} value={tab} onChange={changeTab} label="Profile activity" panelId="profile-activity-panel" className="ap-tabs" />
          {tab !== 'Awards' && <div className="ap-events-panel" id="profile-activity-panel" role="tabpanel" aria-label={`${tab} profile events`}>
            {related.length ? <><header><span>{tab === 'Upcoming' ? 'Upcoming events' : 'Previous events'}</span><span>{related.length} {related.length === 1 ? 'Event' : 'Events'}</span></header><div className="ae-cards">{related.map((event) => <EventCard key={event.id} event={event} saved={saved.has(event.id)} onSave={saveToggle} showRegistrationCount={false} />)}</div></> : <div className="ae-empty ap-empty"><div className="ae-empty-content"><div className="ae-empty-icon"><EventAsset name="detail-handshake" /></div><p>{tab === 'Upcoming' ? 'No upcoming events are recorded for this profile.' : 'No previous events are recorded for this profile.'}</p></div></div>}
          </div>}
        </section>
      </div><aside className="ap-aside" aria-label="Profile contact information"><section className="ap-contact"><h2>Contact</h2><dl>
        <div><dt><ProfileAsset name="mail" /><span className="sr">Email</span></dt><dd><a href={`mailto:${person.email}`}>{person.email}</a></dd></div>
        <div><dt><ProfileAsset name="phone" /><span className="sr">Phone</span></dt><dd><a href={`tel:${person.phone.replace(/[^+\d]/g, '')}`}>{person.phone}</a></dd></div>
        {!admin && person.tags.length > 0 && <div><dt><EventAsset name="detail-tags" /><span className="sr">Tags</span></dt><dd className="ap-contact-tags">{person.tags.map((tag) => <span key={tag}>{tag}</span>)}</dd></div>}
      </dl></section>{!admin && <Notes person={person} />}</aside></div>
      {tab === 'Awards' && <div id="profile-activity-panel" role="tabpanel" aria-label="Volunteer awards"><Awards person={person} /></div>}
      </div>
      {admin && editor && <ProfileEditor person={person} photoOnly={editor.photoOnly} onClosed={() => setEditor(null)} onSave={(form) => { saveAdminProfile(form); toast('Profile updated', { ic: 'check' }); }} />}
    </>}
  </div>;
}
