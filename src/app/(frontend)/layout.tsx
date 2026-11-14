import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import Analytics from '@/components/Analytics'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import Nav from '@/components/Nav'
import PreviewBar from '@/components/PreviewBar'
import { isDraft } from '@/lib/data/payload'
import { getNavMenus } from '@/lib/data/sitePages'
import { buildSiteLd } from '@/lib/jsonLd'
import { SITE_NAME, SITE_URL } from '@/lib/site'

import '../../fonts.css'
import '../../styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
  formatDetection: { telephone: false },
  alternates: { types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: `${SITE_NAME} Blog` }] } },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#12141A',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const menus = await getNavMenus()
  const draft = await isDraft()

  return (
    <html lang="en">
      <head>
        {/* The two fonts every page needs for its first paint; see src/fonts.css. */}
        <link rel="preload" href="/fonts/manrope-normal-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/dm-sans-normal-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <JsonLd data={buildSiteLd()} />
        <Nav menus={menus} />
        <main>{children}</main>
        <Footer />
        <Analytics />
        {draft && <PreviewBar />}
      </body>
    </html>
  )
}
