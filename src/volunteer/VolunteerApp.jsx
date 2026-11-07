// Volunteer portal (Maureen Kelly) — Figma 1085:4706. Port of the vanilla volunteer.js.
// Shares data.js with the manager app, so the same shifts, announcements and people appear in both.
import { useCallback, useRef, useState } from 'react';
import { LiveRegion, PopProvider, ToastProvider, hideTip, useFitZoom, useGlobalTooltips, usePop, useToast } from '../components/ui.jsx';
import { Shell } from '../components/Shell.jsx';
import { SHIFTS } from '../data.js';
import { emit, reducedMotion, useStore } from '../lib/store.js';
import { MANAGER_URL } from '../lib/router.js';
import { PAST_SURVEYS, RECOMMENDED, SURVEY_EVENT, VOL_NAV, firstName, vol } from './shared.js';
import { Banner } from './Banner.jsx';
import { CalendarCard, CancelConfirm } from './Calendar.jsx';
import { RecommendedCard } from './Recommended.jsx';
import { PastSurveys, SurveyCard } from './Surveys.jsx';
import { Modal } from './Modal.jsx';
import { AnnouncementModal, SurveyModal } from './Modals.jsx';

let pastSeq = 0;
const withKey = (p) => ({ ...p, key: ++pastSeq });
const add = (set, id) => new Set(set).add(id);
const del = (set, id) => { const n = new Set(set); n.delete(id); return n; };

function Dashboard() {
  useStore();
  const toast = useToast();
  const pop = usePop();
  const vpRef = useRef(null);
  const recsRef = useRef(null);
  useFitZoom(vpRef, { designWidth: 1488, minWidth: 1000 });

  // ---------- Volunteer-side state (resets on reload) ----------
  const [registered, setRegistered] = useState(() => new Set(vol.upcoming)); // shifts Maureen signed up for
  const [saved, setSaved] = useState(() => new Set());
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
    toast('Announcement dismissed', { ic: 'check', action: 'Undo', onAction: () => setDismissed(false) });
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
    toast(`You’ve cancelled ${SHIFTS[id].title}`, {
      ic: 'check', action: 'Undo',
      onAction: () => { setRegistered((r) => add(r, id)); SHIFTS[id].filled += 1; setFlash(id); emit(); },
    });
  };
  const cancelShift = (anchor, id) => pop.toggle(anchor, <CancelConfirm id={id} onConfirm={confirmCancel} />, { align: 'end' });

  // ---------- Recommended events ----------
  const save = (id) => { hideTip(); setSaved((s) => (s.has(id) ? del(s, id) : add(s, id))); };
  const register = (anchor, id) => {
    const s = SHIFTS[id];
    if (registered.has(id)) { cancelShift(anchor, id); return; }
    setRegistered((r) => add(r, id)); s.filled += 1; setFlash(id); emit();
    toast(`You’re registered for ${s.title} on ${s.mon} ${s.day}`, {
      ic: 'check', action: 'Undo',
      onAction: () => { setRegistered((r) => del(r, id)); s.filled -= 1; emit(); },
    });
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
      <header className="dash-head"><h1 className="h1">Hi {firstName(vol.name)}, let’s see what’s going on…</h1></header>
      {!dismissed && <Banner onRead={() => openModal({ kind: 'ann' })} onDismiss={dismissBanner} onGone={() => setDismissed(true)} />}
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
          <div className="vp-act" data-tip="22 hours this year"><i style={{ background: '#ffdcee' }} />Warehouse Wednesday</div>
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
  // Vanilla: non-dashboard items show a "not part of the prototype" toast
  const onNav = (r, label) => {
    if (r === 'dashboard') return;
    toast(`${label} isn’t part of the volunteer prototype yet.`, { ic: 'info' });
  };
  return (
    <div className="route-enter">
      <Shell route="dashboard" nav={VOL_NAV} routes={['dashboard']} switchTo={{ href: MANAGER_URL, label: 'Manager view' }} onNav={onNav} showBadges={false}>
        <Dashboard />
      </Shell>
    </div>
  );
}

export default function VolunteerApp() {
  return (
    <ToastProvider>
      <PopProvider>
        <Portal />
        <LiveRegion />
      </PopProvider>
    </ToastProvider>
  );
}
