import type { Metadata } from 'next'

import { OG_IMAGE, SITE_NAME, SITE_URL } from './site'

export type SeoInput = {
  title: string
  description?: string | null
  /** Path on this site, e.g. "/platform". Used for the canonical and og:url. */
  path: string
  /** Absolute or site-relative image; falls back to the default share card. */
  image?: string | null
  /** An explicit canonical set in the CMS wins over the path. */
  canonical?: string | null
  noindex?: boolean | null
  type?: 'website' | 'article'
  publishedTime?: string | null
  modifiedTime?: string | null
  authors?: string[]
}

const absolute = (u: string) => (/^https?:\/\//.test(u) ? u : SITE_URL + (u.startsWith('/') ? '' : '/') + u)

/** One place that turns page facts into every tag search and social crawlers read. */
export function buildMetadata(input: SeoInput): Metadata {
  const url = input.canonical?.trim() || SITE_URL + (input.path === '/' ? '/' : input.path)
  const description = input.description?.trim() || undefined
  const image = absolute(input.image?.trim() || OG_IMAGE)
  const article = input.type === 'article'

  return {
    title: { absolute: input.title },
    description,
    alternates: { canonical: url },
    robots: input.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        },
    openGraph: {
      type: article ? 'article' : 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      title: input.title,
      description,
      url,
      images: [{ url: image }],
      ...(article && input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(article && input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
      ...(article && input.authors?.length ? { authors: input.authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description,
      images: [image],
    },
  }
}
