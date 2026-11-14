import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/AdvisoryPage'

export const generateMetadata = () => fixedPageMetadata('advisory')

export default function Page() {
  return <FixedPage pageId="advisory" View={View} />
}
