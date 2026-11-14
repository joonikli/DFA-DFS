// Volunteer dashboard (Lan; Figma 1085:4706), moved out of the former volunteer portal
// (VolunteerApp.jsx). It renders in the main app's frame (src/embedded.jsx) and uses the
// main app's data and flows, so it agrees with the volunteer Events and Surveys pages:
//   events, registrations, saves, surveys → src/store/DemoStore.jsx + src/mock/events.js
//   Register / Can't make it / Save       → src/features/events/EventFlows.jsx popups
//   Award banner + "View award" popup     → component library (src/components/Banner, src/features/awards)
import { useCallback, useMemo, useRef, useState } from 'react';
import { hideTip, useFitZoom, useToast } from '../components/ui.jsx';
import { SHIFTS } from '../data.js';
import { reducedMotion } from '../lib/store.js';
import { hoursBetween } from '../lib/dates.js';
import { eventsById, volunteerHistory } from '../mock/events.js';
import { TODAY } from '../mock/today.js';
import { useDemo } from '../store/DemoStore.jsx';
import { useEventFlows } from '../features/events/EventFlows.jsx';
import AwardBanner from '../components/Banner/Banner.jsx';
import AwardPopup from '../features/awards/AwardPopup.jsx';
import VolunteerTopNav from './TopNav.jsx';
import { RECOMMENDED, firstName, surveyDate, surveyRow, vol } from './shared.js';
import { Banner } from './Banner.jsx';
import { CalendarCard } from './Calendar.jsx';
import { RecommendedCard } from './Recommended.jsx';
import { PastSurveys, SurveyCard } from './Surveys.jsx';
import { Modal } from './Modal.jsx';
import { AnnouncementModal, SurveyModal } from './Modals.jsx';

const inMonth = (e, offset) => {
  const m = new Date(TODAY.getFullYear(), TODAY.getMonth() + offset, 1);
  return e.start.getMonth() === m.getMonth() && e.start.getFullYear() === m.getFullYear();
};
const hours = (list) => list.reduce((s, e) => s + hoursBetween(e.start, e.end), 0);

