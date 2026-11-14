import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Tab } from 'payload'

/** The SEO tab shared by posts, case studies and built pages. Stored under `meta`. */
export const seoTab = (): Tab => ({
  name: 'meta',
  label: 'SEO',
  fields: [
    OverviewField({ titlePath: 'meta.title', descriptionPath: 'meta.description', imagePath: 'meta.image' }),
    MetaTitleField({ hasGenerateFn: true }),
    MetaDescriptionField({ hasGenerateFn: true }),
    MetaImageField({ relationTo: 'media' }),
    PreviewField({ hasGenerateFn: true, titlePath: 'meta.title', descriptionPath: 'meta.description' }),
    {
      name: 'canonical',
      type: 'text',
      label: 'Canonical URL',
      admin: { description: 'Only set this if the page is a copy of one published elsewhere. Leave empty otherwise.' },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      label: 'Hide from search engines',
      defaultValue: false,
    },
  ],
})
