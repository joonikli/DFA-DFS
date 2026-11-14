import { useMemo } from 'react'
import { grants } from '../../mock/grants.js'
import { useDemo } from '../../store/DemoStore.jsx'

/** Seed grants + applications started in the prototype, with uploaded docs merged in. */
export function useGrants() {
  const { admin } = useDemo()
  return useMemo(
    () =>
      [...admin.createdGrants, ...grants].map((g) => {
        const extra = admin.grantUploads[g.id] ?? {}
        const uploaded = { ...g.uploaded }
        for (const [doc, files] of Object.entries(extra)) uploaded[doc] = [...(uploaded[doc] ?? []), ...files]
        return { ...g, uploaded }
      }),
    [admin.createdGrants, admin.grantUploads],
  )
}

export const money = (n) => `$${n.toLocaleString('en-US')}`
export const shortDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
