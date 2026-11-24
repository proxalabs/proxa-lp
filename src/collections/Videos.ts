import type { CollectionConfig } from 'payload'

import { isStaff, publishedNotTrashedOrStaff } from '../access'
import { slugField } from '../fields/slug'
import { previewPath } from '../lib/preview'
import { contentHooks, draftVersions } from './shared'

export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    group: 'Content', useAsTitle: 'title', defaultColumns: ['title', 'topic', '_status', 'updatedAt'],
    livePreview: { url: () => previewPath('/videos') },
    preview: () => previewPath('/videos'),
  },
  access: { read: publishedNotTrashedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  trash: true,
  versions: draftVersions,
  hooks: contentHooks(() => ['/videos']),
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video link',
      admin: { description: 'A YouTube link, or a direct link to a video file.' },
    },
    { name: 'thumbnail', type: 'upload', relationTo: 'media', admin: { description: 'Optional for YouTube videos (their own thumbnail is used).' } },
    { type: 'row', fields: [{ name: 'length', type: 'text', admin: { placeholder: '4:32' } }, { name: 'topic', type: 'text' }] },
    { name: 'description', type: 'textarea' },
    { name: 'transcript', type: 'textarea', admin: { description: 'Shown under the video and included in its structured data.' } },
    { name: 'captions', type: 'upload', relationTo: 'media', label: 'Captions file (.vtt)' },
    slugField(),
    { name: 'publishedDate', type: 'date', label: 'Publish date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    { name: 'order', type: 'number', admin: { position: 'sidebar', description: 'Lower numbers come first.' } },
    { name: 'noindex', type: 'checkbox', label: 'Hide from search and AI indexes', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}
