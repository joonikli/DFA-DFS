// event-survey-popup (Figma 2502:41346, "Fill-A-Bag"): what a volunteer sees after "Take survey".
// Shared by both volunteer apps (index.html router app via EventFlows, volunteer.html portal), so it
// carries its own shell and `svp-` classes instead of either app's modal/field styles. Colours use the
// Figma variable names with their Figma values as fallbacks, so it renders the same under either
// token file.
//
// Question cards follow Figma "Answer question" (2263:29739): MCQ (choice), FRQ (text), Mix (choice
// with an "Other" field). `rating` is drawn in the same card for surveys that ask for stars.
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import starFilled from '../../assets/rating-star-filled.svg';
import starEmpty from '../../assets/rating-star-empty.svg';
import './SurveyPopup.css';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const EXIT_MS = 150;

function Choice({ q, value, onChange }) {
  const answer = value?.answer;
  const last = q.options[q.options.length - 1];
  return <div className="svp-answers">
    {q.options.map((opt) => <label className="svp-option" key={opt}>
      <input type="radio" name={q.id} checked={answer === opt} onChange={() => onChange({ ...value, answer: opt })} />
      {answer === opt ? <span className="svp-radio on" aria-hidden="true" /> : <img className="svp-radio" src="/assets/survey-popup/radio-empty.svg" width="21" height="21" alt="" aria-hidden="true" />}
      <span>{opt}</span>
    </label>)}
    {/* Typing a reason picks "Other" so the answer and its detail never disagree */}
    {q.other && <input className="svp-field svp-field--pill" placeholder={q.other} aria-label={q.other} value={value?.other ?? ''}
      onChange={(e) => onChange({ ...value, answer: last, other: e.target.value })} />}
  </div>;
}

function Rating({ q, value, onChange }) {
  const [hover, setHover] = useState(0);
  const lit = hover || value?.answer || 0;
  return <div className="svp-answers"><div className="svp-stars" role="radiogroup" aria-label={q.prompt} onPointerLeave={() => setHover(0)}>
    {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={value?.answer === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
      onPointerEnter={() => setHover(n)} onClick={() => onChange({ ...value, answer: n })}>
      <img src={n <= lit ? starFilled : starEmpty} width="44" height="44" alt="" />
    </button>)}
  </div></div>;
}

function Question({ q, n, value, onChange, missing }) {
  const promptId = useId();
  return <fieldset className={`svp-q ${missing ? 'missing' : ''}`} aria-labelledby={promptId} aria-invalid={missing || undefined} data-q={q.id}>
    <p className="svp-prompt" id={promptId}><span className="svp-num">Q #{n}</span><span>{q.prompt}</span></p>
    {q.type === 'choice' && <Choice q={q} value={value} onChange={onChange} />}
    {q.type === 'rating' && <Rating q={q} value={value} onChange={onChange} />}
    {q.type === 'text' && <div className="svp-answers"><textarea className="svp-field svp-field--area" rows={1} placeholder={q.placeholder ?? 'Type response here'}
      aria-labelledby={promptId} value={value?.answer ?? ''} onChange={(e) => onChange({ ...value, answer: e.target.value })} /></div>}
  </fieldset>;
}

// Header (title, description, tags), question cards and the "Please answer" check are shared by the
// popup and the inline card (SurveyInline), so both read as the same survey.
function SurveyHeader({ survey, date, titleId, children }) {
  const count = survey.questions.length;
  return <header className="svp-head">
    <div className="svp-title">
      <h2 id={titleId}>{survey.title}</h2>
      {survey.subtitle && <p>{survey.subtitle}</p>}
      <div className="svp-tags"><span>survey</span>{date && <span>{date}</span>}<span>{count} question{count === 1 ? '' : 's'}</span></div>
    </div>
    {children}
  </header>;
}

