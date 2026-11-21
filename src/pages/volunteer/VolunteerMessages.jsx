// Volunteer messaging (Maureen's side). Built from the SAME markup, classes and design-system
// components as the manager's Messages screen (src/features/messages), rendered inside the manager
// scope so both sides share one stylesheet: list column (Tab nav, Search bar, Sub nav), conversation
// header, bubbles, "Today" / "New" dividers, composer, announcement posts.
// Volunteer differences, kept deliberately small: no threads, no side panel; volunteers message
// coordinators and react; announcements are read-only (react, or reply privately when the post asks).
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TabNav from '../../components/TabNav/TabNav.jsx'
import Button from '../../components/Button/Button.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import SubNav from '../../components/SubNav/SubNav.jsx'
import { Icon } from '../../components/Icon.jsx'
import { useDemo } from '../../store/DemoStore.jsx'
import { eventsById } from '../../mock/events.js'
import { formatTimeRange, MONTHS } from '../../lib/dates.js'
import { AUTO_REPLIES, PEOPLE, STAFF } from '../../mock/messages.js'
import myPhoto from '../../assets/avatar-volunteer.png'

const who = (id) => PEOPLE[id] || { name: 'Volunteer', first: 'Volunteer' }
const convoName = (c) => c.name || who(c.who[0]).name
const lastMsg = (c) => c.msgs[c.msgs.length - 1]
const initials = (n) => n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
let seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}-${++seq}`

/** Same avatar element as the manager screen (.av sized by class) */
function Av({ id, className = '' }) {
  const p = id === 'me' ? { ...PEOPLE.me, photo: myPhoto } : who(id)
  return <span className={`av ${className}`} aria-hidden="true">{p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}</span>
}

/** Shift card (manager .event-card anatomy) */
function EventCard({ id }) {
  const e = eventsById[id]
  const navigate = useNavigate()
  if (!e) return null
  return (
    <div className="event-card" role="button" tabIndex={0} onClick={() => navigate(`/events/${id}`)} style={{ cursor: 'pointer' }}>
      <div className="ec-date"><span className="ec-mon">{MONTHS[e.start.getMonth()].slice(0, 3)}</span><span className="ec-day">{e.start.getDate()}</span></div>
      <div className="ec-body">
        <div className="ec-meta">{formatTimeRange(e.start, e.end)}, {e.location}</div>
        <div className="ec-title">{e.title}</div>
      </div>
    </div>
  )
}

function Reacts({ reacts, mine = [], onToggle }) {
  const entries = Object.entries(reacts).filter(([, v]) => (Array.isArray(v) ? v.length : v > 0))
  if (!entries.length) return null
  return (
    <div className="reacts">
      {entries.map(([e, v]) => {
        const isMine = Array.isArray(v) ? v.includes('me') : mine.includes(e)
        return (
          <button key={e} className={`react ${isMine ? 'mine' : ''}`} aria-pressed={isMine} onClick={() => onToggle(e)}>
            {e} <span className="n">{Array.isArray(v) ? v.length : v}</span>
          </button>
        )
      })}
    </div>
  )
}

function Composer({ placeholder, onSend, context, onClearContext }) {
  const [text, setText] = useState('')
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  const grow = (t) => { t.style.height = 'auto'; t.style.height = `${Math.min(t.scrollHeight, 168)}px` }
  const send = () => {
    const v = text.trim()
    if (!v) return
    onSend(v)
    setText('')
    requestAnimationFrame(() => ref.current && grow(ref.current))
  }
  return (
    <div className="composer-wrap">
      <div className="composer">
        {context && (
          <div className="priv-note"><Icon name="megaphone" size={12} /> Private reply to “{context}”
            <button className="link" style={{ marginLeft: 'auto' }} onClick={onClearContext}>Remove</button></div>
        )}
        <textarea
          ref={ref} rows={2} value={text} placeholder={placeholder} aria-label={placeholder}
          onChange={(e) => { setText(e.target.value); grow(e.target) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() } }}
        />
        <div className="comp-bar"><div className="grow" /><Button color="primary" size="sm" onClick={send}>Send</Button></div>
      </div>
    </div>
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
  const [filter, setFilter] = useState('all')
  const [newFrom, setNewFrom] = useState(null) // { id, n } → "New" divider position
  const [composing, setComposing] = useState(false)
  const [reAnn, setReAnn] = useState(null) // { convoId, title } private reply context
  const [flash, setFlash] = useState(params.get('ann'))
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

  // Opening something marks it read, remembering where the unread run started ("New" divider)
  const openItem = tab === 'messages' ? (composing ? null : convo) : group
  useEffect(() => {
    if (!openItem || !openItem.unread) return
    setNewFrom({ id: openItem.id, n: openItem.unread })
    ;(tab === 'messages' ? setConvo : setGroup)(openItem.id, (x) => ({ ...x, unread: 0 }))
  }, [openItem?.id, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the stream at the newest message; a linked announcement scrolls into view instead
  const streamLen = tab === 'messages' ? convo?.msgs.length ?? 0 : group?.anns.length ?? 0
  useLayoutEffect(() => {
    const s = streamRef.current
    if (!s) return
    const target = flash && s.querySelector(`[data-ann="${flash}"]`)
    s.scrollTop = target ? target.offsetTop - 24 : s.scrollHeight
  }, [tab, activeConvo, activeGroup, streamLen, composing]) // eslint-disable-line react-hooks/exhaustive-deps

  // Links to a specific announcement (dashboard "View message") work even while you're here
  const annParam = params.get('ann')
  useEffect(() => {
    if (!annParam) return
    const g = messages.groups.find((x) => x.anns.some((a) => a.id === annParam))
    if (!g) return
    setTab('announcements'); setComposing(false); setActiveGroup(g.id); setFlash(annParam)
  }, [annParam]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!flash) return undefined
    const t = setTimeout(() => { setFlash(null); setParams({}, { replace: true }) }, 1800)
    return () => clearTimeout(t)
  }, [flash]) // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (t) => { setTab(t); setComposing(false); setNewFrom(null); if (t === 'announcements' && filter === 'direct') setFilter('all') }
  const pickConvo = (id) => { setActiveConvo(id); setComposing(false); setNewFrom(null); if (reAnn?.convoId !== id) setReAnn(null) }
  const pickGroup = (id) => { setActiveGroup(id); setNewFrom(null) }

  // Start (or reopen) a 1:1 with a coordinator
  const openDirect = (staffId, context) => {
    const existing = messages.convos.find((c) => !c.name && c.who.length === 1 && c.who[0] === staffId)
    let id = existing?.id
    if (!id) {
      id = uid('c')
      updateMessages((s) => ({ ...s, convos: [{ id, who: [staffId], unread: 0, last: 'Now', msgs: [] }, ...s.convos] }))
    }
    setTab('messages'); setComposing(false); setNewFrom(null)
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
    if (c.who.length === 1) {
      // The coordinator sees it and answers
      const staff = c.who[0]
      setTimeout(() => setMsg(c.id, mid, (x) => ({ ...x, status: 'seen' })), 900)
      setTimeout(() => {
        const pool = AUTO_REPLIES[staff] || ['Thanks!']
        const reply = { id: uid('m'), from: staff, day: 'Today', time: 'Just now', text: pool[Math.floor(Math.random() * pool.length)], reacts: {}, replies: [] }
        const here = viewing.current.tab === 'messages' && !viewing.current.composing && viewing.current.activeConvo === c.id
        setConvo(c.id, (x) => ({ ...x, msgs: [...x.msgs, reply], unread: here ? 0 : x.unread + 1 }))
        if (!here) showToast({ variant: 'default', image: who(staff).photo, parts: [[who(staff).name, true], [' replied', false]], preview: `“${reply.text}”`, time: 'Now', category: 'Messages' })
      }, 2600)
    } else {
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

  /* ---------- list column ---------- */
  const needle = q.trim().toLowerCase()
  const preview = (c) => {
    const m = lastMsg(c)
    if (!m) return 'No messages yet'
    const by = m.from === 'me' ? 'You: ' : c.who.length > 1 ? `${who(m.from).first}: ` : ''
    return by + (m.event && !m.text ? `Shared ${eventsById[m.event]?.title}` : m.text)
  }
  const convoRows = messages.convos
    .filter((c) => (filter !== 'unread' || c.unread || c.id === activeConvo) && (filter !== 'direct' || c.who.length === 1))
    .filter((c) => !needle || convoName(c).toLowerCase().includes(needle) || preview(c).toLowerCase().includes(needle))
  const groupRows = messages.groups
    .filter((g) => filter !== 'unread' || g.unread || g.id === activeGroup)
    .filter((g) => !needle || g.name.toLowerCase().includes(needle))

  const TabLabel = ({ label, n }) => <>{label}{n ? <span className="tab-badge" aria-label={`${n} unread`}>{n}</span> : null}</>

  /* ---------- conversation ---------- */
  const renderConvo = () => {
    if (!convo) return <div className="stream-empty" style={{ margin: 'auto' }}>Select a conversation</div>
    const solo = convo.who.length === 1
    const ni = newFrom?.id === convo.id ? convo.msgs.length - newFrom.n : -1
    let prevDay = null
    return (
      <>
        <header className="conv-head">
          {solo ? <Av id={convo.who[0]} className="lg" /> : <span className="av-stack lg">{convo.who.slice(0, 2).map((w) => <Av key={w} id={w} />)}</span>}
          <div><div className="h3">{convoName(convo)}</div><div className="sub">{solo ? who(convo.who[0]).role : `${convo.who.map((w) => who(w).first).join(', ')} · Group message`}</div></div>
        </header>
        <div className="conv-body">
          <div className="stream-col">
            <div className="stream" id="stream" ref={streamRef}>
              {convo.msgs.length === 0 && <div className="stream-empty" style={{ margin: 'auto' }}>Say hello to {who(convo.who[0]).first}. Replies show up here.</div>}
              {convo.msgs.map((m, i) => {
                const me = m.from === 'me'
                const showDay = m.day !== prevDay
                prevDay = m.day
                const prev = convo.msgs[i - 1]
                const cont = !showDay && i !== ni && prev && prev.from === m.from
                return (
                  <Fragment key={m.id}>
                    {showDay && <div className="day-div">{m.day}</div>}
                    {i === ni && <div className="new-div" role="separator"><span>New</span></div>}
                    <div className={`msg ${me ? 'me' : ''} ${cont ? 'cont' : ''} ${m.time === 'Just now' ? 'is-new-msg' : ''}`}>
                      {!me && <Av id={m.from} />}
                      <div className="msg-col">
                        <div className="msg-tools" role="toolbar" aria-label="Message actions">
                          <button className="icon-btn plain" onClick={() => toggleMsgReact(m.id, '👍')} aria-label="React with thumbs up"><Icon name="smile" size={16} /></button>
                        </div>
                        {!me && !cont && !solo && <div className="msg-name">{who(m.from).name}</div>}
                        {m.reAnn && <div className="msg-re"><Icon name="megaphone" size={12} /> Private reply to your announcement · {m.reAnn}</div>}
                        {m.text && <div className={`bubble ${m.subject ? 'email' : ''}`}>{m.subject && <span className="subj">{m.subject}</span>}{m.text}</div>}
                        {m.event && <div style={{ marginTop: 8, width: '100%', minWidth: 360 }}><EventCard id={m.event} /></div>}
                        <div className="msg-time">
                          {m.emailed && <span className="via"><Icon name="mail" size={14} /> Also sent to your email</span>}
                          {m.time}{me && m.status && <span className="st"> · {m.status === 'seen' ? 'Seen' : 'Sent'}</span>}
                        </div>
                        <Reacts reacts={m.reacts} onToggle={(e) => toggleMsgReact(m.id, e)} />
                      </div>
                    </div>
                  </Fragment>
                )
              })}
            </div>
            <Composer
              key={convo.id}
              placeholder="Write a message…"
              onSend={send}
              context={reAnn?.convoId === convo.id ? reAnn.title : null}
              onClearContext={() => setReAnn(null)}
            />
          </div>
        </div>
      </>
    )
  }

  // New message: coordinators only (same guided empty state as the manager's compose screen)
  const renderNew = () => (
    <>
      <div className="to-field"><label>To:</label><div className="to-chips"><span className="to-input" style={{ color: 'var(--neutral-dark-gray)' }}>Choose a coordinator</span></div>
        <Button color="secondary" size="sm" onClick={() => setComposing(false)}>Discard</Button></div>
      <div className="conv-body"><div className="stream-col"><div className="stream cmp-stream"><div className="cmp-wrap"><div className="cmp-empty">
        <div className="cmp-icon"><Icon name="pen" size={22} /></div>
        <h3>New message</h3>
        <p>Message a Dress for Success coordinator. Group chats are started by coordinators, and they’ll add you.</p>
        <div className="cmp-sugg">
          {STAFF.map((id) => (
            <button key={id} className="cmp-opt" onClick={() => openDirect(id)}>
              <span className="cmp-avs"><Av id={id} /></span>
              <span className="cmp-txt"><b>{who(id).name}</b><small>{who(id).role}</small></span><Icon name="plus" size={16} />
            </button>
          ))}
        </div>
      </div></div></div></div></div>
    </>
  )

  const renderGroup = () => {
    if (!group) return <div className="stream-empty" style={{ margin: 'auto' }}>Select a group</div>
    const ni = newFrom?.id === group.id ? group.anns.length - newFrom.n : -1
    return (
      <>
        <header className="conv-head">
          <span className="av lg grp-ic"><Icon name="megaphone" size={20} /></span>
          <div><div className="h3">{group.name}</div><div className="sub">{group.count} members · Only coordinators post here</div></div>
        </header>
        <div className="conv-body">
          <div className="stream-col">
            <div className="stream posts" id="stream" ref={streamRef}>
              {group.anns.map((a, i) => {
                const author = who(a.from)
                return (
                  <Fragment key={a.id}>
                    {i === ni && <div className="new-div" role="separator"><span>New</span></div>}
                    {(i === 0 || group.anns[i - 1].day !== a.day) && <div className="day-div">{a.day}</div>}
                    <article className={`post ${flash === a.id ? 'is-new-msg' : ''}`} data-ann={a.id}>
                      <Av id={a.from} className="post-av" />
                      <div className="post-main">
                        <header className="post-head"><b>{author.name}</b><time>{a.time}</time>
                          {a.replyMode === 'private' && <span className="post-chip"><Icon name="lock" size={12} /> Private replies</span>}
                        </header>
                        <div className="post-card"><h3 className="ann-title">{a.title}</h3><div className="ann-body">{a.body}</div></div>
                        <Reacts reacts={a.reacts} mine={a.mine} onToggle={(e) => toggleAnnReact(a.id, e)} />
                        <div className="post-foot">
                          {a.replyMode === 'private'
                            ? <Button color="secondary" size="sm" onClick={() => openDirect(a.from, a.title)}>Reply privately to {author.first}</Button>
                            : a.replies.length > 0 && <span className="thread-link" style={{ cursor: 'default' }}><b>{a.replies.length} {a.replies.length === 1 ? 'reply' : 'replies'}</b><span className="last">from the group</span></span>}
                        </div>
                      </div>
                    </article>
                  </Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </>
    )
  }

  const filters = tab === 'messages' ? ['all', 'unread', 'direct'] : ['all', 'unread']
  return (
    <div className="msgs">
        <section className="list-col">
          <div className="list-head">
            <div className="row"><h1 className="h1">Messages</h1><Button color="primary" size="sm" onClick={() => { setTab('messages'); setComposing(true) }}>Compose</Button></div>
            <div id="tabSeg"><TabNav label="Messages sections" value={tab} onChange={switchTab} tabs={[{ value: 'messages', label: <TabLabel label="Message" n={unreadMsgs} /> }, { value: 'announcements', label: <TabLabel label="Announcements" n={unreadAnns} /> }]} /></div>
            <SearchBar value={q} onChange={setQ} placeholder="Search" label="Search conversations" />
            <div className="filters">
              <SubNav label="Filter conversations" value={filter} onChange={setFilter} items={filters.map((f) => ({ value: f, label: f[0].toUpperCase() + f.slice(1) }))} />
            </div>
          </div>
          <ul className="convos" id="convList">
            {tab === 'messages' && composing && (
              <li><button className="convo draft-row on"><span className="av list draft-av"><Icon name="pen" size={18} /></span>
                <span className="convo-main"><span className="convo-top"><span className="convo-name">New message</span><span className="convo-time">Draft</span></span>
                  <span className="convo-bot"><span className="convo-prev">Choose a coordinator</span></span></span></button></li>
            )}
            {tab === 'messages' && convoRows.map((c) => {
              const m = lastMsg(c)
              return (
                <li key={c.id}>
                  <button className={`convo ${!composing && c.id === activeConvo ? 'on' : ''} ${c.unread ? 'unread' : ''}`} onClick={() => pickConvo(c.id)}>
                    {c.who.length > 1 ? <span className="av-stack">{c.who.slice(0, 2).map((w) => <Av key={w} id={w} />)}</span> : <Av id={c.who[0]} className="list" />}
                    <span className="convo-main">
                      <span className="convo-top"><span className="convo-name">{convoName(c)}</span><span className="convo-time">{c.last}</span></span>
                      <span className="convo-bot"><span className="convo-prev">{m?.emailed && m.from !== 'me' && <><Icon name="mail" size={12} /> </>}{preview(c)}</span>{c.unread ? <span className="badge">{c.unread}</span> : null}</span>
                    </span>
                  </button>
                </li>
              )
            })}
            {tab === 'announcements' && groupRows.map((g) => (
              <li key={g.id}>
                <button className={`convo ${g.id === activeGroup ? 'on' : ''} ${g.unread ? 'unread' : ''}`} onClick={() => pickGroup(g.id)}>
                  <span className="av list grp-ic"><Icon name="megaphone" size={20} /></span>
                  <span className="convo-main">
                    <span className="convo-top"><span className="convo-name">{g.name}</span><span className="convo-time">{g.last}</span></span>
                    <span className="convo-bot"><span className="convo-prev">{g.anns[g.anns.length - 1]?.title}</span>{g.unread ? <span className="badge">{g.unread}</span> : null}</span>
                  </span>
                </button>
              </li>
            ))}
            {(tab === 'messages' ? convoRows : groupRows).length === 0 && <li className="empty-list">Nothing here{q ? ` for “${q}”` : ''}.</li>}
          </ul>
        </section>
        <section className="conv" id="conv">
          {tab === 'messages' ? (composing ? renderNew() : renderConvo()) : renderGroup()}
        </section>
    </div>
  )
}
