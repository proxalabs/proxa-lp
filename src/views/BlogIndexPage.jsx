'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { dateTs, cardImg } from '../lib/blog';
import { hrefFor } from '../lib/routes';
import BlogLead from '../components/BlogLead';
import '../components/ArticleLayout.css';

const SYMBOL = '/assets/blog/proxa-symbol.png';

/*
 * Blog index — lists published articles with live filter + sort. The list is
 * rendered on the server; filtering and sorting happen in the browser. Filter
 * options are derived from the list, so they appear only when there's something to pick.
 * With no filter set, the first article is shown large as the lead story.
 */
export default function BlogIndexPage({ articles }) {
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState('default'); // default | newest | oldest

  const topics = useMemo(() => [...new Set(articles.map((a) => a.topic).filter(Boolean))].sort(), [articles]);
  const authors = useMemo(() => [...new Set(articles.map((a) => a.author?.name).filter(Boolean))].sort(), [articles]);
  const anyFeatured = useMemo(() => articles.some((a) => a.featured), [articles]);

  const shown = useMemo(() => {
    let list = articles.filter((a) =>
      (!topic || a.topic === topic) &&
      (!author || a.author?.name === author) &&
      (!featuredOnly || a.featured));
    if (sort === 'newest') list = [...list].sort((x, y) => dateTs(y.date) - dateTs(x.date));
    else if (sort === 'oldest') list = [...list].sort((x, y) => dateTs(x.date) - dateTs(y.date));
    return list;
  }, [articles, topic, author, featuredOnly, sort]);

  const filtersActive = topic || author || featuredOnly || sort !== 'default';
  const clearFilters = () => { setTopic(''); setAuthor(''); setFeaturedOnly(false); setSort('default'); };
  // The lead story shows only on the unfiltered list, so a filter never hides an article.
  const lead = filtersActive ? null : shown[0];
  const rest = lead ? shown.slice(1) : shown;
  const showFilterBar = articles.length > 0 && (topics.length > 1 || authors.length > 1 || anyFeatured);

  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <p className="eyebrow blog-eyebrow"><img src={SYMBOL} alt="Proxa Labs" width="183" height="280" />Blog</p>
        <h1 className="blog-title">Perspectives on commercial readiness</h1>
        <p className="blog-sub">
          Field notes and frameworks from inside biopharma commercial learning.
        </p>

        {showFilterBar && (
          <div className="blog-filters">
            {topics.length > 1 && (
              <div className="blog-chips" role="group" aria-label="Topic">
                <button type="button" className="blog-chip" aria-pressed={!topic} onClick={() => setTopic('')}>All</button>
                {topics.map((t) => (
                  <button key={t} type="button" className="blog-chip" aria-pressed={topic === t} onClick={() => setTopic(topic === t ? '' : t)}>{t}</button>
                ))}
              </div>
            )}
            <div className="blog-filter-side">
              {anyFeatured && (
                <button type="button" className="blog-chip" aria-pressed={featuredOnly} onClick={() => setFeaturedOnly(!featuredOnly)}>Featured</button>
              )}
              {authors.length > 1 && (
                <select className="blog-select" aria-label="Author" value={author} onChange={(e) => setAuthor(e.target.value)}>
                  <option value="">All authors</option>
                  {authors.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              )}
              <select className="blog-select" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Featured first</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              {filtersActive && (
                <button type="button" className="blog-filter-clear" onClick={clearFilters}>Clear</button>
              )}
            </div>
          </div>
        )}

        {articles.length === 0 ? (
          <p className="blog-sub">No articles published yet — check back soon.</p>
        ) : shown.length === 0 ? (
          <p className="blog-sub">No articles match these filters. <button type="button" className="blog-filter-clear" onClick={clearFilters}>Clear filters</button></p>
        ) : (
          <>
            {lead && <BlogLead article={lead} kicker={`${lead.pillar}${lead.featured ? ' · Featured' : ''}`} />}
            <div className="blog-grid">
              {rest.map((a) => (
                <Link key={a.id} className="blog-card as-block" href={hrefFor('article', { slug: a.slug })}>
                  <div className="blog-card-img">
                    {cardImg(a) && <img src={cardImg(a)} alt={a.cardImageAlt || ''} loading="lazy" decoding="async" />}
                  </div>
                  <p className="card-pillar">{a.pillar}{a.featured ? ' · Featured' : ''}</p>
                  <p className="card-title">{a.title}</p>
                  <p className="card-meta">{a.date}{a.readTime ? ` · ${a.readTime}` : ''}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
