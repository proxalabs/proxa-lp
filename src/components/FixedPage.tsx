import type { ComponentType } from 'react'

import JsonLd from '@/components/JsonLd'
import { getPageData } from '@/lib/data/sitePages'
import { buildBreadcrumbLd, buildPageLd } from '@/lib/jsonLd'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { PAGE_PATHS } from '@/lib/routes'
import { SITE_URL } from '@/lib/site'

type Props = {
  pageId: string
  View: ComponentType<{ content: Record<string, string> }>
}

const titles = PAGE_TITLES as Record<string, string>
const descriptions = PAGE_DESCRIPTIONS as Record<string, string>
const paths = PAGE_PATHS as Record<string, string>

// "AI Platform · Forge, Cue, Stage & Trace · Proxa Labs" → "AI Platform"
const shortName = (title: string) => title.split(' · ')[0]

/** Renders one of the fixed marketing pages with its resolved copy and structured data. */
export default async function FixedPage({ pageId, View }: Props) {
  const { content, seo } = await getPageData(pageId)
  const path = paths[pageId] || '/'
  const url = SITE_URL + path
  const name = shortName(seo.title?.trim() || titles[pageId] || '')
  const description = seo.description?.trim() || descriptions[pageId]

  return (
    <>
      {pageId !== 'home' && (
        <>
          <JsonLd data={buildPageLd(pageId, { name, description, url })} />
          <JsonLd data={buildBreadcrumbLd([{ name: 'Home', url: `${SITE_URL}/` }, { name, url }])} />
        </>
      )}
      <View content={content} />
    </>
  )
}
