import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/InnovationCollectivePage'

export const generateMetadata = () => fixedPageMetadata('innovation')

export default function Page() {
  return <FixedPage pageId="innovation" View={View} />
}
