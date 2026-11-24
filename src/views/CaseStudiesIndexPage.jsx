import Link from 'next/link';
import { hrefFor } from '../lib/routes';
import '../components/ArticleLayout.css';

// Public index of published case studies.
export default function CaseStudiesIndexPage({ caseStudies }) {
  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <p className="eyebrow blog-eyebrow">Case studies</p>
        <h1 className="blog-title">Proof in the field</h1>
        <p className="blog-sub">
          How biopharma commercial teams put Proxa Labs to work — the challenge, what we did, and the results.
        </p>

        {caseStudies.length === 0 ? (
          <p className="blog-sub">No case studies published yet — check back soon.</p>
        ) : (
          <div className="blog-grid">
            {caseStudies.map((c) => (
              <Link key={c.id} className="blog-card as-block" href={hrefFor('caseStudy', { slug: c.slug })}>
                <div className="blog-card-img">
                  {c.heroImage && <img src={c.heroImage} alt={c.heroImageAlt || ''} loading="lazy" decoding="async" />}
                </div>
                <p className="card-pillar">{c.industry || c.client || 'Case study'}</p>
                <p className="card-title">{c.title}</p>
                {c.client && <p className="card-meta">{c.client}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
