import type { RowField, TextField } from 'payload'
import { slugField as payloadSlugField } from 'payload'

import { slugify, validateSlug } from './slugRules.js'

/**
 * The document's web address. Payload's slug field keeps it in step with the
 * title while the document is still an unpublished draft, then leaves it alone so
 * a live address never changes by accident; an editor can also set it by hand.
 * `reserved: true` refuses addresses the site already uses (landing pages).
 */
export const slugField = (opts: { reserved?: boolean } = {}): RowField =>
  payloadSlugField({
    useAsSlug: 'title',
    position: 'sidebar',
    slugify: ({ valueToSlugify }) => slugify(valueToSlugify) || undefined,
    overrides: (row) => {
      const slug = row.fields.find((f): f is TextField => 'name' in f && f.name === 'slug')
      if (slug) {
        slug.validate = (value: unknown) => validateSlug(value, { reserved: opts.reserved })
        // Payload fills the slug after validation, which is too late for a document
        // that is created already published (the API, the import): fill it from the
        // title up front. Only on create, so it never fights the auto-update of a draft.
        slug.hooks = {
          ...slug.hooks,
          beforeValidate: [
            ...(slug.hooks?.beforeValidate || []),
            ({ value, data, operation }) =>
              operation === 'create' && !(typeof value === 'string' && value.trim()) ? slugify(data?.title) || value : value,
          ],
        }
        slug.admin = { ...slug.admin, description: 'The web address: lowercase letters, numbers and hyphens.' }
      }
      return row
    },
  })
