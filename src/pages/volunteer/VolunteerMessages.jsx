// Volunteer messaging center (Maureen's side of the manager's Messages screen).
// Two tabs, same split as the manager: Messages (1:1 with coordinators + group chats she was added to)
// and Announcements (read, react, reply; volunteers never post them).
// Channel logic from this side: everything lands here; a message a coordinator also emailed says so,
// and "How we reach you" is the preference the manager's composer reads to pick a channel.
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUp, Check, ChevronDown, ChevronRight, Lock, Mail, Megaphone, MessageSquareReply, Search, Smile, SquarePen, X } from 'lucide-react'
import { PageHeader } from '../../layout/AppShell.jsx'
import Avatar from '../../components/Avatar/Avatar.jsx'
import TabNav from '../../components/TabNav/TabNav.jsx'
import Button from '../../components/Button/Button.jsx'
import { useDemo } from '../../store/DemoStore.jsx'
import { useDismiss } from '../../lib/useDismiss.js'
import { eventsById } from '../../mock/events.js'
import { formatTimeRange, MONTHS } from '../../lib/dates.js'
import { AUTO_REPLIES, PEOPLE, REACH_PREFS, STAFF } from '../../mock/messages.js'
import myPhoto from '../../assets/avatar-volunteer.png'
import './VolunteerMessages.css'

