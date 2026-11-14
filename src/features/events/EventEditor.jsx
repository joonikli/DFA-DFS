import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon.jsx';
import { Modal } from '../../volunteer/Modal.jsx';
import { EVENT_TODAY, dateLabel, timeLabel } from './eventData.js';
import EventAsset from './EventAsset.jsx';
import SurveyEditor, { newSurvey } from './SurveyEditor.jsx';
export { default as EventAsset } from './EventAsset.jsx';

export function EventDialog({ label, onClosed, children, className = '' }) {
  const opener = useRef(document.activeElement);
  useEffect(() => () => { opener.current?.isConnected && opener.current.focus({ preventScroll: true }); }, []);
  const trapFocus = (e) => {
    if (e.key !== 'Tab') return;
    const controls = [...e.currentTarget.querySelectorAll('button:not(:disabled), input, select, textarea, a[href], [tabindex="0"]')].filter((el) => el.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  return <Modal label={label} onClosed={onClosed}>{(close) => <div className={`ae-dialog ${className}`} onKeyDown={trapFocus}>{children(close)}</div>}</Modal>;
}

export default function EventEditor({ event, draft, defaultDate, onSave, onClosed, startSurvey = false }) {
  const initial = draft || event || {};
  const [form, setForm] = useState({ title: initial.detailTitle || initial.title || '', date: initial.date ?? defaultDate ?? EVENT_TODAY, start: initial.start ?? '13:00', end: initial.end ?? '15:00', address: initial.address || '', organizer: initial.organizer ?? 'John Doe', type: initial.type || '', tags: draft ? initial.tags ?? '' : initial.tagText ?? 'Clothes, Organizing', description: initial.longDescription ?? initial.description ?? '', survey: initial.survey || '' });
  const [preview, setPreview] = useState(false);
  const [addOrganizer, setAddOrganizer] = useState(false);
  const [editTags, setEditTags] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(startSurvey);
  const [surveyDraft, setSurveyDraft] = useState(() => initial.surveyDefinition || newSurvey(initial.survey || ''));
  const [surveyDefinition, setSurveyDefinition] = useState(initial.surveyDefinition || null);
  const [error, setError] = useState('');
  const field = (key) => ({ value: form[key], onChange: (e) => { setForm((v) => ({ ...v, [key]: e.target.value })); setError(''); } });
  const submit = (close) => (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.address.trim()) { setPreview(false); setError('Add an event title and location before creating the event.'); return; }
    if (form.end <= form.start) { setError('End time must be after the start time.'); return; }
    onSave({ ...form, surveyDefinition }, false); close(true);
  };
  const editorLabel = event ? 'Edit event' : 'Create event';
  return <EventDialog key={surveyOpen ? 'survey' : 'event'} label={surveyOpen ? (form.survey ? 'Edit survey' : 'Create new survey') : editorLabel} className={surveyOpen ? 'ae-survey-dialog' : ''} onClosed={surveyOpen ? () => setSurveyOpen(false) : onClosed}>{(close) => surveyOpen ? <SurveyEditor value={surveyDraft} onChange={setSurveyDraft} eventTitle={form.title} editing={Boolean(form.survey)} onCancel={() => close()} onCreate={(survey) => { setSurveyDefinition(survey); setSurveyDraft(survey); setForm((v) => ({ ...v, survey: survey.title })); setSurveyOpen(false); }} /> : <form className="ae-editor" onSubmit={submit(close)}>
    <header className="ae-dialog-head"><h2>{event ? 'Edit event' : 'Create event'}</h2><button className="icon-btn plain" type="button" aria-label="Close event editor" onClick={() => close()}><EventAsset name="form-x" /></button></header>
    {preview ? <section className="ae-preview"><span className="eyebrow">Event preview</span><h2>{form.title || 'Untitled event'}</h2><p>{dateLabel(form.date)} · {timeLabel(form.start)} – {timeLabel(form.end)}</p><p>{form.address || 'Location to be added'}</p><p>{form.description || 'Description to be added'}</p><button className="btn btn-outline" type="button" onClick={() => setPreview(false)}>Back to editing</button></section> : <>
      <label className="ae-form-label">Title<input required placeholder="Event title" autoComplete="off" {...field('title')} /></label>
      <div className="ae-form-logistics">
        <div><label className="ae-form-label">Organizer{addOrganizer ? <input aria-label="Organizers" {...field('organizer')} /> : <span className="ae-chip-field"><span className="ae-form-chip">{form.organizer}</span></span>}</label><button className="btn btn-purple-outline" type="button" onClick={() => setAddOrganizer((v) => !v)}>{addOrganizer ? 'Done' : 'Add another organizer'}<Icon name={addOrganizer ? 'check' : 'plus'} size={16} /></button></div>
        <label className="ae-form-label"><span><EventAsset name="form-calendar" />Date</span><input required type="date" {...field('date')} /></label>
        <div className="ae-form-label"><span><EventAsset name="form-clock" />Time</span><div className="ae-time-fields"><input aria-label="Start time" required type="time" {...field('start')} /><span>—</span><input aria-label="End time" required type="time" {...field('end')} /></div></div>
      </div>
      <div className="ae-form-pair"><label className="ae-form-label"><span><EventAsset name="form-map-pin" />Location</span><input required placeholder="Add location" {...field('address')} /></label><label className="ae-form-label"><span><EventAsset name="form-calendar-sync" />Event type</span><select {...field('type')}><option value="">Choose event type</option>{[...new Set([form.type, 'Warehouse Wednesday', 'Mobile Shop', 'Clothing Distribution', 'Other'].filter(Boolean))].map((type) => <option key={type}>{type}</option>)}</select></label></div>
      <div className="ae-form-label ae-tags-field"><span><EventAsset name="form-tags" />Tags</span><button className="ae-tags-control" type="button" aria-label="Edit event tags" aria-expanded={editTags} onClick={() => setEditTags((v) => !v)}><span>{form.tags.split(',').filter((tag) => tag.trim()).map((tag, index) => <span key={index} className="ae-form-chip">{tag.trim()}</span>)}</span><EventAsset name="form-chevron-down" /></button>{editTags && <input aria-label="Event tags" placeholder="Separate tags with commas" {...field('tags')} />}</div>
      <label className="ae-form-label">Description<textarea rows="7" placeholder="Write event description" {...field('description')} /></label>
      {form.survey ? <div className="ae-attached-survey"><span><Icon name="nav-file-pen" size={20} /><span><small>Survey</small><b>{form.survey}</b></span></span><button type="button" className="btn btn-purple-outline" onClick={() => setSurveyOpen(true)}>Edit survey<Icon name="pen" size={16} /></button></div> : <button type="button" className="btn btn-purple-outline ae-add-survey" onClick={() => setSurveyOpen(true)}>Add survey <Icon name="plus" size={16} /></button>}
    </>}
    {error && <p className="ae-form-error" role="alert">{error}</p>}
    <footer className="ae-editor-footer"><button type="button" className="btn btn-purple-outline" onClick={() => { onSave({ ...form, surveyDefinition }, true); close(true); }}>Save draft</button><span /><button type="button" className="btn ae-preview-button" onClick={() => setPreview((v) => !v)}>{preview ? 'Edit' : 'Preview'}</button><button className="btn btn-dark" type="submit">{event ? 'Save changes' : 'Create event'}</button></footer>
  </form>}</EventDialog>;
}
