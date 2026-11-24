import { cache } from 'react'

import { lexicalToHtml } from '@/lib/lexical'
import type { Form, Page } from '@/payload-types'

import { toPublicForm } from './forms'
import { getPayloadClient, mediaAlt, mediaUrl, readOptions } from './payload'

type Block = NonNullable<Page['layout']>[number]
export type Section = { type: string; data: Record<string, unknown> }

export type CmsPage = {
  id: number
  slug: string
  title: string
  metaTitle: string
  description: string
  canonical: string
  ogImage: string
  noindex: boolean
  structuredType: string
  customCode: string
  sections: Section[]
  updatedAt: string
}

// A button points at a fixed page key, or at another landing page (by its slug).
const ctaPage = (b: { ctaPage?: string | null; ctaBuiltPage?: number | Page | null }): string | undefined => {
  if (b.ctaPage === '_built') return b.ctaBuiltPage && typeof b.ctaBuiltPage === 'object' ? b.ctaBuiltPage.slug : undefined
  return b.ctaPage || undefined
}

// Each CMS block becomes the `data` its section component has always taken
// (see SECTION_KIT in src/lib/pageSections.jsx).
function toSection(b: Block): Section | null {
  switch (b.blockType) {
    case 'hero':
      return { type: 'hero', data: { eyebrow: b.eyebrow, headline: b.headline, subhead: b.subhead, ctaLabel: b.ctaLabel, ctaPage: ctaPage(b), dark: b.dark } }
    case 'split':
      return { type: 'split', data: { eyebrow: b.eyebrow, heading: b.heading, body: b.body, image: mediaUrl(b.image, 'card'), imageAlt: mediaAlt(b.image), reverse: b.reverse } }
    case 'richText':
      return { type: 'richText', data: { heading: b.heading, body: lexicalToHtml(b.body) } }
    case 'cards':
      return { type: 'cards', data: { eyebrow: b.eyebrow, heading: b.heading, lead: b.lead, cards: (b.cards || []).map((c) => ({ title: c.title, body: c.body })) } }
    case 'stats':
      return { type: 'stats', data: { stats: (b.stats || []).map((s) => ({ value: s.value, label: s.label, source: s.source })) } }
    case 'quote':
      return { type: 'quote', data: { quote: b.quote, author: b.author } }
    case 'cta':
      return { type: 'cta', data: { heading: b.heading, body: b.body, ctaLabel: b.ctaLabel, ctaPage: ctaPage(b) } }
    case 'faq':
      return { type: 'faq', data: { heading: b.heading, items: (b.items || []).map((i) => ({ question: i.question, answer: i.answer })) } }
    case 'logoStrip':
      return { type: 'logoStrip', data: { heading: b.heading, logos: (b.logos || []).map((l) => ({ image: mediaUrl(l.image, 'thumbnail'), name: l.name || mediaAlt(l.image) })) } }
    case 'form':
      return { type: 'form', data: { heading: b.heading, form: b.form && typeof b.form === 'object' ? toPublicForm(b.form as Form) : null } }
    default:
      return null
  }
}

const toCmsPage = (page: Page): CmsPage => ({
  id: page.id,
  slug: page.slug,
  title: page.title,
  metaTitle: page.meta?.title?.trim() || '',
  description: page.meta?.description?.trim() || '',
  canonical: page.meta?.canonical?.trim() || '',
  ogImage: mediaUrl(page.meta?.image, 'og'),
  noindex: Boolean(page.meta?.noindex),
  structuredType: page.structuredType || 'WebPage',
  customCode: page.customCode || '',
  sections: (page.layout || []).map(toSection).filter((s): s is Section => s !== null),
  updatedAt: page.updatedAt,
})

/** A landing page built in the CMS, by its address. */
export const getCmsPage = cache(async (slug: string): Promise<CmsPage | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    pagination: false,
    ...(await readOptions()),
  })
  return docs[0] ? toCmsPage(docs[0]) : null
})

/** Every published landing page (address + dates), for the sitemap and llms.txt. */
export const getCmsPages = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'pages', depth: 0, limit: 1000, pagination: false, ...(await readOptions()) })
  return docs.map((p) => ({ slug: p.slug, title: p.title, description: p.meta?.description || '', noindex: Boolean(p.meta?.noindex), updatedAt: p.updatedAt }))
})
