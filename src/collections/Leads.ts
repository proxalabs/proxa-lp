import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff } from '../access'

// Every contact, newsletter and event sign-up, stored before the notification
// email is sent, so a lead is never lost if email is down. Written only by the
// server endpoints.
export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: { group: 'Forms', useAsTitle: 'email', defaultColumns: ['type', 'name', 'email', 'company', 'createdAt'] },
  access: { read: isStaff, create: () => false, update: () => false, delete: isAdmin },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Future-Proof lead', value: 'future-proof' },
        { label: 'Newsletter', value: 'newsletter' },
        { label: 'Innovation Collective registration', value: 'event-registration' },
      ],
    },
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'company', type: 'text' },
    { name: 'data', type: 'json', admin: { description: 'Everything the visitor submitted.' } },
  ],
}
