import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { eventsById, initialSurveyResponses, initialVolunteerState } from '../mock/events.js'
import { seedNotifications } from '../mock/notifications.js'
import { initialAdminState } from '../mock/adminEvents.js'
import { formatShortDate } from '../lib/dates.js'

// In-memory demo state, mirrored to localStorage so a refresh keeps the demo
// where you left it. "Reset demo data" in the avatar menu restores the seed.
// Bump the key whenever the state shape changes.
const STORAGE_KEY = 'dfs-prototype-v3'

const seed = {
  role: 'volunteer', // 'volunteer' | 'admin'
  volunteer: {
    ...initialVolunteerState,
    registrations: {}, // eventId → { from, to, contact, notes, notify }
    surveyResponses: initialSurveyResponses, // eventId → { questionId: { answer, other? } }
    postEventSeenFor: null, // eventId whose "Thank you" popup was already shown
    dismissedAnnouncements: [],
  },
  notifications: seedNotifications, // { volunteer: [...], admin: [...] }
  profiles: {}, // role → edits made with "Edit profile" (bio, title, city, phone)
  admin: {
    ...initialAdminState,
    drafts: [], // events saved with "Save draft"
    createdSurveys: [], // surveys made with "Create new survey"
    surveyStatus: {}, // surveyId → 'open' | 'closed' overrides
    notes: {}, // volunteerId → admin notes text
    grantUploads: {}, // grantId → { docId: [filenames] } added in the prototype
    createdGrants: [], // applications started from Explore / "Create application"
  },
}

// Dates don't survive JSON; revive the ones on admin-created events.
const reviveEvent = (e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) })

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const saved = JSON.parse(raw)
    const admin = { ...seed.admin, ...saved.admin }
    admin.createdEvents = admin.createdEvents.map(reviveEvent)
    admin.drafts = admin.drafts.map(reviveEvent)
    admin.createdGrants = (admin.createdGrants ?? []).map((g) => ({ ...g, due: new Date(g.due), applied: g.applied && new Date(g.applied) }))
    return { ...seed, ...saved, admin }
  } catch {
    return seed
  }
}

const toggle = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
const vol = (state, patch) => ({ ...state, volunteer: { ...state.volunteer, ...patch } })
const pushNotification = (state, role, n) => ({
  ...state,
  notifications: { ...state.notifications, [role]: [n, ...state.notifications[role]] },
})

function reducer(state, action) {
  switch (action.type) {
    case 'setRole':
      return { ...state, role: action.role }
    case 'toggleSaved':
      return vol(state, { saved: toggle(state.volunteer.saved, action.id) })
    case 'register': {
      const e = eventsById[action.id]
      const next = vol(state, {
        registered: [...new Set([...state.volunteer.registered, action.id])],
        registrations: { ...state.volunteer.registrations, [action.id]: action.details },
      })
      return pushNotification(next, 'volunteer', {
        id: `n-${Date.now()}`,
        variant: 'success',
        parts: [['You', true], [' successfully registered for the event ', false], [e.title, true]],
        time: 'Now',
        category: 'Event',
        unread: true,
        link: { label: e.title, detail: formatShortDate(e.start), to: '/events?tab=registered' },
      })
    }
    case 'unregister':
      return vol(state, { registered: state.volunteer.registered.filter((x) => x !== action.id) })
    case 'submitSurvey':
      return vol(state, { surveyResponses: { ...state.volunteer.surveyResponses, [action.id]: action.answers } })
    case 'seenPostEvent':
      return vol(state, { postEventSeenFor: action.id })
    case 'dismissAnnouncement':
      return vol(state, { dismissedAnnouncements: [...state.volunteer.dismissedAnnouncements, action.id] })
    case 'markRead':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [state.role]: state.notifications[state.role].map((n) => (!action.id || n.id === action.id ? { ...n, unread: false } : n)),
        },
      }
    // ---- admin ----
    case 'adminToggleSaved':
      return { ...state, admin: { ...state.admin, saved: toggle(state.admin.saved, action.id) } }
    case 'adminCreateEvent':
      return {
        ...state,
        admin: {
          ...state.admin,
          createdEvents: [...state.admin.createdEvents, action.event],
          drafts: state.admin.drafts.filter((d) => d.id !== action.event.id),
        },
      }
    case 'adminSaveDraft':
      return {
        ...state,
        admin: { ...state.admin, drafts: [...state.admin.drafts.filter((d) => d.id !== action.event.id), action.event] },
      }
    case 'adminCancelEvent':
      return { ...state, admin: { ...state.admin, cancelled: toggle(state.admin.cancelled, action.id) } }
    case 'adminCreateSurvey':
      return { ...state, admin: { ...state.admin, createdSurveys: [...state.admin.createdSurveys, action.survey] } }
    case 'grantUpload': {
      const forGrant = state.admin.grantUploads[action.grantId] ?? {}
      return {
        ...state,
        admin: {
          ...state.admin,
          grantUploads: {
            ...state.admin.grantUploads,
            [action.grantId]: { ...forGrant, [action.docId]: [...(forGrant[action.docId] ?? []), action.file] },
          },
        },
      }
    }
    case 'setNote':
      return { ...state, admin: { ...state.admin, notes: { ...state.admin.notes, [action.id]: action.text } } }
    case 'editProfile':
      return { ...state, profiles: { ...state.profiles, [state.role]: { ...state.profiles?.[state.role], ...action.patch } } }
    case 'grantCreate':
      return { ...state, admin: { ...state.admin, createdGrants: [action.grant, ...state.admin.createdGrants] } }
    case 'adminSetSurveyStatus':
      return { ...state, admin: { ...state.admin, surveyStatus: { ...state.admin.surveyStatus, [action.id]: action.status } } }
    case 'reset':
      return { ...seed, role: state.role }
    default:
      return state
  }
}

