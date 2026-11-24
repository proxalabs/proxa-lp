import type { Metadata } from 'next'

import JsonLd from '@/components/JsonLd'
import { getCaseStudies } from '@/lib/data/caseStudies'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildBreadcrumbLd, buildCollectionLd } from '@/lib/jsonLd'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import CaseStudiesIndexPage from '@/views/CaseStudiesIndexPage'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLES.caseStudies,
  description: PAGE_DESCRIPTIONS.caseStudies,
  path: '/case-studies',
})

export default async function Page() {
  const caseStudies = await getCaseStudies()
  const url = `${SITE_URL}/case-studies`
  return (
    <>
      <JsonLd
        data={buildCollectionLd(
          { name: 'Case studies', description: PAGE_DESCRIPTIONS.caseStudies, url, type: 'CollectionPage' },
          caseStudies.filter((c) => !c.noindex).map((c) => ({ name: c.title, url: `${SITE_URL}/case-studies/${c.slug}` })),
        )}
      />
      <JsonLd data={buildBreadcrumbLd([{ name: 'Home', url: `${SITE_URL}/` }, { name: 'Case studies', url }])} />
      <CaseStudiesIndexPage caseStudies={caseStudies} />
    </>
  )
}
