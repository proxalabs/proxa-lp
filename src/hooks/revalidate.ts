import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { revalidatePath } from 'next/cache'

// Pages are statically generated. These hooks refresh exactly the pages a change
// touches, so a publish is live (and crawlable) immediately, with no rebuild.

/** Listings that change whenever any content is published or removed. */
export const FEED_PATHS = ['/sitemap.xml', '/llms.txt', '/blog/rss.xml']

/** Every article page (authors, categories and "keep reading" cards appear on all of them). */
export const ALL_ARTICLES = '/(frontend)/blog/[slug]'

type AnyDoc = { id?: number | string; _status?: string | null; deletedAt?: string | null; [key: string]: unknown }

/**
 * revalidatePath that never throws. Scheduled publishing runs from a timer, where
 * Next.js has no request to revalidate from; there the routes' own `revalidate`
 * timer picks the change up within five minutes instead.
 * A path with a [param] is a route pattern (it must include the route group) and
 * refreshes every page that route produces.
 */
export function safeRevalidate(path: string, type?: 'layout' | 'page') {
  try {
    revalidatePath(path, type ?? (path.includes('[') ? 'page' : undefined))
  } catch {
    /* outside a request: the timed revalidation covers it */
  }
}

const refresh = (paths: string[]) => {
  for (const path of new Set(paths)) safeRevalidate(path)
}

/** Visible to the public: published (or a collection without drafts) and not in the trash. */
const isPublic = (doc?: AnyDoc | null) =>
  Boolean(doc) && !doc!.deletedAt && (doc!._status === undefined || doc!._status === 'published')

/**
 * The row the public is reading right now. An editor's unsaved-looking state is
 * a newer DRAFT version stacked on top of it, so the hook's own `doc` and
 * `previousDoc` cannot answer "was this live?" on their own.
 */
async function publicRow(req: PayloadRequest, collection: CollectionConfig, id: number | string): Promise<AnyDoc | null> {
  try {
    const row = (await req.payload.findByID({
      collection: collection.slug as 'posts',
      id,
      draft: false,
      depth: 0,
      overrideAccess: true,
      disableErrors: true,
      ...(collection.trash ? { trash: true } : {}),
      req,
    })) as AnyDoc | null
    return isPublic(row) ? row : null
  } catch {
    return null
  }
}

type Options = {
  /** Also refresh every page: for content that can appear anywhere (images, nav links, embedded forms). */
  layout?: boolean
}

/**
 * Hooks for a collection. `pathsFor(doc)` lists the pages that show the document.
 * Covers publish, edit, unpublish, trash, delete and a changed address. Scripts
 * pass `context.disableRevalidate` because there is no Next.js request to
 * revalidate from.
 */
export function revalidateCollection(
  pathsFor: (doc: AnyDoc) => string[],
  opts: Options = {},
): { beforeChange: CollectionBeforeChangeHook; afterChange: CollectionAfterChangeHook; afterDelete: CollectionAfterDeleteHook } {
  const run = (paths: string[]) => {
    if (!paths.length) return
    if (opts.layout) safeRevalidate('/', 'layout')
    refresh([...paths, ...FEED_PATHS])
  }
  const key = (collection: CollectionConfig, id: unknown) => `${collection.slug}:${id}`

  return {
    // Remember which pages showed the document BEFORE this change.
    beforeChange: async ({ data, operation, originalDoc, collection, req }) => {
      if (req.context.disableRevalidate || operation !== 'update' || originalDoc?.id == null) return data
      const before = await publicRow(req, collection, originalDoc.id)
      const store = (req.context.pathsBefore ||= {}) as Record<string, string[]>
      store[key(collection, originalDoc.id)] = before ? pathsFor(before) : []
      return data
    },

    afterChange: async ({ doc, collection, req }) => {
      if (req.context.disableRevalidate) return doc
      const before = ((req.context.pathsBefore || {}) as Record<string, string[]>)[key(collection, doc.id)] || []
      const live = await publicRow(req, collection, doc.id)
      const after = live ? pathsFor(live) : []
      // Saving a draft on top of a published document changes nothing the public
      // sees; skip it, or autosave would refresh the cache on every keystroke.
      const draftOnly = before.length > 0 && after.length > 0 && !isPublic(doc)
      if (!draftOnly) run([...before, ...after])
      return doc
    },

    afterDelete: ({ doc, req: { context } }) => {
      if (!context.disableRevalidate && doc) run(pathsFor(doc))
      return doc
    },
  }
}

/** afterChange hook for a global. A layout-wide global passes `layout: true`. */
export function revalidateGlobal(paths: string[], opts: Options = {}): GlobalAfterChangeHook {
  return ({ doc, req: { context } }) => {
    if (context.disableRevalidate) return doc
    if (opts.layout) safeRevalidate('/', 'layout')
    refresh(paths)
    return doc
  }
}
