import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/ContentPage'

export const generateMetadata = () => fixedPageMetadata('content')

export default function Page() {
  return <FixedPage pageId="content" View={View} />
}
