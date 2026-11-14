import type { Metadata } from 'next'

import JsonLd from '@/components/JsonLd'
import { getVideos } from '@/lib/data/videos'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildBreadcrumbLd, buildVideosLd } from '@/lib/jsonLd'
import { buildMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import VideoGalleryPage from '@/views/VideoGalleryPage'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLES.videos, description: PAGE_DESCRIPTIONS.videos, path: '/videos' })

export default async function Page() {
  const videos = await getVideos()
  return (
    <>
      <JsonLd data={buildVideosLd(videos)} />
      <JsonLd data={buildBreadcrumbLd([{ name: 'Home', url: `${SITE_URL}/` }, { name: 'Videos', url: `${SITE_URL}/videos` }])} />
      <VideoGalleryPage videos={videos} />
    </>
  )
}
