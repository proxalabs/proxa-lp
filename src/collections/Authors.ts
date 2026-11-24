import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access'
import { ALL_ARTICLES } from '../hooks/revalidate'
import { contentHooks } from './shared'

// Reusable author profiles, shown in an article's byline and bio card.
export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: { group: 'Content', useAsTitle: 'name', defaultColumns: ['name', 'title', 'updatedAt'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  // An author edit can change any article, so refresh the whole blog.
  hooks: contentHooks(() => ['/blog', '/news', ALL_ARTICLES]),
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'title', type: 'text', label: 'Job title' },
    { name: 'bio', type: 'textarea' },
    { name: 'headshot', type: 'upload', relationTo: 'media' },
    { name: 'linkedin', type: 'text', label: 'LinkedIn URL' },
    { name: 'website', type: 'text', label: 'Website URL' },
  ],
}
