import type { ComponentType } from 'react'

import { getPageData } from '@/lib/data/sitePages'

type Props = {
  pageId: string
  View: ComponentType<{ content: Record<string, string> }>
}

/** Renders one of the fixed marketing pages with its resolved copy. */
export default async function FixedPage({ pageId, View }: Props) {
  const { content } = await getPageData(pageId)
  return <View content={content} />
}