const DemoContext = createContext(null)

export function DemoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable (private window etc.) — demo still works in memory
    }
  }, [state])

  /** Show a Notification toast for 4s. `toast` = Notification props. */
  const showToast = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { ...toast, id }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      toasts,
      showToast,
      dismissToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
      setRole: (role) => dispatch({ type: 'setRole', role }),
      toggleSaved: (id) => dispatch({ type: 'toggleSaved', id }),
      register: (id, details) => dispatch({ type: 'register', id, details }),
      unregister: (id) => dispatch({ type: 'unregister', id }),
      submitSurvey: (id, answers) => dispatch({ type: 'submitSurvey', id, answers }),
      markPostEventSeen: (id) => dispatch({ type: 'seenPostEvent', id }),
      dismissAnnouncement: (id) => dispatch({ type: 'dismissAnnouncement', id }),
      markRead: (id) => dispatch({ type: 'markRead', id }),
      adminToggleSaved: (id) => dispatch({ type: 'adminToggleSaved', id }),
      adminCreateEvent: (event) => dispatch({ type: 'adminCreateEvent', event }),
      adminSaveDraft: (event) => dispatch({ type: 'adminSaveDraft', event }),
      adminCancelEvent: (id) => dispatch({ type: 'adminCancelEvent', id }),
      adminCreateSurvey: (survey) => dispatch({ type: 'adminCreateSurvey', survey }),
      adminSetSurveyStatus: (id, status) => dispatch({ type: 'adminSetSurveyStatus', id, status }),
      grantUpload: (grantId, docId, file) => dispatch({ type: 'grantUpload', grantId, docId, file }),
      grantCreate: (grant) => dispatch({ type: 'grantCreate', grant }),
      setNote: (id, text) => dispatch({ type: 'setNote', id, text }),
      editProfile: (patch) => dispatch({ type: 'editProfile', patch }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state, toasts, showToast],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>')
  return ctx
}

export const PERSONAS = {
  admin: {
    name: 'Bridget',
    fullName: 'Bridget Moore',
    roleLabel: 'Admin',
    title: 'Volunteer Manager',
    city: 'Pittsburgh, PA',
    email: 'bridget.moore@dressforsuccess.org',
    phone: '412-555-0142',
    joined: 'March 3, 2021',
    bio: 'Hi! I’m the Volunteer Manager at Dress for Success Pittsburgh, where I help coordinate volunteer-supported events and make sure each opportunity runs smoothly. I work with volunteers to answer event questions, share updates, support scheduling changes, and verify service hours.',
  },
  volunteer: {
    name: 'Maureen',
    fullName: 'Maureen Lee',
    roleLabel: 'Volunteer',
    title: 'Individual',
    city: 'Pittsburgh, PA',
    phone: '412-829-8069',
    email: 'maureen.lee@gmail.com',
    joined: 'August 12, 2023',
    bio: 'Hi, I’m Maureen! I volunteer with Dress for Success Pittsburgh on styling shifts and resume reviews. I love helping women walk into interviews feeling confident and ready.',
  },
}
