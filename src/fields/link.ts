import type { Field } from 'payload'

import { NAV_DESTINATIONS } from '../content/navConfig.js'

const destinations = (NAV_DESTINATIONS as { page: string; label: string }[]).map((d) => ({ label: d.label, value: d.page }))

/**
 * Where a button or menu item goes: one of the site's own pages, or a landing page
 * built in the CMS. Stored flat on the parent as `<prefix>Page` / `<prefix>BuiltPage`.
 */
export const destinationFields = (prefix: string, label: string): Field[] => [
  {
    name: `${prefix}Page`,
    type: 'select',
    label,
    options: [...destinations, { label: 'A landing page built in the CMS…', value: '_built' }],
  },
  {
    name: `${prefix}BuiltPage`,
    type: 'relationship',
    relationTo: 'pages',
    label: 'Which landing page',
    admin: { condition: (_data, sibling) => sibling?.[`${prefix}Page`] === '_built' },
  },
]
