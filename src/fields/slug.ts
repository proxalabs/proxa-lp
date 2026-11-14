import type { Field } from 'payload'

import { slugify, validateSlug } from './slugRules.js'

/** The document's web address. Filled from the title when left empty. */
export const slugField = (opts: { reserved?: boolean; from?: string } = {}): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'The web address. Lowercase letters, numbers and hyphens. Leave empty to create it from the title.',
  },
  validate: (value: unknown) => validateSlug(value, { reserved: opts.reserved }),
  hooks: {
    beforeValidate: [
      ({ value, data }) => (typeof value === 'string' && value.trim() ? value.trim() : slugify(data?.[opts.from || 'title'])),
    ],
  },
})
