// Message / email / announcement composer (per-conversation drafts, Send-as toggle, attachments)
import { useLayoutEffect, useRef } from 'react';
import { SHIFTS, VOLS } from '../../data.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import { EMAIL_RULES, M, REPLY_MODES, UI, audience, channelAdvice, closePops, convo, currentRecipients, draft, renderConv, rerender, send, threadSubject } from './state.js';
import { EmailRuleMenu, LinkForm, RepliesMenu, ShiftPicker } from './pops.jsx';

// Message box grows with its text up to ~7 lines, then scrolls
export function growBody(t = document.getElementById('body')) { if (!t) return; t.style.height = 'auto'; t.style.height = `${Math.min(t.scrollHeight, 168)}px`; }

export function setChannel(v) {
  const d = draft();
  const adv = channelAdvice(currentRecipients());
  if ((v === 'inapp' && adv?.inappOff) || (v === 'email' && adv?.emailOff)) return;
  const body = document.getElementById('body');
  if (body) { d.body = body.value; d.subject = document.getElementById('subject')?.value ?? d.subject; }
  if (M.channel === v) return;
  d.channel = v;
  M.channel = v;
  closePops();
  // In compose mode the whole pane rebuilds (keeping whatever was typed in To:)
  if (M.composing) renderConv({ keepQ: true }); else rerender();
}

