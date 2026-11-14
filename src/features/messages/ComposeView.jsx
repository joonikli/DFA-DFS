// Compose mode: To: chips + recipient dropdown, guided empty state / recipient summary, composer
import { useLayoutEffect } from 'react';
import { CONVOS, GROUPS, SHIFTS, VOLS } from '../../data.js';
import { Avatar, Icon } from '../../components/Icon.jsx';
import Button from '../../components/Button/Button.jsx';
import {
  M, UI, addAttach, addRcpt, closePops, firstName, group, openRcpts, syncChannel, rcptOptions,
  renderConv, rerender,
} from './state.js';
import { Composer } from './Composer.jsx';
import { openConvo } from './actions.js';

function Chips() {
  const list = M.rcpts;
  const collapsed = list.length > 6 && !M.rcptsOpen;
  const remove = (i) => {
    M.rcpts.splice(i, 1);
    rerender();
    document.getElementById('toInput')?.focus(); openRcpts();
  };
  return (
    <>
      {list.slice(0, collapsed ? 4 : list.length).map((r, i) => {
        if (r.kind === 'group') return <span className="to-chip" key={`g-${r.id}`}><Icon name="users" size={14} /> {group(r.id).name} <button onClick={() => remove(i)} aria-label={`Remove ${group(r.id).name}`}><Icon name="x" size={15} sw={1.75} /></button></span>;
        const v = VOLS[r.id];
        return <span className="to-chip" key={`v-${r.id}`}><Avatar id={r.id} />{v.name}{M.channel === 'email' && <> <span className="em">({v.email})</span></>} <button onClick={() => remove(i)} aria-label={`Remove ${v.name}`}><Icon name="x" size={15} sw={1.75} /></button></span>;
      })}
      {collapsed && <button className="to-chip more" onClick={() => { M.rcptsOpen = true; rerender(); }}>+{list.length - 4} more</button>}
      {list.length > 1 && <span className="to-count">{list.length} recipients</span>}
    </>
  );
}

function pick(kind, id) {
  if (kind === 'group') { if (!M.rcpts.some((r) => r.kind === 'group' && r.id === id)) M.rcpts.push({ kind: 'group', id }); }
  else {
    SHIFTS[id].vols.forEach((w) => { if (!M.rcpts.some((r) => r.kind === 'vol' && r.id === w)) M.rcpts.push({ kind: 'vol', id: w }); });
    addAttach({ type: 'shift', id });
  }
  closePops(true);
  M.focus = 'body';
  rerender();
}

