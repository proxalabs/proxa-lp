import { getPosts } from '@/lib/data/posts'
import { PAGE_DESCRIPTIONS } from '@/lib/pageMeta'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// RSS feed of the blog, for feed readers and for crawlers that discover new posts
// through feeds.
export const revalidate = 300

const xml = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function GET() {
  const posts = (await getPosts()).filter((p) => !p.noindex)
  // Newest first, whatever order the blog page shows them in.
  const sorted = [...posts].sort((a, b) => Date.parse(b.isoDate || b.updatedAt) - Date.parse(a.isoDate || a.updatedAt))
  const items = sorted
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`
      return [
        '    <item>',
        `      <title>${xml(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(p.isoDate || p.updatedAt).toUTCString()}</pubDate>`,
        p.description ? `      <description>${xml(p.description)}</description>` : '',
        p.pillar ? `      <category>${xml(p.pillar)}</category>` : '',
        p.author.name ? `      <dc:creator>${xml(p.author.name)}</dc:creator>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const lastBuild = sorted[0] ? new Date(sorted[0].updatedAt).toUTCString() : new Date(0).toUTCString()
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>${xml(PAGE_DESCRIPTIONS.blog)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
