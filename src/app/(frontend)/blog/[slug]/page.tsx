import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { preload } from 'react-dom'

import ArticleLayout from '@/components/ArticleLayout'
import JsonLd from '@/components/JsonLd'
import { isNewsCategory } from '@/lib/blog'
import { getPost, getPosts } from '@/lib/data/posts'
import { findRedirect } from '@/lib/data/redirects'
import { buildArticleLd, buildBreadcrumbLd, buildFaqLd } from '@/lib/jsonLd'
import { buildMetadata } from '@/lib/seo'
import { SITE_NAME, SITE_URL } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getPost(slug)
  if (!article) return { title: `Article not found · ${SITE_NAME}` }
  return buildMetadata({
    // Google shows about 60 characters, so a long headline goes without the site name.
    title: article.metaTitle || (article.title.length > 48 ? article.title : `${article.title} · ${SITE_NAME}`),
    description: article.description,
    path: `/blog/${article.slug}`,
    canonical: article.canonical,
    image: article.ogImage,
    noindex: article.noindex,
    type: 'article',
    publishedTime: article.isoDate,
    modifiedTime: article.updatedAt,
    authors: article.author.name && !article.hideAuthor ? [article.author.name] : undefined,
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const article = await getPost(slug)
  if (!article) {
    // The post may have moved: honour a redirect before giving a 404.
    const to = await findRedirect(`/blog/${slug}`)
    if (to) permanentRedirect(to)
    notFound()
  }

  // The hero is a CSS background and the page's largest paint, so the browser
  // would otherwise find it late; ask for it up front.
  if (article.showHero && article.thumb) preload(article.thumb, { as: 'image', fetchPriority: 'high' })

  const url = article.canonical || `${SITE_URL}/blog/${article.slug}`
  const news = isNewsCategory(article.pillar)
  const faqs = article.body.filter((b): b is { type: 'faq'; items: { q: string; a: string }[] } => (b as { type?: string }).type === 'faq').flatMap((b) => b.items)

  return (
    <>
      <JsonLd data={buildArticleLd(article, url)} />
      <JsonLd
        data={buildBreadcrumbLd([
          { name: 'Home', url: `${SITE_URL}/` },
          news ? { name: 'News', url: `${SITE_URL}/news` } : { name: 'Blog', url: `${SITE_URL}/blog` },
          { name: article.title, url },
        ])}
      />
      <JsonLd data={buildFaqLd(faqs)} />
      <ArticleLayout article={article} />
    </>
  )
}
