import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/ResourcesPage'

export const generateMetadata = () => fixedPageMetadata('resources')

export default function Page() {
  return <FixedPage pageId="resources" View={View} />
}