const EMOJI = ['👍', '❤️', '🙌', '😄', '🙏', '👀']
const who = (id) => PEOPLE[id] || { name: 'Volunteer', first: 'Volunteer' }
const convoName = (c) => c.name || who(c.who[0]).name
const lastMsg = (c) => c.msgs[c.msgs.length - 1]
let seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}-${++seq}`

function Face({ id, size = 32 }) {
  const p = id === 'me' ? null : who(id)
  if (id === 'me') return <Avatar name={PEOPLE.me.name} src={myPhoto} size={size} />
  return <Avatar name={p.name} src={p.photo} size={size} tone={p.staff ? 'purple' : 'gray'} />
}

/** Small anchored popover that closes on outside click / Escape */
function Pop({ open, onClose, className = '', children, anchorRef }) {
  const ref = useRef(null)
  useDismiss(anchorRef || ref, open, onClose)
  if (!open) return null
  return <div ref={ref} className={`vm-pop ${className}`} role="dialog">{children}</div>
}

function ReactBar({ reacts, mine, onToggle, labelFor }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const entries = Object.entries(reacts).filter(([, v]) => (Array.isArray(v) ? v.length : v > 0))
  return (
    <div className={`vm-reacts ${entries.length ? '' : 'vm-reacts--empty'}`} ref={wrap}>
      {entries.map(([e, v]) => {
        const isMine = Array.isArray(v) ? v.includes('me') : mine.includes(e)
        return (
          <button key={e} type="button" className={`vm-react ${isMine ? 'vm-react--mine' : ''}`} aria-pressed={isMine} title={labelFor?.(v)} onClick={() => onToggle(e)}>
            {e} <span>{Array.isArray(v) ? v.length : v}</span>
          </button>
        )
      })}
      <span className="vm-react-add-wrap">
        <button type="button" className={`vm-react vm-react--add ${open ? 'is-on' : ''}`} aria-label="Add reaction" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <Smile size={15} strokeWidth={2} />
        </button>
        <Pop open={open} onClose={() => setOpen(false)} anchorRef={wrap} className="vm-pop--emoji">
          {EMOJI.map((e) => <button key={e} type="button" onClick={() => { onToggle(e); setOpen(false) }} aria-label={`React ${e}`}>{e}</button>)}
        </Pop>
      </span>
    </div>
  )
}

function EventAttachment({ id }) {
  const e = eventsById[id]
  const navigate = useNavigate()
  if (!e) return null
  return (
    <button type="button" className="vm-event" onClick={() => navigate('/events?tab=registered')}>
      <span className="vm-event__date"><small>{MONTHS[e.start.getMonth()].slice(0, 3)}</small><b>{e.start.getDate()}</b></span>
      <span className="vm-event__text"><b>{e.title}</b><span>{formatTimeRange(e.start, e.end)} · {e.location}</span></span>
      <ChevronRight size={16} aria-hidden="true" />
    </button>
  )
}

function Composer({ placeholder, onSend, context, onClearContext, autoFocus }) {
  const [text, setText] = useState('')
  const ref = useRef(null)
  useEffect(() => { if (autoFocus) ref.current?.focus() }, [autoFocus])
  const grow = (t) => { t.style.height = 'auto'; t.style.height = `${Math.min(t.scrollHeight, 140)}px` }
  const send = () => {
    const v = text.trim()
    if (!v) return
    onSend(v)
    setText('')
    requestAnimationFrame(() => ref.current && grow(ref.current))
  }
  return (
    <div className="vm-composer">
      {context && (
        <div className="vm-composer__context">
          <Megaphone size={14} aria-hidden="true" /> Private reply to <b>{context}</b>
          <button type="button" aria-label="Remove" onClick={onClearContext}><X size={14} /></button>
        </div>
      )}
      <div className="vm-composer__row">
        <textarea
          ref={ref} rows={1} value={text} placeholder={placeholder} aria-label={placeholder}
          onChange={(e) => { setText(e.target.value); grow(e.target) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() } }}
        />
        <button type="button" className={`vm-send ${text.trim() ? 'is-ready' : ''}`} onClick={send} aria-label="Send" disabled={!text.trim()}>
          <ArrowUp size={16} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}

function ThreadPanel({ title, root, replies, onReply, onClose, note }) {
  const scroll = useRef(null)
  useLayoutEffect(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight }, [replies.length])
  return (
    <aside className="vm-thread" aria-label="Thread">
      <header className="vm-thread__head">
        <div><b className="text-label-1">Thread</b><span className="text-label-2">{title}</span></div>
        <button type="button" className="vm-icon-btn" onClick={onClose} aria-label="Close thread"><X size={16} /></button>
      </header>
      <div className="vm-thread__scroll" ref={scroll}>
        {root}
        <div className="vm-thread__count">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</div>
        {replies.map((r, i) => (
          <div className="vm-tmsg" key={i}>
            <Face id={r.who} size={28} />
            <div><div className="vm-tmsg__meta"><b>{r.who === 'me' ? 'You' : who(r.who).name}</b><time>{r.time}</time></div><p>{r.text}</p></div>
          </div>
        ))}
      </div>
      {note ? <p className="vm-thread__note">{note}</p> : <Composer placeholder="Reply in thread…" onSend={onReply} autoFocus />}
    </aside>
  )
}

/* ------------------------------------------------------------------ */

export default function VolunteerMessages() {
  const { messages, updateMessages, showToast } = useDemo()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState(params.get('ann') || params.get('tab') === 'announcements' ? 'announcements' : 'messages')
  const [activeConvo, setActiveConvo] = useState(messages.convos[0]?.id)
  const [activeGroup, setActiveGroup] = useState(() => (params.get('ann') && messages.groups.find((g) => g.anns.some((a) => a.id === params.get('ann')))?.id) || messages.groups[0]?.id)
  const [q, setQ] = useState('')
  const [thread, setThread] = useState(null) // { kind: 'msg' | 'ann', id }
  const [newFrom, setNewFrom] = useState(null) // { id, n } → "New" divider position
  const [composing, setComposing] = useState(false)
  const [reAnn, setReAnn] = useState(null) // { convoId, title } private reply context
  const [typing, setTyping] = useState(null) // convo id where a coordinator is typing
  const [flash, setFlash] = useState(params.get('ann'))
  const [prefOpen, setPrefOpen] = useState(false)
  const prefRef = useRef(null)
  const streamRef = useRef(null)
  const viewing = useRef({}); viewing.current = { tab, activeConvo, composing }

  const convo = messages.convos.find((c) => c.id === activeConvo)
  const group = messages.groups.find((g) => g.id === activeGroup)
  const unreadMsgs = messages.convos.reduce((n, c) => n + c.unread, 0)
  const unreadAnns = messages.groups.reduce((n, g) => n + g.unread, 0)

  const setConvo = (id, fn) => updateMessages((s) => ({ ...s, convos: s.convos.map((c) => (c.id === id ? fn(c) : c)) }))
  const setGroup = (id, fn) => updateMessages((s) => ({ ...s, groups: s.groups.map((g) => (g.id === id ? fn(g) : g)) }))
  const setMsg = (cid, mid, fn) => setConvo(cid, (c) => ({ ...c, msgs: c.msgs.map((x) => (x.id === mid ? fn(x) : x)) }))
  const setAnn = (gid, aid, fn) => setGroup(gid, (g) => ({ ...g, anns: g.anns.map((x) => (x.id === aid ? fn(x) : x)) }))

  // Opening something marks it read, remembering where the unread run started (Slack-style "New" line)
  const openItem = tab === 'messages' ? (composing ? null : convo) : group
  useEffect(() => {
    if (!openItem || !openItem.unread) return
    setNewFrom({ id: openItem.id, n: openItem.unread })
    ;(tab === 'messages' ? setConvo : setGroup)(openItem.id, (x) => ({ ...x, unread: 0 }))
  }, [openItem?.id, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the stream pinned to the newest message; a deep-linked announcement scrolls into view instead
  const streamLen = tab === 'messages' ? (convo?.msgs.length ?? 0) + (typing === activeConvo ? 1 : 0) : group?.anns.length ?? 0
  useLayoutEffect(() => {
    const s = streamRef.current
    if (!s) return
    const target = flash && s.querySelector(`[data-ann="${flash}"]`)
    if (target) s.scrollTop = target.offsetTop - 24
    else s.scrollTop = s.scrollHeight
  }, [tab, activeConvo, activeGroup, streamLen, composing]) // eslint-disable-line react-hooks/exhaustive-deps

  // A link to a specific announcement (dashboard "View message", notifications) works even while you're here
  const annParam = params.get('ann')
  useEffect(() => {
    if (!annParam) return
    const g = messages.groups.find((x) => x.anns.some((a) => a.id === annParam))
    if (!g) return
    setTab('announcements'); setComposing(false); setThread(null); setActiveGroup(g.id); setFlash(annParam)
  }, [annParam]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!flash) return undefined
    const t = setTimeout(() => { setFlash(null); setParams({}, { replace: true }) }, 1800)
    return () => clearTimeout(t)
  }, [flash]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (t) => { setTab(t); setThread(null); setComposing(false); setNewFrom(null) }
  const pickConvo = (id) => { setActiveConvo(id); setComposing(false); setThread(null); setNewFrom(null); if (reAnn?.convoId !== id) setReAnn(null) }
  const pickGroup = (id) => { setActiveGroup(id); setThread(null); setNewFrom(null) }

  // Start (or reopen) a 1:1 with a coordinator
  const openDirect = (staffId, context) => {
    const existing = messages.convos.find((c) => !c.name && c.who.length === 1 && c.who[0] === staffId)
    let id = existing?.id
    if (!id) {
      id = uid('c')
      updateMessages((s) => ({ ...s, convos: [{ id, who: [staffId], unread: 0, last: 'Now', msgs: [] }, ...s.convos] }))
    }
    setTab('messages'); setComposing(false); setThread(null); setNewFrom(null)
    setActiveConvo(id)
    setReAnn(context ? { convoId: id, title: context } : null)
  }

  const send = (text) => {
    const c = convo
    const mid = uid('m')
    const msg = { id: mid, from: 'me', day: 'Today', time: 'Just now', text, reacts: {}, replies: [], status: 'sent', ...(reAnn?.convoId === c.id ? { reAnn: reAnn.title } : {}) }
    updateMessages((s) => ({ ...s, convos: [{ ...s.convos.find((x) => x.id === c.id), last: 'Now' }, ...s.convos.filter((x) => x.id !== c.id)].map((x) => (x.id === c.id ? { ...x, msgs: [...x.msgs, msg] } : x)) }))
    setReAnn(null)
    setNewFrom(null)
    const solo = c.who.length === 1
    if (solo) {
      // The coordinator sees it, types, and answers
      const staff = c.who[0]
      setTimeout(() => setMsg(c.id, mid, (x) => ({ ...x, status: 'seen' })), 900)
      setTimeout(() => setTyping(c.id), 1300)
      setTimeout(() => {
        setTyping(null)
        const pool = AUTO_REPLIES[staff] || ['Thanks!']
        const reply = { id: uid('m'), from: staff, day: 'Today', time: 'Just now', text: pool[Math.floor(Math.random() * pool.length)], reacts: {}, replies: [] }
        const here = viewing.current.tab === 'messages' && !viewing.current.composing && viewing.current.activeConvo === c.id
        setConvo(c.id, (x) => ({ ...x, msgs: [...x.msgs, reply], unread: here ? 0 : x.unread + 1 }))
        if (!here) showToast({ variant: 'default', image: who(staff).photo, parts: [[who(staff).name, true], [' replied', false]], preview: `“${reply.text}”`, time: 'Now', category: 'Messages' })
      }, 3200)
    } else {
      // Someone in the group reacts
      const reactor = c.who[1] || c.who[0]
      setTimeout(() => setMsg(c.id, mid, (x) => ({ ...x, status: 'seen', reacts: { ...x.reacts, '👍': [reactor] } })), 1600)
    }
  }

  const toggleMsgReact = (mid, e) => setMsg(activeConvo, mid, (x) => {
    const list = x.reacts[e] || []
    const next = list.includes('me') ? list.filter((w) => w !== 'me') : [...list, 'me']
    const reacts = { ...x.reacts, [e]: next }
    if (!next.length) delete reacts[e]
    return { ...x, reacts }
  })
  const toggleAnnReact = (aid, e) => setAnn(activeGroup, aid, (a) => {
    const mine = a.mine.includes(e)
    return { ...a, reacts: { ...a.reacts, [e]: (a.reacts[e] || 0) + (mine ? -1 : 1) }, mine: mine ? a.mine.filter((x) => x !== e) : [...a.mine, e] }
  })
  const replyIn = (text) => {
    const r = { who: 'me', time: 'Just now', text }
    if (thread.kind === 'msg') setMsg(activeConvo, thread.id, (x) => ({ ...x, replies: [...x.replies, r] }))
    else setAnn(activeGroup, thread.id, (a) => ({ ...a, replies: [...a.replies, r] }))
  }

  const setPref = (v) => {
    updateMessages((s) => ({ ...s, reachPref: v }))
    setPrefOpen(false)
    showToast({ variant: 'success', parts: [['Saved. ', true], [REACH_PREFS[v][0], false]], time: 'Now', category: 'Messages' })
  }

  /* ---------- list column ---------- */
  const needle = q.trim().toLowerCase()
  const convoRows = messages.convos.filter((c) => !needle || convoName(c).toLowerCase().includes(needle) || (lastMsg(c)?.text || '').toLowerCase().includes(needle))
  const groupRows = messages.groups.filter((g) => !needle || g.name.toLowerCase().includes(needle))

  const preview = (c) => {
    const m = lastMsg(c)
    if (!m) return 'No messages yet'
    const by = m.from === 'me' ? 'You: ' : c.who.length > 1 ? `${who(m.from).first}: ` : ''
    return by + (m.event && !m.text ? `Shared ${eventsById[m.event]?.title}` : m.text)
  }

  /* ---------- conversation pane ---------- */
  const renderConvo = () => {
    if (!convo) return <div className="vm-empty">Pick a conversation</div>
    const solo = convo.who.length === 1
    const head = solo ? who(convo.who[0]) : null
    const ni = newFrom?.id === convo.id ? convo.msgs.length - convo.msgs.filter((x, i) => i >= convo.msgs.length - newFrom.n).length : -1
    let prevDay = null
    const threadMsg = thread?.kind === 'msg' && convo.msgs.find((x) => x.id === thread.id)
    return (
      <>
        <header className="vm-pane__head">
          {solo ? <Face id={convo.who[0]} size={40} /> : <span className="vm-stack">{convo.who.slice(0, 2).map((w) => <Face key={w} id={w} size={30} />)}</span>}
          <div>
            <h2 className="vm-pane__title">{convoName(convo)}</h2>
            <p className="vm-pane__sub text-label-2">{solo ? head.role : `${convo.who.length + 1} people · Added by ${who(convo.addedBy).first}`}</p>
          </div>
        </header>
        <div className="vm-pane__body">
          <div className="vm-col">
            <div className="vm-stream" ref={streamRef}>
              {convo.msgs.length === 0 && (
                <div className="vm-start">
                  <Face id={convo.who[0]} size={56} />
                  <h3 className="text-subheading">Message {who(convo.who[0]).first}</h3>
                  <p className="text-label-2">{who(convo.who[0]).role}. Messages arrive in their inbox; replies show up here.</p>
                </div>
              )}
              {convo.msgs.map((m, i) => {
                const me = m.from === 'me'
                const showDay = m.day !== prevDay
                prevDay = m.day
                const prev = convo.msgs[i - 1]
                const cont = !showDay && prev && prev.from === m.from && i !== ni
                const p = who(m.from)
                return (
                  <Fragment key={m.id}>
                    {showDay && <div className="vm-day">{m.day}</div>}
                    {i === ni && <div className="vm-new" role="separator"><span>New</span></div>}
                    <div className={`vm-msg ${me ? 'vm-msg--me' : ''} ${cont ? 'vm-msg--cont' : ''} ${m.time === 'Just now' ? 'is-fresh' : ''}`}>
                      <span className="vm-msg__av">{!cont && <Face id={m.from} size={32} />}</span>
                      <div className="vm-msg__col">
                        {!cont && <div className="vm-msg__meta"><b>{me ? 'You' : p.name}</b>{!me && !solo && p.staff && <span className="vm-staff">Coordinator</span>}<time>{m.time}</time></div>}
                        {m.reAnn && <div className="vm-msg__re"><Megaphone size={12} aria-hidden="true" /> Private reply to “{m.reAnn}”</div>}
                        {m.text && (
                          <div className="vm-bubble">
                            {m.subject && <b className="vm-bubble__subj">{m.subject}</b>}
                            {m.text}
                          </div>
                        )}
                        {m.event && <EventAttachment id={m.event} />}
                        <div className="vm-msg__foot">
                          {m.emailed && <span className="vm-via" title={`${p.first} also emailed this to maureen.lee@gmail.com`}><Mail size={12} aria-hidden="true" /> Also sent to your email</span>}
                          {me && m.status && <span className="vm-status">{m.status === 'seen' ? 'Seen' : 'Sent'}</span>}
                        </div>
                        <ReactBar reacts={m.reacts} mine={[]} onToggle={(e) => toggleMsgReact(m.id, e)} labelFor={(v) => v.map((w) => (w === 'me' ? 'You' : who(w).first)).join(', ')} />
                        {m.replies.length > 0 && (
                          <button type="button" className="vm-thread-link" onClick={() => setThread({ kind: 'msg', id: m.id })}>
                            <span className="vm-stack sm">{[...new Set(m.replies.map((r) => r.who))].slice(0, 3).map((w) => <Face key={w} id={w} size={20} />)}</span>
                            <b>{m.replies.length} {m.replies.length === 1 ? 'reply' : 'replies'}</b><span>View thread</span>
                          </button>
                        )}
                      </div>
                      {!solo && (
                        <div className="vm-msg__tools">
                          <button type="button" className="vm-icon-btn" onClick={() => setThread({ kind: 'msg', id: m.id })} aria-label="Reply in thread" title="Reply in thread"><MessageSquareReply size={16} /></button>
                        </div>
                      )}
                    </div>
                  </Fragment>
                )
              })}
              {typing === convo.id && (
                <div className="vm-msg is-fresh"><span className="vm-msg__av"><Face id={convo.who[0]} size={32} /></span>
                  <div className="vm-typing" aria-label={`${who(convo.who[0]).first} is typing`}><i /><i /><i /></div></div>
              )}
            </div>
            <Composer
              key={convo.id}
              placeholder={solo ? `Message ${who(convo.who[0]).first}` : `Message ${convoName(convo)}`}
              onSend={send}
              autoFocus
              context={reAnn?.convoId === convo.id ? reAnn.title : null}
              onClearContext={() => setReAnn(null)}
            />
          </div>
          {threadMsg && (
            <ThreadPanel
              title={convoName(convo)} replies={threadMsg.replies} onReply={replyIn} onClose={() => setThread(null)}
              root={<div className="vm-tmsg vm-tmsg--root"><Face id={threadMsg.from} size={28} /><div><div className="vm-tmsg__meta"><b>{threadMsg.from === 'me' ? 'You' : who(threadMsg.from).name}</b><time>{threadMsg.time}</time></div><p>{threadMsg.text}</p></div></div>}
            />
          )}
        </div>
      </>
    )
  }

  const renderNew = () => (
    <>
      <header className="vm-pane__head"><div><h2 className="vm-pane__title">New message</h2><p className="vm-pane__sub text-label-2">Choose a coordinator</p></div>
        <button type="button" className="vm-icon-btn" style={{ marginLeft: 'auto' }} onClick={() => setComposing(false)} aria-label="Cancel"><X size={18} /></button></header>
      <div className="vm-new-msg">
        <p className="text-body">You can message Dress for Success coordinators directly. Group chats for events are started by coordinators, and they’ll add you.</p>
        <div className="vm-staff-list">
          {STAFF.map((id) => (
            <button key={id} type="button" className="vm-staff-opt" onClick={() => openDirect(id)}>
              <Face id={id} size={40} /><span><b>{who(id).name}</b><small>{who(id).role}</small></span><ChevronRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </>
  )

  const renderGroup = () => {
    if (!group) return <div className="vm-empty">Pick a group</div>
    const ni = newFrom?.id === group.id ? group.anns.length - newFrom.n : -1
    const threadAnn = thread?.kind === 'ann' && group.anns.find((a) => a.id === thread.id)
    return (
      <>
        <header className="vm-pane__head">
          <span className="vm-group-ic"><Megaphone size={20} /></span>
          <div><h2 className="vm-pane__title">{group.name}</h2><p className="vm-pane__sub text-label-2">{group.count} members · Only coordinators post here</p></div>
        </header>
        <div className="vm-pane__body">
          <div className="vm-col">
            <div className="vm-stream vm-stream--posts" ref={streamRef}>
              {group.anns.map((a, i) => {
                const author = who(a.from)
                return (
                  <Fragment key={a.id}>
                    {i === ni && <div className="vm-new" role="separator"><span>New</span></div>}
                    <article className={`vm-post ${flash === a.id ? 'is-flash' : ''}`} data-ann={a.id}>
                      <header className="vm-post__head">
                        <Face id={a.from} size={36} />
                        <div><b className="text-label-1">{author.name}</b><span className="text-label-2">{author.role} · {a.day}, {a.time}</span></div>
                      </header>
                      <h3 className="vm-post__title">{a.title}</h3>
                      <p className="vm-post__body text-body">{a.body}</p>
                      <ReactBar reacts={a.reacts} mine={a.mine} onToggle={(e) => toggleAnnReact(a.id, e)} />
                      <footer className="vm-post__foot">
                        {a.replyMode === 'thread' ? (
                          <button type="button" className="vm-thread-link" onClick={() => setThread({ kind: 'ann', id: a.id })}>
                            {a.replies.length > 0 && <span className="vm-stack sm">{[...new Set(a.replies.map((r) => r.who))].slice(0, 3).map((w) => <Face key={w} id={w} size={20} />)}</span>}
                            <b>{a.replies.length ? `${a.replies.length} ${a.replies.length === 1 ? 'reply' : 'replies'}` : 'Reply in thread'}</b><span>Visible to the group</span>
                          </button>
                        ) : (
                          <button type="button" className="vm-private-btn" onClick={() => openDirect(a.from, a.title)}>
                            <Lock size={14} aria-hidden="true" /> Reply privately to {author.first}
                          </button>
                        )}
                      </footer>
                    </article>
                  </Fragment>
                )
              })}
            </div>
          </div>
          {threadAnn && (
            <ThreadPanel
              title={group.name} replies={threadAnn.replies} onReply={replyIn} onClose={() => setThread(null)}
              root={<div className="vm-tmsg vm-tmsg--root"><Face id={threadAnn.from} size={28} /><div><div className="vm-tmsg__meta"><b>{who(threadAnn.from).name}</b><time>{threadAnn.day}</time></div><p><b>{threadAnn.title}</b><br />{threadAnn.body}</p></div></div>}
            />
          )}
        </div>
      </>
    )
  }

  const tabs = [
    { value: 'messages', label: <>Messages{unreadMsgs ? <span className="vm-tab-badge">{unreadMsgs}</span> : null}</> },
    { value: 'announcements', label: <>Announcements{unreadAnns ? <span className="vm-tab-badge">{unreadAnns}</span> : null}</> },
  ]

  return (
    <div className="vm">
      <PageHeader
        title="Messages"
        subtitle="Talk with coordinators and keep up with your event groups."
        actions={(
          <>
            <span className="vm-pref" ref={prefRef}>
              <button type="button" className="vm-pref__btn text-label-1" aria-expanded={prefOpen} aria-haspopup="dialog" onClick={() => setPrefOpen((o) => !o)}>
                <Mail size={16} aria-hidden="true" /> Email: {REACH_PREFS[messages.reachPref][2]} <ChevronDown size={16} aria-hidden="true" />
              </button>
              <Pop open={prefOpen} onClose={() => setPrefOpen(false)} anchorRef={prefRef} className="vm-pop--pref">
                <p className="vm-pop__label">How coordinators reach you</p>
                {Object.entries(REACH_PREFS).map(([v, [title, help]]) => (
                  <button key={v} type="button" role="menuitemradio" aria-checked={messages.reachPref === v} className={`vm-pref__opt ${messages.reachPref === v ? 'is-on' : ''}`} onClick={() => setPref(v)}>
                    <span className="vm-pref__check">{messages.reachPref === v && <Check size={14} strokeWidth={2.5} />}</span>
                    <span><b>{title}</b><small>{help}</small></span>
                  </button>
                ))}
              </Pop>
            </span>
            <Button color="primary" onClick={() => { setTab('messages'); setComposing(true); setThread(null) }}>
              New message
            </Button>
          </>
        )}
      />
      <TabNav tabs={tabs} value={tab} onChange={switchTab} label="Messages sections" />

      <div className="vm-frame">
        <section className="vm-list" aria-label={tab === 'messages' ? 'Conversations' : 'Announcement groups'}>
          <label className="vm-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          </label>
          <ul>
            {tab === 'messages' && composing && (
              <li><button type="button" className="vm-row is-on"><span className="vm-row__ic"><SquarePen size={18} /></span><span className="vm-row__main"><span className="vm-row__top"><b>New message</b></span><span className="vm-row__prev">Choose a coordinator</span></span></button></li>
            )}
            {tab === 'messages' && convoRows.map((c) => {
              const m = lastMsg(c)
              return (
                <li key={c.id}>
                  <button type="button" className={`vm-row ${!composing && c.id === activeConvo ? 'is-on' : ''} ${c.unread ? 'is-unread' : ''}`} onClick={() => pickConvo(c.id)}>
                    {c.who.length > 1 ? <span className="vm-stack">{c.who.slice(0, 2).map((w) => <Face key={w} id={w} size={28} />)}</span> : <Face id={c.who[0]} size={40} />}
                    <span className="vm-row__main">
                      <span className="vm-row__top"><b>{convoName(c)}</b><time>{c.last}</time></span>
                      <span className="vm-row__bot">
                        <span className="vm-row__prev">{m?.emailed && m.from !== 'me' && <Mail size={12} aria-label="Also emailed" />} {preview(c)}</span>
                        {c.unread > 0 && <span className="vm-badge">{c.unread}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            {tab === 'announcements' && groupRows.map((g) => (
              <li key={g.id}>
                <button type="button" className={`vm-row ${g.id === activeGroup ? 'is-on' : ''} ${g.unread ? 'is-unread' : ''}`} onClick={() => pickGroup(g.id)}>
                  <span className="vm-group-ic sm"><Megaphone size={18} /></span>
                  <span className="vm-row__main">
                    <span className="vm-row__top"><b>{g.name}</b><time>{g.last}</time></span>
                    <span className="vm-row__bot"><span className="vm-row__prev">{g.anns[g.anns.length - 1]?.title}</span>{g.unread > 0 && <span className="vm-badge">{g.unread}</span>}</span>
                  </span>
                </button>
              </li>
            ))}
            {(tab === 'messages' ? convoRows : groupRows).length === 0 && <li className="vm-list__empty text-label-2">Nothing matches “{q}”.</li>}
          </ul>
        </section>
        <section className="vm-pane">
          {tab === 'messages' ? (composing ? renderNew() : renderConvo()) : renderGroup()}
        </section>
      </div>
    </div>
  )
}
