import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Uploaded images live under /api/media and must stay crawlable; the rest
        // of /api, the CMS and the preview routes are not for crawlers.
        allow: ['/', '/api/media/'],
        disallow: ['/admin', '/api/', '/next/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
