import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// The public site's Content-Security-Policy, carried over from the old hosting
// config (minus Google Fonts, which are self-hosted now). The CMS at /admin and
// the API are left out: the admin loads its code editor from a CDN.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "media-src 'self' https: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      // Development needs eval and a websocket for hot reload, so the policy is
      // enforced in production builds only.
      ...(process.env.NODE_ENV === 'production'
        ? [{ source: '/((?!admin(?:/|$)|api(?:/|$)|_next/).*)', headers: [{ key: 'Content-Security-Policy', value: CSP }] }]
        : []),
      // Self-hosted fonts never change; brand images change rarely.
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
    ]
  },
  // Required on some platforms until Turbopack resolves Payload's Sass paths itself.
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  turbopack: {
    root: dirname,
  },
  // Short links: /proxa-labs is the lab's old address, /letsmeet is handed out at events.
  async redirects() {
    return [
      { source: '/proxa-labs', destination: '/the-lab', permanent: true },
      { source: '/letsmeet', destination: '/contact', permanent: true },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
