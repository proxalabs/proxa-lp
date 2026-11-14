import type { Metadata } from 'next'

import JsonLd from '@/components/JsonLd'
import { isNewsCategory } from '@/lib/blog'
import { getPosts } from '@/lib/data/posts'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildBreadcrumbLd, buildCollectionLd } from '@/lib/jsonLd'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import NewsIndexPage from '@/views/NewsIndexPage'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLES.newsHub, description: PAGE_DESCRIPTIONS.newsHub, path: '/news' })

export default async function Page() {
  const articles = await getPosts()
  const url = `${SITE_URL}/news`
  return (
    <>
      <JsonLd
        data={buildCollectionLd(
          { name: 'News', description: PAGE_DESCRIPTIONS.newsHub, url, type: 'CollectionPage' },
          articles.filter((a) => !a.noindex && isNewsCategory(a.pillar)).map((a) => ({ name: a.title, url: `${SITE_URL}/blog/${a.slug}` })),
        )}
      />
      <JsonLd data={buildBreadcrumbLd([{ name: 'Home', url: `${SITE_URL}/` }, { name: 'News', url }])} />
      <NewsIndexPage articles={articles} />
    </>
  )
}
