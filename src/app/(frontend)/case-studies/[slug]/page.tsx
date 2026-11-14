import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import CaseStudyLayout from '@/components/CaseStudyLayout'
import JsonLd from '@/components/JsonLd'
import { getCaseStudies, getCaseStudy } from '@/lib/data/caseStudies'
import { findRedirect } from '@/lib/data/redirects'
import { buildArticleLd, buildBreadcrumbLd } from '@/lib/jsonLd'
import { buildMetadata } from '@/lib/seo'
import { SITE_NAME, SITE_URL } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  return (await getCaseStudies()).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cs = await getCaseStudy(slug)
  if (!cs) return { title: `Case study not found · ${SITE_NAME}` }
  return buildMetadata({
    title: cs.metaTitle || `${cs.title} · Case study · ${SITE_NAME}`,
    description: cs.description,
    path: `/case-studies/${cs.slug}`,
    canonical: cs.canonical,
    image: cs.ogImage,
    noindex: cs.noindex,
    type: 'article',
    publishedTime: cs.isoDate,
    modifiedTime: cs.updatedAt,
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const cs = await getCaseStudy(slug)
  if (!cs) {
    const to = await findRedirect(`/case-studies/${slug}`)
    if (to) permanentRedirect(to)
    notFound()
  }

  const url = cs.canonical || `${SITE_URL}/case-studies/${cs.slug}`
  return (
    <>
      <JsonLd
        data={buildArticleLd(
          { title: cs.title, description: cs.description, thumb: cs.ogImage, isoDate: cs.isoDate, updatedAt: cs.updatedAt },
          url,
        )}
      />
      <JsonLd
        data={buildBreadcrumbLd([
          { name: 'Home', url: `${SITE_URL}/` },
          { name: 'Case studies', url: `${SITE_URL}/case-studies` },
          { name: cs.title, url },
        ])}
      />
      <CaseStudyLayout cs={cs} />
    </>
  )
}
