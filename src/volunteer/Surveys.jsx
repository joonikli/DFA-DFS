// Survey card (star rating w/ hover preview, comment, thank-you state) + past surveys list
import { useState } from 'react';
import { Icon } from '../components/Icon.jsx';
import { firstName, vol } from './shared.js';

const N = [1, 2, 3, 4, 5];

export function StaticStars({ rating, size }) {
  return (
    <div className="vp-stars static" aria-label={`${rating} out of 5`}>
      {N.map((n) => <span key={n} className={n <= rating ? 'on' : ''}><Icon name="star" size={size} sw={1.5} /></span>)}
    </div>
  );
}

export function SurveyCard({ survey, onRate, onComment, onSubmit }) {
  const [hover, setHover] = useState(0);
  const S = survey;
  if (S.done) {
    return (
      <section className="card vp-survey-card" id="vpSurvey">
        <div className="vp-survey-done">
          <div className="cmp-icon"><Icon name="check" size={22} /></div>
          <h3>Thanks, {firstName(vol.name)}!</h3>
          <p>You rated {S.event} {S.rating} out of 5. Bridget’s team reads every response.</p>
          <StaticStars rating={S.rating} size={22} />
        </div>
      </section>
    );
  }
  const lit = hover || S.rating;
  const submit = (e) => { e.preventDefault(); if (S.rating) onSubmit(); };
  return (
    <section className="card vp-survey-card" id="vpSurvey">
      <div className="eyebrow-n" style={{ marginBottom: 4 }}>Survey</div>
      <h2 className="h2">How was {S.event}?</h2>
      <div className="vp-muted">{S.date}</div>
      <form className="vp-survey" data-form="survey" onSubmit={submit}>
        <label className="vp-q">What would you rate this event?</label>
        <div
          className="vp-stars"
          role="radiogroup"
          aria-label="Rating"
          onPointerOut={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHover(0); }}
        >
          {N.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={S.rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className={n <= lit ? 'on' : ''}
              data-act="rate"
              data-n={n}
              onPointerOver={() => setHover(n)}
              onClick={() => onRate(n)}
            >
              <Icon name="star" size={34} sw={1.5} />
            </button>
          ))}
        </div>
        <label className="vp-q" htmlFor="vpComment">Any issues or feedback?</label>
        <textarea id="vpComment" className="vp-input" rows={2} placeholder="Optional" value={S.comment} onChange={(e) => onComment(e.target.value)} />
        <button className="btn btn-dark btn-block vp-submit" disabled={!S.rating}>Submit</button>
      </form>
    </section>
  );
}

export function PastSurveys({ past, freshKey, onView }) {
  return (
    <section className="card vp-past-card">
      <div className="eyebrow-n" style={{ marginBottom: 6 }}>My past surveys</div>
      <div id="vpPast">
        {past.map((p, i) => (
          <div key={p.key} className={`vp-past ${p.key === freshKey ? 'is-new-msg' : ''}`}>
            <div><b>{p.event}</b><span>{p.date}</span></div>
            <span className="vp-past-stars" aria-label={`${p.rating} out of 5`}>
              {N.map((n) => <i key={n} className={n <= p.rating ? 'on' : ''}><Icon name="star" size={12} sw={2} /></i>)}
            </span>
            <button className="btn btn-outline btn-xs" style={{ borderColor: '#d6d6d6' }} data-act="view-survey" data-i={i} onClick={() => onView(i)}>View survey</button>
          </div>
        ))}
      </div>
    </section>
  );
}
