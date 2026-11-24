import type { CollectionConfig } from 'payload'

import { isAdminField, isStaff, publishedNotTrashedOrStaff } from '../access'
import { PAGE_BLOCKS } from '../blocks/page'
import { seoTab } from '../fields/seo'
import { slugField } from '../fields/slug'
import { previewPath } from '../lib/preview'
import { contentHooks, draftVersions } from './shared'

// Landing pages a marketer builds from the section kit. They live at /<slug>.
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Landing page', plural: 'Landing pages' },
  admin: {
    group: 'Content', useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: { url: ({ data }) => previewPath(data?.slug ? `/${data.slug}` : null) },
    preview: (doc) => previewPath(doc?.slug ? `/${doc.slug}` : null),
  },
  access: { read: publishedNotTrashedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  defaultPopulate: { title: true, slug: true },
  trash: true,
  versions: draftVersions,
  // A landing page can be linked from the header menus and from buttons on any
  // page, so a change to its address or visibility refreshes the whole site.
  hooks: contentHooks((doc) => [`/${doc.slug}`], { layout: true }),
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sections',
          fields: [{ name: 'layout', type: 'blocks', blocks: PAGE_BLOCKS, labels: { singular: 'Section', plural: 'Sections' } }],
        },
        seoTab(),
        {
          label: 'Advanced',
          fields: [
            {
              name: 'structuredType',
              type: 'select',
              label: 'Structured-data type',
              defaultValue: 'WebPage',
              options: [
                { label: 'Auto (web page + any FAQ)', value: 'WebPage' },
                { label: 'Article', value: 'Article' },
                { label: 'About page', value: 'AboutPage' },
                { label: 'Contact page', value: 'ContactPage' },
                { label: 'Collection / listing page', value: 'CollectionPage' },
              ],
              admin: { description: 'Helps search engines and AI tools label the page.' },
            },
            {
              name: 'customCode',
              type: 'code',
              label: 'Custom code (advanced, optional)',
              // It runs as code on the public page, so only an admin may set or change it.
              access: { create: isAdminField, update: isAdminField },
              admin: { language: 'html', description: 'Added to this page only, and runs as code. Admins only.' },
            },
          ],
        },
      ],
    },
    // Built pages sit at the top level, so they cannot take an address the site uses.
    slugField({ reserved: true }),
  ],
}
