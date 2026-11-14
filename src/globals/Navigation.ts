import type { Field, GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access'
import { DEFAULT_MENUS, MENU_LABELS } from '../content/navConfig.js'
import { destinationFields } from '../fields/link'
import { logGlobalChange } from '../hooks/activityLog'
import { revalidateGlobal } from '../hooks/revalidate'

const menu = (name: string): Field => ({
  name,
  type: 'array',
  label: `${(MENU_LABELS as Record<string, string>)[name]} menu`,
  labels: { singular: 'Link', plural: 'Links' },
  admin: {
    description: `Leave empty to use the default: ${(DEFAULT_MENUS as Record<string, { label: string }[]>)[name].map((i) => i.label).join(', ')}.`,
  },
  fields: [{ name: 'label', type: 'text', required: true }, ...destinationFields('link', 'Goes to')],
})

// The three header dropdowns. An empty menu falls back to its in-code default.
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: { group: 'Site' },
  access: { read: anyone, update: isAdmin },
  versions: { max: 30 },
  hooks: { afterChange: [revalidateGlobal([], { layout: true }), logGlobalChange] },
  fields: [menu('platform'), menu('solutions'), menu('resources')],
}
