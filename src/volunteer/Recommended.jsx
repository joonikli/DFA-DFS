// Recommended events card (Recommend tag w/ tooltip, save/bookmark, Register ⇄ Registered, spots left)
import { forwardRef } from 'react';
import { Icon } from '../components/Icon.jsx';
import { SHIFTS } from '../data.js';
import { shortTime } from './shared.js';

function RecCard({ r, reg, saved, onSave, onRegister }) {
  const s = SHIFTS[r.id];
  return (
    <article className="vp-rec" data-rec={r.id}>
      <div className="vp-rec-date"><span className="m">{s.mon}</span><span className="d">{s.day}</span><span className="t">{shortTime(s.time)}</span></div>
      <div className="vp-rec-body">
        <div className="vp-rec-top">
          <div className="vp-rec-title"><h3>{s.title}</h3><span className="vp-tag rec" data-tip={r.why}>Recommend</span></div>
          <div className="vp-rec-cta">
            <button
              className={`vp-save ${saved ? 'on' : ''}`}
              data-act="save"
              data-id={r.id}
              aria-pressed={saved}
              data-tip={saved ? 'Saved' : 'Save for later'}
              aria-label="Save for later"
              onClick={() => onSave(r.id)}
            >
              <Icon name="bookmark" size={16} />
            </button>
            <button className={`btn btn-dark btn-sm ${reg ? 'is-done' : ''}`} data-act="register" data-id={r.id} onClick={(e) => onRegister(e.currentTarget, r.id)}>
              {reg ? <>Registered <Icon name="check" size={14} /></> : <>Register <Icon name="plus" size={14} /></>}
            </button>
          </div>
        </div>
        <div className="vp-rec-addr">{s.addr}<span className="sep" aria-hidden="true">·</span>{r.dist} from you</div>
        <p>{s.desc}</p>
        <div className="vp-tags">
          {s.tags.map((t) => <span key={t} className="vp-tag pink">{t}</span>)}
          <span className="vp-spots">{s.cap - s.filled - (reg ? 1 : 0)} spots left</span>
        </div>
      </div>
    </article>
  );
}

export const RecommendedCard = forwardRef(function RecommendedCard({ recommended, registered, saved, onSave, onRegister }, ref) {
  return (
    <section className="card vp-recs" id="vpRecs" ref={ref}>
      <div className="eyebrow-n" style={{ marginBottom: 4 }}>Recommended events</div>
      <h2 className="h2">These are some events you might be interested in, based on your profile…</h2>
      <div className="vp-rec-list">
        {recommended.map((r) => <RecCard key={r.id} r={r} reg={registered.has(r.id)} saved={saved.has(r.id)} onSave={onSave} onRegister={onRegister} />)}
      </div>
    </section>
  );
});
