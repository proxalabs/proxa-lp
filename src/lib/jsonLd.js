import { SITE_URL, OG_IMAGE, SITE_NAME } from './site.js';

// Serialise structured data for a <script type="application/ld+json"> tag. "<" is
// escaped so content containing </script> can never break out of the tag.
export function jsonLdString(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

// og:image and schema.org image require absolute URLs — prefix SITE_URL for a
// relative path so social scrapers and rich-results can resolve it.
export function absUrl(u) {
  if (!u) return u;
  return /^https?:\/\//.test(u) ? u : SITE_URL + (u.startsWith('/') ? '' : '/') + u;
}

// "June 22, 2026" -> "2026-06-22" (schema.org wants ISO). Null if unparseable.
export function toIsoDate(d) {
  const n = Date.parse(d || '');
  return Number.isNaN(n) ? null : new Date(n).toISOString().slice(0, 10);
}

// Site-wide Organization + WebSite graph (set once, persists across navigation).
export function buildOrgLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: SITE_NAME, url: `${SITE_URL}/`, logo: OG_IMAGE },
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME, publisher: { '@id': `${SITE_URL}/#org` } },
    ],
  };
}

export function buildArticleLd(article, url) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || article.summary || undefined,
    url,
    mainEntityOfPage: url,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
  };
  if (article.thumb) ld.image = absUrl(article.thumb);
  if (article.author?.name) ld.author = { '@type': 'Person', name: article.author.name };
  const date = toIsoDate(article.date);
  if (date) ld.datePublished = date;
  return ld;
}

export function buildBreadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// FAQPage markup from an array of { q, a } — used by articles with FAQ blocks
// (and mirrors what the page-builder FAQ section emits).
export function buildFaqLd(items) {
  const list = (items || []).filter((f) => f.q && f.a);
  if (!list.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
