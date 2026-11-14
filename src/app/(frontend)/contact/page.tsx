import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/ContactPage'

export const generateMetadata = () => fixedPageMetadata('contact')

export default function Page() {
  return <FixedPage pageId="contact" View={View} />
}
