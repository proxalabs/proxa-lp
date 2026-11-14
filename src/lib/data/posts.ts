import { cache } from 'react'

import { dateTs } from '@/lib/blog'
import { lexicalToBody, lexicalToInlineHtml, lexicalToText, readTimeFor } from '@/lib/lexical'
import type { Author, Category, Post } from '@/payload-types'

import { displayDate, getPayloadClient, mediaAlt, mediaUrl, readOptions } from './payload'

// Posts come out in the shape ArticleLayout and the blog cards have always taken.

export type ArticleCard = {
  id: number
  slug: string
  title: string
  pillar: string
  topic: string
  tags: string[]
  featured: boolean
  order: number | null
  date: string
  isoDate: string | null
  updatedAt: string
  readTime: string
  author: { name: string; role: string; bio: string; headshot: string }
  thumb: string
  cardImage: string
  cardImageAlt: string
  description: string
  noindex: boolean
}

export type Article = ArticleCard & {
  hideAuthor: boolean
  summary: string
  hideSummary: boolean
  showHero: boolean
  body: object[]
  toc: { id: string; label: string }[]
  related: { title: string; href: string; pillar: string; meta: string; variant: number }[]
  metaTitle: string
  canonical: string
  ogImage: string
}

const pillarOf = (c: Post['category']) => (c && typeof c === 'object' ? (c as Category).title : '')

function toCard(post: Post): ArticleCard {
  const author = post.author && typeof post.author === 'object' ? (post.author as Author) : null
  const text = lexicalToText(post.content)
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    pillar: pillarOf(post.category),
    topic: post.topic || '',
    tags: post.tags || [],
    featured: Boolean(post.featured),
    order: post.order ?? null,
    date: displayDate(post.publishedDate),
    isoDate: post.publishedDate || null,
    updatedAt: post.updatedAt,
    readTime: post.readTime?.trim() || readTimeFor(text),
    author: {
      name: author?.name || '',
      role: author?.title || '',
      bio: author?.bio || '',
      headshot: mediaUrl(author?.headshot, 'thumbnail'),
    },
    thumb: mediaUrl(post.heroImage, 'hero'),
    cardImage: mediaUrl(post.cardImage, 'card') || mediaUrl(post.heroImage, 'card'),
    cardImageAlt: mediaAlt(post.cardImage) || mediaAlt(post.heroImage),
    description: post.meta?.description?.trim() || lexicalToText(post.summary).slice(0, 300),
    noindex: Boolean(post.meta?.noindex),
  }
}

function toArticle(post: Post): Article {
  const { body, toc } = lexicalToBody(post.content, { tocLabels: (post.tocLabels || []).map((row) => row.label) })
  const related = (post.related || [])
    .filter((r): r is Post => Boolean(r) && typeof r === 'object' && Boolean((r as Post).slug))
    .slice(0, 3)
    .map((r, i) => ({
      title: r.title,
      href: `/blog/${r.slug}`,
      pillar: pillarOf(r.category),
      meta: [displayDate(r.publishedDate), r.readTime].filter(Boolean).join(' • '),
      variant: i + 1,
    }))
  return {
    ...toCard(post),
    hideAuthor: Boolean(post.hideAuthor),
    summary: lexicalToInlineHtml(post.summary),
    hideSummary: Boolean(post.hideSummary),
    showHero: Boolean(post.showHero),
    body,
    toc,
    related,
    metaTitle: post.meta?.title?.trim() || '',
    canonical: post.meta?.canonical?.trim() || '',
    ogImage: mediaUrl(post.meta?.image, 'og'),
  }
}

// Lower "order" first, then newest. Posts without an order sort by date.
const sortPosts = <T extends { order: number | null; date: string }>(list: T[]) =>
  [...list].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || dateTs(b.date) - dateTs(a.date))

/** Every published post, for the blog and news listings, sitemap and feeds. */
export const getPosts = cache(async (): Promise<ArticleCard[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'posts', depth: 1, limit: 1000, pagination: false, ...(await readOptions()) })
  return sortPosts(docs.map(toCard))
})

/** One post by its address, or null when it does not exist (or is not published). */
export const getPost = cache(async (slug: string): Promise<Article | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    pagination: false,
    ...(await readOptions()),
  })
  return docs[0] ? toArticle(docs[0]) : null
})
