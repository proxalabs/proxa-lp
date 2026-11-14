import type { Metadata } from 'next'

import { getVideos } from '@/lib/data/videos'
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import { buildMetadata } from '@/lib/seo'
import VideoGalleryPage from '@/views/VideoGalleryPage'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLES.videos, description: PAGE_DESCRIPTIONS.videos, path: '/videos' })

export default async function Page() {
  const videos = await getVideos()
  return <VideoGalleryPage videos={videos} />
}
