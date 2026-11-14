// Modal contents: announcement (reactions, replies, reply form) and past-survey viewer
import { useLayoutEffect, useRef, useState } from 'react';
import { Avatar, Icon } from '../components/Icon.jsx';
import { ME, VOLS } from '../data.js';
import { emit, useStore } from '../lib/store.js';
import { announcement, VOL, vol } from './shared.js';
import { StaticStars } from './Surveys.jsx';

function CloseBtn({ close }) {
  return (
    <button className="icon-btn plain" data-act="close-modal" aria-label="Close" onClick={() => close()}>
      <Icon name="x" size={16} />
    </button>
  );
}

export function AnnouncementModal({ close }) {
  useStore();
  const { g, a } = announcement();
  const [text, setText] = useState('');
  const [newFrom] = useState(() => a.replies.length); // replies added in this session flash in
  const [chipKeys] = useState(() => Object.keys(a.reacts).filter((k) => a.reacts[k] > 0)); // chips render once, like vanilla
  const body = useRef(null);
  const count = useRef(a.replies.length);

  useLayoutEffect(() => {
    if (a.replies.length > count.current && body.current) body.current.scrollTop = body.current.scrollHeight;
    count.current = a.replies.length;
  }, [a.replies.length]);

  const react = (e, emo) => {
    const mine = a.mine.includes(emo);
    a.reacts[emo] += mine ? -1 : 1;
    a.mine = mine ? a.mine.filter((x) => x !== emo) : [...a.mine, emo];
    const n = e.currentTarget.querySelector('.n');
    if (n) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
    emit();
  };
  const reply = (e) => {
    e.preventDefault();
    const v = text.trim(); if (!v) return;
    a.replies.push({ who: VOL, when: 'Just now', text: v });
    setText('');
    emit();
  };

  return (
    <>
      <header className="modal-head"><div><b>{g.name}</b><span>Announcement</span></div><CloseBtn close={close} /></header>
      <div className="modal-body" ref={body}>
        <div className="t-msg">
          <Avatar id="me" />
          <div className="t-main">
            <div className="t-meta"><b>{ME.name}</b><time>{a.date}</time></div>
            <div className="t-title" style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{a.title}</div>
            <div className="t-text" style={{ fontSize: 14 }}>{a.body}</div>
            <div className="reacts" id="vReacts" style={{ justifyContent: 'flex-start', marginTop: 10 }}>
              {chipKeys.map((emo) => [emo, a.reacts[emo]]).map(([emo, n]) => (
                <button key={emo} className={`react ${a.mine.includes(emo) ? 'mine' : ''}`} data-act="v-react" data-e={emo} aria-pressed={a.mine.includes(emo)} onClick={(e) => react(e, emo)}>
                  {emo} <span className="n">{n}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="t-replies-label">{a.replies.length} {a.replies.length === 1 ? 'reply' : 'replies'}</div>
        <div id="vReplies">
          {a.replies.map((r, i) => (
            <div key={i} className={`t-msg ${i >= newFrom ? 'is-new-msg' : ''}`}>
              <Avatar id={r.who} />
              <div className="t-main">
                <div className="t-meta"><b>{r.who === 'me' ? ME.name : r.who === VOL ? vol.name : VOLS[r.who].name}</b><time>{r.when.replace(/^.* at /, '')}</time></div>
                <div className="t-text">{r.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form className="t-input modal-foot" data-form="v-reply" onSubmit={reply}>
        <input id="vReply" placeholder="Reply to Bridget and the group…" autoComplete="off" aria-label="Reply" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="send-circle ready" aria-label="Send reply"><Icon name="arrow-up" size={15} /></button>
      </form>
    </>
  );
}

export function SurveyModal({ p, close }) {
  return (
    <>
      <header className="modal-head"><div><b>{p.event}</b><span>{p.date}</span></div><CloseBtn close={close} /></header>
      <div className="modal-body">
        <div className="vp-q" style={{ paddingTop: 0 }}>What would you rate this event?</div>
        <StaticStars rating={p.rating} size={26} />
        <div className="vp-q">Any issues or feedback?</div>
        <div className="vp-answer">{p.comment ? p.comment : <span className="vp-muted">No comment left.</span>}</div>
      </div>
    </>
  );
}
