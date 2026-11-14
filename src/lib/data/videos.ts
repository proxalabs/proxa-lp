import { cache } from 'react'

import type { Video } from '@/payload-types'

import { displayDate, getPayloadClient, mediaUrl, readOptions } from './payload'

export type VideoView = {
  id: number
  title: string
  videoUrl: string
  thumbnail: string
  length: string
  topic: string
  date: string
  isoDate: string | null
  description: string
  transcript: string
  captions: string
  order: number | null
  noindex: boolean
}

const toView = (v: Video): VideoView => ({
  id: v.id,
  title: v.title,
  videoUrl: v.videoUrl || '',
  thumbnail: mediaUrl(v.thumbnail, 'card'),
  length: v.length || '',
  topic: v.topic || '',
  date: displayDate(v.publishedDate),
  isoDate: v.publishedDate || null,
  description: v.description || '',
  transcript: v.transcript || '',
  captions: mediaUrl(v.captions),
  order: v.order ?? null,
  noindex: Boolean(v.noindex),
})

export const getVideos = cache(async (): Promise<VideoView[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'videos', depth: 1, limit: 1000, pagination: false, ...(await readOptions()) })
  return docs.map(toView).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
})
