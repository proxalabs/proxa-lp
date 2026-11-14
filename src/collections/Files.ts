import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { isStaff } from '../access'
import { auditHooks } from './shared'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Files handed out only after a form is submitted. Not publicly readable: a
// visitor gets a short-lived signed link from /api/submit-form instead.
export const Files: CollectionConfig = {
  slug: 'files',
  labels: { singular: 'Gated file', plural: 'Gated files' },
  admin: { group: 'Forms', useAsTitle: 'label', defaultColumns: ['label', 'filename', 'updatedAt'] },
  access: { read: isStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: auditHooks,
  fields: [{ name: 'label', type: 'text', required: true, admin: { description: 'A name for this file, shown in the admin.' } }],
  upload: {
    staticDir: path.resolve(dirname, '../../files'),
  },
}
