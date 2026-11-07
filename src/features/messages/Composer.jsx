// Message / email / announcement composer (per-conversation drafts, Send-as toggle, attachments)
import { useLayoutEffect, useRef } from 'react';
import { SHIFTS, VOLS } from '../../data.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import { M, UI, closePops, convo, draft, renderConv, rerender, send } from './state.js';
import { LinkForm, ShiftPicker } from './pops.jsx';

// Message box grows with its text up to ~7 lines, then scrolls
export function growBody(t = document.getElementById('body')) { if (!t) return; t.style.height = 'auto'; t.style.height = `${Math.min(t.scrollHeight, 168)}px`; }

export function setChannel(v) {
  const d = draft();
  const body = document.getElementById('body');
  if (body) { d.body = body.value; d.subject = document.getElementById('subject')?.value ?? d.subject; }
  if (M.channel === v) return;
  M.channel = v; d.channel = M.channel;
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
          {toList.length > 1 && <div className="priv-note"><Icon name="users" size={12} /> Each volunteer gets their own copy, so addresses stay private.</div>}
        </>
      )}
      {(email || ann) && (
        <div className="comp-row"><label htmlFor="subject">Subject</label>
          <input id="subject" defaultValue={d.subject} placeholder={ann ? 'Headline volunteers will see first' : 'Add a subject'} autoComplete="off" onInput={(e) => { draft().subject = e.currentTarget.value; }} />
        </div>
      )}
      <textarea
        ref={bodyRef} id="body" rows={email || ann ? 3 : 2} defaultValue={d.body}
        placeholder={ann ? 'Write your announcement…' : email ? 'Write your email…' : 'Write a message…'}
        onInput={(e) => { draft().body = e.currentTarget.value; growBody(e.currentTarget); }}
        onKeyDown={onKeyDown}
      />
      <div className="comp-bar">
        <button className="icon-btn" onClick={(e) => UI.pop.toggle(e.currentTarget, <ShiftPicker />, { side: 'top' })} data-tip="Attach a shift" aria-label="Attach a shift"><Icon name="nav-calendar" size={18} /></button>
        <button className="icon-btn" onClick={(e) => UI.pop.toggle(e.currentTarget, <LinkForm />, { side: 'top' })} data-tip="Add a link" aria-label="Add a link"><Icon name="link" size={18} /></button>
        <span className="comp-sep" aria-hidden="true" />
        <div className="ch-toggle" role="radiogroup" aria-label="Send as">
          <button role="radio" aria-checked={!email} className={email ? '' : 'on'} onClick={() => setChannel('inapp')} data-tip="Send in the app"><Icon name="nav-messages" size={13} /> In-app</button>
          <button role="radio" aria-checked={email} className={email ? 'on' : ''} onClick={() => setChannel('email')} data-tip={ann ? 'Also send by email' : 'Send as an email'}><Icon name="mail" size={13} /> {ann ? '+ Email' : 'Email'}</button>
        </div>
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
        <button className="btn btn-dark btn-sm" onClick={send} data-tip={email || ann ? '⌘ Enter' : 'Enter'}>Send</button>
      </div>
    </div>
  );
}
