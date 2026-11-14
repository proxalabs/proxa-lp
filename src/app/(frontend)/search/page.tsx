import type { Metadata } from 'next'

import { searchSite } from '@/lib/data/search'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildMetadata } from '@/lib/seo'
import SearchPage from '@/views/SearchPage'

type Props = { searchParams: Promise<{ q?: string | string[] }> }

// Search results are not something to index.
export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLES.search,
  description: PAGE_DESCRIPTIONS.search,
  path: '/search',
  noindex: true,
})

export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q) || ''
  const results = await searchSite(query)
  return <SearchPage query={query} results={results} />
}
