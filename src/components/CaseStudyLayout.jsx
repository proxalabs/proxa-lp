import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';
import CountUp from './CountUp';
import { hrefFor } from '../lib/routes';
import './ArticleLayout.css';
import '../views/CaseStudyPage.css';

// Split a textarea field into paragraphs on blank lines / newlines.
const paras = (text) => String(text || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);

// Presentational case-study body.
export default function CaseStudyLayout({ cs }) {
  const stats = Array.isArray(cs.stats) ? cs.stats.filter((s) => (s.value || s.label)) : [];
  return (
    <div className="proxa-article">
      <section className="shell cs-detail">
        <Breadcrumbs items={[
          { name: 'Home', page: 'home' },
          { name: 'Case studies', page: 'caseStudies' },
          { name: cs.title || 'Case study' },
        ]} />
        <p className="eyebrow blog-eyebrow">{cs.industry || 'Case study'}</p>
        <h1 className="blog-title">{cs.title}</h1>
        {cs.client && <p className="cs-client">{cs.client}</p>}
        {cs.summary && <p className="blog-sub">{cs.summary}</p>}

        {stats.length > 0 && (
          <div className="cs-stats">
            {stats.map((s, i) => (
              <div className="cs-stat" key={i}>
                <div className="cs-stat-value"><CountUp>{s.value}</CountUp></div>
                <div className="cs-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {cs.challenge && <div className="cs-block"><h2>The challenge</h2>{paras(cs.challenge).map((p, i) => <p key={i}>{p}</p>)}</div>}
        {cs.solution && <div className="cs-block"><h2>What we did</h2>{paras(cs.solution).map((p, i) => <p key={i}>{p}</p>)}</div>}
        {cs.results && <div className="cs-block"><h2>The results</h2>{paras(cs.results).map((p, i) => <p key={i}>{p}</p>)}</div>}

        <Link className="cs-back as-btn" href={hrefFor('caseStudies')}>← All case studies</Link>
      </section>
    </div>
  );
}
