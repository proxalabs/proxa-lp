import type { Metadata } from 'next'

import JsonLd from '@/components/JsonLd'
import { getPosts } from '@/lib/data/posts'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildBreadcrumbLd, buildCollectionLd } from '@/lib/jsonLd'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import BlogIndexPage from '@/views/BlogIndexPage'

// Published posts refresh this page the moment they change; the timer is only a
// backstop for scheduled posts, which publish outside a request.
export const revalidate = 300

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLES.blog, description: PAGE_DESCRIPTIONS.blog, path: '/blog' })

export default async function Page() {
  const articles = await getPosts()
  const url = `${SITE_URL}/blog`
  return (
    <>
      <JsonLd
        data={buildCollectionLd(
          { name: 'Blog', description: PAGE_DESCRIPTIONS.blog, url, type: 'Blog' },
          articles.filter((a) => !a.noindex).map((a) => ({ name: a.title, url: `${SITE_URL}/blog/${a.slug}` })),
        )}
      />
      <JsonLd data={buildBreadcrumbLd([{ name: 'Home', url: `${SITE_URL}/` }, { name: 'Blog', url }])} />
      <BlogIndexPage articles={articles} />
    </>
  )
}
