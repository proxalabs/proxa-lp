import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import type { ReactNode } from 'react'

import Analytics from '@/components/Analytics'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import { mergeMenus } from '@/content/navConfig'
import { SITE_NAME, SITE_URL } from '@/lib/site'

import '../../fonts.css'
import '../../styles.css'

// Both families are self-hosted: no request to Google and no render-blocking
// @import. Manrope comes through next/font; DM Sans is declared in fonts.css.
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})
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
  const menus = mergeMenus(null)

  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <link rel="preload" href="/fonts/dm-sans-normal-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <Nav menus={menus} />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
