import Link from 'next/link'

import '@/components/ArticleLayout.css'
import '@/views/CaseStudyPage.css'

export default function NotFound() {
  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <h1 className="blog-title">Case study not found</h1>
        <p className="blog-sub">It may have moved or been unpublished.</p>
        <Link className="cs-back as-btn" href="/case-studies">
          ← All case studies
        </Link>
      </section>
    </div>
  )
}
