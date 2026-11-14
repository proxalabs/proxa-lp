import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/AboutPage'

export const generateMetadata = () => fixedPageMetadata('about')

export default function Page() {
  return <FixedPage pageId="about" View={View} />
}
