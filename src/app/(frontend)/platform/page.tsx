import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/PlatformPage'

export const generateMetadata = () => fixedPageMetadata('platform')

export default function Page() {
  return <FixedPage pageId="platform" View={View} />
}
