import Link from 'next/link'

import '@/components/ArticleLayout.css'

export default function NotFound() {
  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <h1 className="blog-title">Article not found</h1>
        <p className="blog-sub">This article may have moved or been unpublished.</p>
        <Link href="/blog" style={{ color: 'var(--coral-deep)', fontWeight: 600, textDecoration: 'none' }}>
          ← Back to the blog
        </Link>
      </section>
    </div>
  )
}
