import { useMemo } from 'react'
import { adminSurveys } from '../../mock/adminSurveys.js'
import { TODAY } from '../../mock/today.js'
import { PERSONAS, useDemo } from '../../store/DemoStore.jsx'
import { useAdminEvents } from '../admin/useAdminEvents.js'

/** Seed surveys + ones made in the prototype, normalized to one shape. */
export function useAdminSurveys() {
  const { admin } = useDemo()
  const events = useAdminEvents()
  return useMemo(() => {
    const created = admin.createdSurveys.map((s) => {
      const e = events.find((x) => x.id === s.eventId)
      return {
        id: s.id,
        eventId: s.eventId,
        title: s.title,
        description: e?.description ?? '',
        status: s.status,
        organizer: PERSONAS.admin.fullName,
        county: e?.location?.split(',').slice(-2, -1)[0]?.trim() || 'Allegheny County',
        tags: e?.tags ?? [],
        start: e?.start ?? TODAY,
        end: e?.end ?? TODAY,
        responses: 0,
        created: true,
        questions: s.questions.map((q) =>
          q.type === 'choice' ? { ...q, counts: q.options.map(() => 0) } : { ...q, type: 'text', answers: [] },
        ),
      }
    })
    return [...created.reverse(), ...adminSurveys].map((s) => ({ ...s, status: admin.surveyStatus[s.id] ?? s.status }))
  }, [admin.createdSurveys, admin.surveyStatus, events])
}
