import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/NewsPage'

export const generateMetadata = () => fixedPageMetadata('news')

export default function Page() {
  return <FixedPage pageId="news" View={View} />
}
