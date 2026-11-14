import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

// Who changed what, when. Rows are written by hooks and can never be edited or
// deleted through the admin or the API.
export const ActivityLog: CollectionConfig = {
  slug: 'activity-log',
  labels: { singular: 'Activity', plural: 'Activity log' },
  admin: { group: 'Settings', useAsTitle: 'title', defaultColumns: ['createdAt', 'action', 'target', 'title', 'user'] },
  access: { read: isAdmin, create: () => false, update: () => false, delete: () => false },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: ['create', 'update', 'publish', 'delete'],
    },
    { name: 'target', type: 'text', required: true, label: 'Where' },
    { name: 'docId', type: 'text', label: 'Document ID' },
    { name: 'title', type: 'text' },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'role', type: 'text' },
  ],
}
