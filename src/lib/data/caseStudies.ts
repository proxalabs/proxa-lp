import { cache } from 'react'

import type { CaseStudy } from '@/payload-types'

import { displayDate, getPayloadClient, mediaUrl, readOptions } from './payload'

export type CaseStudyView = {
  id: number
  slug: string
  title: string
  client: string
  industry: string
  summary: string
  stats: { value: string; label: string }[]
  challenge: string
  solution: string
  results: string
  heroImage: string
  date: string
  isoDate: string | null
  updatedAt: string
  order: number | null
  metaTitle: string
  description: string
  canonical: string
  ogImage: string
  noindex: boolean
}

const toView = (cs: CaseStudy): CaseStudyView => ({
  id: cs.id,
  slug: cs.slug,
  title: cs.title,
  client: cs.client || '',
  industry: cs.industry || '',
  summary: cs.summary || '',
  stats: (cs.stats || []).map((s) => ({ value: s.value || '', label: s.label || '' })),
  challenge: cs.challenge || '',
  solution: cs.solution || '',
  results: cs.results || '',
  heroImage: mediaUrl(cs.heroImage, 'card'),
  date: displayDate(cs.publishedDate),
  isoDate: cs.publishedDate || null,
  updatedAt: cs.updatedAt,
  order: cs.order ?? null,
  metaTitle: cs.meta?.title?.trim() || '',
  description: cs.meta?.description?.trim() || cs.summary || '',
  canonical: cs.meta?.canonical?.trim() || '',
  ogImage: mediaUrl(cs.meta?.image, 'og') || mediaUrl(cs.heroImage, 'og'),
  noindex: Boolean(cs.meta?.noindex),
})

export const getCaseStudies = cache(async (): Promise<CaseStudyView[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'case-studies', depth: 1, limit: 1000, pagination: false, ...(await readOptions()) })
  return docs.map(toView).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
})

export const getCaseStudy = cache(async (slug: string): Promise<CaseStudyView | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    pagination: false,
    ...(await readOptions()),
  })
  return docs[0] ? toView(docs[0]) : null
})
