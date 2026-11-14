import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isStaff } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
  },
  auth: {
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    admin: isStaff,
    read: isStaff,
    create: isAdmin,
    update: ({ req: { user }, id }) => (user as { role?: string } | null)?.role === 'admin' || user?.id === id,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin — everything', value: 'admin' },
        { label: 'Editor — content only', value: 'editor' },
      ],
      // Only an admin can change a role, so an editor cannot promote themselves.
      access: { update: isAdminField },
    },
  ],
  hooks: {
    beforeChange: [
      // The very first account is always an admin, otherwise nobody could manage users.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
}
