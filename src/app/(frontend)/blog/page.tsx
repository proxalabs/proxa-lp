import type { Metadata } from 'next'

import { getPosts } from '@/lib/data/posts'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildMetadata } from '@/lib/seo'
import BlogIndexPage from '@/views/BlogIndexPage'

// Published posts refresh this page the moment they change; the timer is only a
// backstop for scheduled posts, which publish outside a request.
export const revalidate = 300

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLES.blog, description: PAGE_DESCRIPTIONS.blog, path: '/blog' })

export default async function Page() {
  const articles = await getPosts()
  return <BlogIndexPage articles={articles} />
}
