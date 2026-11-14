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
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
