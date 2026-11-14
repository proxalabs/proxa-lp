import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '../access'
import { seoTab } from '../fields/seo'
import { slugField } from '../fields/slug'
import { contentHooks, draftVersions } from './shared'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Case study', plural: 'Case studies' },
  admin: { group: 'Content', useAsTitle: 'title', defaultColumns: ['title', 'client', '_status', 'updatedAt'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  trash: true,
  versions: draftVersions,
  hooks: contentHooks((doc) => [`/case-studies/${doc.slug}`, '/case-studies']),
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Case study',
          fields: [
            { type: 'row', fields: [{ name: 'client', type: 'text' }, { name: 'industry', type: 'text' }] },
            { name: 'summary', type: 'textarea' },
            {
              name: 'stats',
              type: 'array',
              label: 'Highlight stats',
              labels: { singular: 'Stat', plural: 'Stats' },
              fields: [{ type: 'row', fields: [{ name: 'value', type: 'text' }, { name: 'label', type: 'text' }] }],
            },
            { name: 'challenge', type: 'textarea', label: 'The challenge' },
            { name: 'solution', type: 'textarea', label: 'What we did' },
            { name: 'results', type: 'textarea', label: 'The results' },
            { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Card image' },
          ],
        },
        seoTab(),
      ],
    },
    slugField(),
    { name: 'publishedDate', type: 'date', label: 'Date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    { name: 'order', type: 'number', admin: { position: 'sidebar', description: 'Lower numbers come first.' } },
  ],
}
