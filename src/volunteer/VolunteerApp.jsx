// Volunteer portal (Maureen Kelly) — Figma 1085:4706. Port of the vanilla volunteer.js.
// Shares data.js with the manager app, so the same shifts, announcements and people appear in both.
import { useCallback, useEffect, useRef, useState } from 'react';
import { LiveRegion, PopProvider, ToastProvider, hideTip, useFitZoom, useGlobalTooltips, useToast } from '../components/ui.jsx';
import { Shell } from '../components/Shell.jsx';
import { SHIFTS } from '../data.js';
import { emit, reducedMotion, useStore } from '../lib/store.js';
import { MANAGER_URL, navigate, useRoute } from '../lib/router.js';
import VolunteerEvents from './Events.jsx';
import VolunteerProfile from './Profile.jsx';
import VolunteerTopNav from './TopNav.jsx';
import { RegistrationProvider, useRegistration } from './Registration.jsx';
import { EventNoticeProvider, useEventNotice } from './EventNotice.jsx';
import { useVolunteerEventActions } from './useEventActions.js';
import { PAST_SURVEYS, RECOMMENDED, SURVEY_EVENT, VOL_NAV, firstName, vol } from './shared.js';
import { Banner } from './Banner.jsx';
import { CalendarCard } from './Calendar.jsx';
import { RecommendedCard } from './Recommended.jsx';
import { PastSurveys, SurveyCard } from './Surveys.jsx';
import { Modal } from './Modal.jsx';
import { AnnouncementModal, SurveyModal } from './Modals.jsx';

let pastSeq = 0;
const withKey = (p) => ({ ...p, key: ++pastSeq });
const add = (set, id) => new Set(set).add(id);
const del = (set, id) => { const n = new Set(set); n.delete(id); return n; };

function Dashboard({ registered, setRegistered, saved, setSaved }) {
  useStore();
  const { openRegistration, openCancel } = useRegistration();
  const toast = useToast();
  const notice = useEventNotice();
  const { onSave: save } = useVolunteerEventActions({ registered, setRegistered, saved, setSaved });
  const vpRef = useRef(null);
  const recsRef = useRef(null);
  useFitZoom(vpRef, { designWidth: 1488, minWidth: 1000 });

  // ---------- Volunteer-side state (resets on reload) ----------
  const recommended = RECOMMENDED;
  const [dismissed, setDismissed] = useState(false);
  const [cal, setCal] = useState({ y: 2026, m: 11, sel: null });
  const [flash, setFlash] = useState(null);
  const [survey, setSurvey] = useState({ ...SURVEY_EVENT, rating: 0, comment: '', done: false });
  const [past, setPast] = useState(() => PAST_SURVEYS.map(withKey));
  const [freshKey, setFreshKey] = useState(null);
  const [modal, setModal] = useState(null); // { kind: 'ann' } | { kind: 'survey', p }
  const modalSeq = useRef(0);

  // ---------- Banner ----------
  const dismissBanner = () => {
    toast('Banner dismissed', { ic: 'check', action: 'Undo', onAction: () => setDismissed(false) });
  };
  // "Take our survey": bring the survey card into view, ping it, focus the first star
  const goSurvey = () => {
    const card = document.getElementById('vpSurvey'); if (!card) return;
    card.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    card.classList.remove('is-target'); void card.offsetWidth; card.classList.add('is-target');
    setTimeout(() => card.querySelector('[role="radio"], button, textarea')?.focus({ preventScroll: true }), reducedMotion() ? 0 : 400);
  };

  // ---------- Modals ----------
  const openModal = (m) => setModal({ ...m, key: ++modalSeq.current });
  const closedModal = useCallback(() => setModal(null), []);

  // ---------- Calendar ----------
  const calNav = (dir) => {
    setFlash(null);
    setCal((c) => { const d = new Date(c.y, c.m + dir, 1); return { ...c, y: d.getFullYear(), m: d.getMonth() }; });
  };
  const calDay = (k) => { hideTip(); setFlash(null); setCal((c) => ({ ...c, sel: c.sel === k ? null : k })); };
  const calClear = () => { setFlash(null); setCal((c) => ({ ...c, sel: null })); };
  const findEvents = () => recsRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  const addCal = (id) => {
    const s = SHIFTS[id];
    toast(`Calendar invite for ${s.title} (${s.mon} ${s.day}) sent to ${vol.email}`, { ic: 'cal-plus' });
  };
  const confirmCancel = (id) => {
    setRegistered((r) => del(r, id));
    setFlash(null);
    SHIFTS[id].filled -= 1; emit();
    notice({
      variant: 'alert', parts: [['Registration cancelled', true], [' for ', false], [SHIFTS[id].title, true]],
      action: { label: 'Undo', onClick: () => { setRegistered((r) => add(r, id)); SHIFTS[id].filled += 1; setFlash(id); emit(); } },
    });
  };
  const cancelShift = (anchor, id) => openCancel(id, anchor, () => confirmCancel(id));

  // ---------- Recommended events ----------
  const register = (anchor, id) => {
    if (registered.has(id)) { cancelShift(anchor, id); return; }
    openRegistration(id, anchor);
  };

  // ---------- Survey ----------
  const submitSurvey = () => {
    if (!survey.rating) return;
    const entry = withKey({ event: survey.event, date: survey.date, rating: survey.rating, comment: survey.comment.trim() });
    setSurvey((s) => ({ ...s, done: true }));
    setPast((p) => [entry, ...p]);
    setFreshKey(entry.key);
    toast('Survey submitted, thank you!', { ic: 'check' });
  };

  const stat = (label, big, unit, trend) => (
    <div className="card">
      <div className="eyebrow-n">{label}</div>
      <div className="big">{big}<small>{unit}</small></div>
      <div className="trend" style={{ marginTop: 12, fontSize: 15 }}>{trend}</div>
    </div>
  );

  return (
    <div className="dash vp" id="vp" ref={vpRef}>
      <VolunteerTopNav className="vp-top-nav" onAnnouncement={() => openModal({ kind: 'ann' })} />
      <header className="dash-head"><h1 className="h1">Hi {firstName(vol.name)}, let’s see what’s going on…</h1></header>
      {!dismissed && <Banner leave={survey.done} onSurvey={goSurvey} onDismiss={dismissBanner} onGone={() => setDismissed(true)} />}
      <section className="card cal-card vp-cal" id="vpCal">
        <CalendarCard
          cal={cal} registered={registered} recommended={recommended} flash={flash}
          onNav={calNav} onDay={calDay} onClear={calClear} onFind={findEvents} onAddCal={addCal} onCancel={cancelShift}
        />
      </section>
      <RecommendedCard ref={recsRef} recommended={recommended} registered={registered} saved={saved} onSave={save} onRegister={register} />
      <div className="vp-stats">
        {stat('Total hours volunteered', vol.hours, 'hours', '+8 hours this month')}
        {stat('Total events attended', 14, 'events', '+3 this month')}
        {stat('Attendance rate', 92, '%', 'Up from 85% last quarter')}
        <div className="card vp-acts">
          <div className="eyebrow-n">Activities</div>
          <div className="vp-act" data-tip="38 hours this year"><i style={{ background: 'var(--lime)' }} />Mobile services</div>
          <div className="vp-act" data-tip="22 hours this year"><i style={{ background: 'var(--pink-light-pink)' }} />Warehouse Wednesday</div>
        </div>
      </div>
      <div className="vp-surveys">
        <SurveyCard
          survey={survey}
          onRate={(n) => setSurvey((s) => ({ ...s, rating: n }))}
          onComment={(v) => setSurvey((s) => ({ ...s, comment: v }))}
          onSubmit={submitSurvey}
        />
        <PastSurveys past={past} freshKey={freshKey} onView={(i) => openModal({ kind: 'survey', p: past[i] })} />
      </div>
      {modal && (
        <Modal key={modal.key} label={modal.kind === 'ann' ? 'Announcement' : `${modal.p.event} survey`} onClosed={closedModal}>
          {(close) => (modal.kind === 'ann' ? <AnnouncementModal close={close} /> : <SurveyModal p={modal.p} close={close} />)}
        </Modal>
      )}
    </div>
  );
}

