import Link from 'next/link';
import { cardImg } from '../lib/blog';
import { hrefFor } from '../lib/routes';

/**
 * The lead story at the top of the blog and news lists: a wide picture beside the title,
 * a short description and the byline. Styles: .blog-lead in ArticleLayout.css.
 */
export default function BlogLead({ article: a, kicker }) {
  const img = cardImg(a);
  return (
    <Link className="blog-lead as-block" href={hrefFor('article', { slug: a.slug })}>
      <div className="blog-lead-img">
        {img && <img src={img} alt={a.cardImageAlt || ''} decoding="async" />}
      </div>
      <div className="blog-lead-text">
        <p className="card-pillar">{kicker || a.pillar}</p>
        <h2 className="blog-lead-title">{a.title}</h2>
        {a.description && <p className="blog-lead-desc">{a.description}</p>}
        <p className="card-meta">
          {[a.author?.name, a.date, a.readTime].filter(Boolean).join(' · ')}
        </p>
        <span className="blog-lead-more" aria-hidden="true">Read the article <span>→</span></span>
      </div>
    </Link>
  );
}
