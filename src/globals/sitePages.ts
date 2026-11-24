import type { Field, GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access'
import { MANIFEST } from '../content/manifest.js'
import { logGlobalChange } from '../hooks/activityLog'
import { revalidateGlobal } from '../hooks/revalidate'
import { fieldName } from '../lib/pageContent.js'
import { previewPath } from '../lib/preview'
import { PAGE_PATHS } from '../lib/routes.js'

type ManifestField = { key: string; label: string; type: 'text' | 'textarea' | 'image'; default: string }
type ManifestPage = { label: string; fields: ManifestField[] }

/** Global slug for a fixed page's editable copy: "home" → "page-home". */
export const pageGlobalSlug = (pageId: string) => `page-${pageId}`

const titleCase = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

// One field per manifest key. Empty means "use the copy written in the code", and
// that copy is shown as the placeholder so an editor can see what is live.
function copyField(f: ManifestField): Field {
  const name = fieldName(f.key)
  if (f.type === 'image') return { name, type: 'upload', relationTo: 'media', label: f.label }
  const admin = { placeholder: f.default }
  return f.type === 'textarea'
    ? { name, type: 'textarea', label: f.label, admin }
    : { name, type: 'text', label: f.label, admin }
}

// Group fields by the first part of their key ("hero.eyebrow" → Hero) so a long
// page reads as collapsible sections.
function grouped(fields: ManifestField[]): Field[] {
  const groups = new Map<string, ManifestField[]>()
  for (const f of fields) {
    const section = f.key.split('.')[0]
    groups.set(section, [...(groups.get(section) || []), f])
  }
  return [...groups.entries()].map(([section, items]) => ({
    type: 'collapsible' as const,
    label: titleCase(section),
    admin: { initCollapsed: true },
    fields: items.map(copyField),
  }))
}

function pageGlobal(pageId: string, page: ManifestPage): GlobalConfig {
  const path = (PAGE_PATHS as Record<string, string>)[pageId] || '/'
  return {
    slug: pageGlobalSlug(pageId),
    label: page.label,
    admin: {
      group: 'Site pages',
      description: 'Leave a field empty to use the built-in copy shown in grey.',
      livePreview: { url: () => previewPath(path) },
      preview: () => previewPath(path),
    },
    access: { read: anyone, update: isAdmin },
    versions: { max: 30 },
    hooks: { afterChange: [revalidateGlobal([path, '/sitemap.xml']), logGlobalChange] },
    fields: [
      {
        type: 'tabs',
        tabs: [
          { label: 'Copy', fields: grouped(page.fields) },
          {
            name: 'seo',
            label: 'SEO',
            fields: [
              { name: 'title', type: 'text', label: 'Search title', admin: { description: 'Leave empty to use the default.' } },
              { name: 'description', type: 'textarea', label: 'Search description' },
              { name: 'image', type: 'upload', relationTo: 'media', label: 'Social share image' },
              { name: 'noindex', type: 'checkbox', label: 'Hide from search engines', defaultValue: false },
            ],
          },
        ],
      },
    ],
  }
}

/** A global for each fixed marketing page, generated from the content manifest. */
export const sitePageGlobals: GlobalConfig[] = Object.entries(MANIFEST as Record<string, ManifestPage>).map(
  ([pageId, page]) => pageGlobal(pageId, page),
)
