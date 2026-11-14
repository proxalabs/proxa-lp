import Link from 'next/link';
import { dateTs, isNewsCategory, cardImg } from '../lib/blog';
import { hrefFor } from '../lib/routes';
import '../components/ArticleLayout.css';

const SYMBOL = '/assets/blog/proxa-symbol.png';

/*
 * News hub — every published post in the News category, newest first. Posts land
 * here automatically the moment they're published (they also stay on /blog).
 * Same card styling as the blog index.
 */
export default function NewsIndexPage({ articles }) {
  const news = articles.filter((a) => isNewsCategory(a.pillar)).sort((x, y) => dateTs(y.date) - dateTs(x.date));

  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <p className="eyebrow blog-eyebrow"><img src={SYMBOL} alt="Proxa Labs" />News</p>
        <h1 className="blog-title">The latest from Proxa Labs</h1>
        <p className="blog-sub">
          Product releases, company announcements, and research milestones from Proxa Labs and The Lab.
        </p>

        {news.length === 0 ? (
          <p className="blog-sub">No news yet — check back soon.</p>
        ) : (
          <div className="blog-grid">
            {news.map((a) => (
              <Link key={a.id} className="blog-card as-block" href={hrefFor('article', { slug: a.slug })}>
                <div className="blog-card-img" style={cardImg(a) ? { backgroundImage: `url(${cardImg(a)})` } : undefined} />
                <p className="card-pillar">{a.pillar}</p>
                <p className="card-title">{a.title}</p>
                <p className="card-meta">{a.date}{a.readTime ? ` • ${a.readTime}` : ''}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