function Portal() {
  useGlobalTooltips();
  const toast = useToast();
  const { route, params } = useRoute();
  // 'events-d' = TEST copy of Events with a D / E card switch ('events-e' opens it on E). Not linked in the nav.
  const TEST_CARDS = { 'events-d': 'd', 'events-e': 'e' };
  const active = ['events', 'profile', 'logged-out', ...Object.keys(TEST_CARDS)].includes(route) ? route : 'dashboard';
  const [registered, setRegistered] = useState(() => new Set(vol.upcoming));
  const [saved, setSaved] = useState(() => new Set());
  useEffect(() => {
    document.getElementById('main')?.scrollTo(0, 0);
    // The dashboard remains mounted to preserve survey/banner state. Refit it
    // when made visible, including direct links into the Events page.
    const frame = requestAnimationFrame(() => dispatchEvent(new Event('resize')));
    return () => cancelAnimationFrame(frame);
  }, [active]);
  const onNav = (r, label) => {
    if (r === 'dashboard' || r === 'events') { navigate(r); return; }
    toast(`${label} isn’t part of the volunteer prototype yet.`, { ic: 'info' });
  };
  return (
    <div className="route-enter">
      <RegistrationProvider {...{ registered, setRegistered }}>
      {active === 'logged-out' ? <div className="vop-exit"><section aria-labelledby="prototype-exit-title"><h1 id="prototype-exit-title">You’ve left the volunteer prototype</h1><p>This is a prototype-only exit. No authentication service is connected, so this does not sign out a real account. Changes are local to this preview and aren’t saved to an account.</p><button className="btn btn-dark" onClick={() => navigate('dashboard')}>Return to volunteer prototype</button></section></div> : <Shell route={TEST_CARDS[active] ? 'events' : active} nav={VOL_NAV} routes={['dashboard', 'events']} switchTo={{ href: MANAGER_URL, label: 'Manager view' }} onNav={onNav} showBadges={false}>
        <div hidden={active !== 'dashboard'}><Dashboard {...{ registered, setRegistered, saved, setSaved }} /></div>
        {active === 'events' && <VolunteerEvents {...{ registered, setRegistered, saved, setSaved }} eventId={params.get('id')} />}
        {TEST_CARDS[active] && <VolunteerEvents key={active} {...{ registered, setRegistered, saved, setSaved }} eventId={params.get('id')} route={active} cardStyle={TEST_CARDS[active]} />}
        {active === 'profile' && <VolunteerProfile {...{ registered, setRegistered, saved, setSaved }} />}
      </Shell>}
      </RegistrationProvider>
    </div>
  );
}

export default function VolunteerApp() {
  return (
    <ToastProvider>
      <PopProvider>
        <EventNoticeProvider><Portal /></EventNoticeProvider>
        <LiveRegion />
      </PopProvider>
    </ToastProvider>
  );
}
