import type { CollectionConfig } from 'payload'

import { logCollectionChange, logCollectionDelete } from '../hooks/activityLog'
import { revalidateCollection } from '../hooks/revalidate'

/** Drafts, autosave, scheduled publishing and 30 restorable versions per document. */
export const draftVersions: CollectionConfig['versions'] = {
  drafts: { autosave: { interval: 800 }, schedulePublish: true },
  maxPerDoc: 30,
}

type AnyDoc = { [key: string]: unknown }

/**
 * Revalidate the pages a document appears on, and log the change. `layout: true`
 * also refreshes every page, for content that can appear anywhere on the site.
 */
export const contentHooks = (pathsFor: (doc: AnyDoc) => string[], opts: { layout?: boolean } = {}): CollectionConfig['hooks'] => {
  const revalidate = revalidateCollection(pathsFor, opts)
  return {
    beforeChange: [revalidate.beforeChange],
    afterChange: [revalidate.afterChange, logCollectionChange],
    afterDelete: [revalidate.afterDelete, logCollectionDelete],
  }
}

export const auditHooks: CollectionConfig['hooks'] = {
  afterChange: [logCollectionChange],
  afterDelete: [logCollectionDelete],
}
