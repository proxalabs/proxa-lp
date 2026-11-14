import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import type { Media } from '@/payload-types'

/** The Payload Local API: direct database access from server components. */
export const getPayloadClient = () => getPayload({ config })

/**
 * True while an editor is previewing drafts. Outside a request (build-time
 * listings, scripts) there is no draft mode, so this is simply false.
 */
export async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

/**
 * Query options for public content: the published version read as an anonymous
 * visitor, or the latest draft while an editor is previewing.
 */
export async function readOptions(): Promise<{ draft: boolean; overrideAccess: boolean }> {
  const draft = await isDraft()
  return { draft, overrideAccess: draft }
}

type MediaSize = 'thumbnail' | 'card' | 'hero' | 'og'

/** URL of an uploaded image, at a resized variant when one exists. */
export function mediaUrl(media: number | Media | null | undefined, size?: MediaSize): string {
  if (!media || typeof media !== 'object') return ''
  const sized = size ? media.sizes?.[size]?.url : null
  return sized || media.url || ''
}

export const mediaAlt = (media: number | Media | null | undefined): string =>
  media && typeof media === 'object' ? media.alt || '' : ''

/** "June 22, 2026" from a stored date, as the site has always shown dates. */
export function displayDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}
