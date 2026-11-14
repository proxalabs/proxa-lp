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
    // Plain text: the endpoints validate the address, and a second, stricter
    // check here would turn an unusual but valid one into a server error.
    { name: 'email', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'data', type: 'json', admin: { description: 'Everything the visitor submitted.' } },
  ],
}
