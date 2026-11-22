import { useMemo } from 'react'
import { adminEvents } from '../../mock/adminEvents.js'
import { useDemo } from '../../store/DemoStore.jsx'
import { inventorySurvey, surveyForEvent } from '../../mock/surveys.js'
import { adminSurveys } from '../../mock/adminSurveys.js'

const MAUREEN = 'v01' // the volunteer persona in src/mock/volunteers.js

// "YYYY-MM-DD" + "HH:MM" → Date
const at = (date, time) => {
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}

// Fields changed with "Edit" on the admin Events screen (src/features/events/eventState.js),
// applied to the event every screen reads.
function applyEdit(e, edit) {
  if (!edit) return e
  const date = edit.date ?? null
  return {
    ...e,
    name: edit.detailTitle || edit.title || e.name,
    title: edit.title ?? e.title,
    type: edit.type ?? e.type ?? e.title,
    location: edit.address ?? e.location,
    distance: edit.address !== undefined && edit.address !== e.location ? '' : e.distance,
    description: edit.description ?? e.description,
    longDescription: edit.longDescription ?? e.longDescription,
    organizerLabel: edit.organizer ?? e.organizerLabel,
    tags: edit.tagText !== undefined ? edit.tagText.split(',').map((label) => label.trim()).filter(Boolean).map((label) => ({ label, tone: e.tags.find((tag) => tag.label.toLowerCase() === label.toLowerCase())?.tone || 'purple' })) : e.tags,
    start: date && edit.start ? at(date, edit.start) : e.start,
    end: date && edit.end ? at(date, edit.end) : e.end,
    hasSurvey: edit.survey !== undefined ? Boolean(edit.survey) : e.hasSurvey,
    surveyDefinition: edit.surveyDefinition !== undefined ? edit.surveyDefinition : e.surveyDefinition,
  }
}

/**
 * All admin events (seed + created in the prototype) with live saved/cancelled
 * flags. Events Maureen registers for in the volunteer view show her in the
 * admin sign-up list, so both roles tell the same story.
 */
export function useAdminEvents() {
  const { admin, volunteer } = useDemo()
  return useMemo(
    () =>
      [...adminEvents, ...admin.createdEvents].map((seed) => {
        const survey = adminSurveys.find((s) => s.eventId === seed.id)
        const baseSurvey = survey || surveyForEvent(seed)
        const definition = seed.id === 'e13' ? inventorySurvey : { title: baseSurvey.title, questions: baseSurvey.questions.map((q) => ({ ...q, title: q.prompt, type: q.type === 'choice' || q.type === 'rating' ? 'Multiple choice' : 'Free form', options: q.type === 'rating' ? ['1', '2', '3', '4', '5'] : q.options || [''] })) }
        const e = applyEdit({ ...seed, surveyDefinition: definition }, admin.eventEdits?.[seed.id])
        const joined = volunteer.registered.includes(e.id) || volunteer.attended.includes(e.id)
        const signups = joined ? [MAUREEN, ...e.signups.filter((id) => id !== MAUREEN)] : e.signups.filter((id) => id !== MAUREEN)
        const surveyMissing = !e.hasSurvey ? [] :
          e.status === 'completed' && joined && !volunteer.surveyResponses[e.id]
            ? [...new Set([MAUREEN, ...e.surveyMissing])]
            : e.surveyMissing.filter((id) => id !== MAUREEN)
        return {
          ...e,
          signups,
          surveyMissing,
          saved: admin.saved.includes(e.id),
          status: admin.cancelled.includes(e.id) ? 'cancelled' : e.status,
        }
      }),
    [admin.createdEvents, admin.eventEdits, admin.saved, admin.cancelled, volunteer.registered, volunteer.attended, volunteer.surveyResponses],
  )
}
