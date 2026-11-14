import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Plugin } from 'payload'

import { anyone, isAdmin, isStaff, isStaffField, publishedOrStaff } from './access'
import { draftVersions } from './collections/shared'
import { slugField } from './fields/slug'
import { logCollectionChange, logCollectionDelete } from './hooks/activityLog'
import { safeRevalidate } from './hooks/revalidate'
import { previewPath } from './lib/preview'
import { lexicalToText } from './lib/lexical.js'
import { SITE_NAME, SITE_URL } from './lib/site.js'

const PREFIX: Record<string, string> = { posts: '/blog', 'case-studies': '/case-studies', pages: '' }

// A redirect can replace a page that was already rendered (as a 404, say), so the
// old address has to be refreshed when a rule is added, changed or removed.
const refreshRedirect: CollectionAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  if (context.disableRevalidate) return doc
  for (const from of new Set([doc?.from, previousDoc?.from])) if (typeof from === 'string' && from) safeRevalidate(from)
  return doc
}
const refreshRedirectOnDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate && typeof doc?.from === 'string' && doc.from) safeRevalidate(doc.from)
  return doc
}

// A form can be embedded in any landing page, so refresh every page when one changes.
const refreshForms: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) safeRevalidate('/', 'layout')
  return doc
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle: ({ doc, collectionSlug }) =>
      collectionSlug === 'case-studies' ? `${doc?.title} · Case study · ${SITE_NAME}` : `${doc?.title} · ${SITE_NAME}`,
    generateDescription: ({ doc }) =>
      (typeof doc?.summary === 'string' ? doc.summary : lexicalToText(doc?.summary)).slice(0, 160),
    generateURL: ({ doc, collectionSlug }) => `${SITE_URL}${PREFIX[collectionSlug || ''] ?? ''}/${doc?.slug || ''}`,
  }),

  redirectsPlugin({
    collections: ['pages', 'posts', 'case-studies'],
    overrides: {
      admin: { group: 'Settings', description: 'Send an old address to a new one. Search engines treat these as permanent.' },
      access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
      hooks: {
        afterChange: [refreshRedirect, logCollectionChange],
        afterDelete: [refreshRedirectOnDelete, logCollectionDelete],
      },
    },
  }),

  formBuilderPlugin({
    fields: { payment: false, state: false, country: false },
    formOverrides: {
      admin: {
        group: 'Forms',
        useAsTitle: 'title',
        livePreview: { url: ({ data }) => previewPath(data?.slug ? `/forms/${data.slug}` : null) },
        preview: (doc) => previewPath(doc?.slug ? `/forms/${doc.slug}` : null),
      },
      access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
      versions: draftVersions,
      hooks: { afterChange: [refreshForms, logCollectionChange], afterDelete: [logCollectionDelete] },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        slugField(),
        { name: 'intro', type: 'textarea', label: 'Intro text', admin: { description: 'Shown under the title on the form’s own page (/forms/…).' } },
        {
          name: 'consentText',
          type: 'textarea',
          label: 'Consent checkbox text (optional)',
          admin: { description: 'When set, the visitor must tick a box with this text before submitting.' },
        },
        {
          name: 'gatedFile',
          type: 'upload',
          relationTo: 'files',
          label: 'File to hand out after submitting (optional)',
          // Server-only: the public form definition must not reveal the file.
          access: { read: isStaffField },
        },
        {
          name: 'gatedFileLabel',
          type: 'text',
          label: 'Download button text',
          admin: { placeholder: 'Download your file' },
        },
        {
          name: 'notifyEmail',
          type: 'text',
          label: 'Send notifications to',
          access: { read: isStaffField },
          admin: { description: 'Comma-separated email addresses. Leave empty to use the site default.' },
        },
      ],
    },
    formSubmissionOverrides: {
      admin: { group: 'Forms' },
      // Submissions are written only by /api/submit-form, which validates,
      // rate-limits and filters them first.
      access: { read: isStaff, create: () => false, update: () => false, delete: isAdmin },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        { name: 'utm', type: 'json', label: 'Campaign parameters' },
        { name: 'consent', type: 'checkbox', defaultValue: false },
      ],
    },
  }),

  searchPlugin({
    collections: ['posts', 'case-studies', 'videos', 'pages'],
    defaultPriorities: { posts: 10, 'case-studies': 20, pages: 30, videos: 40 },
    // "Hide from search engines" also hides a document from the site's own search.
    skipSync: ({ doc }) => Boolean(doc?.meta?.noindex || doc?.noindex),
    beforeSync: ({ originalDoc, searchDoc }) => ({
      ...searchDoc,
      slug: originalDoc.slug,
      text: [
        originalDoc.meta?.description,
        typeof originalDoc.summary === 'string' ? originalDoc.summary : '',
        originalDoc.description,
        originalDoc.topic,
        Array.isArray(originalDoc.tags) ? originalDoc.tags.join(' ') : '',
        originalDoc.client,
        originalDoc.industry,
        originalDoc.transcript,
      ]
        .filter((v) => typeof v === 'string' && v.trim())
        .join(' ')
        .slice(0, 8000),
    }),
    searchOverrides: {
      admin: { group: 'Settings', description: 'The site search index. Kept in sync automatically when content is published.' },
      access: { read: anyone },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        { name: 'slug', type: 'text', index: true, admin: { readOnly: true } },
        { name: 'text', type: 'textarea', admin: { readOnly: true } },
      ],
    },
  }),
]
