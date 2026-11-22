import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon.jsx';
import { Modal } from '../../volunteer/Modal.jsx';
import { EVENT_TODAY, dateLabel, parseDate, timeLabel } from './eventData.js';
import EventAsset from './EventAsset.jsx';
import SurveyEditor, { newSurvey } from './SurveyEditor.jsx';
import EventPreview from './EventPreview.jsx';
import SurveyRemoveButton from '../../components/SurveyRemoveButton.jsx';
import EditButton from '../../components/EditButton/EditButton.jsx';
import useSurveyTransition from '../../lib/useSurveyTransition.js';
import { PERSONAS, useDemo } from '../../store/DemoStore.jsx';
export { default as EventAsset } from './EventAsset.jsx';

export function EventDialog({ label, onClosed, children, className = '', transitionName, onRequestClose }) {
  const opener = useRef(document.activeElement);
  useEffect(() => () => { opener.current?.isConnected && opener.current.focus({ preventScroll: true }); }, []);
  const trapFocus = (e) => {
    if (e.key !== 'Tab') return;
    const controls = [...e.currentTarget.querySelectorAll('button:not(:disabled), input, select, textarea, a[href], [tabindex="0"]')].filter((el) => el.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  return <Modal label={label} onClosed={onClosed} transitionName={transitionName} onRequestClose={onRequestClose}>{(close) => <div className={`ae-dialog ${className}`} onKeyDown={trapFocus}>{children(close)}</div>}</Modal>;
}

export default function EventEditor({ event, draft, defaultDate, onSave, onClosed, startSurvey = false }) {
  const { profiles } = useDemo();
  const adminName = profiles.admin?.fullName || PERSONAS.admin.fullName;
  const initial = draft || event || {};
  const [form, setForm] = useState({ title: initial.detailTitle || initial.title || '', date: initial.date ?? defaultDate ?? EVENT_TODAY, start: initial.start ?? '13:00', end: initial.end ?? '15:00', address: initial.address || '', organizer: initial.organizer ?? adminName, type: initial.type || '', tags: draft ? initial.tags ?? '' : initial.tagText ?? 'Clothes, Organizing', description: initial.longDescription ?? initial.description ?? '', survey: initial.survey || '' });
  const [preview, setPreview] = useState(false);
  const [addOrganizer, setAddOrganizer] = useState(false);
  const [editTags, setEditTags] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(startSurvey);
  const [surveyDraft, setSurveyDraft] = useState(() => initial.surveyDefinition || newSurvey(initial.survey || ''));
  const [surveyDefinition, setSurveyDefinition] = useState(initial.surveyDefinition || null);
  const [error, setError] = useState('');
  const transitionSurvey = useSurveyTransition();
  const openSurvey = () => transitionSurvey(() => setSurveyOpen(true), 'forward');
  const returnToEvent = (instant = false) => transitionSurvey(() => { setSurveyDraft(surveyDefinition || newSurvey()); setSurveyOpen(false); }, 'back', instant);
  const addSurveyButton = useRef(null);
  const removeSurvey = () => {
    setForm((value) => ({ ...value, survey: '' }));
    setSurveyDefinition(null);
    setSurveyDraft(newSurvey());
    requestAnimationFrame(() => addSurveyButton.current?.focus());
  };
  const field = (key) => ({ value: form[key], onChange: (e) => { setForm((v) => ({ ...v, [key]: e.target.value })); setError(''); } });
  const create = (close) => {
    if (!form.title.trim() || !form.address.trim()) { setPreview(false); setError('Add an event title and location before creating the event.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || !Number.isFinite(parseDate(form.date).getTime())) { setPreview(false); setError('Add a valid event date before creating the event.'); return; }
    if (!form.start || !form.end) { setPreview(false); setError('Add both a start time and end time before creating the event.'); return; }
    if (form.end <= form.start) { setError('End time must be after the start time.'); return; }
    onSave({ ...form, surveyDefinition }, false); close(true);
  };
  const editorLabel = event ? 'Edit event' : 'Create event';
  return <EventDialog transitionName="event-survey-step" label={surveyOpen ? (form.survey ? 'Edit survey' : 'Create survey') : preview ? 'Event preview' : editorLabel} className={surveyOpen ? 'ae-survey-dialog' : preview ? 'ae-event-preview-dialog' : ''} onClosed={onClosed} onRequestClose={surveyOpen ? returnToEvent : undefined}>{(close) => surveyOpen ? <SurveyEditor value={surveyDraft} onChange={setSurveyDraft} eventTitle={form.title} editing={Boolean(form.survey)} onCancel={() => returnToEvent()} onCreate={(survey) => transitionSurvey(() => { setSurveyDefinition(survey); setSurveyDraft(survey); setForm((v) => ({ ...v, survey: survey.title })); setSurveyOpen(false); }, 'back')} /> : <form className={preview ? 'ae-event-preview-form' : 'ae-editor'} onSubmit={(e) => { e.preventDefault(); create(close); }}>
    {preview ? <EventPreview title={form.title} type={form.type} description={form.description} organizer={`${form.organizer}${form.organizer === adminName ? ' (Me)' : ''}`} date={form.date ? dateLabel(form.date) : ''} time={form.start && form.end ? `${timeLabel(form.start)} - ${timeLabel(form.end)}` : ''} location={form.address} tags={form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)} hasSurvey={Boolean(form.survey)} onViewSurvey={openSurvey} onClose={() => setPreview(false)} onSaveDraft={() => { onSave({ ...form, surveyDefinition }, true); close(true); }} onCreate={() => create(close)} createLabel={event ? 'Save changes' : 'Create event'} error={error} /> : <>
    <header className="ae-dialog-head"><h2>{event ? 'Edit event' : 'Create event'}</h2><button className="icon-btn plain" type="button" aria-label="Close event editor" onClick={() => close()}><EventAsset name="form-x" /></button></header>
      <label className="ae-form-label">Title<input required placeholder="Event title" autoComplete="off" {...field('title')} /></label>
      <div className="ae-form-logistics">
        <div><label className="ae-form-label">Organizer{addOrganizer ? <input aria-label="Organizers" {...field('organizer')} /> : <span className="ae-chip-field"><span className="ae-form-chip">{form.organizer}</span></span>}</label><button className="btn btn-purple-outline" type="button" onClick={() => setAddOrganizer((v) => !v)}>{addOrganizer ? 'Done' : 'Add another organizer'}<Icon name={addOrganizer ? 'check' : 'plus'} size={16} /></button></div>
        <label className="ae-form-label"><span><EventAsset name="form-calendar" />Date</span><input required type="date" {...field('date')} /></label>
        <div className="ae-form-label"><span><EventAsset name="form-clock" />Time</span><div className="ae-time-fields"><input aria-label="Start time" required type="time" {...field('start')} /><span>–</span><input aria-label="End time" required type="time" {...field('end')} /></div></div>
      </div>
      <div className="ae-form-pair"><label className="ae-form-label"><span><EventAsset name="form-map-pin" />Location</span><input required placeholder="Add location" {...field('address')} /></label><label className="ae-form-label"><span><EventAsset name="form-calendar-sync" />Event type</span><select {...field('type')}><option value="">Choose event type</option>{[...new Set([form.type, 'Warehouse Wednesday', 'Mobile Shop', 'Clothing Distribution', 'Other'].filter(Boolean))].map((type) => <option key={type}>{type}</option>)}</select></label></div>
      <div className="ae-form-label ae-tags-field"><span><EventAsset name="form-tags" />Tags</span><button className="ae-tags-control" type="button" aria-label="Edit event tags" aria-expanded={editTags} onClick={() => setEditTags((v) => !v)}><span>{form.tags.split(',').filter((tag) => tag.trim()).map((tag, index) => <span key={index} className="ae-form-chip">{tag.trim()}</span>)}</span><EventAsset name="form-chevron-down" /></button>{editTags && <input aria-label="Event tags" placeholder="Separate tags with commas" {...field('tags')} />}</div>
      <label className="ae-form-label">Description<textarea rows="7" placeholder="Write event description" {...field('description')} /></label>
      {form.survey ? <div className="ae-attached-survey survey-attachment"><span><Icon name="nav-file-pen" size={20} /><span><small>Survey</small><b>{form.survey}</b></span></span><div className="ae-attached-survey-actions"><EditButton data-survey-return aria-label="Edit survey" onClick={openSurvey} /><SurveyRemoveButton onRemove={removeSurvey} /></div></div> : <button ref={addSurveyButton} data-survey-return type="button" className="btn btn-purple-outline ae-add-survey" onClick={openSurvey}>Add survey <Icon name="plus" size={16} /></button>}
    {error && <p className="ae-form-error" role="alert">{error}</p>}
    <footer className="ae-editor-footer"><button type="button" className="btn btn-purple-outline" onClick={() => { onSave({ ...form, surveyDefinition }, true); close(true); }}>Save draft</button><span /><button type="button" className="btn ae-preview-button" onClick={() => setPreview((v) => !v)}>{preview ? 'Edit' : 'Preview'}</button><button className="btn btn-dark" type="submit">{event ? 'Save changes' : 'Create event'}</button></footer>
    </>}
  </form>}</EventDialog>;
}