function SurveyQuestions({ survey, answers, missing, onChange }) {
  const gapQ = survey.questions.find((q) => q.id === missing);
  return <>
    <div className="svp-questions">
      {survey.questions.map((q, i) => <Question key={q.id} q={q} n={i + 1} value={answers[q.id]} missing={missing === q.id} onChange={(v) => onChange(q.id, v)} />)}
    </div>
    {gapQ && <p className="svp-error" role="alert">Please answer Q #{survey.questions.indexOf(gapQ) + 1} before submitting.</p>}
  </>;
}

// First required question left blank; brings it into view and focuses it. Returns its id or null.
function flagGap(survey, answers, root) {
  const gap = survey.questions.find((q) => q.required && !answers[q.id]?.answer);
  if (!gap) return null;
  const box = root?.querySelector(`[data-q="${gap.id}"]`);
  box?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
  box?.querySelector('input, button, textarea')?.focus({ preventScroll: true });
  return gap.id;
}

/**
 * The survey drawn inline on a page (volunteer portal's survey card): same header, questions and
 * check as the popup, no close button or Cancel. Controlled — the page owns the answers.
 * @param answers  { [questionId]: { answer, other? } }
 * @param onChange (questionId, value) => void
 * @param onSubmit () => void, called once every required question has an answer
 */
export function SurveyInline({ survey, date, answers, onChange, onSubmit, className = '' }) {
  const [missing, setMissing] = useState(null);
  const root = useRef(null);
  const titleId = useId();
  const submit = (e) => {
    e.preventDefault();
    const gap = flagGap(survey, answers, root.current);
    setMissing(gap);
    if (!gap) onSubmit();
  };
  return <form className={`svp-inline ${className}`} ref={root} onSubmit={submit} noValidate aria-labelledby={titleId}>
    <SurveyHeader survey={survey} date={date} titleId={titleId} />
    <div className="svp-inline-scroll">
      <SurveyQuestions survey={survey} answers={answers} missing={missing} onChange={(id, v) => { if (id === missing) setMissing(null); onChange(id, v); }} />
    </div>
    <div className="svp-actions svp-actions--end"><button type="submit" className="svp-btn svp-btn--dark">Submit</button></div>
  </form>;
}

/**
 * @param survey   { title, subtitle, questions: [{ id, type: 'choice'|'text'|'rating', prompt, options?, other?, required? }] }
 * @param date     tag text, MM/DD of the event (Figma "08/12")
 * @param initial  answers to start from, { [questionId]: { answer, other? } }
 * @param onSubmit (answers) => void — the popup closes itself afterwards
 */
export default function SurveyPopup({ survey, date, initial = {}, onClose, onSubmit }) {
  const [answers, setAnswers] = useState(initial);
  const [missing, setMissing] = useState(null);
  const [state, setState] = useState('closed'); // closed → open on mount, closed again while leaving
  const panel = useRef(null);
  const leaving = useRef(false);
  const titleId = useId();

  const close = (after) => {
    if (leaving.current) return;
    leaving.current = true;
    const done = () => { after?.(); onClose(); };
    if (reduced()) { done(); return; }
    setState('closed');
    setTimeout(done, EXIT_MS);
  };

  useEffect(() => {
    const opener = document.activeElement;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setState('open')));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('input, textarea, button:not(.svp-x)')?.focus({ preventScroll: true });
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = prevOverflow; opener?.focus?.({ preventScroll: true }); };
  }, []);

  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab' || !panel.current) return; // keep Tab inside the dialog
      const items = [...panel.current.querySelectorAll('button, input, textarea')].filter((el) => !el.disabled && el.offsetParent);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });

  const set = (id, v) => { setMissing((m) => (m === id ? null : m)); setAnswers((a) => ({ ...a, [id]: v })); };
  const submit = (e) => {
    e.preventDefault();
    const gap = flagGap(survey, answers, panel.current);
    setMissing(gap);
    if (!gap) close(() => onSubmit(answers));
  };

  return createPortal(
    <div className="svp" data-state={state}>
      <div className="svp-scrim" onClick={() => close()} />
      <form className="svp-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panel} onSubmit={submit} noValidate>
        <SurveyHeader survey={survey} date={date} titleId={titleId}>
          <button type="button" className="svp-x" aria-label="Close survey" onClick={() => close()}>
            <img src="/assets/survey-popup/x.svg" width="24" height="24" alt="" />
          </button>
        </SurveyHeader>
        <SurveyQuestions survey={survey} answers={answers} missing={missing} onChange={set} />
        <div className="svp-actions">
          <button type="button" className="svp-btn svp-btn--outline" onClick={() => close()}>Cancel</button>
          <button type="submit" className="svp-btn svp-btn--dark">Submit</button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
