import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import CustomCode from '@/components/CustomCode'
import JsonLd from '@/components/JsonLd'
import SectionRenderer from '@/components/SectionRenderer'
import { getCmsPage, getCmsPages } from '@/lib/data/pages'
import { findRedirect } from '@/lib/data/redirects'
import { buildFaqLd } from '@/lib/jsonLd'
import { buildMetadata } from '@/lib/seo'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// Everything that is not a fixed route lands here: a landing page built in the
// CMS (/<slug>), a marketer-managed redirect, or a real 404.

type Props = { params: Promise<{ slug: string[] }> }

export const revalidate = 300

// A malformed escape ("%E0%A4%A") must end as a 404, not a server error.
const safeDecode = (segment: string) => {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

const isPageSlug = (segments: string[]) => segments.length === 1 && /^[a-z0-9][a-z0-9-]*$/.test(segments[0])

export async function generateStaticParams() {
  return (await getCmsPages()).map((p) => ({ slug: [p.slug] }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = isPageSlug(slug) ? await getCmsPage(slug[0]) : null
  if (!page) return { title: `Page not found · ${SITE_NAME}` }
  return buildMetadata({
    title: `${page.metaTitle || page.title} · ${SITE_NAME}`,
    description: page.description,
    path: `/${page.slug}`,
    canonical: page.canonical,
    image: page.ogImage,
    noindex: page.noindex,
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const page = isPageSlug(slug) ? await getCmsPage(slug[0]) : null
  if (!page) {
    const to = await findRedirect('/' + slug.map(safeDecode).join('/'))
    if (to) permanentRedirect(to)
    notFound()
  }

  const url = page.canonical || `${SITE_URL}/${page.slug}`
  const name = page.metaTitle || page.title
  // A hero section renders the page's <h1>. Without one, the title is the h1, so
  // every indexable page has exactly one main heading.
  const hasHero = page.sections.some((s) => s.type === 'hero')
  const faqs = page.sections
    .filter((s) => s.type === 'faq')
    .flatMap((s) => (s.data.items as { question: string; answer: string }[]) || [])
    .map((f) => ({ q: f.question, a: f.answer }))

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': page.structuredType, name, description: page.description || undefined, url, dateModified: page.updatedAt }} />
      <JsonLd data={buildFaqLd(faqs)} />
      {page.customCode.trim() && <CustomCode code={page.customCode} />}
      {!hasHero && (
        <h1 className="t-display" style={{ maxWidth: 1100, margin: '56px auto 8px', padding: '0 24px' }}>
          {name}
        </h1>
      )}
      {page.sections.map((s, i) => (
        <SectionRenderer key={i} section={s} />
      ))}
    </>
  )
}
