import type { Metadata } from 'next'
import { cache } from 'react'

import { MANIFEST, defaultsFor } from '@/content/manifest'
import { mergeMenus } from '@/content/navConfig'
import { fieldName, resolveContent } from '@/lib/pageContent'
import { NOINDEX_PAGES, PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { PAGE_PATHS } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo'
import type { Media, Navigation } from '@/payload-types'

import { getPayloadClient, mediaUrl, readOptions } from './payload'

export type PageSeo = { title?: string | null; description?: string | null; image?: string | null; noindex?: boolean | null }
export type PageData = { content: Record<string, string>; seo: PageSeo; updatedAt?: string }

type ManifestField = { key: string; type: 'text' | 'textarea' | 'image' }
const manifest = MANIFEST as Record<string, { fields: ManifestField[] }>
const titles = PAGE_TITLES as Record<string, string>
const descriptions = PAGE_DESCRIPTIONS as Record<string, string>
const paths = PAGE_PATHS as Record<string, string>

/** Copy and SEO settings for a fixed marketing page: in-code defaults + CMS overrides. */
export const getPageData = cache(async (pageId: string): Promise<PageData> => {
  const defaults = defaultsFor(pageId) as Record<string, string>
  const page = manifest[pageId]
  if (!page) return { content: defaults, seo: {} }

  const payload = await getPayloadClient()
  const doc = (await payload.findGlobal({
    // The slug is built from the manifest, so it is one of the generated globals.
    slug: `page-${pageId}` as 'page-home',
    depth: 1,
    ...(await readOptions()),
  })) as unknown as Record<string, unknown>

  const overrides: Record<string, string> = {}
  for (const field of page.fields) {
    const value = doc[fieldName(field.key)]
    if (field.type === 'image') overrides[field.key] = mediaUrl(value as Media | number | null)
    else if (typeof value === 'string') overrides[field.key] = value
  }

  const seo = (doc.seo || {}) as { title?: string; description?: string; image?: Media | number | null; noindex?: boolean }
  return {
    content: resolveContent(defaults, overrides),
    seo: { title: seo.title, description: seo.description, image: mediaUrl(seo.image, 'og') || null, noindex: seo.noindex },
    updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : undefined,
  }
})

export async function fixedPageMetadata(pageId: string): Promise<Metadata> {
  const { seo } = await getPageData(pageId)
  return buildMetadata({
    title: seo.title?.trim() || titles[pageId] || titles.home,
    description: seo.description?.trim() || descriptions[pageId] || descriptions.home,
    path: paths[pageId] || '/',
    image: seo.image,
    noindex: NOINDEX_PAGES.has(pageId) || Boolean(seo.noindex),
  })
}

type MenuRow = NonNullable<Navigation['platform']>[number]

// A menu row points at a fixed page key, or at a landing page built in the CMS.
const destination = (row: MenuRow): string | null => {
  if (row.linkPage === '_built') {
    return row.linkBuiltPage && typeof row.linkBuiltPage === 'object' ? row.linkBuiltPage.slug || null : null
  }
  return row.linkPage || null
}

/** The three header dropdowns: CMS rows where set, in-code defaults otherwise. */
export const getNavMenus = cache(async () => {
  const payload = await getPayloadClient()
  const nav = await payload.findGlobal({ slug: 'navigation', depth: 1, ...(await readOptions()) })
  const rows = (list: Navigation['platform']) => (list || []).map((row) => ({ label: row.label, page: destination(row) }))
  return mergeMenus({ menus: { platform: rows(nav.platform), solutions: rows(nav.solutions), resources: rows(nav.resources) } }) as Record<
    'platform' | 'solutions' | 'resources',
    { label: string; page: string }[]
  >
})
