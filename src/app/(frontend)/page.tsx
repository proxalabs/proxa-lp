import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/HomePage'

export const generateMetadata = () => fixedPageMetadata('home')

export default function Page() {
  return <FixedPage pageId="home" View={View} />
}
