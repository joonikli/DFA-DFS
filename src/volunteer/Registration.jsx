import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { SHIFTS } from '../data.js';
import { emit } from '../lib/store.js';
import { useRoute } from '../lib/router.js';
import { hideTip, usePop, useToast } from '../components/ui.jsx';
import EventAsset from '../features/events/EventAsset.jsx';
import { Modal } from './Modal.jsx';
import { eventDate, volunteerEvents } from './eventData.js';
import { shiftTimes } from './calendarExport.js';
import { vol } from './shared.js';
import { useEventNotice } from './EventNotice.jsx';
import './registration.css';

const RegistrationContext = createContext(null);
export const useRegistration = () => useContext(RegistrationContext);
const minutes = time => { const [hour, minute] = time.split(':').map(Number); return hour * 60 + minute; };
const inputTime = time => `${time.slice(0, 2)}:${time.slice(2, 4)}`;
export function registrationTime(record, fallback) {
  if (!record) return fallback;
  const label = value => { const [hour, minute] = value.split(':').map(Number); return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`; };
  return `${label(record.start)}–${label(record.end)}`;
}

function RegistrationForm({ event, initial, editing, onSubmit, close }) {
  const window = shiftTimes(event.time);
  const earliest = inputTime(window.start), latest = inputTime(window.end);
  const [values, setValues] = useState(() => initial || { start: earliest, end: latest, contact: 'phone', notes: '', notify: false });
  const [error, setError] = useState('');
  const form = useRef(null);
  const update = (key, value) => { setValues(current => ({ ...current, [key]: value })); setError(''); };
  const submit = e => {
    e.preventDefault();
    if (!values.start || !values.end || minutes(values.start) >= minutes(values.end) || minutes(values.start) < minutes(earliest) || minutes(values.end) > minutes(latest)) {
      setError('Choose a start and end time within the event hours. End time must be after start time.');
      form.current.elements.start.focus(); return;
    }
    const problem = onSubmit({ ...values, notes: values.notes.trim() });
    if (problem) { setError(problem); return; }
    close(true);
  };
  return <form className="vr-dialog" ref={form} onSubmit={submit} noValidate onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const controls = [...form.current.querySelectorAll('button:not(:disabled), input:not([readonly]), select, textarea')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }}>
    <header className="vr-header"><div><h2>{event.title} Registration</h2><button type="button" aria-label="Close registration" onClick={() => close()}><EventAsset name="registration-close" /></button></div>
      <p>{editing ? 'Updating registration for event on ' : 'Registering for event on '}<strong>{eventDate(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, {event.time}</strong> at <strong>{event.addr}.</strong></p>
    </header>
    <div className="vr-fields">
      <div className="vr-pair"><label className="vr-field">Name<output className="vr-input" aria-label="Volunteer name">{vol.name}</output></label>
        <label className="vr-field">Preferred Contact<span className="vr-select"><select aria-label="Preferred Contact" value={values.contact} onChange={e => update('contact', e.target.value)}><option value="phone">Phone ({vol.phone})</option><option value="email">Email ({vol.email})</option></select><EventAsset name="registration-chevron" /></span></label>
      </div>
      <fieldset className="vr-availability"><legend>What time will you be available out of <b>{event.time}</b>? You can change this at any time.<span className="vr-required" aria-hidden="true">*</span></legend>
        <div className="vr-times">{['start', 'end'].map((key, index) => <span className="vr-time-pair" key={key}>{index === 1 && <EventAsset name="registration-separator" />}<label className="vr-time"><span className="sr">Availability {key} time</span><input type="time" name={key} aria-label={`Availability ${key} time`} required min={earliest} max={latest} step="60" value={values[key]} onChange={e => update(key, e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'vr-error' : undefined} /></label></span>)}</div>
      </fieldset>
      <label className="vr-question"><span>Any notes?</span><textarea aria-label="Any notes?" rows="1" value={values.notes} onChange={e => update('notes', e.target.value)} /></label>
      <fieldset className="vr-notify"><legend>Notify me of future events like this.</legend><label><input type="checkbox" checked={values.notify} onChange={e => update('notify', e.target.checked)} />Yes</label></fieldset>
    </div>
    {error && <p className="vr-error" id="vr-error" role="alert">{error}</p>}
    <footer><button type="button" className="btn vr-cancel" onClick={() => close()}>Cancel</button><button type="submit" className="btn btn-dark">{editing ? 'Save changes' : 'Register'}</button></footer>
  </form>;
}

// Cancel-registration / unsave confirms. No Figma frame for them, so they reuse the
// registration popup's shell, header and footer (light "keep" button left, dark action right).
// The close (×) is marked close-modal so Modal focuses the "Keep …" button first.
const CONFIRM_COPY = {
  cancel: { title: 'Cancel your registration?', lead: 'You’re registered for ', note: 'Your spot will open up for another volunteer. You can register again while spots are available.', keep: 'Keep registration', act: 'Cancel registration', label: 'Cancel registration for' },
  unsave: { title: 'Remove from saved?', lead: '', note: 'It will no longer appear in your Saved events. You can save it again anytime.', keep: 'Keep saved', act: 'Remove from saved', label: 'Remove from saved:' },
};
function ConfirmForm({ kind, event, onConfirm, close }) {
  const copy = CONFIRM_COPY[kind];
  const box = useRef(null);
  return <div className="vr-dialog vr-confirm" ref={box} onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const controls = [...box.current.querySelectorAll('button')];
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }}>
    <header className="vr-header"><div><h2>{copy.title}</h2><button type="button" data-act="close-modal" aria-label="Close" onClick={() => close()}><EventAsset name="registration-close" /></button></div>
      <p>{copy.lead}<strong>{event.title}</strong> on <strong>{eventDate(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, {event.time}</strong>.</p>
    </header>
    <p className="vr-confirm-note">{copy.note}</p>
    <footer><button type="button" className="btn vr-cancel" onClick={() => close()}>{copy.keep}</button><button type="button" className="btn btn-dark" onClick={() => { onConfirm(); close(); }}>{copy.act}</button></footer>
  </div>;
}

export function RegistrationProvider({ registered, setRegistered, children }) {
  const toast = useToast(), notice = useEventNotice(), pop = usePop(), { hash } = useRoute();
  const [records, setRecords] = useState({}), [pending, setPending] = useState(null);
  const registeredRef = useRef(registered); registeredRef.current = registered;
  const background = useRef(null), previousHash = useRef(hash);
  useEffect(() => {
    if (previousHash.current !== hash) { previousHash.current = hash; setPending(null); }
  }, [hash]);
  useEffect(() => {
    if (!pending) return;
    const main = document.getElementById('main'), previousOverflow = main?.style.overflow;
    background.current.inert = true;
    if (main) main.style.overflow = 'hidden';
    return () => {
      if (background.current) background.current.inert = false;
      if (main) main.style.overflow = previousOverflow;
      if (pending.anchor?.isConnected && pending.anchor.getClientRects().length) pending.anchor.focus({ preventScroll: true });
      else {
        const detail = main?.querySelector('.ve-detail');
        if (detail?.dataset.eventId === pending.id) detail.querySelector('.ae-detail-heading .ve-register')?.focus({ preventScroll: true });
      }
    };
  }, [pending]);
  const openRegistration = (id, anchor) => {
    const event = SHIFTS[id];
    if (!event || (!registeredRef.current.has(id) && event.filled >= event.cap)) { toast('This event is full.', { ic: 'info' }); return; }
    pop.close(null, true); hideTip();
    setPending({ id, anchor, editing: registeredRef.current.has(id) });
  };
  // onConfirm performs the cancellation (and its notification); this only asks first.
  const openCancel = (id, anchor, onConfirm) => {
    if (!SHIFTS[id] || !registeredRef.current.has(id)) return;
    pop.close(null, true); hideTip();
    setPending({ id, anchor, confirm: { kind: 'cancel', onConfirm } });
  };
  // Same popup, asking before an event is removed from Saved.
  const openUnsave = (id, anchor, onConfirm) => {
    if (!SHIFTS[id]) return;
    pop.close(null, true); hideTip();
    setPending({ id, anchor, confirm: { kind: 'unsave', onConfirm } });
  };
  const event = pending && volunteerEvents().find(item => item.id === pending.id);
  const finish = values => {
    const id = pending.id, shift = SHIFTS[id];
    if (registeredRef.current.has(id) !== pending.editing) return 'Your registration changed. Close this form and try again.';
    if (!pending.editing && shift.filled >= shift.cap) return 'This event is now full. No spot has been reserved.';
    const previous = records[id];
    setRecords(current => ({ ...current, [id]: values }));
    if (pending.editing) { notice({ variant: 'success', parts: [['Registration updated', true]], preview: `${shift.title} on ${shift.mon} ${shift.day}` }); return null; }
    registeredRef.current = new Set(registeredRef.current).add(id);
    setRegistered(registeredRef.current); shift.filled += 1; emit();
    notice({ variant: 'success', parts: [['Registered!', true]], preview: `${shift.title} is now in your Registered events.`, action: { label: 'Undo', onClick: () => {
      if (!registeredRef.current.has(id)) return;
      const next = new Set(registeredRef.current); next.delete(id); registeredRef.current = next;
      setRegistered(next); shift.filled = Math.max(0, shift.filled - 1); emit();
      setRecords(current => { const result = { ...current }; if (previous) result[id] = previous; else delete result[id]; return result; });
    } } });
    return null;
  };
  return <RegistrationContext.Provider value={{ records, openRegistration, openCancel, openUnsave }}><div ref={background}>{children}</div>
    {event && pending.confirm && <Modal key={`${pending.confirm.kind}-${event.id}`} label={`${CONFIRM_COPY[pending.confirm.kind].label} ${event.title}`} onClosed={() => setPending(null)}>{close => <ConfirmForm kind={pending.confirm.kind} event={event} onConfirm={pending.confirm.onConfirm} close={close} />}</Modal>}
    {event && !pending.confirm && <Modal key={event.id} label={`${event.title} Registration`} onClosed={() => setPending(null)}>{close => <RegistrationForm event={event} initial={records[event.id]} editing={pending.editing} onSubmit={finish} close={close} />}</Modal>}
  </RegistrationContext.Provider>;
}
