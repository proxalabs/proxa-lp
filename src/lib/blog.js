// Pure helpers shared by the blog views (safe in server and client components).

// Parse a human display date ("June 22, 2026") to a timestamp for sorting.
export function dateTs(d) {
  const n = Date.parse(d || '');
  return Number.isNaN(n) ? 0 : n;
}

// Posts filed under the "News" category get the /news hub as their home
// (breadcrumbs point there and the hub lists them).
export const isNewsCategory = (pillar) => (pillar || '').trim().toLowerCase() === 'news';

// Blog/news cards crop to a wide box, which chops up hero art that leaves room for
// the title. A post can carry a separate full-bleed image for the cards; the main
// image is the fallback, so posts without one look exactly as they always have.
export const cardImg = (a) => a.cardImage || a.thumb || '';
