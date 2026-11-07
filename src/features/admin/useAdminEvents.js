import { useMemo } from 'react'
import { adminEvents } from '../../mock/adminEvents.js'
import { useDemo } from '../../store/DemoStore.jsx'

const MAUREEN = 'v01' // the volunteer persona in src/mock/volunteers.js

/**
 * All admin events (seed + created in the prototype) with live saved/cancelled
 * flags. Events Maureen registers for in the volunteer view show her in the
 * admin sign-up list, so both roles tell the same story.
 */
export function useAdminEvents() {
  const { admin, volunteer } = useDemo()
  return useMemo(
    () =>
      [...adminEvents, ...admin.createdEvents].map((e) => {
        const joined = volunteer.registered.includes(e.id) || volunteer.attended.includes(e.id)
        const signups = joined ? [MAUREEN, ...e.signups.filter((id) => id !== MAUREEN)] : e.signups.filter((id) => id !== MAUREEN)
        const surveyMissing =
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
    [admin.createdEvents, admin.saved, admin.cancelled, volunteer.registered, volunteer.attended, volunteer.surveyResponses],
  )
}
