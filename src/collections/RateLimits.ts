import type { CollectionConfig } from 'payload'

// Counters behind the form endpoints' rate limit (per IP and global). Server-only.
export const RateLimits: CollectionConfig = {
  slug: 'rate-limits',
  admin: { hidden: true },
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
    { name: 'first', type: 'number', required: true, label: 'Window start (ms)' },
  ],
}
