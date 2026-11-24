import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access'
import { ALL_ARTICLES } from '../hooks/revalidate'
import { contentHooks } from './shared'

// Blog categories. A post in the "News" category is also listed on /news.
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { group: 'Content', useAsTitle: 'title' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: contentHooks(() => ['/blog', '/news', ALL_ARTICLES]),
  fields: [{ name: 'title', type: 'text', required: true, unique: true }],
}
