import type { MetadataRoute } from 'next'

import { getIndexable } from '@/lib/data/listing'
import { SITE_URL } from '@/lib/site'

// Built from the CMS, so a published post is in the sitemap straight away (the
// publish hook refreshes this route); the timer is a backstop.
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { fixed, posts, caseStudies, pages } = await getIndexable()
  const entry = (path: string, updatedAt?: string) => ({
    url: SITE_URL + (path === '/' ? '/' : path),
    ...(updatedAt ? { lastModified: new Date(updatedAt) } : {}),
  })
  return [
    ...fixed.map((f) => entry(f.path, f.updatedAt)),
    ...[...posts, ...caseStudies, ...pages].map((d) => entry(d.path, d.updatedAt)),
  ]
}
