import type { Metadata } from 'next'

import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/lib/pageMeta'
import NotFoundPage from '@/views/NotFoundPage'

export const metadata: Metadata = { title: PAGE_TITLES.notfound, description: PAGE_DESCRIPTIONS.notfound }

export default function NotFound() {
  return <NotFoundPage />
}
