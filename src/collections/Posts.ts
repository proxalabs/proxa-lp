import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '../access'
import { articleEditor, simpleEditor } from '../fields/richText'
import { seoTab } from '../fields/seo'
import { slugField } from '../fields/slug'
import { previewPath } from '../lib/preview'
import { contentHooks, draftVersions } from './shared'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Blog post', plural: 'Blog posts' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedDate', '_status', 'updatedAt'],
    livePreview: { url: ({ data }) => previewPath(data?.slug ? `/blog/${data.slug}` : null) },
    preview: (doc) => previewPath(doc?.slug ? `/blog/${doc.slug}` : null),
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  defaultPopulate: { title: true, slug: true, category: true, publishedDate: true, readTime: true },
  trash: true,
  versions: draftVersions,
  // A post shows on its own page, the blog index, the news hub, and as a
  // "keep reading" card on other posts.
  hooks: contentHooks((doc) => [`/blog/${doc.slug}`, '/blog', '/news', '/blog/[slug]']),
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Article',
          fields: [
            {
              name: 'summary',
              type: 'richText',
              editor: simpleEditor,
              label: 'Article summary',
              admin: { description: 'The short summary box at the top of the article.' },
            },
            { name: 'hideSummary', type: 'checkbox', label: 'Hide the summary box', defaultValue: false },
            { name: 'content', type: 'richText', editor: articleEditor, label: 'Body' },
            {
              name: 'tocLabels',
              type: 'array',
              label: 'Contents labels (optional)',
              labels: { singular: 'Label', plural: 'Labels' },
              admin: {
                initCollapsed: true,
                description: 'Short names for the “in this article” list, one per main heading, in order. Leave empty to use the headings themselves.',
              },
              fields: [{ name: 'label', type: 'text' }],
            },
          ],
        },
        {
          label: 'Images',
          fields: [
            { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Main image' },
            {
              name: 'showHero',
              type: 'checkbox',
              label: 'Show the main image behind the article title',
              defaultValue: false,
            },
            {
              name: 'cardImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Card image (optional)',
              admin: { description: 'Used on blog and news cards. Falls back to the main image.' },
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            { name: 'category', type: 'relationship', relationTo: 'categories', admin: { description: 'Posts in “News” are also listed on the News page.' } },
            { name: 'topic', type: 'text', admin: { description: 'Visitors can filter the blog by topic.' } },
            { name: 'tags', type: 'text', hasMany: true },
            { name: 'author', type: 'relationship', relationTo: 'authors' },
            { name: 'hideAuthor', type: 'checkbox', label: 'Hide the author', defaultValue: false },
            {
              name: 'readTime',
              type: 'text',
              label: 'Read time',
              admin: { placeholder: '6 min read', description: 'Leave empty to work it out from the article length.' },
            },
            {
              name: 'related',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              maxRows: 3,
              label: 'Keep reading',
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            },
          ],
        },
        seoTab(),
      ],
    },
    slugField(),
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Display date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'MMMM d, yyyy' } },
      hooks: {
        // Stamp the date the first time a post goes live.
        beforeChange: [({ siblingData, value }) => (siblingData._status === 'published' && !value ? new Date() : value)],
      },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'order',
      type: 'number',
      admin: { position: 'sidebar', description: 'Lower numbers come first on the blog. Empty sorts by date.' },
    },
  ],
}
