import type { CollectionConfig } from 'payload'

import { logCollectionChange, logCollectionDelete } from '../hooks/activityLog'
import { revalidateCollection } from '../hooks/revalidate'

/** Drafts, autosave, scheduled publishing and 30 restorable versions per document. */
export const draftVersions: CollectionConfig['versions'] = {
  drafts: { autosave: { interval: 800 }, schedulePublish: true },
  maxPerDoc: 30,
}

type AnyDoc = { [key: string]: unknown }

/** Revalidate the pages a document appears on, and log the change. */
export const contentHooks = (pathsFor: (doc: AnyDoc) => string[]): CollectionConfig['hooks'] => {
  const revalidate = revalidateCollection(pathsFor)
  return {
    afterChange: [revalidate.afterChange, logCollectionChange],
    afterDelete: [revalidate.afterDelete, logCollectionDelete],
  }
}

export const auditHooks: CollectionConfig['hooks'] = {
  afterChange: [logCollectionChange],
  afterDelete: [logCollectionDelete],
}
