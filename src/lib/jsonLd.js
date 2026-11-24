import { SITE_URL, OG_IMAGE, SITE_NAME } from './site.js';
import { parseYouTubeId, youTubeThumb } from './videos.js';

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

const ORG_ID = `${SITE_URL}/#org`;
const LOGO_URL = `${SITE_URL}/assets/proxa_horiz.png`;

// Site-wide graph, rendered once in the root layout: who publishes the site, and
// that it has a search box (which lets search engines offer a sitelinks search).
export function buildSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: SITE_NAME,
        legalName: 'Proxa Labs LLC',
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: LOGO_URL, width: 600, height: 137 },
        image: OG_IMAGE,
        description: 'The AI implementation partner built for biopharma commercial learning: advisory, an AI platform, and structured experimentation.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '591 Collaboration Way, Suite 613',
          addressLocality: 'Newark',
          addressRegion: 'DE',
          addressCountry: 'US',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        inLanguage: 'en-US',
        publisher: { '@id': ORG_ID },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

// A blog post (BlogPosting) or case study (Article). `article` is the shape the
// data layer returns: title, description, thumb, isoDate, updatedAt, author…
export function buildArticleLd(article, url, type = 'BlogPosting') {
  const image = article.ogImage || article.thumb;
  const authorName = !article.hideAuthor && article.author && article.author.name;
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: String(article.title || '').slice(0, 110),
    description: article.description || undefined,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: image ? [absUrl(image)] : undefined,
    datePublished: article.isoDate || undefined,
    dateModified: article.updatedAt || article.isoDate || undefined,
    // A hidden or missing author is attributed to the organisation.
    author: authorName ? { '@type': 'Person', name: authorName } : { '@id': ORG_ID },
    publisher: { '@type': 'Organization', '@id': ORG_ID, name: SITE_NAME, logo: { '@type': 'ImageObject', url: LOGO_URL } },
    articleSection: article.pillar || undefined,
    keywords: article.tags && article.tags.length ? article.tags.join(', ') : undefined,
    inLanguage: 'en-US',
  };
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

// VideoObject needs a name, thumbnail and upload date to be valid, so a video
// missing one is left out rather than emitted as something search engines reject.
export function buildVideosLd(videos) {
  const graph = (videos || [])
    .filter((v) => !v.noindex)
    .map((v) => {
      const ytId = parseYouTubeId(v.videoUrl);
      const thumb = v.thumbnail || (ytId ? youTubeThumb(ytId) : '');
      if (!thumb || !v.isoDate) return null;
      return {
        '@type': 'VideoObject',
        name: v.title,
        description: v.description || v.title,
        thumbnailUrl: absUrl(thumb),
        uploadDate: v.isoDate,
        embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : undefined,
        contentUrl: !ytId && v.videoUrl ? absUrl(v.videoUrl) : undefined,
        transcript: v.transcript || undefined,
        publisher: { '@id': ORG_ID },
      };
    })
    .filter(Boolean);
  return graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null;
}

// What kind of thing each fixed page is. Anything not listed is a plain WebPage.
const PAGE_TYPES = {
  about: 'AboutPage',
  contact: 'ContactPage',
  platform: 'Service',
  advisory: 'Service',
  literacy: 'Service',
  insitex: 'Service',
  content: 'Service',
  proxalab: 'Service',
};

// Structured data for a fixed marketing page: { name, description, url }.
export function buildPageLd(pageId, { name, description, url }) {
  const type = PAGE_TYPES[pageId] || 'WebPage';
  const base = { '@context': 'https://schema.org', '@type': type, name, description: description || undefined, url };
  if (type === 'Service') {
    return { ...base, serviceType: name, provider: { '@id': ORG_ID }, areaServed: 'US', audience: { '@type': 'BusinessAudience', audienceType: 'Biopharma commercial learning and development leaders' } };
  }
  return { ...base, isPartOf: { '@id': `${SITE_URL}/#website` }, about: type === 'WebPage' ? undefined : { '@id': ORG_ID } };
}

// A listing page (blog, news, case studies) with its items in order.
export function buildCollectionLd({ name, description, url, type = 'CollectionPage' }, items) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description: description || undefined,
    url,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': ORG_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (items || []).map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
    },
  };
}
