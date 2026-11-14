import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
