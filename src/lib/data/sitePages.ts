import type { Metadata } from 'next'

import { defaultsFor } from '@/content/manifest'
import { resolveContent } from '@/lib/pageContent'
import { NOINDEX_PAGES, PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { PAGE_PATHS } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo'

export type PageSeo = { title?: string | null; description?: string | null; image?: string | null; noindex?: boolean | null }
export type PageData = { content: Record<string, string>; seo: PageSeo }

const titles = PAGE_TITLES as Record<string, string>
const descriptions = PAGE_DESCRIPTIONS as Record<string, string>
const paths = PAGE_PATHS as Record<string, string>

/** Copy and SEO settings for a fixed marketing page: in-code defaults + CMS overrides. */
export async function getPageData(pageId: string): Promise<PageData> {
  return { content: resolveContent(defaultsFor(pageId), {}), seo: {} }
}

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
