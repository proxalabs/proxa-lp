import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

// Who changed what, when. Written by hooks only; nobody can edit or delete a row.

type Action = 'create' | 'update' | 'publish' | 'delete'

async function record(req: PayloadRequest, action: Action, target: string, docId: unknown, title: unknown) {
  try {
    const user = req.user as { id: number | string; role?: string } | null
    await req.payload.create({
      collection: 'activity-log',
      data: {
        action,
        target,
        docId: docId == null ? '' : String(docId),
        title: typeof title === 'string' ? title.slice(0, 200) : '',
        user: user?.id as number | undefined,
        role: user?.role || 'system',
      },
      overrideAccess: true,
      req,
    })
  } catch (err) {
    // The log must never block the save it describes.
    req.payload.logger.error({ err }, 'activity log write failed')
  }
}

const titleOf = (doc: Record<string, unknown>) => doc.title ?? doc.name ?? doc.filename ?? doc.email ?? ''

export const logCollectionChange: CollectionAfterChangeHook = async ({ doc, operation, collection, req }) => {
  // Autosaved drafts would flood the log; record creations and published changes.
  const draft = doc._status === 'draft'
  if (operation === 'update' && draft) return doc
  const action: Action = operation === 'create' ? 'create' : doc._status === 'published' ? 'publish' : 'update'
  await record(req, action, collection.slug, doc.id, titleOf(doc))
  return doc
}

export const logCollectionDelete: CollectionAfterDeleteHook = async ({ doc, id, collection, req }) => {
  await record(req, 'delete', collection.slug, id, titleOf(doc || {}))
  return doc
}

export const logGlobalChange: GlobalAfterChangeHook = async ({ doc, global, req }) => {
  await record(req, 'update', global.slug, '', global.label && typeof global.label === 'string' ? global.label : global.slug)
  return doc
}
