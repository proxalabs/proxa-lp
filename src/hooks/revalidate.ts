import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import { revalidatePath } from 'next/cache'

// Pages are statically generated. These hooks refresh exactly the pages a change
// touches, so a publish is live (and crawlable) immediately, with no rebuild.

/** Listings that change whenever any content is published or removed. */
export const FEED_PATHS = ['/sitemap.xml', '/llms.txt', '/blog/rss.xml']

type AnyDoc = { _status?: string | null; [key: string]: unknown }

/**
 * revalidatePath that never throws. Scheduled publishing runs from a timer, where
 * Next.js has no request to revalidate from; there the routes' own `revalidate`
 * timer picks the change up within five minutes instead.
 */
export function safeRevalidate(path: string, type?: 'layout' | 'page') {
  try {
    revalidatePath(path, type)
  } catch {
    /* outside a request: the timed revalidation covers it */
  }
}

const refresh = (paths: string[]) => {
  for (const path of new Set(paths)) safeRevalidate(path)
}

/**
 * afterChange/afterDelete hooks for a collection. `pathsFor(doc)` lists the pages
 * that show the document. Scripts pass `context.disableRevalidate` because there is
 * no Next.js request to revalidate from.
 */
export function revalidateCollection(pathsFor: (doc: AnyDoc) => string[]): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  return {
    afterChange: ({ doc, previousDoc, req: { context } }) => {
      if (context.disableRevalidate) return doc
      const isLive = (d?: AnyDoc) => Boolean(d) && (d!._status === undefined || d!._status === 'published')
      const paths: string[] = []
      if (isLive(doc)) paths.push(...pathsFor(doc))
      // Unpublished, or its address changed: the old page must go too.
      if (isLive(previousDoc)) paths.push(...pathsFor(previousDoc))
      if (paths.length) refresh([...paths, ...FEED_PATHS])
      return doc
    },
    afterDelete: ({ doc, req: { context } }) => {
      if (context.disableRevalidate) return doc
      refresh([...pathsFor(doc), ...FEED_PATHS])
      return doc
    },
  }
}

/** afterChange hook for a global. A layout-wide global passes `layout: true`. */
export function revalidateGlobal(paths: string[], opts: { layout?: boolean } = {}): GlobalAfterChangeHook {
  return ({ doc, req: { context } }) => {
    if (context.disableRevalidate) return doc
    if (opts.layout) safeRevalidate('/', 'layout')
    refresh(paths)
    return doc
  }
}