export function Composer() {
  const d = draft();
  const email = M.channel === 'email';
  const ann = M.tab === 'announcement';
  const c = !M.composing && M.tab === 'message' ? convo(M.active) : null;
  const toList = M.composing ? M.rcpts.filter((r) => r.kind === 'vol').map((r) => r.id) : c ? c.who : [];
  const hasLoc = M.attach.some((a) => a.type === 'loc');
  const adv = ann ? null : channelAdvice(currentRecipients(), c);
  const au = ann ? audience() : null;
  const rule = d.emailRule || 'unseen', replies = d.replies || 'thread';
  const people = (n) => `${n} ${n === 1 ? 'person' : 'people'}`;
  const sendLabel = ann ? (au.total ? `Post to ${people(au.total)}` : 'Post') : email ? 'Send email' : 'Send';
  const optPop = (e, C) => UI.pop.toggle(e.currentTarget, <C />, { side: 'top', align: 'end' });
  const bodyRef = useRef(null);
  useLayoutEffect(() => { growBody(bodyRef.current); }, []);

  const onKeyDown = (e) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    const multi = M.channel === 'email' || M.tab === 'announcement';
    if (e.key === 'Enter' && ((multi && (e.metaKey || e.ctrlKey)) || (!multi && !e.shiftKey))) { e.preventDefault(); send(); }
  };
  const toggleLoc = () => {
    const i = M.attach.findIndex((x) => x.type === 'loc');
    if (i > -1) M.attach.splice(i, 1); else M.attach.push({ type: 'loc', text: 'Downtown Career Center · 900 Penn Ave' });
    rerender();
  };
  const removeAttach = (i) => { M.attach.splice(i, 1); rerender(); };

  return (
    <div className="composer" id="composer">
      {email && !ann && (
        <>
          <div className="comp-row"><label>To</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {toList.length ? (
                <>
                  {toList.slice(0, 5).map((w) => <span className="rcpt" key={w}><Avatar id={w} className="sm" /> {VOLS[w].name} <span className="em">&lt;{VOLS[w].email}&gt;</span></span>)}
                  {toList.length > 5 && <span className="muted">+{toList.length - 5} more</span>}
                </>
              ) : <span className="muted">Add recipients above</span>}
            </div>
          </div>
          {toList.length > 1 && <div className="priv-note"><Icon name="users" size={12} /> Each person gets their own email, so addresses stay private. Replies come back here, where everyone in this conversation can see them.</div>}
        </>
      )}
      {(email || ann) && (
        <div className="comp-row"><label htmlFor="subject">Subject</label>
          <input id="subject" defaultValue={d.subject || (!ann ? threadSubject(c) : '')} placeholder={ann ? 'Headline volunteers will see first' : 'Subject (uses your first line if left empty)'} autoComplete="off" onInput={(e) => { draft().subject = e.currentTarget.value; }} />
        </div>
      )}
      <textarea
        ref={bodyRef} id="body" rows={email || ann ? 3 : 2} defaultValue={d.body}
        placeholder={ann ? 'Write your announcement…' : email ? 'Write your email…' : 'Write a message…'}
        onInput={(e) => { draft().body = e.currentTarget.value; growBody(e.currentTarget); }}
        onKeyDown={onKeyDown}
      />
      {ann && (
        <div className="ann-opts">
          {au.total ? (
            <span className="reach">
              <Icon name="users" size={13} /> {people(au.total)}
              <span className="reach-pill app" data-tip="Have the app and will see it there">{au.app} in app</span>
              {au.email > 0 && <span className="reach-pill email" data-tip="Haven’t joined the app, so they’re reached by email">{au.email} by email</span>}
              {au.none > 0 && <span className="reach-pill none" data-tip="No app and no working email address">{au.none} can’t be reached</span>}
            </span>
          ) : <span className="reach muted">Add a group to see who this reaches</span>}
          <span className="sp" />
          <button className="opt-btn" onClick={(e) => optPop(e, EmailRuleMenu)} aria-haspopup="menu" aria-expanded="false" data-tip={EMAIL_RULES[rule][1]}>
            <Icon name="mail" size={12} /> Email: <b>{EMAIL_RULES[rule][0]}</b> <Icon name="chev" size={12} />
          </button>
          <button className="opt-btn" onClick={(e) => optPop(e, RepliesMenu)} aria-haspopup="menu" aria-expanded="false" data-tip={REPLY_MODES[replies][1]}>
            <Icon name="reply" size={12} /> Replies: <b>{REPLY_MODES[replies][0]}</b> <Icon name="chev" size={12} />
          </button>
        </div>
      )}
      <div className="comp-bar">
        <button className="icon-btn" onClick={(e) => UI.pop.toggle(e.currentTarget, <ShiftPicker />, { side: 'top' })} data-tip="Attach a shift" aria-label="Attach a shift"><Icon name="nav-calendar" size={18} /></button>
        <button className="icon-btn" onClick={(e) => UI.pop.toggle(e.currentTarget, <LinkForm />, { side: 'top' })} data-tip="Add a link" aria-label="Add a link"><Icon name="link" size={18} /></button>
        {!ann && <span className="comp-sep" aria-hidden="true" />}
        {!ann && (
          <div className="ch-toggle" role="radiogroup" aria-label="Send as">
            <button role="radio" aria-checked={!email} aria-disabled={!!adv?.inappOff} className={email ? '' : 'on'} onClick={() => setChannel('inapp')} data-tip={adv?.inappOff || 'Send in the app'}><Icon name="nav-messages" size={13} /> In-app</button>
            <button role="radio" aria-checked={email} aria-disabled={!!adv?.emailOff} className={email ? 'on' : ''} onClick={() => setChannel('email')} data-tip={adv?.emailOff || 'Send as an email'}><Icon name="mail" size={13} /> Email</button>
          </div>
        )}
        <div className="grow" id="attachList">
          {M.attach.map((a, i) => (
            <span className="attach" key={`${a.type}-${a.id || a.url || a.text}`}>
              {a.type === 'shift' ? <><Icon name="nav-calendar" size={12} /> {SHIFTS[a.id].title} · {SHIFTS[a.id].mon} {SHIFTS[a.id].day}</>
                : a.type === 'link' ? <><Icon name="link" size={12} /> {a.url.replace(/^https?:\/\//, '')}</>
                : <><Icon name="pin" size={12} /> {a.text}</>}
              <button onClick={() => removeAttach(i)} aria-label="Remove attachment"><Icon name="x" size={11} /></button>
            </span>
          ))}
        </div>
        {ann && <button className={`icon-btn round ${hasLoc ? 'on' : ''}`} style={{ width: 30, height: 30 }} onClick={toggleLoc} data-tip={hasLoc ? 'Remove location' : 'Add meeting location'} aria-label="Location"><Icon name="pin" size={15} /></button>}
        <button className="btn btn-dark btn-sm" onClick={send} data-tip={email || ann ? '⌘ Enter' : 'Enter'}>{sendLabel}</button>
      </div>
    </div>
  );
}
