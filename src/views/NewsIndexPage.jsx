import Link from 'next/link';
import { dateTs, isNewsCategory } from '../lib/blog';
import { hrefFor } from '../lib/routes';
import BlogLead from '../components/BlogLead';
import '../components/ArticleLayout.css';

const SYMBOL = '/assets/blog/proxa-symbol.png';

/*
 * News hub — every published post in the News category, newest first. Posts land
 * here automatically the moment they're published (they also stay on /blog).
 * The newest is the lead story; the rest are a dated list under it.
 */
export default function NewsIndexPage({ articles }) {
  const news = articles.filter((a) => isNewsCategory(a.pillar)).sort((x, y) => dateTs(y.date) - dateTs(x.date));
  const [latest, ...earlier] = news;

  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <p className="eyebrow blog-eyebrow"><img src={SYMBOL} alt="Proxa Labs" width="183" height="280" />News</p>
        <h1 className="blog-title">The latest from Proxa Labs</h1>
        <p className="blog-sub">
          Releases, announcements and research milestones.
        </p>

        {news.length === 0 ? (
          <p className="blog-sub">No news yet — check back soon.</p>
        ) : (
          <>
            <BlogLead article={latest} kicker="Latest" />
            {earlier.length > 0 && (
              <ol className="news-list">
                {earlier.map((a) => (
                  <li key={a.id}>
                    <Link className="news-row as-block" href={hrefFor('article', { slug: a.slug })}>
                      <time dateTime={a.isoDate || undefined}>{a.date}</time>
                      <span className="news-row-title">{a.title}</span>
                      <span className="news-row-go" aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        <Link className="news-follow as-block" href={hrefFor('newsletter')}>
          <span><strong>Hear it first.</strong> Get the news in the Proxa Labs newsletter.</span>
          <span className="news-follow-go">Subscribe <span aria-hidden="true">→</span></span>
        </Link>
      </section>
    </div>
  );
}
