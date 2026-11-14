import type { Metadata } from 'next'

import { getCaseStudies } from '@/lib/data/caseStudies'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildMetadata } from '@/lib/seo'
import CaseStudiesIndexPage from '@/views/CaseStudiesIndexPage'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLES.caseStudies,
  description: PAGE_DESCRIPTIONS.caseStudies,
  path: '/case-studies',
})

export default async function Page() {
  const caseStudies = await getCaseStudies()
  return <CaseStudiesIndexPage caseStudies={caseStudies} />
}
