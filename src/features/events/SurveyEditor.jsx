import { useRef, useState } from 'react';
import { Icon } from '../../components/Icon.jsx';
import EventAsset from './EventAsset.jsx';

const newQuestion = (type = 'Multiple choice') => ({ id: crypto.randomUUID(), title: '', type, options: [''] });
export const newSurvey = (title = '') => ({ title, questions: [newQuestion(), newQuestion('Free form')] });

export default function SurveyEditor({ value, onChange, eventTitle, editing, onCancel, onCreate }) {
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const dragId = useRef(null), form = useRef(null);
  const heading = editing ? 'Edit survey' : 'Create new survey';
  const update = (patch) => { onChange({ ...value, ...patch }); setError(''); };
  const updateQuestion = (id, patch) => update({ questions: value.questions.map((q) => q.id === id ? { ...q, ...patch } : q) });
  const addQuestion = () => {
    const question = newQuestion();
    update({ questions: [...value.questions, question] });
    requestAnimationFrame(() => form.current?.querySelector(`[data-question="${question.id}"] input`)?.focus());
  };
  const moveQuestion = (id, targetId) => {
    const questions = [...value.questions], from = questions.findIndex((q) => q.id === id), to = questions.findIndex((q) => q.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    questions.splice(to, 0, questions.splice(from, 1)[0]); update({ questions });
  };
  const submit = (e) => {
    e.preventDefault();
    const fail = (message, selector) => {
      setError(message); setPreview(false);
      requestAnimationFrame(() => form.current?.querySelector(selector)?.focus());
    };
    if (!value.title.trim()) { fail('Add a survey name before creating the survey.', '[name="survey-title"]'); return; }
    if (!value.questions.length) { fail('Add at least one survey question.', '.ae-survey-add'); return; }
    const incomplete = value.questions.find((q) => !q.title.trim() || (q.type === 'Multiple choice' && q.options.some((option) => !option.trim())));
    if (incomplete) { fail('Complete each question and its answer choices before creating the survey.', `[data-question="${incomplete.id}"] input`); return; }
    onCreate({ ...value, title: value.title.trim(), questions: value.questions.map((q) => ({ ...q, title: q.title.trim(), options: q.options.map((option) => option.trim()) })) });
  };
  return <form className="ae-survey-editor" ref={form} onSubmit={submit} noValidate>
    <div className="ae-survey-top">
      <header className="ae-dialog-head"><h2><EventAsset name="survey-paperclip" />{preview ? 'Survey preview' : heading}</h2><button type="button" className="icon-btn plain" aria-label="Close survey editor" onClick={onCancel}><EventAsset name="form-x" /></button></header>
    </div>
    <div className="ae-survey-body">
      {preview ? <section className="ae-survey-preview" aria-label="Survey preview">
        <h3>{value.title || 'Untitled survey'}</h3><p>{eventTitle || 'Untitled event'}</p>
        {value.questions.map((q, index) => <fieldset key={q.id}><legend>{index + 1}. {q.title || 'Untitled question'}</legend>{q.type === 'Multiple choice' ? q.options.map((option, i) => <label key={i}><input type="radio" name={`preview-${q.id}`} />{option || 'Answer choice'}</label>) : <textarea aria-label={`Preview response to question ${index + 1}`} placeholder="Type response here" />}</fieldset>)}
      </section> : <>
        <label className="ae-survey-label"><span>Assign event <b>*</b></span><span className="ae-survey-event"><select aria-label="Assign event" defaultValue="current"><option value="current">{eventTitle || 'Untitled event'}</option></select><EventAsset name="survey-event-chevron" /></span></label>
        <label className="ae-survey-label"><span>Survey name <b>*</b></span><input name="survey-title" required placeholder="Survey title here" value={value.title} onChange={(e) => update({ title: e.target.value })} /></label>
        <section className="ae-survey-questions" aria-label="Survey questions"><h3>Survey questions</h3>
          {value.questions.map((q, index) => <div className="ae-survey-question" key={q.id} data-question={q.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (dragId.current) moveQuestion(dragId.current, q.id); dragId.current = null; }}>
            <div className="ae-question-heading">
              <button type="button" className="ae-question-grip" draggable aria-label={`Reorder question ${index + 1}`} title="Drag to reorder, or use the Up and Down arrow keys" onDragStart={(e) => { dragId.current = q.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', q.id); }} onDragEnd={() => { dragId.current = null; }} onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); const target = value.questions[index + (e.key === 'ArrowUp' ? -1 : 1)]; if (target) moveQuestion(q.id, target.id); } }}><EventAsset name="survey-grip" /></button>
              <span>Q #{index + 1}</span><div className="ae-question-title"><input aria-label={`Question ${index + 1}`} placeholder="Type in question here" value={q.title} onChange={(e) => updateQuestion(q.id, { title: e.target.value })} /><button type="button" className="icon-btn plain" aria-label={`Remove question ${index + 1}`} onClick={() => { update({ questions: value.questions.filter((item) => item.id !== q.id) }); requestAnimationFrame(() => form.current?.querySelector('.ae-survey-add')?.focus()); }}><Icon name="x" size={16} /></button></div>
            </div>
            {q.type === 'Multiple choice' ? <div className="ae-question-options">
              {q.options.map((option, i) => <div className="ae-question-option" key={i}><i aria-hidden="true" /><input aria-label={`Question ${index + 1}, answer choice ${i + 1}`} placeholder="This is an example sentence" value={option} onChange={(e) => updateQuestion(q.id, { options: q.options.map((item, j) => j === i ? e.target.value : item) })} />{q.options.length > 1 && <button type="button" aria-label={`Remove answer choice ${i + 1} from question ${index + 1}`} onClick={() => updateQuestion(q.id, { options: q.options.filter((_, j) => j !== i) })}><Icon name="x" size={16} /></button>}{i === q.options.length - 1 && <button type="button" className="ae-option-add" aria-label="Add answer choice" title="Add answer choice" onClick={() => { updateQuestion(q.id, { options: [...q.options, ''] }); requestAnimationFrame(() => form.current?.querySelector(`[data-question="${q.id}"] .ae-question-option:last-of-type input`)?.focus()); }}><Icon name="plus" size={16} /></button>}</div>)}
              <button type="button" className="ae-survey-add" onClick={addQuestion}><Icon name="plus" size={24} />Add a question</button>
            </div> : <textarea className="ae-free-response" aria-label={`Free-form response preview for question ${index + 1}`} placeholder="Type response here" readOnly />}
            <label className="ae-question-type"><span className="sr">Question {index + 1} type</span><select aria-label={`Question ${index + 1} type`} value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value })}><option>Multiple choice</option><option>Free form</option></select><EventAsset name="form-chevron-down" /></label>
          </div>)}
          {!value.questions.some((q) => q.type === 'Multiple choice') && <button type="button" className="ae-survey-add" onClick={addQuestion}><Icon name="plus" size={24} />Add a question</button>}
        </section>
      </>}
    </div>
    <footer className="ae-survey-footer">
      {error && <p className="ae-form-error" role="alert">{error}</p>}
      <div><button type="button" className="btn btn-purple-outline" onClick={onCancel}>Cancel</button><span /><button type="button" className="btn ae-preview-button" onClick={() => setPreview((v) => !v)}>{preview ? 'Back to editing' : 'Preview'}</button><button type="submit" className="btn btn-dark">{editing ? 'Save survey' : 'Create survey'}</button></div>
    </footer>
  </form>;
}
