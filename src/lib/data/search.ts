import { getPayloadClient } from './payload'

export type SearchResult = { type: string; title: string; url: string }

const KIND: Record<string, { label: string; url: (slug: string) => string }> = {
  posts: { label: 'Article', url: (s) => `/blog/${s}` },
  'case-studies': { label: 'Case study', url: (s) => `/case-studies/${s}` },
  videos: { label: 'Video', url: () => '/videos' },
  pages: { label: 'Page', url: (s) => `/${s}` },
}

/** Search published content. The index only ever holds published documents. */
export async function searchSite(query: string): Promise<SearchResult[]> {
  const q = query.trim().slice(0, 100)
  if (!q) return []
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'search',
    where: { or: [{ title: { like: q } }, { text: { like: q } }] },
    sort: 'priority',
    depth: 0,
    limit: 50,
    pagination: false,
    overrideAccess: false,
  })
  return docs
    .filter((d) => KIND[d.doc.relationTo] && d.title)
    .map((d) => ({ type: KIND[d.doc.relationTo].label, title: d.title as string, url: KIND[d.doc.relationTo].url(d.slug || '') }))
}
