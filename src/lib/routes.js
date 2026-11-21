// Page keys and their public URLs. The keys are the ones the components have
// always used ("literacy", "proxalab", …); the URLs are what visitors and search
// engines see and must not change.
export const PAGE_PATHS = {
  home: '/',
  platform: '/platform',
  advisory: '/advisory',
  literacy: '/ai-literacy',
  insitex: '/insitex-lms',
  content: '/content-development',
  proxalab: '/the-lab',
  about: '/about',
  news: '/announcements',
  newsletter: '/newsletter',
  contact: '/contact',
  futureproof: '/future-proof-your-organization',
  innovation: '/innovation-collective',
  search: '/search',
  blog: '/blog',
  newsHub: '/news',
  caseStudies: '/case-studies',
  videos: '/videos',
}

const SLUG_ROUTES = { article: '/blog', caseStudy: '/case-studies', form: '/forms' }

const PATH_KEYS = Object.fromEntries(Object.entries(PAGE_PATHS).map(([key, path]) => [path, key]))

/**
 * URL for a page key. `opts` is a hash string or `{ hash, slug }`.
 * A key that is not a fixed page is treated as the slug of a CMS-built page.
 * @param {string} page
 * @param {string | { hash?: string, slug?: string }} [opts]
 * @returns {string}
 */
export function hrefFor(page, opts) {
  const hash = typeof opts === 'string' ? opts : opts?.hash
  const slug = typeof opts === 'object' && opts ? opts.slug : undefined
  let path
  if (SLUG_ROUTES[page] && slug) path = `${SLUG_ROUTES[page]}/${slug}`
  else if (PAGE_PATHS[page]) path = PAGE_PATHS[page]
  else path = `/${page}`
  const cleanHash = (hash || '').replace(/^#/, '')
  return cleanHash ? `${path}#${cleanHash}` : path
}

/**
 * The fixed page key for a pathname, or null (slug routes and unknown paths).
 * Used for the nav's active state.
 * @param {string} pathname
 * @returns {string | null}
 */
export function pageKeyForPath(pathname) {
  const normalized = (pathname || '/').replace(/\/+$/, '') || '/'
  return PATH_KEYS[normalized] || null
}

// Addresses a CMS-built page may not take: fixed routes, section roots, system
// paths and the short links.
export const RESERVED_SLUGS = new Set([
  ...Object.values(PAGE_PATHS).filter((p) => p !== '/').map((p) => p.slice(1)),
  'admin', 'api', 'next', '_next', 'media', 'files', 'assets', 'forms',
  'proxa-labs', 'letsmeet', 'home',
  'sitemap.xml', 'robots.txt', 'llms.txt', 'favicon.ico',
])