function ComposeEmpty() {
  const ann = M.tab === 'announcement';
  const rc = M.rcpts;
  if (!rc.length) {
    const sugg = ann
      ? GROUPS.slice(0, 3).map((g) => ({ kind: 'group', id: g.id, label: g.name, sub: `${g.count} members`, avs: g.members.slice(0, 3) }))
      : ['e12', 'e15', 'e17'].map((id) => { const sh = SHIFTS[id]; return { kind: 'shift', id, label: `${sh.title} · ${sh.mon} ${sh.day}`, sub: `${sh.vols.length} volunteers signed up`, avs: sh.vols.slice(0, 3) }; });
    return (
      <div className="cmp-empty">
        <div className="cmp-icon"><Icon name={ann ? 'users' : 'pen'} size={22} /></div>
        <h3>{ann ? 'New announcement' : 'New message'}</h3>
        <p>{ann ? 'Type a group or name above, or pick one of your groups.' : 'Type a name above, or pick a shift to message everyone signed up for it.'}</p>
        <div className="cmp-sugg">
          {sugg.map((x) => (x.kind === 'shift' ? (
            // Design system: Components › Small events cards (2044:26625), same anatomy as SmallEventCard
            <button key={x.id} className="sec-card" onClick={() => pick(x.kind, x.id)} aria-label={`Message everyone on ${SHIFTS[x.id].title}, ${SHIFTS[x.id].mon} ${SHIFTS[x.id].day}`}>
              <span className="sec-card__date"><span className="sec-card__mon">{SHIFTS[x.id].mon}</span><span className="sec-card__day">{SHIFTS[x.id].day}</span></span>
              <span className="sec-card__body">
                <span className="sec-card__title">{SHIFTS[x.id].title}</span>
                <span className="sec-card__subtitle">{x.sub}</span>
                <span className="sec-card__logistics"><span><Icon name="clock" size={14} /><span>{SHIFTS[x.id].time}</span></span><span><Icon name="pin" size={14} /><span>{SHIFTS[x.id].addr}</span></span></span>
              </span>
              <span className="sec-card__actions"><span className="cmp-avs">{x.avs.map((w) => <Avatar key={w} id={w} />)}</span></span>
            </button>
          ) : (
            <button key={x.id} className="cmp-opt" onClick={() => pick(x.kind, x.id)}>
              <span className="cmp-avs">{x.avs.map((w) => <Avatar key={w} id={w} />)}</span>
              <span className="cmp-txt"><b>{x.label}</b><small>{x.sub}</small></span><Icon name="plus" size={16} />
            </button>
          )))}
        </div>
      </div>
    );
  }
  const ids = [...new Set(rc.flatMap((r) => (r.kind === 'group' ? group(r.id).members : [r.id])))];
  const total = Math.max(ids.length, rc.reduce((n, r) => n + (r.kind === 'group' ? group(r.id).count : 1), 0));
  const existing = !ann && CONVOS.find((x) => x.who.length === ids.length && ids.every((w) => x.who.includes(w)));
  const names = rc.map((r) => (r.kind === 'group' ? group(r.id).name : firstName(r.id)));
  const list = names.length <= 3 ? names.join(', ').replace(/, ([^,]*)$/, ' and $1') : `${names.slice(0, 2).join(', ')} and ${names.length - 2} others`;
  const note = ann ? `This announcement goes to ${total} ${total === 1 ? 'person' : 'people'}.`
    : existing ? `You already have a conversation with ${ids.length === 1 ? 'this person' : 'these people'}. Your message will be added to it.`
    : ids.length === 1 ? 'This starts a new conversation.' : `This starts a new group conversation with ${ids.length} people.`;
  return (
    <div className="cmp-empty">
      <div className="cmp-avs lg">{ids.slice(0, 4).map((w) => <Avatar key={w} id={w} />)}{total > 4 && <span className="av more">+{total - 4}</span>}</div>
      <h3>{list}</h3>
      <p>{note}{M.channel === 'email' && total > 1 ? ' Each person gets their own copy by email.' : ''}</p>
      {existing && <button className="link" onClick={() => openConvo(existing.id)}>Open the conversation <Icon name="arrow-r" size={12} /></button>}
    </div>
  );
}

function discard() {
  M.drafts[`new-${M.tab}`] = { body: '', subject: '' };
  M.composing = false; M.rcptsOpen = false;
  syncChannel();
  closePops(true);
  renderConv();
  UI.toast('Draft discarded', { ic: 'trash' });
}

export function ComposeView() {
  // vanilla afterConv() in compose mode: focus To: and open the recipient list
  useLayoutEffect(() => {
    const i = document.getElementById('toInput');
    if (i) { i.focus(); openRcpts(); }
  }, []);
  const onKeyDown = (e) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    const t = e.currentTarget;
    const flat = rcptOptions().flatMap(([, it]) => it);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      M.rcptKb = (M.rcptKb + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % Math.max(flat.length, 1);
      M.kbScroll = true;
      openRcpts();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const o = flat[M.rcptKb];
      if (o) addRcpt(o.kind, o.id); else document.getElementById('body')?.focus();
    } else if (e.key === 'Backspace' && !t.value && M.rcpts.length) {
      M.rcpts.pop();
      rerender(); t.focus(); openRcpts();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      closePops(true);
    }
  };
  return (
    <>
      <div className="to-field" id="toField"><label htmlFor="toInput">To:</label>
        <div className="to-chips" id="toChips">
          <Chips />
          <input
            className="to-input" id="toInput" key="toInput" value={M.toQ} autoComplete="off" aria-autocomplete="list"
            placeholder={M.rcpts.length ? '' : M.tab === 'announcement' ? 'Group, name or email' : 'Name or email'}
            onChange={(e) => { M.toQ = e.target.value; M.rcptKb = 0; openRcpts(); rerender(); }}
            onFocus={openRcpts}
            onKeyDown={onKeyDown}
          />
        </div>
        <Button color="secondary" size="sm" onClick={discard}>Discard</Button>
      </div>
      <div className="conv-body"><div className="stream-col">
        <div className="stream cmp-stream"><div className="cmp-wrap" id="cmpEmpty"><ComposeEmpty /></div></div>
        <div className="composer-wrap"><Composer /></div>
      </div></div>
    </>
  );
}
