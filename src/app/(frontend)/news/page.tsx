import type { Metadata } from 'next'

import { getPosts } from '@/lib/data/posts'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildMetadata } from '@/lib/seo'
import NewsIndexPage from '@/views/NewsIndexPage'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLES.newsHub, description: PAGE_DESCRIPTIONS.newsHub, path: '/news' })

export default async function Page() {
  const articles = await getPosts()
  return <NewsIndexPage articles={articles} />
}
