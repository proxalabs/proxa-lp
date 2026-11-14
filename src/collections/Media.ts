import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { anyone, isStaff } from '../access'
import { auditHooks } from './shared'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// The media library: images (resized on upload), PDFs and caption files.
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media item', plural: 'Media' },
  admin: { group: 'Content', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: auditHooks,
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt text',
      required: true,
      admin: { description: 'Describe the image for screen readers and search engines. For a decorative image, say what it shows in a few words.' },
    },
    { name: 'caption', type: 'text' },
  ],
  upload: {
    // Local disk for now; an S3 adapter replaces this when the site moves to AWS.
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*', 'application/pdf', 'text/vtt'],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 800 },
      { name: 'hero', width: 1600 },
      { name: 'og', width: 1200, height: 630, crop: 'center' },
    ],
  },
}
