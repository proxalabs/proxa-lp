import type { Redirect } from '@/payload-types'

import { getPayloadClient } from './payload'

const PREFIX: Record<string, string> = { posts: '/blog', 'case-studies': '/case-studies', pages: '' }

function target(to: Redirect['to']): string | null {
  if (!to) return null
  if (to.type === 'custom') return to.url?.trim() || null
  const ref = to.reference
  if (ref && typeof ref.value === 'object' && ref.value?.slug) return `${PREFIX[ref.relationTo] ?? ''}/${ref.value.slug}`
  return null
}

/**
 * Where a marketer-managed redirect sends this path, or null. Called only when
 * the requested page does not exist. A rule that points back at itself is ignored.
 */
export async function findRedirect(path: string): Promise<string | null> {
  const clean = path.replace(/\/+$/, '') || '/'
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'redirects',
    where: { from: { in: [clean, `${clean}/`] } },
    depth: 1,
    limit: 1,
    pagination: false,
    overrideAccess: false,
  })
  const to = docs[0] ? target(docs[0].to) : null
  if (!to || (to.replace(/\/+$/, '') || '/') === clean) return null
  return to
}