export default function VolunteerDashboard() {
  const { volunteer, submitSurvey, dismissAnnouncement } = useDemo();
  const [showAward, setShowAward] = useState(false);
  const { openRegistration, openCancelRegistration, toggleSave } = useEventFlows();
  const toast = useToast();
  const vpRef = useRef(null);
  const recsRef = useRef(null);
  useFitZoom(vpRef, { designWidth: 1488, minWidth: 1000 });

  const registered = useMemo(() => new Set(volunteer.registered), [volunteer.registered]);
  const saved = useMemo(() => new Set(volunteer.saved), [volunteer.saved]);
  const attended = useMemo(() => volunteer.attended.map((id) => eventsById[id]).sort((a, b) => b.start - a.start), [volunteer.attended]);

  // ---------- Dashboard UI state (resets when you leave the page) ----------
  const [dismissed, setDismissed] = useState(false);
  const [cal, setCal] = useState({ y: TODAY.getFullYear(), m: TODAY.getMonth(), sel: null });
  const [modal, setModal] = useState(null); // { kind: 'ann' } | { kind: 'survey', p }
  const modalSeq = useRef(0);

  // ---------- Survey: the most recent attended event without a response ----------
  const [surveyId] = useState(() => attended.find((e) => !volunteer.surveyResponses[e.id])?.id ?? null);
  const [draft, setDraft] = useState({ rating: 0, comment: '' });
  const [freshKey, setFreshKey] = useState(null);
  const surveyEvent = surveyId && eventsById[surveyId];
  const answered = surveyId && volunteer.surveyResponses[surveyId];
  const survey = surveyEvent && {
    event: surveyEvent.title, date: surveyDate(surveyEvent), done: Boolean(answered),
    rating: answered ? answered.rating?.answer : draft.rating, comment: draft.comment,
  };
  const past = attended.filter((e) => volunteer.surveyResponses[e.id]).map((e) => ({ ...surveyRow(e, volunteer.surveyResponses[e.id]), key: e.id }));

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
    setCal((c) => { const d = new Date(c.y, c.m + dir, 1); return { ...c, y: d.getFullYear(), m: d.getMonth() }; });
  };
  const calDay = (k) => { hideTip(); setCal((c) => ({ ...c, sel: c.sel === k ? null : k })); };
  const calClear = () => setCal((c) => ({ ...c, sel: null }));
  const findEvents = () => recsRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  const addCal = (id) => {
    const s = SHIFTS[id];
    toast(`Calendar invite for ${s.title} (${s.mon} ${s.day}) sent to ${vol.email}`, { ic: 'cal-plus' });
  };
  const cancelShift = (_anchor, id) => openCancelRegistration(eventsById[id]);

  // ---------- Recommended events ----------
  const register = (anchor, id) => (registered.has(id) ? cancelShift(anchor, id) : openRegistration(eventsById[id]));
  const save = (id) => toggleSave(eventsById[id]);

  // ---------- Survey ----------
  const submit = () => {
    if (!survey || !draft.rating) return;
    submitSurvey(surveyId, { rating: { answer: draft.rating }, feedback: { answer: draft.comment.trim() } });
    setFreshKey(surveyId);
    toast('Survey submitted, thank you!', { ic: 'check' });
  };

  // ---------- Stats (same numbers as the volunteer Profile) ----------
  const thisMonth = attended.filter((e) => inMonth(e, 0));
  const totalHours = Math.round(hours(attended) + volunteerHistory.hoursBefore);
  const totalEvents = attended.length + volunteerHistory.eventsBefore;
  const rate = Math.round((totalEvents / (totalEvents + volunteerHistory.missedEvents)) * 100);
  const byProgram = Object.entries(attended.reduce((m, e) => ({ ...m, [e.title]: (m[e.title] || 0) + hoursBetween(e.start, e.end) }), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
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
      {/* Award banner + popup from the component library (an .app-a island: main-app styles) */}
      {!volunteer.dismissedAnnouncements.includes('award-banner') && (
        <div className="app-a">
          <AwardBanner
            type="blue"
            title="Congratulations! You’re our top 15% of volunteers for hours this year!"
            cta="View award"
            onCta={() => setShowAward(true)}
            onClose={() => dismissAnnouncement('award-banner')}
          />
        </div>
      )}
      {showAward && <AwardPopup onClose={() => setShowAward(false)} />}
      {!dismissed && survey && <Banner leave={survey.done} onSurvey={goSurvey} onDismiss={dismissBanner} onGone={() => setDismissed(true)} />}
      <section className="card cal-card vp-cal" id="vpCal">
        <CalendarCard
          cal={cal} registered={registered} recommended={RECOMMENDED} flash={null}
          onNav={calNav} onDay={calDay} onClear={calClear} onFind={findEvents} onAddCal={addCal} onCancel={cancelShift}
        />
      </section>
      <RecommendedCard ref={recsRef} recommended={RECOMMENDED} registered={registered} saved={saved} onSave={save} onRegister={register} />
      <div className="vp-stats">
        {stat('Total hours volunteered', totalHours, 'hours', `+${Math.round(hours(thisMonth))} hours this month`)}
        {stat('Total events attended', totalEvents, 'events', `+${thisMonth.length} this month`)}
        {stat('Attendance rate', rate, '%', `Up from ${volunteerHistory.attendanceRateLastMonth}% last month`)}
        <div className="card vp-acts">
          <div className="eyebrow-n">Activities</div>
          {byProgram.map(([title, h], i) => (
            <div key={title} className="vp-act" data-tip={`${Math.round(h)} hours this year`}><i style={{ background: i ? 'var(--pink-light-pink)' : 'var(--lime)' }} />{title}</div>
          ))}
        </div>
      </div>
      <div className="vp-surveys">
        {survey && (
          <SurveyCard
            survey={survey}
            onRate={(n) => setDraft((s) => ({ ...s, rating: n }))}
            onComment={(v) => setDraft((s) => ({ ...s, comment: v }))}
            onSubmit={submit}
          />
        )}
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
