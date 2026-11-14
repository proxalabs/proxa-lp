import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/InnovationCollectivePage'

// CMS edits refresh this page at once; the timer is only a backstop.
export const revalidate = 3600

export const generateMetadata = () => fixedPageMetadata('innovation')

export default function Page() {
  return <FixedPage pageId="innovation" View={View} />
}
