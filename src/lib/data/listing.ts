import { PAGE_PATHS } from '@/lib/routes'

import { getCaseStudies } from './caseStudies'
import { getCmsPages } from './pages'
import { getPosts } from './posts'
import { getPageData } from './sitePages'
import { getVideos } from './videos'

// Everything public and indexable, in one place, for the sitemap, llms.txt and
// the feed. A document marked "hide from search engines" appears in none of them.

/** Fixed routes that are open to indexing, with the page key that owns each. */
export const INDEXABLE_FIXED: { path: string; pageId?: string }[] = [
  { path: '/', pageId: 'home' },
  ...(['platform', 'advisory', 'literacy', 'insitex', 'content', 'proxalab', 'about', 'news', 'resources', 'newsletter', 'contact'] as const).map(
    (pageId) => ({ path: (PAGE_PATHS as Record<string, string>)[pageId], pageId }),
  ),
  { path: '/blog' },
  { path: '/news' },
  { path: '/case-studies' },
  { path: '/videos' },
]

export type Listed = { path: string; title: string; description: string; updatedAt?: string; date?: string | null }

export async function getIndexable(): Promise<{ fixed: { path: string; updatedAt?: string }[]; posts: Listed[]; caseStudies: Listed[]; videos: Listed[]; pages: Listed[] }> {
  const [posts, caseStudies, videos, pages, fixed] = await Promise.all([
    getPosts(),
    getCaseStudies(),
    getVideos(),
    getCmsPages(),
    Promise.all(
      INDEXABLE_FIXED.map(async ({ path, pageId }) => {
        if (!pageId) return { path }
        const { seo, updatedAt } = await getPageData(pageId)
        return seo.noindex ? null : { path, updatedAt }
      }),
    ),
  ])
  return {
    fixed: fixed.filter((f): f is { path: string; updatedAt?: string } => f !== null),
    posts: posts.filter((p) => !p.noindex).map((p) => ({ path: `/blog/${p.slug}`, title: p.title, description: p.description, updatedAt: p.updatedAt, date: p.isoDate })),
    caseStudies: caseStudies.filter((c) => !c.noindex).map((c) => ({ path: `/case-studies/${c.slug}`, title: c.title, description: c.summary, updatedAt: c.updatedAt, date: c.isoDate })),
    videos: videos.filter((v) => !v.noindex).map((v) => ({ path: '/videos', title: v.title, description: v.description, date: v.isoDate })),
    pages: pages.filter((p) => !p.noindex).map((p) => ({ path: `/${p.slug}`, title: p.title, description: p.description, updatedAt: p.updatedAt })),
  }
}
